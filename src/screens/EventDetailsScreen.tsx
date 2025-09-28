import * as React from 'react';
import { ScrollView, Linking } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import useFavorites from '../hooks/useFavorites';


export default function EventDetailsScreen({ route }: any) {
    const { item } = route.params;
    const { isFavorite, toggleFavorite } = useFavorites();


    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Card>
                {item.imageUrl ? <Card.Cover source={{ uri: item.imageUrl }} /> : null}
                <Card.Title title={item.title} subtitle={new Date(item.date).toUTCString()} />
                <Card.Content>
                    <Text>{item.description ?? 'No description available.'}</Text>
                    <Text style={{ marginTop: 8 }}>Venue: {item.venue}</Text>
                </Card.Content>
                <Card.Actions>
                    <Button onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue)}`)}>Directions</Button>
                    <Button onPress={() => toggleFavorite(item)}>{isFavorite(item.id) ? 'Unsave' : 'Save'}</Button>
                    <Button onPress={() => Linking.openURL(`sms:&body=${encodeURIComponent('Join me at ' + item.title)}`)}>Share</Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}