import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useFavorites from '../hooks/useFavorites';
import EventCard from '../components/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen({ navigation }: any) {
    const { favorites, toggleFavorite, refreshFavorites } = useFavorites();

    useFocusEffect(
        React.useCallback(() => {
            refreshFavorites();
        }, [refreshFavorites])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.tabRow}>
                    <Text style={styles.tabActive}>Saved</Text>
                    <Text style={styles.tabInactive}>Events</Text>
                </View>
                
                {favorites.map((item, index) => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)} isFav
                    />
                ))}
                
                {favorites.length === 0 && (
                    <View style={styles.emptyStateContainer}>
                        <MaterialCommunityIcons 
                            name="calendar-heart" 
                            size={80} 
                            color="#6A5AE0" 
                            style={styles.emptyStateIcon}
                        />
                        <Text style={styles.emptyStateTitle}>No Saved Events</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Start exploring events and save your favorites to see them here! You can save up to 10 recent events.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    tabRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
        alignItems: 'baseline',
    },
    tabActive: {
        fontWeight: 'bold',
        fontSize: 30,
        color: '#1A1A1A',
    },
    tabInactive: {
        fontSize: 30,
        color: '#999999',
        fontWeight: '500',
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 100,
      paddingHorizontal: 40,
    },
    emptyStateIcon: {
      marginBottom: 24,
    },
    emptyStateTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1A1A1A',
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
      lineHeight: 24,
    },
});