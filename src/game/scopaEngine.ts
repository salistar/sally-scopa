/**
 * ScopaEngine - Moteur de jeu Scopa italien
 * Jeu de capture de cartes utilisant le paquet espagnol de 40 cartes
 *
 * Regles:
 * - 2 a 4 joueurs
 * - Paquet espagnol: 4 couleurs (bastos, copas, espadas, oros) x valeurs (1-7, 10-12)
 * - Chaque joueur recoit 3 cartes, 4 cartes sur la table
 * - Jouer une carte pour capturer des cartes de la table dont la somme des valeurs egale la valeur de la carte jouee
 * - SCOPA: vider la table = 1 point bonus
 * - Quand les mains sont vides, distribuer 3 de plus depuis le paquet
 * - Score: plus de cartes=1, plus d'oros=1, 7 d'oros=1, primiera=1, chaque scopa=1
 * - Premier a 11 points gagne
 */

// ============================================================
// TYPES
// ============================================================

export type Suit = 'bastos' | 'copas' | 'espadas' | 'oros';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  captures: Card[];
  scopeCount: number; // number of scope scored
  score: number;
  isBot: boolean;
}

export type GamePhase =
  | 'waiting'
  | 'dealing'
  | 'playing'
  | 'selecting_capture' // player must choose which combination to capture
  | 'round_end'
  | 'game_over';

export interface CaptureOption {
  cards: Card[];
}

export interface RoundScore {
  playerId: string;
  mostCards: boolean;
  mostOros: boolean;
  settebello: boolean;
  primiera: boolean;
  scopePoints: number;
  total: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  table: Card[];
  deck: Card[];
  roundNumber: number;
  lastCapture: { playerId: string; cards: Card[] } | null;
  winnerId: string | null;
  targetScore: number;
  captureOptions: CaptureOption[];
  pendingCard: Card | null;
}

export type GameAction =
  | { type: 'JOIN'; playerId: string; playerName: string; isBot?: boolean }
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string; captureCardIds?: string[] }
  | { type: 'SELECT_CAPTURE'; captureIndex: number }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET' };

// ============================================================
// CONSTANTS
// ============================================================

export const SUITS: Suit[] = ['bastos', 'copas', 'espadas', 'oros'];
export const VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

export const SUIT_NAMES: Record<Suit, string> = {
  bastos: 'Batons',
  copas: 'Coupes',
  espadas: 'Epees',
  oros: 'Deniers',
};

export const VALUE_NAMES: Record<CardValue, string> = {
  1: 'As',
  2: 'Deux',
  3: 'Trois',
  4: 'Quatre',
  5: 'Cinq',
  6: 'Six',
  7: 'Sept',
  10: 'Sota',
  11: 'Caballo',
  12: 'Rey',
};

