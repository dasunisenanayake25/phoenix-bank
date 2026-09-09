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
            <div className="team-card-details">
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +94 710571733
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                kanishkapg1121@gmail.com
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                linkedin.com/in/kanishka-gunasinghe/
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
            <div className="team-card-details">
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +94 766020225
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                tharu0nethu@gmail.com
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                linkedin.com/in/tharunethu-wanniarachchi1/
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
            <div className="team-card-details">
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +94 779402148
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                levinduherath@gmail.com
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                linkedin.com/in/levindu-herath/
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
            <div className="team-card-details">
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                +94 706592381
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                pasindu.code2001@gmail.com
              </div>
              <div className="team-card-detail-item">
                <svg className="team-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                linkedin.com/in/imal-pasindu-hathnagoda-1a79982b3/
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
