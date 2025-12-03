'use client';

import React from 'react';
import Link from 'next/link';
import AnimatedIcon from '../components/AnimatedIcon';
import MobileNav from '../components/MobileNav';
import GlassCard from '../components/GlassCard';
import FloatingBlobs from '../components/FloatingBlobs';
import { Mic2, Bot, Sparkles } from 'lucide-react';

const DemoPage = () => {
  const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    nav: {
      borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    },
    navContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0.875rem 1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      fontSize: '1.1rem',
      fontWeight: '800',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textDecoration: 'none',
    },
    logoIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.4rem',
      background: 'rgba(212, 175, 55, 0.1)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      transition: 'all 0.3s',
    },
    logoText: {
      background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a1 50%, #d4af37 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '0.08em',
      textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
    },
    navLinks: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    navLink: {
      color: 'rgba(255, 255, 255, 0.85)',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      letterSpacing: '0.02em',
      padding: '0.6rem 1.25rem',
      borderRadius: '10px',
      border: '1px solid transparent',
      position: 'relative',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '3rem 1.25rem',
      position: 'relative',
      overflow: 'hidden',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1rem',
      textAlign: 'center',
      color: '#ffffff',
      lineHeight: '1.3',
    },
    titleGold: {
      background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a1 50%, #d4af37 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '0.95rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '2.5rem',
      textAlign: 'center',
      lineHeight: '1.6',
    },
    optionsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      width: '100%',
      maxWidth: '900px',
      position: 'relative',
      zIndex: 2,
    },
    optionCard: {
      textAlign: 'center',
      textDecoration: 'none',
      color: 'white',
      padding: '2rem 1.5rem',
    },
    optionIconContainer: {
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'center',
    },
    optionTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#d4af37',
    },
    optionDescription: {
      fontSize: '0.95rem',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link 
            href="/"
            style={styles.logo}
            onMouseEnter={(e) => {
              const icon = e.currentTarget.querySelector('.logo-icon-container') as HTMLElement;
              if (icon) {
                icon.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
                icon.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              const icon = e.currentTarget.querySelector('.logo-icon-container') as HTMLElement;
              if (icon) {
                icon.style.boxShadow = 'none';
                icon.style.transform = 'scale(1)';
              }
            }}
          >
            <div style={styles.logoIcon} className="logo-icon-container logoIcon">
              <AnimatedIcon Icon={Mic2} size={24} variant="glow" />
            </div>
            <span style={styles.logoText}>BILLIONETS A.I</span>
          </Link>
          {/* Desktop Nav */}
          <div style={styles.navLinks} className="desktop-nav">
            <Link 
              href="/#features" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Features
            </Link>
            <Link 
              href="/#use-cases" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Use Cases
            </Link>
            <Link 
              href="/" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Home
            </Link>
            <Link 
              href="/contact" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Contact
            </Link>
          </div>
          {/* Mobile Nav */}
          <div className="mobile-nav">
            <MobileNav 
              navLinks={[
                { href: '/#features', label: 'Features' },
                { href: '/#use-cases', label: 'Use Cases' },
                { href: '/', label: 'Home' },
                { href: '/contact', label: 'Contact' },
              ]}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {/* Floating Blobs Background */}
        <FloatingBlobs />

        <h1 style={styles.title}>
          Choose Your <span style={styles.titleGold}>Demo</span>
        </h1>
        <p style={styles.subtitle}>
          Explore the powerful capabilities of Billionets A.I.
        </p>
        
        <div style={styles.optionsGrid} className="demo-options-grid">
          <Link href="/demo/try" style={{ textDecoration: 'none' }}>
            <GlassCard className="demo-card">
              <div style={styles.optionCard}>
                <div style={styles.optionIconContainer}>
                  <AnimatedIcon Icon={Bot} size={64} color="#d4af37" variant="3d" />
                </div>
                <h2 style={styles.optionTitle}>Try Billionets A.I. Voice</h2>
                <p style={styles.optionDescription}>
                  Instantly interact with our pre-trained Billionets A.I. to experience its intelligence and human-like interaction firsthand.
                </p>
              </div>
            </GlassCard>
          </Link>

          <Link href="/demo/create-agent" style={{ textDecoration: 'none' }}>
            <GlassCard className="demo-card">
              <div style={styles.optionCard}>
                <div style={styles.optionIconContainer}>
                  <AnimatedIcon Icon={Sparkles} size={64} color="#d4af37" variant="glow" />
                </div>
                <h2 style={styles.optionTitle}>Create Your Own Agent</h2>
                <p style={styles.optionDescription}>
                  Train a custom AI agent by providing your website URL. The agent will learn from your content to answer questions accurately.
                </p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
