// screens/HomePage.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchUserBookings } from '../../src/redux/bookSlice';

const HomePage = () => {
  const role = useSelector((state) => state.auth.role) || 'User';
  const { userBookings, status } = useSelector((state) => state.bookings);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    if (role === 'Hostellite') {
      dispatch(fetchUserBookings());
    }
  }, [role, dispatch]);

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

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <Text>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome, {role}!</Text>

      {role === 'Hostellite' && userBookings.length > 0 && (
        <View style={styles.bookingsContainer}>
          <Text style={styles.sectionTitle}>Your Current Bookings</Text>
          {userBookings.map((booking) => (
            <View key={booking._id} style={styles.bookingCard}>
              {booking.hostel?.images?.[0] && (
                <Image 
                  source={{ uri: booking.hostel.images[0] }} 
                  style={styles.hostelImage}
                />
              )}
              <View style={styles.bookingDetails}>
                <Text style={styles.hostelName}>{booking.hostel?.name || 'Unknown Hostel'}</Text>
                <Text>Room: {booking.room?.roomNumber || 'Not specified'}</Text>
                <Text>Address: {booking.hostel?.address || 'Not available'}</Text>
                <Text>
                  Dates: {new Date(booking.checkInDate).toLocaleDateString()} - {' '}
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </Text>
                <Text>Status: {booking.paymentStatus}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.button,
          role === 'Hostellite' && userBookings.length > 0 && styles.buttonWithBookings
        ]} 
        onPress={navigateBasedOnRole}
      >
        <Text style={styles.buttonText}>
          {role === 'Hosteller'
            ? 'Add Hostel'
            : role === 'Hostellite'
            ? 'Find Another Hostel'
            : 'Manage Dashboard'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 20,
    textAlign: 'center',
  },
  bookingsContainer: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  bookingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hostelImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  bookingDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  hostelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#6A0DAD',
  },
  button: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonWithBookings: {
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomePage;