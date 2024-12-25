import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  Alert,
  RefreshControl,
  Animated,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFromStorage, StorageKeys } from '../utils/storage';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

// Progress Bar Component
const TripProgressBar = ({ trip, currentLocation }) => {
  const [progress] = useState(new Animated.Value(0));
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (trip && currentLocation) {
      const totalDistance = getDistance(
        { latitude: trip.currentLocation.latitude, longitude: trip.currentLocation.longitude },
        { latitude: trip.selectedDestination.latitude, longitude: trip.selectedDestination.longitude }
      );

      const distanceCovered = getDistance(
        { latitude: trip.currentLocation.latitude, longitude: trip.currentLocation.longitude },
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      );

      const percent = Math.min((distanceCovered / totalDistance) * 100, 100);
      setProgressPercent(percent);

      Animated.spring(progress, {
        toValue: percent / 100,
        useNativeDriver: false,
      }).start();
    }
  }, [currentLocation]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Icon name="location" size={20} color="#2196F3" />
        <Text style={styles.progressText}>{Math.round(progressPercent)}% completed</Text>
        <Icon name="flag" size={20} color="#4CAF50" />
      </View>
    </View>
  );
};

// Active Trip Component
const ActiveTrip = ({ trip, navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let locationSubscription;

    const startLocationTracking = async () => {
      if (trip?.status === 'active') {
        setIsTracking(true);
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setCurrentLocation(location.coords);
          }
        );
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [trip?.status]);

  if (!trip) return null;

  return (
    <TouchableOpacity 
      style={styles.currentTripCard}
      onPress={() => navigation.navigate('TripDetails', { trip })}
    >
      <View style={styles.currentTripHeader}>
        <Text style={styles.currentTripTitle}>Current Trip</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="location" size={20} color="#2196F3" />
        <Text style={styles.locationText}>From: {trip.origin.split(',')[0]}</Text>
      </View>

      <View style={styles.locationContainer}>
        <Icon name="navigate" size={20} color="#4CAF50" />
        <Text style={styles.locationText}>To: {trip.destination.split(',')[0]}</Text>
      </View>

      <View style={styles.tripMetrics}>
        <View style={styles.metric}>
          <Icon name="time" size={16} color="#666" />
          <Text style={styles.metricText}>
            {Math.round(trip.estimatedDuration)} mins
          </Text>
        </View>
      </View>

      {isTracking && currentLocation && (
        <TripProgressBar
          trip={trip}
          currentLocation={currentLocation}
        />
      )}
    </TouchableOpacity>
  );
};

// Main Component
export default function CurrentTripsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load trips from AsyncStorage
  const loadTrips = async () => {
    const activeTrip = await getFromStorage(StorageKeys.ACTIVE_TRIP);
    const recentTrips = await getFromStorage(StorageKeys.TRIP_HISTORY) || [];
    
    setCurrentTrip(activeTrip);
    setRecentTrips(recentTrips);
  };

  // Add onRefresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadTrips();
  }, []);

  // Update useEffect to handle new trips
  useEffect(() => {
    if (route.params?.tripDetails) {
      setCurrentTrip(route.params.tripDetails);
      // Add to recent trips if it's a completed trip
      if (route.params.tripDetails.status === 'completed') {
        setRecentTrips(prev => [route.params.tripDetails, ...prev]);
      }
    }
  }, [route.params?.tripDetails]);

  // Add function to complete trip
  const handleCompleteTrip = () => {
    if (currentTrip) {
      const completedTrip = {
        ...currentTrip,
        status: 'completed'
      };
      // Add to recent trips
      setRecentTrips(prev => [completedTrip, ...prev]);
      // Clear current trip
      setCurrentTrip(null);
    }
  };

  const handleNewTrip = () => {
    if (currentTrip?.status === 'active') {
      Alert.alert(
        "Active Trip in Progress",
        "You have an active trip. Please complete or cancel it before starting a new one.",
        [{ text: "OK" }]
      );
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity 
          style={styles.newTripButton}
          onPress={handleNewTrip}
        >
          <Icon name="add-circle" size={24} color="#2196F3" />
          <Text style={styles.newTripText}>New Trip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2196F3"]}
            tintColor="#2196F3"
          />
        }
      >
        <View style={styles.content}>
          <ActiveTrip trip={currentTrip} navigation={navigation} />

          {recentTrips.length > 0 && (
            <View style={styles.recentTripsSection}>
              <Text style={styles.sectionTitle}>Recent Trips</Text>
              {recentTrips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.recentTripCard}
                  onPress={() => navigation.navigate('TripDetails', { trip })}
                >
                  <View style={styles.recentTripHeader}>
                    <Text style={styles.recentTripDate}>{trip.date}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#e8f5e9' }]}>
                      <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                        {trip.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripInfo}>
                    <Text style={styles.recentTripText} numberOfLines={1}>
                      {trip.origin} → {trip.destination}
                    </Text>
                    <Text style={styles.durationText}>
                      Duration: {trip.estimatedDuration}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  currentTripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  tripMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    marginLeft: 4,
    color: '#666',
  },
  recentTripsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentTripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  recentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTripDate: {
    color: '#666',
  },
  recentTripText: {
    fontSize: 16,
    marginBottom: 4,
  },
  durationText: {
    color: '#666',
    fontSize: 14,
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  newTripText: {
    color: '#2196F3',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
}); 