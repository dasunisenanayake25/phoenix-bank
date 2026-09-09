"use client";

import Link from "next/link";

export default function AboutUs() {
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
        backgroundImage: 'linear-gradient(rgba(11, 33, 63, 0.8), rgba(11, 33, 63, 0.8)), url("https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 5%',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>About Us</h1>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: '#e2e8f0' }}>
          Pioneering the future of secure banking with Zero-Trust architecture and AI-driven fraud detection.
        </p>
      </div>

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', color: '#0b213f', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Our Mission</h2>
        <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '18px', marginBottom: '40px' }}>
          At PhoenixBank, we believe that financial success comes from clarity, discipline, and a trusted partner. 
          Our core architecture is built from the ground up utilizing Event-Driven Microservices (Apache Kafka) and 
          HashiCorp Vault to ensure that your wealth is protected by the highest enterprise security standards available today.
        </p>

        <h2 style={{ fontSize: '32px', color: '#0b213f', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Our Leadership</h2>
        <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <img src="https://i.pravatar.cc/150?u=10" alt="CEO" style={{ width: '120px', height: '120px', borderRadius: '60px', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '20px', color: '#0b213f', marginBottom: '5px' }}>James T.</h4>
            <p style={{ color: '#64748b' }}>Chief Executive Officer</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <img src="https://i.pravatar.cc/150?u=11" alt="CTO" style={{ width: '120px', height: '120px', borderRadius: '60px', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '20px', color: '#0b213f', marginBottom: '5px' }}>Sarah L.</h4>
            <p style={{ color: '#64748b' }}>Chief Technology Officer</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <img src="https://i.pravatar.cc/150?u=12" alt="CFO" style={{ width: '120px', height: '120px', borderRadius: '60px', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '20px', color: '#0b213f', marginBottom: '5px' }}>Michael R.</h4>
            <p style={{ color: '#64748b' }}>Chief Financial Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
