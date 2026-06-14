/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: CSSProperties;
}

function Icon({ d, size = 16, color = 'currentColor', strokeWidth = 1.75, fill = 'none', viewBox = '0 0 24 24', style }: {
  d: React.ReactNode; size?: number; color?: string; strokeWidth?: number; fill?: string; viewBox?: string; style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color}
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, ...style }}>
      {d}
    </svg>
  );
}

export const Icons = {
  logo: (p: IconProps) => <Icon {...p} d={<>
    <circle cx="12" cy="14" r="7"/>
    <path d="M12 7V4" strokeLinecap="round"/>
    <path d="M12 5C10.5 3.5 8 4 8.5 6" strokeLinecap="round"/>
    <path d="M12 5C13.5 3.5 16 4 15.5 6" strokeLinecap="round"/>
  </>} />,
  timer:   (p: IconProps) => <Icon {...p} d={<><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/><path d="M19 5l1.5-1.5"/></>} />,
  check:   (p: IconProps) => <Icon {...p} d={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>} />,
  chart:   (p: IconProps) => <Icon {...p} d={<><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/></>} />,
  gear:    (p: IconProps) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>} />,
  sun:     (p: IconProps) => <Icon {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M5 5l1.5 1.5M17.5 17.5L19 19M2 12h2M20 12h2M5 19l1.5-1.5M17.5 6.5L19 5"/></>} />,
  moon:    (p: IconProps) => <Icon {...p} d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>} />,
  sound:   (p: IconProps) => <Icon {...p} d={<><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></>} />,
  plus:    (p: IconProps) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>} />,
  x:       (p: IconProps) => <Icon {...p} d={<><path d="M18 6L6 18M6 6l12 12"/></>} />,
  dots:    (p: IconProps) => <Icon {...p} strokeWidth={0} d={<><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></>} />,
  search:  (p: IconProps) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>} />,
  play:    (p: IconProps) => <Icon {...p} fill="currentColor" strokeWidth={0} d={<path d="M7 4.5v15l13-7.5z"/>} />,
  pause:   (p: IconProps) => <Icon {...p} fill="currentColor" strokeWidth={0} d={<><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></>} />,
  reset:   (p: IconProps) => <Icon {...p} d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>} />,
  skip:    (p: IconProps) => <Icon {...p} d={<><path d="M5 4l10 8-10 8z" fill="currentColor" strokeWidth="0"/><path d="M19 5v14"/></>} />,
  fire:    (p: IconProps) => <Icon {...p} fill="currentColor" strokeWidth={0} d={<path d="M12 2c1.5 3 4 5 4 8a4 4 0 0 1-1 2.8A3 3 0 0 0 12 17a3 3 0 0 0-3-4.2A4 4 0 0 1 8 10c0-2.5 1.5-4 4-8zM12 22a5 5 0 0 1-5-5c0-2 1-3 2-4 0 2 1 3 3 3s3-1 3-3c1 1 2 2 2 4a5 5 0 0 1-5 5z"/>} />,
  trophy:  (p: IconProps) => <Icon {...p} d={<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/></>} />,
  bell:    (p: IconProps) => <Icon {...p} d={<><path d="M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></>} />,
  zap:     (p: IconProps) => <Icon {...p} d={<path d="M13 2L3 14h8l-1 8 10-12h-8z"/>} />,
  chev:    (p: IconProps) => <Icon {...p} d={<path d="M6 9l6 6 6-6"/>} />,
  chevR:   (p: IconProps) => <Icon {...p} d={<path d="M9 6l6 6-6 6"/>} />,
  tag:     (p: IconProps) => <Icon {...p} d={<><path d="M20.6 13.4L13 21l-9-9 7.6-7.6c.4-.4.9-.6 1.4-.6h6.4c.6 0 1 .4 1 1v6.4c0 .5-.2 1-.6 1.4z"/><circle cx="16" cy="8" r="1" fill="currentColor"/></>} />,
  help:    (p: IconProps) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></>} />,
  inbox:   (p: IconProps) => <Icon {...p} d={<><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5l-3 7v6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-6l-3-7a2 2 0 0 0-1.8-1.2H7.3A2 2 0 0 0 5.5 5z"/></>} />,
  minus:   (p: IconProps) => <Icon {...p} d={<path d="M5 12h14"/>} />,
  trash:   (p: IconProps) => <Icon {...p} d={<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>} />,
  edit:    (p: IconProps) => <Icon {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></>} />,
  logout:  (p: IconProps) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
};
