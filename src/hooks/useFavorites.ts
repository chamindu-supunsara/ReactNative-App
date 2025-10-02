import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../lib/types';

const KEY = 'favorites_v2';
const MAX_FAVORITES = 10;

type FavoriteItem = EventItem & {
    savedAt: string; // ISO timestamp when the event was saved
};

export default function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    const loadFavorites = async () => {
        try {
            const raw = await AsyncStorage.getItem(KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Sort by savedAt timestamp, most recent first
                const sorted = parsed.sort((a: FavoriteItem, b: FavoriteItem) => 
                    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
                );
                setFavorites(sorted);
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            setFavorites([]);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    async function toggleFavorite(item: EventItem) {
        setFavorites(prev => {
            const exists = prev.find(x => x.id === item.id);
            
            if (exists) {
                // Remove from favorites
                const next = prev.filter(x => x.id !== item.id);
                AsyncStorage.setItem(KEY, JSON.stringify(next));
                return next;
            } else {
                // Add to favorites with timestamp
                const favoriteItem: FavoriteItem = {
                    ...item,
                    savedAt: new Date().toISOString()
                };
                
                // Add to beginning and limit to MAX_FAVORITES
                const next = [favoriteItem, ...prev].slice(0, MAX_FAVORITES);
                AsyncStorage.setItem(KEY, JSON.stringify(next));
                return next;
            }
        });
    }

    function isFavorite(id: string) {
        return favorites.some(x => x.id === id);
    }

    // Return favorites as EventItem[] for compatibility
    const favoritesAsEventItems: EventItem[] = favorites.map(({ savedAt, ...event }) => event);

    return { 
        favorites: favoritesAsEventItems, 
        toggleFavorite, 
        isFavorite,
        refreshFavorites: loadFavorites,
        favoritesWithTimestamp: favorites // For internal use if needed
    };
}