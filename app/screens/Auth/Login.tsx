import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase-config';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFirebaseAuthErrorMessage } from '../../../lib/utils/firebaseErrorHandler';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SavedAccountsModal from '../../../components/SavedAccountsModal';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadSavedAccounts = async () => {
      const accountsJson = await AsyncStorage.getItem('saved_accounts');
      if (accountsJson) {
        const accounts = JSON.parse(accountsJson);
        if (accounts.length > 0) {
          setSavedAccounts(accounts);
          setModalVisible(true);
        }
      }
    };
    loadSavedAccounts();
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing Info', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      Alert.alert('Login successful');
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = getFirebaseAuthErrorMessage(error.code);
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: any) => {
    setEmail(account.email);
    setPassword(account.password);
    setModalVisible(false);
  };

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.innerContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>TUKRIDEPOOL</Text>
        <Text style={styles.slogan}>Ride smart, save more</Text>
      </View>
      <Image source={require('../../../assets/images/tuk logo.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#6b7280"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.passwordInput]}
            secureTextEntry={!showPassword}
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#2563eb"
              style={styles.showPasswordIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('./Signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./ResetPassword')}>
        <Text style={styles.linkText}>Forgot your password?</Text>
      </TouchableOpacity>

      <SavedAccountsModal
        visible={modalVisible}
        accounts={savedAccounts}
        onSelect={handleSelectAccount}
        onClose={() => setModalVisible(false)}
      />
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
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
  showPasswordIcon: {
    marginLeft: 8,
  },
  loginButton: {
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  slogan: {
    fontSize: 16,
    color: '#fff',
  },
});