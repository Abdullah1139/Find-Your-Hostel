import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer, DrawerActions, CommonActions } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all screens
import LandingPage from '../screens/LandingPage';
import Registration from '../screens/Registration';
import Login from '../screens/Login';
import HomePage from '../screens/HomePage';
import AdminDashboard from '../screens/AdminDashboard';
import AddHostel from '../screens/AddHostel';
import SearchHostel from '../(hostellite)/SearchHostel';
import ReservationScreen from "../(hostellite)/ReservationScreen";
import MyBookingScreen from "../(hostellite)/MyBookingScreen";
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingScreen';
import HostelDetail from '../screens/HostelDetails';
import { logout } from '../../src/redux/authSlice';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const role = useSelector((state) => state.auth.role) || 'Hostellite';
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      // Dispatch logout action
      dispatch(logout());
      // Reset navigation stack and go to Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#6A0DAD' }}>
          Welcome, {role}!
        </Text>
      </View>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Home')}>
        <Text>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Profile')}>
        <Text>Profile</Text>
      </TouchableOpacity>

      {role === 'Hosteller' && (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AddHostel')}>
          <Text>Add Hostel</Text>
        </TouchableOpacity>
      )}

      {role === 'Hostellite' && (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('SearchHostel')}>
          <Text>Search Hostels</Text>
        </TouchableOpacity>
      )}

      {role === 'Admin' && (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text>Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      {role === 'Hostellite' && (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('MyBookings')}>
          <Text>Your Bookings</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={styles.item} 
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#6A0DAD" />
        ) : (
          <Text>Logout</Text>
        )}
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = {
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
};

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#6A0DAD',
        headerTitleAlign: 'center',
        drawerType: 'slide',
        drawerStyle: {
          width: '70%',
          backgroundColor: '#f8f9fa',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color="#6A0DAD" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="AddHostel" component={AddHostel} />
      <Drawer.Screen name="SearchHostel" component={SearchHostel} />
      <Drawer.Screen name="AdminDashboard" component={AdminDashboard} />
      <Drawer.Screen name="MyBookings" component={MyBookingScreen} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const token = useSelector((state) => state.auth.token);

  return (
    <Stack.Navigator>
      {!token ? (
        <>
          <Stack.Screen
            name="LandingPage"
            component={LandingPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Registration"
            component={Registration}
            options={{ title: 'Register' }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Login' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="AppDrawer"
            component={AppDrawer}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="HostelDetail" component={HostelDetail} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;