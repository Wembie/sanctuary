import type { SVGProps } from 'react';

/**
 * A small, hand-drawn line icon set. One stroke weight, round caps,
 * nothing filled: icons should whisper, not shout.
 */
const PATHS = {
  home: 'M5 20V10.5a7 7 0 0 1 14 0V20M9.5 20v-5a2.5 2.5 0 0 1 5 0v5',
  breathe: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  sounds: 'M3 12h2M7 8.5v7M11 5v14M15 8v8M19 10.5v3M21 12h0',
  focus: 'M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
  sleep: 'M19.5 14.2A7.8 7.8 0 1 1 9.8 4.5a6.3 6.3 0 0 0 9.7 9.7Z',
  explore: 'M12 3.5l1.9 6.6L20.5 12l-6.6 1.9L12 20.5l-1.9-6.6L3.5 12l6.6-1.9L12 3.5Z',
  disconnect:
    'M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5ZM4 20 20 4',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  close: 'M6 6l12 12M18 6 6 18',
  soundOn: 'M4 9.5h3l4.5-4v13l-4.5-4H4v-5ZM15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
  soundOff: 'M4 9.5h3l4.5-4v13l-4.5-4H4v-5ZM16 10l4 4M20 10l-4 4',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  back: 'M14.5 6 8.5 12l6 6',
  rain: 'M7 14.5a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.3 1.8A3.2 3.2 0 0 1 17 14.5M8.5 17.5l-1 2M12.5 17.5l-1 2M16.5 17.5l-1 2',
  ocean:
    'M3 9c2 0 2-1.5 4.5-1.5S9.5 9 12 9s2.5-1.5 4.5-1.5S19 9 21 9M3 14c2 0 2-1.5 4.5-1.5S9.5 14 12 14s2.5-1.5 4.5-1.5S19 14 21 14M5 19c1.5 0 2-1 3.5-1s2 1 3.5 1 2-1 3.5-1 2 1 3.5 1',
  fire: 'M12 20.5c-3.6 0-6-2.5-6-5.8 0-3.7 3.2-5.5 3.8-9.2 2.6 1.6 3.6 3.9 3.4 6 1-.4 1.8-1.4 2.1-2.7 1.7 1.5 2.7 3.6 2.7 5.9 0 3.3-2.4 5.8-6 5.8Z',
  forest: 'M12 3.5 7 11h2.5L6 16h12l-3.5-5H17l-5-7.5ZM12 16v4.5',
  wind: 'M3 9h11.5a2.5 2.5 0 1 0-2.5-2.5M3 13h15.5a2.5 2.5 0 1 1-2.5 2.5M3 17h7',
  space: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4.5 15.5c-1.4 2.2 5.5 1.3 10.2-1.5s7.3-6.5 4.7-6.9',
  storm:
    'M7 13.5a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.3 1.8A3.2 3.2 0 0 1 17 13.5M12.5 12l-2 4h3l-2 4.5',
  deep: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM8 12.5c1-.9 2-.9 3 0s2 .9 3 0 2-.9 2.5 0',
  moon: 'M19.5 14.2A7.8 7.8 0 1 1 9.8 4.5a6.3 6.3 0 0 0 9.7 9.7Z',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
