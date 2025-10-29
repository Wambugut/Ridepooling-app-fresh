import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { auth } from '../../../firebase-config';
import { getFirebaseAuthErrorMessage } from '../../../lib/utils/firebaseErrorHandler';
import { LinearGradient } from 'expo-linear-gradient';

const ResetPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    console.log('handleReset called');
    if (!email.trim()) {
      Alert.alert('Missing Info', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending password reset email to:', email.trim());
      await sendPasswordResetEmail(auth, email.trim());
      console.log('Password reset email sent successfully');
      Alert.alert('Successful', 'Check your email or spam to reset your password');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      const message = getFirebaseAuthErrorMessage(error.code);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.innerContainer}>
      <View style={{backgroundColor: '#2563eb', borderRadius: 20, padding: 10, marginBottom: 20}}>
      <Image source={require('../../../assets/images/splash.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#6b7280"
      />

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        style={[styles.button, loading && styles.disabledButton]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./Login')}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    borderRadius: 8,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    marginTop: 24,
    fontWeight: '500',
  },
});