import * as React from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import useFavorites from '../hooks/useFavorites';
import EventCard from '../components/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function FavoritesScreen({ navigation }: any) {
    const { favorites, toggleFavorite } = useFavorites();


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text variant="titleLarge">Saved Events</Text>
                {favorites.map(item => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)} isFav
                    />
                ))}
                {favorites.length === 0 && <Text style={{ marginTop: 12 }}>No saved events yet.</Text>}
            </ScrollView>
        </SafeAreaView>
        
    );
}