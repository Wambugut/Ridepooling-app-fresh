// app/(tabs)/rides/history.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebase-config';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  status?: string;
  driverId?: string;
  passengers?: string[];
  ratings?: { [userId: string]: number };
}

export default function RideHistoryScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const user = getAuth().currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const userRef = collection(firestore, 'users');
        const userSnap = await getDocs(query(userRef, where('uid', '==', user.uid)));
        const userData = userSnap.docs[0]?.data();
        const userRole = userData?.role;

        let q;
        if (userRole === 'driver') {
          q = query(collection(firestore, 'rides'), where('driverId', '==', user.uid));
        } else {
          q = query(collection(firestore, 'rides'), where('passengers', 'array-contains', user.uid));
        }

        const querySnapshot = await getDocs(q);
        let results: Ride[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ride[];

        if (statusFilter) {
          results = results.filter(ride => ride.status?.toLowerCase() === statusFilter.toLowerCase());
        }
        if (dateFilter) {
          results = results.filter(ride => ride.date === dateFilter);
        }

        setRides(results);
      } catch (error) {
        console.error('Failed to fetch ride history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, statusFilter, dateFilter]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'cancelled':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#854d0e' };
      default:
        return { backgroundColor: '#e5e7eb', color: '#4b5563' };
    }
  };

  const renderStatusBadge = (status?: string) => {
    const colors = getStatusColor(status);
    const icon =
      status === 'completed'
        ? 'check-circle'
        : status === 'cancelled'
        ? 'cancel'
        : status === 'pending'
        ? 'hourglass-empty'
        : 'help-outline';

    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.backgroundColor }]}>
        <MaterialIcons name={icon} size={16} color={colors.color} style={styles.statusIcon} />
        <Text style={[styles.statusText, { color: colors.color }]}>{status || 'Unknown'}</Text>
      </View>
    );
  };

  const renderAverageRating = (ride: Ride) => {
    if (!ride.ratings || Object.keys(ride.ratings).length === 0) return null;
    const ratings = Object.values(ride.ratings);
    const average = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    return (
      <Text style={styles.ratingText}>
        ⭐ {average} from {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
      </Text>
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
      <Text style={styles.header}>
        {rides.length > 0 && rides[0]?.driverId === user?.uid ? 'Offered Rides' : 'Joined Trips'}
      </Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            const statuses = ['completed', 'cancelled', 'pending', ''];
            const currentIndex = statuses.indexOf(statusFilter);
            const nextIndex = (currentIndex + 1) % statuses.length;
            setStatusFilter(statuses[nextIndex]);
          }}
        >
          <Text style={styles.filterButtonText}>
            {statusFilter ? statusFilter : 'Filter Status'}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="YYYY-MM-DD"
          value={dateFilter}
          onChangeText={setDateFilter}
          style={styles.dateInput}
          placeholderTextColor="#e0f2fe"
        />
      </View>

      {rides.length === 0 ? (
        <Text style={styles.emptyText}>No matching rides found.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/rides/${item.id}`)}
              style={styles.rideCard}
            >
              <Text style={styles.rideTitle}>
                {item.origin} → {item.destination}
              </Text>
              <Text style={styles.rideDateTime}>
                📅 {item.date}  ⏰ {item.time}
              </Text>
              {renderStatusBadge(item.status)}
              <Text style={styles.passengerText}>
                👥 Passengers: {item.passengers?.length || 0}
              </Text>
              {user?.uid === item.driverId && renderAverageRating(item)}
            </TouchableOpacity>
          )}
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
    textAlign: 'center',
    color: '#fff',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 20,
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
  },
  rideDateTime: {
    color: '#e0f2fe',
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  passengerText: {
    color: '#e0f2fe',
    fontSize: 12,
    marginTop: 8,
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 4,
  },
  homeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '600',
  },
});