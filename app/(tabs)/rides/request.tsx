import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  DocumentData,
} from 'firebase/firestore';
import { firestore } from '../../../firebase-config';
import { useRouter } from 'expo-router';
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

export default function RequestRideScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;

  const router = useRouter();

  // 🔄 Real-time listeners
  useEffect(() => {
    if (!user) return;

    const userRef = doc(firestore, 'users', user.uid);
    const ridesRef = collection(firestore, 'rides');

    const unsubscribeUser = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      setCurrentRideId(data?.rideId || null);
    });

    const unsubscribeRides = onSnapshot(ridesRef, (snap) => {
      const allRides = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ride[];

      const filteredRides = allRides.filter((ride) => {
        const seatsTaken = ride.passengers?.length || 0;
        const isFull = seatsTaken >= ride.seats;

        return (
          ride.status === 'upcoming' &&
          !ride.passengers?.includes(user.uid) &&
          !isFull
        );
      });

      setRides(filteredRides);
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeRides();
    };
  }, [user]);

  // ✋ Join logic
  const handleJoinRide = async (rideId: string, ride: Ride) => {
    if (!user) return;

    if (currentRideId) {
      Alert.alert(
        'Already Joined',
        'You have already joined a ride. Leave it before joining another.'
      );
      return;
    }

    const isFull = (ride.passengers?.length || 0) >= ride.seats;
    if (isFull) {
      Alert.alert('Ride Full', 'Sorry, this ride is already full.');
      return;
    }

    try {
      await updateDoc(doc(firestore, 'rides', rideId), {
        passengers: [...(ride.passengers || []), user.uid],
      });

      await updateDoc(doc(firestore, 'users', user.uid), {
        rideId,
      });

      Alert.alert('Success', 'You have joined the ride!');
    } catch (err) {
      console.error('Error joining ride:', err);
      Alert.alert('Error', 'Failed to join ride.');
    }
  };

  const renderRideItem = ({ item }: { item: Ride }) => {
    const seatsTaken = item.passengers?.length || 0;
    const isFull = seatsTaken >= item.seats;
    const disabled = currentRideId !== null || isFull;

    return (
      <View style={styles.rideCard}>
        <Text style={styles.rideTitle}>{item.destination}</Text>
        <Text style={styles.rideDetails}>Date: {item.date} • Time: {item.time}</Text>
        <Text style={styles.rideDetails}>
          Seats: {seatsTaken}/{item.seats}
        </Text>

        <TouchableOpacity
          disabled={disabled}
          onPress={() => handleJoinRide(item.id, item)}
          style={[
            styles.joinButton,
            disabled && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>
            {currentRideId
              ? 'Already in a Ride'
              : isFull
              ? 'Ride Full'
              : 'Join Ride'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.container}>
      <Text style={styles.header}>Available Rides</Text>

      {currentRideId ? (
        <Text style={styles.note}>You’ve already joined a ride.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No upcoming rides available.</Text>
          }
        />
      )}
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
    color: '#fff',
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },
  rideCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rideDetails: {
    color: '#e0f2fe',
    marginTop: 4,
  },
  joinButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 24,
  },
});
