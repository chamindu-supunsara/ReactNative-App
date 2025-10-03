import * as React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Chip, ProgressBar, MD3Colors } from 'react-native-paper';
import { fetchEventsByCategory } from '../services/events';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../components/EventCard';
import useFavorites from '../hooks/useFavorites';

const categories = ['All', 'Music', 'Food', 'Sports'];

export default function HomeScreen({ navigation }: any) {
  const [popular, setPopular] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCat, setActiveCat] = React.useState('All');
  const { favorites, toggleFavorite } = useFavorites();

  React.useEffect(() => {
    setLoading(true);
    fetchEventsByCategory(activeCat, 5).then(events => {
      setPopular(events);
      setLoading(false);
    }).catch(() => {
      setPopular([]);
      setLoading(false);
    });
  }, [activeCat]);

  const filteredPopular = popular;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                onPress={() => setActiveCat(cat)}
                style={[
                  styles.chip,
                  activeCat === cat && styles.chipSelected
                ]}
                textStyle={[
                  styles.chipText,
                  activeCat === cat && styles.chipTextSelected
                ]}
              >
                {cat}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionTitleBold}>Popular</Text>
            <Text style={styles.sectionTitleNormal}> {activeCat === 'All' ? 'Events' : activeCat + ' Events'}</Text>
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ProgressBar progress={0.5} color={MD3Colors.primary70} />
            <Text style={styles.loadingText}>Loading {activeCat.toLowerCase()} events...</Text>
          </View>
        ) : filteredPopular.length > 0 ? (
          filteredPopular.map(item => (
            <EventCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('EventDetails', { item })}
              onToggleFav={() => toggleFavorite(item)}
              isFav={favorites.some((fav: any) => fav.id === item.id)}
            />
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsIcon}>📅</Text>
            <Text style={styles.noEventsText}>No {activeCat.toLowerCase()} events found</Text>
            <Text style={styles.noEventsSubtext}>Check back later for new events!</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 120,
  },

  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    paddingTop: 0,
  },
  discoverContainer: {
    position: 'relative',
  },
  tabActive: {
    fontWeight: 'bold',
    fontSize: 40,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 3,
    backgroundColor: '#6A5AE0',
    borderRadius: 2,
  },
  tabInactive: {
    fontSize: 40,
    fontWeight: 'thin',
  },

  categoriesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 30,
    color: '#1A1A1A',
    marginBottom: 10,
  },
  sectionTitleBold: {
    fontWeight: 'bold',
  },
  sectionTitleNormal: {
    fontWeight: 'thin',
  },
  categoriesScroll: {
    paddingLeft: 4,
  },
  chip: {
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 50,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  chipSelected: {
    backgroundColor: '#6A5AE0',
    borderColor: '#6A5AE0',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },

  // Events Section
  eventsSection: {
    marginBottom: 0,
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  noEventsContainer: {
    alignItems: 'center',
    padding: 60,
  },
  noEventsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
