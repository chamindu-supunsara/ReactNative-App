import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventItem } from '../lib/types';
import { getCache, setCache } from '../lib/cache';
import { haversineKm } from '../lib/geo';

const TTL = 1000 * 60 * 60 * 6; // 6 hours

export async function fetchTopEvents(max = 20): Promise<EventItem[]> {
    const cacheKey = `events_top_${max}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;


    const q = query(collection(db, 'events'), orderBy('popularity', 'desc'), limit(max));
    const snap = await getDocs(q);
    const data: EventItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
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


export async function searchEvents(keyword: string, max = 50): Promise<EventItem[]> {
    const key = keyword.trim().toLowerCase();
    const cacheKey = `events_search_${key}_${max}`;
    const cached = await getCache<EventItem[]>(cacheKey);
    if (cached) return cached;


    // naive search: load top N and filter — replace with indexed queries if needed
    const list = await fetchTopEvents(200);
    const res = list.filter(e =>
        e.title.toLowerCase().includes(key) || e.venue.toLowerCase().includes(key)
    ).slice(0, max);
    await setCache(cacheKey, res, TTL);
    return res;
}