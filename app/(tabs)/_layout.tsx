import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppColours } from '@/constants/theme';

function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    header:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 16 },
    headerLogo:  { width: 32, height: 32 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: c.primary },
    headerRight: { marginRight: 16 },
  });
}

export default function TabsLayout() {
  const { colours } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: colours.subtext,
        tabBarStyle: {
          backgroundColor: colours.card,
          borderTopColor: colours.border,
        },
        headerStyle: {
          backgroundColor: colours.card,
          borderBottomColor: colours.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
        headerLeft: () => (
          <View style={styles.header}>
            <Image source={require('@/assets/images/icon.png')} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>HabitFlow</Text>
          </View>
        ),
        headerTitle: () => null,
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Ionicons name="person-circle-outline" size={28} color={colours.primary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Targets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
