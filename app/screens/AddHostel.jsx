import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Alert, StyleSheet, Modal, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { BASE_URL } from '../../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [images, setImages] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [hostelForm, setHostelForm] = useState({
    name: '',
    location: '',
    amenities: '',
    availability: 'true',
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    totalBeds: '',
    pricePerBed: '',
  });

  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          Alert.alert('Error', 'Please login again');
          navigation.navigate('Login');
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
        },
      });

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.removeItem('userToken');
        navigation.navigate('Login');
        return;
      }

      const data = await response.json();
      setHostels(data);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch hostels');
    }
  };

  const fetchRooms = async (hostelId) => {
    try {
      const response = await fetch(`${BASE_URL}/rooms/hostel/${hostelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to fetch rooms');
    }
  };

 // Replace your current pickImages function with this:

 const pickImages = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'We need access to your photos to select images',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Disable editing for multiple selection
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true, // Enable multiple selection
      selectionLimit: 10, // Optional: set a limit
    });

    if (!result.canceled && result.assets) {
      // Get all selected images
      const selectedImages = result.assets.map(asset => asset.uri);
      
      // If editing existing hostel, append new images to existing ones
      if (selectedHostel) {
        setImages(prev => [...prev, ...selectedImages]);
      } else {
        // For new hostel, set all selected images
        setImages(selectedImages);
      }
    }
  } catch (error) {
    console.error('Image picker error:', error);
    Alert.alert('Error', 'Failed to open image picker');
  }
};

  const handleHostelChange = (field, value) => {
    setHostelForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRoomChange = (field, value) => {
    setRoomForm(prev => ({ ...prev, [field]: value }));
  };

  const openEditModal = (hostel) => {
    setSelectedHostel(hostel);
    setHostelForm({
      name: hostel.name || '',
      location: hostel.location || '',
      amenities: hostel.amenities.join(', ') || '',
      availability: String(hostel.availability) || 'true',
    });
    setImages(hostel.images || []);
    setModalVisible(true);
  };

  const openRoomModal = async (hostel) => {
    setSelectedHostel(hostel);
    await fetchRooms(hostel._id);
    setRoomModalVisible(true);
  };

  const handleAddOrUpdateHostel = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }
  
    // Validate required fields
    if (!hostelForm.name || !hostelForm.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
  
    if (!selectedHostel && images.length === 0) {
      Alert.alert('Error', 'At least one image is required');
      return;
    }
  
    setLoading(true);
  
    try {
      const method = selectedHostel ? 'PUT' : 'POST';
      const endpoint = selectedHostel 
        ? `${BASE_URL}/hostels/update/${selectedHostel._id}`
        : `${BASE_URL}/hostels/add`;
  
      const formData = new FormData();
      formData.append('name', hostelForm.name);
      formData.append('location', hostelForm.location);
      formData.append('amenities', hostelForm.amenities);
      formData.append('availability', hostelForm.availability);
      
      // Add default values for price, rooms, and bedsPerRoom if your backend requires them
      formData.append('price', '0'); // Default price
      formData.append('rooms', '0'); // Default rooms count
      formData.append('bedsPerRoom', '0'); // Default beds per room
  
      // For new hostel, append all images
      if (!selectedHostel) {
        images.forEach((uri, index) => {
          if (!uri) return;
      
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
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
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
      resetHostelForm();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to save hostel');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!selectedHostel || !roomForm.roomNumber || !roomForm.totalBeds || !roomForm.pricePerBed) {
      Alert.alert('Error', 'Please fill all room details');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId: selectedHostel._id,
          roomNumber: roomForm.roomNumber,
          totalBeds: roomForm.totalBeds,
          pricePerBed: roomForm.pricePerBed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add room');
      }

      Alert.alert('Success', 'Room added successfully!');
      fetchRooms(selectedHostel._id);
      resetRoomForm();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }

      Alert.alert('Success', 'Room deleted successfully');
      fetchRooms(selectedHostel._id);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteHostel = async (id) => {
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

  const resetHostelForm = () => {
    setHostelForm({
      name: '',
      location: '',
      amenities: '',
      availability: 'true',
    });
    setImages([]);
    setSelectedHostel(null);
  };

  const resetRoomForm = () => {
    setRoomForm({
      roomNumber: '',
      totalBeds: '',
      pricePerBed: '',
    });
  };

  const renderRoomItem = ({ item }) => (
    <View style={styles.roomCard}>
      <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
      <Text>Beds: {item.availableBeds}/{item.totalBeds}</Text>
      <Text>Price per bed: PKR {item.pricePerBed}</Text>
      <TouchableOpacity 
        style={styles.deleteRoomButton}
        onPress={() => handleDeleteRoom(item._id)}
      >
        <Feather name="trash-2" size={18} color="#B00020" />
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.hostelInfo}>Rooms: {item.rooms}</Text>
            <Text style={styles.hostelInfo}>Beds per room: {item.bedsPerRoom}</Text>

            <View style={styles.cardButtons}>
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => navigation.navigate('HostelDetail', { hostel: item })}
              >
                <Feather name="info" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.roomsButton}
                onPress={() => openRoomModal(item)}
              >
                <Feather name="home" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Feather name="edit" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteHostel(item._id)}
              >
                <Feather name="trash-2" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Hostel Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.heading}>{selectedHostel ? 'Update Hostel' : 'Add Hostel'}</Text>

          {['name', 'location', 'amenities'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={hostelForm[field]}
              onChangeText={(text) => handleHostelChange(field, text)}
            />
          ))}

          {/* Availability toggle */}
          <View style={styles.availabilityContainer}>
            <Text>Availability:</Text>
            <TouchableOpacity
              style={styles.availabilityToggle}
              onPress={() => handleHostelChange('availability', hostelForm.availability === 'true' ? 'false' : 'true')}
            >
              <Text>{hostelForm.availability === 'true' ? 'Available' : 'Unavailable'}</Text>
              <Feather 
                name={hostelForm.availability === 'true' ? 'toggle-right' : 'toggle-left'} 
                size={24} 
                color={hostelForm.availability === 'true' ? '#4CAF50' : '#B00020'} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
            <Feather name="image" size={20} color="#6A0DAD" />
            <Text style={styles.imageButtonText}>
              {selectedHostel ? 'Change Images' : 'Pick Images'}
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
  <View style={styles.imagePreviewContainer}>
    {images.map((uri, index) => (
      <View key={`${uri}-${index}`} style={styles.imageWrapper}>
        <Image
          source={{ uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={() => {
            const newImages = [...images];
            newImages.splice(index, 1);
            setImages(newImages);
          }}
        >
          <Feather name="x" size={20} color="white" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleAddOrUpdateHostel}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{selectedHostel ? 'Update' : 'Add'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setModalVisible(false);
              resetHostelForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Room Management Modal */}
      <Modal visible={roomModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.heading}>Manage Rooms: {selectedHostel?.name}</Text>
          
          <Text style={styles.sectionTitle}>Add New Room</Text>
          {['roomNumber', 'totalBeds', 'pricePerBed'].map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              placeholder={field === 'roomNumber' ? 'Room Number' : 
                         field === 'totalBeds' ? 'Total Beds' : 'Price per Bed'}
              value={roomForm[field]}
              onChangeText={(text) => handleRoomChange(field, text)}
              keyboardType={field === 'pricePerBed' || field === 'totalBeds' ? 'numeric' : 'default'}
            />
          ))}

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddRoom}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Add Room</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Existing Rooms</Text>
          {rooms.length > 0 ? (
            <FlatList
              data={rooms}
              renderItem={renderRoomItem}
              keyExtractor={item => item._id}
            />
          ) : (
            <Text style={styles.noRoomsText}>No rooms added yet</Text>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setRoomModalVisible(false);
              setSelectedHostel(null);
              setRooms([]);
            }}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#6A0DAD',
    borderRadius: 8,
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#6A0DAD',
    marginLeft: 10,
    fontWeight: '600',
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
    justifyContent: 'space-between',
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  roomsButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#B00020',
    padding: 10,
    borderRadius: 20,
    width: 40,
    alignItems: 'center',
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
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#6A0DAD',
    fontWeight: '600',
  },
  roomCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  roomNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  deleteRoomButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  noRoomsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ManageHostels;