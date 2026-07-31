"use client";

import { useEffect, useState } from "react";

interface AccountData {
  balance: number;
  currency: string;
}

export default function Home() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We are fetching from the Kong API Gateway running on port 8000
  // ID '1' is used here as a placeholder for the logged-in user's account ID.
  useEffect(() => {
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
  }, []);

  return (
    <div className="dashboard-grid">
      <div className="main-content">
        {error && <div className="error-msg">{error}</div>}
        
        <div className="card balance-card">
          <div className="balance-label">Total Balance</div>
          {loading ? (
            <div className="balance-amount">Loading...</div>
          ) : (
            <div className="balance-amount">
              {account ? `${account.currency} ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "N/A"}
            </div>
          )}
        </div>

        <div className="actions-grid">
          <div className="action-btn">Send Money</div>
          <div className="action-btn">Pay Bills</div>
          <div className="action-btn">Cards</div>
        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <h3 className="section-title">Recent Activity</h3>
          <ul className="transaction-list">
            <li className="transaction-item">
              <div className="tx-info">
                <h4>Salary Deposit</h4>
                <p>Today, 09:00 AM</p>
              </div>
              <div className="tx-amount positive">+ LKR 150,000.00</div>
            </li>
            <li className="transaction-item">
              <div className="tx-info">
                <h4>Supermarket Bill</h4>
                <p>Yesterday, 18:30 PM</p>
              </div>
              <div className="tx-amount negative">- LKR 8,450.00</div>
            </li>
            <li className="transaction-item">
              <div className="tx-info">
                <h4>Electricity Bill</h4>
                <p>28 Jul, 10:15 AM</p>
              </div>
              <div className="tx-amount negative">- LKR 5,200.00</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="sidebar">
        <div className="card">
          <h3 className="section-title">Quick Transfer</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
            Transfer money instantly to your saved contacts.
          </p>
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
            <div style={{ textAlign: "center" }}>
              <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem" }}>A</div>
              <span style={{ fontSize: "0.8rem" }}>Amila</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem", background: "var(--secondary)", color: "var(--primary)" }}>K</div>
              <span style={{ fontSize: "0.8rem" }}>Kamal</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="avatar" style={{ margin: "0 auto", marginBottom: "0.5rem", background: "var(--border)", color: "var(--text-main)" }}>+</div>
              <span style={{ fontSize: "0.8rem" }}>New</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <h3 className="section-title">Loans & Offers</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            You are eligible for an instant personal loan of up to LKR 500,000.
          </p>
          <button style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "var(--radius)",
            marginTop: "1rem",
            width: "100%",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
