import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';

export default function TripHistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([
    {
      id: '1',
      from: 'Home',
      to: 'Work',
      date: '2024-02-20',
      time: '09:30 AM',
      duration: '25 mins',
      status: 'completed',
    },
    {
      id: '2',
      from: 'Work',
      to: 'Gym',
      date: '2024-02-19',
      time: '06:00 PM',
      duration: '15 mins',
      status: 'completed',
    },
    // Add more trip history as needed
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripItem}
      onPress={() => navigation.navigate('TripDetail', { trip: item })}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{item.date}</Text>
        <Text style={styles.tripTime}>{item.time}</Text>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.locationContainer}>
          <Icon name="location" size={20} color="#2196F3" />
          <Text style={styles.locationText}>{item.from}</Text>
        </View>

        <View style={styles.routeLine}>
          <Icon name="arrow-down" size={20} color="#666" />
        </View>

        <View style={styles.locationContainer}>
          <Icon name="location" size={20} color="#4CAF50" />
          <Text style={styles.locationText}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.durationContainer}>
          <Icon name="time" size={16} color="#666" />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>

        <View style={[
          styles.statusContainer,
          { backgroundColor: item.status === 'completed' ? '#e8f5e9' : '#fff3e0' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? '#4CAF50' : '#FF9800' }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Trip History" />
      
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="document-text" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No trip history yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  tripItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  tripTime: {
    fontSize: 14,
    color: '#666',
  },
  tripRoute: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  routeLine: {
    marginLeft: 10,
    height: 20,
    justifyContent: 'center',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    color: '#666',
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 