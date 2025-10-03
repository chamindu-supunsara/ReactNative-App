import { collection, getDocs, orderBy, limit, query, doc, updateDoc, increment, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../lib/types';
import { getCache, setCache, clearMultipleCaches } from '../lib/cache';
import { haversineKm } from '../lib/geo';

const TTL = 1000 * 60 * 60 * 1;

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


export async function fetchAllEvents(): Promise<EventItem[]> {
    const cacheKey = 'events_all';
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;

    const q = query(collection(db, 'events'));
    const snap = await getDocs(q);
    const data: EventItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    
    const sortedData = data.sort((a, b) => {
        const aPop = a.popularity || 0;
        const bPop = b.popularity || 0;
        if (aPop !== bPop) return bPop - aPop;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
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

    const list = await fetchAllEvents();
    const res = list.filter(e =>
        e.title.toLowerCase().includes(key) || e.venue.toLowerCase().includes(key)
    ).slice(0, max);
    await setCache(cacheKey, res, TTL);
    return res;
}

export async function incrementEventPopularity(eventId: string): Promise<void> {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            popularity: increment(1)
        });
        
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
        
        await clearEventCaches();
    } catch (error) {
        console.error('Error decrementing event popularity:', error);
        throw error;
    }
}

async function clearEventCaches(): Promise<void> {
    try {
        const cacheKeys = [
            'events_all',
            'events_top_5',
            'events_top_10',
            'events_category_All',
            'events_category_Music',
            'events_category_Food', 
            'events_category_Sports'
        ];
        
        await clearMultipleCaches(cacheKeys);
        console.log('Event caches cleared successfully');
    } catch (error) {
        console.error('Error clearing event caches:', error);
    }
}

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