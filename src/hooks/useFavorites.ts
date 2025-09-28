import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../lib/types';

const KEY = 'favorites_v1';

export default function useFavorites() {
    const [favorites, setFavorites] = useState<EventItem[]>([]);


    useEffect(() => {
        AsyncStorage.getItem(KEY).then(raw => {
            if (raw) setFavorites(JSON.parse(raw));
        });
    }, []);

    async function toggleFavorite(item: EventItem) {
        setFavorites(prev => {
            const exists = prev.find(x => x.id === item.id);
            const next = exists ? prev.filter(x => x.id !== item.id) : [...prev, item];
            AsyncStorage.setItem(KEY, JSON.stringify(next));
            return next;
        });
    }

    function isFavorite(id: string) {
        return favorites.some(x => x.id === id);
    }

    return { favorites, toggleFavorite, isFavorite };
}