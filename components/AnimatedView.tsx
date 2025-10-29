// components/AnimatedView.tsx
import { Platform, View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedViewProps {
  source: any;
  style?: any;
}

export default function AnimatedView({ source, style }: AnimatedViewProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[style, styles.webFallback]}>
        {/* Optional: Add a web-friendly fallback */}
      </View>
    );
  }
  return <LottieView source={source} style={style} autoPlay loop />;
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});