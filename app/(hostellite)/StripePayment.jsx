// StripePayment.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../service/api';

const StripePayment = ({
  amount,
  hostelId,
  checkInDate,
  checkOutDate,
  months,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [clientSecret, setClientSecret] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      initializePaymentSheet();
    }
  }, [token]);

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/payment/create-payment-intent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId,
          months,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment intent');
      }

      const { clientSecret } = data;
      setClientSecret(clientSecret);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Hostellite',
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert('Payment failed', error.message);
    } else {
      // Booking successful
      await confirmBooking();
    }
  };
  

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/payment/payment-success`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId,
          checkInDate,
          checkOutDate,
        }),
      });
  
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
  
      const data = isJson ? await response.json() : await response.text();
  
      if (!response.ok) {
        throw new Error((isJson && data.message) || data || 'Failed to confirm booking');
      }
  
      onSuccess(data);
    } catch (error) {
      console.error('Booking Error:', error.message);
      Alert.alert('Booking Error', error.message);
    } finally {
      setLoading(false);
    }
    const raw = await response.text();
    console.log('🔍 Raw response:', raw);

  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.amount}>Total: PKR {amount}</Text>

      {loading ? (
        <ActivityIndicator color="#6A0DAD" />
      ) : (
        <TouchableOpacity style={styles.payButton} onPress={openPaymentSheet}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StripePayment;
