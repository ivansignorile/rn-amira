import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts, Schoolbell_400Regular } from '@expo-google-fonts/schoolbell';
import { RootSiblingParent } from 'react-native-root-siblings';

import FlashcardSwiper from './src/components/FlashcardSwiper';

export default function App() {
  const [fontsLoaded] = useFonts({
    Schoolbell_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={[styles.container, styles.loader]} />;
  }

  return (
    <RootSiblingParent>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <FlashcardSwiper />
      </View>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FBFF',
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
