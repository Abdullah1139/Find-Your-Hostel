import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';

// Define the type for user data
interface User {
  _id?: string;
  name?: string;
  email?: string;
}

const AdminDashboard: React.FC = () => {
  // State variables with type annotations
  const [hostellers, setHostellers] = useState<User[]>([]);
  const [hostellites, setHostellites] = useState<User[]>([]);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/all-users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        setHostellers(result.data.hostellers || []);
        setHostellites(result.data.hostellites || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch users.');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'An error occurred while fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Render each user with type annotation
  const renderUser = ({ item }: { item: User }) => {
    <View style={styles.userRow}>
      <Text style={styles.userName}>{item.name || 'N/A'}</Text>
      <Text style={styles.userEmail}>{item.email || 'N/A'}</Text>
    </View>
  }
   

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>

      <Text style={styles.subHeading}>Hostellers</Text>
      <FlatList
        data={hostellers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id || item.email || Math.random().toString()} // Ensure a fallback for key
        style={styles.list}
      />

      <Text style={styles.subHeading}>Hostellites</Text>
      <FlatList
        data={hostellites}
        renderItem={renderUser}
        keyExtractor={(item) => item._id || item.email || Math.random().toString()} // Ensure a fallback for key
        style={styles.list}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
    marginTop: 20,
  },
  list: {
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
});

export default AdminDashboard;
