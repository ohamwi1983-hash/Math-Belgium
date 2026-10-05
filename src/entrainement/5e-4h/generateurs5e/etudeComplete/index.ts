/**
 * Couche A (5e) — génération pour 5gen24 ("Étude complète"). Dimensions COMBINABLES tirées
 * indépendamment (nombre/type d'exclusions, comportement à l'infini, cas spécial rare), construites
 * "à l'envers" — voir `core5e/etudeComplete.types.ts` pour le contrat complet et la justification de
 * la séparation `M(x)/D_vraie(x)`. N'importe jamais rien de `moteur5e/`.
 */
import type {
  ComportementInfiniEtude,
  Exclusion,
  ExerciceEtudeComplete,
  ExerciceEtudeCompleteBonus,
  ExerciceEtudeCompletePipeline,
  ProprietesConstructionInverse,
  TypeExclusion,
} from "../../core5e/etudeComplete.types";
import { polyAdd, polyDegre, polyEval, polyFacteur, polyMul, polyMulTous } from "./poly";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}

function signe(v: number): 1 | -1 {
  return v >= 0 ? 1 : -1;
}

// ============================================================================
// Tirage des exclusions.
// ============================================================================

function tirerNombreExclusions(force?: 1 | 2): 1 | 2 {
  if (force) return force;
  return Math.random() < 0.45 ? 1 : 2;
}

/** Positions distinctes, triées, séparation ≥2 (lisibilité) — même patron que 5gen22. */
function tirerPositions(n: number): number[] {
  if (n === 1) return [entierAleatoire(-4, 4)];
  const SEPARATION_MIN = 2;
  for (let tentative = 0; tentative < 50; tentative++) {
    const a = entierAleatoire(-5, 2);
    const b = entierAleatoire(a + SEPARATION_MIN, 6);
    if (b - a >= SEPARATION_MIN) return [a, b];
  }
  return [-3, 3];
}

function tirerTypeSeul(): "vaSimple" | "vaDouble" {
  return Math.random() < 0.55 ? "vaSimple" : "vaDouble";
}

function tirerTypeParmiTrois(): TypeExclusion {
  const r = Math.random();
  if (r < 0.4) return "vaSimple";
  if (r < 0.7) return "vaDouble";
  return "pointVide";
}

function degreVraie(t: TypeExclusion): number {
  return t === "vaDouble" ? 2 : t === "vaSimple" ? 1 : 0;
}

/** Une exclusion isolée n'est jamais "pointVide" (dégénère en fonction constante — voir
 * `core5e/etudeComplete.types.ts`) ; si 2 exclusions, jamais toutes deux "pointVide" pour la même
 * raison ; `deg(D_vraie)` plafonné à 4 (double+double, seule combinaison qui l'atteint — nécessaire
 * pour exercer la règle d'affichage "P2·P2" du degré 4, `prompt5gen24refontecomplete.md`). */
function tirerTypes(nombreExclusions: 1 | 2, forceTypes?: TypeExclusion[]): TypeExclusion[] {
  if (forceTypes) return forceTypes;
  if (nombreExclusions === 1) return [tirerTypeSeul()];
  let t1 = tirerTypeParmiTrois();
  let t2 = tirerTypeParmiTrois();
  if (t1 === "pointVide" && t2 === "pointVide") t2 = "vaSimple";
  if (degreVraie(t1) + degreVraie(t2) > 4) t2 = "vaSimple";
  return [t1, t2];
}

// ============================================================================
// Construction "à l'envers" — voir docs/historique-5e-limites.md pour la dérivation complète.
// ============================================================================

type SousCasInfini = "ahZero" | "ahNonNul" | "ao" | "aucune";

interface ConfigInfini {
  sousCas: SousCasInfini;
  avecCasSpecial: boolean;
}

function tirerConfigInfini(degDVraie: number, forceSousCas?: SousCasInfini, forceCasSpecial?: boolean): ConfigInfini {
  let sousCas: SousCasInfini;
  if (forceSousCas) {
    sousCas = forceSousCas;
  } else {
    const r = Math.random();
    sousCas = r < 0.3 ? "ahZero" : r < 0.65 ? "ahNonNul" : r < 0.85 ? "ao" : "aucune";
  }
  const eligibleCasSpecial = (sousCas === "ao" || sousCas === "ahNonNul") && degDVraie >= 2;
  const avecCasSpecial = forceCasSpecial ?? (eligibleCasSpecial && Math.random() < 0.18);
  return { sousCas, avecCasSpecial: eligibleCasSpecial && avecCasSpecial };
}

