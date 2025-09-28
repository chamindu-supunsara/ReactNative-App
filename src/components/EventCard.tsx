import * as React from 'react';
import { Card, Button, Text } from 'react-native-paper';
import { View, Linking } from 'react-native';
import { EventItem } from '../lib/types';


export default function EventCard({ item, onPress, onToggleFav, isFav }: {
    item: EventItem; onPress?: () => void; onToggleFav?: () => void; isFav?: boolean;
}) {
    return (
        <Card style={{ marginVertical: 8 }} onPress={onPress}>
            {item.imageUrl ? <Card.Cover source={{ uri: item.imageUrl }} /> : null}
            <Card.Title title={item.title} subtitle={`${item.venue} • ${new Date(item.date).toDateString()}`} />
            <Card.Actions>
                <Button onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue)}`)}>Map</Button>
                <Button onPress={onToggleFav}>{isFav ? 'Unsave' : 'Save'}</Button>
            </Card.Actions>
        </Card>
    );
}