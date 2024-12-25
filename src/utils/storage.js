import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  SAVED_LOCATIONS: 'saved_locations',
  TRIP_HISTORY: 'trip_history',
  ACTIVE_TRIP: 'active_trip',
};

export const saveToStorage = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getFromStorage = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
}; 