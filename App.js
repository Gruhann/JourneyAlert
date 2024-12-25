import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
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

  const onChangeTime = (event, selectedDate) => {
    const currentDate = selectedDate || arrivalTime;
    setShowTimePicker(Platform.OS === 'ios');
    setArrivalTime(currentDate);
  };

  const scheduleNotification = async () => {
    if (!origin || !destination || !arrivalTime) {
      alert('Please fill in all fields.');
      return;
    }

    const now = new Date();
    const arrivalTimeMs = arrivalTime.getTime();
    
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
      alert("Notifications scheduled for 10 and 5 minutes before arrival!");
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      alert("Error scheduling notifications.");
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
                  setArrivalTime(newArrivalTime);
                  setEstimatedArrivalTime(newArrivalTime);
                }}
              />
            )}
          </MapView>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.title}>Plan Your Journey</Text>
        
        <View style={styles.locationInputsContainer}>
          <View style={styles.locationInput}>
            <View style={styles.dot} />
            <TextInput
              style={styles.input}
              placeholder="Current Location"
              value={origin}
              editable={false}
            />
          </View>
          
          <View style={styles.locationInput}>
            <View style={[styles.dot, styles.destinationDot]} />
            <GooglePlacesAutocomplete
              placeholder='Where to?'
              onPress={(data, details = null) => {
                setDestination(data.description);
                setSelectedDestination({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
              styles={{
                textInput: styles.input,
                container: { flex: 1 },
                listView: { backgroundColor: 'white' }
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
            />
          </View>
        </View>

        <View style={styles.timeContainer}>
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock" size={20} color="#666" />
            <Text style={styles.timeButtonText}>
              Arrival Time: {arrivalTime.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={arrivalTime}
            mode={'time'}
            is24Hour={true}
            display="default"
            onChange={onChangeTime}
          />
        )}

        {estimatedArrivalTime && (
          <View style={styles.estimateCard}>
            <Text style={styles.estimateTitle}>Estimated Journey</Text>
            <Text style={styles.estimateTime}>
              Arrival: {estimatedArrivalTime.toLocaleTimeString()}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.mainButton}
          onPress={getDirections}
        >
          <Text style={styles.mainButtonText}>Check Route & Time</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.mainButton, 
            notificationScheduled ? styles.disabledButton : styles.activeButton
          ]}
          onPress={scheduleNotification}
          disabled={notificationScheduled}
        >
          <Text style={styles.mainButtonText}>
            {notificationScheduled ? 'Notification Set' : 'Set Reminder'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationInputsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginRight: 10,
  },
  destinationDot: {
    backgroundColor: '#4CAF50',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginLeft: 5,
  },
  timeContainer: {
    marginVertical: 15,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  timeButtonText: {
    marginLeft: 10,
    color: '#666',
  },
  estimateCard: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 12,
    marginVertical: 15,
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
  },
  estimateTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0284c7',
    marginTop: 5,
  },
  mainButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#90caf9',
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
});