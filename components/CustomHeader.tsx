import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CustomHeader = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  logo: {
    width: 150,
    height: 150,
  },
});

export default CustomHeader;