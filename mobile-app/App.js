import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';

// Navigator
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Global Luxury Background Blobs - Vibrant colors to make glassmorphism pop */}
        <View style={{ position: 'absolute', width: 600, height: 600, borderRadius: 300, backgroundColor: '#3B82F6', top: -150, left: -150, opacity: 0.15 }} />
        <View style={{ position: 'absolute', width: 500, height: 500, borderRadius: 250, backgroundColor: '#10B981', bottom: -100, right: -150, opacity: 0.12 }} />
        <View style={{ position: 'absolute', width: 450, height: 450, borderRadius: 225, backgroundColor: '#6366F1', top: '25%', right: -150, opacity: 0.1 }} />
        <View style={{ position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#EC4899', top: '55%', left: -150, opacity: 0.08 }} />

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NavigationContainer>
                <StatusBar style="dark" backgroundColor="transparent" translucent />
                <RootNavigator />
              </NavigationContainer>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
