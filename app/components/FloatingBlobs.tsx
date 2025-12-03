'use client';

import React from 'react';

interface BlobProps {
  size: number;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  delay?: number;
  duration?: number;
  opacity?: number;
}

const Blob: React.FC<BlobProps> = ({
  size,
  top,
  left,
  bottom,
  right,
  delay = 0,
  duration = 20,
  opacity = 0.15,
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, rgba(212, 175, 55, ${opacity}), rgba(212, 175, 55, ${opacity * 0.3}))`,
    filter: 'blur(60px)',
    animation: `float-blob ${duration}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    top,
    left,
    bottom,
    right,
    pointerEvents: 'none',
  };

  return <div style={style} />;
};

export default function FloatingBlobs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Blob size={400} top="10%" left="5%" delay={0} duration={25} opacity={0.2} />
      <Blob size={350} top="60%" right="10%" delay={5} duration={30} opacity={0.15} />
      <Blob size={300} bottom="15%" left="15%" delay={10} duration={28} opacity={0.18} />
      <Blob size={450} top="30%" right="20%" delay={3} duration={35} opacity={0.12} />
      <Blob size={320} bottom="30%" right="5%" delay={8} duration={32} opacity={0.16} />
    </div>
  );
}
