import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  }[size];

  const textSize = {
    sm: 'text-sm font-bold tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Modern Unencapsulated Construction Logo: Precision Structural Beams and Crane Arm */}
      <svg
        className={`${iconDimensions} shrink-0`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Proyectos Construcciones"
      >
        {/* Main Structural Column (Slate 900) */}
        <path d="M22 102L48 18L68 18L42 102H22Z" fill="#0F172A" />
        {/* Upper Crane Boom & Beam (Construction Amber) */}
        <path d="M48 18L104 18L94 36L56 36L48 18Z" fill="#D97706" />
        {/* Middle Structural Girder (Steel Blue) */}
        <path d="M51 48L104 48L94 66L58 66L51 48Z" fill="#2563EB" />
        {/* Foundation Base Beam (Industrial Slate) */}
        <path d="M40 78L106 78L96 96L33 96L40 78Z" fill="#334155" />
        {/* Rigging Hook & Pivot */}
        <circle cx="106" cy="18" r="6" fill="#D97706" />
        <line
          x1="106"
          y1="18"
          x2="106"
          y2="48"
          stroke="#D97706"
          strokeWidth="3"
          strokeDasharray="4 3"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSize} text-slate-900 tracking-tight font-extrabold`}>
            PROYECTOS
          </span>
          <span className="text-[11px] font-bold text-amber-600 tracking-[0.2em] uppercase mt-0.5">
            CONSTRUCCIONES
          </span>
        </div>
      )}
    </div>
  );
};
