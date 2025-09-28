export type EventItem = {
    id: string;
    title: string;
    category: 'Music' | 'Sports' | 'Food' | 'Arts' | 'Birthdays' | 'Other';
    date: string;
    venue: string;
    location: { lat: number; lng: number; city?: string };
    imageUrl?: string;
    popularity?: number;
    description?: string;
};