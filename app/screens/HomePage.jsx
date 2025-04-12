import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import MyBookingsScreen from '../(hostellite)/MyBookingScreen';

const HomePage = ({ navigation }) => {
  const role = useSelector((state) => state.auth.role) || 'User'; // ✅ Read role from Redux

  const navigateBasedOnRole = () => {
    switch (role) {
      case 'Hosteller':
        navigation.navigate('AddHostel');
        break;
      case 'Hostellite':
        navigation.navigate('SearchHostel');
        break;
      case 'Admin':
        navigation.navigate('AdminDashboard');
        break;
      default:
        Alert.alert('Error', 'Invalid role');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome, {role}!</Text>

      <TouchableOpacity style={styles.button} onPress={navigateBasedOnRole}>
        <Text style={styles.buttonText}>
          {role === 'Hosteller'
            ? 'Add Hostel'
            : role === 'Hostellite'
            ? 'Find Hostel'
            : 'Manage Dashboard'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomePage;
