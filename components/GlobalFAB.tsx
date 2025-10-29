// components/GlobalFAB.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../lib/hooks/useAuth';

const GlobalFAB = () => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const isDriver = currentUser?.role === 'driver';

  const actions = [
    {
      label: isDriver ? 'Post Ride' : 'Request Ride',
      icon: isDriver ? 'car-outline' : 'navigate-outline',
      color: isDriver ? '#2563eb' : '#16a34a',
      route: isDriver ? '/(tabs)/rides/create' : '/(tabs)/rides/request',
    },
    {
      label: 'Dashboard',
      icon: 'home-outline',
      color: '#0ea5e9',
      route: '/(tabs)/rides',
    },
    {
      label: 'Upcoming Rides',
      icon: 'time-outline',
      color: '#f59e42',
      route: '/(tabs)/rides/upcoming',
    },
    {
      label: 'Ride History',
      icon: 'calendar-outline',
      color: '#6b7280',
      route: '/rides/history',
    },
    {
      label: 'Your Profile',
      icon: 'person-outline',
      color: '#7c3aed',
      route: '/(tabs)/profile',
    },
  ];

  // Filter out the current screen’s route
  const normalize = (path: string) => path.replace('/(tabs)', '');
  const filteredActions = actions.filter(
  (action) => normalize(action.route) !== normalize(pathname)
);
  // Log the current path for debugging
  console.log('Current Path:', pathname);

  if (!currentUser) return null; // Don't render if user is not authenticated

  return (
    <View style={styles.container}>
      {expanded && filteredActions.map((action, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 100)}
          exiting={FadeOut}
          style={{ marginBottom: 12 }}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => {
              setExpanded(false);
              router.push(action.route as any);
            }}
          >
            <Ionicons name={action.icon as any} size={20} color="white" />
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Ionicons name={expanded ? 'close' : 'menu'} size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  fab: {
    backgroundColor: '#111827',
    borderRadius: 100,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 14,
  },
});


export default GlobalFAB;
