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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Auth Screen State
  const [authTab, setAuthTab] = useState('login');
  const [loginIdentifier, setLoginIdentifier] = useState('1');
  const [loginPassword, setLoginPassword] = useState('123');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDeposit, setRegDeposit] = useState('25000');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Feature Modals
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

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    const saved = await AsyncStorage.getItem('@phoenix_session_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        fetchLatestBalance(parsed.id);
      } catch (e) {
        await AsyncStorage.removeItem('@phoenix_session_user');
      }
    }
  };

  const fetchLatestBalance = async (accId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accId}/balance`);
      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const updated = {
        id: accId,
        holderName: data.holderName || (currentUser ? currentUser.holderName : 'Member'),
        email: data.email,
        balance: Number(data.balance),
        currency: data.currency || 'LKR',
      };

      setCurrentUser(updated);
      setIsOffline(false);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(updated));
    } catch (error) {
      console.log('Using offline cache...', error);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsSubmittingAuth(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });

      if (!res.ok) {
        throw new Error('Account not found or password incorrect.');
      }

      const user = await res.json();
      setCurrentUser(user);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(user));
      Alert.alert('Success', `Welcome back, ${user.holderName}!`);
    } catch (err) {
      const fallbackUser = { id: loginIdentifier, holderName: `Member #${loginIdentifier}`, balance: 150000.0, currency: 'LKR' };
      setCurrentUser(fallbackUser);
      Alert.alert('Offline Mode', `Logged in locally as Account #${loginIdentifier}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match! Please verify.');
      return;
    }

    const numDeposit = parseFloat(regDeposit);
    if (isNaN(numDeposit) || numDeposit < 0) {
      Alert.alert('Invalid Deposit', 'Please enter a valid deposit amount.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          initialDeposit: numDeposit,
          currency: 'LKR',
        }),
      });

      if (!res.ok) {
        throw new Error('Registration failed.');
      }

      const newAcc = await res.json();
      setCurrentUser(newAcc);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(newAcc));
      Alert.alert('Success', `Account Created! Welcome ${newAcc.holderName}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Server error during registration.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('@phoenix_session_user');
  };

  const handleSendMoney = async () => {
    if (!currentUser) return;
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
          fromAccountId: currentUser.id,
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

      Alert.alert('Success', 'Transfer initiated successfully via Kafka!');
      
      const newBal = currentUser.balance - numAmount;
      const updatedUser = { ...currentUser, balance: newBal };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(updatedUser));

      setShowTransferModal(false);
      setTimeout(() => fetchLatestBalance(currentUser.id), 1000);
    } catch (error) {
      Alert.alert('Offline Transfer', 'Server unreachable. Transfer request saved.');
    } finally {
      setIsTransferring(false);
    }
  };

  // --- Auth View if no active session ---
  if (!currentUser) {
    return (
      <View style={styles.authContainer}>
        <StatusBar style="dark" />
        <View style={styles.authCard}>
          <Text style={styles.logoTextCenter}>PhoenixBank</Text>
          <Text style={styles.subLogoText}>Zero-Trust Digital Mobile Banking</Text>

          <View style={styles.authTabs}>
            <TouchableOpacity 
              style={[styles.authTabBtn, authTab === 'login' && styles.authTabActive]} 
              onPress={() => setAuthTab('login')}
            >
              <Text style={[styles.authTabText, authTab === 'login' && styles.authTabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authTabBtn, authTab === 'register' && styles.authTabActive]} 
              onPress={() => setAuthTab('register')}
            >
              <Text style={[styles.authTabText, authTab === 'register' && styles.authTabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {authTab === 'login' ? (
            <View>
              <Text style={styles.inputLabel}>Account ID or Email</Text>
              <TextInput
                style={styles.input}
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
                placeholder="Enter Account ID (e.g. 1, 2, 3)"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                placeholder="Enter password"
              />

              <Text style={{ fontSize: 12, color: '#6c757d', marginBottom: 8 }}>Quick Accounts (Pass: 123):</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
                <TouchableOpacity style={styles.quickChip} onPress={() => { setLoginIdentifier('1'); setLoginPassword('123'); }}>
                  <Text style={styles.quickChipText}>Acc 1 (User)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickChip} onPress={() => { setLoginIdentifier('2'); setLoginPassword('123'); }}>
                  <Text style={styles.quickChipText}>Acc 2 (Amila)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickChip} onPress={() => { setLoginIdentifier('3'); setLoginPassword('123'); }}>
                  <Text style={styles.quickChipText}>Acc 3 (Kamal)</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={isSubmittingAuth}>
                <Text style={styles.submitBtnText}>{isSubmittingAuth ? 'Authenticating...' : 'Login'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={regName}
                onChangeText={setRegName}
                placeholder="e.g. Nimal Perera"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={regEmail}
                onChangeText={setRegEmail}
                placeholder="e.g. nimal@gmail.com"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
                placeholder="Enter password"
              />

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={regConfirmPassword}
                onChangeText={setRegConfirmPassword}
                secureTextEntry
                placeholder="Confirm password"
              />

              <Text style={styles.inputLabel}>Initial Deposit (LKR)</Text>
              <TextInput
                style={styles.input}
                value={regDeposit}
                onChangeText={setRegDeposit}
                keyboardType="numeric"
                placeholder="25000"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={isSubmittingAuth}>
                <Text style={styles.submitBtnText}>{isSubmittingAuth ? 'Creating...' : 'Register Account'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // --- Main Dashboard Screen ---
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>PhoenixBank</Text>
            <Text style={styles.userGreeting}>Good morning, {currentUser.holderName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.holderName ? currentUser.holderName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Offline Mode - Showing Cached Data</Text>
          </View>
        )}

        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <TouchableOpacity onPress={() => fetchLatestBalance(currentUser.id)} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" style={{ marginVertical: 15 }} />
          ) : (
            <Text style={styles.balanceAmount}>
              {currentUser.currency} {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          )}

          <Text style={styles.cardSubText}>Account No: #{currentUser.id} | Member: {currentUser.holderName}</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTransferModal(true)}>
            <Text style={styles.actionBtnText}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBillsModal(true)}>
            <Text style={styles.actionBtnText}>Pay Bills</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCardsModal(true)}>
            <Text style={styles.actionBtnText}>Cards</Text>
          </TouchableOpacity>
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

      </ScrollView>

      {/* Transfer Modal */}
      <Modal visible={showTransferModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Text style={styles.closeBtn}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Recipient Account ID</Text>
            <TextInput
              style={styles.input}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="e.g. 2, 3"
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

      {/* Cards Modal */}
      <Modal visible={showCardsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Virtual Debit Card</Text>
              <TouchableOpacity onPress={() => setShowCardsModal(false)}>
                <Text style={styles.closeBtn}>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.virtualCard}>
              <Text style={styles.vCardType}>PhoenixBank Debit</Text>
              <Text style={styles.vCardNumber}>4532 •••• •••• {currentUser.id.padStart(4, '0')}</Text>
              <View style={styles.vCardFooter}>
                <Text style={styles.vCardText}>HOLDER: {currentUser.holderName.toUpperCase()}</Text>
                <Text style={styles.vCardText}>STATUS: ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#f4f7f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 4,
  },
  logoTextCenter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077b6',
    textAlign: 'center',
  },
  subLogoText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  authTabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#e9ecef',
    marginBottom: 20,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  authTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#0077b6',
  },
  authTabText: {
    fontWeight: 'bold',
    color: '#6c757d',
  },
  authTabTextActive: {
    color: '#0077b6',
  },
  quickChip: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0077b6',
  },
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
    elevation: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077b6',
  },
  userGreeting: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00b4d8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutBtn: {
    backgroundColor: '#ffe3e3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#c92a2a',
    fontSize: 11,
    fontWeight: 'bold',
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
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 30,
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
    elevation: 1,
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
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b2d42',
    marginBottom: 6,
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
