import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { saveToStorage, getFromStorage, StorageKeys } from '../utils/storage';

export default function SavedLocationsScreen({ navigation }) {
  const [savedLocations, setSavedLocations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedLocations = async () => {
    const locations = await getFromStorage(StorageKeys.SAVED_LOCATIONS) || [];
    setSavedLocations(locations);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSavedLocations();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const handleDeleteLocation = async (id) => {
    Alert.alert(
      "Delete Location",
      "Are you sure you want to delete this saved location?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const updatedLocations = savedLocations.filter(
              location => location.id !== id
            );
            await saveToStorage(StorageKeys.SAVED_LOCATIONS, updatedLocations);
            setSavedLocations(updatedLocations);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleNavigate = (location) => {
    // Navigate to Home with the selected location details
    navigation.navigate('Home', { 
      destination: location.coordinates,
      selectedLocation: location,
      addingNewLocation: false // Indicate that we are not adding a new location
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={() => handleNavigate(item)} // Navigate on item press
    >
      <View style={styles.locationInfo}>
        <Icon 
          name={item.type === 'home' ? 'home' : 'business'} 
          size={24} 
          color="#2196F3" 
        />
        <View style={styles.textContainer}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationAddress}>{item.address}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={() => handleNavigate(item)} // Navigate on button press
          style={styles.actionButton}
        >
          <Icon name="navigate" size={20} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleDeleteLocation(item.id)}
          style={styles.actionButton}
        >
          <Icon name="trash" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Saved Locations" />
      
      {savedLocations.length > 0 ? (
        <FlatList
          data={savedLocations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2196F3"]}
              tintColor="#2196F3"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bookmark" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No saved locations yet</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Home', { addingNewLocation: true })}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  locationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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