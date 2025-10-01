import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../lib/types';
import { getCache, setCache } from '../lib/cache';
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
        .map(e => ({ e, dist: haversineKm(lat, lng, e.location?.lat, e.location?.lng) }))
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