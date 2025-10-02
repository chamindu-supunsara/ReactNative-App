import * as React from 'react';
import { View, StyleSheet, Alert, Platform, TouchableOpacity, ScrollView, Text, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchEventsByCategory } from '../services/events';
import { EventItem } from '../lib/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isValidLocation, getLocationErrorMessage } from '../lib/geo';

interface UserLocation {
    latitude: number;
    longitude: number;
}

export default function NearbyScreen({ navigation }: any) {
    const mapRef = React.useRef<MapView>(null);
    const [userLocation, setUserLocation] = React.useState<UserLocation | null>(null);
    const [nearbyEvents, setNearbyEvents] = React.useState<EventItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
    const [locationError, setLocationError] = React.useState<string | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);
    const [mapRegion, setMapRegion] = React.useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.1250,
        longitudeDelta: 0.1250,
    });

    // Calculate distance between two points in kilometers
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Helper function to get latitude and longitude from location object
    const getLocationCoords = (location: any) => {
        if (location.lat !== undefined && location.lng !== undefined) {
            return { lat: location.lat, lng: location.lng };
        } else if (location.latitude !== undefined && location.longitude !== undefined) {
            return { lat: location.latitude, lng: location.longitude };
        }
        return null;
    };

    // Filter events within 100KM radius
    const filterNearbyEvents = (events: EventItem[], userLat: number, userLng: number): EventItem[] => {
        return events.filter(event => {
            const coords = getLocationCoords(event.location);
            if (!coords) return false;
            
            const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
            return distance <= 10; // 100KM radius
        });
    };

    // Get user's current location
    const getCurrentLocation = async (isRetry: boolean = false) => {
        setLoading(true);
        setLocationError(null);
        
        try {
            // Check if location services are enabled
            const isLocationEnabled = await Location.hasServicesEnabledAsync();
            if (!isLocationEnabled) {
                const errorMsg = 'Location services are disabled. Please enable them in device settings.';
                setLocationError(errorMsg);
                Alert.alert(
                    'Location Services Disabled',
                    'Please enable location services in your device settings to use this feature.',
                    [{ text: 'OK', style: 'default' }]
                );
                setLoading(false);
                return;
            }

            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                const errorMsg = 'Location permission denied. Please grant permission in settings.';
                setLocationError(errorMsg);
                Alert.alert(
                    'Permission Required',
                    'Location permission is required to show nearby events. Please grant permission in settings.',
                    [{ text: 'OK', style: 'default' }]
                );
                setLoading(false);
                return;
            }

            // Get current location with better options
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            
            const { latitude, longitude } = location.coords;
            
            // Validate coordinates
            if (!isValidLocation(latitude, longitude)) {
                throw new Error('Invalid location coordinates received');
            }
            
            setUserLocation({ latitude, longitude });
            setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.1250,
                longitudeDelta: 0.1250,
            });

            // Fetch all events and filter nearby ones
            const allEvents = await fetchEventsByCategory('All', 100);
            const nearby = filterNearbyEvents(allEvents, latitude, longitude);
            setNearbyEvents(nearby);
            
            // Reset retry count on success
            setRetryCount(0);

        } catch (error: any) {
            console.error('Error getting location:', error);
            
            const errorMessage = getLocationErrorMessage(error);
            setLocationError(errorMessage);
            
            // Auto-retry logic (max 3 attempts)
            if (!isRetry && retryCount < 2) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    getCurrentLocation(true);
                }, 2000); // Wait 2 seconds before retry
            } else {
                Alert.alert(
                    'Location Error',
                    errorMessage,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Retry', onPress: () => {
                            setRetryCount(0);
                            getCurrentLocation();
                        }}
                    ]
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle event selection
    const handleEventSelect = (event: EventItem) => {
        setSelectedEventId(event.id);
        
        // Center map on selected event
        const coords = getLocationCoords(event.location);
        if (coords && mapRef.current) {
            const newRegion = {
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            
            mapRef.current.animateToRegion(newRegion, 1000);
            setMapRegion(newRegion);
        }
    };

    // Handle navigation to event details
    const handleNavigateToDetails = (event: EventItem) => {
        navigation.navigate('EventDetails', { item: event });
    };

    // Handle relocate to user location
    const handleRelocate = () => {
        if (userLocation && mapRef.current) {
            const newRegion = {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.1250,
                longitudeDelta: 0.1250,
            };
            
            mapRef.current.animateToRegion(newRegion, 1000);
            setMapRegion(newRegion);
        } else {
            // If no user location, get it again
            getCurrentLocation();
        }
    };

    // Load nearby events on component mount
    React.useEffect(() => {
        getCurrentLocation();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsScale={false}
                    mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                    {/* User location marker */}
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                        />
                    )}

                    {/* Event markers */}
                    {nearbyEvents.map((event) => {
                        const coords = getLocationCoords(event.location);
                        if (!coords) return null;
                        
                        const isSelected = selectedEventId === event.id;
                        
                        return (
                            <Marker
                                key={event.id}
                                coordinate={{
                                    latitude: coords.lat,
                                    longitude: coords.lng,
                                }}
                                title={event.title}
                                description={`${event.venue} • ${event.category}`}
                                onPress={() => handleEventSelect(event)}
                            >
                                <View style={[
                                    styles.eventMarker,
                                    isSelected && styles.selectedEventMarker
                                ]}>
                                    <MaterialCommunityIcons 
                                        name="map-marker" 
                                        size={28} 
                                        color={isSelected ? "#FF0000" : "#FF4444"} 
                                    />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                {/* Map Overlay Controls */}
                <TouchableOpacity
                    style={[styles.relocateButton, loading && styles.disabledButton]}
                    onPress={handleRelocate}
                    disabled={loading}
                >
                    <MaterialCommunityIcons 
                        name={loading ? "loading" : "map-marker"} 
                        size={24} 
                        color="#FFFFFF" 
                    />
                </TouchableOpacity>

                {/* Location Error Banner */}
                {locationError && (
                    <View style={styles.errorBanner}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color="#FF6B6B" />
                        <Text style={styles.errorText}>{locationError}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                setRetryCount(0);
                                getCurrentLocation();
                            }}
                        >
                            <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setShowDetails(!showDetails)}
                >
                    <MaterialCommunityIcons 
                        name={showDetails ? "chevron-down" : "chevron-up"} 
                        size={24} 
                        color="#FFFFFF" 
                    />
                </TouchableOpacity>

                {/* Event Details Overlay on Map */}
                {showDetails && (
                    <View style={styles.mapOverlay}>
                        <ScrollView 
                            style={styles.overlayEventsList}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                        >
                            {nearbyEvents.map((event) => {
                                const coords = getLocationCoords(event.location);
                                if (!coords || !userLocation) return null;
                                
                                const distance = calculateDistance(
                                    userLocation.latitude, 
                                    userLocation.longitude, 
                                    coords.lat, 
                                    coords.lng
                                );
                                
                                return (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={[
                                            styles.overlayEventCard,
                                            selectedEventId === event.id && styles.selectedOverlayEventCard
                                        ]}
                                        onPress={() => handleEventSelect(event)}
                                    >
                                        <View style={styles.overlayEventImageContainer}>
                                            {event.imageUrl ? (
                                                <Image source={{ uri: event.imageUrl }} style={styles.overlayEventImage} />
                                            ) : (
                                                <View style={styles.overlayPlaceholderImage}>
                                                    <MaterialCommunityIcons name="calendar" size={20} color="#999" />
                                                </View>
                                            )}
                                        </View>
                                        
                                        <View style={styles.overlayEventInfo}>
                                            <Text style={styles.overlayEventTitle} numberOfLines={2}>{event.title}</Text>
                                            <Text style={styles.overlayEventVenue} numberOfLines={1}>{event.venue}</Text>
                                            <Text style={styles.overlayEventDate}>
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                            <View style={styles.overlayEventMeta}>
                                                <Text style={styles.overlayEventCategory}>{event.category}</Text>
                                                <Text style={styles.overlayEventDistance}>{distance.toFixed(1)} km</Text>
                                            </View>
                                        </View>
                                        
                                        <TouchableOpacity
                                            style={styles.overlayViewButton}
                                            onPress={() => handleNavigateToDetails(event)}
                                        >
                                            <MaterialCommunityIcons 
                                                name="eye" 
                                                size={16} 
                                                color="#FFFFFF" 
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    eventMarker: {
        // No circular background - just the icon
    },
    selectedEventMarker: {
        transform: [{ scale: 1.3 }],
    },
    relocateButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        alignSelf: 'center',
        backgroundColor: '#6A5AE0',
        borderRadius: 30,
        width: 50,
        height: 50,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorBanner: {
        position: 'absolute',
        top: 110,
        left: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
        color: '#FF6B6B',
        marginLeft: 8,
        marginRight: 8,
    },
    retryButton: {
        backgroundColor: '#6A5AE0',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleButton: {
        position: 'absolute',
        top: 50,
        right: 10,
        alignSelf: 'center',
        backgroundColor: '#6A5AE0',
        borderRadius: 25,
        width: 50,
        height: 50,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 255)',
        borderRadius: 0,
        elevation: 8,
        maxHeight: Dimensions.get('window').height * 0.4,
    },
    overlayHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E1E5E9',
    },
    overlayEventsList: {
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    overlayEventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 5,
        width: 200,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E1E5E9',
    },
    selectedOverlayEventCard: {
        borderColor: '#6A5AE0',
        borderWidth: 2,
        backgroundColor: '#F0F0FF',
    },
    overlayEventImageContainer: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    overlayEventImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlayPlaceholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayEventInfo: {
        flex: 1,
    },
    overlayEventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    overlayEventVenue: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 4,
    },
    overlayEventDate: {
        fontSize: 11,
        color: '#999999',
        marginBottom: 6,
    },
    overlayEventMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    overlayEventCategory: {
        fontSize: 10,
        color: '#6A5AE0',
        backgroundColor: '#F0F0FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontWeight: '500',
    },
    overlayEventDistance: {
        fontSize: 10,
        color: '#999999',
        fontWeight: '500',
    },
    overlayViewButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#6A5AE0',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});