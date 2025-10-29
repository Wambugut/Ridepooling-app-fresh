// app/(tabs)/rides/upcoming.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../../firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Ride {
  id: string;
  destination: string;
  date: string;
  time: string;
  seats: number;
  passengers: string[];
  driverId?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function UpcomingRidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    const unsubscribeUser = onSnapshot(userDocRef, (userSnapshot) => {
      const role = userSnapshot.data()?.role;
      setUserRole(role);

      if (!role) {
        setRides([]);
        setLoading(false);
        return;
      }

      const ridesRef = collection(firestore, 'rides');
      const ridesQuery = query(
        ridesRef,
        role === 'driver'
          ? where('driverId', '==', user.uid)
          : where('passengers', 'array-contains', user.uid),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );

      const unsubscribeRides = onSnapshot(ridesQuery, (ridesSnapshot) => {
        const data = ridesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Ride[];
        setRides(data);
        setLoading(false);
      });

      return () => unsubscribeRides();
    });

    return () => unsubscribeUser();
  }, [user]);

  if (loading) {
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (rides.length === 0) {
    const isDriver = userRole === 'driver';
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.emptyContainer}>
        <Text style={styles.bigEmoji}>🚌</Text>
        <Text style={styles.emptyText}>
          {isDriver
            ? "You haven’t posted any upcoming rides yet."
            : "You haven’t joined any upcoming rides yet."}
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push(isDriver ? '/rides/create' : '/rides/request')}
        >
          <Ionicons
            name={isDriver ? 'car-outline' : 'navigate-outline'}
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaButtonText}>
            {isDriver ? 'Post a Ride' : 'Request a Ride'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.container}>
      <Text style={styles.header}>Upcoming Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const remainingSeats = item.seats - (item.passengers?.length || 0);
          return (
            <Animated.View entering={FadeInUp.delay(index * 100)}>
              <TouchableOpacity
                onPress={() => router.push(`/rides/${item.id}`)}
                style={styles.rideCard}
              >
                <Text style={styles.rideTitle}>📍 {item.destination}</Text>
                <Text style={styles.rideDetails}>📅 {item.date}  🕒 {item.time}</Text>
                <Text style={styles.rideDetails}>🪑 {remainingSeats} seat(s) left</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 16,
  },
  rideCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rideTitle: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  rideDetails: {
    color: '#e0f2fe',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bigEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
