// app/(tabs)/rides/create.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform, ScrollView } from 'react-native';
import { firestore, auth } from '../../../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Conditional imports
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const CreateRide = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [seats, setSeats] = useState('');
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const router = useRouter();

  // Web-specific date/time input states
  const [webDate, setWebDate] = useState('');
  const [webTime, setWebTime] = useState('');

  const handleCreateRide = async () => {
    if (!pickup || !destination || !seats) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Handle web date/time input
    let finalDateTime = dateTime;
    if (Platform.OS === 'web') {
      if (!webDate || !webTime) {
        Alert.alert('Error', 'Please select both date and time');
        return;
      }
      finalDateTime = new Date(`${webDate}T${webTime}`);
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create a ride');
      return;
    }

    try {
      const date = finalDateTime.toISOString().split('T')[0];
      const timeFormatted = finalDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      await addDoc(collection(firestore, 'rides'), {
        driverId: currentUser.uid,
        pickup: pickup,
        destination: destination,
        date: date,
        time: timeFormatted,
        seats: parseInt(seats),
        passengers: [],
        status: "upcoming",
        createdAt: new Date().toISOString(),
        departureTime: finalDateTime.toISOString()
      });

      Alert.alert('Success', 'Ride created successfully!');
      router.push('/rides'); // Navigate to the rides dashboard
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }

    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  // Web date/time handlers
  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebDate(e.target.value);
  };

  const handleWebTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebTime(e.target.value);
  };

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create a Ride</Text>

        <TextInput
          style={styles.input}
          placeholder="Pickup Location (e.g., TUK Main Gate)"
          value={pickup}
          onChangeText={setPickup}
          placeholderTextColor="#e0f2fe"
        />

        <TextInput
          style={styles.input}
          placeholder="Destination (e.g., CBD, Westlands)"
          value={destination}
          onChangeText={setDestination}
          placeholderTextColor="#e0f2fe"
        />

        {Platform.OS === 'web' ? (
          <>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Date</Text>
              <input
                type="date"
                value={webDate}
                onChange={handleWebDateChange}
                min={new Date().toISOString().split('T')[0]}
                style={styles.webInput}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Time</Text>
              <input
                type="time"
                value={webTime}
                onChange={handleWebTimeChange}
                style={styles.webInput}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowPicker('date')}
                style={styles.pickerButton}
              >
                <Text style={styles.pickerText}>
                  {dateTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Select Time</Text>
              <TouchableOpacity
                onPress={() => setShowPicker('time')}
                style={styles.pickerButton}
              >
                <Text style={styles.pickerText}>
                  {dateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={dateTime}
                mode={showPicker}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateTimeChange}
                minimumDate={showPicker === 'date' ? new Date() : undefined}
              />
            )}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Number of Available Seats"
          value={seats}
          onChangeText={setSeats}
          keyboardType="numeric"
          placeholderTextColor="#e0f2fe"
        />

        <TouchableOpacity
          onPress={handleCreateRide}
          style={styles.createButton}
        >
          <Text style={styles.buttonText}>Create Ride</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pickerText: {
    fontSize: 16,
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 18,
  },
  webInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
});

export default CreateRide;