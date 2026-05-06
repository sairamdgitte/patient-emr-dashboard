import React from 'react';

const I = ({ d, children, size = 16, stroke = 1.6, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);

export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>;
export const Bell = (p) => <I {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" /></I>;
export const Settings = (p) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></I>;
export const Home = (p) => <I {...p}><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10" /></I>;
export const Users = (p) => <I {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></I>;
export const Calendar = (p) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></I>;
export const Clipboard = (p) => <I {...p}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12h6M9 16h4" /></I>;
export const Pill = (p) => <I {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></I>;
export const Flask = (p) => <I {...p}><path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19l-6-10V3" /><path d="M6 14h12" /></I>;
export const Activity = (p) => <I {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></I>;
export const Heart = (p) => <I {...p}><path d="M19 14c1.5-1.5 3-3.4 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7Z" /></I>;
export const Phone = (p) => <I {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></I>;
export const Edit = (p) => <I {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></I>;
export const Plus = (p) => <I {...p} d="M12 5v14M5 12h14" />;
export const Filter = (p) => <I {...p}><path d="M3 5h18l-7 9v6l-4-2v-4Z" /></I>;
export const Download = (p) => <I {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></I>;
export const ChevronRight = (p) => <I {...p} d="m9 6 6 6-6 6" />;
export const ChevronLeft = (p) => <I {...p} d="m15 6-6 6 6 6" />;
export const Alert = (p) => <I {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></I>;
export const Inbox = (p) => <I {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></I>;
export const Logout = (p) => <I {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></I>;
export const Lung = (p) => <I {...p}><path d="M6.1 20a2 2 0 0 1-2-2 22 22 0 0 1 2-9c.5-.9 1.4-1 2-.4l1.4 1.4a1 1 0 0 1 .3.7V19a1 1 0 0 1-1 1Z" /><path d="M17.9 20a2 2 0 0 0 2-2 22 22 0 0 0-2-9c-.5-.9-1.4-1-2-.4l-1.4 1.4a1 1 0 0 0-.3.7V19a1 1 0 0 0 1 1Z" /><path d="M12 3v9" /></I>;
export const Brain = (p) => <I {...p}><path d="M9.5 2a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 6 16a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-2.5-3Z" /><path d="M14.5 2a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 18 16a3 3 0 0 1-3 3 3 3 0 0 1-3-3" /></I>;
export const Send = (p) => <I {...p}><path d="m22 2-7 20-4-9-9-4Z" /><path d="m22 2-11 11" /></I>;
export const X = (p) => <I {...p} d="M18 6 6 18M6 6l12 12" />;
export const Stethoscope = (p) => <I {...p}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v3a3 3 0 0 0 6 0v-3" /><circle cx="20" cy="10" r="2" /></I>;
export const Mail = (p) => <I {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" /></I>;
export const Check = (p) => <I {...p} d="M20 6 9 17l-5-5" />;
export const Clock = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>;
export const Refresh = (p) => <I {...p}><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" /><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M3 21v-5h5" /></I>;
