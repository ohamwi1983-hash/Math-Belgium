/**
 * Couche A (5e) — génération pour 5gen22 ("Limites et asymptotes, lecture graphique"). Dimensions
 * COMBINABLES tirées indépendamment (nombre d'AV, comportement de chaque AV, comportement à
 * l'infini, point isolé rare) plutôt que quelques familles figées — voir
 * `core5e/lectureGraphiqueLimites.types.ts` pour le contrat complet. N'importe jamais rien de
 * `moteur5e/`.
 */
import type {
  ComportementInfini,
  ComportementVA,
  ExerciceLectureGraphiqueLimites,
  SigneInfini,
} from "../../core5e/lectureGraphiqueLimites.types";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function entierNonNul(magnitudeMax: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(-magnitudeMax, magnitudeMax);
  return v;
}

function signeAleatoire(): SigneInfini {
  return Math.random() < 0.5 ? 1 : -1;
}

/** Positions des AV, TOUJOURS triées, séparation minimale de 3 unités entre 2 AV (lisibilité du
 * graphique) — rejet borné (jamais un rejet illimité), repli déterministe si jamais atteint. */
function tirerPositionsVA(nombre: number): number[] {
  if (nombre === 0) return [];
  if (nombre === 1) return [entierAleatoire(-4, 4)];
  const SEPARATION_MIN = 3;
  for (let tentative = 0; tentative < 50; tentative++) {
    const a = entierAleatoire(-5, 2);
    const b = entierAleatoire(a + SEPARATION_MIN, 6);
    if (b - a >= SEPARATION_MIN) return [a, b];
  }
  return [-3, 3];
}

/** ~65% "signes opposés" (cas standard, deux limites unilatérales distinctes), ~35% "signes
 * identiques" (cas plus rare, une seule limite bilatérale) — piège central documenté dans l'aide.
 * Point isolé rare (~15%) : AU PLUS un des deux côtés, jamais les deux (l'asymptote resterait
 * sinon fictive). */
function tirerComportementVA(position: number): ComportementVA {
  const signesOpposes = Math.random() < 0.65;
  const signeGauche = signeAleatoire();
  const signeDroit: SigneInfini = signesOpposes ? ((-signeGauche) as SigneInfini) : signeGauche;
  const va: ComportementVA = { position, signeGauche, signeDroit };
  if (Math.random() < 0.15) {
    const valeur = entierAleatoire(-4, 4);
    if (Math.random() < 0.5) va.pointIsoleGauche = valeur;
    else va.pointIsoleDroit = valeur;
  }
  return va;
}

/** "aucune" réservée aux tirages à 0-1 AV (jamais surcharger le graphique avec 2 AV + divergence
 * sans asymptote), et rare même dans ce cas (~15%). Le reste se partage ~50/50 entre horizontale et
 * oblique. Horizontale : ~75% valeur identique en ±∞ ("la plupart du temps identique" par énoncé),
 * ~25% deux valeurs distinctes (2 vraies asymptotes horizontales). */
function tirerComportementInfini(nombreVA: number): ComportementInfini {
  const autoriseAucune = nombreVA <= 1;
  const r = Math.random();
  if (autoriseAucune && r < 0.15) {
    return { type: "aucune", signePlusInfini: signeAleatoire(), signeMoinsInfini: signeAleatoire() };
  }
  const baseRestante = autoriseAucune ? (r - 0.15) / 0.85 : r;
  if (baseRestante < 0.5) {
    const identique = Math.random() < 0.75;
    const limitePlusInfini = entierAleatoire(-4, 4);
    let limiteMoinsInfini = limitePlusInfini;
    if (!identique) {
      do {
        limiteMoinsInfini = entierAleatoire(-4, 4);
      } while (limiteMoinsInfini === limitePlusInfini);
    }
    return { type: "horizontale", limitePlusInfini, limiteMoinsInfini };
  }
  return { type: "oblique", pente: entierNonNul(3), ordonnee: entierAleatoire(-4, 4) };
}

const POIDS_NOMBRE_VA: [number, number][] = [
  [0, 1],
  [1, 2.5],
  [2, 2.5],
];

function tirerNombreVA(): number {
  const total = POIDS_NOMBRE_VA.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [n, poids] of POIDS_NOMBRE_VA) {
    if (r < poids) return n;
    r -= poids;
  }
  return 1;
}

export function genererExerciceLectureGraphiqueLimites(nombreVAForce?: number): ExerciceLectureGraphiqueLimites {
  const nombreVA = nombreVAForce ?? tirerNombreVA();
  const vas = tirerPositionsVA(nombreVA).map(tirerComportementVA);
  const infini = tirerComportementInfini(nombreVA);
  return { vas, infini };
}

