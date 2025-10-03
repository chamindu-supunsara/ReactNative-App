import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../lib/types';
import { incrementEventPopularity, decrementEventPopularity } from '../services/events';
import { useEventRefresh } from '../contexts/EventRefreshContext';

const KEY = 'XJSTFDKSDJKS';
const MAX_FAVORITES = 10;

type FavoriteItem = EventItem & {
    savedAt: string;
};

export default function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const { triggerRefresh } = useEventRefresh();

    const loadFavorites = async () => {
        try {
            const raw = await AsyncStorage.getItem(KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
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
                const next = prev.filter(x => x.id !== item.id);
                AsyncStorage.setItem(KEY, JSON.stringify(next));
                
                decrementEventPopularity(item.id).then(() => {
                    triggerRefresh();
                }).catch(error => {
                    console.error('Error decreasing event popularity:', error);
                });
                
                return next;
            } else {
                const favoriteItem: FavoriteItem = {
                    ...item,
                    savedAt: new Date().toISOString()
                };
                
                const next = [favoriteItem, ...prev].slice(0, MAX_FAVORITES);
                AsyncStorage.setItem(KEY, JSON.stringify(next));
                
                incrementEventPopularity(item.id).then(() => {
                    triggerRefresh();
                }).catch(error => {
                    console.error('Error increasing event popularity:', error);
                });
                
                return next;
            }
        });
    }

    function isFavorite(id: string) {
        return favorites.some(x => x.id === id);
    }

    const favoritesAsEventItems: EventItem[] = favorites.map(({ savedAt, ...event }) => event);

    return { 
        favorites: favoritesAsEventItems, 
        toggleFavorite, 
        isFavorite,
        refreshFavorites: loadFavorites,
        favoritesWithTimestamp: favorites
    };
}