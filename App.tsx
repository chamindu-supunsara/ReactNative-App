import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/app/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