export function genererExerciceEtudeComplete(
  options: { nombreExclusions?: 1 | 2; types?: TypeExclusion[]; sousCasInfini?: SousCasInfini; casSpecial?: boolean } = {},
): ExerciceEtudeCompletePipeline {
  const nombreExclusions = tirerNombreExclusions(options.nombreExclusions);
  const positions = tirerPositions(nombreExclusions);
  const types = tirerTypes(nombreExclusions, options.types);

  const exclusionsBrutes = positions.map((position, i) => ({ position, type: types[i] }));

  const facteursVraie = exclusionsBrutes
    .filter((e) => e.type !== "pointVide")
    .map((e) => polyMulTous(new Array(e.type === "vaDouble" ? 2 : 1).fill(polyFacteur(e.position))));
  const dVraie = polyMulTous(facteursVraie.length > 0 ? facteursVraie : [[1]]);
  const degDVraie = polyDegre(dVraie);

  const facteursPointVide = exclusionsBrutes.filter((e) => e.type === "pointVide").map((e) => polyFacteur(e.position));
  const dPointVide = polyMulTous(facteursPointVide.length > 0 ? facteursPointVide : [[1]]);

  const positionsOccupees = positions;
  function tirerS(): number {
    for (let t = 0; t < 30; t++) {
      const s = entierAleatoire(-6, 6);
      if (!positionsOccupees.includes(s)) return s;
    }
    return 7;
  }

  const config = tirerConfigInfini(degDVraie, options.sousCasInfini, options.casSpecial);
  const kPetit = entierNonNul(1, 3);

  let m: number[];
  let infini: ComportementInfiniEtude;
  let casSpecial: { x: number; y: number } | undefined;

  if (config.sousCas === "ahZero") {
    m = [entierNonNul(1, 4)];
    infini = { type: "horizontale", limite: 0 };
  } else if (config.sousCas === "ahNonNul") {
    const kAH = entierNonNul(-4, 4);
    if (config.avecCasSpecial) {
      const s = tirerS();
      const kR = entierNonNul(1, 2);
      m = polyAdd(polyMul(dVraie, [kAH]), polyMul([kR], polyFacteur(s)));
      casSpecial = { x: s, y: kAH };
    } else {
      m = polyAdd(polyMul(dVraie, [kAH]), [kPetit]);
    }
    infini = { type: "horizontale", limite: kAH };
  } else if (config.sousCas === "ao") {
    const a = entierNonNul(-3, 3);
    const b = entierAleatoire(-5, 5);
    if (config.avecCasSpecial) {
      const s = tirerS();
      const kR = entierNonNul(1, 2);
      m = polyAdd(polyMul(dVraie, [b, a]), polyMul([kR], polyFacteur(s)));
      casSpecial = { x: s, y: a * s + b };
    } else {
      m = polyAdd(polyMul(dVraie, [b, a]), [kPetit]);
    }
    infini = { type: "oblique", pente: a, ordonnee: b };
  } else {
    const gap = Math.random() < 0.6 ? 2 : 3;
    const kAucune = entierNonNul(1, 3);
    const bump = new Array(gap + 1).fill(0);
    bump[gap] = 1;
    bump[0] = kAucune;
    m = polyAdd(polyMul(dVraie, bump), [kPetit]);
    const grand = 100000;
    infini = {
      type: "aucune",
      signePlusInfini: signe(polyEval(m, grand) / polyEval(dVraie, grand)),
      signeMoinsInfini: signe(polyEval(m, -grand) / polyEval(dVraie, -grand)),
      // a = lim f(x)/x — toujours ±∞ lui aussi dans ce sous-cas (deg(M)-deg(D_vraie)≥2, voir
      // core5e/etudeComplete.types.ts), distingue l'écran 6 de "oblique" où a est une pente finie.
      signeCoefDirecteurPlus: signe(polyEval(m, grand) / (grand * polyEval(dVraie, grand))),
      signeCoefDirecteurMoins: signe(polyEval(m, -grand) / (-grand * polyEval(dVraie, -grand))),
    };
  }

  const coeffsN = polyMul(dPointVide, m);
  const coeffsD = polyMul(dPointVide, dVraie);
  // M(x)/D_vraie(x) — cible de vérification de l'écran spécial A "Simplification", présente
  // uniquement si un point vide existe réellement (sinon N/D sont déjà M/D_vraie eux-mêmes).
  const aUnPointVide = facteursPointVide.length > 0;
  const coeffsM = aUnPointVide ? m : undefined;
  const coeffsDVraie = aUnPointVide ? dVraie : undefined;

  const exclusions: Exclusion[] = exclusionsBrutes.map((e) => {
    if (e.type === "pointVide") {
      return { position: e.position, type: e.type, valeurPointVide: polyEval(m, e.position) / polyEval(dVraie, e.position) };
    }
    const epsilon = 0.001;
    const fGauche = polyEval(coeffsN, e.position - epsilon) / polyEval(coeffsD, e.position - epsilon);
    const fDroit = polyEval(coeffsN, e.position + epsilon) / polyEval(coeffsD, e.position + epsilon);
    return { position: e.position, type: e.type, signeGauche: signe(fGauche), signeDroit: signe(fDroit) };
  });

  return { mode: "etude", coeffsN, coeffsD, coeffsM, coeffsDVraie, exclusions, infini, casSpecial };
}

