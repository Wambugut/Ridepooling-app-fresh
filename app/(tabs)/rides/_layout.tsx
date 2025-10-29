import { Stack } from 'expo-router';
import { View } from 'react-native';


export default function RidesLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
