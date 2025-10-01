import * as React from 'react';
import { ScrollView, View, StyleSheet, Image, FlatList, Platform, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Chip, ProgressBar, MD3Colors } from 'react-native-paper';
import { fetchEventsByCategory } from '../services/events';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['All', 'Music', 'Food', 'Sports'];

export default function HomeScreen({ navigation }: any) {
  const [popular, setPopular] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCat, setActiveCat] = React.useState('All');
  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 768;

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
        
         <View style={styles.tabRow}>
           <View style={styles.discoverContainer}>
             <Text style={styles.tabActive}>Discover</Text>
             <View style={styles.underline} />
           </View>
           <Text style={styles.tabInactive}>Events</Text>
         </View>

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
            Popular {activeCat === 'All' ? 'Events' : activeCat + ' Events'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ProgressBar progress={0.5} color={MD3Colors.primary70} />
            <Text style={styles.loadingText}>Loading {activeCat.toLowerCase()} events...</Text>
          </View>
        ) : filteredPopular.length > 0 ? (
          <FlatList
            data={filteredPopular}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={!isWeb && !isTablet}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.eventsList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.eventCard,
                  isWeb && styles.eventCardWeb,
                  isTablet && styles.eventCardTablet
                ]}
                onPress={() => navigation.navigate('EventDetails', { item })}
              >
                {item.imageUrl ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.eventImage}
                    />
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.imageContainer, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}

                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.eventVenue} numberOfLines={1}>
                    📍 {item.venue}
                  </Text>
                  <Text style={styles.eventDate}>
                    📅 {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
    paddingBottom: 100,
  },

  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
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
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'thin',
    color: '#1A1A1A',
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    marginBottom: 20,
  },
  eventsList: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },

  // Event Cards
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventCardWeb: {
    width: 320,
    marginHorizontal: 8,
  },
  eventCardTablet: {
    width: 300,
    marginHorizontal: 12,
  },

  // Image Container
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E1E5E9',
  },
  placeholderText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(106, 90, 224, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventVenue: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
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
