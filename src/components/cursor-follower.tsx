'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function CursorFollower() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
        )}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}
