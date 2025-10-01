export type EventItem = {
    id: string;
    title: string;
    category: 'Music' | 'Sports' | 'Food';
    date: string;
    venue: string;
    location: { lat: number; lng: number; city?: string } | { latitude: number; longitude: number };
    imageUrl?: string;
    popularity?: number;
    description?: string;
};