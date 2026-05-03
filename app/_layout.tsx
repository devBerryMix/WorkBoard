import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

function RootNavigation() {
  const { user } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