// ============================================================================
// Panneau dev — combos représentatifs. Chaque entrée force la STRUCTURE qualitative annoncée par
// son label (nombre d'AV, opposée/identique, présence/côté d'un point isolé, type de comportement à
// l'infini) mais tire ses valeurs numériques (positions, signes non contraints par le label, valeurs
// d'AH/AO, valeur du point isolé) au hasard via les mêmes helpers que le tirage libre — jamais une
// instance figée : `construireAvecFamilleId` doit produire un résultat différent à chaque appel,
// exactement comme `genererExerciceLectureGraphiqueLimites`.
// ============================================================================

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "0va-horizontale", label: "0 AV — horizontale (identique)" },
  { id: "0va-horizontale-distincte", label: "0 AV — horizontale (différente en ±∞)" },
  { id: "0va-oblique", label: "0 AV — oblique" },
  { id: "0va-aucune", label: "0 AV — aucune (diverge)" },
  { id: "1va-opposes-horizontale", label: "1 AV, signes opposés — horizontale" },
  { id: "1va-identiques-horizontale", label: "1 AV, signes identiques — horizontale" },
  { id: "1va-opposes-oblique", label: "1 AV, signes opposés — oblique" },
  { id: "1va-aucune", label: "1 AV — aucune (diverge)" },
  { id: "1va-pointIsole", label: "1 AV — point isolé (continuité)" },
  { id: "2va-opposes-horizontale", label: "2 AV, opposés/opposés — horizontale" },
  { id: "2va-mixte-oblique", label: "2 AV, opposés/identiques — oblique" },
  { id: "2va-pointIsole", label: "2 AV — point isolé sur une AV" },
];

function positionUnique(): number {
  return entierAleatoire(-4, 4);
}

function vaOpposee(position: number): ComportementVA {
  const signe = signeAleatoire();
  return { position, signeGauche: signe, signeDroit: (-signe) as SigneInfini };
}

function vaIdentique(position: number): ComportementVA {
  const signe = signeAleatoire();
  return { position, signeGauche: signe, signeDroit: signe };
}

/** Variante opposée dont un des deux côtés (fixé par `cote`, seule la VALEUR varie) est remplacé
 * par un point isolé de continuité. */
function vaAvecPointIsole(position: number, cote: "gauche" | "droit"): ComportementVA {
  const va = vaOpposee(position);
  const valeur = entierAleatoire(-4, 4);
  if (cote === "gauche") va.pointIsoleGauche = valeur;
  else va.pointIsoleDroit = valeur;
  return va;
}

function infiniHorizontaleIdentique(): ComportementInfini {
  const limite = entierAleatoire(-4, 4);
  return { type: "horizontale", limitePlusInfini: limite, limiteMoinsInfini: limite };
}

function infiniHorizontaleDistincte(): ComportementInfini {
  const limitePlusInfini = entierAleatoire(-4, 4);
  let limiteMoinsInfini = limitePlusInfini;
  while (limiteMoinsInfini === limitePlusInfini) limiteMoinsInfini = entierAleatoire(-4, 4);
  return { type: "horizontale", limitePlusInfini, limiteMoinsInfini };
}

function infiniOblique(): ComportementInfini {
  return { type: "oblique", pente: entierNonNul(3), ordonnee: entierAleatoire(-4, 4) };
}

function infiniAucune(): ComportementInfini {
  return { type: "aucune", signePlusInfini: signeAleatoire(), signeMoinsInfini: signeAleatoire() };
}

export function construireAvecFamilleId(id: string): ExerciceLectureGraphiqueLimites {
  switch (id) {
    case "0va-horizontale":
      return { vas: [], infini: infiniHorizontaleIdentique() };
    case "0va-horizontale-distincte":
      return { vas: [], infini: infiniHorizontaleDistincte() };
    case "0va-oblique":
      return { vas: [], infini: infiniOblique() };
    case "0va-aucune":
      return { vas: [], infini: infiniAucune() };
    case "1va-opposes-horizontale":
      return { vas: [vaOpposee(positionUnique())], infini: infiniHorizontaleIdentique() };
    case "1va-identiques-horizontale":
      return { vas: [vaIdentique(positionUnique())], infini: infiniHorizontaleIdentique() };
    case "1va-opposes-oblique":
      return { vas: [vaOpposee(positionUnique())], infini: infiniOblique() };
    case "1va-aucune":
      return { vas: [vaOpposee(positionUnique())], infini: infiniAucune() };
    case "1va-pointIsole":
      return { vas: [vaAvecPointIsole(positionUnique(), "droit")], infini: infiniHorizontaleIdentique() };
    case "2va-opposes-horizontale": {
      const [pa, pb] = tirerPositionsVA(2);
      return { vas: [vaOpposee(pa), vaOpposee(pb)], infini: infiniHorizontaleIdentique() };
    }
    case "2va-mixte-oblique": {
      const [pa, pb] = tirerPositionsVA(2);
      return { vas: [vaOpposee(pa), vaIdentique(pb)], infini: infiniOblique() };
    }
    case "2va-pointIsole": {
      const [pa, pb] = tirerPositionsVA(2);
      return { vas: [vaAvecPointIsole(pa, "gauche"), vaOpposee(pb)], infini: infiniHorizontaleIdentique() };
    }
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}
