import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';
import { LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import Swiper from 'react-native-deck-swiper';

import Flashcard, { CARD_HEIGHT, CARD_WIDTH } from './Flashcard';
import { WORDS, WordCard } from '../data/words';
import { useFavorites } from '../hooks/useFavorites';

const shuffleWords = (list: WordCard[]) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export async function playSound(audioFile: AVPlaybackSource) {
  const { sound } = await Audio.Sound.createAsync(audioFile);
  await sound.playAsync();
  return sound;
}

const FlashcardSwiper: React.FC = () => {
  const [deck, setDeck] = useState<WordCard[]>(() => shuffleWords(WORDS));
  const [cardIndex, setCardIndex] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const swiperRef = useRef<Swiper<WordCard> | null>(null);
  const [deckSize, setDeckSize] = useState({ width: 0, height: 0 });
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const currentDeck = useMemo(() => {
    if (!showFavorites) {
      return deck;
    }
    return deck.filter((word) => favorites.has(word.id));
  }, [deck, favorites, showFavorites]);

  const cleanupSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const playWordAudio = useCallback(
    async (word: WordCard) => {
      await cleanupSound();
      try {
        const sound = await playSound(word.audio);
        soundRef.current = sound;
      } catch (error) {
        console.warn('Errore riproduzione audio', error);
      }
    },
    [cleanupSound],
  );

  useEffect(() => {
    if (!currentDeck.length) {
      return () => undefined;
    }
    playWordAudio(currentDeck[cardIndex % currentDeck.length]);
    return () => {
      cleanupSound();
    };
  }, [cardIndex, cleanupSound, currentDeck, playWordAudio]);

  useEffect(() => {
    if (cardIndex >= currentDeck.length && currentDeck.length > 0) {
      setCardIndex(0);
      requestAnimationFrame(() => {
        swiperRef.current?.jumpToCardIndex(0);
      });
    }
  }, [cardIndex, currentDeck.length]);

  const goToCard = useCallback(
    (targetIndex: number) => {
      const deckLength = currentDeck.length;
      if (!deckLength) {
        setCardIndex(0);
        return;
      }
      const boundedIndex = targetIndex % deckLength;
      setCardIndex(boundedIndex);
      requestAnimationFrame(() => {
        swiperRef.current?.jumpToCardIndex(boundedIndex);
      });
    },
    [currentDeck.length],
  );

  const handleSwipeLeft = useCallback(
    (index: number) => {
      if (!currentDeck.length) {
        return;
      }
      setCardIndex((index + 1) % currentDeck.length);
    },
    [currentDeck.length],
  );

  const handleSwipeRight = useCallback(
    (index: number) => {
      if (!currentDeck.length) {
        return;
      }
      const previousIndex = (index - 1 + currentDeck.length) % currentDeck.length;
      goToCard(previousIndex);
    },
    [currentDeck.length, goToCard],
  );

  const handleFavoriteToggle = useCallback(
    (word: WordCard) => {
      const added = toggleFavorite(word.id);
      const message = added
        ? `"${word.word}" aggiunta ai preferiti`
        : `"${word.word}" rimossa dai preferiti`;
      Toast.show(message, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 40,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: '#004E64',
        textColor: '#FFFFFF',
      });
    },
    [toggleFavorite],
  );

  const handleDeckLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== deckSize.width || height !== deckSize.height) {
      setDeckSize({ width, height });
    }
  }, [deckSize.height, deckSize.width]);

  const cardPositionStyle = deckSize.width && deckSize.height
    ? {
        top: Math.max((deckSize.height - CARD_HEIGHT) / 2, 0),
        left: Math.max((deckSize.width - CARD_WIDTH) / 2, 0),
      }
    : {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Le parole di Amira</Text>
          <Text style={styles.subtitle}>Fai swipe o premi play per ascoltare la parola</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setShowFavorites(false)}
              style={[styles.toggleButton, !showFavorites && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, !showFavorites && styles.toggleTextActive]}>Tutte</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFavorites(true)}
              style={[styles.toggleButton, showFavorites && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, showFavorites && styles.toggleTextActive]}>Preferite</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.swiperWrapper}>
          <View style={styles.deckArea} onLayout={handleDeckLayout}>
            {currentDeck.length ? (
              <Swiper
                ref={(ref) => {
                  swiperRef.current = ref;
                }}
                cards={currentDeck}
                cardIndex={cardIndex}
                renderCard={(card) =>
                  card ? (
                    <View style={styles.cardShell}>
                      <Flashcard
                        word={card}
                        onPlay={() => playWordAudio(card)}
                        isFavorite={isFavorite(card.id)}
                        onToggleFavorite={() => handleFavoriteToggle(card)}
                      />
                    </View>
                  ) : (
                    <View style={[styles.cardShell, styles.emptyCard]}>
                      <Text style={styles.emptyText}>Nessuna scheda</Text>
                    </View>
                  )
                }
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={() => {
                  const reshuffled = shuffleWords(WORDS);
                  setDeck(reshuffled);
                  goToCard(0);
                }}
                backgroundColor="transparent"
                containerStyle={styles.deckContainer}
                stackSize={3}
                stackScale={10}
                stackSeparation={18}
                cardVerticalMargin={0}
                disableBottomSwipe
                disableTopSwipe
                verticalSwipe={false}
                cardStyle={[styles.cardSlot, cardPositionStyle]}
                animateOverlayLabelsOpacity
                animateCardOpacity
              />
            ) : (
              <View style={[styles.cardShell, styles.emptyFavorites]}>
                <Text style={styles.emptyText}>Nessun preferito ancora</Text>
                <Text style={styles.emptyHint}>Aggiungi qualche parola per vederla qui!</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FBFF',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  header: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#004E64',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Schoolbell_400Regular',
  },
  subtitle: {
    fontSize: 18,
    color: '#2D93AD',
    textAlign: 'center',
    fontFamily: 'Schoolbell_400Regular',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    columnGap: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E0F2F1',
  },
  toggleButtonActive: {
    backgroundColor: '#FF9AA2',
  },
  toggleText: {
    fontSize: 16,
    color: '#2D93AD',
    fontFamily: 'Schoolbell_400Regular',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  swiperWrapper: {
    flex: 1,
    marginTop: 16,
    paddingBottom: 24,
  },
  deckArea: {
    flex: 1,
    position: 'relative',
  },
  deckContainer: {
    flex: 1,
  },
  cardSlot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'transparent',
  },
  cardShell: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#BEE1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFavorites: {
    borderWidth: 0,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 24,
    color: '#7AA5B1',
    fontFamily: 'Schoolbell_400Regular',
  },
  emptyHint: {
    fontSize: 18,
    marginTop: 12,
    color: '#9ABED0',
    textAlign: 'center',
    fontFamily: 'Schoolbell_400Regular',
  },
});

export default FlashcardSwiper;
