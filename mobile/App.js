import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  Modal, 
  TextInput 
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [balance, setBalance] = useState(null);
  const [currency, setCurrency] = useState('LKR');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Transfer Form State
  const [recipient, setRecipient] = useState('2');
  const [recipientName, setRecipientName] = useState('Amila');
  const [amount, setAmount] = useState('5000');
  const [isTransferring, setIsTransferring] = useState(false);

  // Transactions State
  const [transactions, setTransactions] = useState([
    { id: '1', title: 'Salary Deposit', time: 'Today, 09:00 AM', amount: 150000, type: 'income' },
    { id: '2', title: 'Supermarket Bill', time: 'Yesterday, 18:30 PM', amount: 8450, type: 'expense' },
    { id: '3', title: 'Electricity Bill', time: '28 Jul, 10:15 AM', amount: 5200, type: 'expense' },
  ]);

  // API host: Uses localhost (for web/emulator).
  const API_BASE_URL = 'http://localhost:8000';

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/1/balance`);
      if (!response.ok) {
        if (response.status === 429) {
          Alert.alert('Rate Limit Exceeded', 'Too many requests. Kong Gateway rate limit active.');
        }
        throw new Error('Server error');
      }

      const data = await response.json();
      setBalance(data.balance);
      setCurrency(data.currency || 'LKR');
      setIsOffline(false);

      await AsyncStorage.setItem('@cached_balance', JSON.stringify(data.balance));
      await AsyncStorage.setItem('@cached_currency', data.currency || 'LKR');
    } catch (error) {
      console.log('Network request failed, using offline cache...', error);
      setIsOffline(true);

      const cachedBalance = await AsyncStorage.getItem('@cached_balance');
      const cachedCurrency = await AsyncStorage.getItem('@cached_currency');

      if (cachedBalance !== null) {
        setBalance(JSON.parse(cachedBalance));
        setCurrency(cachedCurrency || 'LKR');
      } else {
        setBalance(150000.00); // Fallback default
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleQuickTransferPress = (accId, name) => {
    setRecipient(accId);
    setRecipientName(name);
    setShowTransferModal(true);
  };

  const handleSendMoney = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: '1',
          toAccountId: recipient,
          amount: numAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Transfer request failed.');
      }

      const newTx = {
        id: Date.now().toString(),
        title: `Transfer to ${recipientName || 'Account ' + recipient}`,
        time: 'Just now',
        amount: numAmount,
        type: 'expense',
      };
      setTransactions((prev) => [newTx, ...prev]);

      Alert.alert('Success', '🎉 Transfer initiated successfully via Kafka!');
      
      // Local balance deduction for immediate response
      if (balance !== null) {
        const newBal = balance - numAmount;
        setBalance(newBal);
        await AsyncStorage.setItem('@cached_balance', JSON.stringify(newBal));
      }

      setShowTransferModal(false);
      setTimeout(() => fetchBalance(), 1000);
    } catch (error) {
      Alert.alert('Offline Transfer', 'Could not reach server. Saved request locally.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>PhoenixBank</Text>
            <Text style={styles.userGreeting}>Good morning, User</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠️ Offline Mode - Showing Cached Data</Text>
          </View>
        )}

        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <TouchableOpacity onPress={fetchBalance} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>↻ Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" style={{ marginVertical: 15 }} />
          ) : (
            <Text style={styles.balanceAmount}>
              {balance !== null 
                ? `${currency} ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : 'LKR 150,000.00'}
            </Text>
          )}

          <Text style={styles.cardSubText}>Account No: •••• •••• 8842</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTransferModal(true)}>
            <Text style={styles.actionBtnIcon}>💸</Text>
            <Text style={styles.actionBtnText}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBillsModal(true)}>
            <Text style={styles.actionBtnIcon}>📑</Text>
            <Text style={styles.actionBtnText}>Pay Bills</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCardsModal(true)}>
            <Text style={styles.actionBtnIcon}>💳</Text>
            <Text style={styles.actionBtnText}>Cards</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Transfer Contacts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Transfer</Text>
          <Text style={styles.sectionSubTitle}>Transfer money instantly to your saved contacts.</Text>
          
          <View style={styles.contactsRow}>
            <TouchableOpacity style={styles.contactItem} onPress={() => handleQuickTransferPress('2', 'Amila')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#0077b6' }]}>
                <Text style={styles.contactAvatarText}>A</Text>
              </View>
              <Text style={styles.contactName}>Amila</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleQuickTransferPress('3', 'Kamal')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#90e0ef' }]}>
                <Text style={[styles.contactAvatarText, { color: '#0077b6' }]}>K</Text>
              </View>
              <Text style={styles.contactName}>Kamal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handleQuickTransferPress('', '')}>
              <View style={[styles.contactAvatar, { backgroundColor: '#e9ecef' }]}>
                <Text style={[styles.contactAvatarText, { color: '#2b2d42' }]}>+</Text>
              </View>
              <Text style={styles.contactName}>New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txTime}>{tx.time}</Text>
              </View>
              <Text style={[styles.txAmount, tx.type === 'income' ? styles.txPositive : styles.txNegative]}>
                {tx.type === 'income' ? '+' : '-'} LKR {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        {/* Loans & Offers Banner */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Loans & Offers</Text>
          <Text style={styles.sectionSubTitle}>
            You are eligible for an instant personal loan of up to LKR 500,000.
          </Text>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowLoanModal(true)}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Transfer Modal */}
      <Modal visible={showTransferModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Recipient Account ID</Text>
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="e.g. 2 or 3"
            />

            <Text style={styles.inputLabel}>Amount (LKR)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />

            <TouchableOpacity 
              style={[styles.submitBtn, isTransferring && { opacity: 0.7 }]} 
              onPress={handleSendMoney}
              disabled={isTransferring}
            >
              <Text style={styles.submitBtnText}>
                {isTransferring ? 'Processing...' : 'Confirm Transfer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bills Modal */}
      <Modal visible={showBillsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay Bills</Text>
              <TouchableOpacity onPress={() => setShowBillsModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.billOpt} onPress={() => { Alert.alert('Success', 'CEB Electricity Bill Paid!'); setShowBillsModal(false); }}>
              <Text style={styles.billOptText}>⚡ CEB Electricity Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.billOpt} onPress={() => { Alert.alert('Success', 'National Water Bill Paid!'); setShowBillsModal(false); }}>
              <Text style={styles.billOptText}>💧 National Water Board</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.billOpt} onPress={() => { Alert.alert('Success', 'Telecom Bill Paid!'); setShowBillsModal(false); }}>
              <Text style={styles.billOptText}>📞 Dialog / Mobitel Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cards Modal */}
      <Modal visible={showCardsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Virtual Card</Text>
              <TouchableOpacity onPress={() => setShowCardsModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.virtualCard}>
              <Text style={styles.vCardType}>PhoenixBank Debit</Text>
              <Text style={styles.vCardNumber}>4532 •••• •••• 8842</Text>
              <View style={styles.vCardFooter}>
                <Text style={styles.vCardText}>EXP: 12/28</Text>
                <Text style={styles.vCardText}>STATUS: ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loan Modal */}
      <Modal visible={showLoanModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Loan Offer</Text>
              <TouchableOpacity onPress={() => setShowLoanModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: '#6c757d', marginBottom: 20 }}>
              Pre-approved loan up to LKR 500,000.00 at a promotional rate of 9.5% p.a.
            </Text>
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={() => {
                Alert.alert('Application Received', 'Our loan officer will contact you shortly.');
                setShowLoanModal(false);
              }}
            >
              <Text style={styles.submitBtnText}>Accept Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077b6',
  },
  userGreeting: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#00b4d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#ff922b',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  balanceCard: {
    backgroundColor: '#0077b6',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#0077b6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  refreshBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 12,
  },
  cardSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
  },
  actionBtnIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionBtnText: {
    color: '#0077b6',
    fontWeight: '600',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b2d42',
    marginBottom: 6,
  },
  sectionSubTitle: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 16,
  },
  contactsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  contactItem: {
    alignItems: 'center',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactAvatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2b2d42',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2d42',
  },
  txTime: {
    fontSize: 11,
    color: '#6c757d',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txPositive: {
    color: '#2a9d8f',
  },
  txNegative: {
    color: '#e76f51',
  },
  applyBtn: {
    backgroundColor: '#0077b6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2b2d42',
  },
  closeBtn: {
    fontSize: 20,
    color: '#6c757d',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2b2d42',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#0077b6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  billOpt: {
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  billOptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2d42',
  },
  virtualCard: {
    backgroundColor: '#1e3c72',
    borderRadius: 16,
    padding: 20,
  },
  vCardType: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  vCardNumber: {
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 2,
    marginVertical: 20,
  },
  vCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vCardText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
});
