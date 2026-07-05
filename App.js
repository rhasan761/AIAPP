import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const BOARD_SIZE = 18;
const INITIAL_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];
const INITIAL_DIRECTION = { x: 1, y: 0, label: 'RIGHT' };
const DIRECTIONS = {
  UP: { x: 0, y: -1, label: 'UP' },
  DOWN: { x: 0, y: 1, label: 'DOWN' },
  LEFT: { x: -1, y: 0, label: 'LEFT' },
  RIGHT: { x: 1, y: 0, label: 'RIGHT' },
};
const TICK_RATE_MS = 140;

function positionsMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

function createFood(snake) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const openCells = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  return openCells[Math.floor(Math.random() * openCells.length)];
}

function getInitialState() {
  const snake = [...INITIAL_SNAKE];
  return {
    snake,
    food: createFood(snake),
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    score: 0,
    bestScore: 0,
    isPaused: false,
    isGameOver: false,
  };
}

export default function App() {
  const [game, setGame] = useState(getInitialState);
  const directionRef = useRef(INITIAL_DIRECTION);

  const resetGame = useCallback(() => {
    const nextGame = getInitialState();
    setGame((current) => ({ ...nextGame, bestScore: current.bestScore }));
    directionRef.current = INITIAL_DIRECTION;
  }, []);

  const changeDirection = useCallback((direction) => {
    setGame((current) => {
      const currentDirection = directionRef.current;
      const isReverse = currentDirection.x + direction.x === 0 && currentDirection.y + direction.y === 0;

      if (isReverse || current.isGameOver) {
        return current;
      }

      return { ...current, nextDirection: direction };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGame((current) => {
      if (current.isGameOver) {
        return current;
      }

      return { ...current, isPaused: !current.isPaused };
    });
  }, []);

  useEffect(() => {
    if (game.isPaused || game.isGameOver) {
      return undefined;
    }

    const interval = setInterval(() => {
      setGame((current) => {
        if (current.isPaused || current.isGameOver) {
          return current;
        }

        const direction = current.nextDirection;
        directionRef.current = direction;
        const head = current.snake[0];
        const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
        const hasHitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= BOARD_SIZE || nextHead.y >= BOARD_SIZE;
        const hasHitBody = current.snake.some((part, index) => index !== current.snake.length - 1 && positionsMatch(part, nextHead));

        if (hasHitWall || hasHitBody) {
          return {
            ...current,
            isGameOver: true,
            bestScore: Math.max(current.bestScore, current.score),
          };
        }

        const ateFood = current.food && positionsMatch(nextHead, current.food);
        const snake = [nextHead, ...current.snake];

        if (!ateFood) {
          snake.pop();
        }

        const score = ateFood ? current.score + 1 : current.score;
        const food = ateFood ? createFood(snake) : current.food;

        return {
          ...current,
          snake,
          direction,
          score,
          bestScore: Math.max(current.bestScore, score),
          food,
          isGameOver: food === null,
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [game.isPaused, game.isGameOver]);

  const cells = useMemo(() => {
    const snakeMap = new Map(game.snake.map((part, index) => [`${part.x},${part.y}`, index]));
    const items = [];

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        const key = `${x},${y}`;
        const snakeIndex = snakeMap.get(key);
        const isHead = snakeIndex === 0;
        const isSnake = snakeIndex !== undefined;
        const isFood = game.food && positionsMatch(game.food, { x, y });

        items.push(
          <View
            key={key}
            style={[
              styles.cell,
              isSnake && styles.snakeCell,
              isHead && styles.snakeHead,
              isFood && styles.foodCell,
            ]}
          />,
        );
      }
    }

    return items;
  }, [game.food, game.snake]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Snake Arcade</Text>
        <Text style={styles.subtitle}>Eat apples, grow longer, and avoid crashes.</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{game.score}</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Best</Text>
          <Text style={styles.scoreValue}>{game.bestScore}</Text>
        </View>
      </View>

      <View style={styles.board}>{cells}</View>

      <Text style={styles.stateText}>
        {game.isGameOver ? 'Game over! Tap Restart.' : game.isPaused ? 'Paused' : `Moving ${game.direction.label.toLowerCase()}`}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => changeDirection(DIRECTIONS.UP)}>
          <Text style={styles.controlText}>↑</Text>
        </TouchableOpacity>
        <View style={styles.horizontalControls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => changeDirection(DIRECTIONS.LEFT)}>
            <Text style={styles.controlText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => changeDirection(DIRECTIONS.DOWN)}>
            <Text style={styles.controlText}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => changeDirection(DIRECTIONS.RIGHT)}>
            <Text style={styles.controlText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={togglePause}>
          <Text style={styles.secondaryButtonText}>{game.isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={resetGame}>
          <Text style={styles.primaryButtonText}>Restart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 14,
  },
  scoreCard: {
    minWidth: 110,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    paddingVertical: 12,
  },
  scoreLabel: {
    color: '#94a3b8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#e2e8f0',
    fontSize: 30,
    fontWeight: '800',
  },
  board: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 4,
  },
  cell: {
    width: `${100 / BOARD_SIZE}%`,
    aspectRatio: 1,
    borderColor: '#172033',
    borderWidth: 0.5,
  },
  snakeCell: {
    backgroundColor: '#22c55e',
    borderColor: '#86efac',
  },
  snakeHead: {
    backgroundColor: '#a3e635',
  },
  foodCell: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    borderColor: '#fecaca',
    borderWidth: 2,
  },
  stateText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
  },
  controls: {
    alignItems: 'center',
    gap: 10,
  },
  horizontalControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#1e293b',
    borderColor: '#475569',
    borderWidth: 1,
  },
  controlText: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
  },
  actionRow: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#052e16',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#334155',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '900',
  },
});
