import React, { useEffect, useRef } from 'react';

export const AdBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear the container first to prevent duplicates in strict mode
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://pl29639427.effectivecpmnetwork.com/5c/d7/00/5cd7005fccf5a43cf8f0e42393ddc073.js';
    script.async = true;
    script.dataset.cfasync = 'false';
    containerRef.current.appendChild(script);
    
  }, []);

  return (
    <div className="w-full my-4 flex justify-center items-center min-h-[50px] relative z-40 rounded-xl">
      <div ref={containerRef} id="ad-banner-container" className="w-full flex justify-center"></div>
    </div>
  );
};
