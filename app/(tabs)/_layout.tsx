import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Platform, StatusBar, View } from 'react-native';
import GlobalFAB from '../../components/GlobalFAB';
import CustomHeader from '../../components/CustomHeader';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#fff' }}>
      <CustomHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'blue',
          headerShown: false,
          tabBarPosition: 'top',
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="rides"
          options={{
            title: 'Rides',
            tabBarIcon: ({ color }) => <TabBarIcon name="car" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </Tabs>
      <GlobalFAB />
    </View>
  );
}