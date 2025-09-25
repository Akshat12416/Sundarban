import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export const RotatingText: React.FC<RotatingTextProps> = ({ 
  words, 
  className = "",
  interval = 3000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
      {/* Invisible text to maintain layout */}
      <span className="opacity-0 select-none">
        {words.reduce((longest, word) => 
          word.length > longest.length ? word : longest, ""
        )}
      </span>
    </div>
  );
};