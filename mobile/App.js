import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState('LKR');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // IMPORTANT: If running on a physical phone via Expo Go, replace "localhost"
  // with your computer's local IP address (e.g., 192.168.1.100).
  // "localhost" only works if running via Web browser (npm run web) or an Android Emulator.
  const API_URL = 'http://localhost:8000/api/accounts/1/balance';

  const fetchBalance = async () => {
    setLoading(true);
    try {
      // Attempt to fetch from Kong API Gateway
      const response = await fetch(API_URL);
      if (!response.ok) {
        if (response.status === 429) {
          Alert.alert("Rate Limit", "Too many requests. Please wait.");
        }
        throw new Error('Server error');
      }
      
      const data = await response.json();
      setBalance(data.balance);
      setCurrency(data.currency);
      setIsOffline(false);

      // Cache the latest balance for offline use
      await AsyncStorage.setItem('@cached_balance', JSON.stringify(data.balance));
      await AsyncStorage.setItem('@cached_currency', data.currency);

    } catch (error) {
      // Network failed! Fallback to Offline Mode
      console.log('Network request failed, falling back to offline cache...', error);
      setIsOffline(true);
      
      const cachedBalance = await AsyncStorage.getItem('@cached_balance');
      const cachedCurrency = await AsyncStorage.getItem('@cached_currency');
      
      if (cachedBalance !== null) {
        setBalance(JSON.parse(cachedBalance));
        setCurrency(cachedCurrency || 'LKR');
      } else {
        Alert.alert("Offline", "No internet connection and no cached data available.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PhoenixBank Mobile</Text>
      
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Offline Mode - Showing Cached Data</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Balance</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0052CC" />
        ) : (
          <Text style={styles.balance}>
            {balance !== null ? `${currency} ${balance.toLocaleString()}` : '---'}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={fetchBalance}>
        <Text style={styles.buttonText}>Refresh Balance</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0052CC',
    marginBottom: 20,
  },
  offlineBanner: {
    backgroundColor: '#FF9800',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  button: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
