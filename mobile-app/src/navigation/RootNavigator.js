import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, ShoppingCart, ListOrdered, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

// Auth
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Screens — Auth Flow
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Screens — Main App
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Screens — Detail / Modal
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  PrimaryBlue: '#4285F4',
  PrimaryGreen: '#34A853',
  DarkBackground: '#0F172A',
  CardBackground: '#1E293B',
  TextPrimary: '#FFFFFF',
  TextSecondary: '#94A3B8',
};

// ─── Cart Badge ───────────────────────────────────────────────
function CartTabIcon({ color }) {
  const { totalItems } = useCart();
  return (
    <View>
      <ShoppingCart size={24} color={color} />
      {totalItems > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -8,
            backgroundColor: COLORS.PrimaryBlue,
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {totalItems > 99 ? '99+' : totalItems}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.CardBackground,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.PrimaryBlue,
        tabBarInactiveTintColor: COLORS.TextSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => <CartTabIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ color }) => <ListOrdered size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.DarkBackground },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// ─── App Stack (authenticated) ────────────────────────────────
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.DarkBackground },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ gestureEnabled: false }} // Prevent swiping back after order
      />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────
export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showSplash) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash">
          {(props) => (
            <SplashScreen
              {...props}
              onFinish={() => setShowSplash(false)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated && showOnboarding) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onFinish={() => setShowOnboarding(false)}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
