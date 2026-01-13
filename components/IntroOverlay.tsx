import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Photo } from '../types';

interface Props {
  photos: Photo[];
  onComplete: () => void;
}

const IntroOverlay: React.FC<Props> = ({ photos, onComplete }) => {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

  // Calculate heart shape positions
  useEffect(() => {
    // Only use first ~50 photos for the shape to avoid clutter
    const count = Math.min(photos.length, 50); 
    const newPositions = [];
    
    // Scale heart based on screen size
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? 8 : 12; 

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      // Heart equation
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      newPositions.push({
        x: x * scale, 
        y: y * scale 
      });
    }
    setPositions(newPositions);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [photos, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: 1, x: pos.x, y: pos.y, scale: 1 }}
          exit={{ opacity: 0, scale: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 1.2, type: 'spring', damping: 12 }}
          className="absolute w-8 h-12 md:w-12 md:h-16" 
        >
          <img
            src={photos[i % photos.length].thumbnailUrl}
            alt="memory"
            className="w-full h-full object-cover rounded border border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default IntroOverlay;
