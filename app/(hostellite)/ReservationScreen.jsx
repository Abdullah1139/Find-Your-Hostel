import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import StripePayment from './StripePayment';

const ReservationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { hostel } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentDateType, setCurrentDateType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState(1);

  // Generate dates for the next 12 months
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i <= 365; i++) { // 1 year range
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        Alert.alert('Error', 'Please login to continue');
        navigation.navigate('Login');
        return;
      }
      setToken(storedToken);
      
      // Set default checkout to 1 month from today
      const defaultCheckout = new Date();
      defaultCheckout.setMonth(defaultCheckout.getMonth() + 1);
      setCheckOutDate(defaultCheckout);

      // Fetch available rooms for this hostel
      try {
        const response = await fetch(`${BASE_URL}/rooms/hostel/${hostel._id}`);
        const data = await response.json();
        setRooms(data);
        if (data.length > 0) {
          setSelectedRoom(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    loadData();
  }, []);

  const handleDateSelect = (date) => {
    if (currentDateType === 'checkIn') {
      setCheckInDate(date);
      // Auto-set checkout to checkin + 1 month (minimum duration)
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCheckOutDate(nextMonth);
    } else {
      // Validate that checkout is at least 1 month after checkin
      const minCheckout = new Date(checkInDate);
      minCheckout.setMonth(minCheckout.getMonth() + 1);
      
      if (date < minCheckout) {
        Alert.alert('Minimum Stay', 'Hostel requires a minimum stay of 1 month');
        setCheckOutDate(minCheckout);
      } else {
        setCheckOutDate(date);
      }
    }
    setShowDateModal(false);
  };

  const openDateModal = (type) => {
    setCurrentDateType(type);
    setShowDateModal(true);
  };

  const calculateTotal = () => {
    const months = (checkOutDate.getFullYear() - checkInDate.getFullYear()) * 12 + 
                  (checkOutDate.getMonth() - checkInDate.getMonth());
    const selectedRoomObj = rooms.find(room => room._id === selectedRoom);
    if (!selectedRoomObj) return 0;
    return months * selectedRoomObj.pricePerBed * seatsBooked;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBookNow = async () => {
    if (paymentMethod === 'online' && !showPayment) {
      setShowPayment(true);
      return;
    }

    const months = (checkOutDate.getFullYear() - checkInDate.getFullYear()) * 12 + 
                   (checkOutDate.getMonth() - checkInDate.getMonth());

    if (months < 1) {
      Alert.alert('Minimum Stay', 'Hostel requires a minimum stay of 1 month');
      return;
    }

    if (!selectedRoom) {
      Alert.alert('Error', 'Please select a room');
      return;
    }

    if (seatsBooked < 1) {
      Alert.alert('Error', 'Please select at least one seat');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bookings/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId: hostel._id,
          roomId: selectedRoom,
          checkInDate,
          checkOutDate,
          seatsBooked,
          paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending'
        }),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error((isJson && data.message) || data || 'Booking failed');
      }

      Alert.alert('Success', 'Booking confirmed!', [
        { text: 'OK', onPress: () => navigation.navigate('MyBookings') }
      ]);
    } catch (error) {
      console.error('Booking error:', error.message);
      Alert.alert('Error', error.message || 'Failed to book hostel');
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  const renderAmenity = (amenity) => (
    <View key={amenity} style={styles.amenityItem}>
      <Feather name="check-circle" size={16} color="#6A0DAD" />
      <Text style={styles.amenityText}>{amenity}</Text>
    </View>
  );

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.roomItem,
        selectedRoom === item._id && styles.selectedRoomItem
      ]}
      onPress={() => setSelectedRoom(item._id)}
    >
      <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
      <Text style={styles.roomDetails}>
        {item.availableBeds} of {item.totalBeds} beds available
      </Text>
      <Text style={styles.roomPrice}>PKR {item.pricePerBed} per bed</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageGalleryContainer}>
        <Image 
          source={{ uri: hostel.images[selectedImageIndex] }} 
          style={styles.mainImage} 
          resizeMode="cover"
        />
        
        {hostel.images.length > 1 && (
          <FlatList
            horizontal
            data={hostel.images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
                <Image 
                  source={{ uri: item }} 
                  style={[
                    styles.thumbnail,
                    index === selectedImageIndex && styles.selectedThumbnail
                  ]} 
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.thumbnailList}
          />
        )}
      </View>

      {/* Hostel Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.hostelName}>{hostel.name}</Text>
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={16} color="#666" />
          <Text style={styles.locationText}>{hostel.location}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {hostel.amenities && hostel.amenities.length > 0 ? (
            hostel.amenities.map(renderAmenity)
          ) : (
            <Text style={styles.noAmenitiesText}>No amenities listed</Text>
          )}
        </View>
      </View>

      {/* Booking Form */}
      <View style={styles.bookingForm}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        
        {/* Room Selection */}
        {rooms.length > 0 && (
          <>
            <Text style={styles.subSectionTitle}>Select Room</Text>
            <FlatList
              horizontal
              data={rooms}
              renderItem={renderRoomItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.roomList}
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}

        {/* Seats Selection */}
        {selectedRoom && (
          <>
            <Text style={styles.subSectionTitle}>Number of Beds</Text>
            <View style={styles.seatsContainer}>
              <TouchableOpacity
                style={styles.seatButton}
                onPress={() => setSeatsBooked(Math.max(1, seatsBooked - 1))}
                disabled={seatsBooked <= 1}
              >
                <Feather name="minus" size={20} color="#6A0DAD" />
              </TouchableOpacity>
              
              <Text style={styles.seatsCount}>{seatsBooked}</Text>
              
              <TouchableOpacity
                style={styles.seatButton}
                onPress={() => {
                  const selectedRoomObj = rooms.find(room => room._id === selectedRoom);
                  if (selectedRoomObj && seatsBooked < selectedRoomObj.availableBeds) {
                    setSeatsBooked(seatsBooked + 1);
                  }
                }}
                disabled={
                  !selectedRoom || 
                  seatsBooked >= rooms.find(r => r._id === selectedRoom)?.availableBeds
                }
              >
                <Feather name="plus" size={20} color="#6A0DAD" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Date Selection */}
        <Text style={styles.subSectionTitle}>Dates</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => openDateModal('checkIn')}
          >
            <Feather name="calendar" size={20} color="#6A0DAD" />
            <Text style={styles.dateText}>
              {formatDate(checkInDate)}
            </Text>
          </TouchableOpacity>

          <Feather name="arrow-right" size={20} color="#666" style={styles.dateArrow} />

          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => openDateModal('checkOut')}
          >
            <Feather name="calendar" size={20} color="#6A0DAD" />
            <Text style={styles.dateText}>
              {formatDate(checkOutDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Selection Modal */}
        <Modal
          transparent={true}
          visible={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {currentDateType === 'checkIn' ? 'Check-in' : 'Check-out'} Date
              </Text>
              <ScrollView>
                {dates.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dateOption}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={styles.dateOptionText}>
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Payment Method */}
        <Text style={styles.subSectionTitle}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'online' && styles.selectedPaymentMethod
            ]}
            onPress={() => setPaymentMethod('online')}
          >
            <Feather 
              name={paymentMethod === 'online' ? 'check-circle' : 'circle'} 
              size={20} 
              color={paymentMethod === 'online' ? '#6A0DAD' : '#666'} 
            />
            <Text style={styles.paymentMethodText}>Online Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'cash' && styles.selectedPaymentMethod
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Feather 
              name={paymentMethod === 'cash' ? 'check-circle' : 'circle'} 
              size={20} 
              color={paymentMethod === 'cash' ? '#6A0DAD' : '#666'} 
            />
            <Text style={styles.paymentMethodText}>Pay at Hostel</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per bed:</Text>
            <Text style={styles.summaryValue}>
              PKR {selectedRoom ? rooms.find(r => r._id === selectedRoom)?.pricePerBed : 'N/A'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Beds:</Text>
            <Text style={styles.summaryValue}>{seatsBooked}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Months:</Text>
            <Text style={styles.summaryValue}>
              {(checkOutDate.getFullYear() - checkInDate.getFullYear()) * 12 + 
               (checkOutDate.getMonth() - checkInDate.getMonth())}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryTotal}>PKR {calculateTotal()}</Text>
          </View>
        </View>

        {/* Book Now Button */}
        {paymentMethod === 'online' ? (
          showPayment ? (
            <StripePayment
              amount={calculateTotal()}
              hostelId={hostel._id}
              roomId={selectedRoom}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              seatsBooked={seatsBooked}
              onSuccess={() => {
                Alert.alert('Success', 'Booking confirmed!', [
                  { text: 'OK', onPress: () => navigation.navigate('MyBookings') }
                ]);
              }}
              onCancel={() => setShowPayment(false)}
            />
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setShowPayment(true)}
              disabled={!selectedRoom || loading}
            >
              <Text style={styles.bookButtonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookNow}
            disabled={!selectedRoom || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.bookButtonText}>Book Now</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  imageGalleryContainer: {
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  thumbnailList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedThumbnail: {
    borderColor: '#6A0DAD',
    borderWidth: 2,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hostelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  noAmenitiesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  bookingForm: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  roomList: {
    paddingBottom: 10,
  },
  roomItem: {
    width: 200,
    padding: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
  },
  selectedRoomItem: {
    borderColor: '#6A0DAD',
    backgroundColor: '#F5F0FA',
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roomDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  roomPrice: {
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 50,
  },
  seatButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6A0DAD',
  },
  seatsCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  dateArrow: {
    marginHorizontal: 10,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#6A0DAD',
    backgroundColor: '#F5F0FA',
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  summaryContainer: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotal: {
    fontSize: 18,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#6A0DAD',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dateOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dateOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  modalCloseText: {
    color: '#6A0DAD',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReservationScreen;