import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <View style={styles.topRightGradient} />
                    
                <View style={styles.middleLeftPill}>
                        
                </View>
                    
                <View style={styles.content}>
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
                            <Text variant="titleLarge">Near Me</Text>
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
                </View>

            <View style={styles.bottomRightPill} />
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        position: 'relative',
    },
    topRightGradient: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#E3F2FD',
    },
    middleLeftPill: {
        position: 'absolute',
        left: -30,
        top: '25%',
        width: 140,
        height: 240,
        borderRadius: 70,
        backgroundColor: '#E8F5E8',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    bottomRightPill: {
        position: 'absolute',
        bottom: 12,
        right: -40,
        width: 100,
        height: 160,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
    },
    content: {
        flex: 1,
        paddingHorizontal: 2,
        paddingTop: 2,
        justifyContent: 'space-between',
    }
});
