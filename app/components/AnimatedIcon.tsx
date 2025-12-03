'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  variant?: '3d' | 'glow' | 'pulse' | 'spin' | 'bounce';
  className?: string;
}

export default function AnimatedIcon({
  Icon,
  size = 48,
  color = '#d4af37',
  variant = '3d',
  className = '',
}: AnimatedIconProps) {
  const getAnimation = () => {
    switch (variant) {
      case '3d':
        return {
          animate: { y: [0, -10, 0] },
          whileHover: { rotateY: 360, scale: 1.2 },
          transition: { duration: 3, repeat: Infinity }
        };
      case 'glow':
        return {
          animate: {
            filter: [
              'drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))',
              'drop-shadow(0 0 15px rgba(212, 175, 55, 0.6))',
              'drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))',
            ],
          },
          whileHover: { scale: 1.15 },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.1, 1] },
          whileHover: { scale: 1.2, rotate: [0, -10, 10, -10, 0] },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'spin':
        return {
          animate: { y: [0, -8, 0] },
          whileHover: { rotate: 360, scale: 1.2 },
          transition: { duration: 2.5, repeat: Infinity }
        };
      case 'bounce':
        return {
          animate: { y: [0, -12, 0] },
          whileHover: { y: -15, scale: 1.15 },
          transition: { duration: 1.5, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  const animation = getAnimation();

  return (
    <motion.div
      {...animation}
      style={{
        display: 'inline-block',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className={className}
    >
      <Icon 
        size={size} 
        color={color}
        strokeWidth={1.5}
      />
    </motion.div>
  );
}
