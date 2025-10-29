import React from 'react';
import { View, Text, StyleSheet, Pressable, Button } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../lib/hooks/useAuth'; // adjust path if needed

export interface Ride {
  id: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  availableSeats: number;
  driverId: string;
  passengers: string[];
}

interface RideCardProps {
  ride: Ride;
  onJoin?: (rideId: string) => void;
  onCancel?: (rideId: string) => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onJoin, onCancel }) => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const isPassenger = currentUser?.role === 'student';
  const hasJoined = ride.passengers.includes(uid ?? '');

  const handleJoin = () => {
    if (onJoin) onJoin(ride.id);
  };

  const handleCancel = () => {
    if (onCancel) onCancel(ride.id);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Upcoming Ride</Text>

      <View style={styles.row}>
        <MaterialIcons name="location-on" size={20} color="#007AFF" style={styles.icon} />
        <Text style={styles.label}>From:</Text>
        <Text style={styles.value}>{ride.pickup}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="flag" size={20} color="#FF3B30" style={styles.icon} />
        <Text style={styles.label}>To:</Text>
        <Text style={styles.value}>{ride.destination}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="date-range" size={20} color="#34C759" style={styles.icon} />
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{ride.date}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time" size={20} color="#FF9500" style={styles.icon} />
        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{ride.time}</Text>
      </View>

      <View style={styles.row}>
        <FontAwesome5 name="users" size={18} color="#8E8E93" style={styles.icon} />
        <Text style={styles.label}>Seats Left:</Text>
        <Text style={styles.value}>{ride.availableSeats}</Text>
      </View>

      {isPassenger && (
        <View style={styles.buttonRow}>
          {hasJoined ? (
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.btnText}>Cancel Ride</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.btnText}>Join Ride</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default RideCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },
  value: {
    fontWeight: '400',
    color: '#666',
    flexShrink: 1,
  },
  buttonRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  joinBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
