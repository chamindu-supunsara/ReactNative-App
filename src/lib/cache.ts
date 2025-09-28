import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setCache<T>(key: string, value: T, ttlMs: number) {
    const payload = { value, exp: Date.now() + ttlMs };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
}

export async function getCache<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
        const { value, exp } = JSON.parse(raw);
        if (Date.now() > exp) {
            await AsyncStorage.removeItem(key);
            return null;
        }
        return value as T;
    } catch {
        return null;
    }
}
