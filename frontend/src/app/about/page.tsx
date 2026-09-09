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

      <div className="page-content" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '32px', color: '#0b213f', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Our Mission</h2>
          <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '18px' }}>
            At PhoenixBank, we believe that financial success comes from clarity, discipline, and a trusted partner. 
            Our core architecture is built from the ground up utilizing Event-Driven Microservices (Apache Kafka) and 
            HashiCorp Vault to ensure that your wealth is protected by the highest enterprise security standards available today.
          </p>
        </div>

        <h2 style={{ fontSize: '32px', color: '#0056b3', textAlign: 'center', marginBottom: '24px', fontWeight: 'bold' }}>Our Team</h2>
        
        <div className="team-grid">
          {/* Member 1: Kanishka */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/kanishka.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Kanishka Gunasinghe</div>
                <div className="team-card-role">Project Manager/ Full Stack Developer</div>
              </div>
            </div>
          </div>

          {/* Member 2: Tharunethu */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/tharunethu.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Tharunethu Wanniarachchi</div>
                <div className="team-card-role">UX UI designer/ Full Stack Developer</div>
              </div>
            </div>
          </div>

          {/* Member 3: Levindu */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/levindu.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Levindu Herath</div>
                <div className="team-card-role">Mobile Developer</div>
              </div>
            </div>
          </div>

          {/* Member 4: Imal */}
          <div className="team-card">
            <div className="team-card-image-container" style={{ backgroundImage: 'url("/imal.jpg")' }}>
              <div className="team-card-overlay">
                <div className="team-card-name">Imal Pasindu Hathnagoda</div>
                <div className="team-card-role">Full Stack Developer</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
