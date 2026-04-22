//This imports all the components and contexts needed for the settings screen
import { AppColours } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { categories, habitLogs, habits as habitsTable, targets, users } from '@/db/schema';
import { forceSeed } from '@/db/seed';
import { useHabits } from '@/hooks/useHabits';
import { useLogs } from '@/hooks/useLogs';
import { buildCsv } from '@/utils/csvHelpers';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: c.background },
    content:          { padding: 16, paddingBottom: 48 },

    avatar:           { width: 80, height: 80, borderRadius: 40, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 16, marginBottom: 8 },
    avatarText:       { fontSize: 30, fontWeight: '700', fontFamily: 'Sora_700Bold', color: '#fff' },
    username:         { fontSize: 20, fontWeight: '700', fontFamily: 'Sora_700Bold', color: c.text, textAlign: 'center', marginBottom: 28 },

    sectionLabel:     { fontSize: 11, fontWeight: '700', fontFamily: 'Sora_600SemiBold', color: c.subtext, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 24 },

    card:             { backgroundColor: c.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.border },
    row:              { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    rowLabel:         { flex: 1, fontSize: 15, fontWeight: '500', fontFamily: 'Sora_400Regular', color: c.text },

    toggle:           { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    toggleBtn:        { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: c.card },
    toggleActive:     { backgroundColor: c.primary },
    toggleText:       { fontSize: 14, fontWeight: '500', fontFamily: 'Sora_400Regular', color: c.text },
    toggleTextActive: { color: '#fff' },

    actionBtn:        { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: c.primaryLight },
    actionBtnText:    { fontSize: 13, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.primary },
    confirmText:      { fontSize: 13, color: c.primary, textAlign: 'center', paddingBottom: 12, fontFamily: 'Sora_400Regular' },

    dangerBtn:        { margin: 16, marginTop: 0, backgroundColor: c.dangerLight, borderRadius: 14, padding: 16, alignItems: 'center' },
    dangerBtnText:    { fontSize: 15, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.danger },
    timeRow:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
    timeInput:        { width: 52, height: 40, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.background, textAlign: 'center', fontSize: 16, fontFamily: 'Sora_400Regular', color: c.text },
    timeSep:          { fontSize: 18, fontWeight: '700', color: c.subtext },
    logoutBtn:        { margin: 16, marginBottom: 8, backgroundColor: c.primaryLight, borderRadius: 14, padding: 16, alignItems: 'center' },
    logoutBtnText:    { fontSize: 15, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.primary },
  });
}

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme, colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);
  const { habits } = useHabits();
  const { logs } = useLogs();

  const [reminderHour, setReminderHour]     = useState('08');
  const [reminderMinute, setReminderMinute] = useState('00');
  const [reminderConfirm, setReminderConfirm] = useState<string | null>(null);

  const initials = (user?.username ?? '?').charAt(0).toUpperCase();

  //This loads any previously saved reminder time from storage when the screen mounts
  useEffect(() => {
    AsyncStorage.getItem('reminderTime').then(saved => {
      if (saved) {
        const [h, m] = saved.split(':');
        setReminderHour(h);
        setReminderMinute(m);
        setReminderConfirm(saved);
      }
    });
  }, []);

  //This requests notification permission, cancels any existing reminders, and schedules a new daily one
  async function handleSetReminder() {
    const hour   = Math.min(23, Math.max(0, parseInt(reminderHour,   10) || 0));
    const minute = Math.min(59, Math.max(0, parseInt(reminderMinute, 10) || 0));
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable notifications in your device settings.');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'HabitFlow Reminder',
        body: "Don't forget to log your habits today!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    const timeStr = `${hh}:${mm}`;
    await AsyncStorage.setItem('reminderTime', timeStr);
    setReminderHour(hh);
    setReminderMinute(mm);
    setReminderConfirm(timeStr);
  }

  //This builds a CSV from the user's logs and shares it through the device share sheet
  async function handleExport() {
    const habitMap = Object.fromEntries(habits.map(h => [h.id, h.name]));
    const csv = buildCsv(logs, habitMap);
    const uri = FileSystem.documentDirectory + 'habitflow-export.csv';
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: 'utf8' });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export Habit Data' });
    } else {
      Alert.alert('Exported', `File saved to:\n${uri}`);
    }
  }

  //This re runs the seed script and alerts with the demo credentials
  async function handleForceSeed() {
    await forceSeed();
    Alert.alert('Seed complete!', 'Log in with username: Demo, password: demo123');
  }

  function handleLogout() {
    setUser(null);
    router.replace('/(auth)/login');
  }

  //This asks for confirmation then deletes all of the user's data before logging them out
  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              await db.delete(targets).where(eq(targets.userId, user.id));
              await db.delete(habitLogs).where(eq(habitLogs.userId, user.id));
              await db.delete(habitsTable).where(eq(habitsTable.userId, user.id));
              await db.delete(categories).where(eq(categories.userId, user.id));
              await db.delete(users).where(eq(users.id, user.id));
            }
            setUser(null);
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/*This shows an avatar circle with the user's initial and their username below*/}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.username}>{user?.username}</Text>

      {/*This is the light and dark mode toggle*/}
      <Text style={styles.sectionLabel}>Theme</Text>
      <View style={styles.card}>
        <View style={[styles.row, { paddingBottom: 12 }]}>
          <Ionicons name="contrast-outline" size={20} color={colours.subtext} />
          <View style={[styles.toggle, { flex: 1 }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isDark && styles.toggleActive]}
              onPress={() => isDark && toggleTheme()}
              activeOpacity={!isDark ? 1 : 0.7}
              accessibilityRole="button"
              accessibilityLabel="Light mode"
              accessibilityState={{ selected: !isDark }}
            >
              <Text style={[styles.toggleText, !isDark && styles.toggleTextActive]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isDark && styles.toggleActive]}
              onPress={() => !isDark && toggleTheme()}
              activeOpacity={isDark ? 1 : 0.7}
              accessibilityRole="button"
              accessibilityLabel="Dark mode"
              accessibilityState={{ selected: isDark }}
            >
              <Text style={[styles.toggleText, isDark && styles.toggleTextActive]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/*This is the daily reminder time picker that saves the time and schedules a local notification*/}
      <Text style={styles.sectionLabel}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color={colours.subtext} />
          <Text style={styles.rowLabel}>Daily Reminder</Text>
        </View>
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            value={reminderHour}
            onChangeText={setReminderHour}
            keyboardType="number-pad"
            maxLength={2}
            accessibilityLabel="Hour"
            placeholder="HH"
            placeholderTextColor={colours.subtext}
          />
          <Text style={styles.timeSep}>:</Text>
          <TextInput
            style={styles.timeInput}
            value={reminderMinute}
            onChangeText={setReminderMinute}
            keyboardType="number-pad"
            maxLength={2}
            accessibilityLabel="Minute"
            placeholder="MM"
            placeholderTextColor={colours.subtext}
          />
          <TouchableOpacity
            style={[styles.actionBtn, { marginLeft: 'auto' }]}
            onPress={handleSetReminder}
            accessibilityRole="button"
            accessibilityLabel="Set daily reminder"
          >
            <Text style={styles.actionBtnText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
        {reminderConfirm && (
          <Text style={styles.confirmText}>Reminder set for {reminderConfirm} every day</Text>
        )}
      </View>

      {/*This links to the categories management screen*/}
      <Text style={styles.sectionLabel}>App</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/categories')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
        >
          <Ionicons name="pricetag-outline" size={20} color={colours.subtext} />
          <Text style={styles.rowLabel}>Manage Categories</Text>
          <Ionicons name="chevron-forward" size={18} color={colours.subtext} />
        </TouchableOpacity>
      </View>

      {/*This exports all habit logs as a CSV file*/}
      <Text style={styles.sectionLabel}>Data</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="download-outline" size={20} color={colours.subtext} />
          <Text style={styles.rowLabel}>Export CSV</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleExport}
            accessibilityRole="button"
            accessibilityLabel="Export data as CSV"
          >
            <Text style={styles.actionBtnText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*This manually re runs the seed script to populate demo data*/}
      <Text style={styles.sectionLabel}>Developer</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="code-slash-outline" size={20} color={colours.subtext} />
          <Text style={styles.rowLabel}>Run Seed Script</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleForceSeed}
            accessibilityRole="button"
            accessibilityLabel="Run seed script"
          >
            <Text style={styles.actionBtnText}>Run Seed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*This is the log out and delete account buttons*/}
      <Text style={styles.sectionLabel}>Account</Text>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dangerBtn}
        onPress={handleDeleteAccount}
        accessibilityRole="button"
        accessibilityLabel="Delete account"
      >
        <Text style={styles.dangerBtnText}>Delete Account</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}