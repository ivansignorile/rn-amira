import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { WordCard } from '../data/words';

type FlashcardProps = {
  word: WordCard;
  onPlay: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export const CARD_HEIGHT = Dimensions.get('window').height * 0.7;
export const CARD_WIDTH = Dimensions.get('window').width * 0.88;
const HAND_FONT = 'Schoolbell_400Regular';

const Flashcard: React.FC<FlashcardProps> = ({ word, onPlay, isFavorite, onToggleFavorite }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{word.category.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Aggiungi ai preferiti"
          onPress={onToggleFavorite}
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
        >
          <FontAwesome
            name={isFavorite ? 'heart' : 'heart-o'}
            size={28}
            color={isFavorite ? '#FFFFFF' : '#FF7B54'}
          />
        </TouchableOpacity>
      </View>
      <Image source={word.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.wordText}>{word.word.toUpperCase()}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={onPlay} style={styles.playButton}>
        <Text style={styles.playIcon}>▶︎</Text>
        <Text style={styles.playText}>ASCOLTA</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryBadge: {
    backgroundColor: '#C3E9FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#146C94',
    fontFamily: HAND_FONT,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE5EC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  favoriteButtonActive: {
    backgroundColor: '#FF9AA2',
  },
  image: {
    width: '100%',
    flex: 1,
    marginVertical: 12,
  },
  wordText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#004E64',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: HAND_FONT,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE17D',
    borderRadius: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  playIcon: {
    fontSize: 36,
    marginRight: 12,
    color: '#FF7B54',
    fontFamily: HAND_FONT,
  },
  playText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF7B54',
    letterSpacing: 1,
    fontFamily: HAND_FONT,
  },
});

export default Flashcard;
