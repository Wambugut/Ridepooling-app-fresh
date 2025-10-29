import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { currentUser, loading } = useAuth();

  // While loading user auth state
  if (loading) {
    return (
      <View style={styles.splash}>

        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If the user is not logged in, redirect to the login screen.
  // Otherwise, redirect to the rides screen.
  if (!currentUser) {
    return <Redirect href="/screens/Auth/Login" />;
  }

  return <Redirect href="/rides" />;
}
const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

});
