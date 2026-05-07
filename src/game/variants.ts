/**
 * @file variants.ts — Catalogue de toutes les variantes Scopa.
 * Multi >1 joueur : socket+STUN/TURN+Jitsi via /room/create. Solo vs-ai sans socket.
 */

export type VariantKey =
  | 'scopa-classic-2p' | 'scopa-2v2' | 'scopa-21'
  | 'scopone' | 'scopone-scientifico'
  | 'scopa-d-assi' | 're-bello' | 'scopa-tre-re' | 'scopa-quindici'
  | 'vs-ai';

export interface Variant {
  key: VariantKey;
  engine: 'scopa' | 'scopone' | 'vs-ai';
  emoji: string;
  name: string;
  shortDesc: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  winRate: string;
  duration: string;
  cards: number;
  rules: { title: string; body: string }[];
  available: boolean;
  options?: {
    players?: 2|3|4|6; targetScore?: number; multi?: boolean;
    longHand?: boolean;        // Scopone : 9 cartes/joueur d'un coup
    asseAll?: boolean;         // Scopa d'Assi : As capture tout
    reBelloBonus?: boolean;    // +1 si Re de Denari
    treReBonus?: boolean;      // +1 si 3 Rois capturés
    quindici?: boolean;        // captures sur sommes de 15
  };
}

