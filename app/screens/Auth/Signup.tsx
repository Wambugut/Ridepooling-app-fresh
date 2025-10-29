import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ToggleButton } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, firestore } from '../../../firebase-config';
import { getFirebaseAuthErrorMessage } from '../../../lib/utils/firebaseErrorHandler';

type SignupForm = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'driver';
  hostel: string;
};

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hostel: 'TUK Men',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((key: keyof SignupForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSignup = async () => {
    const { name, email, password, role, hostel } = form;

    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        role,
        hostel: role === 'student' ? hostel.trim() : '',
        idVerified: false,
      });

      Alert.alert('Signup Successful', 'Would you like to save your account for future logins?', [
        {
          text: 'No',
          onPress: () => router.replace('/(tabs)'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const newAccount = { email: email.trim(), password: password.trim() };
            const existingAccountsJson = await AsyncStorage.getItem('saved_accounts');
            const existingAccounts = existingAccountsJson ? JSON.parse(existingAccountsJson) : [];
            const updatedAccounts = [...existingAccounts, newAccount];
            await AsyncStorage.setItem('saved_accounts', JSON.stringify(updatedAccounts));
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (error: any) {
      const message = getFirebaseAuthErrorMessage(error.code);
      Alert.alert('Signup Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.innerContainer}>
      <View style={{backgroundColor: '#2563eb', borderRadius: 20, padding: 10, marginBottom: 20}}>
      <Image source={require('../../../assets/images/splash.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Full Name"
          value={form.name}
          onChangeText={text => handleChange('name', text)}
          autoCapitalize="words"
          style={styles.input}
          placeholderTextColor="#6b7280"
        />

        <TextInput
          placeholder="Email"
          value={form.email}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#6b7280"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={form.password}
            onChangeText={text => handleChange('password', text)}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Select your role:</Text>
        <View style={styles.toggleContainer}>
          <ToggleButton.Row
            onValueChange={value => handleChange('role', value)}
            value={form.role}
          >
            <ToggleButton icon="account" value="student" />
            <ToggleButton icon="car" value="driver" />
          </ToggleButton.Row>
        </View>

        {form.role === 'student' && (
          <TextInput
            placeholder="Hostel"
            value={form.hostel}
            onChangeText={text => handleChange('hostel', text)}
            style={styles.input}
            placeholderTextColor="#6b7280"
          />
        )}

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.disabledButton]}
          disabled={loading}
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('./Login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default SignupScreen;

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
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    width: '70%',
    alignItems: 'center',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  label: {
    color: '#fff',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  toggleContainer: {
    marginBottom: 16,
  },
  signupButton: {
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
