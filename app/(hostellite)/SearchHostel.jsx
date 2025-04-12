import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';

const SearchHostel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const navigation = useNavigation();

  // Common amenities to filter by
  const amenitiesList = [
    'AC',
    'WiFi',
    'Gas',
    'Laundry',
    'Geyser',
    'Parking',
    'Kitchen',
    'Security'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) {
        Alert.alert('Error', 'Please login to view hostels');
        navigation.navigate('Login');
        return;
      }
      setToken(storedToken);
      await fetchHostels(storedToken);
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async (authToken) => {
    try {
      const response = await fetch(`${BASE_URL}/hostels/all`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHostels(token);
    setRefreshing(false);
  };

  const handleReserve = (hostel) => {
    navigation.navigate('Reservation', { hostel });
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenity)) {
        return prev.filter(a => a !== amenity);
      } else {
        return [...prev, amenity];
      }
    });
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedAmenities([]);
  };

  const filteredHostels = hostels.filter((hostel) => {
    // Search filter
    const matchesSearch = 
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price filter
    const matchesPrice = 
      hostel.price >= priceRange[0] && 
      hostel.price <= priceRange[1];
    
    // Amenities filter
    const matchesAmenities = 
      selectedAmenities.length === 0 ||
      (hostel.amenities && 
       selectedAmenities.every(amenity => 
         hostel.amenities.includes(amenity)));
    
    return matchesSearch && matchesPrice && matchesAmenities;
  });

  const renderHostelCard = ({ item }) => (
    <View style={styles.card}>
      {item.images?.[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.hostelName}>{item.name}</Text>
        <Text style={styles.hostelAddress}>{item.location}</Text>
        <Text style={styles.priceRange}>Price: {item.price} PKR/month</Text>
        <Text style={styles.availability}>
          {item.availability ? 'Available' : 'Fully Booked'}
        </Text>
        
        {item.amenities && (
          <Text style={styles.amenities}>
            Amenities: {item.amenities.join(', ')}
          </Text>
        )}

        <TouchableOpacity 
          style={[
            styles.reserveButton,
            !item.availability && styles.disabledButton
          ]}
          onPress={() => handleReserve(item)}
          disabled={!item.availability}
        >
          <Text style={styles.reserveButtonText}>
            {item.availability ? 'Reserve Now' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#333" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hostels by name or location..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Feather name="filter" size={20} color="#6A0DAD" />
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Hostels</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Feather name="x" size={24} color="#6A0DAD" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Price Range (PKR)</Text>
              <View style={styles.priceRangeContainer}>
                <TextInput
                  style={styles.priceInput}
                  value={priceRange[0].toString()}
                  onChangeText={(text) => setPriceRange([parseInt(text) || 0, priceRange[1]])}
                  keyboardType="numeric"
                />
                <Text style={styles.priceRangeSeparator}>to</Text>
                <TextInput
                  style={styles.priceInput}
                  value={priceRange[1].toString()}
                  onChangeText={(text) => setPriceRange([priceRange[0], parseInt(text) || 50000])}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Amenities Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Amenities</Text>
              {amenitiesList.map((amenity) => (
                  <View key={amenity} style={styles.checkboxContainer}>
                    <Checkbox
                      value={selectedAmenities.includes(amenity)}
                      onValueChange={() => toggleAmenity(amenity)}
                      color={selectedAmenities.includes(amenity) ? '#6A0DAD' : undefined}
                    />
                    <Text style={styles.checkboxLabel}>{amenity}</Text>
                  </View>
                ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hostel List */}
      <FlatList
        data={filteredHostels}
        renderItem={renderHostelCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noResultsText}>No hostels found matching your criteria</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6A0DAD']}
          />
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A0DAD',
    marginBottom: 5,
  },
  hostelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 5,
  },
  availability: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  amenities: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  reserveButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  reserveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  modalContent: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    width: 100,
    textAlign: 'center',
  },
  priceRangeSeparator: {
    marginHorizontal: 10,
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  resetButton: {
    backgroundColor: '#EEE',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#6A0DAD',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  
});

export default SearchHostel;