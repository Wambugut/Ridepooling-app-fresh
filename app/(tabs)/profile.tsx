import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image, ScrollView } from 'react-native';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [hostel, setHostel] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setHostel(data.hostel || '');
          setEmail(data.email || '');
          setRole(data.role || '');
          setProfileImage(data.profileImage || null);
        }
      } catch {
        Alert.alert('Error', 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const pickImage = async () => {
    if (!isEditing) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to photos to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const docRef = doc(firestore, 'users', user!.uid);
      await updateDoc(docRef, { name, hostel, profileImage: profileImage || null });

      // Password logic
      if (showPasswordFields) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          Alert.alert('Error', 'Please fill all password fields.');
          return;
        }
        if (newPassword !== confirmPassword) {
          Alert.alert('Error', 'New passwords do not match.');
          return;
        }

        const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
        await reauthenticateWithCredential(user!, credential);
        await updatePassword(user!, newPassword);
      }

      Alert.alert('Success', 'Profile updated!');
      setIsEditing(false);
      setShowPasswordFields(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.replace('../screens/Auth/Login');
    } catch {
      Alert.alert('Error', 'Logout failed');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#2563eb", "#38bdf8", "#f8fafc"]} style={{flex: 1}}>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity onPress={() => {
              setIsEditing(false);
              setShowPasswordFields(false);
            }}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 16 }}>
            <Ionicons name="log-out" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer} disabled={!isEditing}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="white" />
        )}
        {isEditing && (
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="camera-outline" size={30} color="white" />
            <Text style={styles.imageText}>Tap to change photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Profile Form */}
      {!isEditing ? (
        <View style={styles.readOnlyContainer}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={styles.fieldValue}>{name}</Text>
          </View>

          {role === 'student' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Hostel</Text>
              <Text style={styles.fieldValue}>{hostel || 'Not specified'}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Role</Text>
            <Text style={[styles.fieldValue, { textTransform: 'capitalize' }]}>{role}</Text>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" placeholderTextColor="#9ca3af" />

          {role === 'student' && (
            <>
              <Text style={styles.label}>Hostel</Text>
              <TextInput value={hostel} onChangeText={setHostel} style={styles.input} placeholder="Hostel/block" placeholderTextColor="#9ca3af" />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <Text style={styles.readOnlyField}>{email}</Text>

          <Text style={styles.label}>Role</Text>
          <Text style={styles.readOnlyField}>{role}</Text>

          <TouchableOpacity onPress={() => setShowPasswordFields(!showPasswordFields)}>
            <Text style={{ color: '#fff', fontWeight: '600', marginBottom: 12 }}>
              {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {showPasswordFields && (
            <>
              <Text style={styles.label}>Current Password</Text>
              <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
              <Text style={styles.label}>New Password</Text>
              <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
            </>
          )}

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row' },
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  initialsCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  initialsText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  imageText: { color: '#fff', fontSize: 14 },
  readOnlyContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { color: '#f0f9ff', fontSize: 14, marginBottom: 4 },
  fieldValue: { color: '#fff', fontSize: 16, fontWeight: '500' },
  label: { color: '#fff', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
  },
  readOnlyField: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f0f9ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
  },
  saveButtonText: { color: '#2563eb', fontWeight: '600', fontSize: 16 },
});

export default ProfileScreen;
