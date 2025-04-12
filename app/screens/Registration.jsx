import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../src/redux/authSlice';
import { useNavigation } from '@react-navigation/native';

const Registration = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector(state => state.auth);

  const [role, setRole] = useState('Hostellite');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const validateInput = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordMinLength = 6;

    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return false;
    }

    if (!nameRegex.test(name)) {
      Alert.alert('Error', 'Name should only contain alphabets.');
      return false;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }

    if (!/^\d{11}$/.test(phone)) {
      Alert.alert('Error', 'Phone number must be exactly 11 digits.');
      return false;
    }

    if (password.length < passwordMinLength) {
      Alert.alert('Error', `Password must be at least ${passwordMinLength} characters long.`);
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validateInput()) return;

    dispatch(registerUser({ name, email, phone, password, role }));
  };

  useEffect(() => {
    if (user) {
      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
    }
  }, [error]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Register</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Role</Text>
        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Hostellite (Student)" value="Hostellite" />
          <Picker.Item label="Hosteller (Hostel Owner)" value="Hosteller" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="11-digit phone number"
          keyboardType="numeric"
          maxLength={11}
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkButtonText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A0DAD',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#6A0DAD',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Registration;
