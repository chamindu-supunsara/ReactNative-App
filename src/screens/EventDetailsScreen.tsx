import * as React from 'react';
import { ScrollView, View, StyleSheet, Image, TouchableOpacity, Modal, Share, Linking } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useFavorites from '../hooks/useFavorites';
import QRCodeScanner from '../components/QRCodeScanner';
import BackgroundDecorations from '../components/BackgroundDecorations';
import { useEventRefresh } from '../contexts/EventRefreshContext';
import { fetchAllEvents, subscribeToEventUpdates } from '../services/events';
import { EventItem } from '../lib/types';

export default function EventDetailsScreen({ route }: any) {
    const { item: initialItem } = route.params;
    const { isFavorite, toggleFavorite } = useFavorites();
    const { refreshTrigger } = useEventRefresh();
    const [showQRScanner, setShowQRScanner] = React.useState(false);
    const [currentItem, setCurrentItem] = React.useState<EventItem>(initialItem);

    const handleQRCodeScanned = (data: string) => {
        setShowQRScanner(false);
        
        if (data.startsWith('http')) {
            Linking.openURL(data);
        } else {
            alert(`QR Code scanned: ${data}`);
        }
    };

    const handleCloseQRScanner = () => {
        setShowQRScanner(false);
    };

    const refreshEventData = React.useCallback(async () => {
        try {
            const allEvents = await fetchAllEvents();
            const updatedEvent = allEvents.find(event => event.id === initialItem.id);
            if (updatedEvent) {
                setCurrentItem(updatedEvent);
            }
        } catch (error) {
            console.error('Error refreshing event data:', error);
        }
    }, [initialItem.id]);

    React.useEffect(() => {
        const unsubscribe = subscribeToEventUpdates(initialItem.id, (event) => {
            if (event) {
                setCurrentItem(event);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [initialItem.id]);

    React.useEffect(() => {
        refreshEventData();
    }, [refreshTrigger, refreshEventData]);

    const handleShare = async () => {
        try {
            const eventDate = new Date(currentItem.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            let lat: number, lng: number;
            if ('lat' in currentItem.location) {
                lat = currentItem.location.lat;
                lng = currentItem.location.lng;
            } else {
                lat = currentItem.location.latitude;
                lng = currentItem.location.longitude;
            }

            let shareMessage = `${currentItem.title}\n\n`;
            shareMessage += `Date: ${formattedDate}\n`;
            shareMessage += `Time: ${formattedTime}\n`;
            shareMessage += `Location: ${currentItem.venue}\n`;
            shareMessage += `Location Link: https://www.google.com/maps/search/?api=1&query=${lat},${lng}\n`;
            
            if (currentItem.description) {
                shareMessage += `\nDescription:\n${currentItem.description}`;
            }

            const shareContent = {
                title: currentItem.title,
                message: shareMessage,
            };
            
            await Share.share(shareContent);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <BackgroundDecorations>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.combinedSection}>
                        <View style={styles.imageSection}>
                            {currentItem.imageUrl ? (
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: currentItem.imageUrl }}
                                        style={styles.eventImage}
                                    />
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{currentItem.category}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.saveButtonOverlay}
                                        onPress={() => toggleFavorite(currentItem)}
                                    >
                                        <MaterialCommunityIcons 
                                            name={isFavorite(currentItem.id) ? "heart" : "heart-outline"}
                                            size={20}
                                            color={isFavorite(currentItem.id) ? "#FF6B6B" : "#FFFFFF"}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.populationBadge}>
                                        <Text style={styles.populationText}>{currentItem.popularity || 0}</Text>
                                    </View>
                                    <View style={styles.imageOverlay}>
                                        <Text style={styles.eventTitle}>{currentItem.title}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={[styles.imageContainer, styles.placeholderImage]}>
                                    <Text style={styles.placeholderText}>No Image</Text>
                                    <TouchableOpacity 
                                        style={styles.saveButtonOverlay}
                                        onPress={() => toggleFavorite(currentItem)}
                                    >
                                        <MaterialCommunityIcons 
                                            name={isFavorite(currentItem.id) ? "heart" : "heart-outline"}
                                            size={20}
                                            color={isFavorite(currentItem.id) ? "#FF6B6B" : "#FFFFFF"}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.populationBadge}>
                                        <Text style={styles.populationText}>{currentItem.popularity || 0}</Text>
                                    </View>
                                    <View style={styles.imageOverlay}>
                                        <Text style={styles.eventTitle}>{currentItem.title}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailsSection}>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateMonth}>
                                    {new Date(currentItem.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                </Text>
                                <Text style={styles.dateDay}>
                                    {new Date(currentItem.date).getDate()}
                                </Text>
                            </View>

                             <View style={styles.eventInfo}>
                                 <View style={styles.infoRow}>
                                     <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
                                     <Text style={styles.infoValue}>
                                         {new Date(currentItem.date).toLocaleDateString('en-US', {
                                             weekday: 'long',
                                             year: 'numeric',
                                             month: 'long',
                                             day: 'numeric'
                                         })}
                                     </Text>
                                 </View>
                                 
                                 <View style={styles.infoRow}>
                                     <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
                                     <Text style={styles.infoValue}>
                                         {new Date(currentItem.date).toLocaleTimeString('en-US', {
                                             hour: '2-digit',
                                             minute: '2-digit'
                                         })}
                                     </Text>
                                 </View>
                                 
                                 <View style={styles.infoRow}>
                                     <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666666" />
                                     <Text style={styles.infoValue}>{currentItem.venue}</Text>
                                 </View>
                             </View>
                         </View>

                         {currentItem.description && (
                             <View style={styles.descriptionSection}>
                                 <Text style={styles.descriptionTitle}>About this event</Text>
                                 <Text style={styles.descriptionText}>{currentItem.description}</Text>
                             </View>
                         )}

                        <View style={styles.actionsSection}>
                            <Button 
                                mode="outlined"
                                style={styles.actionButton}
                                onPress={() => {
                                    let lat: number, lng: number;
                                    if ('lat' in currentItem.location) {
                                        lat = currentItem.location.lat;
                                        lng = currentItem.location.lng;
                                    } else {
                                        lat = currentItem.location.latitude;
                                        lng = currentItem.location.longitude;
                                    }
                                    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
                                }}
                                icon="map"
                            >
                                Directions
                            </Button>
                            
                            <Button 
                                mode="outlined"
                                style={styles.actionButton}
                                onPress={handleShare}
                                icon="share"
                            >
                                Share
                            </Button>
                        </View>
                    </View>

                </ScrollView>
                
                <TouchableOpacity 
                    style={styles.qrButton}
                    onPress={() => setShowQRScanner(true)}
                >
                    <MaterialCommunityIcons 
                        name="qrcode"
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </BackgroundDecorations>

            <Modal
                visible={showQRScanner}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <QRCodeScanner
                    onQRCodeScanned={handleQRCodeScanned}
                    onClose={handleCloseQRScanner}
                />
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 100,
    },
    
    combinedSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    
    imageSection: {
        position: 'relative',
        height: 280,
        marginBottom: 0,
    },
    imageContainer: {
        position: 'relative',
        height: 280,
        backgroundColor: '#F5F5F5',
        borderRadius: 0,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    placeholderText: {
        color: '#999999',
        fontSize: 16,
        fontWeight: '500',
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(106, 90, 224, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    populationBadge: {
        position: 'absolute',
        top: 12,
        right: 80,
        backgroundColor: 'rgba(106, 90, 224, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    populationText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    saveButtonOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
        paddingTop: 40,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 0,
        lineHeight: 32,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    detailsSection: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        borderRadius: 0,
        marginBottom: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    
    dateBadge: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
        paddingTop: 20,
    },
    dateMonth: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6A5AE0',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        lineHeight: 20,
    },
    
    eventInfo: {
        flex: 1,
    },
    
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666666',
        width: 30,
        marginRight: 12,
    },
    infoValue: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 4,
        flex: 1,
        fontWeight: '500',
    },
     descriptionSection: {
         padding: 12,
         paddingTop: 16,
         paddingBottom: 0,
         backgroundColor: 'transparent',
         borderTopWidth: 1,
         borderTopColor: '#E1E5E9',
     },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 15,
    },

    actionsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        padding: 12,
        paddingTop: 0,
        backgroundColor: 'transparent',
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
    },
    iconOnlyButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0,
    },
    
    qrButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6A5AE0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },

});