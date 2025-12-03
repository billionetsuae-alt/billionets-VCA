'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: 'scale' | 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedSection({
  children,
  direction = 'scale',
  delay = 0,
  duration = 0.8,
  className = '',
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const element = sectionRef.current;
    
    // Initial state based on direction
    const initialState: gsap.TweenVars = {
      opacity: 0,
    };

    const finalState: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
    };

    switch (direction) {
      case 'scale':
        initialState.scale = 0.9;
        finalState.scale = 1;
        break;
      case 'up':
        initialState.y = 50;
        finalState.y = 0;
        break;
      case 'down':
        initialState.y = -50;
        finalState.y = 0;
        break;
      case 'left':
        initialState.x = 50;
        finalState.x = 0;
        break;
      case 'right':
        initialState.x = -50;
        finalState.x = 0;
        break;
    }

    gsap.set(element, initialState);
    gsap.to(element, finalState);
  }, [direction, delay, duration]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}
