import * as React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';


export default function SectionHeader({ title }: { title: string }) {
    return (
        <View style={{ paddingVertical: 8 }}>
            <Text variant="titleMedium">{title}</Text>
        </View>
    );
}