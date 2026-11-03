import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";

/**
 * Comparaison ENSEMBLISTE (ordre indifférent, tolérance flottante sur les bornes numériques) d'un
 * `EnsembleReelGuide` — à l'origine une réplique exacte de `verifierEnsembleReelGuide`
 * (`moteur5e/verificationDomaineDefinition.ts`, 5gen1), réimplémentée ici plutôt qu'importée : voir
 * CLAUDE.md, "Chantier 6e FWB (6h)" — aucun moteur partagé entre les chantiers.
 *
 * **Égalité d'ensembles, plus égalité d'écriture** (audit 6e ch. 3, point 26) : la comparaison
 * portait sur la FORME choisie (« ℝ », « ℝ privé de points », « union d'intervalles ») — `ℝ∖{0}`
 * saisi `]−∞;0[ ∪ ]0;+∞[`, ou `ℝ` saisi `]−∞;+∞[`, étaient refusés alors qu'ils désignent le même
 * ensemble. Les deux ensembles sont désormais ramenés à une écriture CANONIQUE (liste triée
 * d'intervalles disjoints, morceaux contigus fusionnés) avant comparaison. Toute paire acceptée
 * avant ce changement l'est toujours (mêmes morceaux → même forme canonique) ; seules des écritures
 * différentes d'un même ensemble sont acceptées en plus.
 */
function memeValeur(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 1e-6;
}

function memeMorceau(a: MorceauIntervalle, b: MorceauIntervalle): boolean {
  return memeValeur(a.inf, b.inf) && memeValeur(a.sup, b.sup) && a.infInclus === b.infInclus && a.supInclus === b.supInclus;
}

function trierMorceaux(morceaux: MorceauIntervalle[]): MorceauIntervalle[] {
  return [...morceaux].sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity) || Number(b.infInclus) - Number(a.infInclus));
}

/** `ℝ` privé d'une liste de points → intervalles ouverts entre points consécutifs. */
function complementDePoints(points: number[]): MorceauIntervalle[] {
  const tries = [...points].sort((x, y) => x - y);
  const morceaux: MorceauIntervalle[] = [];
  let precedent: number | null = null;
  for (const p of tries) {
    if (precedent !== null && memeValeur(precedent, p)) continue;
    morceaux.push({ inf: precedent, sup: p, infInclus: false, supInclus: false });
    precedent = p;
  }
  morceaux.push({ inf: precedent, sup: null, infInclus: false, supInclus: false });
  return morceaux;
}

/** `a` finit-il après le début de `b` (chevauchement), ou le touche-t-il sans trou (borne commune
 * incluse d'un côté au moins) ? `a.inf ≤ b.inf` garanti par l'appelant (morceaux triés). */
function seRejoignent(a: MorceauIntervalle, b: MorceauIntervalle): boolean {
  if (a.sup === null || b.inf === null) return true;
  if (a.sup > b.inf + 1e-6) return true;
  if (memeValeur(a.sup, b.inf)) return a.supInclus || b.infInclus;
  return false;
}

function fusionner(a: MorceauIntervalle, b: MorceauIntervalle): MorceauIntervalle {
  let sup = a.sup;
  let supInclus = a.supInclus;
  if (a.sup !== null && (b.sup === null || b.sup > a.sup + 1e-6)) {
    sup = b.sup;
    supInclus = b.supInclus;
  } else if (a.sup !== null && b.sup !== null && memeValeur(a.sup, b.sup)) {
    supInclus = a.supInclus || b.supInclus;
  }
  return { inf: a.inf, sup, infInclus: a.infInclus, supInclus };
}

function formeCanonique(ensemble: EnsembleReelGuide): MorceauIntervalle[] {
  const brut =
    ensemble.forme === "reel"
      ? [{ inf: null, sup: null, infInclus: false, supInclus: false }]
      : ensemble.forme === "prive_points"
        ? complementDePoints(ensemble.points)
        : ensemble.morceaux;
  const tries = trierMorceaux(brut);
  const resultat: MorceauIntervalle[] = [];
  for (const m of tries) {
    const dernier = resultat[resultat.length - 1];
    if (dernier !== undefined && seRejoignent(dernier, m)) resultat[resultat.length - 1] = fusionner(dernier, m);
    else resultat.push({ ...m });
  }
  return resultat;
}

export function verifierEnsembleReelGuide(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): boolean {
  const a = formeCanonique(attendu);
  const s = formeCanonique(saisie);
  return a.length === s.length && a.every((m, i) => memeMorceau(m, s[i]));
}
