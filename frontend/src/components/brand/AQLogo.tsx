import React, { useId } from 'react';

export type LogoVariant = 'gradient' | 'badge' | 'mono-white' | 'mono-dark' | 'mono-blue';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface AQMonogramProps {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  title?: string;
  animated?: boolean;
}

export interface AQLogoProps extends AQMonogramProps {
  showWordmark?: boolean;
  showTagline?: boolean;
  wordmarkTheme?: 'auto' | 'dark' | 'light';
}

const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { icon: number; text: string; tagline: string; gap: string }> = {
  xs: { icon: 22, text: 'text-sm', tagline: 'text-[9px]', gap: 'gap-2' },
  sm: { icon: 28, text: 'text-base', tagline: 'text-[10px]', gap: 'gap-2.5' },
  md: { icon: 34, text: 'text-lg sm:text-xl', tagline: 'text-[10px]', gap: 'gap-3' },
  lg: { icon: 44, text: 'text-xl sm:text-2xl', tagline: 'text-xs', gap: 'gap-3.5' },
  xl: { icon: 56, text: 'text-2xl sm:text-3xl', tagline: 'text-xs', gap: 'gap-4' },
};

/**
 * AQMonogram: Custom Interlocking Lettermark.
 * Unites the distinct letterforms of 'A' and 'Q' into an interwoven luxury-tech symbol.
 * Features true under/over optical ribbon weaving and an elegant curved Q-tail.
 */
export const AQMonogram: React.FC<AQMonogramProps> = ({
  size = 'md',
  variant = 'gradient',
  className = '',
  title = 'ArchitectIQ Interlocking AQ Monogram',
  animated = false,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const pixelSize = typeof size === 'number' ? size : sizeMap[size]?.icon || 34;
  const heightSize = Math.round((pixelSize * 90) / 115);

  const isBadge = variant === 'badge';

  let primaryStroke = `url(#${uniqueId}-primary)`;
  let tailStroke = `url(#${uniqueId}-tail)`;

  if (variant === 'mono-white') {
    primaryStroke = '#FFFFFF';
    tailStroke = '#FFFFFF';
  } else if (variant === 'mono-dark') {
    primaryStroke = '#0B1428';
    tailStroke = '#0B1428';
  } else if (variant === 'mono-blue') {
    primaryStroke = '#287BFF';
    tailStroke = '#287BFF';
  }

  return (
    <svg
      width={pixelSize}
      height={isBadge ? pixelSize : heightSize}
      viewBox={isBadge ? '0 0 115 115' : '0 0 115 90'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`shrink-0 select-none transition-transform duration-200 ${className}`}
    >
      <defs>
        {/* Core Electric Blue to Cyan Gradient with Violet Accent */}
        <linearGradient
          id={`${uniqueId}-primary`}
          x1="14"
          y1="12"
          x2="104"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38D9F5" />
          <stop offset="55%" stopColor="#287BFF" />
          <stop offset="100%" stopColor="#795BFF" />
        </linearGradient>

        {/* Dynamic Q Tail Gradient: Electric Blue to Cyan */}
        <linearGradient
          id={`${uniqueId}-tail`}
          x1="62"
          y1="56"
          x2="106"
          y2="82"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#287BFF" />
          <stop offset="100%" stopColor="#38D9F5" />
        </linearGradient>

        {/* Midnight Navy Squircle Badge Background */}
        <linearGradient
          id={`${uniqueId}-badge-bg`}
          x1="0"
          y1="0"
          x2="115"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0B1428" />
          <stop offset="100%" stopColor="#141E36" />
        </linearGradient>

        {/* Squircle Badge Border Highlight */}
        <linearGradient
          id={`${uniqueId}-badge-border`}
          x1="0"
          y1="0"
          x2="115"
          y2="115"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(56, 217, 245, 0.45)" />
          <stop offset="50%" stopColor="rgba(40, 123, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(121, 91, 255, 0.25)" />
        </linearGradient>

        {/* True Vector Negative-Space Weave Mask for Q */}
        <mask id={`${uniqueId}-q-mask`}>
          <rect x="-10" y="-10" width="135" height="135" fill="#FFFFFF" />
          {/* Knockout where A's right leg passes OVER Q's top-left rim */}
          <path
            d="M 38 12 L 64 84"
            stroke="#000000"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </mask>
      </defs>

      {/* Badge container mode */}
      {isBadge && (
        <g>
          <rect
            x="2"
            y="2"
            width="111"
            height="111"
            rx="26"
            fill={`url(#${uniqueId}-badge-bg)`}
          />
          <rect
            x="2"
            y="2"
            width="111"
            height="111"
            rx="26"
            stroke={`url(#${uniqueId}-badge-border)`}
            strokeWidth="2"
          />
        </g>
      )}

      {/* Main Glyph Elements (Group offset if in badge) */}
      <g transform={isBadge ? 'translate(0, 12.5)' : undefined}>
        {/* 1. Letter Q Body: Masked at upper intersection to weave behind A's right leg */}
        <circle
          cx="70"
          cy="48"
          r="26"
          stroke={primaryStroke}
          strokeWidth="7.5"
          strokeLinecap="round"
          mask={`url(#${uniqueId}-q-mask)`}
          className={animated ? 'aq-stroke-anim-q' : undefined}
        />

        {/* 2. Letter A Complete Architecture */}
        {/* Left leg, sharp apex, right leg */}
        <path
          d="M 14 84 L 38 12 L 64 84"
          stroke={primaryStroke}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'aq-stroke-anim-a' : undefined}
        />

        {/* A Horizontal Crossbar (weaves across center) */}
        <path
          d="M 23 56 L 53 56"
          stroke={primaryStroke}
          strokeWidth="6.5"
          strokeLinecap="round"
          className={animated ? 'aq-stroke-anim-bar' : undefined}
        />

        {/* 3. The Front Interlocking Weave of Q (passes back OVER A's right leg at bottom) */}
        <path
          d="M 60 72 C 63.2 73.3 66.5 74 70 74 C 74 74 77.8 73 81.2 71.2"
          stroke={primaryStroke}
          strokeWidth="7.5"
          strokeLinecap="round"
          className={animated ? 'aq-stroke-anim-front' : undefined}
        />

        {/* 4. Distinctive Q Tail: Sweeps out from inside Q, crosses bottom-right and curls gracefully */}
        <path
          d="M 58 52 C 68 64 80 74 94 77 C 98 77.5 102 76 104 72"
          stroke={tailStroke}
          strokeWidth="7.5"
          strokeLinecap="round"
          className={animated ? 'aq-stroke-anim-tail' : undefined}
        />
      </g>
    </svg>
  );
};

