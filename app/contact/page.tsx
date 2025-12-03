'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AnimatedIcon from '../components/AnimatedIcon';
import MobileNav from '../components/MobileNav';
import FloatingBlobs from '../components/FloatingBlobs';
import { Mic2, MapPin, Mail, Phone, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('https://n8n-642200223.kloudbeansite.com/webhook/contactbnform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              Use Cases
            </Link>
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
              Demo
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
                { href: '/#features', label: 'Features' },
                { href: '/#use-cases', label: 'Use Cases' },
                { href: '/demo', label: 'Demo' },
                { href: '/', label: 'Home' },
              ]}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <FloatingBlobs />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle} className="contact-hero-title">
            Get in <span style={styles.heroTitleGold}>Touch</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Let's discuss how Billionets A.I can transform your business
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section style={styles.contactSection} className="contact-section">
        <div style={styles.contactContainer} className="contact-container-grid">
          {/* Contact Form */}
          <div style={styles.formWrapper}>
            <h2 style={styles.formTitle}>Send us a Message</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Your full name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="your@email.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+971 XXX XXX XXX"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Your company name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={styles.textarea}
                  placeholder="Tell us about your project..."
                  rows={5}
                />
              </div>

              {submitStatus === 'success' && (
                <div style={styles.successMessage}>
                  ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div style={styles.errorMessage}>
                  ❌ {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.submitButton,
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div style={styles.infoWrapper}>
            <h2 style={styles.infoTitle}>Contact Information</h2>
            <p style={styles.infoDescription}>
              Reach out to us directly or visit our office. We're here to help you succeed.
            </p>

            <div style={styles.infoItems}>
              {/* Office Address */}
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <AnimatedIcon Icon={MapPin} size={28} color="#d4af37" variant="pulse" />
                </div>
                <div>
                  <h3 style={styles.infoItemTitle}>Office Address</h3>
                  <p style={styles.infoItemText}>
                    Billionets,<br />
                    Regal Tower,<br />
                    Business Bay,<br />
                    Dubai UAE
                  </p>
                </div>
              </div>

              {/* Email */}
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <AnimatedIcon Icon={Mail} size={28} color="#d4af37" variant="glow" />
                </div>
                <div>
                  <h3 style={styles.infoItemTitle}>Email</h3>
                  <a href="mailto:info@billionets.com" style={styles.infoLink}>
                    info@billionets.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <AnimatedIcon Icon={Phone} size={28} color="#d4af37" variant="bounce" />
                </div>
                <div>
                  <h3 style={styles.infoItemTitle}>Phone</h3>
                  <a href="tel:+971543219060" style={styles.infoLink}>
                    +971 543 219 060
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>
                  <AnimatedIcon Icon={Clock} size={28} color="#d4af37" variant="3d" />
                </div>
                <div>
                  <h3 style={styles.infoItemTitle}>Business Hours</h3>
                  <p style={styles.infoItemText}>
                    Sunday - Thursday<br />
                    9:00 AM - 6:00 PM GST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2025 Billionets A.I. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#000000',
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
  hero: {
    background: '#000000',
    color: 'white',
    padding: '4rem 1.25rem 5rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
    lineHeight: '1.3',
    color: '#ffffff',
  },
  heroTitleGold: {
    background: 'linear-gradient(135deg, #d4af37 0%, #f4e5a1 50%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
  },
  contactSection: {
    padding: '3rem 1.25rem',
    backgroundColor: '#0a0a0a',
  },
  contactContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  },
  formWrapper: {
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
    padding: '2rem 1.5rem',
    borderRadius: '20px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#d4af37',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    transition: 'all 0.3s',
    outline: 'none',
  },
  textarea: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    transition: 'all 0.3s',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    resize: 'vertical',
  },
  submitButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
    color: '#000000',
    fontWeight: '700',
    transition: 'all 0.3s',
    boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
    marginTop: '0.5rem',
  },
  successMessage: {
    padding: '1rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    borderRadius: '10px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontSize: '0.95rem',
  },
  errorMessage: {
    padding: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '10px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontSize: '0.95rem',
  },
  infoWrapper: {
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
    padding: '2rem 1.5rem',
    borderRadius: '20px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  infoTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#d4af37',
    marginBottom: '1rem',
  },
  infoDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  infoItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  infoItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  infoIcon: {
    minWidth: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoItemTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: '0.5rem',
  },
  infoItemText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    margin: 0,
    fontSize: '0.9rem',
  },
  infoLink: {
    color: '#d4af37',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.3s',
  },
  footer: {
    padding: '2rem 1.25rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    color: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: '#000000',
  },
};
