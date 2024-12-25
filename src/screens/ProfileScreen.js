import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';

export default function ProfileScreen() {
  const { userData, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => logout()
        }
      ]
    );
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{ uri: userData?.photoURL || 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.name}>{userData?.name || 'User Name'}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="person-outline" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Icon name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={toggleNotifications}
        >
          <Icon name="notifications-outline" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Notifications</Text>
          <Icon 
            name={notifications ? "toggle" : "toggle-outline"} 
            size={24} 
            color={notifications ? "#2196F3" : "#ccc"} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="shield-outline" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Privacy</Text>
          <Icon name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle-outline" size={24} color="#2196F3" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Icon name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <CustomButton
        title="Logout"
        onPress={handleLogout}
        style={styles.logoutButton}
        textStyle={styles.logoutText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
  },
}); 