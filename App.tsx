import React, { useState, useMemo, useRef } from 'react';
import StarryBackground from './components/StarryBackground';
import IntroOverlay from './components/IntroOverlay';
import TimelineView from './components/TimelineView';
import GalleryRing from './components/GalleryRing';
import { AppState, Photo, YearGroup } from './types';
import { detectAvailablePhotos, groupPhotosByYear, preloadPhotos } from './services/photoService';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [yearGroups, setYearGroups] = useState<YearGroup[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize Data & Preload
  const startJourney = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setLoadingProgress(10); 
    setLoadingText("Reading Memory Map...");

    try {
      // 1. Load the JSON Manifest
      const detectedPhotos = await detectAvailablePhotos();

      if (detectedPhotos.length === 0) {
        setLoadingText("No photos found.");
        setErrorMsg("Please run 'node scripts/generate-manifest.js' to generate your album data.");
        setIsLoading(false);
        return;
      }

      setLoadingText(`Found ${detectedPhotos.length} moments...`);
      setLoadingProgress(40);

      // 2. Group Data
      const groups = groupPhotosByYear(detectedPhotos);
      
      // 3. Preload Images (Fast check for first few)
      setLoadingText("Polishing Stars...");
      await preloadPhotos(detectedPhotos, (progress) => {
        const visualProgress = 40 + Math.round(progress * 0.6);
        setLoadingProgress(visualProgress);
      });

      // 4. Set State & Transition
      setPhotos(detectedPhotos);
      setYearGroups(groups);
      
      setLoadingText("Ready");
      setLoadingProgress(100);

      setTimeout(() => {
        setAppState(AppState.HEART_ANIMATION);
        setIsLoading(false);
        
        // Attempt auto-play audio
        if (audioRef.current) {
          audioRef.current.volume = 0.4;
          audioRef.current.play()
            .then(() => setIsMusicPlaying(true))
            .catch(e => console.log("Audio autoplay blocked", e));
        }
      }, 500);
    } catch (error) {
      console.error("Failed to load album", error);
      setLoadingText("Error loading album");
      setErrorMsg("Could not load photos.json. Make sure the file exists.");
      setIsLoading(false);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setAppState(AppState.GALLERY);
  };

  const handleBackToTimeline = () => {
    setSelectedYear(null);
    setAppState(AppState.TIMELINE);
  };

  // Get photos for current selected year
  const currentYearPhotos = useMemo(() => {
    return yearGroups.find(g => g.year === selectedYear)?.photos || [];
  }, [yearGroups, selectedYear]);

  return (
    <div className="relative w-full h-screen text-white overflow-hidden font-lato select-none">
      <StarryBackground />
      
      {/* Hidden Audio */}
      <audio ref={audioRef} src="https://assets.mixkit.co/music/preview/mixkit-romantic-moment-140.mp3" loop />
      
      {/* Music Control */}
      {appState !== AppState.LANDING && (
        <button 
          onClick={toggleMusic}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-[#f3e5ab] hover:text-black border border-white/20 transition-all backdrop-blur-md"
        >
          {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      )}

      <AnimatePresence mode='wait'>
        {/* SCENE 1: LANDING */}
        {appState === AppState.LANDING && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-full z-10 relative px-4"
          >
            <h1 className="font-playfair text-5xl md:text-7xl mb-8 text-[#f3e5ab] text-center drop-shadow-[0_0_20px_rgba(243,229,171,0.5)]">
              Our Love Story
            </h1>
            <p className="mb-12 text-lg text-white/70 tracking-widest uppercase text-center">Every moment with you is a treasure</p>
            
            <button 
              onClick={startJourney}
              disabled={isLoading}
              className="group relative px-10 py-4 border border-[#f3e5ab] text-[#f3e5ab] rounded-full text-xl overflow-hidden transition-all duration-300 w-80 h-16 flex items-center justify-center"
            >
              <div className={`absolute inset-0 bg-[#f3e5ab] transition-transform duration-300 origin-left ${isLoading ? 'opacity-20' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ transform: isLoading ? `scaleX(${loadingProgress / 100})` : undefined }}></div>
              
              <span className={`relative z-10 flex items-center gap-3 group-hover:text-black transition-colors ${isLoading ? 'text-[#f3e5ab]' : ''}`}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> 
                    <span className="text-sm">{loadingText}</span>
                  </>
                ) : (
                  "Open Memory Album"
                )}
              </span>
            </button>
            
            {errorMsg && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm max-w-md text-center">
                    {errorMsg}
                </div>
            )}
            
            <div className="mt-8 text-white/20 text-xs">
                 Powered by React & Starlight
            </div>
          </motion.div>
        )}

        {/* SCENE 2: HEART ANIMATION */}
        {appState === AppState.HEART_ANIMATION && (
          <IntroOverlay 
            photos={photos} 
            onComplete={() => setAppState(AppState.TIMELINE)} 
          />
        )}

        {/* SCENE 3: TIMELINE */}
        {appState === AppState.TIMELINE && (
          <motion.div 
            key="timeline"
            className="w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <TimelineView yearGroups={yearGroups} onSelectYear={handleYearSelect} />
          </motion.div>
        )}

        {/* SCENE 4: GALLERY */}
        {appState === AppState.GALLERY && selectedYear && (
          <motion.div 
            key="gallery"
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          >
            <GalleryRing 
              photos={currentYearPhotos} 
              year={selectedYear} 
              onBack={handleBackToTimeline} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
