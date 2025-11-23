'use client';

import React from 'react';
import Link from 'next/link';

const DemoPage = () => {
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#110E19',
      color: 'white',
      padding: '2rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#e5e7eb',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    optionsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
      width: '100%',
      maxWidth: '800px',
    },
    optionCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '2.5rem',
      textAlign: 'center',
      textDecoration: 'none',
      color: 'white',
      transition: 'background-color 0.3s, transform 0.3s',
    },
    optionIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem',
    },
    optionTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    optionDescription: {
      fontSize: '1rem',
      color: '#d1d5db',
      lineHeight: '1.6',
    },
    backLink: {
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      color: '#d1d5db',
      textDecoration: 'none',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <Link href="/" style={styles.backLink}>
        <span>&larr;</span> Back to Home
      </Link>
      <style jsx global>{`
        .option-card:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }
        @media (min-width: 768px) {
          .options-grid-responsive {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      <h1 style={styles.title}>Choose Your Demo</h1>
      <p style={styles.subtitle}>Explore the powerful capabilities of Billionets A.I.</p>
      <div style={styles.optionsGrid} className="options-grid-responsive">
        <Link href="/demo/try" style={styles.optionCard} className="option-card">
          <div style={styles.optionIcon}>🤖</div>
          <h2 style={styles.optionTitle}>Try Billionets A.I. Voice</h2>
          <p style={styles.optionDescription}>Instantly interact with our pre-trained Billionets A.I. to experience its intelligence and human-like interaction firsthand.</p>
        </Link>
        <Link href="/demo/create-agent" style={styles.optionCard} className="option-card">
          <div style={styles.optionIcon}>✨</div>
          <h2 style={styles.optionTitle}>Create Your Own Agent</h2>
          <p style={styles.optionDescription}>Train a custom AI agent by providing your website URL. The agent will learn from your content to answer questions accurately.</p>
        </Link>
      </div>
    </div>
  );
};

export default DemoPage;
