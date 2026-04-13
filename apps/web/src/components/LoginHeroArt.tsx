import React from 'react';

export const LoginHeroArt = ({
  orangeHeadStyle,
  orangeEyeStyle,
  purpleHeadStyle,
  purpleEyeStyle,
  darkHeadStyle,
  darkEyeStyle,
  yellowHeadStyle,
  yellowEyeStyle,
}: {
  orangeHeadStyle: React.CSSProperties;
  orangeEyeStyle: React.CSSProperties;
  purpleHeadStyle: React.CSSProperties;
  purpleEyeStyle: React.CSSProperties;
  darkHeadStyle: React.CSSProperties;
  darkEyeStyle: React.CSSProperties;
  yellowHeadStyle: React.CSSProperties;
  yellowEyeStyle: React.CSSProperties;
}) => {
  return (
    <svg viewBox='0 0 520 420' className='h-full w-full overflow-visible' aria-hidden='true'>
      <defs>
        <linearGradient id='purpleBody' x1='0%' x2='100%' y1='0%' y2='100%'>
          <stop offset='0%' stopColor='#7829ff' />
          <stop offset='100%' stopColor='#5a20dd' />
        </linearGradient>
        <filter id='softShadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='0' dy='18' stdDeviation='24' floodColor='rgba(32,33,42,0.12)' />
        </filter>
      </defs>

      <g filter='url(#softShadow)'>
        <path d='M30 390C30 306 84 252 164 252V390H30Z' fill='#ff8b39' />

        <rect x='150' y='72' width='138' height='318' rx='2' fill='url(#purpleBody)' />
        <g style={purpleHeadStyle}>
          <circle cx='234' cy='118' r='9' fill='white' />
          <circle cx='262' cy='122' r='9' fill='white' />
          <g style={purpleEyeStyle}>
            <circle cx='240' cy='132' r='4.5' fill='#20212a' />
            <circle cx='274' cy='138' r='4.5' fill='#20212a' />
          </g>
          <rect x='230' y='161' width='34' height='18' rx='8' fill='#20212a' />
        </g>

        <rect x='228' y='162' width='104' height='228' fill='#20212a' />
        <g style={darkHeadStyle}>
          <circle cx='307' cy='205' r='12' fill='white' />
          <circle cx='338' cy='205' r='12' fill='white' />
          <g style={darkEyeStyle}>
            <circle cx='312' cy='205' r='5' fill='#20212a' />
            <circle cx='343' cy='205' r='5' fill='#20212a' />
          </g>
        </g>

        <path d='M332 390V246C332 204 366 182 404 182C446 182 478 214 478 255V390H332Z' fill='#ffe100' />
        <g style={yellowHeadStyle}>
          <g style={yellowEyeStyle}>
            <circle cx='392' cy='247' r='7.5' fill='#20212a' />
          </g>
          <rect x='425' y='262' width='86' height='8' rx='4' fill='#20212a' />
        </g>

        <g style={orangeHeadStyle}>
          <g style={orangeEyeStyle}>
            <circle cx='118' cy='310' r='6' fill='#20212a' />
            <circle cx='170' cy='302' r='6' fill='#20212a' />
          </g>
          <path d='M139 327C146 337 158 339 167 330' stroke='#20212a' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' />
        </g>
      </g>
    </svg>
  );
};
