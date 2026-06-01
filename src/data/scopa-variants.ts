/**
 * @file scopa-variants.ts
 * @description Catalogue des grandes variantes de Scopa (Italie).
 * Sources : Wikipedia (IT/EN/FR), Federazione Italiana Burraco e Scopa.
 */

export type Lang = 'fr' | 'en' | 'ar' | 'es' | 'darija';
export type VariantId =
  | 'classica'        // Scopa standard 2 ou 4 joueurs
  | 'scopone'         // Scopa "savante" 4 joueurs en 2v2, 9 cartes chacun
  | 'di-quindici'     // Scopa di 15 : prennent les cartes totalisant 15
  | 'd-assi'          // Scopa d'Assi : l'As balaie le tapis
  | 'cirulla'         // Scopa génoise — complexe, plusieurs primes
  | 'rebello';        // Re bello — variante avec roi de coupes prime

export interface VariantTexts {
  name:     Record<Lang, string>;
  tagline:  Record<Lang, string>;
  overview: Record<Lang, string>;
  bidding:  Record<Lang, string>;
  scoring:  Record<Lang, string>;
  bonuses:  Record<Lang, string>;
  endgame:  Record<Lang, string>;
}

export interface Variant {
  id:        VariantId;
  emoji:     string;
  players:   number[];
  deckSize:  40;      // toujours 40 cartes napolitaines
  target:    number;  // 11 ou 21 selon variante
  sweepBonus: number; // points par scopa
  i18n:      VariantTexts;
}

