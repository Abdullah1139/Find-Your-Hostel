import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Alert, StyleSheet, Modal, ScrollView, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [images, setImages] = useState([]);
  const [token, setToken] = useState('');

  const [form, setForm] = useState({
    name: '',
    location: '',
    amenities: '',
    price: '',
    availability: 'true',
    rooms: '',
    bedsPerRoom: '',
  });
  const navigation = useNavigation();


  // In your ManageHostels component, modify the useEffect and token handling:

useEffect(() => {
  const loadData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        Alert.alert('Error', 'Please login again');
        // Optionally navigate to login screen
        return;
      }
      setToken(storedToken);
      await fetchHostels(storedToken);
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize');
    }
  };
  loadData();
}, []);

const fetchHostels = async (authToken) => {
  try {
    if (!authToken) {
      const newToken = await AsyncStorage.getItem('userToken');
      if (!newToken) {
        Alert.alert('Error', 'Authentication required');
        return;
      }
      authToken = newToken;
      setToken(newToken);
    }

    const response = await fetch(`${BASE_URL}/hostels/all`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      Alert.alert('Session Expired', 'Please login again');
      await AsyncStorage.removeItem('userToken');
      // Optionally navigate to login screen
      return;
    }

    const data = await response.json();
    setHostels(data);
  } catch (error) {
    console.error('Fetch error:', error);
    Alert.alert('Error', 'Failed to fetch hostels');
  }
};

  const pickImages = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission denied', 'We need access to your camera roll!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    setImages(prev => [...prev, result.assets[0].uri]); // append selected image
  }
};

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openEditModal = (hostel) => {
    setSelectedHostel(hostel);
    setForm({
      name: hostel.name || '',
      location: hostel.location || '',
      amenities: hostel.amenities.join(', ') || '',
      price: String(hostel.price) || '',
      availability: String(hostel.availability) || 'true',
      rooms: String(hostel.rooms) || '',
      bedsPerRoom: String(hostel.bedsPerRoom) || '',
    });
    setImages(hostel.images || []);
    setModalVisible(true);
  };

  const handleAddOrUpdate = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    // Validate required fields
    if (!form.name || !form.location || !form.price || !form.rooms || !form.bedsPerRoom) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!selectedHostel && images.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return;
    }

    const method = selectedHostel ? 'PUT' : 'POST';
    const endpoint = selectedHostel
      ? `${BASE_URL}/hostels/update/${selectedHostel._id}`
      : `${BASE_URL}/hostels/add`;

    const formData = new FormData();

    // Append text fields
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append images if adding new hostel
    if (!selectedHostel) {
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('images', {
          uri,
          name: `image_${index}_${filename}`,
          type,
        });
      });
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      Alert.alert('Success', selectedHostel ? 'Hostel updated!' : 'Hostel added!');
      setModalVisible(false);
      fetchHostels(token);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to save hostel');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/hostels/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete hostel');
      }

      const result = await response.json();
      Alert.alert('Success', result.message);
      fetchHostels(token);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      amenities: '',
      price: '',
      availability: 'true',
      rooms: '',
      bedsPerRoom: '',
    });
    setImages([]);
    setSelectedHostel(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Hostels</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Hostel</Text>
      </TouchableOpacity>

      <FlatList
      data={hostels}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('HostelDetail', { hostel: item })}>
          <View style={styles.card}>
            {item.images?.[0] && (
              <Image 
                source={{ uri: item.images[0] }} 
                style={styles.hostelImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.hostelName}>{item.name}</Text>
            <Text style={styles.hostelInfo}>Location: {item.location}</Text>
            <Text style={styles.hostelInfo}>Price: ${item.price}</Text>
            <Text style={styles.hostelInfo}>Rooms: {item.rooms}</Text>

            <View style={styles.cardButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.heading}>{selectedHostel ? 'Update Hostel' : 'Add Hostel'}</Text>

          {['name', 'location', 'amenities', 'price', 'rooms', 'bedsPerRoom'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChangeText={(text) => handleChange(field, text)}
              keyboardType={field === 'price' || field === 'rooms' || field === 'bedsPerRoom' ? 'numeric' : 'default'}
            />
          ))}

          <TouchableOpacity style={styles.addButton} onPress={pickImages}>
            <Text style={styles.buttonText}>
              {selectedHostel ? 'Change Images' : 'Pick Images (Multiple)'}
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <FlatList
              horizontal
              data={images}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}
            />
          )}

          <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>{selectedHostel ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { marginTop: 10 }]}
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#6A0DAD',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#B00020',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  hostelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 5,
  },
  hostelInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  hostelImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 8,
  },
});

export default ManageHostels;