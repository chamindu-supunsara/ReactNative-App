import * as React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';


export default function SplashScreen({ navigation }: any) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text variant="headlineLarge">Nomsy</Text>
            <Text style={{ marginTop: 8 }}>All With Just A Few Taps</Text>
            <Button mode="contained" style={{ marginTop: 24 }} onPress={() => navigation.replace('Main')}>Start</Button>
        </View>
    );
}