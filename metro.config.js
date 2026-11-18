const { createHash } = require('node:crypto');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Expo inlines these values. Reusing transforms from another environment
// would point an otherwise valid build at the previous API or Auth project.
const publicConfig = [
  process.env.EXPO_PUBLIC_API_URL,
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
];
const digest = createHash('sha256').update(JSON.stringify(publicConfig)).digest('hex');
config.cacheVersion = [config.cacheVersion, digest].join(':');

module.exports = config;
