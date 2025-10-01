import * as React from 'react';
import { ScrollView, View, StyleSheet, Image, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useFavorites from '../hooks/useFavorites';

export default function EventDetailsScreen({ route }: any) {
    const { item } = route.params;
    const { isFavorite, toggleFavorite } = useFavorites();
    const isWeb = Platform.OS === 'web';
    const screenWidth = Dimensions.get('window').width;
    const isTablet = screenWidth > 768;

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Combined Image and Content Section */}
                <View style={styles.combinedSection}>
                    {/* Event Image */}
                    <View style={styles.imageSection}>
                        {item.imageUrl ? (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.eventImage}
                                />
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{item.category}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={[
                                        styles.saveButtonOverlay,
                                        isFavorite(item.id) ? styles.iconButtonOutlined : styles.iconButtonContained
                                    ]}
                                    onPress={() => toggleFavorite(item)}
                                >
                                    <MaterialCommunityIcons 
                                        name={isFavorite(item.id) ? "heart" : "heart-outline"}
                                        size={20}
                                        color={isFavorite(item.id) ? "#6A5AE0" : "#FFFFFF"}
                                    />
                                </TouchableOpacity>
                                <View style={styles.populationBadge}>
                                    <Text style={styles.populationText}>{item.popularity}</Text>
                                </View>
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.eventTitle}>{item.title}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.imageContainer, styles.placeholderImage]}>
                                <Text style={styles.placeholderText}>No Image</Text>
                                <TouchableOpacity 
                                    style={[
                                        styles.saveButtonOverlay,
                                        isFavorite(item.id) ? styles.iconButtonOutlined : styles.iconButtonContained
                                    ]}
                                    onPress={() => toggleFavorite(item)}
                                >
                                    <MaterialCommunityIcons 
                                        name={isFavorite(item.id) ? "heart" : "heart-outline"}
                                        size={20}
                                        color={isFavorite(item.id) ? "#6A5AE0" : "#FFFFFF"}
                                    />
                                </TouchableOpacity>
                                <View style={styles.populationBadge}>
                                    <Text style={styles.populationText}>{item.popularity || '123'}</Text>
                                </View>
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.eventTitle}>{item.title}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Event Details */}
                    <View style={styles.detailsSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📍</Text>
                            <Text style={styles.infoValue}>{item.venue}</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>📅</Text>
                            <Text style={styles.infoValue}>
                                {new Date(item.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>🕒</Text>
                            <Text style={styles.infoValue}>
                                {new Date(item.date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionsSection}>
                            <Button 
                                mode="outlined"
                                style={styles.actionButton}
                                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue)}`)}
                                icon="map"
                            >
                                Directions
                            </Button>
                            
                            <Button 
                                mode="outlined"
                                style={styles.actionButton}
                                onPress={() => Linking.openURL(`sms:&body=${encodeURIComponent('Join me at ' + item.title + ' on ' + new Date(item.date).toLocaleDateString())}`)}
                                icon="share"
                            >
                                Share
                            </Button>
                        </View>

                        {item.description && (
                            <View style={styles.descriptionSection}>
                                <Text style={styles.descriptionTitle}>About this event</Text>
                                <Text style={styles.descriptionText}>{item.description}</Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 100,
    },
    
    // Combined Section
    combinedSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        overflow: 'hidden',
    },
    
    // Image Section
    imageSection: {
        marginBottom: 0,
    },
    imageContainer: {
        position: 'relative',
        height: 280,
        backgroundColor: '#F0F0F0',
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
        backgroundColor: '#E1E5E9',
    },
    placeholderText: {
        color: '#999999',
        fontSize: 16,
        fontWeight: '500',
    },
    categoryBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(106, 90, 224, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    populationBadge: {
        position: 'absolute',
        top: 16,
        right: 100,
        backgroundColor: 'rgba(106, 90, 224, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    populationText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 38,
        height: 38,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
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

    // Details Section
    detailsSection: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 20,
        marginBottom: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666666',
        width: 30,
        marginRight: 12,
    },
    infoValue: {
        fontSize: 16,
        color: '#1A1A1A',
        flex: 1,
        fontWeight: '500',
    },
    descriptionSection: {
        marginTop: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#E1E5E9',
    },
    descriptionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
    },

    // Actions Section
    actionsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 10,
        marginBottom: 10,
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
    iconButtonContained: {
        backgroundColor: '#6A5AE0',
        borderWidth: 0,
    },
    iconButtonOutlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#6A5AE0',
    },
});