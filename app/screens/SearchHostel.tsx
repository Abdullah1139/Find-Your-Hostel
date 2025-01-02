import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const SearchHostel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hostels, setHostels] = useState([
    {
      id: '1',
      name: 'Green Valley Hostel',
      address: '123 Main St, Near University A',
      priceRange: '5000-8000',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '2',
      name: 'Blue Sky Hostel',
      address: '456 Elm St, Near University B',
      priceRange: '4000-7000',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: '3',
      name: 'Sunrise Hostel',
      address: '789 Oak St, Near College C',
      priceRange: '6000-9000',
      image: 'https://via.placeholder.com/150',
    },
  ]);

  const filteredHostels = hostels.filter((hostel) =>
    hostel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHostelCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.hostelName}>{item.name}</Text>
        <Text style={styles.hostelAddress}>{item.address}</Text>
        <Text style={styles.priceRange}>Price: {item.priceRange} PKR</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#333" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hostels..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      <FlatList
        data={filteredHostels}
        renderItem={renderHostelCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      flexGrow: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#CCCCCC',
      borderRadius: 8,
      paddingHorizontal: 10,
      backgroundColor: '#F5F5F5',
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#333333',
    },
    list: {
      paddingBottom: 20,
    },
    card: {
      flexDirection: 'row',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#CCCCCC',
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      elevation: 3, // Shadow for Android
      shadowColor: '#000', // Shadow for iOS
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    image: {
      width: 100,
      height: 100,
    },
    cardContent: {
      flex: 1,
      padding: 10,
      justifyContent: 'center',
    },
    hostelName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#6A0DAD',
      marginBottom: 5,
    },
    hostelAddress: {
      fontSize: 14,
      color: '#555555',
      marginBottom: 5,
    },
    priceRange: {
      fontSize: 14,
      color: '#888888',
    },
  });
  
  export default SearchHostel;
  