/**
 * AQLogo: Primary brand lockup featuring the interlocking AQ monogram
 * and ArchitectIQ wordmark, with optional architectural tagline.
 */
export const AQLogo: React.FC<AQLogoProps> = ({
  size = 'md',
  variant = 'gradient',
  showWordmark = true,
  showTagline = false,
  wordmarkTheme = 'auto',
  className = '',
  title = 'ArchitectIQ',
  animated = false,
}) => {
  const sizeConfig = typeof size === 'string' ? sizeMap[size] || sizeMap.md : sizeMap.md;

  const wordmarkBaseColor =
    wordmarkTheme === 'dark'
      ? 'text-white'
      : wordmarkTheme === 'light'
      ? 'text-slate-900'
      : 'text-slate-900 dark:text-white';

  const isMono = variant === 'mono-white' || variant === 'mono-dark' || variant === 'mono-blue';
  const iqColorClass = isMono
    ? variant === 'mono-white'
      ? 'text-white'
      : variant === 'mono-dark'
      ? 'text-slate-900'
      : 'text-blue-600 dark:text-blue-400'
    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent';

  return (
    <div className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
      <AQMonogram size={size} variant={variant} title={title} animated={animated} />

      {showWordmark && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight leading-none ${sizeConfig.text} ${wordmarkBaseColor}`}
          >
            Architect<span className={`font-extrabold ${iqColorClass}`}>IQ</span>
          </span>

          {showTagline && (
            <span
              className={`font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 select-none ${sizeConfig.tagline}`}
            >
              Where Ideas Become Architecture.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AQLogo;
