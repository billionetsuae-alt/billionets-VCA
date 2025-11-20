'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const WEBHOOK_URL = 'https://n8n-6421994137235212.kloudbeansite.com/webhook/ultravox_inbound';

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
    <div style={styles.container}>
      <div style={styles.demoHeader}>
        <button onClick={endCall} style={styles.backButton}>← Back to Options</button>
        <h1 style={styles.demoTitle}>🎙️ Billionets A.I Demo</h1>
      </div>

      <div style={styles.main}>
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
          
          {(callStatus === 'idle' || callStatus === 'error') ? (
            <button onClick={startCall} disabled={isBusy} style={styles.button}>
              {isBusy ? 'Starting...' : 'Start Call'}
            </button>
          ) : (
            <button onClick={endCall} disabled={isBusy} style={{...styles.button, ...styles.dangerButton}}>
              {isBusy ? 'Ending...' : 'End Call'}
            </button>
          )}
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
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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

export default TryPageClient;
