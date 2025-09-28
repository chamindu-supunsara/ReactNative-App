import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { fetchTopEvents } from '../services/events';
import { useNearbyEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import useFavorites from '../hooks/useFavorites';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen({ navigation }: any) {
    const [popular, setPopular] = React.useState<any[]>([]);
    const { loading, events: nearby } = useNearbyEvents(10);
    const { isFavorite, toggleFavorite } = useFavorites();


    React.useEffect(() => {
        fetchTopEvents(10).then(setPopular);
    }, []);


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text variant="titleLarge">Popular Events</Text>
                {popular.map(item => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)}
                        isFav={isFavorite(item.id)}
                    />
                ))}


                <View style={{ height: 8 }} />
                <Text variant="titleLarge">Nearby (10 km)</Text>
                {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : (
                    nearby.map(item => (
                        <EventCard key={item.id} item={item}
                            onPress={() => navigation.navigate('EventDetails', { item })}
                            onToggleFav={() => toggleFavorite(item)}
                            isFav={isFavorite(item.id)}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
        
    );
}