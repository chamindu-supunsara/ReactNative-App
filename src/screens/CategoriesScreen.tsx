import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { fetchTopEvents } from '../services/events';
import EventCard from '../components/EventCard';
import useFavorites from '../hooks/useFavorites';
import { SafeAreaView } from 'react-native-safe-area-context';

const cats = ['All', 'Music', 'Sports', 'Food', 'Arts', 'Birthdays'] as const;

export default function CategoriesScreen({ navigation }: any) {
    const [active, setActive] = React.useState<typeof cats[number]>('All');
    const [items, setItems] = React.useState<any[]>([]);
    const { isFavorite, toggleFavorite } = useFavorites();

    React.useEffect(() => {
        fetchTopEvents(100).then(setItems);
    }, []);

    const filtered = active === 'All' ? items : items.filter(x => x.category === active);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text variant="titleLarge">Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
                    {cats.map(c => (
                        <Chip key={c} selected={active === c} onPress={() => setActive(c as any)} style={{ margin: 4 }}>{c}</Chip>
                    ))}
                </View>
                {filtered.map(item => (
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