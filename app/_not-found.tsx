// app/_not-found.tsx
import { Text, View, StyleSheet } from 'react-native';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>404</Text>
      <Text style={styles.text}>Page Not Found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  text: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 8,
  },
});