"use client";

import Link from "next/link";

export default function PersonalBanking() {
  return (
    <div className="page-container">
      <nav className="lp-navbar" style={{ background: '#0b213f', position: 'relative' }}>
        <Link href="/" className="lp-logo" style={{ textDecoration: 'none' }}>PHOENIXBANK</Link>
        <div className="lp-nav-links">
          <Link href="/personal">Personal</Link>
          <Link href="/business">Business</Link>
          <Link href="/cards">Cards</Link>
          <Link href="/about">About Us</Link>
        </div>
        <Link href="/" className="lp-login-btn" style={{ textDecoration: 'none' }}>Access Account</Link>
      </nav>

      <div className="page-hero" style={{ 
        backgroundImage: 'linear-gradient(rgba(11, 33, 63, 0.8), rgba(11, 33, 63, 0.8)), url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 5%',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>Personal Banking</h1>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: '#e2e8f0' }}>
          Achieve your financial goals with our tailored checking, savings, and investment solutions.
        </p>
      </div>

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Checking Accounts</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>No hidden fees, real-time alerts, and seamless integration with our mobile app.</p>
          </div>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>High-Yield Savings</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Grow your wealth faster with industry-leading interest rates and zero minimum balances.</p>
          </div>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Home Loans</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Competitive rates and a streamlined application process to get you into your dream home.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0b213f', color: '#94a3b8', padding: '60px 5% 40px 5%', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
        <div style={{ marginBottom: '20px', fontSize: '24px', color: 'white', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'Georgia, serif' }}>PHOENIXBANK</div>
        <p style={{ marginBottom: '10px' }}>Elevating your financial future with Zero-Trust security and intelligent insights.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
          <a href="/personal" style={{ color: '#cfa75c', textDecoration: 'none', fontSize: '14px' }}>Personal</a>
          <a href="/business" style={{ color: '#cfa75c', textDecoration: 'none', fontSize: '14px' }}>Business</a>
          <a href="/cards" style={{ color: '#cfa75c', textDecoration: 'none', fontSize: '14px' }}>Cards</a>
          <a href="/about" style={{ color: '#cfa75c', textDecoration: 'none', fontSize: '14px' }}>About Us</a>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>&copy; 2026 PhoenixBank. All rights reserved.</p>
      </footer>
    </div>
  );
}
