import * as React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventItem } from '../lib/types';


export default function EventCard({ item, onPress, onToggleFav, isFav }: {
    item: EventItem; onPress?: () => void; onToggleFav?: () => void; isFav?: boolean;
}) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        return { month, day, time };
    };

    const { month, day, time } = formatDate(item.date);

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.card}>
                <View style={styles.imageSection}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <MaterialCommunityIcons name="calendar" size={40} color="#CCCCCC" />
                        </View>
                    )}
                    
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    
                    {onToggleFav && (
                        <TouchableOpacity 
                            style={styles.heartButton}
                            onPress={onToggleFav}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons 
                                name={isFav ? "heart" : "heart-outline"}
                                size={20}
                                color={isFav ? "#FF6B6B" : "#FFFFFF"}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.contentSection}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateMonth}>{month}</Text>
                        <Text style={styles.dateDay}>{day}</Text>
                    </View>

                    <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                        
                        <View style={styles.detailsRow}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#666666" />
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#666666" />
                            <Text style={styles.venueText} numberOfLines={1}>{item.venue}</Text>
                        </View>

                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginVertical: 6,
        marginHorizontal: 2,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    imageSection: {
        position: 'relative',
        height: 120,
    },
    eventImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
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
    heartButton: {
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
    contentSection: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'flex-start',
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
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 6,
        lineHeight: 20,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 4,
        fontWeight: '500',
    },
    venueText: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 4,
        flex: 1,
        fontWeight: '500',
    }
});