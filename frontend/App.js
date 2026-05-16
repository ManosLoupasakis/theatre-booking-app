import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { getStoredUser } from './services/api';

import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen     from './screens/HomeScreen';
import ShowsScreen    from './screens/ShowsScreen';
import ShowtimesScreen from './screens/ShowtimesScreen';
import SeatsScreen    from './screens/SeatsScreen';
import ProfileScreen  from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NAV_THEME = {
  headerStyle:      { backgroundColor: '#0d1f3c' },
  headerTintColor:  '#ffd700',
  headerTitleStyle: { fontWeight: 'bold', color: '#ffd700' },
};

// Stack navigator για το tab "Θέατρα"
function TheatresStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={NAV_THEME}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Θέατρα' }} />
      <Stack.Screen name="Shows" component={ShowsScreen} options={({ route }) => ({ title: route.params.theatre.name })} />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} options={({ route }) => ({ title: route.params.show.title })} />
      <Stack.Screen name="Seats" component={SeatsScreen} options={{ title: 'Επιλογή Θέσεων' }} />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator (μετά τη σύνδεση)
function MainTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#ffd700',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#0d1f3c', borderTopColor: '#ffd700', borderTopWidth: 1 },
        tabBarIcon: ({ color }) => {
          const icons = { Theatres: '🎭', Profile: '👤' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Theatres" options={{ title: 'Θέατρα' }}>
        {() => <TheatresStack onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: 'Προφίλ' }}>
        {() => (
          <Stack.Navigator screenOptions={NAV_THEME}>
            <Stack.Screen name="ProfileMain" options={{ title: 'Το Προφίλ μου' }}>
              {() => <ProfileScreen user={user} onLogout={onLogout} />}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Auth stack (Login / Register)
function AuthStack({ onLogin }) {
  return (
    <Stack.Navigator screenOptions={{ ...NAV_THEME, headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1f3c' }}>
        <ActivityIndicator size="large" color="#ffd700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user
          ? <MainTabs user={user} onLogout={() => setUser(null)} />
          : <AuthStack onLogin={setUser} />
        }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
