// app/(tabs)/rides/index.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, onSnapshot, query, where, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../../firebase-config';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useRouter } from 'expo-router';
import UniversalMap from '../../../components/UniversalMap';
import dayjs from 'dayjs';
import RideCard from '../../../components/RideCard';

interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  pickup: string;
  destination: string;
  time: string;
  date: string;
  availableSeats: number;
  passengers: string[];
}

export default function DashboardScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [myRide, setMyRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const role = currentUser.role;
    const uid = currentUser.uid;

    const q = query(
      collection(firestore, 'rides'),
      where(role === 'driver' ? 'driverId' : 'passengers', 'array-contains', uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const rides: Ride[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Ride, 'id'>),
      }));

      const futureRides = rides.filter((ride) =>
        dayjs(`${ride.date} ${ride.time}`).isAfter(dayjs())
      );
      const sorted = futureRides.sort((a, b) =>
        dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`))
      );
      setMyRide(sorted[0] || null);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleJoinRide = async (rideId: string) => {
    if (!currentUser) return;
    const rideRef = doc(firestore, 'rides', rideId);
    await updateDoc(rideRef, {
      passengers: arrayUnion(currentUser.uid),
      availableSeats: (myRide?.availableSeats || 1) - 1,
    });
  };

  const handleCancelRide = async (rideId: string) => {
    if (!currentUser) return;
    const rideRef = doc(firestore, 'rides', rideId);
    await updateDoc(rideRef, {
      passengers: arrayRemove(currentUser.uid),
      availableSeats: (myRide?.availableSeats || 0) + 1,
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#2563eb", "#38bdf8", "#f8fafc"]}
        style={styles.gradient}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#2563eb", "#38bdf8", "#f8fafc"]}
      style={styles.gradient}
    >
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>TUK Ridepool</Text>
        <View style={styles.navBarBottom}>
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={() => router.push('/rides/upcoming')}>
              <Text style={styles.navButtonText}>Rides</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Text style={styles.navButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.slogan}>Ride Smart, Save More.</Text>
        </View>
      </View>
      {/* Top Section */}
      <View style={styles.topSection}>
        {myRide ? (
          <RideCard
            ride={myRide}
            onJoin={() => handleJoinRide(myRide.id)}
            onCancel={() => handleCancelRide(myRide.id)}
          />
        ) : (
          <Text style={styles.noRideText}>
            No upcoming ride found.
          </Text>
        )}
      </View>
      {/* Map Section */}
      <View style={styles.mapSection}>
        <UniversalMap />
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  navBar: {
    width: '100%',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(37,99,235,0.85)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#2563eb',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  navBarBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 16,
  },
  slogan: {
    fontSize: 18,
    color: '#e0f2fe',
    fontStyle: 'italic',
  },
  topSection: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(37,99,235,0.85)',
  },
  noRideText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  mapSection: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});