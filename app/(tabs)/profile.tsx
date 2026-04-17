import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { AppColours } from '@/constants/theme';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  function handleLogout() {
    setUser(null);
    router.replace('/(auth)/login');
  }

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
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <PrimaryButton title="Log Out" onPress={handleLogout} variant="edit" />
      <PrimaryButton title="Delete Account" onPress={handleDeleteAccount} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColours.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColours.text,
    marginBottom: 24,
  },
  card: {
    backgroundColor: AppColours.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: AppColours.border,
  },
  label: {
    fontSize: 13,
    color: AppColours.subtext,
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColours.text,
  },
});
