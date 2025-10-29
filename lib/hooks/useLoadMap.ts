// hooks/useLoadMap.ts
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useLoadScript } from '@react-google-maps/api';
import { Platform } from 'react-native';

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

export function useLoadMap() {
  const [MapView, setMapView] = useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript(
    Platform.OS === 'web'
      ? {
          googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          libraries,
        }
      : { skip: true }
  );

  useEffect(() => {
    const loadMapComponent = async () => {
      try {
        let mapModule;
        if (Platform.OS === 'web') {
          mapModule = await import('@teovilla/react-native-web-maps');
        } else {
          mapModule = await import('react-native-maps');
        }
        setMapView(() => mapModule.default);
      } catch (err) {
        setError('Failed to load map component');
      }
    };

    loadMapComponent();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const mapIsReady = Platform.OS === 'web' ? isLoaded : !!MapView;

  useEffect(() => {
    if (loadError) {
      setError(`Failed to load Google Maps script: ${loadError.message}`);
    }
  }, [loadError]);

  return { MapView, location, error, mapIsReady };
}