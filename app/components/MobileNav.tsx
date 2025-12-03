'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

interface MobileNavProps {
  navLinks: Array<{ href: string; label: string }>;
}

export default function MobileNav({ navLinks }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        onClick={toggleMenu}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '10px',
          cursor: 'pointer',
          padding: '0.6rem',
          zIndex: 1001,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          boxShadow: isOpen ? '0 0 20px rgba(212, 175, 55, 0.3)' : 'none',
        }}
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X size={24} color="#d4af37" strokeWidth={2.5} />
          ) : (
            <Menu size={24} color="#d4af37" strokeWidth={2.5} />
          )}
        </motion.div>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMenu}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 998,
              }}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '5rem',
                left: '1rem',
                right: '1rem',
                background: 'linear-gradient(145deg, rgba(26, 26, 26, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.1) inset',
                zIndex: 999,
                padding: '2rem 1.5rem',
                maxHeight: 'calc(100vh - 7rem)',
                overflowY: 'auto',
              }}
            >
              {/* Gold accent line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                  marginBottom: '2rem',
                  borderRadius: '2px',
                }}
              />

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={toggleMenu}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '1.15rem',
                      fontWeight: '600',
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                      e.currentTarget.style.color = '#d4af37';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
                      style={{ display: 'flex' }}
                    >
                      <Sparkles size={18} color="#d4af37" />
                    </motion.div>
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </nav>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                }}
              >
                <motion.a
                  href="/demo"
                  onClick={toggleMenu}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #d4af37 0%, #c9a332 100%)',
                    color: '#000000',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.6)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Start Free Demo
                </motion.a>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
