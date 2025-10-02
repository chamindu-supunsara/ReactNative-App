import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useFavorites from '../hooks/useFavorites';
import EventCard from '../components/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchEvents } from '../services/events';

export default function FavoritesScreen({ navigation }: any) {
    const { favorites, isFavorite, toggleFavorite, refreshFavorites } = useFavorites();
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState([] as any[]);

    // Refresh favorites when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refreshFavorites();
        }, [refreshFavorites])
    );

    async function onSubmit() {
        const res = await searchEvents(q, 50);
        setResults(res);
    }

    React.useEffect(() => { if (!q) { setResults([]); }}, [q]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <Searchbar 
                    placeholder="Find Your Saved Events" 
                    value={q} 
                    onChangeText={setQ} 
                    onSubmitEditing={onSubmit}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                />
                <View style={styles.tabRow}>
                    <Text style={styles.tabActive}>Saved</Text>
                    <Text style={styles.tabInactive}>Events</Text>
                </View>
                {q && results.map(item => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)}
                        isFav={isFavorite(item.id)}
                    />
                ))}
                
                {!q && favorites.map((item, index) => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)} isFav
                    />
                ))}
                
                {!q && favorites.length === 0 && (
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
                
                {q && results.length === 0 && (
                    <View style={styles.emptyStateContainer}>
                        <MaterialCommunityIcons 
                            name="magnify" 
                            size={80} 
                            color="#6A5AE0" 
                            style={styles.emptyStateIcon}
                        />
                        <Text style={styles.emptyStateTitle}>No Search Results</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Try searching with different keywords
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
    searchBar: {
        marginBottom: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        fontSize: 16,
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