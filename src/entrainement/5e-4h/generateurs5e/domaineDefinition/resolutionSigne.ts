import type { EnsembleReelGuide, MorceauEnsemble } from "../../core5e/domaineDefinition.types";

export function ensembleReel(): EnsembleReelGuide {
  return { forme: "reel", points: [], morceaux: [] };
}

export function ensemblePrivePoints(valeurs: number[]): EnsembleReelGuide {
  return { forme: "prive_points", points: [...valeurs].sort((a, b) => a - b), morceaux: [] };
}

/** Résout ax+b ◇ 0 (◇ ∈ {≥,>}) — le sens dépend du signe de a (`a` jamais nul). Retourne
 * directement un `EnsembleReelGuide` (forme "intervalles") : pour cette famille, la résolution
 * d'une condition seule EST déjà le domf final, aucune conversion intermédiaire nécessaire. */
export function resoudreLineaireSigne(a: number, b: number, symbole: "≥" | ">"): EnsembleReelGuide {
  const seuil = -b / a;
  const inclus = symbole === "≥";
  if (a > 0) {
    return { forme: "intervalles", points: [], morceaux: [{ inf: seuil, sup: null, infInclus: inclus, supInclus: false }] };
  }
  return { forme: "intervalles", points: [], morceaux: [{ inf: null, sup: seuil, infInclus: false, supInclus: inclus }] };
}

/** Résout a(x-r1)(x-r2) ◇ 0 (◇ ∈ {≥,>}), r1≠r2 réelles — `a` jamais nul. */
export function resoudreQuadratiqueSigne(a: number, r1: number, r2: number, symbole: "≥" | ">"): EnsembleReelGuide {
  const rmin = Math.min(r1, r2);
  const rmax = Math.max(r1, r2);
  const inclus = symbole === "≥";
  if (a > 0) {
    return {
      forme: "intervalles",
      points: [],
      morceaux: [
        { inf: null, sup: rmin, infInclus: false, supInclus: inclus },
        { inf: rmax, sup: null, infInclus: inclus, supInclus: false },
      ],
    };
  }
  return { forme: "intervalles", points: [], morceaux: [{ inf: rmin, sup: rmax, infInclus: inclus, supInclus: inclus }] };
}

/**
 * Exclut un point d'un ensemble de morceaux (union d'intervalles) : scinde en 2 le morceau qui le
 * contient STRICTEMENT (jamais un point déjà sur une borne — la génération garantit toujours un
 * point strictement dedans ou strictement dehors, jamais pile sur une borne, voir
 * `racineSurFraction.ts`) ; laisse les autres morceaux inchangés si le point n'appartient à aucun
 * (cas "l'exclusion tombe hors de l'intervalle solution", sans effet sur le domf final).
 */
export function excluPointDeMorceaux(morceaux: MorceauEnsemble[], point: number): MorceauEnsemble[] {
  const resultat: MorceauEnsemble[] = [];
  for (const m of morceaux) {
    const dedansGauche = m.inf === null || m.inf < point;
    const dedansDroite = m.sup === null || point < m.sup;
    if (dedansGauche && dedansDroite) {
      resultat.push({ inf: m.inf, sup: point, infInclus: m.infInclus, supInclus: false });
      resultat.push({ inf: point, sup: m.sup, infInclus: false, supInclus: m.supInclus });
    } else {
      resultat.push(m);
    }
  }
  return resultat.sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
}
