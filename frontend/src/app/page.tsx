"use client";

import { useCallback, useEffect, useState } from "react";

interface MemberAccount {
  id: string;
  holderName: string;
  email?: string;
  balance: number;
  currency: string;
  status: string;
  token?: string;
}

interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  type: "income" | "expense";
}

export default function Home() {
  const apiUrl = (path: string) => `/api${path}`;

  const [currentUser, setCurrentUser] = useState<MemberAccount | null>(null);
  const [loading, setLoading] = useState(false);

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

  const fetchLatestBalance = useCallback((accId: string) => {
    setLoading(true);
    const savedUser = localStorage.getItem("@phoenix_session_user");
    let token = "";
    if (savedUser) {
      try {
        token = JSON.parse(savedUser).token || "";
      } catch {}
    }

    fetch(apiUrl(`/accounts/${accId}/balance`), {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch balance.");
        return res.json();
      })
      .then((data) => {
        setCurrentUser((previousUser) => {
          const updated = {
            id: accId,
            holderName: data.holderName || previousUser?.holderName || "Member",
            email: data.email,
            balance: Number(data.balance),
            currency: data.currency || "LKR",
            status: data.status || "ACTIVE",
            token: previousUser?.token || token || "", // Preserve the JWT token
          };
          localStorage.setItem("@phoenix_session_user", JSON.stringify(updated));
          return updated;
        });
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const loadSavedUser = async () => {
      const savedUser = localStorage.getItem("@phoenix_session_user");
      if (!savedUser) return;

      try {
        const parsed = JSON.parse(savedUser) as MemberAccount;
        setCurrentUser(parsed);
        await Promise.resolve();
        fetchLatestBalance(parsed.id);
      } catch {
        localStorage.removeItem("@phoenix_session_user");
      }
    };

    void loadSavedUser();
  }, [fetchLatestBalance]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthMsg(null);
    try {
      const res = await fetch(apiUrl("/accounts/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });
      if (!res.ok) throw new Error("Account not found or password incorrect.");
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(data));
      setAuthMsg("Login successful!");
      } catch (err: unknown) {
        setAuthMsg(err instanceof Error ? err.message : "Login failed.");
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
      const res = await fetch(apiUrl("/accounts/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          currency: "LKR",
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "Registration failed.";
        throw new Error(errMsg);
      }
      const newAcc = await res.json();
      setCurrentUser(newAcc);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(newAcc));
    } catch (err: unknown) {
      setAuthMsg(err instanceof Error ? err.message : "Registration failed.");
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
      const savedUser = localStorage.getItem("@phoenix_session_user");
      let token = "";
      if (savedUser) {
        try {
          token = JSON.parse(savedUser).token || "";
        } catch {}
      }

      const res = await fetch(apiUrl("/payments/transfer"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          fromAccountId: currentUser.id,
          toAccountId: recipient,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Transfer request failed");
      }

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
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "Transfer request failed"));
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
            <a href="/personal">Personal</a>
            <a href="/business">Business</a>
            <a href="/cards">Cards</a>
            <a href="/about">About Us</a>
          </div>
          <button className="lp-login-btn" onClick={() => setShowAuthModal(true)}>
            Access Account
          </button>
        </nav>

        {/* Hero Section */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <span className="lp-hero-pretitle">Financial Guidance You Can Trust</span>
            <h1 className="lp-hero-title">Smart Financial Decisions for a Stronger Future</h1>
            <p className="lp-hero-desc">
              Experience the next generation of banking with our Zero-Trust architecture. 
              Powered by event-driven microservices (Kafka), HashiCorp Vault threshold cryptography, 
              and real-time AI Fraud Detection.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button className="lp-hero-btn" onClick={() => setShowAuthModal(true)}>
                Schedule a Consultation
              </button>
              <button className="lp-hero-btn" style={{ background: 'transparent', border: '1px solid white', color: 'white' }} onClick={() => window.scrollTo(0, 800)}>
                Our Services &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="lp-trust-badges">
          <div className="trust-badge">
            <div className="trust-icon">🛡️</div>
            <div className="trust-text">
              <h4>Fiduciary Standard</h4>
              <p>We put your interests first, always.</p>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🤝</div>
            <div className="trust-text">
              <h4>Independent Advice</h4>
              <p>Objective guidance tailored to your goals.</p>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">📈</div>
            <div className="trust-text">
              <h4>Proven Strategies</h4>
              <p>Strategies designed for today and tomorrow.</p>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🔒</div>
            <div className="trust-text">
              <h4>Your Financial Privacy</h4>
              <p>Your information is safe and secure with us.</p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="lp-services">
          <h2 className="lp-section-title">Comprehensive Financial Solutions</h2>
          <div className="lp-services-grid">
            <div className="lp-card">
              <div className="lp-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="lp-card-title">Personal Banking</h3>
              <p className="lp-card-desc">Build a clear roadmap to achieve your short and long-term financial goals with tailored checking and savings.</p>
              <a href="/personal" style={{ display: 'block', marginTop: '20px', color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>LEARN MORE &rarr;</a>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <h3 className="lp-card-title">Business Advisory</h3>
              <p className="lp-card-desc">Expert financial advice, robust merchant services, and scalable corporate accounts to help your business grow.</p>
              <a href="/business" style={{ display: 'block', marginTop: '20px', color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>LEARN MORE &rarr;</a>
            </div>
            <div className="lp-card">
              <div className="lp-card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="lp-card-title">Zero-Trust Vault</h3>
              <p className="lp-card-desc">Advanced key management featuring Shamir's Secret Sharing (3-of-5 threshold) and automated HashiCorp Vault provisioning.</p>
              <a href="/about" style={{ display: 'block', marginTop: '20px', color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>LEARN MORE &rarr;</a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="lp-stats">
          <div className="lp-stats-content">
            <h2 style={{ fontSize: '36px', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>Your Goals. Our Expertise. A Better Financial Future.</h2>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '30px' }}>At PhoenixBank, we believe financial success comes from clarity, discipline, and a trusted partner.</p>
            <ul style={{ listStyle: 'none', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li>✓ Over 20 years of combined experience</li>
              <li>✓ Personalized strategies for every stage of life</li>
              <li>✓ Transparent advice and honest communication</li>
              <li>✓ Committed to your long-term success</li>
            </ul>
            <button className="lp-hero-btn" style={{ marginTop: '40px' }}>Learn More About Us &rarr;</button>
          </div>
          <div className="lp-stats-grid">
            <div className="stat-item">
              <h3>20+</h3>
              <p>Years of Experience</p>
            </div>
            <div className="stat-item">
              <h3>1,000+</h3>
              <p>Clients Served</p>
            </div>
            <div className="stat-item">
              <h3>$750M+</h3>
              <p>Assets Under Advisement</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Client Satisfaction</p>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="lp-process">
          <h2 className="lp-section-title">A Simple Process. Powerful Results.</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-icon">1</div>
              <h4 className="step-title">Discover</h4>
              <p className="step-desc">We start with a conversation to understand your goals, needs, and priorities.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">2</div>
              <h4 className="step-title">Plan</h4>
              <p className="step-desc">We create a customized financial plan designed to help you reach your goals.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">3</div>
              <h4 className="step-title">Implement</h4>
              <p className="step-desc">We put your plan into action with strategies built for growth and protection.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">4</div>
              <h4 className="step-title">Monitor</h4>
              <p className="step-desc">We review and adjust your plan regularly to keep you on track for success.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="lp-testimonials">
          <span className="lp-hero-pretitle" style={{ color: '#64748b' }}>What Our Clients Say</span>
          <h2 className="lp-section-title">Trusted by Individuals and Businesses</h2>
          <div className="test-grid">
            <div className="test-card">
              <p className="test-quote">"PhoenixBank took the time to understand our goals and created a plan that gave us confidence in our future."</p>
              <div className="test-author">
                <img src="https://i.pravatar.cc/150?u=1" alt="Melissa R." />
                <div className="test-author-info">
                  <h4>Melissa R.</h4>
                  <p>New York, NY</p>
                </div>
              </div>
            </div>
            <div className="test-card">
              <p className="test-quote">"Professional, knowledgeable, and always responsive. They've been instrumental in helping our business grow."</p>
              <div className="test-author">
                <img src="https://i.pravatar.cc/150?u=2" alt="James T." />
                <div className="test-author-info">
                  <h4>James T.</h4>
                  <p>Chicago, IL</p>
                </div>
              </div>
            </div>
            <div className="test-card">
              <p className="test-quote">"Their advice is clear, honest, and always in our best interest. We highly recommend their team."</p>
              <div className="test-author">
                <img src="https://i.pravatar.cc/150?u=3" alt="Sarah L." />
                <div className="test-author-info">
                  <h4>Sarah L.</h4>
                  <p>Austin, TX</p>
                </div>
              </div>
            </div>
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