export const VARIANTS: Variant[] = [
  {
    key: 'scopa-classic-2p', engine: 'scopa', emoji: '🃏', name: 'Scopa Classique 2j',
    shortDesc: 'Duel 2 joueurs — 11 points, ~20 min.',
    difficulty: 2, winRate: '~50%', duration: '20 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11, multi: true },
    rules: [
      { title: 'Objectif', body: 'Atteindre 11 points en cumulant cartas, denari, settebello, primiera, scope.' },
      { title: 'Cartes', body: '40 cartes italiennes : 4 couleurs (Denari 💰, Coppe 🏆, Spade ⚔️, Bastoni 🌳) × 10 valeurs (As=1 à Re=10).' },
      { title: 'Distribution', body: '3 cartes par joueur. 4 cartes au tapis (face visible). Antihoraire.' },
      { title: 'Capture par valeur', body: 'Joue une carte = capture une carte de même valeur. PRIORITAIRE sur la somme.' },
      { title: 'Capture par somme', body: 'Si pas de capture exacte possible, ta carte capture des cartes dont la somme = sa valeur. Ex: 7♠ peut capturer 3+4 du tapis.' },
      { title: 'Choix de combinaison', body: 'S\'il y a plusieurs sommes possibles, tu choisis.' },
      { title: 'Scopa', body: 'Vidange du tapis = +1 point immédiat. Annoncer "Scopa !".' },
      { title: 'Catégories de score', body: 'Cartas (>20 cartes capturées) +1, Denari (>5 deniers) +1, Settebello (7 de Denari) +1, Primiera (meilleure combo couleur, voir ci-dessous) +1.' },
      { title: 'Primiera', body: 'Pour chaque couleur, prends ta meilleure carte. Valeurs spéciales : 7=21, 6=18, As=16, 5=15, 4=14, 3=13, 2=12, figures=10. La somme la plus haute gagne la Primiera.' },
      { title: 'Re-distribution', body: 'Quand mains vides, 3 nouvelles cartes par joueur jusqu\'à épuisement du paquet.' },
      { title: 'Dernière main', body: 'Le dernier ayant capturé prend toutes les cartes restantes au tapis (PAS une Scopa).' },
      { title: 'Victoire', body: 'Premier à 11 points.' },
    ],
  },
  {
    key: 'scopa-2v2', engine: 'scopa', emoji: '🤝', name: 'Scopa 2v2',
    shortDesc: '4 joueurs en équipes face-à-face — 21 points (le plus joué).',
    difficulty: 3, winRate: '~50%', duration: '30 min', cards: 40, available: true,
    options: { players: 4, targetScore: 21, multi: true },
    rules: [
      { title: 'Mode', body: '4 joueurs en 2 équipes de 2, partenaires face-à-face.' },
      { title: 'Score cible', body: '21 points (cumul d\'équipe).' },
      { title: 'Communication', body: 'Verbale interdite. Conventions tacites possibles.' },
    ],
  },
  {
    key: 'scopa-21', engine: 'scopa', emoji: '⏳', name: 'Scopa 21',
    shortDesc: 'Variante longue 21 points, 2 joueurs.',
    difficulty: 3, winRate: '~50%', duration: '30 min', cards: 40, available: true,
    options: { players: 2, targetScore: 21, multi: true },
    rules: [{ title: 'Différence', body: 'Mêmes règles que classique 2j, mais cible 21 points.' }],
  },
  {
    key: 'scopone', engine: 'scopone', emoji: '🎴', name: 'Scopone',
    shortDesc: '9 cartes par joueur d\'un coup, pas de redistribution.',
    difficulty: 4, winRate: '~50%', duration: '45 min', cards: 40, available: true,
    options: { players: 4, targetScore: 11, multi: true, longHand: true },
    rules: [
      { title: 'Différence majeure', body: 'Toutes les cartes distribuées en une fois : 9 par joueur (4j) au lieu de 3.' },
      { title: 'Pas de redistribution', body: 'Une seule donne par manche. Plus de planification, moins d\'aléatoire.' },
      { title: 'Niveau', body: 'Très joué en compétition italienne.' },
    ],
  },
  {
    key: 'scopone-scientifico', engine: 'scopone', emoji: '🔬', name: 'Scopone Scientifico',
    shortDesc: 'Scopone avec règles strictes (capture par valeur obligatoire).',
    difficulty: 5, winRate: '~50%', duration: '~1h', cards: 40, available: true,
    options: { players: 4, targetScore: 21, multi: true, longHand: true },
    rules: [
      { title: 'Règle stricte', body: 'Capture par valeur OBLIGATOIRE si possible (pas de choix entre valeur et somme).' },
      { title: 'Niveau', body: 'Maîtres du Scopone — très précis, pour joueurs expérimentés.' },
    ],
  },
  {
    key: 'scopa-d-assi', engine: 'scopa', emoji: '🅰️', name: 'Scopa d\'Assi',
    shortDesc: 'L\'As capture TOUT le tapis (toujours une Scopa).',
    difficulty: 3, winRate: '~50%', duration: '20 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11, multi: true, asseAll: true },
    rules: [
      { title: 'Règle spéciale', body: 'Quand tu joues un As, tu captures TOUTES les cartes du tapis, peu importe leur valeur.' },
      { title: 'Conséquence', body: 'C\'est donc TOUJOURS une Scopa (sauf si tapis vide).' },
      { title: 'Stratégie', body: 'Conserver ses As pour les moments de tapis chargé.' },
    ],
  },
  {
    key: 're-bello', engine: 'scopa', emoji: '👑', name: 'Re Bello',
    shortDesc: 'Le Re de Denari rapporte +1 bonus (en plus du Settebello).',
    difficulty: 3, winRate: '~50%', duration: '20 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11, multi: true, reBelloBonus: true },
    rules: [
      { title: 'Bonus', body: 'Capturer le Re de Denari = +1 point supplémentaire (en plus du 7 de Denari = Settebello).' },
      { title: 'Cible', body: 'Maintenant 5 catégories : Cartas, Denari, Settebello, Primiera, Re Bello.' },
    ],
  },
  {
    key: 'scopa-tre-re', engine: 'scopa', emoji: '🤴', name: 'Scopa con i Tre Re',
    shortDesc: 'Capturer 3 Rois = +1 bonus dans la manche.',
    difficulty: 3, winRate: '~50%', duration: '25 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11, multi: true, treReBonus: true },
    rules: [
      { title: 'Bonus', body: 'Capturer 3 des 4 Rois dans une même manche = +1 point bonus.' },
      { title: 'Stratégie', body: 'Vise les Rois en priorité.' },
    ],
  },
  {
    key: 'scopa-quindici', engine: 'scopa', emoji: '1️⃣5️⃣', name: 'Scopa Quindici',
    shortDesc: 'Captures par somme de 15 (au lieu de la valeur de la carte).',
    difficulty: 4, winRate: '~50%', duration: '25 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11, multi: true, quindici: true },
    rules: [
      { title: 'Règle unique', body: 'Tu captures les cartes du tapis dont la somme = 15 (en utilisant ta carte + cartes du tapis).' },
      { title: 'Exemple', body: 'Tu joues un 7. Si le tapis a 8, tu captures (7+8=15). Ou si tapis a 3+5, tu captures (7+3+5=15).' },
      { title: 'Variante française', body: 'Très joué dans le sud de la France.' },
    ],
  },
  {
    key: 'vs-ai', engine: 'vs-ai', emoji: '🤖', name: 'Solo vs IA',
    shortDesc: 'Mode entraînement contre 1 ou 3 IA.',
    difficulty: 3, winRate: '~50%', duration: '20 min', cards: 40, available: true,
    options: { players: 2, targetScore: 11 },
    rules: [
      { title: 'Mode', body: 'Solo (1v1 ou 1v3) sans socket.' },
      { title: 'IA', body: 'Joue capture par valeur prioritaire, mémoire des cartes passées, optimise Settebello et Primiera.' },
    ],
  },
];

export const AVAILABLE_VARIANTS = VARIANTS.filter((v) => v.available);
export function findVariant(key: string): Variant | undefined {
  return VARIANTS.find((v) => v.key === key);
}
