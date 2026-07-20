export interface PrivacyPolicySection {
  heading: string;
  body: string;
}

// Single source of truth for the privacy policy text — copied verbatim from
// the HobbySphere Privacy Policy Notion doc. Update this file (and
// effectiveDate) when the policy changes; the /privacy page and Settings
// both read from here.
export const effectiveDate = 'July 20, 2026';
export const publishedBy = 'CrowdSphere Ltd';

export const privacyPolicySections: PrivacyPolicySection[] = [
  {
    heading: 'Information we collect',
    body: 'Account details (username, email, password, full name, bio, main hobby), profile media, content you post (posts/photos/stories/comments/likes), connections (followers/following/groups), messages, location (only when you share it), camera/photo library access (only when you use it), and device-local sign-in data (Face ID/fingerprint — never sent to our servers).',
  },
  {
    heading: 'How we use it',
    body: 'To run the feed, profile, stories, groups, messaging, and notifications; to suggest people to follow based on your followers and shared hobbies; to keep your account secure. We do not use your data for advertising and never sell it.',
  },
  {
    heading: 'Signing in with Google or Apple',
    body: 'We receive a verified identity token and email from these providers — never your password. Apple\'s "Hide My Email" relay address is respected as-is.',
  },
  {
    heading: 'Who we share it with',
    body: 'Only Google/Apple (for sign-in verification), our infrastructure providers (under contract, no independent use of your data), and law enforcement where legally required. No advertisers, no data sales.',
  },
  {
    heading: 'Storage & security',
    body: 'Stored on our servers while your account is active; reasonable safeguards, no absolute guarantee.',
  },
  {
    heading: 'Your choices & rights',
    body: 'Edit most info directly in your profile. You may also request a copy, correction, deletion, or object to certain uses — contact us below.',
  },
  {
    heading: 'Account deletion',
    body: 'Email hello@hobbysphereai.com to request deletion; we confirm identity and remove your data within 30 days (except where law requires retention).',
  },
  {
    heading: "Children's privacy",
    body: "Not directed at children under 13; we don't knowingly collect their data.",
  },
  {
    heading: 'Changes to this policy',
    body: "We'll update the effective date and notify you in-app for material changes.",
  },
  {
    heading: 'Contact',
    body: 'hello@hobbysphereai.com',
  },
];
