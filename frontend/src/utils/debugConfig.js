// Debug configuration
export const DEBUG_CONFIG = {
  enablePoseLogging: false,
  enableAPILogging: false,
  enableThemeLogging: false,
  enableGeneralLogging: false
};

// Helper function to conditionally log
export const debugLog = (category, ...args) => {
  if (DEBUG_CONFIG[category]) {
    console.log(...args);
  }
};

export const debugError = (category, ...args) => {
  if (DEBUG_CONFIG[category]) {
    console.error(...args);
  }
};