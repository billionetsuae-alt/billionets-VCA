'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimatedIcon from '../../components/AnimatedIcon';
import MobileNav from '../../components/MobileNav';
import FloatingBlobs from '../../components/FloatingBlobs';
import { Mic2, Sparkles, Globe } from 'lucide-react';

const CreateAgentPage = () => {
  const [customAgentUrl, setCustomAgentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const router = useRouter();

  const handleCustomAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAgentUrl) {
      setSubmitMessage('Please enter a valid website URL.');
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage('Creating Agent...');

    // Ensure URL starts with https://
    let urlToSubmit = customAgentUrl.trim();
    // Remove existing protocol if user pasted it
    urlToSubmit = urlToSubmit.replace(/^https?:\/\//, '');
    // Add https:// prefix
    urlToSubmit = `https://${urlToSubmit}`;

    try {
      const response = await fetch('https://n8n-642200223.kloudbeansite.com/webhook/ultravox_inbound_custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToSubmit }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.joinUrl) {
          setSubmitMessage('Agent created! Redirecting to live demo...');
          router.push(`/demo/try?joinUrl=${encodeURIComponent(data.joinUrl)}`);
        } else {
          setSubmitMessage('Success! Your custom agent is being created. We will notify you once it is ready.');
          setCustomAgentUrl('');
        }
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again.');
      console.error('Webhook submission error:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

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
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '1.5rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    },
    content: {
      textAlign: 'center',
      maxWidth: '600px',
      width: '100%',
      position: 'relative',
      zIndex: 2,
    },
    iconContainer: {
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'center',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
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
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '2rem',
      lineHeight: '1.5',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      gap: '1rem',
    },
    inputWrapper: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.875rem',
      borderRadius: '10px',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      backgroundColor: 'rgba(212, 175, 55, 0.05)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s',
    },
    prefix: {
      color: '#d4af37',
      fontSize: '0.875rem',
      userSelect: 'none',
      fontWeight: '600',
    },
    input: {
      flex: 1,
      padding: '0.875rem 0 0.875rem 0.5rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: 'white',
      fontSize: '0.95rem',
      outline: 'none',
    },
    button: {
      padding: '0.875rem 1.75rem',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
      color: '#000000',
      fontSize: '0.95rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
    },
    message: {
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#d4af37',
      padding: '0.75rem',
      background: 'rgba(212, 175, 55, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(212, 175, 55, 0.3)',
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
              href="/demo" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              ← Back to Demo
            </Link>
            <Link 
              href="/" 
              style={styles.navLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d4af37';
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              Home
            </Link>
          </div>
          {/* Mobile Nav */}
          <div className="mobile-nav">
            <MobileNav 
              navLinks={[
                { href: '/demo', label: 'Demo Options' },
                { href: '/', label: 'Home' },
                { href: '/#features', label: 'Features' },
                { href: '/contact', label: 'Contact' },
              ]}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        <FloatingBlobs />
        
        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <AnimatedIcon Icon={Sparkles} size={56} color="#d4af37" variant="glow" />
          </div>
          
          <h1 style={styles.title}>
            Create Your <span style={styles.titleGold}>Own Agent</span>
          </h1>
          <p style={styles.subtitle}>
            Provide your website URL, and our AI will learn its content to build a knowledgeable agent for you.
          </p>
          
          <form onSubmit={handleCustomAgentSubmit} style={styles.form}>
            <div 
              style={styles.inputWrapper}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Globe size={18} color="#d4af37" style={{ marginRight: '0.5rem' }} />
              <span style={styles.prefix}>https://</span>
              <input
                type="text"
                value={customAgentUrl}
                onChange={(e) => setCustomAgentUrl(e.target.value)}
                placeholder="your-website.com"
                style={styles.input}
                required
              />
            </div>
            <button 
              type="submit" 
              style={styles.button} 
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </form>
          
          {submitMessage && <p style={styles.message}>{submitMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default CreateAgentPage;
