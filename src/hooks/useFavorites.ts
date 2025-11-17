import { useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('amira-flashcards.db');

type FavoriteRow = {
  wordId: number;
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.execSync(
      'CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, wordId INTEGER UNIQUE NOT NULL);',
    );
    const rows = db.getAllSync<FavoriteRow>('SELECT wordId FROM favorites;', []);
    setFavorites(new Set(rows.map((row) => row.wordId)));
    setReady(true);
  }, []);

  const toggleFavorite = useCallback((wordId: number) => {
    let nextState = false;
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(wordId)) {
        updated.delete(wordId);
        db.runSync('DELETE FROM favorites WHERE wordId = ?;', [wordId]);
        nextState = false;
      } else {
        updated.add(wordId);
        db.runSync('INSERT OR REPLACE INTO favorites (wordId) VALUES (?);', [wordId]);
        nextState = true;
      }
      return updated;
    });
    return nextState;
  }, []);

  const isFavorite = useCallback(
    (wordId: number) => favorites.has(wordId),
    [favorites],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    ready,
  };
};
