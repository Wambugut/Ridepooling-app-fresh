// app/(tabs)/rides/[id].tsx
import { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, firestore } from '../../../firebase-config';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

interface Ride {
  destination: string;
  origin: string;
  date: string;
  time: string;
  seats?: number;
  passengers: string[];
  driverId: string;
  status?: string;
  [key: string]: any;
}

export default function RideDetails() {
  const { id } = useLocalSearchParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'driver' | 'passenger' | null>(null);

  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (!id || !user) return;

    const rideRef = doc(firestore, 'rides', id as string);
    const unsubRide = onSnapshot(rideRef, (snapshot) => {
      const data = snapshot.data() as Ride;
      setRide(data);
      if (data?.passengers?.includes(user.uid)) setJoined(true);
      setLoading(false);
    });

    const userRef = doc(firestore, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (snapshot) => {
      const userData = snapshot.data();
      if (userData?.joinedRide && userData.joinedRide !== id) {
        setJoined(true);
      }
      setUserRole(userData?.role);
    });

    return () => {
      unsubRide();
      unsubUser();
    };
  }, [id, user]);

  const handleJoinRide = async () => {
    if (!ride || joined || !user) return;

    if ((ride.seats ?? 0) <= ride.passengers.length || 0) {
      Alert.alert('Ride full', 'No seats left');
      return;
    }
    try {
      await updateDoc(doc(firestore, 'rides', id as string), {
        passengers: arrayUnion(user.uid),
      });
      await updateDoc(doc(firestore, 'users', user.uid), {
        joinedRide: id,
      });
      setJoined(true);
      Alert.alert('Success', 'You have joined the ride');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not join ride');
    }
  };

  const updateRideStatus = async (newStatus: 'completed' | 'cancelled') => {
    if (!ride || !id) return;

    try {
      await updateDoc(doc(firestore, 'rides', id as string), {
        status: newStatus,
      });
      Alert.alert('Ride Updated', `Marked as ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      Alert.alert('Error', 'Could not update ride status');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (!ride) {
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.container}>
        <Text style={styles.notFoundText}>No ride found</Text>
      </LinearGradient>
    );
  }

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return styles.statusUpcoming;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return {};
    }
  };

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{ride.destination}</Text>

        {ride.status && (
          <Text style={[styles.status, getStatusStyle(ride.status)]}>
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </Text>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Origin:</Text> {ride.origin}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Date:</Text> {ride.date}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Time:</Text> {ride.time}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Available Seats:</Text> {(ride.seats ?? 0) - (ride.passengers?.length || 0)}
          </Text>
        </View>

        {userRole === 'passenger' && !joined && (
          <TouchableOpacity
            onPress={handleJoinRide}
            style={styles.joinButton}
          >
            <Text style={styles.buttonText}>Join Ride</Text>
          </TouchableOpacity>
        )}

        {joined && (
          <Text style={styles.joinedText}>✅ You are in this ride</Text>
        )}

        {userRole === 'driver' && user?.uid === ride.driverId && (
          <View style={styles.driverActions}>
            <Text style={styles.driverText}>👤 You are the driver</Text>

            {ride.status !== 'completed' && (
              <TouchableOpacity
                onPress={() => updateRideStatus('completed')}
                style={styles.completeButton}
              >
                <Text style={styles.whiteButtonText}>Mark as Completed</Text>
              </TouchableOpacity>
            )}

            {ride.status !== 'cancelled' && (
              <TouchableOpacity
                onPress={() => updateRideStatus('cancelled')}
                style={styles.cancelButton}
              >
                <Text style={styles.whiteButtonText}>Cancel Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
  },
  notFoundText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 8,
  },
  status: {
    alignSelf: 'center',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusUpcoming: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusCompleted: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#fff',
  },
  joinButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  whiteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  joinedText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  driverActions: {
    marginTop: 16,
    gap: 12,
  },
  driverText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    padding: 12,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
  },
});