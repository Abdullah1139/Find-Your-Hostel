import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const AddHostel = () => {
  const [hostelName, setHostelName] = useState('');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [facilities, setFacilities] = useState('');
  const [nearestInstitution, setNearestInstitution] = useState('');

  const handleAddHostel = () => {
    if (!hostelName || !address || !priceRange || !facilities || !nearestInstitution) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    const data = {
      hostelName,
      address,
      priceRange,
      facilities: facilities.split(','),
      nearestInstitution,
    };

    // You can replace the console.log with an API call to submit the data
    console.log('Hostel Data:', data);
    Alert.alert('Success', 'Hostel added successfully!');
    // Clear form fields
    setHostelName('');
    setAddress('');
    setPriceRange('');
    setFacilities('');
    setNearestInstitution('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Hostel</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hostel Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hostel name"
          value={hostelName}
          onChangeText={setHostelName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hostel address"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price Range</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price range (e.g., 5000-10000)"
          value={priceRange}
          onChangeText={setPriceRange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Facilities</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter facilities (comma separated)"
          value={facilities}
          onChangeText={setFacilities}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nearest Institution</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter nearest institution"
          value={nearestInstitution}
          onChangeText={setNearestInstitution}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddHostel}>
        <Text style={styles.buttonText}>Add Hostel</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6A0DAD',
    textAlign: 'center',
    marginBottom: 20,
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
});

export default AddHostel;
