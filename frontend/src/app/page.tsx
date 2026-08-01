"use client";

import { useEffect, useState } from "react";

interface MemberAccount {
  id: string;
  holderName: string;
  email?: string;
  balance: number;
  currency: string;
  status: string;
}

interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  type: "income" | "expense";
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<MemberAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth Screen state
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);

  // Transfer Form state
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Favorites
  const [savedContacts, setSavedContacts] = useState<{ id: string; name: string }[]>([
    { id: "2", name: "Amila" },
    { id: "3", name: "Kamal" },
    { id: "4", name: "Nimal" },
    { id: "5", name: "Saman" }
  ]);

  // Transactions list
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", title: "Salary Deposit", time: "Today, 09:00 AM", amount: 150000, type: "income" },
    { id: "2", title: "Supermarket Bill", time: "Yesterday, 18:30 PM", amount: 8450, type: "expense" },
    { id: "3", title: "Electricity Bill", time: "28 Jul, 10:15 AM", amount: 5200, type: "expense" },
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem("@phoenix_session_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        fetchLatestBalance(parsed.id);
      } catch (e) {
        localStorage.removeItem("@phoenix_session_user");
      }
    }
  }, []);

  const fetchLatestBalance = (accId: string) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/accounts/${accId}/balance`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch balance.");
        return res.json();
      })
      .then((data) => {
        const updated = {
          id: accId,
          holderName: data.holderName || (currentUser ? currentUser.holderName : "Member"),
          email: data.email,
          balance: Number(data.balance),
          currency: data.currency || "LKR",
          status: data.status || "ACTIVE",
        };
        setCurrentUser(updated);
        localStorage.setItem("@phoenix_session_user", JSON.stringify(updated));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthMsg(null);
    try {
      const res = await fetch("http://localhost:8000/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });
      if (!res.ok) throw new Error("Account not found or password incorrect.");
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(data));
      setAuthMsg("Login successful!");
    } catch (err: any) {
      setAuthMsg(err.message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthMsg(null);

    if (regPassword !== regConfirmPassword) {
      setAuthMsg("Passwords do not match!");
      setIsSubmittingAuth(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/accounts/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          currency: "LKR",
        }),
      });
      if (!res.ok) throw new Error("Registration failed.");
      const newAcc = await res.json();
      setCurrentUser(newAcc);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(newAcc));
    } catch (err: any) {
      setAuthMsg(err.message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("@phoenix_session_user");
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsTransferring(true);

    try {
      const res = await fetch("http://localhost:8000/api/payments/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: currentUser.id,
          toAccountId: recipient,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) throw new Error("Transfer request failed");

      setTransactions([{
        id: Date.now().toString(),
        title: `Transfer to ${recipientName || recipient}`,
        time: "Just now",
        amount: parseFloat(amount),
        type: "expense"
      }, ...transactions]);

      setTimeout(() => fetchLatestBalance(currentUser.id), 1000);
      setShowTransferModal(false);
      setAmount("");
      setRecipient("");
      alert("Transfer Initiated Successfully");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  // Landing Page & Auth
  if (!currentUser) {
    return (
      <div className="lp-container">
        {/* Navigation */}
        <nav className="lp-navbar">
          <div className="lp-logo">PHOENIXBANK</div>
          <div className="lp-nav-links">
            <a href="#">Architecture</a>
            <a href="#">Security</a>
            <a href="#">DevOps</a>
            <a href="#">Insights</a>
          </div>
          <button className="lp-login-btn" onClick={() => setShowAuthModal(true)}>
            Schedule Consultation
          </button>
        </nav>

        {/* Hero Section */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <h1 className="lp-hero-title">Achieve Financial Success & Security</h1>
            <p className="lp-hero-desc">
              Experience the next generation of banking with our Zero-Trust architecture. 
              Powered by event-driven microservices (Kafka), HashiCorp Vault threshold cryptography, 
              and real-time AI Fraud Detection.
            </p>
            <button className="lp-hero-btn" onClick={() => setShowAuthModal(true)}>
              Open Account
            </button>
          </div>
        </section>

        {/* Features / Services */}
        <section className="lp-services">
          <div className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <h3 className="lp-card-title">Microservices</h3>
            <p className="lp-card-desc">Event-driven architecture using Kafka for high-throughput, decoupled inter-service communication and eventual consistency.</p>
          </div>
          <div className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="lp-card-title">AI Fraud Detection</h3>
            <p className="lp-card-desc">Real-time anomaly detection using scikit-learn Isolation Forests, instantly flagging suspicious transactions {">"} LKR 200,000.</p>
          </div>
          <div className="lp-card">
            <div className="lp-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 className="lp-card-title">Zero-Trust Vault</h3>
            <p className="lp-card-desc">Advanced key management featuring Shamir's Secret Sharing (3-of-5 threshold) and automated HashiCorp Vault dynamic provisioning.</p>
          </div>
        </section>

        {/* Auth Modal Overlay */}
        {showAuthModal && (
          <div className="auth-modal-overlay">
            <div className="auth-card">
              <button className="auth-close" onClick={() => setShowAuthModal(false)}>✕</button>
              
              <div className="auth-header">
                <h1>PhoenixBank</h1>
                <p>Zero-Trust Security Gateway</p>
              </div>

              <div className="auth-tabs">
                <div className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} onClick={() => setAuthTab('login')}>Login</div>
                <div className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} onClick={() => setAuthTab('register')}>Register</div>
              </div>

              {authMsg && (
                <div style={{ padding: '10px', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
                  {authMsg}
                </div>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Account ID or Email</label>
                    <input type="text" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="submit-btn" disabled={isSubmittingAuth}>
                    {isSubmittingAuth ? "Authenticating..." : "Login securely"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="submit-btn" disabled={isSubmittingAuth}>
                    {isSubmittingAuth ? "Registering..." : "Open Account"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>PhoenixBank</h1>
          <p className="user-greeting">Welcome back, {currentUser.holderName}</p>
        </div>
        <div className="header-user">
          <div className="avatar">{currentUser.holderName.charAt(0).toUpperCase()}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-label">Total Balance</div>
          <div className="balance-amount">
            {currentUser.currency} {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="balance-details">
            <span>Acc: #{currentUser.id}</span>
            <button className="refresh-btn" onClick={() => fetchLatestBalance(currentUser.id)}>
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Easy Actions */}
        <div className="actions-grid">
          <div className="action-btn" onClick={() => setShowTransferModal(true)}>
            <div className="action-icon">Tr</div>
            <span className="action-label">Transfer</span>
          </div>
          <div className="action-btn" onClick={() => setShowBillsModal(true)}>
            <div className="action-icon">Bi</div>
            <span className="action-label">Pay Bills</span>
          </div>
          <div className="action-btn">
            <div className="action-icon">Sc</div>
            <span className="action-label">Scan Pay</span>
          </div>
          <div className="action-btn" onClick={() => setShowCardsModal(true)}>
            <div className="action-icon">Wa</div>
            <span className="action-label">Wallet</span>
          </div>
        </div>

        {/* Favorite Transfers */}
        <div className="section-title">
          <span>Favorite Transfers</span>
          <span className="section-link">View all</span>
        </div>
        <div className="favorites-list">
          <div className="fav-item" onClick={() => { setRecipient(""); setShowTransferModal(true); }}>
            <div className="fav-avatar" style={{ background: '#f8fafc', color: '#0056b3', border: '1px dashed #cbd5e1' }}>+</div>
            <span className="fav-name">Add New</span>
          </div>
          {savedContacts.map(contact => (
            <div key={contact.id} className="fav-item" onClick={() => {
              setRecipient(contact.id);
              setRecipientName(contact.name);
              setShowTransferModal(true);
            }}>
              <div className="fav-avatar">{contact.name.charAt(0)}</div>
              <span className="fav-name">{contact.name}</span>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <div className="section-title">
          <span>Recent Activity</span>
          <span className="section-link">History</span>
        </div>
        <div className="transaction-list">
          {transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className="tx-left">
                <div className={`tx-icon ${tx.type}`}>
                  {tx.type === 'income' ? '↓' : '↑'}
                </div>
                <div className="tx-info">
                  <h4>{tx.title}</h4>
                  <p>{tx.time}</p>
                </div>
              </div>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Fund Transfer</h3>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSendMoney}>
              <div className="form-group">
                <label>Recipient Account ID</label>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Amount (LKR)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <button type="submit" className="submit-btn" disabled={isTransferring}>
                {isTransferring ? "Processing..." : "Transfer Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bills Modal */}
      {showBillsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pay Bills</h3>
              <button className="close-btn" onClick={() => setShowBillsModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e9ecef', background: 'white', textAlign: 'left', fontWeight: 'bold' }}>Electricity Board</button>
              <button style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e9ecef', background: 'white', textAlign: 'left', fontWeight: 'bold' }}>Water Board</button>
              <button style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e9ecef', background: 'white', textAlign: 'left', fontWeight: 'bold' }}>Mobile Reload</button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showCardsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Virtual Wallet</h3>
              <button className="close-btn" onClick={() => setShowCardsModal(false)}>✕</button>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '20px', padding: '24px', color: 'white' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Phoenix Debit</div>
              <div style={{ fontSize: '24px', letterSpacing: '4px', margin: '24px 0' }}>4532 **** **** {currentUser.id.padStart(4, '0')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>{currentUser.holderName.toUpperCase()}</span>
                <span>ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
