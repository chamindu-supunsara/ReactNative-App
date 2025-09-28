import * as React from 'react';
import { ScrollView } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { searchEvents } from '../services/events';
import EventCard from '../components/EventCard';
import useFavorites from '../hooks/useFavorites';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SearchScreen({ navigation }: any) {
    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState([] as any[]);
    const { isFavorite, toggleFavorite } = useFavorites();


    async function onSubmit() {
        const res = await searchEvents(q, 50);
        setResults(res);
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Searchbar placeholder="Find what you need" value={q} onChangeText={setQ} onSubmitEditing={onSubmit} />
                <Text style={{ marginTop: 12 }} variant="titleMedium">Results</Text>
                {results.map(item => (
                    <EventCard key={item.id} item={item}
                        onPress={() => navigation.navigate('EventDetails', { item })}
                        onToggleFav={() => toggleFavorite(item)}
                        isFav={isFavorite(item.id)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
        
    );
}