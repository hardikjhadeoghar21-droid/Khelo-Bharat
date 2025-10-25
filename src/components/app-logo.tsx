import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 100"
      width="300"
      height="100"
      {...props}
    >
      <defs>
        <linearGradient id="saffron-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#FF7700" />
        </linearGradient>
        <linearGradient id="green-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#138808" />
          <stop offset="100%" stopColor="#1E9E1E" />
        </linearGradient>
         <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
            <feOffset dx="1" dy="2" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      {/* Ashoka Chakra-style logo */}
      <g transform="translate(40, 50)" filter="url(#shadow)">
        <circle cx="0" cy="0" r="28" fill="none" stroke="hsl(240, 100%, 27%)" strokeWidth="2.5" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2="0"
            y2="-28"
            stroke="hsl(240, 100%, 27%)"
            strokeWidth="1.5"
            transform={`rotate(${i * 15})`}
          />
        ))}
        <circle cx="0" cy="0" r="5" fill="hsl(240, 100%, 27%)" />
      </g>

      {/* Text */}
      <text
        x="185"
        y="65"
        fontFamily="'Uncial Antiqua', sans-serif"
        fontSize="48"
        textAnchor="middle"
        fill="url(#saffron-gradient)"
        stroke="#A54B00"
        strokeWidth="0.5"
        letterSpacing="2"
      >
        KHELO
      </text>
      <text
        x="185"
        y="95"
        fontFamily="'Uncial Antiqua', sans-serif"
        fontSize="48"
        textAnchor="middle"
        fill="url(#green-gradient)"
        stroke="#0B4D04"
        strokeWidth="0.5"
        letterSpacing="2"
      >
        BHARAT
      </text>
    </svg>
  );
}
