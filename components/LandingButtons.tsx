// components/LandingButtons.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LandingButtons() {
  const router = useRouter();

  const createAnimatedButton = (
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void,
    bgColor: string,
    shadowColor: string,
    label: string
  ) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <View style={{ marginHorizontal: 10 }}>
        <AnimatedPressable
          onPressIn={() => (scale.value = withSpring(0.9))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={onPress}
          style={[animatedStyle]}
        >
          <View
            style={[
              styles.actionButton,
              { 
                backgroundColor: bgColor,
                shadowColor: shadowColor,
              }
            ]}
          >
            <Ionicons name={icon} size={24} color="white" />
            <Text style={styles.actionLabel}>{label}</Text>
          </View>
        </AnimatedPressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {createAnimatedButton(
        'log-in-outline',
        () => router.push('/screens/Auth/Login'),
        '#2563eb',
        '#93c5fd',
        'Login'
      )}
      {createAnimatedButton(
        'person-add-outline',
        () => router.push('./screens/Auth/Register'),
        '#16a34a',
        '#6ee7b7',
        'Register'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  actionButton: {
    borderRadius: 100,
    padding: 16,
    alignItems: 'center',
    width: 72,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionLabel: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
  },
});