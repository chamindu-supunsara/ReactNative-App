import { collection, getDocs, orderBy, limit, query, doc, updateDoc, increment, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../lib/types';
import { getCache, setCache, clearMultipleCaches } from '../lib/cache';
import { haversineKm } from '../lib/geo';

const TTL = 1000 * 60 * 60 * 1; // 1 hour

export async function fetchTopEvents(max = 5): Promise<EventItem[]> {
    const cacheKey = `events_top_${max}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;

    let q = query(collection(db, 'events'), orderBy('popularity', 'desc'), limit(max));
    let snap = await getDocs(q);
    let data: EventItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    if (data.length < max) {
        const allEventsQuery = query(collection(db, 'events'), limit(max * 2));
        const allSnap = await getDocs(allEventsQuery);
        const allData: EventItem[] = allSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        
        const sortedData = allData
            .sort((a, b) => {
                const aPop = a.popularity || 0;
                const bPop = b.popularity || 0;
                if (aPop !== bPop) return bPop - aPop;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            })
            .slice(0, max);
        
        data = sortedData;
    }

    await setCache(cacheKey, data, TTL);
    return data;
}


export async function fetchNearbyEvents(lat: number, lng: number, radiusKm = 10, max = 30): Promise<EventItem[]> {
    const cacheKey = `events_near_${lat.toFixed(2)}_${lng.toFixed(2)}_${radiusKm}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;


    // Simple approach: fetch a reasonable set, then filter client-side by distance.
    const q = query(collection(db, 'events'), orderBy('date'), limit(200));
    const snap = await getDocs(q);
    const all: EventItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const nearby = all
        .map(e => {
            // Handle both location formats
            let eventLat: number | undefined, eventLng: number | undefined;
            if ('lat' in e.location) {
                eventLat = e.location.lat;
                eventLng = e.location.lng;
            } else if ('latitude' in e.location) {
                eventLat = e.location.latitude;
                eventLng = e.location.longitude;
            }
            
            const dist = (eventLat && eventLng) ? haversineKm(lat, lng, eventLat, eventLng) : Infinity;
            return { e, dist };
        })
        .filter(x => isFinite(x.dist) && x.dist <= radiusKm)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, max)
        .map(x => x.e);


    await setCache(cacheKey, nearby, TTL);
    return nearby;
}


export async function fetchAllEvents(): Promise<EventItem[]> {
    const cacheKey = 'events_all';
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;

    // Get all events without any limits
    const q = query(collection(db, 'events'));
    const snap = await getDocs(q);
    const data: EventItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    // Sort by popularity (with fallback to 0 if not set) and then by date
    const sortedData = data.sort((a, b) => {
        const aPop = a.popularity || 0;
        const bPop = b.popularity || 0;
        if (aPop !== bPop) return bPop - aPop; // Higher popularity first
        return new Date(a.date).getTime() - new Date(b.date).getTime(); // Then by date
    });

    await setCache(cacheKey, sortedData, TTL);
    return sortedData;
}

export async function fetchEventsByCategory(category: string, max = 5): Promise<EventItem[]> {
    if (category === 'All') {
        return fetchTopEvents(max);
    }

    const cacheKey = `events_category_${category}_${max}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;

    // Get all events and filter by category, then sort by popularity
    const allEvents = await fetchAllEvents();
    const categoryEvents = allEvents
        .filter(event => event.category === category)
        .sort((a, b) => {
            const aPop = a.popularity || 0;
            const bPop = b.popularity || 0;
            if (aPop !== bPop) return bPop - aPop;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        .slice(0, max);

    await setCache(cacheKey, categoryEvents, TTL);
    return categoryEvents;
}

export async function searchEvents(keyword: string, max = 50): Promise<EventItem[]> {
    const key = keyword.trim().toLowerCase();
    const cacheKey = `events_search_${key}_${max}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;

    // Use fetchAllEvents to get all events for better search results
    const list = await fetchAllEvents();
    const res = list.filter(e =>
        e.title.toLowerCase().includes(key) || e.venue.toLowerCase().includes(key)
    ).slice(0, max);
    await setCache(cacheKey, res, TTL);
    return res;
}

// Popularity management functions
export async function incrementEventPopularity(eventId: string): Promise<void> {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            popularity: increment(1)
        });
        
        // Clear relevant caches to ensure fresh data
        await clearEventCaches();
    } catch (error) {
        console.error('Error incrementing event popularity:', error);
        throw error;
    }
}

export async function decrementEventPopularity(eventId: string): Promise<void> {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            popularity: increment(-1)
        });
        
        // Clear relevant caches to ensure fresh data
        await clearEventCaches();
    } catch (error) {
        console.error('Error decrementing event popularity:', error);
        throw error;
    }
}

// Helper function to clear event-related caches
async function clearEventCaches(): Promise<void> {
    try {
        // Clear all event-related cache keys
        const cacheKeys = [
            'events_all',
            'events_top_5',
            'events_top_10',
            'events_category_All',
            'events_category_Music',
            'events_category_Food', 
            'events_category_Sports'
        ];
        
        // Clear all event-related caches
        await clearMultipleCaches(cacheKeys);
        console.log('Event caches cleared successfully');
    } catch (error) {
        console.error('Error clearing event caches:', error);
    }
}

// Real-time listeners for cross-device updates
export function subscribeToEventUpdates(eventId: string, callback: (event: EventItem | null) => void): Unsubscribe {
    const eventRef = doc(db, 'events', eventId);
    
    return onSnapshot(eventRef, (doc) => {
        if (doc.exists()) {
            const eventData = { id: doc.id, ...doc.data() } as EventItem;
            callback(eventData);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Error listening to event updates:', error);
        callback(null);
    });
}

export function subscribeToAllEventsUpdates(callback: (events: EventItem[]) => void): Unsubscribe {
    const q = query(collection(db, 'events'));
    
    return onSnapshot(q, (snapshot) => {
        const events: EventItem[] = [];
        snapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as EventItem);
        });
        
        // Sort by popularity and date
        const sortedEvents = events.sort((a, b) => {
            const aPop = a.popularity || 0;
            const bPop = b.popularity || 0;
            if (aPop !== bPop) return bPop - aPop;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        callback(sortedEvents);
    }, (error) => {
        console.error('Error listening to all events updates:', error);
        callback([]);
    });
}

export function subscribeToTopEventsUpdates(max: number, callback: (events: EventItem[]) => void): Unsubscribe {
    return subscribeToAllEventsUpdates((allEvents) => {
        const topEvents = allEvents.slice(0, max);
        callback(topEvents);
    });
}

export function subscribeToCategoryEventsUpdates(category: string, max: number, callback: (events: EventItem[]) => void): Unsubscribe {
    return subscribeToAllEventsUpdates((allEvents) => {
        if (category === 'All') {
            callback(allEvents.slice(0, max));
        } else {
            const categoryEvents = allEvents
                .filter(event => event.category === category)
                .slice(0, max);
            callback(categoryEvents);
        }
    });
}