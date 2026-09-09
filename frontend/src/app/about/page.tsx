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
        backgroundImage: 'linear-gradient(rgba(11, 33, 63, 0.6), rgba(11, 33, 63, 0.7)), url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80")',
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

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '32px', color: '#0b213f', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Our Mission</h2>
          <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '18px' }}>
            At PhoenixBank, we believe that financial success comes from clarity, discipline, and a trusted partner. 
            Our core architecture is built from the ground up utilizing Event-Driven Microservices (Apache Kafka) and 
            HashiCorp Vault to ensure that your wealth is protected by the highest enterprise security standards available today.
          </p>
        </div>

        <h2 style={{ fontSize: '32px', color: '#0b213f', textAlign: 'center', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Our Team</h2>
        
        <div className="team-grid">
          {/* Member 1: Ravindu Anushka */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/ravindu.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Ravindu Anushka</div>
              </div>
            </div>
          </div>

          {/* Member 2: Manuthi Kasuntha */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/manuthi.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Manuthi Kasuntha</div>
              </div>
            </div>
          </div>

          {/* Member 3: Chalindu Kalhara */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/chalindu.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Chalindu Kalhara</div>
              </div>
            </div>
          </div>

          {/* Member 4: Dasuni Senanayake */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/dasuni.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Dasuni Senanayake</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
