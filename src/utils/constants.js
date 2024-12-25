export const GOOGLE_MAPS_API_KEY = 'AIzaSyBHo8RB80WPRXX-JvnLEPRp_-7nifX4orQ';

export const NOTIFICATION_TYPES = {
  ARRIVAL: 'ARRIVAL',
  REMINDER: 'REMINDER',
  ALERT: 'ALERT',
};

export const LOCATION_TYPES = {
  HOME: 'home',
  WORK: 'work',
  FAVORITE: 'favorite',
  OTHER: 'other',
};

export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const NOTIFICATION_TIMES = {
  BEFORE_10_MINUTES: 10,
  BEFORE_5_MINUTES: 5,
};

export const MAP_STYLES = {
  DEFAULT: [],
  NIGHT: [
    // Add your custom map styles here
  ],
};

export const API_ENDPOINTS = {
  BASE_URL: 'YOUR_API_BASE_URL',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  LOCATIONS: {
    SAVE: '/locations/save',
    GET_ALL: '/locations/all',
    DELETE: '/locations/delete',
  },
  TRIPS: {
    SAVE: '/trips/save',
    GET_ALL: '/trips/all',
    DELETE: '/trips/delete',
  },
}; 