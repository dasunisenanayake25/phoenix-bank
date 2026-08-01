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
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Auth Screen State
  const [authTab, setAuthTab] = useState('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Feature Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);

  // Transfer Form State
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Favorites
  const [savedContacts, setSavedContacts] = useState([
    { id: '2', name: 'Amila' },
    { id: '3', name: 'Kamal' },
    { id: '4', name: 'Nimal' },
  ]);

  // Transactions State
  const [transactions, setTransactions] = useState([
    { id: '1', title: 'Salary Deposit', time: 'Today, 09:00 AM', amount: 150000, type: 'income' },
    { id: '2', title: 'Supermarket Bill', time: 'Yesterday, 18:30 PM', amount: 8450, type: 'expense' },
    { id: '3', title: 'Electricity Bill', time: '28 Jul, 10:15 AM', amount: 5200, type: 'expense' },
  ]);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    // SECURITY: Prevent screen recording and screenshots on Android/iOS (Proposal Req)
    const preventCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (e) {
        console.warn("Screen capture prevention failed on this simulator.");
      }
    };
    preventCapture();
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

  const authenticateBiometrics = async (promptMessage) => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to proceed',
        fallbackLabel: 'Use Passcode',
      });
      return result.success;
    }
    // If no biometrics set up, we let them proceed on simulator, 
    // but in production this would force a PIN setup.
    return true; 
  };

  const fetchLatestBalance = async (accId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accId}/balance`);
      if (!response.ok) throw new Error('Server error');

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

      if (!res.ok) throw new Error('Account not found or password incorrect.');
      
      const authSuccess = await authenticateBiometrics('Login to PhoenixBank');
      if (!authSuccess) throw new Error('Biometric authentication failed.');

      const user = await res.json();
      setCurrentUser(user);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(user));
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async () => {
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
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
          currency: 'LKR',
        }),
      });
      if (!res.ok) throw new Error('Registration failed.');
      
      const newAcc = await res.json();
      setCurrentUser(newAcc);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(newAcc));
      Alert.alert('Success', `Account Created! Welcome ${newAcc.holderName}`);
    } catch (err) {
      Alert.alert('Error', err.message);
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

    // Require Fingerprint to authorize transactions (Zero-Trust)
    const authSuccess = await authenticateBiometrics('Authorize Transfer of LKR ' + numAmount);
    if (!authSuccess) {
      Alert.alert('Cancelled', 'Transfer not authorized.');
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

      if (!response.ok) throw new Error('Transfer request failed.');

      const newTx = {
        id: Date.now().toString(),
        title: `Transfer to ${recipientName || 'Acc ' + recipient}`,
        time: 'Just now',
        amount: numAmount,
        type: 'expense',
      };
      setTransactions((prev) => [newTx, ...prev]);

      Alert.alert('Success', 'Transfer successful!');
      
      const newBal = currentUser.balance - numAmount;
      const updatedUser = { ...currentUser, balance: newBal };
      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('@phoenix_session_user', JSON.stringify(updatedUser));

      setShowTransferModal(false);
      setAmount('');
      setTimeout(() => fetchLatestBalance(currentUser.id), 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect. Try again later.');
    } finally {
      setIsTransferring(false);
    }
  };

  // --- Landing Page View if no active session ---
  if (!currentUser) {
    return (
      <View style={styles.lpContainer}>
        <StatusBar style="light" />
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.lpHeader}>
          <Text style={styles.lpTitle}>PhoenixBank</Text>
          <Text style={styles.lpHeroText}>Achieve Financial Success & Security</Text>
          <Text style={styles.lpHeroSub}>Experience the next generation of banking with our Zero-Trust architecture.</Text>
          <TouchableOpacity style={styles.lpBtn} onPress={() => setShowAuthModal(true)}>
            <Text style={styles.lpBtnText}>Access Account</Text>
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView style={styles.lpBody} showsVerticalScrollIndicator={false}>
          <View style={styles.lpCard}>
            <View style={styles.lpCardIconBox}><Text style={styles.lpCardIcon}>M</Text></View>
            <Text style={styles.lpCardTitle}>Microservices</Text>
            <Text style={styles.lpCardDesc}>Event-driven architecture using Kafka for high-throughput, decoupled inter-service communication.</Text>
          </View>
          <View style={styles.lpCard}>
            <View style={styles.lpCardIconBox}><Text style={styles.lpCardIcon}>AI</Text></View>
            <Text style={styles.lpCardTitle}>AI Fraud Detection</Text>
            <Text style={styles.lpCardDesc}>Real-time anomaly detection instantly flagging suspicious transactions.</Text>
          </View>
          <View style={styles.lpCard}>
            <View style={styles.lpCardIconBox}><Text style={styles.lpCardIcon}>Z</Text></View>
            <Text style={styles.lpCardTitle}>Zero-Trust Vault</Text>
            <Text style={styles.lpCardDesc}>Advanced key management featuring Shamir's Secret Sharing and HashiCorp Vault.</Text>
          </View>
        </ScrollView>

        <Modal visible={showAuthModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Security Gateway</Text>
                <TouchableOpacity onPress={() => setShowAuthModal(false)}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.authTabs}>
                <TouchableOpacity style={[styles.authTabBtn, authTab === 'login' && styles.authTabActive]} onPress={() => setAuthTab('login')}>
                  <Text style={[styles.authTabText, authTab === 'login' && styles.authTabTextActive]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.authTabBtn, authTab === 'register' && styles.authTabActive]} onPress={() => setAuthTab('register')}>
                  <Text style={[styles.authTabText, authTab === 'register' && styles.authTabTextActive]}>Register</Text>
                </TouchableOpacity>
              </View>

              {authTab === 'login' ? (
                <View>
                  <Text style={styles.inputLabel}>Account ID or Email</Text>
                  <TextInput style={styles.input} value={loginIdentifier} onChangeText={setLoginIdentifier} />
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput style={styles.input} value={loginPassword} onChangeText={setLoginPassword} secureTextEntry />
                  <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={isSubmittingAuth}>
                    <Text style={styles.submitBtnText}>{isSubmittingAuth ? 'Authenticating...' : 'Login securely'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput style={styles.input} value={regName} onChangeText={setRegName} />
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput style={styles.input} value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" />
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput style={styles.input} value={regPassword} onChangeText={setRegPassword} secureTextEntry />
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput style={styles.input} value={regConfirmPassword} onChangeText={setRegConfirmPassword} secureTextEntry />
                  <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={isSubmittingAuth}>
                    <Text style={styles.submitBtnText}>{isSubmittingAuth ? 'Creating...' : 'Open Account'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // --- Main Dashboard Screen ---
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>PhoenixBank</Text>
          <Text style={styles.userGreeting}>Welcome back, {currentUser.holderName}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.holderName.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Offline Mode - Cached Data</Text>
          </View>
        )}

        {/* Balance Card */}
        <LinearGradient colors={['#0056b3', '#007bff']} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <TouchableOpacity onPress={() => fetchLatestBalance(currentUser.id)} style={styles.refreshBtn}>
              <Text style={styles.refreshBtnText}>{loading ? '...' : 'Refresh'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {currentUser.currency} {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.cardSubText}>Account No: #{currentUser.id}</Text>
        </LinearGradient>

        {/* Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTransferModal(true)}>
            <View style={styles.actionIcon}><Text style={styles.emoji}>Tr</Text></View>
            <Text style={styles.actionBtnText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBillsModal(true)}>
            <View style={styles.actionIcon}><Text style={styles.emoji}>Bi</Text></View>
            <Text style={styles.actionBtnText}>Pay Bills</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.actionIcon}><Text style={styles.emoji}>Sc</Text></View>
            <Text style={styles.actionBtnText}>Scan Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCardsModal(true)}>
            <View style={styles.actionIcon}><Text style={styles.emoji}>Wa</Text></View>
            <Text style={styles.actionBtnText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Favorites */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorite Transfers</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
          <TouchableOpacity style={styles.favoriteItem} onPress={() => { setRecipient(''); setShowTransferModal(true); }}>
            <View style={[styles.favAvatar, { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1' }]}>
              <Text style={[styles.favAvatarText, { color: '#0056b3' }]}>+</Text>
            </View>
            <Text style={styles.favoriteName}>Add New</Text>
          </TouchableOpacity>
          {savedContacts.map((contact) => (
            <TouchableOpacity 
              key={contact.id} 
              style={styles.favoriteItem} 
              onPress={() => { setRecipient(contact.id); setRecipientName(contact.name); setShowTransferModal(true); }}
            >
              <View style={styles.favAvatar}>
                <Text style={styles.favAvatarText}>{contact.name.charAt(0)}</Text>
              </View>
              <Text style={styles.favoriteName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionLink}>History</Text>
        </View>
        <View style={styles.sectionCard}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={[styles.txIconBox, tx.type === 'income' ? styles.txIconIncome : styles.txIconExpense]}>
                  <Text style={[tx.type === 'income' ? styles.txPositive : styles.txNegative]}>
                    {tx.type === 'income' ? '↓' : '↑'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
              </View>
              <Text style={[styles.txAmount, tx.type === 'income' ? styles.txPositive : styles.txNegative]}>
                {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()}
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
              <Text style={styles.modalTitle}>Fund Transfer</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Recipient Account ID</Text>
            <TextInput style={styles.input} value={recipient} onChangeText={setRecipient} placeholder="e.g. 2, 3" />

            <Text style={styles.inputLabel}>Amount (LKR)</Text>
            <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" />

            <TouchableOpacity style={[styles.submitBtn, isTransferring && { opacity: 0.7 }]} onPress={handleSendMoney} disabled={isTransferring}>
              <Text style={styles.submitBtnText}>{isTransferring ? 'Processing...' : 'Transfer Now'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bills Modal */}
      <Modal visible={showBillsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay Bills</Text>
              <TouchableOpacity onPress={() => setShowBillsModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.billOpt}><Text style={styles.billOptText}>Electricity Board</Text></TouchableOpacity>
            <TouchableOpacity style={styles.billOpt}><Text style={styles.billOptText}>Water Board</Text></TouchableOpacity>
            <TouchableOpacity style={styles.billOpt}><Text style={styles.billOptText}>Mobile Reload</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cards Modal */}
      <Modal visible={showCardsModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Virtual Wallet</Text>
              <TouchableOpacity onPress={() => setShowCardsModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={styles.virtualCard}>
              <Text style={styles.vCardType}>Phoenix Debit</Text>
              <Text style={styles.vCardNumber}>4532 •••• •••• {currentUser.id.padStart(4, '0')}</Text>
              <View style={styles.vCardFooter}>
                <Text style={styles.vCardText}>{currentUser.holderName.toUpperCase()}</Text>
                <Text style={styles.vCardText}>ACTIVE</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Global & Landing Page
  lpContainer: { flex: 1, backgroundColor: '#f8fafc' },
  lpHeader: { padding: 30, paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  lpTitle: { color: '#fbbf24', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  lpHeroText: { color: '#fff', fontSize: 32, fontWeight: 'bold', lineHeight: 40, marginBottom: 10 },
  lpHeroSub: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, marginBottom: 30 },
  lpBtn: { backgroundColor: '#d97706', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  lpBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  lpBody: { padding: 20 },
  lpCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 20, elevation: 4, borderTopWidth: 4, borderTopColor: '#d97706' },
  lpCardIconBox: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  lpCardIcon: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  lpCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  lpCardDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },

  logoTextCenter: { fontSize: 24, fontWeight: '800', color: '#0056b3' },
  subLogoText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  authTabs: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#eaf3ff', marginBottom: 20 },
  authTabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  authTabActive: { borderBottomWidth: 3, borderBottomColor: '#0056b3', marginBottom: -2 },
  authTabText: { fontWeight: '600', color: '#6b7280' },
  authTabTextActive: { color: '#0056b3' },
  
  // Dashboard Core
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff', elevation: 2, zIndex: 10 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#0056b3' },
  userGreeting: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eaf3ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0056b3', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutBtnText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  container: { padding: 20 },
  
  // Cards & Layouts
  balanceCard: { borderRadius: 24, padding: 24, elevation: 6, marginBottom: 24, overflow: 'hidden' },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  balanceLabel: { color: '#fff', fontSize: 12, fontWeight: '700', opacity: 0.9, letterSpacing: 1 },
  refreshBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  refreshBtnText: { color: '#fff', fontSize: 11 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 12 },
  cardSubText: { color: '#fff', fontSize: 12, opacity: 0.9 },
  
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4, elevation: 2 },
  actionIcon: { width: 44, height: 44, backgroundColor: '#eaf3ff', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emoji: { fontSize: 20 },
  actionBtnText: { color: '#1f2937', fontWeight: '600', fontSize: 11 },
  
  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  sectionLink: { fontSize: 12, color: '#0056b3', fontWeight: '600' },
  
  // Favorites
  favoritesScroll: { paddingBottom: 10, marginBottom: 16 },
  favoriteItem: { backgroundColor: '#fff', padding: 12, borderRadius: 16, alignItems: 'center', marginRight: 16, minWidth: 80, elevation: 2 },
  favAvatar: { width: 44, height: 44, backgroundColor: '#0056b3', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  favAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  favoriteName: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  
  // Transactions
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, marginBottom: 30 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  txIconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txIconIncome: { backgroundColor: '#d1fae5' },
  txIconExpense: { backgroundColor: '#ffe4e6' },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  txTime: { fontSize: 11, color: '#6b7280' },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txPositive: { color: '#10b981' },
  txNegative: { color: '#ef4444' },
  
  // Modals & Inputs
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  closeBtn: { fontSize: 18, color: '#6b7280', fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e9ecef', borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 16 },
  submitBtn: { backgroundColor: '#0056b3', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  
  billOpt: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e9ecef', marginBottom: 12 },
  billOptText: { fontWeight: '600', color: '#1f2937' },
  
  virtualCard: { borderRadius: 20, padding: 24 },
  vCardType: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  vCardNumber: { color: '#fff', fontSize: 20, letterSpacing: 4, marginVertical: 24 },
  vCardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  vCardText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  offlineBanner: { backgroundColor: '#ff922b', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  offlineText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
