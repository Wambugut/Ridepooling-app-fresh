import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

const InitialLayout = () => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading || !navigationState?.key) return;

    if (currentUser) {
      // If the user is signed in, redirect them to the home screen
      router.replace('/(tabs)');
    } else {
      // If the user is not signed in, redirect them to the login screen
      router.replace('/screens/Auth/Login');
    }
  }, [currentUser, loading, navigationState, router]);

  if (loading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/Auth/Login" options={{ headerShown: false }} />
      <Stack.Screen name="screens/Auth/Signup" options={{ headerShown: false }} />
      <Stack.Screen name="screens/Auth/ResetPassword" options={{ headerShown: false }} />
    </Stack>
  );
};

export default InitialLayout;