/** Primiera values per card */
export const PRIMIERA_VALUES: Record<CardValue, number> = {
  7: 21,
  6: 18,
  1: 16,
  5: 15,
  4: 14,
  3: 13,
  2: 12,
  10: 10,
  11: 10,
  12: 10,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const CARDS_PER_DEAL = 3;
export const TABLE_CARDS = 4;
export const DEFAULT_TARGET_SCORE = 11;

// ============================================================
// DECK
// ============================================================

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const valueStr = value.toString().padStart(2, '0');
      deck.push({
        suit,
        value,
        id: `${valueStr}-${suit}`,
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// DEALING
// ============================================================

export function dealInitial(
  players: Player[],
  deck: Card[]
): { players: Player[]; table: Card[]; remainingDeck: Card[] } {
  const shuffled = shuffleDeck(deck);
  let idx = 0;

  const updatedPlayers = players.map((player) => {
    const hand = shuffled.slice(idx, idx + CARDS_PER_DEAL);
    idx += CARDS_PER_DEAL;
    return { ...player, hand, captures: [], scopeCount: 0 };
  });

  const table = shuffled.slice(idx, idx + TABLE_CARDS);
  idx += TABLE_CARDS;

  return { players: updatedPlayers, table, remainingDeck: shuffled.slice(idx) };
}

export function dealMore(
  players: Player[],
  deck: Card[]
): { players: Player[]; remainingDeck: Card[] } {
  const cardsEach = Math.min(CARDS_PER_DEAL, Math.floor(deck.length / players.length));
  if (cardsEach === 0) return { players, remainingDeck: deck };

  let idx = 0;
  const updatedPlayers = players.map((player) => {
    const newCards = deck.slice(idx, idx + cardsEach);
    idx += cardsEach;
    return { ...player, hand: [...player.hand, ...newCards] };
  });

  return { players: updatedPlayers, remainingDeck: deck.slice(idx) };
}

// ============================================================
// CAPTURE LOGIC
// ============================================================

/**
 * Find all possible capture combinations from table cards
 * that sum to the given card value.
 * Also includes single-card exact matches.
 */
export function findCaptureOptions(card: Card, table: Card[]): CaptureOption[] {
  const options: CaptureOption[] = [];
  const targetValue = card.value;

  // Find all subsets of table cards that sum to targetValue
  function findSubsets(
    remaining: Card[],
    current: Card[],
    currentSum: number,
    startIdx: number
  ): void {
    if (currentSum === targetValue && current.length > 0) {
      options.push({ cards: [...current] });
      return;
    }
    if (currentSum > targetValue) return;

    for (let i = startIdx; i < remaining.length; i++) {
      current.push(remaining[i]);
      findSubsets(remaining, current, currentSum + remaining[i].value, i + 1);
      current.pop();
    }
  }

  findSubsets(table, [], 0, 0);
  return options;
}

export function performCapture(
  player: Player,
  playedCard: Card,
  capturedCards: Card[],
  table: Card[]
): { updatedPlayer: Player; updatedTable: Card[]; isScopa: boolean } {
  const newHand = player.hand.filter((c) => c.id !== playedCard.id);
  const newCaptures = [...player.captures, playedCard, ...capturedCards];
  const newTable = table.filter((c) => !capturedCards.some((cc) => cc.id === c.id));
  const isScopa = newTable.length === 0;

  return {
    updatedPlayer: {
      ...player,
      hand: newHand,
      captures: newCaptures,
      scopeCount: player.scopeCount + (isScopa ? 1 : 0),
    },
    updatedTable: newTable,
    isScopa,
  };
}

export function placeOnTable(
  player: Player,
  card: Card,
  table: Card[]
): { updatedPlayer: Player; updatedTable: Card[] } {
  const newHand = player.hand.filter((c) => c.id !== card.id);
  return {
    updatedPlayer: { ...player, hand: newHand },
    updatedTable: [...table, card],
  };
}

// ============================================================
// SCORING
// ============================================================

export function calculatePrimiera(captures: Card[]): number {
  // Best card per suit
  const bestPerSuit: Partial<Record<Suit, number>> = {};
  for (const card of captures) {
    const pVal = PRIMIERA_VALUES[card.value];
    if (!bestPerSuit[card.suit] || pVal > bestPerSuit[card.suit]!) {
      bestPerSuit[card.suit] = pVal;
    }
  }
  // Need at least one card in each suit
  if (Object.keys(bestPerSuit).length < 4) return 0;
  return Object.values(bestPerSuit).reduce((sum, v) => sum + v!, 0);
}

export function calculateRoundScores(players: Player[]): RoundScore[] {
  const counts = players.map((p) => ({
    playerId: p.id,
    totalCards: p.captures.length,
    orosCount: p.captures.filter((c) => c.suit === 'oros').length,
    hasSettebello: p.captures.some((c) => c.id === '07-oros'),
    primieraScore: calculatePrimiera(p.captures),
    scopePoints: p.scopeCount,
  }));

  const maxCards = Math.max(...counts.map((c) => c.totalCards));
  const maxOros = Math.max(...counts.map((c) => c.orosCount));
  const maxPrimiera = Math.max(...counts.map((c) => c.primieraScore));

  const cardsTied = counts.filter((c) => c.totalCards === maxCards).length > 1;
  const orosTied = counts.filter((c) => c.orosCount === maxOros).length > 1;
  const primieraTied = counts.filter((c) => c.primieraScore === maxPrimiera).length > 1;

  return counts.map((c) => {
    const mostCards = !cardsTied && c.totalCards === maxCards;
    const mostOros = !orosTied && c.orosCount === maxOros;
    const primiera = !primieraTied && c.primieraScore === maxPrimiera && c.primieraScore > 0;
    const settebello = c.hasSettebello;

    const total =
      (mostCards ? 1 : 0) +
      (mostOros ? 1 : 0) +
      (settebello ? 1 : 0) +
      (primiera ? 1 : 0) +
      c.scopePoints;

    return {
      playerId: c.playerId,
      mostCards,
      mostOros,
      settebello,
      primiera,
      scopePoints: c.scopePoints,
      total,
    };
  });
}

export function getWinner(state: GameState): Player | null {
  const winner = state.players.find((p) => p.score >= state.targetScore);
  return winner || null;
}

// ============================================================
// TURN MANAGEMENT
// ============================================================

export function getNextPlayerIndex(
  currentIndex: number,
  players: Player[]
): number {
  return (currentIndex + 1) % players.length;
}

export function allHandsEmpty(players: Player[]): boolean {
  return players.every((p) => p.hand.length === 0);
}

// ============================================================
// BOT AI
// ============================================================

export function botPlay(
  state: GameState
): { cardId: string; captureCardIds?: string[] } {
  const bot = state.players[state.currentPlayerIndex];
  if (!bot || bot.hand.length === 0) {
    throw new Error('Bot has no cards');
  }

  let bestCard: Card | null = null;
  let bestCapture: CaptureOption | null = null;
  let bestScore = -1;

  for (const card of bot.hand) {
    const options = findCaptureOptions(card, state.table);
    for (const option of options) {
      let score = option.cards.length; // prefer capturing more cards
      // Bonus for capturing oros
      score += option.cards.filter((c) => c.suit === 'oros').length * 2;
      // Bonus for 7 of oros
      if (option.cards.some((c) => c.id === '07-oros')) score += 5;
      // Bonus for 7s
      score += option.cards.filter((c) => c.value === 7).length;
      // Bonus for scopa (clearing the table)
      const remainingTable = state.table.filter(
        (t) => !option.cards.some((oc) => oc.id === t.id)
      );
      if (remainingTable.length === 0) score += 10;

      if (score > bestScore) {
        bestScore = score;
        bestCard = card;
        bestCapture = option;
      }
    }
  }

  if (bestCard && bestCapture) {
    return {
      cardId: bestCard.id,
      captureCardIds: bestCapture.cards.map((c) => c.id),
    };
  }

  // No captures: play lowest value, avoid oros and 7s
  const sorted = [...bot.hand].sort((a, b) => {
    if (a.id === '07-oros') return 1;
    if (b.id === '07-oros') return -1;
    if (a.value === 7 && b.value !== 7) return 1;
    if (b.value === 7 && a.value !== 7) return -1;
    if (a.suit === 'oros' && b.suit !== 'oros') return 1;
    if (b.suit === 'oros' && a.suit !== 'oros') return -1;
    return a.value - b.value;
  });

  return { cardId: sorted[0].id };
}

// ============================================================
// GAME STATE MANAGEMENT
// ============================================================

export function initGame(
  playerNames: string[],
  botCount: number,
  targetScore: number = DEFAULT_TARGET_SCORE
): GameState {
  const state = createInitialState(targetScore);
  let current = state;

  for (let i = 0; i < playerNames.length; i++) {
    current = gameReducer(current, {
      type: 'JOIN',
      playerId: `player-${i + 1}`,
      playerName: playerNames[i],
      isBot: false,
    });
  }

  const botNames = ['Marco', 'Sofia', 'Luca', 'Giulia'];
  for (let i = 0; i < botCount; i++) {
    current = gameReducer(current, {
      type: 'JOIN',
      playerId: `bot-${i + 1}`,
      playerName: botNames[i % botNames.length],
      isBot: true,
    });
  }

  current = gameReducer(current, { type: 'START_GAME' });
  return current;
}

export function createInitialState(
  targetScore: number = DEFAULT_TARGET_SCORE
): GameState {
  return {
    phase: 'waiting',
    players: [],
    currentPlayerIndex: 0,
    table: [],
    deck: [],
    roundNumber: 0,
    lastCapture: null,
    winnerId: null,
    targetScore,
    captureOptions: [],
    pendingCard: null,
  };
}

export function createBots(count: number): GameAction[] {
  const botNames = ['Marco', 'Sofia', 'Luca', 'Giulia'];
  return Array.from({ length: Math.min(count, botNames.length) }, (_, i) => ({
    type: 'JOIN' as const,
    playerId: `bot-${i + 1}`,
    playerName: botNames[i],
    isBot: true,
  }));
}

// ============================================================
// REDUCER
// ============================================================

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'JOIN': {
      if (state.phase !== 'waiting') return state;
      if (state.players.length >= MAX_PLAYERS) return state;
      if (state.players.find((p) => p.id === action.playerId)) return state;

      const newPlayer: Player = {
        id: action.playerId,
        name: action.playerName,
        hand: [],
        captures: [],
        scopeCount: 0,
        score: 0,
        isBot: action.isBot || false,
      };

      return { ...state, players: [...state.players, newPlayer] };
    }

    case 'START_GAME': {
      if (state.players.length < MIN_PLAYERS) return state;

      const deck = createDeck();
      const { players, table, remainingDeck } = dealInitial(state.players, deck);

      return {
        ...state,
        phase: 'playing',
        players,
        table,
        deck: remainingDeck,
        currentPlayerIndex: 0,
        roundNumber: state.roundNumber + 1,
        lastCapture: null,
      };
    }

    case 'PLAY_CARD': {
      if (state.phase !== 'playing') return state;

      const playerIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) return state;

      const player = state.players[playerIndex];
      const playedCard = player.hand.find((c) => c.id === action.cardId);
      if (!playedCard) return state;

      const captureOptions = findCaptureOptions(playedCard, state.table);

      // If specific capture cards provided
      if (action.captureCardIds && action.captureCardIds.length > 0) {
        const capturedCards = action.captureCardIds
          .map((id) => state.table.find((c) => c.id === id))
          .filter((c): c is Card => c !== undefined);

        const sum = capturedCards.reduce((s, c) => s + c.value, 0);
        if (sum !== playedCard.value) {
          // Invalid capture, place on table instead
          const result = placeOnTable(player, playedCard, state.table);
          const updatedPlayers = [...state.players];
          updatedPlayers[playerIndex] = result.updatedPlayer;
          return advanceTurn(state, updatedPlayers, result.updatedTable, null, playerIndex);
        }

        const result = performCapture(player, playedCard, capturedCards, state.table);
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = result.updatedPlayer;
        const lastCapture = { playerId: player.id, cards: [playedCard, ...capturedCards] };
        return advanceTurn(state, updatedPlayers, result.updatedTable, lastCapture, playerIndex);
      }

      // No capture cards specified
      if (captureOptions.length === 0) {
        // No captures possible, place on table
        const result = placeOnTable(player, playedCard, state.table);
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = result.updatedPlayer;
        return advanceTurn(state, updatedPlayers, result.updatedTable, null, playerIndex);
      }

      if (captureOptions.length === 1) {
        // Only one option, auto-capture
        const result = performCapture(player, playedCard, captureOptions[0].cards, state.table);
        const updatedPlayers = [...state.players];
        updatedPlayers[playerIndex] = result.updatedPlayer;
        const lastCapture = { playerId: player.id, cards: [playedCard, ...captureOptions[0].cards] };
        return advanceTurn(state, updatedPlayers, result.updatedTable, lastCapture, playerIndex);
      }

      // Multiple capture options: player must choose
      return {
        ...state,
        phase: 'selecting_capture',
        captureOptions,
        pendingCard: playedCard,
      };
    }

    case 'SELECT_CAPTURE': {
      if (state.phase !== 'selecting_capture' || !state.pendingCard) return state;
      if (action.captureIndex < 0 || action.captureIndex >= state.captureOptions.length) return state;

      const playerIndex = state.currentPlayerIndex;
      const player = state.players[playerIndex];
      const selectedCapture = state.captureOptions[action.captureIndex];

      const result = performCapture(player, state.pendingCard, selectedCapture.cards, state.table);
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = result.updatedPlayer;
      const lastCapture = { playerId: player.id, cards: [state.pendingCard, ...selectedCapture.cards] };

      return advanceTurn(
        { ...state, captureOptions: [], pendingCard: null },
        updatedPlayers,
        result.updatedTable,
        lastCapture,
        playerIndex
      );
    }

    case 'NEW_ROUND': {
      if (state.phase !== 'round_end') return state;

      const deck = createDeck();
      const resetPlayers = state.players.map((p) => ({
        ...p,
        hand: [],
        captures: [],
        scopeCount: 0,
      }));
      const { players, table, remainingDeck } = dealInitial(resetPlayers, deck);

      return {
        ...state,
        phase: 'playing',
        players,
        table,
        deck: remainingDeck,
        currentPlayerIndex: 0,
        roundNumber: state.roundNumber + 1,
        lastCapture: null,
        captureOptions: [],
        pendingCard: null,
      };
    }

    case 'RESET': {
      return createInitialState(state.targetScore);
    }

    default:
      return state;
  }
}

