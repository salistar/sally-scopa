/**
 * @file achievements.ts
 * @description Achievements Scopa.
 * Stockage : `achievements:unlocked` = { id: timestamp }
 *           `replay:scopa:*` = JSON par partie
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'achievements:unlocked';
const REPLAY_PREFIX = 'replay:scopa:';

export interface ScopaWin {
  id: string;
  variantKey: string;
  score: number;
  scopas: number;
  settebello: boolean;
  primieraScore: number;
  durationMs: number;
  wonAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (wins: ScopaWin[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win', title: 'Premier balai', description: 'Gagne ta toute première partie.', icon: 'trophy', rarity: 'common', check: (rs) => rs.length >= 1 },
  { id: 'win-10', title: 'Apprenti italien', description: 'Gagne 10 parties.', icon: 'medal', rarity: 'common', check: (rs) => rs.length >= 10 },
  { id: 'win-50', title: 'Maestro Napoletano', description: 'Gagne 50 parties.', icon: 'star', rarity: 'rare', check: (rs) => rs.length >= 50 },
  { id: 'first-scopa', title: 'Première Scopa !', description: 'Réalise ta première Scopa.', icon: 'flash', rarity: 'common', check: (rs) => rs.some((r) => r.scopas >= 1) },
  { id: 'multi-scopa', title: 'Triple Scopa', description: '3 Scopa! dans une seule manche.', icon: 'flame', rarity: 'epic', check: (rs) => rs.some((r) => r.scopas >= 3) },
  { id: 'settebello', title: 'Settebello', description: 'Capture le 7 d\'Or (Settebello).', icon: 'sparkles', rarity: 'rare', check: (rs) => rs.some((r) => r.settebello) },
  { id: 'primiera-master', title: 'Maître de la Primiera', description: 'Atteins 80+ en Primiera.', icon: 'ribbon', rarity: 'epic', check: (rs) => rs.some((r) => r.primieraScore >= 80) },
  { id: 'all-variants', title: 'Polyvalent italien', description: 'Gagne dans 3 variantes différentes.', icon: 'apps', rarity: 'epic', check: (rs) => new Set(rs.map((r) => r.variantKey)).size >= 3 },
];

export interface UnlockedAchievement extends Achievement { unlockedAt: number; }

async function listAllWins(): Promise<ScopaWin[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const replayKeys = keys.filter((k) => k.startsWith(REPLAY_PREFIX));
    const items = await AsyncStorage.multiGet(replayKeys);
    return items
      .map(([_, v]) => { try { return JSON.parse(v ?? ''); } catch { return null; } })
      .filter((x): x is ScopaWin => !!x && typeof x.score === 'number');
  } catch {
    return [];
  }
}

export async function evaluateAchievements(): Promise<{ all: Achievement[]; unlocked: Record<string, number>; newlyUnlocked: Achievement[] }> {
  const wins = await listAllWins();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const unlocked: Record<string, number> = raw ? JSON.parse(raw) : {};
  const newlyUnlocked: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlocked[ach.id]) continue;
    if (ach.check(wins)) {
      unlocked[ach.id] = Date.now();
      newlyUnlocked.push(ach);
    }
  }
  if (newlyUnlocked.length > 0) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return { all: ACHIEVEMENTS, unlocked, newlyUnlocked };
}

export async function getUnlockedAchievements(): Promise<Record<string, number>> {
  try { const raw = await AsyncStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
