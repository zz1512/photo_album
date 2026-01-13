import React, { useEffect, useRef, useState } from 'react';
import { Photo } from '../types';
import { ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageLoader from './ImageLoader';

interface Props {
  photos: Photo[];
  year: number;
  onBack: () => void;
}

const GalleryRing: React.FC<Props> = ({ photos, year, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentRotation = useRef(0);
  const animationFrame = useRef<number>(0);
  const autoRotateSpeed = useRef(0.15); // Slightly slower for elegance

  // Auto rotate logic
  useEffect(() => {
    const animate = () => {
      if (!isDragging.current && !selectedPhoto) {
        currentRotation.current -= autoRotateSpeed.current;
        setRotation(currentRotation.current);
      }
      animationFrame.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame.current);
  }, [selectedPhoto]);

  // Pointer events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectedPhoto) return;
    isDragging.current = true;
    startX.current = e.clientX;
    autoRotateSpeed.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - startX.current;
    currentRotation.current += delta * 0.2; // sensitivity
    setRotation(currentRotation.current);
    startX.current = e.clientX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    autoRotateSpeed.current = 0.15; // Resume rotation
  };

  // Adjust radius based on screen size and photo count
  const isMobile = window.innerWidth < 768;
  const baseRadius = isMobile ? 180 : 400;
  const radius = Math.max(baseRadius, photos.length * (isMobile ? 25 : 45)); 
  const angleStep = 360 / photos.length;

  return (
    <div className="w-full h-full relative perspective-1200 overflow-hidden flex flex-col items-center justify-center z-20">
      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/30 text-white bg-black/20 backdrop-blur hover:bg-[#f3e5ab] hover:text-black transition-all"
        >
          <ChevronLeft size={20} /> Back
        </button>
      </div>
      
      <div className="absolute top-6 right-6 md:right-10 z-10 text-[#f3e5ab] font-playfair text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
        {year}
      </div>

      {/* 3D Scene */}
      <div 
        className="relative w-full h-[60vh] flex items-center justify-center perspective-1000 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          ref={containerRef}
          className="relative w-[120px] h-[180px] md:w-[160px] md:h-[240px] preserve-3d transition-transform duration-100 ease-out"
          style={{ 
            transform: `rotateX(-5deg) rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="absolute inset-0 bg-white/5 border-[2px] md:border-[3px] border-white/80 rounded-lg overflow-hidden cursor-pointer hover:border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-colors"
              style={{
                transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBoxReflect: 'below 10px linear-gradient(transparent 60%, rgba(255,255,255,0.2))'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhoto(photo);
              }}
            >
              <ImageLoader 
                src={photo.thumbnailUrl} 
                alt="" 
                className="w-full h-full object-cover pointer-events-none"
                containerClassName="w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 text-white/50 text-sm animate-pulse flex flex-col items-center">
        <span>Drag to rotate • Click to view</span>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2"></div>
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Changed from bg-black/95 to bg-black/85 to allow stars to show through
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] p-1 md:p-2 bg-gradient-to-br from-[#FFD700] to-[#f3e5ab] rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded overflow-hidden bg-black min-w-[300px] min-h-[400px]">
                <ImageLoader 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.description} 
                  className="max-w-full max-h-[85vh] object-contain" 
                  containerClassName="flex items-center justify-center w-full h-full"
                />
              </div>
              <div className="absolute -bottom-12 left-0 w-full text-center text-white/80 font-playfair text-xl">
                 {new Date(selectedPhoto.timestamp).toDateString()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryRing;