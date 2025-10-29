import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoadMap } from '../lib/hooks/useLoadMap';

export default function UniversalMap() {
  const { MapView, location, error, mapIsReady } = useLoadMap();

  if (error) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text style={styles.errorText}>Map Unavailable</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Text style={styles.solutionText}>
          Try again later or check your connection.
        </Text>
      </View>
    );
  }

  if (!mapIsReady || !location) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="map" size={48} color="#2563eb" />
        <Text style={styles.loadingText}>Loading Map...</Text>
      </View>
    );
  }

  return (
    <MapView
      provider="google"
      style={styles.map}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    color: '#4b5563',
    marginTop: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 20,
    fontWeight: '600',
  },
  errorSubtext: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  solutionText: {
    color: '#4b5563',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
  },
});