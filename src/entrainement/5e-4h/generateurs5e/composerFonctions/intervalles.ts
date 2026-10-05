import type { EnsembleReelGuide, MorceauEnsemble } from "../../core5e/domaineDefinition.types";

/**
 * Arithmétique d'ensembles pour 5gen3 (intersection/union nécessaires au calcul de dom(f∘g)).
 * Les 3 formes de `EnsembleReelGuide` (reel/prive_points/intervalles) se ramènent TOUTES à une
 * même représentation canonique — une liste TRIÉE de morceaux non chevauchants couvrant tout ce
 * qui est inclus — ce qui permet une seule paire d'algorithmes (intersection/union) au lieu de 3×3
 * cas spéciaux : "reel" = un seul morceau (-∞,+∞) ; "prive_points" = R découpé en morceaux ouverts
 * de part et d'autre de chaque point exclu.
 */
/** `true` si un morceau ne peut représenter AUCUN réel — soit `inf > sup` (jamais produit par ce
 * module, mais un `EnsembleReelGuide` peut être construit à la main), soit `inf === sup` sans être
 * inclusif des deux côtés (`[6;6[`, par exemple) : un simple point NON inclus des deux côtés à la
 * fois ne contient jamais rien, quelle que soit la valeur individuelle de chaque `xxxInclus` —
 * filtré ici plutôt que laissé se propager dans les algorithmes d'intersection/union, qui
 * traiteraient sinon `infInclus`/`supInclus` comme deux signaux indépendants (bug réel trouvé par
 * le test croisé de `unionEnsembles`). */
function estMorceauVide(m: MorceauEnsemble): boolean {
  if (m.inf === null || m.sup === null) return false;
  if (presqueEgal(m.inf, m.sup)) return !(m.infInclus && m.supInclus);
  return m.inf > m.sup;
}

export function normaliserEnMorceaux(e: EnsembleReelGuide): MorceauEnsemble[] {
  if (e.forme === "reel") return [{ inf: null, sup: null, infInclus: false, supInclus: false }];
  if (e.forme === "intervalles") {
    return [...e.morceaux].filter((m) => !estMorceauVide(m)).sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
  }

  const points = [...e.points].sort((a, b) => a - b);
  const morceaux: MorceauEnsemble[] = [];
  let borneGauche: number | null = null;
  for (const p of points) {
    morceaux.push({ inf: borneGauche, sup: p, infInclus: false, supInclus: false });
    borneGauche = p;
  }
  morceaux.push({ inf: borneGauche, sup: null, infInclus: false, supInclus: false });
  return morceaux;
}

/** Reclassifie une liste canonique de morceaux (triée, non chevauchante) vers la forme la plus
 * lisible pour l'élève : "reel" si un seul morceau couvre tout, "prive_points" si c'est R découpé
 * en morceaux tous ouverts aux points de coupure (le motif produit par `normaliserEnMorceaux` pour
 * cette forme), "intervalles" sinon. */
export function classifierEnsemble(morceaux: MorceauEnsemble[]): EnsembleReelGuide {
  if (morceaux.length === 0) return { forme: "intervalles", points: [], morceaux: [] };
  if (morceaux.length === 1 && morceaux[0].inf === null && morceaux[0].sup === null) {
    return { forme: "reel", points: [], morceaux: [] };
  }

  const estMotifPriveDePoints =
    morceaux[0].inf === null &&
    morceaux[morceaux.length - 1].sup === null &&
    morceaux.every((m) => !m.infInclus && !m.supInclus) &&
    morceaux.every((m, i) => i === 0 || (m.inf !== null && morceaux[i - 1].sup !== null && presqueEgal(m.inf, morceaux[i - 1].sup as number)));
  if (estMotifPriveDePoints) {
    const points = morceaux.slice(0, -1).map((m) => m.sup as number);
    return { forme: "prive_points", points, morceaux: [] };
  }

  return { forme: "intervalles", points: [], morceaux };
}

/**
 * ⚠️ `null` a un sens DIFFÉRENT selon qu'il s'agit d'une borne INF (= -∞) ou SUP (= +∞), ET selon
 * l'opération (intersection = restreindre, union = étendre) — 4 combinaisons réellement
 * distinctes, jamais réductibles à une seule paire générique max/min : un bug de première version
 * (`borneMax`/`borneMin` génériques, cassant `union` dès qu'un des deux ensembles était `reel`,
 * trouvé par le test croisé) confirme qu'il faut les 4 fonctions nommées explicitement plutôt que
 * de factoriser prématurément.
 *
 * ⚠️ Comparaisons TOLÉRANTES (`presqueEgal`), jamais `===` strict : deux bornes mathématiquement
 * identiques peuvent arriver ici comme deux flottants légèrement différents selon leur mode de
 * calcul (ex. `-1/4` calculé directement vs. `-1/4` retrouvé comme racine d'un polynôme dérivé par
 * `solveur.ts`, via la formule quadratique — écart typique ~1e-16, mais suffisant pour faire
 * échouer une égalité flottante stricte et laisser passer un point qui aurait dû être exclu — bug
 * réel trouvé par `composition.test.ts` avant ce correctif).
 */
