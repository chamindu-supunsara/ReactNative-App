import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useFavorites from '../hooks/useFavorites';
import EventCard from '../components/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchEvents } from '../services/events';

export default function FavoritesScreen({ navigation }: any) {
    const { favorites, isFavorite, toggleFavorite } = useFavorites();
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState([] as any[]);

    async function onSubmit() {
        const res = await searchEvents(q, 50);
        setResults(res);
    }

    React.useEffect(() => { if (!q) { setResults([]); }}, [q]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>

                <Searchbar placeholder="Find You Saved Events" value={q} onChangeText={setQ} onSubmitEditing={onSubmit} />
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
                
                {!q && favorites.map(item => (
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
                            Start exploring events and save your favorites to see them here!
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
    tabRow: {
      flexDirection: 'row',
      marginBottom: 10,
      marginTop: 20,
      gap: 10,
    },
    tabActive: {
      fontWeight: 'bold',
      fontSize: 30,
    },
    tabInactive: {
      fontSize: 30,
      color: '#000',
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
    }
});