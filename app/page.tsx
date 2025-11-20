'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

// The webhook URL to get a join token for Ultravox
const WEBHOOK_URL = 'https://n8n-6421994137235212.kloudbeansite.com/webhook/ultravox_inbound';

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
          <div style={styles.navContent} className="responsive-nav-content">
            <div style={styles.logo}>
              <div style={styles.logoIcon}>🎙️</div>
              <span style={styles.logoText}>Billionets A.I</span>
            </div>
            <button onClick={startCall} style={styles.navButton}>Try Demo</button>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={styles.hero} className="responsive-hero">
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle} className="responsive-hero-title">
              Talk to AI Like Never Before
            </h1>
            <p style={styles.heroSubtitle}>
              Experience natural, real-time voice conversations with advanced AI agents. 
              Powered by cutting-edge voice technology for seamless human-AI interaction.
            </p>
            <div style={styles.heroButtons}>
              <button onClick={startCall} disabled={isBusy} style={styles.ctaButton}>
                {isBusy ? 'Starting...' : 'Try Live Demo'}
              </button>
              <button onClick={() => window.location.href = '/contact'} style={styles.ctaSecondaryButton}>
                Contact Sales
              </button>
            </div>
            <p style={styles.heroNote}>No credit card required • Instant access</p>
          </div>
        </section>

        {/* Features Section */}
        <section style={styles.features}>
          <h2 style={styles.sectionTitle}>Why Choose Billionets A.I?</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>⚡</div>
              <h3 style={styles.featureTitle}>Lightning Fast</h3>
              <p style={styles.featureText}>
                Ultra-low latency conversations that feel natural and instantaneous.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h3 style={styles.featureTitle}>Highly Accurate</h3>
              <p style={styles.featureText}>
                Advanced speech recognition with real-time transcription accuracy.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3 style={styles.featureTitle}>Secure & Private</h3>
              <p style={styles.featureText}>
                End-to-end encrypted conversations. Your data stays private.
              </p>
            </div>
          </div>
        </section>

        {/* What We Provide Section */}
        <section style={styles.whatWeProvide} className="responsive-section">
          <h2 style={styles.sectionTitle}>What We Provide</h2>
          <div style={styles.provideGrid}>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>🌐</div>
              <h3 style={styles.provideTitle}>Multi-lingual Support</h3>
              <p style={styles.provideText}>Engage a global audience with fluent support for 26 languages, breaking down all communication barriers.</p>
            </div>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>🧠</div>
              <h3 style={styles.provideTitle}>Knowledge RAG</h3>
              <p style={styles.provideText}>Our agent learns everything about your business, providing accurate and context-aware responses instantly.</p>
            </div>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>📊</div>
              <h3 style={styles.provideTitle}>Conversation Analytics</h3>
              <p style={styles.provideText}>Gain deep insights from call data with advanced analytics to understand customer sentiment and trends.</p>
            </div>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>📲</div>
              <h3 style={styles.provideTitle}>Call Transferring</h3>
              <p style={styles.provideText}>Seamlessly transfer calls from the AI agent to a human operator for complex issue resolution.</p>
            </div>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>🗣️</div>
              <h3 style={styles.provideTitle}>Voice Cloning</h3>
              <p style={styles.provideText}>Create a unique brand identity with a custom-cloned voice that perfectly matches your brand's persona.</p>
            </div>
            <div style={styles.provideCard}>
              <div style={styles.provideIcon}>🗂️</div>
              <h3 style={styles.provideTitle}>Advanced CRM Integration</h3>
              <p style={styles.provideText}>Automatically collect and sync user data with your CRM, streamlining your sales and support workflows.</p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section style={styles.useCases} className="responsive-section">
          <h2 style={styles.sectionTitle}>Perfect For Every Industry</h2>
          <div style={styles.useCaseGrid}>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>🏥 Healthcare</h3>
              <p style={styles.useCaseText}>
                Virtual health assistants, patient intake, appointment scheduling, and 24/7 medical support.
              </p>
            </div>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>🛍️ E-Commerce</h3>
              <p style={styles.useCaseText}>
                Product recommendations, order tracking, customer service, and personalized shopping assistance.
              </p>
            </div>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>🏦 Finance</h3>
              <p style={styles.useCaseText}>
                Account inquiries, fraud detection, transaction support, and financial planning guidance.
              </p>
            </div>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>📚 Education</h3>
              <p style={styles.useCaseText}>
                Tutoring, language learning, study assistance, and interactive educational experiences.
              </p>
            </div>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>🏢 Enterprise</h3>
              <p style={styles.useCaseText}>
                Internal helpdesk, HR support, employee onboarding, and automated workflows.
              </p>
            </div>
            <div style={styles.useCaseCard}>
              <h3 style={styles.useCaseTitle}>✈️ Travel</h3>
              <p style={styles.useCaseText}>
                Booking assistance, itinerary planning, real-time updates, and concierge services.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={styles.testimonials}>
          <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
          <div style={styles.testimonialGrid}>
            <div style={styles.testimonialCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.testimonialText}>
                "Billionets A.I transformed our customer service. The natural conversations and instant responses have increased our satisfaction rates by 40%."
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>Sarah Chen</strong>
                <span style={styles.testimonialRole}>CEO, TechRetail</span>
              </div>
            </div>
            <div style={styles.testimonialCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.testimonialText}>
                "The accuracy and speed are unmatched. Our patients love being able to schedule appointments by just talking naturally."
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>Dr. Michael Rodriguez</strong>
                <span style={styles.testimonialRole}>Medical Director, HealthPlus</span>
              </div>
            </div>
            <div style={styles.testimonialCard}>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.testimonialText}>
                "Implementation was seamless and the results were immediate. This is the future of customer interaction."
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>James Wilson</strong>
                <span style={styles.testimonialRole}>CTO, FinanceHub</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={styles.ctaSection}>
          <h2 style={styles.ctaSectionTitle}>Ready to Experience the Future?</h2>
          <p style={styles.ctaSectionText}>
            Start your free demo today and see how Billionets A.I can transform your business.
          </p>
          <div style={styles.ctaButtons}>
            <button onClick={startCall} disabled={isBusy} style={styles.ctaButton}>
              {isBusy ? 'Starting...' : 'Try Live Demo Now'}
            </button>
            <button onClick={() => window.location.href = '/contact'} style={styles.ctaSecondaryButton}>
              Get in Touch
            </button>
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
            <div style={styles.micIcon}>🤖</div>
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
          @media (max-width: 768px) {
            .responsive-hero {
              padding: 4rem 1rem !important;
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
    backgroundColor: '#ffffff',
  },
  nav: {
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navButton: {
    padding: '0.625rem 1.5rem',
    fontSize: '1rem',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6rem 2rem',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '2.5rem',
    opacity: 0.95,
    lineHeight: '1.6',
  },
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
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  features: {
    padding: '5rem 2rem',
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#1f2937',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1f2937',
  },
  featureText: {
    color: '#6b7280',
    lineHeight: '1.6',
  },
  whatWeProvide: {
    padding: '5rem 2rem',
    backgroundColor: 'white',
  },
  provideGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  provideCard: {
    backgroundColor: '#f9fafb',
    padding: '2.5rem 2rem',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  provideIcon: {
    fontSize: '3rem',
    marginBottom: '1.5rem',
    lineHeight: '1',
  },
  provideTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1f2937',
  },
  provideText: {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '0.95rem',
  },
  useCases: {
    padding: '5rem 2rem',
    backgroundColor: '#f9fafb',
  },
  useCaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  useCaseCard: {
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s',
  },
  useCaseTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#1f2937',
  },
  useCaseText: {
    color: '#6b7280',
    lineHeight: '1.6',
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
    padding: '5rem 2rem',
    backgroundColor: '#667eea',
    color: 'white',
    textAlign: 'center',
  },
  ctaSectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ctaSectionText: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.95,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footer: {
    padding: '2rem',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    color: '#6b7280',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  footerContactButton: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.95rem',
    border: '1px solid #667eea',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#667eea',
    fontWeight: '600',
    transition: 'all 0.3s',
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
