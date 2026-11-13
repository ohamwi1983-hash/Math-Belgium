import type {
  ExerciceRotationsContexte,
  OrigineRotation,
  RotationSens,
  SensProbleme,
  SituationRotation,
} from "../../core/rotationsContexte.types";
import { calculExact, estRemarquable, normaliserAngle, propre } from "../../moteur/modeleRotationsContexte";

/**
 * Générateur de « Le cercle dans le réel : rotations en contexte » (gen79). Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs, voir le rapport du générateur) :
 * - données réalistes et cohérentes : le point ne traverse jamais le sol (h > r) ;
 * - sens direct : α multiple de 5°, position finale jamais sur un axe ; `exacte` ⟺ θ multiple de
 *   30° ou de 45° (valeurs remarquables), `calculatrice` ⟺ θ pas multiple de 15° ; θ dans le
 *   premier quadrant moins souvent (le transfert vise les signes des autres quadrants) ; grande
 *   roue et horloge : environ une fois sur quatre plus d'un tour (réduction à faire) ;
 * - sens inverse : k = (H − h)/r a au plus deux décimales et H aussi ; `exacte` ⟺ k = ±1/2,
 *   `calculatrice` ⟺ |k| entre 0,10 et 0,90, différent de 0,5 ; deux solutions, sauf le cas
 *   particulier (point le plus haut ou le plus bas, k = ±1, jamais la position de départ) tiré une
 *   fois sur douze environ.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export const SITUATIONS: SituationRotation[] = ["roue", "horloge", "robot", "eolienne", "valve"];

/** Conversions possibles (position de départ, sens) par situation. */
export const CONVERSIONS: Record<SituationRotation, [OrigineRotation, RotationSens][]> = {
  roue: [
    [270, 1],
    [270, -1],
  ],
  horloge: [[90, -1]],
  robot: [
    [180, -1],
    [180, 1],
    [0, -1],
  ],
  eolienne: [
    [90, -1],
    [90, 1],
  ],
  valve: [
    [90, -1],
    [270, -1],
    [90, 1],
    [270, 1],
  ],
};

const PROBA_EXACTE = 0.45;
const PROBA_UNIQUE = 1 / 12;
const PROBA_PLUS_D_UN_TOUR = 0.25;

export interface OptionsGeneration {
  calcul?: "exacte" | "calculatrice";
  /** Sens inverse : forcer (true) ou interdire (false) le cas « une seule solution ». */
  unique?: boolean;
}

interface Dimensions {
  rayon: number;
  hauteurCentre: number;
  unite: "m" | "cm";
}

function dimensions(situation: SituationRotation): Dimensions {
  switch (situation) {
    case "roue": {
      const rayon = entier(10, 30);
      return { rayon, hauteurCentre: propre(rayon + choisir([1, 1.5, 2, 2.5, 3])), unite: "m" };
    }
    case "horloge":
      return { rayon: choisir([1.2, 1.5, 1.8, 2, 2.5]), hauteurCentre: entier(15, 40), unite: "m" };
    case "robot": {
      const rayon = entier(30, 60);
      return { rayon, hauteurCentre: rayon + entier(5, 25), unite: "cm" };
    }
    case "eolienne": {
      const rayon = entier(30, 60);
      return { rayon, hauteurCentre: rayon + entier(15, 50), unite: "m" };
    }
    case "valve": {
      const roue = choisir([33, 34, 35, 36]);
      return { rayon: roue - choisir([3, 4, 5]), hauteurCentre: roue, unite: "cm" };
    }
  }
}

function auPlusDeuxDecimales(v: number): boolean {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
}

/** Angle parcouru (sens direct), multiple de 5° (de 6° pour l'horloge : minutes entières). */
function tirerAlpha(situation: SituationRotation): number {
  const plusDUnTour = (situation === "roue" || situation === "horloge") && Math.random() < PROBA_PLUS_D_UN_TOUR;
  if (situation === "horloge") return 6 * (plusDUnTour ? entier(61, 119) : entier(1, 59));
  if (situation === "roue") return 5 * (plusDUnTour ? entier(73, 143) : entier(2, 70));
  return 5 * entier(4, 68);
}

function directAcceptable(theta: number, exacte: boolean): boolean {
  if (theta % 90 === 0) return false;
  if (exacte ? !estRemarquable(theta) : theta % 15 === 0) return false;
  // Premier quadrant moins fréquent : le transfert porte sur les signes des autres quadrants.
  if (theta < 90 && Math.random() < 0.6) return false;
  return true;
}

export function genererRotationsContexte(situation: SituationRotation, sens: SensProbleme, options: OptionsGeneration = {}): ExerciceRotationsContexte {
  const exacte = options.calcul ? options.calcul === "exacte" : Math.random() < PROBA_EXACTE;
  // Tiré une fois, AVANT la boucle : un rejet (H à trop de décimales) ne doit pas favoriser ce cas.
  const unique = sens === "inverse" && (options.unique ?? Math.random() < PROBA_UNIQUE);
  for (;;) {
    const [origine, rotation] = choisir(CONVERSIONS[situation]);
    const { rayon, hauteurCentre, unite } = dimensions(situation);
    const base = { situation, sens, origine, rotation, rayon, hauteurCentre, unite };

    if (sens === "direct") {
      const alpha = tirerAlpha(situation);
      const theta = normaliserAngle(origine + rotation * alpha);
      if (!directAcceptable(theta, exacte)) continue;
      const periode = situation === "roue" ? choisir([6, 12, 18, 24]) : null;
      return { ...base, periode, alpha, hauteurCible: null };
    }

    let k: number;
    if (unique) {
      // Le point le plus haut ou le plus bas, jamais la position de départ (α = 0, sans intérêt).
      if (origine === 90) k = -1;
      else if (origine === 270) k = 1;
      else k = choisir([1, -1]);
    } else if (exacte) {
      k = choisir([0.5, -0.5]);
    } else {
      const j = entier(10, 90);
      if (j === 50) continue;
      k = choisir([1, -1]) * (j / 100);
    }
    const hauteurCible = propre(hauteurCentre + rayon * k);
    if (!auPlusDeuxDecimales(hauteurCible) || hauteurCible <= 0) continue;
    const periode = situation === "roue" ? choisir([6, 12, 18, 24]) : situation === "eolienne" ? choisir(exacte || unique ? [3, 6] : [4, 5, 6]) : null;
    const exercice: ExerciceRotationsContexte = { ...base, periode, alpha: null, hauteurCible };
    if (!unique && calculExact(exercice) !== exacte) continue;
    return exercice;
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

const NOMS: Record<SituationRotation, string> = {
  roue: "Grande roue",
  horloge: "Horloge",
  robot: "Bras de robot",
  eolienne: "Éolienne",
  valve: "Valve de vélo",
};

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = SITUATIONS.flatMap((s) => [
  { id: `${s}-direct`, label: `${NOMS[s]} — hauteur à un instant donné` },
  { id: `${s}-inverse`, label: `${NOMS[s]} — quand atteint-on une hauteur ?` },
]);

export function construireAvecVariante(id: string): ExerciceRotationsContexte {
  const m = /^(roue|horloge|robot|eolienne|valve)-(direct|inverse)$/.exec(id);
  if (!m) return genererExerciceRotationsContexte();
  return genererRotationsContexte(m[1] as SituationRotation, m[2] as SensProbleme);
}

/** Tirage libre : situation et sens au hasard. */
export function genererExerciceRotationsContexte(): ExerciceRotationsContexte {
  return genererRotationsContexte(choisir(SITUATIONS), Math.random() < 0.5 ? "direct" : "inverse");
}
