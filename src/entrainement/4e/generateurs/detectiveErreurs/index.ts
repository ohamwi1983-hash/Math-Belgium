import type { DonneesTriangle, ExerciceDetectiveErreurs, IdDescription, IdScenario, SousVariante, TypeErreur } from "../../core/detectiveErreurs.types";
import {
  SCENARIOS,
  SCENARIOS_PAR_TYPE,
  TOLERANCE,
  arrondir,
  attenduFinal,
  attenduLigne,
  copieEleve,
  descriptionCorrecte,
  finalCopie,
  incoherence,
  indiceLigneFausse,
  resolutionCorrecte,
  solutionAmbigue,
  triangleDeLaCopie,
} from "../../moteur/modeleDetectiveErreurs";

/**
 * Générateur de « Le détective d'erreurs » (gen81). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice (données, sous-variante et ordre des descriptions).
 *
 * Variante = type d'erreur ; dans une variante, le scénario (configuration + ligne fausse) est tiré
 * uniformément (au moins 25 % chacun : séries équilibrées faciles à reproduire, `profil.ts`).
 *
 * Garanties (vérifiées par tirages massifs) :
 * - triangle réel non aplati (angles entre 12° et 150°) ;
 * - l'erreur se VOIT à la précision demandée : la valeur de la ligne fausse ET le résultat final
 *   de la copie s'écartent des bonnes valeurs d'au moins quatre fois la tolérance ;
 * - angle obtus et calculatrice en radians : la copie contredit un contrôle du cours (plus grand
 *   côté face au plus grand angle, somme des angles, angle ou longueur négatifs) ;
 * - arrondi : la valeur arrondie trop tôt (unité pour une longueur, dixième pour un cosinus)
 *   s'écarte nettement de la valeur exacte ;
 * - cas ambigu : deux triangles bien distincts (Ĉ₂ ≥ 8°).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const D2R = Math.PI / 180;

/** Données entières d'une configuration (triangle réel non aplati). */
function tirerDonnees(scenario: IdScenario): DonneesTriangle {
  // Angle obtus : le côté qui lui fait face est nettement le plus grand (tirage orienté, sinon
  // presque tous les essais seraient rejetés).
  if (scenario === "O1" || scenario === "O2") {
    const grand = entier(9, 15);
    const petit = entier(4, grand - 3);
    const A = entier(20, 55);
    return scenario === "O1" ? { b: grand, c: petit, A } : { b: petit, c: grand, A };
  }
  if (scenario === "O3") {
    for (;;) {
      const a = entier(4, 12);
      const c = entier(4, 12);
      const b = entier(Math.max(a, c) + 2, 15);
      if (a === c || b + 2 > a + c || b * b < a * a + c * c) continue;
      return { a, b, c };
    }
  }
  switch (SCENARIOS[scenario].configuration) {
    case "SAS": {
      for (;;) {
        const b = entier(4, 15);
        const c = entier(4, 15);
        const A = entier(20, 150);
        if (b === c || Math.abs(A - 90) < 5) continue;
        return { b, c, A };
      }
    }
    case "SSS": {
      for (;;) {
        const a = entier(4, 15);
        const b = entier(4, 15);
        const c = entier(4, 15);
        if (a === b || b === c || a === c) continue;
        if (a + 2 >= b + c || b + 2 >= a + c || c + 2 >= a + b) continue;
        return { a, b, c };
      }
    }
    case "AAS": {
      for (;;) {
        const A = entier(20, 120);
        const B = entier(20, 120);
        const C = 180 - A - B;
        if (C < 20 || C > 140 || A === B || A === C || B === C) continue;
        return { A, B, c: entier(5, 20) };
      }
    }
    case "SSA": {
      for (;;) {
        const A = entier(20, 55);
        const a = entier(4, 14);
        const b = entier(5, 15);
        const h = b * Math.sin(A * D2R);
        if (b - a < 1 || a - h < 0.6) continue;
        return { A, a, b };
      }
    }
  }
}

function sousVariantePour(scenario: IdScenario): SousVariante {
  if (scenario === "K1" || scenario === "K2") return choisir(["signe", "facteur"] as const);
  if (scenario === "C1") return choisir(["A", "B"] as const);
  if (scenario === "C2") return choisir(["B", "C"] as const);
  if (scenario === "C3") return choisir(["A", "C"] as const);
  return null;
}

/** Angles du triangle réel (degrés), calculés directement par Al-Kashi — indépendamment des lignes
 * de la résolution (celles-ci SUPPOSENT, pour les scénarios « obtus », que l'angle est obtus). */
function anglesReels(e: ExerciceDetectiveErreurs): number[] | null {
  const d = e.donnees;
  const acos = (x: number) => Math.acos(x) / D2R;
  switch (SCENARIOS[e.scenario].configuration) {
    case "SAS": {
      const { b, c, A } = d as { b: number; c: number; A: number };
      const a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * D2R));
      const B = acos((a * a + c * c - b * b) / (2 * a * c));
      return [A, B, 180 - A - B];
    }
    case "SSS": {
      const { a, b, c } = d as { a: number; b: number; c: number };
      const A = acos((b * b + c * c - a * a) / (2 * b * c));
      const B = acos((a * a + c * c - b * b) / (2 * a * c));
      return [A, B, 180 - A - B];
    }
    case "AAS":
      return [d.A!, d.B!, 180 - d.A! - d.B!];
    case "SSA":
      return null;
  }
}

