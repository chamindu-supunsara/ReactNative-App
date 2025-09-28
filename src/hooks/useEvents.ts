import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { EventItem } from '../lib/types';
import { fetchNearbyEvents, fetchTopEvents } from '../services/events';


export function useNearbyEvents(radiusKm = 10) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Location permission denied');
                    const fallback = await fetchTopEvents(30);
                    setEvents(fallback);
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const nearby = await fetchNearbyEvents(loc.coords.latitude, loc.coords.longitude, radiusKm);
                setEvents(nearby);
            } catch (e: any) {
                setError(e?.message ?? 'Failed to load events');
                const fallback = await fetchTopEvents(30);
                setEvents(fallback);
            } finally {
                setLoading(false);
            }
        })();
    }, [radiusKm]);


    return { loading, events, error };
}