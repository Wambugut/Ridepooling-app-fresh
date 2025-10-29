// hooks/useDriverLocation.ts
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { useAuth } from './useAuth'; 

export const useDriverLocation = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 20, // update if moved 20+ meters
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          if (!currentUser?.uid) return;

          try {
            const driverRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(driverRef, {
              location: { latitude, longitude, updatedAt: Date.now() },
            });
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        }
      );
    };

    if (currentUser?.role === 'driver') {
      startTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [currentUser]);
};
