import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BackgroundDecorationsProps {
    children: React.ReactNode;
    style?: any;
}

export default function BackgroundDecorations({ children, style }: BackgroundDecorationsProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.topRightGradient} />
            
            <View style={styles.middleLeftPill} />
            
            <View style={styles.content}>
                {children}
            </View>
            
            <View style={styles.bottomRightPill} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        position: 'relative',
    },
    topRightGradient: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#E3F2FD',
    },
    middleLeftPill: {
        position: 'absolute',
        left: -30,
        top: '25%',
        width: 140,
        height: 240,
        borderRadius: 70,
        backgroundColor: '#E8F5E8',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    bottomRightPill: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 100,
        height: 160,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});
