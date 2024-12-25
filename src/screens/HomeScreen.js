import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { saveToStorage, getFromStorage, StorageKeys } from '../utils/storage';

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadInitialData = async () => {
    // Get current location and address
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    // Get address for current location
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        setOrigin(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  // Add onRefresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Add useEffect to handle incoming navigation params
  useEffect(() => {
    if (route.params?.destination && route.params?.selectedLocation) {
      // Set the destination from the saved location
      setSelectedDestination(route.params.destination);
      setDestination(route.params.selectedLocation.name);

      // If we have both origin and destination, calculate the route
      if (currentLocation) {
        calculateRoute(currentLocation, route.params.destination);
      }
    }
  }, [route.params, currentLocation]);

  // Add function to calculate route
  const calculateRoute = async (origin, destination) => {
    try {
      // Create DirectionsService
      const directionsService = new google.maps.DirectionsService();
      
      const result = await directionsService.route({
        origin: {
          lat: origin.latitude,
          lng: origin.longitude
        },
        destination: {
          lat: destination.latitude,
          lng: destination.longitude
        },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (result) {
        const duration = result.routes[0].legs[0].duration.value / 60; // Convert seconds to minutes
        const newArrivalTime = new Date(Date.now() + duration * 60 * 1000);
        setEstimatedArrivalTime(newArrivalTime);
        setEstimatedDuration(duration);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleSetReminder = async () => {
    if (hasActiveTrip) {
      Alert.alert(
        "Active Trip Exists",
        "You already have an active trip. Please complete or cancel it before starting a new one.",
        [{ text: "OK" }]
      );
      return;
    }

    const tripDetails = {
      id: Date.now().toString(),
      origin,
      destination,
      estimatedDuration,
      estimatedArrivalTime: estimatedArrivalTime.toISOString(),
      currentLocation,
      selectedDestination,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
    };

    // Save active trip to AsyncStorage
    await saveToStorage(StorageKeys.ACTIVE_TRIP, tripDetails);

    // Add to history
    addToHistory(tripDetails);

    // Set active trip
    setHasActiveTrip(true);

    // Navigate back to CurrentTrips with the new trip details
    navigation.navigate('CurrentTrips', { tripDetails });
  };

  const addToHistory = async (tripDetails) => {
    try {
      // Get existing history
      const history = await getFromStorage(StorageKeys.TRIP_HISTORY) || [];
      
      // Add new trip to history
      const updatedHistory = [tripDetails, ...history];
      await saveToStorage(StorageKeys.TRIP_HISTORY, updatedHistory);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.locationInputsContainer}>
          <View style={styles.locationInput}>
            <Icon name="location" size={20} color="#2196F3" />
            <TextInput
              style={styles.input}
              placeholder="Current Location"
              value={origin}
              editable={false}
            />
          </View>
          
          <View style={[styles.locationInput, { zIndex: 2 }]}>
            <Icon name="navigate" size={20} color="#4CAF50" />
            {route.params?.selectedLocation ? (
              <TextInput
                style={styles.input}
                value={destination}
                editable={false}
              />
            ) : (
              <GooglePlacesAutocomplete
                placeholder='Where to?'
                onPress={(data, details = null) => {
                  setDestination(data.description);
                  if (details) {
                    setSelectedDestination({
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    });
                  }
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                  types: 'establishment|geocode',
                }}
                styles={{
                  container: {
                    flex: 1,
                    position: 'relative',
                  },
                  textInput: {
                    height: 40,
                    fontSize: 16,
                    backgroundColor: 'transparent',
                    marginLeft: 10,
                  },
                  listView: {
                    position: 'absolute',
                    top: 45,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    elevation: 3,
                    zIndex: 1000,
                  },
                  row: {
                    padding: 13,
                    height: 44,
                    flexDirection: 'row',
                  },
                  separator: {
                    height: 0.5,
                    backgroundColor: '#c8c7cc',
                  },
                }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                minLength={2}
                returnKeyType={'search'}
                keyboardShouldPersistTaps='handled'
                listViewDisplayed='auto'
              />
            )}
          </View>
        </View>
      </View>

      {location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {currentLocation && <Marker coordinate={currentLocation} />}
            {selectedDestination && <Marker coordinate={selectedDestination} />}
            {currentLocation && selectedDestination && (
              <MapViewDirections
                origin={currentLocation}
                destination={selectedDestination}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={3}
                strokeColor="#2196F3"
                onReady={result => {
                  const duration = result.duration;
                  const newArrivalTime = new Date(Date.now() + duration * 60 * 1000);
                  setEstimatedArrivalTime(newArrivalTime);
                  setEstimatedDuration(duration);
                }}
              />
            )}
          </MapView>
        </View>
      )}

      {selectedDestination && estimatedArrivalTime && (
        <TouchableOpacity 
          style={styles.reminderButton} 
          onPress={handleSetReminder}
        >
          <Text style={styles.reminderButtonText}>
            {route.params?.selectedLocation ? 'Start Trip to Saved Location' : 'Start'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  locationInputsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    zIndex: 998,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 44,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    height: 40,
  },
  mapContainer: {
    flex: 1,
    height: Dimensions.get('window').height * 0.5,
    zIndex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  reminderButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    zIndex: 1,
  },
  reminderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 