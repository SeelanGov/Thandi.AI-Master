export const SCHOOL_CONFIG = {
  // Performance
  cacheTimeout: process.env.NODE_ENV === 'production' ? 300 : 60, // 5min vs 1min
  maxStudentsPerSchool: process.env.NODE_ENV === 'production' ? 500 : 50,
  
  // Features
  enableWhatsAppAlerts: process.env.NODE_ENV === 'production',
  enablePrincipalEmails: process.env.NODE_ENV === 'production',
  
  // Limits
  maxPdfDownloadsPerDay: 100,
  maxApiRequestsPerMinute: 60,
};