function advanceTurn(
  state: GameState,
  updatedPlayers: Player[],
  newTable: Card[],
  lastCapture: { playerId: string; cards: Card[] } | null,
  currentPlayerIndex: number
): GameState {
  // Check if all hands empty
  if (allHandsEmpty(updatedPlayers)) {
    if (state.deck.length > 0) {
      // Deal more cards
      const { players: redealt, remainingDeck } = dealMore(updatedPlayers, state.deck);
      return {
        ...state,
        phase: 'playing',
        players: redealt,
        deck: remainingDeck,
        table: newTable,
        lastCapture: lastCapture || state.lastCapture,
        currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, redealt),
        captureOptions: [],
        pendingCard: null,
      };
    }

    // Round over - last capturer gets remaining table cards
    const lastCap = lastCapture || state.lastCapture;
    if (lastCap && newTable.length > 0) {
      const lastIdx = updatedPlayers.findIndex((p) => p.id === lastCap.playerId);
      if (lastIdx !== -1) {
        updatedPlayers[lastIdx] = {
          ...updatedPlayers[lastIdx],
          captures: [...updatedPlayers[lastIdx].captures, ...newTable],
        };
        newTable = [];
      }
    }

    const scores = calculateRoundScores(updatedPlayers);
    const scoredPlayers = updatedPlayers.map((p) => {
      const s = scores.find((sc) => sc.playerId === p.id);
      return { ...p, score: p.score + (s?.total || 0) };
    });

    const winner = scoredPlayers.find((p) => p.score >= state.targetScore);

    if (winner) {
      return {
        ...state,
        phase: 'game_over',
        players: scoredPlayers,
        table: newTable,
        lastCapture: lastCap,
        winnerId: winner.id,
        captureOptions: [],
        pendingCard: null,
      };
    }

    return {
      ...state,
      phase: 'round_end',
      players: scoredPlayers,
      table: newTable,
      lastCapture: lastCap,
      captureOptions: [],
      pendingCard: null,
    };
  }

  return {
    ...state,
    phase: 'playing',
    players: updatedPlayers,
    table: newTable,
    lastCapture: lastCapture || state.lastCapture,
    currentPlayerIndex: getNextPlayerIndex(currentPlayerIndex, updatedPlayers),
    captureOptions: [],
    pendingCard: null,
  };
}

// ============================================================
// HELPERS
// ============================================================

export function getCurrentPlayer(state: GameState): Player | null {
  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
    return null;
  }
  return state.players[state.currentPlayerIndex];
}

export function isPlayerTurn(state: GameState, playerId: string): boolean {
  const current = getCurrentPlayer(state);
  return current?.id === playerId && state.phase === 'playing';
}

export function formatCard(card: Card): string {
  return `${VALUE_NAMES[card.value]} de ${SUIT_NAMES[card.suit]}`;
}
