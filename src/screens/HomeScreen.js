import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Text,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const handleSetReminder = () => {
    const tripDetails = {
      id: Date.now().toString(),
      origin,
      destination,
      estimatedDuration,
      estimatedArrivalTime,
      currentLocation,
      selectedDestination,
      status: 'active'
    };
    
    // Navigate back to CurrentTrips with the new trip details
    navigation.navigate('CurrentTrips', { tripDetails });
  };

  return (
    <View style={styles.container}>
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
          
          <View style={styles.locationInput}>
            <Icon name="navigate" size={20} color="#4CAF50" />
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
                textInput: styles.autocompleteInput,
                container: { flex: 1 },
                listView: styles.suggestionList,
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {location && (
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
        )}
      </View>

      {/* Set Reminder Button */}
      {selectedDestination && estimatedArrivalTime && (
        <TouchableOpacity style={styles.reminderButton} onPress={handleSetReminder}>
          <Text style={styles.reminderButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      )}
    </View>
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
    zIndex: 1,
  },
  locationInputsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    zIndex: 1000,
    elevation: 1000,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  autocompleteInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  suggestionList: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    zIndex: 1000,
  },
  mapContainer: {
    flex: 1,
    zIndex: 0,
  },
  map: {
    flex: 1,
  },
  reminderButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
  },
  reminderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 