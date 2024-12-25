import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '../utils/constants';

export default function TripDetailsScreen({ route, navigation }) {
  const { trip } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: trip.currentLocation.latitude,
              longitude: trip.currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker coordinate={trip.currentLocation} />
            <Marker coordinate={trip.selectedDestination} />
            <MapViewDirections
              origin={trip.currentLocation}
              destination={trip.selectedDestination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={3}
              strokeColor="#2196F3"
            />
          </MapView>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="location" size={20} color="#2196F3" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>From</Text>
              <Text style={styles.detailValue}>{trip.origin}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="navigate" size={20} color="#4CAF50" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>To</Text>
              <Text style={styles.detailValue}>{trip.destination}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="time" size={20} color="#FF9800" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {Math.round(trip.estimatedDuration)} mins
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="calendar" size={20} color="#9C27B0" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Estimated Arrival</Text>
              <Text style={styles.detailValue}>
                {new Date(trip.estimatedArrivalTime).toLocaleTimeString()}
              </Text>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
}); 