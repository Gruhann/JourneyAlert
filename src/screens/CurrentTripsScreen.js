import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CurrentTripsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [recentTrips, setRecentTrips] = useState([
    // Sample data - replace with actual data from storage
    {
      id: '1',
      origin: 'Home',
      destination: 'Work',
      estimatedDuration: '30 mins',
      status: 'completed',
      date: '2024-02-20',
    },
    // Add more recent trips...
  ]);

  // Update currentTrip when new tripDetails arrive
  useEffect(() => {
    if (route.params?.tripDetails) {
      setCurrentTrip(route.params.tripDetails);
    }
  }, [route.params?.tripDetails]);

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

  const renderRecentTrip = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentTripCard}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
    >
      <View style={styles.recentTripHeader}>
        <Text style={styles.recentTripDate}>{item.date}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#e8f5e9' }]}>
          <Text style={[styles.statusText, { color: '#4CAF50' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.tripInfo}>
        <Text style={styles.recentTripText} numberOfLines={1}>
          {item.origin} → {item.destination}
        </Text>
        <Text style={styles.durationText}>
          Duration: {item.estimatedDuration}
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

      <ScrollView style={styles.content}>
        {renderCurrentTrip()}

        <View style={styles.recentTripsSection}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <FlatList
            data={recentTrips}
            renderItem={renderRecentTrip}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
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
  },
  newTripText: {
    color: '#2196F3',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
}); 