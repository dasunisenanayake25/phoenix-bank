"use client";

import Link from "next/link";

export default function BusinessBanking() {
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
        backgroundImage: 'linear-gradient(rgba(11, 33, 63, 0.8), rgba(11, 33, 63, 0.8)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 5%',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>Business Solutions</h1>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: '#e2e8f0' }}>
          Empower your enterprise with scalable banking, robust merchant services, and intelligent payroll.
        </p>
      </div>

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Corporate Accounts</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Streamline your cash flow management with our advanced corporate checking and savings tools.</p>
            <Link href="/" style={{ color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>Learn More &rarr;</Link>
          </div>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Merchant Services</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Accept payments seamlessly globally with our secure, Zero-Trust integrated API gateway.</p>
            <Link href="/" style={{ color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>Learn More &rarr;</Link>
          </div>
          <div className="service-card" style={{ padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', color: '#0b213f', marginBottom: '15px' }}>Commercial Lending</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>Fuel your growth with flexible credit lines and commercial real estate financing.</p>
            <Link href="/" style={{ color: '#cfa75c', fontWeight: 'bold', textDecoration: 'none' }}>Learn More &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
