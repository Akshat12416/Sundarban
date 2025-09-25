import React, { useState, forwardRef } from 'react';

interface AnimatedButtonProps {
  text?: string;
  bgColor?: string;
  textColor?: string;
  onClick?: () => void;
}

const AnimatedButton = forwardRef<HTMLDivElement, AnimatedButtonProps>((props, ref) => {
  const { text = "Continue", bgColor = "white/80", textColor = "black", onClick } = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const finalBgColor = bgColor;
  const finalTextColor = textColor;



  // Parse bgColor to handle both solid colors and opacity values like "white/70" or "black/70"
  const getBackgroundStyle = () => {
    if (finalBgColor.includes('/')) {
      const [color, opacity] = finalBgColor.split('/');
      const opacityValue = parseInt(opacity) / 100;

      // Handle different color names
      switch (color.toLowerCase()) {
        case 'white':
          return { backgroundColor: `rgba(255, 255, 255, ${opacityValue})` };
        case 'black':
          return { backgroundColor: `rgba(0, 0, 0, ${opacityValue})` };
        case 'gray':
          return { backgroundColor: `rgba(128, 128, 128, ${opacityValue})` };
        case 'red':
          return { backgroundColor: `rgba(255, 0, 0, ${opacityValue})` };
        case 'green':
          return { backgroundColor: `rgba(29, 191, 115, ${opacityValue})` };
        case 'blue':
          return { backgroundColor: `rgba(0, 0, 255, ${opacityValue})` };
        default:
          // For unknown colors, try to use Tailwind's color system
          return {};
      }
    } else {
      // Handle solid colors
      switch (finalBgColor.toLowerCase()) {
        case 'white':
          return { backgroundColor: '#ffffff' };
        case 'black':
          return { backgroundColor: '#000000' };
        case 'gray':
          return { backgroundColor: '#808080' };
        case 'red':
          return { backgroundColor: '#ff0000' };
        case 'green':
          return { backgroundColor: '#1DBF73' };
        case 'blue':
          return { backgroundColor: '#0000ff' };
        default:
          return {};
      }
    }
  };

  // Get Tailwind class for solid colors
  const getBgClass = () => {
    if (bgColor.includes('/')) {
      return 'bg-white'; // Fallback for opacity values
    }
    return ''; // Don't use Tailwind classes for solid colors, use inline styles instead
  };

  // Get text color style
  const getTextStyle = () => {
    switch (textColor.toLowerCase()) {
      case 'white':
        return { color: '#ffffff' };
      case 'black':
        return { color: '#000000' };
      case 'gray':
        return { color: '#808080' };
      case 'red':
        return { color: '#ff0000' };
      case 'green':
        return { color: '#1DBF73' };
      case 'blue':
        return { color: '#0000ff' };
      default:
        return { color: '#000000' }; // Default to black
    }
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-full bg-transparent"
      style={{ width: '220px', height: '56px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center absolute top-0 transition-all duration-700 ease-in-out ${
          isHovered ? 'translate-x-16' : 'translate-x-0'
        }`}
        style={{ width: '300px', left: '-65px' }}
      >
        {/* Left Arrow - starts outside container, scales up when entering */}
        <div
          className={`w-14 h-14 bg-[#1DBF73] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-transform duration-700 ease-in-out ${
            isHovered ? 'scale-100' : 'scale-0'
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Gap */}
        <div className="w-1"></div>

        {/* Main Button */}
        <div
          className={`font-medium text-lg px-8 py-4 rounded-full cursor-pointer flex-shrink-0`}
          style={{
            minWidth: '160px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bgColor === 'black' ? '#000000' : bgColor === 'white' ? '#ffffff' : (getBackgroundStyle().backgroundColor || undefined),
            color: textColor === 'white' ? '#ffffff' : textColor === 'black' ? '#000000' : (getTextStyle().color || undefined)
          }}
          onClick={onClick}
        >
          {text}
        </div>

        {/* Gap */}
        <div className="w-1"></div>

        {/* Right Arrow - scales down when leaving */}
        <div
          className={`w-14 h-14 bg-[#1DBF73] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 transition-transform duration-700 ease-in-out ${
            isHovered ? 'scale-0' : 'scale-100'
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
});

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