// ============================================================================
// Variante bonus — "construction inverse" (ex.15 du corrigé source).
// ============================================================================

export function genererProprietesConstructionInverse(): ProprietesConstructionInverse {
  const racineDenominateur = entierAleatoire(-5, 5);
  const asymptote: ProprietesConstructionInverse["asymptote"] =
    Math.random() < 0.5
      ? { type: "horizontale", limite: entierNonNul(-4, 4) }
      : { type: "oblique", pente: entierNonNul(-3, 3), ordonnee: entierAleatoire(-4, 4) };
  return { racineDenominateur, asymptote };
}

export function genererExerciceEtudeCompleteBonus(): ExerciceEtudeCompleteBonus {
  return { mode: "constructionInverse", proprietes: genererProprietesConstructionInverse() };
}

// ============================================================================
// Panneau dev — combos représentatifs (instances tirées ALÉATOIREMENT dans la config forcée, même
// patron que 5gen23 : `construireAvecFamilleId` force la DIMENSION, jamais les nombres exacts).
// ============================================================================

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "1-vaSimple-ahZero", label: "1 exclusion, AV simple — AH=0" },
  { id: "1-vaSimple-ahNonNul", label: "1 exclusion, AV simple — AH≠0" },
  { id: "1-vaSimple-ao", label: "1 exclusion, AV simple — AO" },
  { id: "1-vaSimple-aucune", label: "1 exclusion, AV simple — aucune asymptote" },
  { id: "1-vaDouble-ahNonNul", label: "1 exclusion, AV double — AH≠0" },
  { id: "1-vaDouble-ao-special", label: "1 exclusion, AV double — AO + recoupement" },
  { id: "2-vaSimple-vaSimple-ah", label: "2 exclusions, simple+simple — AH" },
  { id: "2-vaSimple-vaSimple-ao", label: "2 exclusions, simple+simple — AO" },
  { id: "2-vaSimple-vaDouble-ahNonNul-special", label: "2 exclusions, simple+double — AH + recoupement" },
  { id: "2-vaDouble-vaDouble-ao", label: "2 exclusions, double+double — AO (D degré 4, affichage P2·P2)" },
  { id: "2-pointVide-vaSimple-ahNonNul", label: "2 exclusions, point vide + simple — AH≠0" },
  { id: "2-pointVide-vaDouble-ao", label: "2 exclusions, point vide + double — AO" },
  { id: "2-pointVide-vaSimple-aucune", label: "2 exclusions, point vide + simple — aucune" },
  { id: "bonus", label: "Bonus — construction inverse" },
];

export function construireAvecFamilleId(id: string): ExerciceEtudeComplete {
  switch (id) {
    case "1-vaSimple-ahZero":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaSimple"], sousCasInfini: "ahZero" });
    case "1-vaSimple-ahNonNul":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaSimple"], sousCasInfini: "ahNonNul" });
    case "1-vaSimple-ao":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaSimple"], sousCasInfini: "ao" });
    case "1-vaSimple-aucune":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaSimple"], sousCasInfini: "aucune" });
    case "1-vaDouble-ahNonNul":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaDouble"], sousCasInfini: "ahNonNul" });
    case "1-vaDouble-ao-special":
      return genererExerciceEtudeComplete({ nombreExclusions: 1, types: ["vaDouble"], sousCasInfini: "ao", casSpecial: true });
    case "2-vaSimple-vaSimple-ah":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["vaSimple", "vaSimple"], sousCasInfini: "ahNonNul" });
    case "2-vaSimple-vaSimple-ao":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["vaSimple", "vaSimple"], sousCasInfini: "ao" });
    case "2-vaSimple-vaDouble-ahNonNul-special":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["vaSimple", "vaDouble"], sousCasInfini: "ahNonNul", casSpecial: true });
    case "2-vaDouble-vaDouble-ao":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["vaDouble", "vaDouble"], sousCasInfini: "ao" });
    case "2-pointVide-vaSimple-ahNonNul":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["pointVide", "vaSimple"], sousCasInfini: "ahNonNul" });
    case "2-pointVide-vaDouble-ao":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["pointVide", "vaDouble"], sousCasInfini: "ao" });
    case "2-pointVide-vaSimple-aucune":
      return genererExerciceEtudeComplete({ nombreExclusions: 2, types: ["pointVide", "vaSimple"], sousCasInfini: "aucune" });
    case "bonus":
      return genererExerciceEtudeCompleteBonus();
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}
