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
  const [loginIdentifier, setLoginIdentifier] = useState("1");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDeposit, setRegDeposit] = useState("25000");
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Transfer Form state
  const [recipient, setRecipient] = useState("2");
  const [recipientName, setRecipientName] = useState("Amila");
  const [amount, setAmount] = useState("5000");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  // List of accounts for Quick Transfer
  const [savedContacts, setSavedContacts] = useState<{ id: string; name: string }[]>([
    { id: "2", name: "Amila" },
    { id: "3", name: "Kamal" },
  ]);

  // Transactions list
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", title: "Salary Deposit", time: "Today, 09:00 AM", amount: 150000, type: "income" },
    { id: "2", title: "Supermarket Bill", time: "Yesterday, 18:30 PM", amount: 8450, type: "expense" },
    { id: "3", title: "Electricity Bill", time: "28 Jul, 10:15 AM", amount: 5200, type: "expense" },
  ]);

  // Load user session on startup
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
    setError(null);
    fetch(`http://localhost:8000/api/accounts/${accId}/balance`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 429) throw new Error("Rate limit exceeded! (Blocked by Kong Gateway)");
          throw new Error("Failed to fetch balance. Ensure backend is running.");
        }
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
        body: JSON.stringify({ identifier: loginIdentifier }),
      });
      if (!res.ok) {
        throw new Error("Account not found. Please check Account ID or Email.");
      }
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(data));
      setAuthMsg("Login successful!");
    } catch (err: any) {
      setAuthMsg(`Login Error: ${err.message}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthMsg(null);
    const numDeposit = parseFloat(regDeposit);
    if (isNaN(numDeposit) || numDeposit < 0) {
      setAuthMsg("Please enter a valid initial deposit amount.");
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
          initialDeposit: numDeposit,
          currency: "LKR",
        }),
      });
      if (!res.ok) {
        throw new Error("Registration failed. Backend error.");
      }
      const newAcc = await res.json();
      setCurrentUser(newAcc);
      localStorage.setItem("@phoenix_session_user", JSON.stringify(newAcc));
      setAuthMsg("🎉 Registration successful! Account created.");
    } catch (err: any) {
      setAuthMsg(`Registration Error: ${err.message}`);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("@phoenix_session_user");
  };

  const handleQuickTransferClick = (accId: string, name: string) => {
    setRecipient(accId);
    setRecipientName(name);
    setShowTransferModal(true);
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsTransferring(true);
    setTransferMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setTransferMsg("Please enter a valid transfer amount.");
      setIsTransferring(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/payments/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: currentUser.id,
          toAccountId: recipient,
          amount: numAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Transfer failed. Please check network/Kong gateway.");
      }

      setTransferMsg("🎉 Transfer initiated successfully via Kafka!");
      
      const newTx: Transaction = {
        id: Date.now().toString(),
        title: `Transfer to ${recipientName || 'Account ' + recipient}`,
        time: "Just now",
        amount: numAmount,
        type: "expense",
      };
      setTransactions((prev) => [newTx, ...prev]);

      setTimeout(() => {
        fetchLatestBalance(currentUser.id);
        setIsTransferring(false);
        setTimeout(() => setShowTransferModal(false), 1500);
      }, 1000);
    } catch (err: any) {
      setTransferMsg(`Error: ${err.message}`);
      setIsTransferring(false);
    }
  };

  // --- Render Authentication Screen if no user logged in ---
  if (!currentUser) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="card" style={{ width: "100%", maxWidth: "460px", padding: "2.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "var(--primary)", fontSize: "1.8rem", fontWeight: "bold" }}>PhoenixBank</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Zero-Trust Resilient Digital Banking</p>
          </div>

          <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: "1.5rem" }}>
            <button
              onClick={() => { setAuthTab("login"); setAuthMsg(null); }}
              style={{
                flex: 1,
                padding: "0.75rem",
                background: "none",
                border: "none",
                borderBottom: authTab === "login" ? "3px solid var(--primary)" : "none",
                fontWeight: "bold",
                color: authTab === "login" ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              🔑 Member Login
            </button>
            <button
              onClick={() => { setAuthTab("register"); setAuthMsg(null); }}
              style={{
                flex: 1,
                padding: "0.75rem",
                background: "none",
                border: "none",
                borderBottom: authTab === "register" ? "3px solid var(--primary)" : "none",
                fontWeight: "bold",
                color: authTab === "register" ? "var(--primary)" : "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              📝 Register New Member
            </button>
          </div>

          {authMsg && (
            <div style={{ padding: "0.75rem", borderRadius: "8px", background: authMsg.includes("Error") ? "#fff5f5" : "#e6fcf5", color: authMsg.includes("Error") ? "#c92a2a" : "#0ca678", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {authMsg}
            </div>
          )}

          {authTab === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Account ID / Member Email</label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter Account ID (e.g. 1, 2, 3) or Email"
                  required
                />
              </div>

              <div style={{ marginBottom: "1.2rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Quick Demo Accounts:</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="bill-opt" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => setLoginIdentifier("1")}>Acc 1 (User)</button>
                  <button type="button" className="bill-opt" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => setLoginIdentifier("2")}>Acc 2 (Amila)</button>
                  <button type="button" className="bill-opt" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }} onClick={() => setLoginIdentifier("3")}>Acc 3 (Kamal)</button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmittingAuth}>
                {isSubmittingAuth ? "Authenticating..." : "Login to Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Nimal Perera"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. nimal@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Initial Deposit (LKR)</label>
                <input
                  type="number"
                  value={regDeposit}
                  onChange={(e) => setRegDeposit(e.target.value)}
                  placeholder="Enter deposit amount"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmittingAuth}>
                {isSubmittingAuth ? "Creating Account..." : "Create New Member Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Main Dashboard Screen for Logged-In User ---
  return (
    <div>
      {/* Header User Bar */}
      <div className="header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1>PhoenixBank</h1>
          <span style={{ fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "12px", background: "#e6fcf5", color: "#0ca678", fontWeight: "bold" }}>
            ● Active
          </span>
        </div>
        <div className="header-user">
          <div>
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Good morning, {currentUser.holderName}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Acc No: #{currentUser.id}</div>
          </div>
          <div className="avatar">
            {currentUser.holderName ? currentUser.holderName.charAt(0).toUpperCase() : "U"}
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: "#ffe3e3",
              color: "#c92a2a",
              border: "none",
              padding: "0.4rem 0.8rem",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85rem",
              marginLeft: "0.5rem"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          {error && <div className="error-msg">{error}</div>}
          
          {/* Total Balance Card */}
          <div className="card balance-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="balance-label">Total Balance</div>
              <button 
                onClick={() => fetchLatestBalance(currentUser.id)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}
              >
                ↻ Refresh
              </button>
            </div>
            {loading ? (
              <div className="balance-amount">Loading...</div>
            ) : (
              <div className="balance-amount">
                {currentUser ? `${currentUser.currency} ${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "N/A"}
              </div>
            )}
            <div style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.85 }}>
              Member: {currentUser.holderName} | Email: {currentUser.email || "N/A"}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="actions-grid">
            <div className="action-btn" onClick={() => setShowTransferModal(true)}>
              💸 Send Money
            </div>
            <div className="action-btn" onClick={() => setShowBillsModal(true)}>
              📑 Pay Bills
            </div>
            <div className="action-btn" onClick={() => setShowCardsModal(true)}>
              💳 Cards
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <h3 className="section-title">Recent Activity</h3>
            <ul className="transaction-list">
              {transactions.map((tx) => (
                <li className="transaction-item" key={tx.id}>
                  <div className="tx-info">
                    <h4>{tx.title}</h4>
                    <p>{tx.time}</p>
                  </div>
                  <div className={`tx-amount ${tx.type === "income" ? "positive" : "negative"}`}>
                    {tx.type === "income" ? "+" : "-"} LKR {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="sidebar">
          {/* Quick Transfer */}
          <div className="card">
            <h3 className="section-title">Quick Transfer</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
              Transfer money instantly to saved contacts.
            </p>
            <div style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {savedContacts.map((contact) => (
                <div 
                  key={contact.id}
                  style={{ textAlign: "center", cursor: "pointer" }}
                  onClick={() => handleQuickTransferClick(contact.id, contact.name)}
                >
                  <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem" }}>
                    {contact.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{contact.name}</span>
                </div>
              ))}
              <div 
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={() => handleQuickTransferClick("", "")}
              >
                <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem", background: "var(--border)", color: "var(--text-main)" }}>+</div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>New</span>
              </div>
            </div>
          </div>

          {/* Loans & Offers */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <h3 className="section-title">Loans & Offers</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              You are eligible for an instant personal loan of up to LKR 500,000.
            </p>
            <button 
              onClick={() => setShowLoanModal(true)}
              style={{
                background: "var(--primary)",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius)",
                marginTop: "1rem",
                width: "100%",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Send Money (Kafka Event)</h3>
                <button className="close-btn" onClick={() => setShowTransferModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSendMoney}>
                <div className="form-group">
                  <label>Sender Account (You)</label>
                  <input type="text" value={`#${currentUser.id} - ${currentUser.holderName}`} disabled />
                </div>
                <div className="form-group">
                  <label>Recipient Account ID</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. 2, 3, or new account ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount (LKR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                {transferMsg && (
                  <div style={{ padding: "0.75rem", borderRadius: "8px", background: transferMsg.includes("🎉") ? "#e6fcf5" : "#fff5f5", color: transferMsg.includes("🎉") ? "#0ca678" : "#e03131", fontSize: "0.85rem", marginBottom: "1rem" }}>
                    {transferMsg}
                  </div>
                )}
                <button type="submit" className="submit-btn" disabled={isTransferring}>
                  {isTransferring ? "Processing Transfer..." : "Confirm & Transfer"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Pay Bills Modal */}
        {showBillsModal && (
          <div className="modal-overlay" onClick={() => setShowBillsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Pay Utility Bills</h3>
                <button className="close-btn" onClick={() => setShowBillsModal(false)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                <button className="bill-opt" onClick={() => { alert("Electricity Bill Paid!"); setShowBillsModal(false); }}>⚡ CEB Electricity</button>
                <button className="bill-opt" onClick={() => { alert("Water Bill Paid!"); setShowBillsModal(false); }}>💧 National Water Board</button>
                <button className="bill-opt" onClick={() => { alert("Telecom Bill Paid!"); setShowBillsModal(false); }}>📞 Dialog / Mobitel Bill</button>
              </div>
            </div>
          </div>
        )}

        {/* Cards Modal */}
        {showCardsModal && (
          <div className="modal-overlay" onClick={() => setShowCardsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Your PhoenixBank Card</h3>
                <button className="close-btn" onClick={() => setShowCardsModal(false)}>✕</button>
              </div>
              <div className="virtual-card">
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>PhoenixBank Debit</div>
                <div style={{ fontSize: "1.4rem", letterSpacing: "2px", margin: "1.5rem 0" }}>4532 •••• •••• {currentUser.id.padStart(4, '0')}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span>HOLDER: {currentUser.holderName.toUpperCase()}</span>
                  <span>STATUS: ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loan Modal */}
        {showLoanModal && (
          <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Instant Personal Loan</h3>
                <button className="close-btn" onClick={() => setShowLoanModal(false)}>✕</button>
              </div>
              <p style={{ margin: "1rem 0", fontSize: "0.95rem" }}>
                Pre-approved loan up to <strong>LKR 500,000.00</strong> at a promotional rate of 9.5% p.a.
              </p>
              <button 
                className="submit-btn" 
                onClick={() => {
                  alert("Loan application submitted successfully! Our representative will call you shortly.");
                  setShowLoanModal(false);
                }}
              >
                Accept Pre-Approved Loan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
