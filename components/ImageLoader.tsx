import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const ImageLoader: React.FC<Props> = ({ src, alt, className, containerClassName, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-white/5 ${containerClassName}`}>
      {/* Loading Spinner */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10">
          <div className="w-6 h-6 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white/40 bg-white/5 p-2 text-center">
          <ImageOff size={24} className="mb-1" />
          <span className="text-[10px]">Missing</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ImageLoader;
