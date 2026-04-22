//This checks whether the user is logged in and redirects them to the right screen
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user } = useAuth();

  //This sends authenticated users to the main tabs
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  //This sends unauthenticated users to the login screen
  return <Redirect href="/(auth)/login" />;
}