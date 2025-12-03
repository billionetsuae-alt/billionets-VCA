'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AnimatedIcon from '../../components/AnimatedIcon';
import MobileNav from '../../components/MobileNav';
import { Mic2, Mic, MicOff, Phone, PhoneOff, User, Bot as BotIcon } from 'lucide-react';

const WEBHOOK_URL = 'https://n8n-642200223.kloudbeansite.com/webhook/ultravox_inbound';

const TryPageClient = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [transcripts, setTranscripts] = useState<{ speaker: string; text: string, isFinal: boolean }[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasStartedRef = useRef(false);
  const searchParams = useSearchParams();

  const endCall = useCallback(async () => {
    setIsBusy(true);
    try {
      await sessionRef.current?.leaveCall();
    } catch (err: any) {
      console.error('Error leaving call:', err);
      setError(err.message);
    } finally {
      sessionRef.current = null;
      setCallStatus('idle');
      setIsBusy(false);
      // Go back to the demo options page
      window.location.href = '/demo';
    }
  }, []);

  const startCall = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    
    setIsBusy(true);
    setError(null);
    setTranscripts([]);
    setCallStatus('connecting');

    try {
      const Ultravox = await import('ultravox-client');
      const UltravoxSession = Ultravox.UltravoxSession;

      if (!UltravoxSession) {
        throw new Error('Could not load UltravoxSession from ultravox-client. Run `npm install ultravox-client`');
      }

      let joinUrl = searchParams.get('joinUrl');

      if (!joinUrl) {
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
        joinUrl = data.joinUrl;
      }

      if (!joinUrl) {
        throw new Error('Webhook response did not contain a joinUrl.');
      }

      const session = new UltravoxSession();
      sessionRef.current = session;

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

      await session.joinCall(joinUrl);

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

    } catch (err: any) {
      console.error('Error starting call:', err);
      setError(err.message);
      setCallStatus('error');
    } finally {
      setIsBusy(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

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

    // Start call automatically on page load
    startCall();

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
      // We don't auto-end call on unmount to prevent cleanup issues during strict mode re-renders
      // But in production, you might want to cleanup.
      if (sessionRef.current) {
         sessionRef.current.leaveCall().catch((err: any) => console.error("Cleanup error", err));
      }
    };
  }, [startCall]);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

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
              ← Demo Options
            </Link>
            <button 
              onClick={endCall}
              style={{
                ...styles.navLink,
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              End Call
            </button>
          </div>
          {/* Mobile Nav */}
          <div className="mobile-nav">
            <MobileNav 
              navLinks={[
                { href: '/demo', label: 'Demo Options' },
                { href: '/', label: 'Home' },
              ]}
            />
          </div>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.main}>
        <div style={styles.horizontalControls} className="horizontal-controls-container">
          {/* Icon Section */}
          <div style={styles.iconSection} className="icon-section">
            <div style={{
              ...styles.micContainer,
              animation: (callStatus === 'listening' || callStatus === 'speaking') ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}>
              {callStatus === 'listening' ? (
                <Mic size={32} color="#d4af37" strokeWidth={2} />
              ) : callStatus === 'speaking' ? (
                <AnimatedIcon Icon={BotIcon} size={32} color="#d4af37" variant="pulse" />
              ) : (
                <MicOff size={32} color="rgba(212, 175, 55, 0.5)" strokeWidth={2} />
              )}
            </div>
            <p style={styles.micStatus}>
              {callStatus === 'listening' && 'Listening...'}
              {callStatus === 'speaking' && 'AI Speaking...'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'idle' && 'Ready'}
              {callStatus === 'error' && 'Error'}
            </p>
          </div>

          {/* Status Badge */}
          <div style={styles.statusBadge} className="status-badge">
            <span style={{...styles.statusIndicator, backgroundColor: getStatusColor(callStatus)}}></span>
            <span>Status: <strong>{callStatus}</strong></span>
          </div>
          
          {/* Call Button */}
          {(callStatus === 'idle' || callStatus === 'error') ? (
            <button 
              onClick={startCall} 
              disabled={isBusy} 
              style={{
                ...styles.button,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <Phone size={18} />
              {isBusy ? 'Starting...' : 'Start Call'}
            </button>
          ) : (
            <button 
              onClick={endCall} 
              disabled={isBusy} 
              style={{
                ...styles.button, 
                ...styles.dangerButton,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
              }}
            >
              <PhoneOff size={18} />
              {isBusy ? 'Ending...' : 'End Call'}
            </button>
          )}
        </div>

        {error && (
          <div style={styles.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={styles.transcriptWrapper}>
          <h3 style={styles.transcriptTitle}>Live Transcript</h3>
          <div style={styles.transcriptContainer} ref={transcriptContainerRef}>
            {transcripts.length === 0 ? (
              <div style={styles.noTranscript}>
                <Mic size={28} color="rgba(212, 175, 55, 0.3)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ margin: '0 0 0.5rem 0' }}>Conversation will appear here...</p>
                <p style={{fontSize: '0.75rem', margin: 0, color: 'rgba(255, 255, 255, 0.4)'}}>
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
                    backgroundColor: t.speaker === 'agent' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    borderLeft: `3px solid ${t.speaker === 'agent' ? '#d4af37' : 'rgba(255, 255, 255, 0.3)'}`,
                  }}
                >
                  <div style={styles.transcriptHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {t.speaker === 'user' ? (
                        <User size={16} color="rgba(255, 255, 255, 0.9)" />
                      ) : (
                        <BotIcon size={16} color="#d4af37" />
                      )}
                      <strong style={{
                        ...styles.speaker,
                        color: t.speaker === 'agent' ? '#d4af37' : 'rgba(255, 255, 255, 0.9)'
                      }}>
                        {t.speaker === 'user' ? 'You' : 'AI Agent'}
                      </strong>
                    </div>
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
              box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 20px rgba(212, 175, 55, 0);
            }
          }
        `}</style>
        </div>
      </div>
    </div>
  );
};

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
    minHeight: 'calc(100vh - 80px)',
    padding: '1.5rem 1rem',
  },
  main: {
    maxWidth: '850px',
    margin: '0 auto',
    background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '1.5rem 1.5rem',
  },
  horizontalControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    flexWrap: 'wrap',
  },
  iconSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '100px',
  },
  micContainer: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'rgba(212, 175, 55, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)',
  },
  agentImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  micStatus: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#d4af37',
    margin: 0,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#d4af37',
    padding: '0.6rem 1.5rem',
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '8px',
    justifyContent: 'center',
    minWidth: 'fit-content',
    whiteSpace: 'nowrap',
  },
  statusIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(0,0,0,0.4)',
  },
  button: {
    padding: '0.6rem 1.75rem',
    fontSize: '0.95rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
    color: '#000000',
    fontWeight: '700',
    transition: 'all 0.3s',
    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
    minWidth: 'fit-content',
  },
  dangerButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontSize: '0.875rem',
  },
  transcriptWrapper: {
    marginTop: '1rem',
  },
  transcriptTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#d4af37',
    marginBottom: '0.75rem',
  },
  transcriptContainer: {
    height: '350px',
    overflowY: 'auto',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '10px',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  noTranscript: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
    padding: '2rem 1rem',
  },
  transcriptLine: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    transition: 'all 0.3s',
    background: 'rgba(212, 175, 55, 0.05)',
  },
  transcriptHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.4rem',
  },
  speaker: {
    fontSize: '0.875rem',
    fontWeight: '700',
  },
  typing: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  transcriptText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    display: 'block',
  },
};

export default TryPageClient;