// ─────────────────────────────────────────────────────────────────────────
// 1) SCOPA CLASSICA (2 ou 4 joueurs)
// ─────────────────────────────────────────────────────────────────────────
const CLASSICA: Variant = {
  id: 'classica',
  emoji: '🧹',
  players: [2, 4],
  deckSize: 40,
  target: 11,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: 'Scopa Classica', en: 'Classic Scopa', ar: 'سكوبا الكلاسيكية',
      es: 'Scopa Clásica', darija: 'سكوبا',
    },
    tagline: {
      fr: '2 ou 4 joueurs · 40 cartes · cible 11 points',
      en: '2 or 4 players · 40 cards · target 11 points',
      ar: '٢ أو ٤ لاعبين · ٤٠ ورقة · ١١ نقطة',
      es: '2 o 4 jugadores · 40 cartas · 11 puntos',
      darija: '2 أو 4 لاعبين · 40 ورقة',
    },
    overview: {
      fr: "La Scopa se joue avec 40 cartes napolitaines (4 couleurs : coppe, denari, spade, bastoni — chacune de l'As (Asso) au Roi (Re)). Distribution : 3 cartes par joueur + 4 cartes posées au centre. Le but : capturer les cartes du tapis en jouant une carte de même valeur, ou plusieurs cartes totalisant la valeur de la nôtre. Quand on vide complètement le tapis avec sa prise, c'est une Scopa (+1 pt).",
      en: 'Scopa uses 40 Napoletan cards (4 suits: cups, coins, swords, clubs — Ace to King). Deal: 3 cards each + 4 cards face-up on the table. Goal: capture table cards by matching the value of your played card (or summing several to it). Clearing the table with your capture = a Scopa (+1 pt).',
      ar: 'سكوبا تُلعب بـ٤٠ ورقة نابولية. التوزيع: ٣ أوراق لكل لاعب + ٤ على الطاولة. الهدف: التقاط الأوراق بمطابقة القيم.',
      es: 'Scopa con 40 cartas napolitanas. Reparte 3 cartas + 4 en la mesa. Captura por igual valor o sumando varias.',
      darija: 'سكوبا ب40 ورقة نابولية. 3 أوراق لكل لاعب و4 فوق الطاولة. كنلتقطو الأوراق بمساواة القيمة.',
    },
    bidding: {
      fr: "Pas d'enchères — c'est un jeu de capture pur. Chacun joue à son tour une carte de sa main. Si elle correspond exactement à une carte du tapis (même valeur), il la prend ; sinon si elle correspond à la somme de plusieurs cartes du tapis, il les prend. Sinon, la carte reste sur le tapis.",
      en: 'No bidding — pure capture game. On your turn, play a card from hand: if it matches a table card\'s value, take that card; or if it sums to multiple table cards, take them all. Otherwise leave the card on the table.',
      ar: 'بدون مزايدة — لعبة التقاط محضة. كل واحد يلعب ورقة من يده.',
      es: 'Sin apuestas — juego de captura puro. Cada uno juega una carta de su mano.',
      darija: 'بلا مزايدة — كنلعبو ورقة من اليد ونلتقطو.',
    },
    scoring: {
      fr: 'À la fin de la manche, on compte 4 critères, 1 point chacun : Carte (qui a pris le plus de cartes), Denari (qui a pris le plus de cartes en deniers), Settebello (qui a le 7 de denari), Primiera (qui a la meilleure prime de quatre 7-6-1). + 1 par Scopa.',
      en: 'After the round, 4 criteria, 1 point each: Carte (most cards), Denari (most coins suit), Settebello (7 of coins), Primiera (best score in 4 suits using 7-6-1 weight). + 1 per Scopa.',
      ar: 'في نهاية الجولة، ٤ معايير: أكثر أوراق، أكثر دناري، السبعة الجميلة، البريميرا. + ١ لكل سكوبا.',
      es: '4 criterios, 1 punto cada uno: Cartas, Denari, Settebello, Primiera. + 1 por Scopa.',
      darija: '4 معايير: أكثر أوراق، أكثر دناري، السبعة، البريميرا. + 1 لكل سكوبا.',
    },
    bonuses: {
      fr: 'Scopa = +1 (vider entièrement le tapis avec sa prise). Settebello = +1 garantis si on a le 7 de denari. Cargo (rare) : prendre les 4 valets, +1.',
      en: 'Scopa = +1 (sweeping the table). Settebello = +1 if you hold the 7 of coins. Cargo (rare): take all 4 Jacks = +1.',
      ar: 'سكوبا = +١. السبعة الجميلة = +١. الكارگو = +١ نادر.',
      es: 'Scopa = +1. Settebello = +1. Cargo (raro) = +1.',
      darija: 'سكوبا = +1. السبعة = +1. الكارگو = +1.',
    },
    endgame: {
      fr: 'Premier joueur (ou équipe à 2v2) à 11 points cumulés sur plusieurs manches gagne la partie. Score classique 11. En tournoi : à 21 points.',
      en: 'First player (or 2v2 team) to 11 cumulative points across multiple rounds wins. Standard 11. Tournaments: 21 points.',
      ar: 'أول لاعب يصل ١١ نقطة يفوز. في البطولات: ٢١.',
      es: 'Primero en alcanzar 11 puntos acumulados gana. En torneos: 21.',
      darija: 'أول واحد كيوصل ل11 نقطة كيربح.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 2) SCOPONE SCIENTIFICO (4j 2v2)
// ─────────────────────────────────────────────────────────────────────────
const SCOPONE: Variant = {
  id: 'scopone',
  emoji: '🧠',
  players: [4],
  deckSize: 40,
  target: 11,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: 'Scopone Scientifico', en: 'Scopone Scientifico', ar: 'سكوبوني',
      es: 'Scopone Científico', darija: 'سكوبوني',
    },
    tagline: {
      fr: '4 joueurs 2v2 · 9 cartes chacun · pas de tapis initial',
      en: '4 players 2v2 · 9 cards each · no initial table',
      ar: '٤ لاعبين ٢×٢ · ٩ أوراق · بدون طاولة',
      es: '4 jugadores 2v2 · 9 cartas · sin mesa inicial',
      darija: '4 لاعبين زوج ضد زوج · 9 أوراق',
    },
    overview: {
      fr: "Variante \"savante\" de la Scopa, considérée comme l'échiquier des jeux de cartes italiens. À 4 en 2v2 (face à face). On distribue les 40 cartes : 9 par joueur + 4 au tapis. Aucun retournement intermédiaire — chacun joue ses 9 cartes avant qu'on rebatte. Stratégie mémoire pure.",
      en: '"Scientific" Scopa variant — considered the chess of Italian card games. 4 players 2v2 (facing). All 40 cards dealt: 9 per player + 4 on table. No mid-round redeal. Pure memory + strategy.',
      ar: 'النسخة العلمية للسكوبا — تُعتبر شطرنج الألعاب الإيطالية.',
      es: 'Variante "científica" — el ajedrez de los juegos de cartas italianos.',
      darija: 'النسخة العلمية ديال السكوبا — شطرنج الورق الإيطالي.',
    },
    bidding: CLASSICA.i18n.bidding,
    scoring: CLASSICA.i18n.scoring,
    bonuses: CLASSICA.i18n.bonuses,
    endgame: {
      fr: 'Cible 11 ou 21 (équipes). Premier à atteindre gagne.',
      en: 'Target 11 or 21 (teams). First to reach wins.',
      ar: 'الهدف ١١ أو ٢١. أول من يصل يفوز.',
      es: 'Objetivo 11 o 21. El primer equipo gana.',
      darija: 'الهدف 11 أو 21. أول فريق كيوصل كيربح.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 3) Scopa di 15
// ─────────────────────────────────────────────────────────────────────────
const QUINDICI: Variant = {
  id: 'di-quindici',
  emoji: '🎰',
  players: [2, 4],
  deckSize: 40,
  target: 11,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: 'Scopa di Quindici', en: 'Scopa di Quindici', ar: 'سكوبا الخمسة عشر',
      es: 'Scopa de Quince', darija: 'سكوبا 15',
    },
    tagline: {
      fr: 'Capture par somme = 15 (au lieu de match)',
      en: 'Capture by sum = 15 (instead of matching)',
      ar: 'الالتقاط بمجموع ١٥',
      es: 'Captura por suma = 15',
      darija: 'كنلتقطو بمجموع 15',
    },
    overview: {
      fr: "Variante sicilienne : pour capturer, la somme de la carte jouée + cartes du tapis doit faire 15 (au lieu de matcher une seule carte). Ex : jouer un 7, prendre un 8 du tapis. Plus tactique car on doit combiner. Garde le décompte standard (Carte/Denari/Settebello/Primiera).",
      en: 'Sicilian variant: to capture, sum of played card + table cards must equal 15 (instead of value-matching). E.g. play a 7, take an 8 from table. More tactical. Standard scoring (Carte/Denari/Settebello/Primiera).',
      ar: 'نسخة صقلية: الالتقاط يتم بمجموع ١٥ بدل المطابقة.',
      es: 'Variante siciliana: capturas con suma = 15 (en lugar de igual valor).',
      darija: 'نسخة صقلية: كنلتقطو بمجموع 15.',
    },
    bidding: CLASSICA.i18n.bidding,
    scoring: CLASSICA.i18n.scoring,
    bonuses: CLASSICA.i18n.bonuses,
    endgame: CLASSICA.i18n.endgame,
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 4) Scopa d'Assi
// ─────────────────────────────────────────────────────────────────────────
const ASSI: Variant = {
  id: 'd-assi',
  emoji: '🅰️',
  players: [2, 4],
  deckSize: 40,
  target: 11,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: "Scopa d'Assi", en: "Scopa d'Assi", ar: 'سكوبا الآسات',
      es: 'Scopa de Ases', darija: 'سكوبا الآسات',
    },
    tagline: {
      fr: "L'As balaie automatiquement le tapis",
      en: 'Ace automatically sweeps the table',
      ar: 'الآس يكنس الطاولة تلقائياً',
      es: 'El As barre la mesa automáticamente',
      darija: 'الآس كيكنس الطاولة',
    },
    overview: {
      fr: "Variante populaire en Italie centrale : jouer un As prend automatiquement TOUTES les cartes du tapis — pas besoin de matcher. Crée des moments dramatiques quand le tapis est plein. Sinon règles identiques à la Scopa classique.",
      en: 'Popular variant in central Italy: playing an Ace automatically takes ALL table cards — no matching needed. Creates dramatic moments when table is full. Otherwise same as classic.',
      ar: 'نسخة شعبية في وسط إيطاليا: الآس يأخذ كل أوراق الطاولة تلقائياً.',
      es: 'Variante popular en Italia central: jugar un As barre toda la mesa.',
      darija: 'نسخة شعبية: الآس كيكنس كل الأوراق فالطاولة.',
    },
    bidding: CLASSICA.i18n.bidding,
    scoring: CLASSICA.i18n.scoring,
    bonuses: {
      fr: "L'As balayant le tapis compte comme une Scopa standard (+1 si le tapis avait des cartes). Sinon mêmes règles primes que classique.",
      en: 'Ace-sweep counts as standard Scopa (+1 if table had cards). Same other bonuses as classic.',
      ar: 'كنس الآس يحسب كسكوبا عادية.',
      es: 'El barrido de As cuenta como Scopa estándar.',
      darija: 'كنس الآس كيحسب كسكوبا عادية.',
    },
    endgame: CLASSICA.i18n.endgame,
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 5) Cirulla (Génoise)
// ─────────────────────────────────────────────────────────────────────────
const CIRULLA: Variant = {
  id: 'cirulla',
  emoji: '⚓',
  players: [2, 3, 4],
  deckSize: 40,
  target: 16,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: 'Cirulla (Génoise)', en: 'Cirulla (Genoese)', ar: 'تشيرولا (جنوة)',
      es: 'Cirulla (Genovesa)', darija: 'تشيرولا',
    },
    tagline: {
      fr: 'Variante génoise · primes spéciales main initiale',
      en: 'Genoese variant · special initial-hand bonuses',
      ar: 'نسخة جنوة · مكافآت اليد الأولى',
      es: 'Variante genovesa · bonificaciones de mano inicial',
      darija: 'نسخة جنوة · بونوسات اليد الأولى',
    },
    overview: {
      fr: "Joué en Ligurie (Gênes). Particularités : distribution de 3 cartes + tapis de 4. Si la main du joueur a une combinaison spéciale (somme à 15 entre ses 3 cartes par exemple), il annonce des points bonus immédiatement.",
      en: 'Played in Liguria (Genoa). Special: 3 cards dealt + 4-card table. If initial hand has special combination (e.g. sum to 15 across 3 cards), the player calls bonus points immediately.',
      ar: 'تُلعب في ليغوريا. خاصية: تركيبات اليد الأولى تعطي نقاطاً.',
      es: 'Jugado en Liguria. Especial: combinaciones iniciales dan puntos extra.',
      darija: 'كتتلعب فجنوة. تركيبات اليد الأولى كتعطي نقاط بونوس.',
    },
    bidding: CLASSICA.i18n.bidding,
    scoring: CLASSICA.i18n.scoring,
    bonuses: {
      fr: 'Bonus main initiale (totalisant 15) : +3 si on a 3 figures, +6 si on a 3 As. Asso a Pigliatutto : un As joué quand il y a un As au tapis prend tout.',
      en: 'Initial hand bonus (sum 15): +3 with 3 figures, +6 with 3 Aces. Asso a Pigliatutto: Ace played onto an Ace on table takes everything.',
      ar: 'مكافآت اليد الأولى: +٣ للأشكال الثلاث، +٦ للآسات الثلاث.',
      es: 'Bonus mano inicial: +3 con 3 figuras, +6 con 3 Ases.',
      darija: 'بونوسات اليد الأولى: +3 ل3 صور، +6 ل3 آسات.',
    },
    endgame: {
      fr: 'Cible 16 points (au lieu de 11). Tactique très différente — il faut tenir longtemps.',
      en: 'Target 16 points (instead of 11). Very different tactical depth.',
      ar: 'الهدف ١٦ نقطة بدل ١١.',
      es: 'Objetivo 16 puntos en lugar de 11.',
      darija: 'الهدف 16 بدل 11.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 6) Re Bello (variante avec roi de coupes prime)
// ─────────────────────────────────────────────────────────────────────────
const REBELLO: Variant = {
  id: 'rebello',
  emoji: '👑',
  players: [2, 4],
  deckSize: 40,
  target: 11,
  sweepBonus: 1,
  i18n: {
    name: {
      fr: 'Re Bello', en: 'Re Bello', ar: 'الملك الجميل',
      es: 'Re Bello', darija: 'الملك الزوين',
    },
    tagline: {
      fr: 'Le Re di Coppe (Roi de Coupes) vaut un point bonus',
      en: 'The Re di Coppe (King of Cups) is worth +1 bonus',
      ar: 'ملك الكؤوس يساوي +١',
      es: 'El Rey de Copas vale +1 bonus',
      darija: 'ملك الكؤوس كياخد +1',
    },
    overview: {
      fr: 'Variante avec une prime supplémentaire : posséder le Re di Coppe (Roi de Coupes) en fin de manche donne 1 point bonus, comme le Settebello. Crée 5 critères de scoring au lieu de 4.',
      en: 'Variant with extra prime: holding the Re di Coppe (King of Cups) at end of hand grants +1 bonus, similar to Settebello. 5 scoring criteria instead of 4.',
      ar: 'نسخة فيها مكافأة إضافية: الاحتفاظ بملك الكؤوس يعطي +١.',
      es: 'Variante con bonus extra: tener el Rey de Copas al final da +1.',
      darija: 'نسخة فيها بونوس زايد: ملك الكؤوس فلخر = +1.',
    },
    bidding: CLASSICA.i18n.bidding,
    scoring: {
      fr: 'Mêmes 4 critères que classique + Re Bello (Roi de Coupes) = +1.',
      en: 'Same 4 criteria as classic + Re Bello (King of Cups) = +1.',
      ar: 'نفس ٤ معايير + ملك الكؤوس = +١.',
      es: 'Mismos 4 criterios + Re Bello (Rey de Copas) = +1.',
      darija: 'نفس 4 معايير + ملك الكؤوس = +1.',
    },
    bonuses: CLASSICA.i18n.bonuses,
    endgame: CLASSICA.i18n.endgame,
  },
};

export const VARIANTS: Variant[] = [
  CLASSICA, SCOPONE, QUINDICI, ASSI, CIRULLA, REBELLO,
];

export function getVariant(id: VariantId): Variant {
  return VARIANTS.find(v => v.id === id) || CLASSICA;
}

export function variantsForPlayerCount(n: number): Variant[] {
  return VARIANTS.filter(v => v.players.includes(n));
}
