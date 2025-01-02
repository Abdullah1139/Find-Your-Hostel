import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/Ionicons';

// interface User {
//   _id?: string;
//   name?: string;
//   email?: string;
// }

// Users Screen with Admin Dashboard Data
const UsersScreen: React.FC = () => {
  const [hostellers, setHostellers] = useState<User[]>([]);
  const [hostellites, setHostellites] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://192.168.1.9:5000/api/users/all-users', {
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

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <Text style={styles.userName}>{item.name || 'N/A'}</Text>
      <Text style={styles.userEmail}>{item.email || 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Users</Text>
      <Text style={styles.subHeading}>Hostellers</Text>
      <FlatList
        data={hostellers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id || item.email || Math.random().toString()}
        style={styles.list}
      />
      <Text style={styles.subHeading}>Hostellites</Text>
      <FlatList
        data={hostellites}
        renderItem={renderUser}
        keyExtractor={(item) => item._id || item.email || Math.random().toString()}
        style={styles.list}
      />
    </ScrollView>
  );
};

// Hostels Screen Placeholder
const HostelsScreen = () => (
  <View style={styles.center}>
    <Text style={styles.heading}>Hostels Screen</Text>
  </View>
);

// Settings Screen with Logout Button
const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            Alert.alert('Logged out successfully!');
            navigation.navigate('Login'); // Adjust this to your login screen route
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.center}>
      <Text style={styles.heading}>Settings</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#6A0DAD' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ccc',
          tabBarIcon: ({ color, size }) => {
            let iconName = '';
            if (route.name === 'Users') iconName = 'people-outline';
            else if (route.name === 'Hostels') iconName = 'home-outline';
            else if (route.name === 'Settings') iconName = 'settings-outline';
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Users" component={UsersScreen} />
        <Tab.Screen name="Hostels" component={HostelsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoutButton: {
    backgroundColor: '#6A0DAD',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
