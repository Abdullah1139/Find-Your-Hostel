import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LandingPage from '../screens/LandingPage';
import Registration from '../screens/Registration';
import Login from '../screens/Login';
import HomePage from '../screens/HomePage';
import AdminDashboard from '../screens/AdminDashboard';
import AddHostel from '../screens/AddHostel';
import SearchHostel from '../screens/SearchHostel';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="LandingPage" >
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
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ title: 'Home' }} 
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{  title: 'Admin' }} 
        />
          <Stack.Screen 
          name="AddHostel" 
          component={AddHostel} 
          options={{ title: 'Add Hostel' }} 
        />
         <Stack.Screen 
          name="SearchHostel" 
          component={SearchHostel} 
          options={{ title: 'Add Hostel' }} 
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;