function ecartVisible(copie: number, attendu: number, nature: keyof typeof TOLERANCE): boolean {
  return Number.isFinite(copie) && Math.abs(copie - attendu) >= 4 * TOLERANCE[nature];
}

/** Toutes les garanties de l'en-tête. */
export function instanceValide(e: ExerciceDetectiveErreurs): boolean {
  const copie = copieEleve(e);
  if (copie.some((l) => l.valeur !== null && !Number.isFinite(l.valeur))) return false;
  const i = indiceLigneFausse(e);
  const s = e.scenario;

  if (s === "G1") {
    const g = solutionAmbigue(e);
    return g.B1 >= 25 && g.B1 <= 80 && g.C2 >= 8 && g.c2 >= 1.5 && g.c1 - g.c2 >= 1;
  }

  const angles = anglesReels(e)!;
  if (angles.some((x) => x < 12 || x > 150)) return false;

  const ligne = attenduLigne(e);
  if (!ecartVisible(copie[i]!.valeur!, ligne.valeur, ligne.nature)) return false;
  const final = attenduFinal(e);
  if (final && !ecartVisible(finalCopie(e)!, final.valeur, final.nature)) return false;

  const t = triangleDeLaCopie(e);
  const anglesCopie = t?.angles ?? [];
  const plausible = anglesCopie.every((x) => x > 3 && x < 177);

  switch (s) {
    case "O1":
    case "O3": {
      // B̂ réellement obtus ; dans la copie, B̂ (en face du plus grand côté b) n'est pas le plus grand angle.
      if (angles[1]! < 100 || !t) return false;
      return t.angles[1] < Math.max(t.angles[0], t.angles[2]) - 3;
    }
    case "O2":
      return angles[2]! >= 100;
    case "R1":
    case "R3": {
      if (s === "R3" && angles[0]! >= 85) return false;
      return incoherence(e) !== null;
    }
    case "R2":
      return copie[1]!.valeur! <= -1;
    case "A1":
    case "A4": {
      const exact = resolutionCorrecte(e)[i]!.valeur!;
      return plausible && Math.abs(exact - Math.round(exact)) >= 0.2;
    }
    case "A2":
    case "A3": {
      const exact = resolutionCorrecte(e)[i]!.valeur!;
      const arrondi = arrondir(exact, 1);
      return plausible && arrondi !== 0 && Math.abs(arrondi) < 1 && Math.abs(exact - arrondi) >= 0.02;
    }
    case "C1":
    case "C2":
    case "C3":
      return plausible;
    case "K1":
      return plausible;
    case "K2":
      return plausible && Math.abs(copie[2]!.valeur!) <= 0.97;
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

const LEURRES: Record<IdScenario, IdDescription[]> = {
  O1: ["ambigu", "radians", "coteOppose"],
  O2: ["ambigu", "radians", "coteOppose"],
  O3: ["ambigu", "radians", "coteOppose"],
  R1: ["signe", "facteur", "arrondi"],
  R2: ["coteOppose", "arrondi", "inverseRapport"],
  R3: ["obtus", "arrondi", "fonctionReciproque"],
  A1: ["plusMoins", "signe", "facteur"],
  A2: ["signe", "facteur", "ordreCotes"],
  A3: ["signe", "facteur", "ordreCotes"],
  A4: ["coteOppose", "radians", "inverseRapport"],
  C1: ["radians", "arrondi", "inverseRapport"],
  C2: ["radians", "arrondi", "operation"],
  C3: ["radians", "arrondi", "operation"],
  K1: ["radians", "arrondi"],
  K2: ["arrondi", "radians"],
  G1: ["obtus", "radians", "coteOppose"],
};

function optionsPour(scenario: IdScenario, sousVariante: SousVariante): IdDescription[] {
  const juste = descriptionCorrecte({ scenario, sousVariante });
  const leurres = scenario === "K1" || scenario === "K2" ? [juste === "signe" ? "facteur" : "signe", ...LEURRES[scenario]] : LEURRES[scenario];
  return melanger([juste, ...(leurres as IdDescription[])]);
}

export function genererDetectiveErreurs(scenario: IdScenario): ExerciceDetectiveErreurs {
  for (;;) {
    const sousVariante = sousVariantePour(scenario);
    const e: ExerciceDetectiveErreurs = { scenario, donnees: tirerDonnees(scenario), sousVariante, options: [] };
    if (!instanceValide(e)) continue;
    return { ...e, options: optionsPour(scenario, sousVariante) };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: TypeErreur; label: string }[] = [
  { id: "obtus", label: "Angle obtus cherché par la loi des sinus" },
  { id: "radians", label: "Calculatrice en radians" },
  { id: "arrondi", label: "Arrondi intermédiaire" },
  { id: "coteOppose", label: "Côté non opposé à l'angle (loi des sinus)" },
  { id: "alKashi", label: "Signe ou facteur oublié dans Al-Kashi" },
  { id: "ambigu", label: "Second triangle oublié (cas ambigu)" },
];

export function construireAvecVariante(id: string): ExerciceDetectiveErreurs {
  const scenarios = SCENARIOS_PAR_TYPE[id as TypeErreur];
  if (!scenarios) return genererExerciceDetectiveErreurs();
  return genererDetectiveErreurs(choisir(scenarios));
}

/** Tirage libre : un type d'erreur au hasard, puis un scénario de ce type. */
export function genererExerciceDetectiveErreurs(): ExerciceDetectiveErreurs {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
