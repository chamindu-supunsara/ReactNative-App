import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import NearbyScreen from '../screens/NearbyScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tabs.Navigator 
            screenOptions={{ 
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#8674b1ff',
                tabBarInactiveTintColor: '#999999',
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIconStyle: styles.tabBarIcon,
            }}
        >
            <Tabs.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? "home" : "home-outline"}
                            size={focused ? 30 : 30}
                            color={focused ? '#8674b1ff' : color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Nearby"
                component={NearbyScreen}
                options={{
                    tabBarLabel: 'Nearby',
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? "map" : "map-outline"}
                            size={focused ? 30 : 30}
                            color={focused ? '#8674b1ff' : color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favorites',
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? "star" : "star-outline"}
                            size={focused ? 30 : 30}
                            color={focused ? '#8674b1ff' : color}
                        />
                    ),
                }}
            />
        </Tabs.Navigator>
    );
}

const customTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#000000',
        background: '#ffffff',
        card: '#ffffff',
        text: '#000000',
        border: '#e0e0e0',
        notification: '#ff6b6b',
    },
};

export default function AppNavigator() {
    return (
        <NavigationContainer theme={customTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: styles.headerStyle,
                    headerTitleStyle: styles.headerTitleStyle,
                    headerTintColor: '#000000'
                }}
            >
                <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Main"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EventDetails"
                    component={EventDetailsScreen}
                    options={{ 
                        title: "Event Details",
                        headerStyle: styles.headerStyle,
                        headerTitleStyle: styles.headerTitleStyle,
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#ffffff',
        position: 'absolute',
        borderTopWidth: 0,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' || Platform.OS === 'android' ? 20 : 8,
        height: Platform.OS === 'ios' || Platform.OS === 'android' ? 88 : 64,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderRadius: 40,
        marginHorizontal: 20,
        marginBottom: Platform.OS === 'ios' || Platform.OS === 'android' ? 20 : 8,
        borderWidth: 1,
        borderColor: '#E3F2FD'
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
    },
    tabBarIcon: {
        marginTop: 3,
    },
    headerStyle: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    cardStyle: {
        backgroundColor: '#ffffff',
    },
});