const EPSILON_BORNE = 1e-7;

function presqueEgal(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON_BORNE;
}

/** Borne INF la plus restrictive (= max des deux) — intersection : -∞ perd toujours face à un réel. */
function infPlusRestrictive(a: number | null, b: number | null, aInclus: boolean, bInclus: boolean): [number | null, boolean] {
  if (a === null) return [b, bInclus];
  if (b === null) return [a, aInclus];
  if (presqueEgal(a, b)) return [a, aInclus && bInclus];
  return a > b ? [a, aInclus] : [b, bInclus];
}

/** Borne INF la moins restrictive (= min des deux) — union : -∞ gagne toujours (min absolu). */
function infMoinsRestrictive(a: number | null, b: number | null, aInclus: boolean, bInclus: boolean): [number | null, boolean] {
  if (a === null || b === null) return [null, false];
  if (presqueEgal(a, b)) return [a, aInclus || bInclus];
  return a < b ? [a, aInclus] : [b, bInclus];
}

/** Borne SUP la moins restrictive (= min des deux) — intersection : +∞ perd toujours face à un réel. */
function supMoinsRestrictive(a: number | null, b: number | null, aInclus: boolean, bInclus: boolean): [number | null, boolean] {
  if (a === null) return [b, bInclus];
  if (b === null) return [a, aInclus];
  if (presqueEgal(a, b)) return [a, aInclus && bInclus];
  return a < b ? [a, aInclus] : [b, bInclus];
}

/** Borne SUP la plus restrictive (= max des deux) — union : +∞ gagne toujours (max absolu). */
function supPlusRestrictive(a: number | null, b: number | null, aInclus: boolean, bInclus: boolean): [number | null, boolean] {
  if (a === null || b === null) return [null, false];
  if (presqueEgal(a, b)) return [a, aInclus || bInclus];
  return a > b ? [a, aInclus] : [b, bInclus];
}

/** Intersection de 2 morceaux isolés — `null` si disjoints. */
function intersecterMorceaux(a: MorceauEnsemble, b: MorceauEnsemble): MorceauEnsemble | null {
  const [inf, infInclus] = infPlusRestrictive(a.inf, b.inf, a.infInclus, b.infInclus);
  const [sup, supInclus] = supMoinsRestrictive(a.sup, b.sup, a.supInclus, b.supInclus);
  if (inf !== null && sup !== null) {
    if (!presqueEgal(inf, sup) && inf > sup) return null;
    if (presqueEgal(inf, sup) && !(infInclus && supInclus)) return null;
  }
  return { inf, sup, infInclus, supInclus };
}

/** Intersection de 2 ensembles (union de morceaux chacun) — balayage classique à 2 pointeurs. */
export function intersecterEnsembles(a: EnsembleReelGuide, b: EnsembleReelGuide): EnsembleReelGuide {
  const ma = normaliserEnMorceaux(a);
  const mb = normaliserEnMorceaux(b);
  const resultat: MorceauEnsemble[] = [];
  for (const x of ma) {
    for (const y of mb) {
      const inter = intersecterMorceaux(x, y);
      if (inter) resultat.push(inter);
    }
  }
  resultat.sort((p, q) => (p.inf ?? -Infinity) - (q.inf ?? -Infinity));
  return classifierEnsemble(resultat);
}

/** Union de 2 morceaux ADJACENTS/chevauchants — `null` si réellement disjoints (avec un vrai trou
 * entre eux, pas seulement une borne partagée). */
function fusionnerSiAdjacents(a: MorceauEnsemble, b: MorceauEnsemble): MorceauEnsemble | null {
  const aTouche =
    a.sup === null ||
    b.inf === null ||
    (!presqueEgal(a.sup, b.inf) && a.sup > b.inf) ||
    (presqueEgal(a.sup, b.inf) && (a.supInclus || b.infInclus));
  if (!aTouche) return null;
  const [inf, infInclus] = infMoinsRestrictive(a.inf, b.inf, a.infInclus, b.infInclus);
  const [sup, supInclus] = supPlusRestrictive(a.sup, b.sup, a.supInclus, b.supInclus);
  return { inf, sup, infInclus, supInclus };
}

export function unionEnsembles(a: EnsembleReelGuide, b: EnsembleReelGuide): EnsembleReelGuide {
  const tous = [...normaliserEnMorceaux(a), ...normaliserEnMorceaux(b)].sort((p, q) => (p.inf ?? -Infinity) - (q.inf ?? -Infinity));
  const resultat: MorceauEnsemble[] = [];
  for (const m of tous) {
    const dernier = resultat[resultat.length - 1];
    if (dernier) {
      const fusion = fusionnerSiAdjacents(dernier, m);
      if (fusion) {
        resultat[resultat.length - 1] = fusion;
        continue;
      }
    }
    resultat.push(m);
  }
  return classifierEnsemble(resultat);
}
