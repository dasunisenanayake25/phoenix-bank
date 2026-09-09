"use client";

import Link from "next/link";

export default function CardsBanking() {
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
        backgroundImage: 'linear-gradient(rgba(11, 33, 63, 0.8), rgba(11, 33, 63, 0.8)), url("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 5%',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>Credit & Debit Cards</h1>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: '#e2e8f0' }}>
          Discover the perfect card for your lifestyle, featuring robust rewards and Zero-Trust security.
        </p>
      </div>

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', color: 'white' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Phoenix Signature</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Rewards Credit Card</div>
            </div>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Signature Rewards</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Earn 3X points on dining and travel. No foreign transaction fees.</p>
          </div>
          
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', marginBottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', color: '#cfa75c' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Phoenix Reserve</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Premium Credit Card</div>
            </div>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Reserve Elite</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Exclusive airport lounge access, 24/7 concierge, and premium travel insurance.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
