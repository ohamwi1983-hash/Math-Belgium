import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";

/**
 * Comparaison STRUCTURELLE (ensembliste, ordre indifférent, tolérance flottante sur les bornes
 * numériques) d'un `EnsembleReelGuide` — réplique EXACTEMENT `verifierEnsembleReelGuide`
 * (`moteur5e/verificationDomaineDefinition.ts`, 5gen1), réimplémentée ici plutôt qu'importée : voir
 * CLAUDE.md, "Chantier 6e FWB (6h)" — aucun moteur partagé entre les chantiers.
 */
function memeValeur(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 1e-6;
}

function memeMorceau(a: MorceauIntervalle, b: MorceauIntervalle): boolean {
  return memeValeur(a.inf, b.inf) && memeValeur(a.sup, b.sup) && a.infInclus === b.infInclus && a.supInclus === b.supInclus;
}

function trierMorceaux(morceaux: MorceauIntervalle[]): MorceauIntervalle[] {
  return [...morceaux].sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
}

export function verifierEnsembleReelGuide(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): boolean {
  if (saisie.forme !== attendu.forme) return false;
  if (attendu.forme === "reel") return true;
  if (attendu.forme === "prive_points") {
    const a = [...attendu.points].sort((x, y) => x - y);
    const s = [...saisie.points].sort((x, y) => x - y);
    return a.length === s.length && a.every((v, i) => Math.abs(v - s[i]) < 1e-6);
  }
  const a = trierMorceaux(attendu.morceaux);
  const s = trierMorceaux(saisie.morceaux);
  return a.length === s.length && a.every((m, i) => memeMorceau(m, s[i]));
}
