'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import AnimatedSection from './components/AnimatedSection';
import GlassCard from './components/GlassCard';
import FloatingBlobs from './components/FloatingBlobs';
import AnimatedIcon from './components/AnimatedIcon';
import ScrollReveal from './components/ScrollReveal';
import MobileNav from './components/MobileNav';
import { 
  Zap, Globe, Brain, Shield, BarChart3, PhoneCall, 
  Mic2, MessageSquare, Sparkles, Heart, Stethoscope, 
  ShoppingBag, Building2, Waves, SpeechIcon
} from 'lucide-react';

// The webhook URL to get a join token for Ultravox
const WEBHOOK_URL = 'https://n8n-642200223.kloudbeansite.com/webhook/ultravox_inbound';

export default function Page() {
  const [showDemo, setShowDemo] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [transcripts, setTranscripts] = useState<{ speaker: string; text: string, isFinal: boolean }[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Attempt to create and resume AudioContext on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
        } catch (e) {
          console.error("Could not create AudioContext", e);
        }
      }
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };

    window.addEventListener('click', enableAudio);
    window.addEventListener('keydown', enableAudio);

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Scroll to bottom of transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  const startCall = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    
    setShowDemo(true);
    setIsBusy(true);
    setError(null);
    setTranscripts([]);
    setCallStatus('connecting');

    try {
      // 1. Dynamically import ultravox-client
      const Ultravox = await import('ultravox-client');
      const UltravoxSession = Ultravox.UltravoxSession;

      if (!UltravoxSession) {
        throw new Error('Could not load UltravoxSession from ultravox-client. Run `npm install ultravox-client`');
      }

      // 2. Fetch join URL from the webhook
      console.log('Requesting join URL from:', WEBHOOK_URL);
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: window.location.origin }),
        mode: 'cors',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Webhook request failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      const joinUrl = data.joinUrl;

      if (!joinUrl) {
        throw new Error('Webhook response did not contain a joinUrl.');
      }
      console.log('Received join URL.');

      // 3. Create and connect the Ultravox session
      const session = new UltravoxSession();
      sessionRef.current = session;

      // 4. Set up event listeners
      session.addEventListener('status', () => {
        console.log('Status changed:', session.status);
        setCallStatus(session.status);
      });

      session.addEventListener('transcripts', () => {
        const newTranscripts = session.transcripts.map((t: any) => ({
          speaker: t.speaker,
          text: t.text,
          isFinal: t.isFinal,
        }));
        setTranscripts(newTranscripts);
      });

      console.log('Joining call...');
      await session.joinCall(joinUrl);
      console.log('Call joined successfully.');

      // Try to resume audio context after joining
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('Attempting to resume suspended AudioContext...');
        await audioContextRef.current.resume();
        console.log('AudioContext state:', audioContextRef.current.state);
      }

    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message);
      setCallStatus('error');
    } finally {
      setIsBusy(false);
    }
  }, []);

  const endCall = useCallback(async () => {
    setIsBusy(true);
    try {
      await sessionRef.current?.leaveCall();
      console.log('Call left.');
    } catch (err: any) {
      console.error('Error leaving call:', err);
      setError(err.message);
    } finally {
      sessionRef.current = null;
      setCallStatus('idle');
      setIsBusy(false);
      setShowDemo(false);
    }
  }, []);

  if (!showDemo) {
    return (
      <div style={styles.landingContainer}>
        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <a 
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
            </a>
            {/* Desktop Nav */}
            <div style={styles.navLinks} className="desktop-nav">
              <a 
                href="#features" 
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
              </a>
              <a 
                href="#use-cases" 
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
              </a>
              <a 
                href="/demo" 
                style={{
                  ...styles.navLink,
                  background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
                  color: '#000000',
                  fontWeight: '700',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Demo
              </a>
              <a 
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
              </a>
            </div>
            {/* Mobile Nav */}
            <div className="mobile-nav">
              <MobileNav 
                navLinks={[
                  { href: '#features', label: 'Features' },
                  { href: '#use-cases', label: 'Use Cases' },
                  { href: '/demo', label: 'Demo' },
                  { href: '/contact', label: 'Contact' },
                ]}
              />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={styles.hero} className="responsive-hero">
          {/* Floating Blobs Background */}
          <FloatingBlobs />
          
          {/* Floating Elements */}
          <div style={styles.floatingElement1} className="floating-1">
            <AnimatedIcon Icon={Mic2} size={56} variant="glow" />
          </div>
          <div style={styles.floatingElement2} className="floating-2">
            <AnimatedIcon Icon={Sparkles} size={56} variant="pulse" />
          </div>
          <div style={styles.floatingElement3} className="floating-3">
            <AnimatedIcon Icon={MessageSquare} size={48} variant="bounce" />
          </div>
          <div style={styles.floatingElement4} className="floating-4">
            <AnimatedIcon Icon={Zap} size={48} variant="spin" />
          </div>

          <AnimatedSection direction="scale" delay={0.2} duration={1}>
            <div style={styles.heroContent}>
            <div style={styles.heroTextContainer}>
              <h1 style={styles.heroTitle} className="responsive-hero-title">
                Experience the future of
                <br />
                <span style={styles.heroTitleGold}>AI voice interaction</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Transform your business with intelligent voice agents that understand,
                <br />
                respond, and engage in natural conversations.
              </p>
            </div>

            {/* Glowing CTA Button */}
            <div style={styles.ctaContainer}>
              <button 
                onClick={() => window.location.href = '/demo'} 
                style={styles.glowingButton}
                className="glowing-button"
              >
                <span style={styles.buttonText}>Try Live Demo</span>
                <span style={styles.buttonIcon}>→</span>
              </button>
            </div>

            <p style={styles.heroNote}>No credit card required • Start in seconds</p>
          </div>
          </AnimatedSection>
        </section>

        {/* Features Section */}
        <section style={styles.features} id="features">
          <AnimatedSection direction="up" delay={0.3}>
            <h2 style={styles.sectionTitle}>Featured Capabilities</h2>
          </AnimatedSection>
          <div style={styles.featureGrid} className="feature-grid">
            <ScrollReveal direction="up" delay={0.1}>
              <GlassCard className="feature-card">
                <div style={styles.featureCard}>
                  <div style={styles.featureIconContainer}>
                    <AnimatedIcon Icon={Zap} size={52} variant="3d" />
                  </div>
                  <h3 style={styles.featureTitle}>Ultra-Low Latency</h3>
                  <p style={styles.featureText}>
                    Real-time voice processing with minimal delay for natural conversations.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <GlassCard className="feature-card">
                <div style={styles.featureCard}>
                  <div style={styles.featureIconContainer}>
                    <AnimatedIcon Icon={Globe} size={52} variant="spin" />
                  </div>
                  <h3 style={styles.featureTitle}>26+ Languages</h3>
                  <p style={styles.featureText}>
                    Multi-lingual support to engage a global audience seamlessly.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <GlassCard className="feature-card">
                <div style={styles.featureCard}>
                  <div style={styles.featureIconContainer}>
                    <AnimatedIcon Icon={Brain} size={52} variant="pulse" />
                  </div>
                  <h3 style={styles.featureTitle}>Knowledge RAG</h3>
                  <p style={styles.featureText}>
                    AI agents that learn from your business data for accurate responses.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.4}>
              <GlassCard className="feature-card">
                <div style={styles.featureCard}>
                  <div style={styles.featureIconContainer}>
                    <AnimatedIcon Icon={Shield} size={52} variant="glow" />
                  </div>
                  <h3 style={styles.featureTitle}>Enterprise Security</h3>
                  <p style={styles.featureText}>
                    End-to-end encryption with enterprise-grade data protection.
                  </p>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

        {/* What We Provide Section */}
        <section style={styles.whatWeProvide} className="responsive-section">
          <AnimatedSection direction="up" delay={0.2}>
            <h2 style={styles.sectionTitle}>Advanced Features</h2>
          </AnimatedSection>
          <div style={styles.provideGrid} className="provide-grid">
            <ScrollReveal direction="left" delay={0.1}>
              <div style={styles.provideCard} className="provide-card">
                <div style={styles.provideIconGold}>
                  <AnimatedIcon Icon={BarChart3} size={56} variant="bounce" />
                </div>
                <h3 style={styles.provideTitle}>Conversation Analytics</h3>
                <p style={styles.provideText}>Deep insights from call data to understand customer sentiment and behavior patterns.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <div style={styles.provideCard} className="provide-card">
                <div style={styles.provideIconGold}>
                  <AnimatedIcon Icon={PhoneCall} size={56} variant="pulse" />
                </div>
                <h3 style={styles.provideTitle}>Smart Call Transfer</h3>
                <p style={styles.provideText}>Seamlessly transition from AI to human agents when needed.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.3}>
              <div style={styles.provideCard} className="provide-card">
                <div style={styles.provideIconGold}>
                  <AnimatedIcon Icon={Waves} size={56} variant="glow" />
                </div>
                <h3 style={styles.provideTitle}>Voice Cloning</h3>
                <p style={styles.provideText}>Custom-branded voice that matches your company's unique identity.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.4}>
              <div style={styles.provideCard} className="provide-card">
                <div style={styles.provideIconGold}>
                  <AnimatedIcon Icon={Building2} size={56} variant="3d" />
                </div>
                <h3 style={styles.provideTitle}>CRM Integration</h3>
                <p style={styles.provideText}>Automatic data sync with your existing CRM and business tools.</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Use Cases Section */}
        <section style={styles.useCases} className="responsive-section" id="use-cases">
          <AnimatedSection direction="up" delay={0.2}>
            <h2 style={styles.sectionTitle}>Industries We Transform</h2>
          </AnimatedSection>
          <div style={styles.useCaseGrid} className="use-case-grid">
            <ScrollReveal direction="scale" delay={0.1}>
              <div style={styles.useCaseCard} className="use-case-card">
                <div style={styles.useCaseIconWrapper}>
                  <AnimatedIcon Icon={Stethoscope} size={40} color="#d4af37" variant="pulse" />
                </div>
                <h3 style={styles.useCaseTitle}>Healthcare</h3>
                <p style={styles.useCaseText}>
                  Patient intake, appointment scheduling, and 24/7 medical support with HIPAA compliance.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={0.2}>
              <div style={styles.useCaseCard} className="use-case-card">
                <div style={styles.useCaseIconWrapper}>
                  <AnimatedIcon Icon={ShoppingBag} size={40} color="#d4af37" variant="bounce" />
                </div>
                <h3 style={styles.useCaseTitle}>E-Commerce</h3>
                <p style={styles.useCaseText}>
                  Product recommendations, order tracking, and personalized shopping experiences.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={0.3}>
              <div style={styles.useCaseCard} className="use-case-card">
                <div style={styles.useCaseIconWrapper}>
                  <AnimatedIcon Icon={Heart} size={40} color="#d4af37" variant="glow" />
                </div>
                <h3 style={styles.useCaseTitle}>Finance</h3>
                <p style={styles.useCaseText}>
                  Secure account inquiries, fraud detection, and financial advisory services.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={0.4}>
              <div style={styles.useCaseCard} className="use-case-card">
                <div style={styles.useCaseIconWrapper}>
                  <AnimatedIcon Icon={Building2} size={40} color="#d4af37" variant="3d" />
                </div>
                <h3 style={styles.useCaseTitle}>Enterprise</h3>
                <p style={styles.useCaseText}>
                  Internal helpdesk, HR automation, and employee onboarding at scale.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>


        {/* CTA Section */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaSectionTitle}>Ready to transform your business?</h2>
            <p style={styles.ctaSectionText}>
              Join leading companies using Billionets A.I to revolutionize customer engagement.
            </p>
            <div style={styles.ctaButtons} className="cta-buttons">
              <button 
                onClick={() => window.location.href = '/demo'} 
                style={styles.ctaPrimaryButton}
                className="cta-primary"
              >
                Start Free Demo
              </button>
              <button 
                onClick={() => window.location.href = '/contact'} 
                style={styles.ctaSecondaryBtn}
                className="cta-secondary"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <p>© 2025 Billionets A.I. All rights reserved.</p>
            <button onClick={() => window.location.href = '/contact'} style={styles.footerContactButton}>
              Contact Us
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.demoHeader}>
        <button onClick={endCall} style={styles.backButton}>← Back to Home</button>
        <h1 style={styles.demoTitle}>🎙️ Billionets A.I Demo</h1>
      </div>

      <div style={styles.main}>
        {/* Animated Microphone Section */}
        <div style={styles.micSection}>
          <div style={{
            ...styles.micContainer,
            animation: (callStatus === 'listening' || callStatus === 'speaking') ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" 
              alt="AI Agent" 
              style={styles.agentImage} 
            />
          </div>
          <p style={styles.micStatus}>
            {callStatus === 'listening' && '🟢 Listening...'}
            {callStatus === 'speaking' && '🔵 AI Speaking...'}
            {callStatus === 'connecting' && '🟡 Connecting...'}
            {callStatus === 'idle' && '⚪ Ready'}
            {callStatus === 'error' && '🔴 Error'}
          </p>
        </div>

        <div style={styles.controls} className="responsive-controls">
          <div style={styles.statusBadge}>
            <span style={{...styles.statusIndicator, backgroundColor: getStatusColor(callStatus)}}></span>
            Status: <strong>{callStatus}</strong>
          </div>
          <button onClick={endCall} disabled={isBusy} style={{...styles.button, ...styles.dangerButton}}>
            {isBusy ? 'Ending...' : 'End Call'}
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        <div style={styles.transcriptWrapper}>
          <h3 style={styles.transcriptTitle}>Live Transcript</h3>
          <div style={styles.transcriptContainer} ref={transcriptContainerRef}>
            {transcripts.length === 0 ? (
              <div style={styles.noTranscript}>
                <p>💬 Conversation will appear here...</p>
                <p style={{fontSize: '0.875rem', marginTop: '0.5rem', color: '#9ca3af'}}>
                  Start speaking to see the live transcript
                </p>
              </div>
            ) : (
              transcripts.map((t, i) => (
                <div 
                  key={i} 
                  style={{
                    ...styles.transcriptLine,
                    opacity: t.isFinal ? 1 : 0.7,
                    backgroundColor: t.speaker === 'agent' ? '#f0f9ff' : '#fef3f2',
                    borderLeft: `4px solid ${t.speaker === 'agent' ? '#667eea' : '#f97316'}`,
                  }}
                >
                  <div style={styles.transcriptHeader}>
                    <strong style={{
                      ...styles.speaker,
                      color: t.speaker === 'agent' ? '#667eea' : '#f97316'
                    }}>
                      {t.speaker === 'user' ? '👤 You' : '🤖 AI Agent'}
                    </strong>
                    {!t.isFinal && <span style={styles.typing}>typing...</span>}
                  </div>
                  <span style={styles.transcriptText}>{t.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
            }
          }
        `}</style>
        <style jsx global>{`
          body {
            overflow-x: hidden;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .glowing-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(212, 175, 55, 0.7), 0 0 80px rgba(212, 175, 55, 0.4);
          }
          
          .provide-card:hover {
            transform: translateY(-8px);
            border-color: rgba(212, 175, 55, 0.5);
            box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);
          }
          
          .use-case-card:hover {
            transform: translateY(-5px);
            border-color: rgba(212, 175, 55, 0.3);
            box-shadow: 0 8px 30px rgba(212, 175, 55, 0.15);
          }
          
          .cta-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(212, 175, 55, 0.6);
          }
          
          .cta-secondary:hover {
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.05);
          }
          
          a[href]:hover {
            color: #d4af37 !important;
          }
          
          @media (max-width: 768px) {
            .responsive-hero {
              padding: 4rem 1rem 6rem !important;
            }
            .responsive-section {
              padding: 3rem 1rem !important;
            }
            .responsive-hero-title {
              font-size: 2.5rem !important;
            }
            .responsive-demo-container {
              padding: 1rem !important;
            }
            .responsive-demo-main {
              padding: 1.5rem !important;
            }
            .responsive-nav-content {
              padding: 1rem !important;
            }
            .responsive-controls {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }
            .floating-1, .floating-2, .floating-3, .floating-4 {
              display: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'listening':
    case 'speaking':
      return '#28a745'; // green
    case 'connecting':
      return '#ffc107'; // yellow
    case 'error':
      return '#dc3545'; // red
    default:
      return '#6c757d'; // gray
  }
};

const styles: { [key: string]: React.CSSProperties } = {
  // Landing Page Styles
  landingContainer: {
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
  floatingElement1: { position: 'absolute', top: '10%', left: '10%', opacity: 0.2, animation: 'float 6s ease-in-out infinite', zIndex: 1 } as React.CSSProperties,
  floatingElement2: { position: 'absolute', top: '20%', right: '15%', opacity: 0.2, animation: 'float 7s ease-in-out infinite', zIndex: 1 } as React.CSSProperties,
  floatingElement3: { position: 'absolute', bottom: '25%', left: '15%', opacity: 0.15, animation: 'float 8s ease-in-out infinite', zIndex: 1 } as React.CSSProperties,
  floatingElement4: { position: 'absolute', bottom: '15%', right: '10%', opacity: 0.15, animation: 'float 5s ease-in-out infinite', zIndex: 1 } as React.CSSProperties,
  heroContent: {
    maxWidth: '100%',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
    padding: '0 0.5rem',
  },
  heroTextContainer: {
    marginBottom: '2rem',
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
    marginBottom: '0',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    padding: '0 0.5rem',
  },
  ctaContainer: {
    margin: '2rem 0 1.5rem',
  },
  glowingButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    border: '2px solid #d4af37',
    borderRadius: '50px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
    color: '#000000',
    fontWeight: '700',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '280px',
    justifyContent: 'center',
  },
  buttonText: { display: 'inline-block' },
  buttonIcon: { fontSize: '1.3rem', display: 'inline-block' },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ctaButton: {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#667eea',
    fontWeight: 'bold',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
  ctaSecondaryButton: {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    border: '2px solid white',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'white',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  heroNote: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '0.03em',
  },
  features: {
    padding: '3rem 1.25rem',
    backgroundColor: '#0a0a0a',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#ffffff',
    letterSpacing: '-0.01em',
    padding: '0 0.5rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  featureCard: {
    background: 'transparent',
    padding: '1.75rem 1.25rem',
    borderRadius: '16px',
    border: 'none',
    textAlign: 'center',
  },
  featureIconContainer: {
    width: '60px',
    height: '60px',
    margin: '0 auto 1rem',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: '2rem',
  },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#ffffff',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    fontSize: '0.9rem',
  },
  whatWeProvide: {
    padding: '3rem 1.25rem',
    backgroundColor: '#000000',
  },
  provideGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  provideCard: {
    background: 'linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%)',
    padding: '1.75rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    textAlign: 'center',
    transition: 'all 0.4s',
  },
  provideIconGold: {
    marginBottom: '1rem',
    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  provideTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#d4af37',
  },
  provideText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    fontSize: '0.9rem',
  },
  useCases: {
    padding: '3rem 1.25rem',
    backgroundColor: '#0a0a0a',
  },
  useCaseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.25rem',
    maxWidth: '1300px',
    margin: '0 auto',
  },
  useCaseCard: {
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
    padding: '1.75rem 1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    transition: 'all 0.4s',
  },
  useCaseIconWrapper: {
    width: '50px',
    height: '50px',
    background: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  useCaseEmoji: {
    fontSize: '1.5rem',
  },
  useCaseTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#ffffff',
  },
  useCaseText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    fontSize: '0.9rem',
  },
  testimonials: {
    padding: '5rem 2rem',
    backgroundColor: '#f9fafb',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  stars: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  },
  testimonialText: {
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  testimonialAuthor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  testimonialRole: {
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  ctaSection: {
    padding: '3rem 1.25rem',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 0.5rem',
  },
  ctaSectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    lineHeight: '1.3',
  },
  ctaSectionText: {
    fontSize: '0.95rem',
    marginBottom: '2rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
  },
  ctaButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'stretch',
    maxWidth: '320px',
    margin: '0 auto',
  },
  ctaPrimaryButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    border: '2px solid #d4af37',
    borderRadius: '50px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
    color: '#000000',
    fontWeight: '700',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
    transition: 'all 0.3s',
    width: '100%',
  },
  ctaSecondaryBtn: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50px',
    cursor: 'pointer',
    background: 'transparent',
    color: '#ffffff',
    fontWeight: '600',
    transition: 'all 0.3s',
    width: '100%',
  },
  footer: {
    padding: '2rem 1.25rem',
    textAlign: 'center',
    borderTop: '1px solid rgba(212, 175, 55, 0.15)',
    backgroundColor: '#000000',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
  },
  footerContactButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.9rem',
    border: '1px solid rgba(212, 175, 55, 0.5)',
    borderRadius: '25px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#d4af37',
    fontWeight: '600',
    transition: 'all 0.3s',
    minHeight: '44px',
  },

  // Demo Interface Styles
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  demoHeader: {
    maxWidth: '900px',
    margin: '0 auto 2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    border: '2px solid white',
    borderRadius: '10px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: 'white',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  demoTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '3rem',
  },
  micSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  micContainer: {
    width: '120px',
    height: '120px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    backgroundColor: '#f0f9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #667eea',
    overflow: 'hidden',
  },
  agentImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  micIcon: {
    fontSize: '4rem',
  },
  micStatus: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f3f4f6',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1f2937',
  },
  statusIndicator: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
  button: {
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    backgroundColor: '#667eea',
    color: 'white',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    border: '2px solid #fecaca',
    fontSize: '1rem',
  },
  transcriptWrapper: {
    marginTop: '2rem',
  },
  transcriptTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  transcriptContainer: {
    height: '450px',
    overflowY: 'auto',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#fafafa',
  },
  noTranscript: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1.125rem',
    padding: '3rem 1rem',
  },
  transcriptLine: {
    marginBottom: '1rem',
    padding: '1rem',
    borderRadius: '10px',
    transition: 'all 0.3s',
  },
  transcriptHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  speaker: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  typing: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  transcriptText: {
    color: '#1f2937',
    fontSize: '1rem',
    lineHeight: '1.6',
    display: 'block',
  },
};
