import * as React from 'react';

export const PowerPointIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="6 6 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Background pie chart */}
    <path d="M22 10C22 10 37 10 38 24C39 38 22 38 22 38" fill="#D24625" />
    <path d="M22 10C22 10 37 10 38 24C39 38 22 38 22 38" fill="#C13B1B" opacity="0.6" />
    <path d="M22 10C30 10 38 18 38 24H22V10Z" fill="#F3643C" />
    <path d="M38 24C38 32 30 38 22 38V24H38Z" fill="#C13B1B" />
    {/* Main P Box */}
    <rect x="8" y="14" width="20" height="20" rx="2" fill="#D24625" />
    <path d="M14 19H19.5C21.433 19 23 20.567 23 22.5C23 24.433 21.433 26 19.5 26H16V30H14V19ZM16 21V24H19.5C20.3284 24 21 23.3284 21 22.5C21 21.6716 20.3284 21 19.5 21H16Z" fill="white" />
  </svg>
);

export const GoogleSlidesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="4 4 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M11 6H27L37 16V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V8C9 6.89543 9.89543 6 11 6Z" fill="#FFC107" />
    <path d="M27 6V16H37" fill="#FFA000" opacity="0.4" />
    <rect x="15" y="18" width="18" height="12" rx="1" fill="white" />
    <rect x="17" y="27" width="14" height="1" fill="#FFC107" />
  </svg>
);

export const ZoomIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="48" height="48" rx="14" fill="#2D8CFF" />
    <path d="M13 20C13 18.3431 14.3431 17 16 17H26C27.6569 17 29 18.3431 29 20V28C29 29.6569 27.6569 31 26 31H16C14.3431 31 13 29.6569 13 28V20Z" fill="white" />
    <path d="M27 21L36 17V31L27 27V21Z" fill="white" />
  </svg>
);

export const GoogleMeetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="9 9 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M38 18L30 23V29L38 34V18Z" fill="#00832D" />
    <path d="M12 16C12 13.7909 13.7909 12 16 12H22V23H12V16Z" fill="#E82127" />
    <path d="M12 23H22V34H16C13.7909 34 12 32.2091 12 30V23Z" fill="#0066DA" />
    <path d="M22 12H27C28.6569 12 30 13.3431 30 15V23H22V12Z" fill="#E8AB00" />
    <path d="M22 23H30V33C30 34.6569 28.6569 36 27 36H22V23Z" fill="#00832D" />
  </svg>
);

export const TeamsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="6 6 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* People */}
    <circle cx="28" cy="16" r="5" fill="#5059C9" />
    <circle cx="36" cy="18" r="4" fill="#5059C9" />
    <path d="M23 30C23 25.5817 26.5817 22 31 22H33C37.4183 22 41 25.5817 41 30V34H23V30Z" fill="#5059C9" />
    {/* Main T Box */}
    <rect x="10" y="14" width="22" height="22" rx="3" fill="#5059C9" />
    <path d="M14 19H28V22H22.5V31H19.5V22H14V19Z" fill="white" />
  </svg>
);
