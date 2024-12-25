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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFromStorage, StorageKeys } from '../utils/storage';

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

  const renderCurrentTrip = () => {
    if (!currentTrip) return null;

    return (
      <TouchableOpacity 
        style={styles.currentTripCard}
        onPress={() => navigation.navigate('TripDetails', { trip: currentTrip })}
      >
        <View style={styles.currentTripHeader}>
          <Text style={styles.currentTripTitle}>Current Trip</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.locationContainer}>
            <Icon name="location" size={20} color="#2196F3" />
            <Text style={styles.locationText} numberOfLines={1}>
              From: {currentTrip.origin}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Icon name="navigate" size={20} color="#4CAF50" />
            <Text style={styles.locationText} numberOfLines={1}>
              To: {currentTrip.destination}
            </Text>
          </View>

          <View style={styles.tripMetrics}>
            <View style={styles.metric}>
              <Icon name="time" size={16} color="#666" />
              <Text style={styles.metricText}>
                Duration: {Math.round(currentTrip.estimatedDuration)} mins
              </Text>
            </View>
            <View style={styles.metric}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.metricText}>
                Arrival: {new Date(currentTrip.estimatedArrivalTime).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripItem}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
    >
      {/* Date and Time Header */}
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{item.date}</Text>
        <Text style={styles.tripTime}>{item.time}</Text>
      </View>

      {/* Route Information */}
      <View style={styles.tripRoute}>
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>
            From - {item.origin.split(',')[0]} {/* Show only the first part of the address */}
          </Text>
          <Text style={styles.routeText}>
            To - {item.destination.split(',')[0]} {/* Show only the first part of the address */}
          </Text>
        </View>
        <Text style={styles.durationText}>
          Time taken: {Math.round(item.estimatedDuration)} mins
        </Text>
      </View>

      {/* Status Badge */}
      <View style={[
        styles.statusContainer,
        { backgroundColor: item.status === 'active' ? '#E3F2FD' : '#E8F5E9' }
      ]}>
        <Text style={[
          styles.statusText,
          { color: item.status === 'active' ? '#1976D2' : '#388E3C' }
        ]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
        <TouchableOpacity 
          style={styles.newTripButton}
          onPress={() => navigation.navigate('SetNewTrip')}
        >
          <Icon name="add-circle" size={24} color="#2196F3" />
          <Text style={styles.newTripText}>New Trip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2196F3"]}
            tintColor="#2196F3"
          />
        }
      >
        {renderCurrentTrip()}

        {recentTrips.length > 0 && (
          <View style={styles.recentTripsSection}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <FlatList
              data={recentTrips}
              renderItem={renderTripItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  tripRoute: {
    marginTop: 8,
    marginBottom: 8,
  },
  routeContainer: {
    marginBottom: 4,
  },
  routeText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  tripTime: {
    fontSize: 14,
    color: '#666',
  },
  tripItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newTripText: {
    color: '#2196F3',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
}); 