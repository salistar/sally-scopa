/**
 * @file scopa-elo.ts
 * @description Système ELO Scopa basé sur les parties gagnées localement.
 * Bonus pour Scopa! et Settebello.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_ELO = 1000;
const REPLAY_PREFIX = 'replay:scopa:';

const VARIANTS = ['classic', 'scopone', 'escoba', 'scopaAssi', 'cirulla'];

interface ScopaWin {
  variantKey: string;
  score: number;
  scopas: number;
  settebello: boolean;
  primieraScore: number;
  durationMs: number;
  wonAt: number;
}

export interface VariantElo {
  variant: string;
  elo: number;
  wins: number;
  history: { date: number; elo: number; gain: number; reason: string }[];
}

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

export async function computeEloByVariant(): Promise<Record<string, VariantElo>> {
  const wins = await listAllWins();
  wins.sort((a, b) => a.wonAt - b.wonAt);
  const out: Record<string, VariantElo> = {};
  for (const v of VARIANTS) out[v] = { variant: v, elo: BASE_ELO, wins: 0, history: [] };

  for (const r of wins) {
    const v = out[r.variantKey];
    if (!v) continue;
    let gain = 15;
    let reason = `Win ${r.variantKey}`;
    if (r.settebello) { gain += 10; reason += ' +settebello'; }
    if (r.scopas >= 2) { gain += 10; reason += ' +multiScopa'; }
    if (r.primieraScore >= 70) { gain += 5; reason += ' +primiera'; }
    v.elo += gain;
    v.wins++;
    v.history.push({ date: r.wonAt, elo: v.elo, gain, reason });
  }
  return out;
}

export async function computeGlobalElo(): Promise<number> {
  const eloMap = await computeEloByVariant();
  const played = Object.values(eloMap).filter((v) => v.wins > 0);
  if (played.length === 0) return BASE_ELO;
  return Math.round(played.reduce((a, b) => a + b.elo, 0) / played.length);
}

export function rankFromElo(elo: number): { tier: string; color: string; emoji: string } {
  if (elo >= 2500) return { tier: 'Diamond', color: '#06B6D4', emoji: '💎' };
  if (elo >= 2000) return { tier: 'Platinum', color: '#A855F7', emoji: '🏆' };
  if (elo >= 1500) return { tier: 'Gold', color: '#F59E0B', emoji: '🥇' };
  if (elo >= 1200) return { tier: 'Silver', color: '#94A3B8', emoji: '🥈' };
  return { tier: 'Bronze', color: '#92400E', emoji: '🥉' };
}
