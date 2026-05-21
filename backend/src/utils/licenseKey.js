import { randomBytes } from 'crypto';

const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const randomSegment = () => {
  const bytes = randomBytes(4);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join('');
};

export const generateLicenseKey = () => {
  return `PVLT-${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
};

export const validateLicenseKeyFormat = (key) => {
  const regex = /^PVLT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(key);
};