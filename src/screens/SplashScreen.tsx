import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function SplashScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.topRightGradient} />
            
            <View style={styles.middleLeftPill}>
                
            </View>
            
            <View style={styles.content}>
                <Text style={styles.title}>Nomsy</Text>
                
                <View style={styles.textBlock}>
                    <Text style={styles.headline}>SHOP, DINE AND WATCH</Text>
                    <Text style={styles.description}>
                        Nomsy helps users find a wide range of products, services and events in their local area or beyond.
                    </Text>
                </View>
                
                <Button 
                    mode="contained" 
                    style={styles.button} 
                    labelStyle={styles.buttonText}
                    onPress={() => navigation.replace('Main')}
                    buttonColor="#000"
                    textColor="#fff"
                >
                    START
                </Button>
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
        paddingHorizontal: 24,
        paddingTop: 60,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 100,
        fontWeight: 'thin',
        color: '#000000',
        marginBottom: 40,
    },
    textBlock: {
        marginBottom: 10,
        marginTop: 200,
    },
    headline: {
        fontSize: 40,
        fontWeight: '300',
        color: '#000000',
        fontFamily: 'System',
    },
    description: {
        fontSize: 20,
        color: '#000000',
        lineHeight: 24,
    },
    decorativeElements: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 40,
    },
    crescent: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000000',
        marginRight: 8,
        transform: [{ scaleX: 0.5 }],
    },
    pillText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 22,
        marginVertical: 2,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 40,
        minWidth: 120,
        alignSelf: 'flex-start',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});

