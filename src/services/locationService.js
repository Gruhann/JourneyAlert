import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_LOCATIONS_KEY = 'saved_locations';
const TRIP_HISTORY_KEY = 'trip_history';

export const locationService = {
  saveLocation: async (location) => {
    try {
      const savedLocations = await getSavedLocations();
      const newLocations = [...savedLocations, { ...location, id: Date.now().toString() }];
      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(newLocations));
      return newLocations;
    } catch (error) {
      console.error('Save location error:', error);
      throw error;
    }
  },

  getSavedLocations: async () => {
    try {
      const locations = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
      return locations ? JSON.parse(locations) : [];
    } catch (error) {
      console.error('Get saved locations error:', error);
      return [];
    }
  },

  deleteLocation: async (locationId) => {
    try {
      const locations = await getSavedLocations();
      const updatedLocations = locations.filter(loc => loc.id !== locationId);
      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedLocations));
      return updatedLocations;
    } catch (error) {
      console.error('Delete location error:', error);
      throw error;
    }
  },

  saveTrip: async (trip) => {
    try {
      const tripHistory = await getTripHistory();
      const newTrips = [...tripHistory, { ...trip, id: Date.now().toString() }];
      await AsyncStorage.setItem(TRIP_HISTORY_KEY, JSON.stringify(newTrips));
      return newTrips;
    } catch (error) {
      console.error('Save trip error:', error);
      throw error;
    }
  },

  getTripHistory: async () => {
    try {
      const trips = await AsyncStorage.getItem(TRIP_HISTORY_KEY);
      return trips ? JSON.parse(trips) : [];
    } catch (error) {
      console.error('Get trip history error:', error);
      return [];
    }
  },

  clearTripHistory: async () => {
    try {
      await AsyncStorage.removeItem(TRIP_HISTORY_KEY);
    } catch (error) {
      console.error('Clear trip history error:', error);
      throw error;
    }
  },
}; 