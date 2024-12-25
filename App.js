import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import GoogleMapsDirections from 'react-native-google-maps-directions';
import Icon from 'react-native-vector-icons/Ionicons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const GOOGLE_MAPS_API_KEY = 'AIzaSyBHo8RB80WPRXX-JvnLEPRp_-7nifX4orQ'

export default function App() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setErrorMsg('Permission to access location was denied');
          return;
        }
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      if (location) {
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        reverseGeocode(latitude, longitude);
      }
    })();
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        setOrigin(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const scheduleNotification = async () => {
    if (!origin || !destination || !estimatedArrivalTime) {
      alert('Please select a destination first.');
      return;
    }

    const now = new Date();
    const arrivalTimeMs = estimatedArrivalTime.getTime();
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Almost there!",
          body: `You'll reach ${destination} in about 10 minutes.`,
        },
        trigger: {
          seconds: Math.round((arrivalTimeMs - (10 * 60 * 1000) - now.getTime()) / 1000),
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Getting close!",
          body: `You'll reach ${destination} in about 5 minutes.`,
        },
        trigger: {
          seconds: Math.round((arrivalTimeMs - (5 * 60 * 1000) - now.getTime()) / 1000),
        },
      });

      setNotificationScheduled(true);
      alert("Notifications set for 10 and 5 minutes before arrival!");
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      alert("Error setting notifications.");
    }
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(null);

    const getDirections = async () => {
        if (!origin || !destination) {
            alert('Please enter origin and destination.');
            return;
        }

        const data = {
            source: origin,
            destination: destination,
            params: [
                {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                    key: "departure_time",
                    value: "now"          // Current time.
                }
            ],
            key: GOOGLE_MAPS_API_KEY
        }

        try {
            const result = await GoogleMapsDirections(data)

            if (result.response.status === 'OK') {
                const route = result.routes[0];
                const duration = route.legs[0].duration.value; // Duration in seconds
                const arrivalTime = new Date(Date.now() + duration * 1000);
                setEstimatedArrivalTime(arrivalTime);

                //Set arrival time to the calculated time
                setArrivalTime(arrivalTime)

            } else {
                console.error('Error getting directions:', result.response.status);
                alert('Could not get directions. Please check your inputs and API key.');
            }
        } catch (error) {
            console.error('Error calling directions API:', error);
            alert('An error occurred. Please try again later.');
        }
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
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
            />
          </View>
        </View>

        {estimatedArrivalTime && !notificationScheduled && (
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={scheduleNotification}
          >
            <Icon name="notifications" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.mainButtonText}>Set Arrival Reminder</Text>
          </TouchableOpacity>
        )}
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
                }}
              />
            )}
          </MapView>
        )}
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Add padding for iOS status bar
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
    zIndex: 1, // Ensure inputs and suggestions appear above map
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
  mapContainer: {
    flex: 1,
    zIndex: 0, // Ensure map stays below the inputs
  },
  map: {
    flex: 1,
  },
  mainButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});