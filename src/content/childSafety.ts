export interface ChildSafetySection {
  heading: string;
  body: string;
}

// Single source of truth for the Child Safety Standards text.
// Update this file (and effectiveDate) when the policy changes; the
// /child-safety page reads from here.
export const effectiveDate = 'July 23, 2026';
export const publishedBy = 'CrowdSphere Ltd';

export const childSafetySections: ChildSafetySection[] = [
  {
    heading: 'Our Commitment',
    body: 'We do not permit any content, communication, or activity that sexualizes, exploits, or endangers children. Any account found engaging in such activity will be immediately and permanently banned, and reported to NCMEC or relevant authorities where required by law.',
  },
  {
    heading: 'Minimum Age',
    body: 'HobbySphere is intended for users aged 13 and older.',
  },
  {
    heading: 'Prohibited Content and Conduct',
    body: "Uploading, sharing, or requesting CSAM; sexualizing minors in any content; grooming or soliciting minors; any content endangering a minor's safety.",
  },
  {
    heading: 'Reporting Concerns',
    body: 'Contact hello@hobbysphereai.com immediately if you become aware of a violation. We review all reports promptly and take appropriate action, including content removal, account action, and reporting to authorities as required.',
  },
  {
    heading: 'Cooperation with Authorities',
    body: 'We cooperate fully with law enforcement and child safety organizations, preserving relevant data as required by law.',
  },
];
