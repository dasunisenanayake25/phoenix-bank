"use client";

import { useEffect, useState } from "react";

interface AccountData {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  type: "income" | "expense";
}

export default function Home() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState("2");
  const [recipientName, setRecipientName] = useState("Amila");
  const [amount, setAmount] = useState("5000");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  // Transactions list
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", title: "Salary Deposit", time: "Today, 09:00 AM", amount: 150000, type: "income" },
    { id: "2", title: "Supermarket Bill", time: "Yesterday, 18:30 PM", amount: 8450, type: "expense" },
    { id: "3", title: "Electricity Bill", time: "28 Jul, 10:15 AM", amount: 5200, type: "expense" },
  ]);

  const fetchBalance = () => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8000/api/accounts/1/balance")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 429) throw new Error("Rate limit exceeded! (Blocked by Kong Gateway)");
          throw new Error("Failed to fetch balance. Ensure backend is running and account exists.");
        }
        return res.json();
      })
      .then((data) => {
        setAccount(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleQuickTransferClick = (accId: string, name: string) => {
    setRecipient(accId);
    setRecipientName(name);
    setShowTransferModal(true);
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
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
          fromAccountId: "1",
          toAccountId: recipient,
          amount: numAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Transfer failed. Please check network/Kong gateway.");
      }

      setTransferMsg("🎉 Transfer initiated successfully via Kafka!");
      
      // Update local transaction log
      const newTx: Transaction = {
        id: Date.now().toString(),
        title: `Transfer to ${recipientName || 'Account ' + recipient}`,
        time: "Just now",
        amount: numAmount,
        type: "expense",
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Refresh balance after short delay for Kafka processing
      setTimeout(() => {
        fetchBalance();
        setIsTransferring(false);
        setTimeout(() => setShowTransferModal(false), 1500);
      }, 1000);
    } catch (err: any) {
      setTransferMsg(`Error: ${err.message}`);
      setIsTransferring(false);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        
        {/* Total Balance Card */}
        <div className="card balance-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="balance-label">Total Balance</div>
            <button 
              onClick={fetchBalance}
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
              {account ? `${account.currency} ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "N/A"}
            </div>
          )}
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.85 }}>
            Account No: •••• •••• 8842 | Status: Active
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
            Transfer money instantly to your saved contacts.
          </p>
          <div style={{ display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            <div 
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => handleQuickTransferClick("2", "Amila")}
            >
              <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem" }}>A</div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Amila</span>
            </div>
            <div 
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => handleQuickTransferClick("3", "Kamal")}
            >
              <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem", background: "var(--secondary)", color: "var(--primary)" }}>K</div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Kamal</span>
            </div>
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
                <label>Recipient Account ID</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. 2 or 3"
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
              <h3>Your PhoenixBank Cards</h3>
              <button className="close-btn" onClick={() => setShowCardsModal(false)}>✕</button>
            </div>
            <div className="virtual-card">
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>PhoenixBank Debit</div>
              <div style={{ fontSize: "1.4rem", letterSpacing: "2px", margin: "1.5rem 0" }}>4532 •••• •••• 8842</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>EXP: 12/28</span>
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
  );
}
