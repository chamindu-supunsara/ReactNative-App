import * as React from 'react';
import { ScrollView, View, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Text, Searchbar, Chip } from 'react-native-paper';
import { fetchTopEvents } from '../services/events';
import { useNearbyEvents } from '../hooks/useEvents';
import useFavorites from '../hooks/useFavorites';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['All', 'Sports', 'Birthdays', 'Concerts', 'Food', 'Arts'];

export default function HomeScreen({ navigation }: any) {
  const [popular, setPopular] = React.useState<any[]>([]);
  const { loading, events: nearby } = useNearbyEvents(10);
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search, setSearch] = React.useState('');
  const [activeCat, setActiveCat] = React.useState('All');

  React.useEffect(() => {
    fetchTopEvents(10).then(setPopular);
  }, []);

  const featured = popular.length > 0 ? popular[0] : null;

  const filteredPopular =
    activeCat === 'All'
      ? popular
      : popular.filter((item) => item.category === activeCat);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 8 }}>
        <Searchbar
          placeholder="Find What You Need"
          value={search}
          onChangeText={setSearch}
          style={{ marginBottom: 15 }}
        />

        <View style={styles.tabRow}>
          <Text style={styles.tabActive}>Events</Text>
          <Text style={styles.tabInactive}>Categories</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              selected={activeCat === cat}
              onPress={() => setActiveCat(cat)}
              style={styles.chip}
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>

        {/* <Text variant="titleLarge" style={{ marginVertical: 12 }}>
           Events
        </Text> */}

        <View style={styles.tabRow1}>
          <Text style={styles.tabActive1}>Popular</Text>
          <Text style={styles.tabInactive1}>Events</Text>
        </View>

        {featured && (
          <View style={styles.featuredCard}>
            
            {featured.imageUrl && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: featured.imageUrl }}
                  style={styles.featuredImage}
                />
              </View>
            )}

            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredSubtitle}>
              {featured.venue} · {new Date(featured.date).toDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  tabActive: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  tabInactive: {
    fontSize: 30,
    color: '#000',
  },
  tabRow1: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 15,
    gap: 10,
  },
  tabActive1: {
    fontSize: 25,
  },
  tabInactive1: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  chip: {
    marginRight: 8,
  },
  featuredCard: {
    backgroundColor: '#6A5AE0',
    borderRadius: 60,
    padding: 10,
    marginVertical: 25,
    alignItems: 'center',
    elevation: 5,
    justifyContent: 'flex-start',
    height: 400,
    marginBottom: 100,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#f0f0f0',
    marginBottom: 16,
  },
  imageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 200,
    padding: 6,
    marginBottom: 25,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  featuredImage: {
    width: 250,
    height: 250,
    borderRadius: 200,
  },
});
