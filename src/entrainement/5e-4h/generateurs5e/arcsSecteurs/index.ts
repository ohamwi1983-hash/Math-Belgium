/**
 * Couche A (5e) — 5gen6 ("Arcs et secteurs : formule et conversion intégrée"). Génère TOUJOURS r
 * (entier simple) et θ (multiple de 5°) EN PREMIER — les "primitives" — puis calcule les 5
 * quantités EXACTEMENT depuis elles ; le mode "2→3" se contente ensuite de choisir 2 des 5 comme
 * "données" et les 3 autres deviennent des écrans. Ce choix (documenté en tête de
 * `core5e/arcsSecteurs.types.ts`) élimine tout besoin d'un vrai solveur "2 données quelconques → 3
 * inconnues" : le système reste toujours exact (θ_rad/l/A sont toujours des multiples rationnels
 * de π), jamais de bruit décimal de génération.
 */
import type { DirectionConversion, ExerciceArcSecteur, ExerciceModeConversion, ExerciceModeDeuxVersTrois, QuantiteArcSecteur, TypeConversion, ValeursArcSecteur } from "../../core5e/arcsSecteurs.types";

const R_MIN = 2;
const R_MAX = 10;
const THETA_DEG_MIN = 10;
const THETA_DEG_MAX = 350;

/** Les 9 paires valides parmi C(5,2)=10 — {thetaDeg,thetaRad} exclue (même information, ne permet
 * jamais de résoudre r/l/A). */
export const PAIRES_VALIDES: [QuantiteArcSecteur, QuantiteArcSecteur][] = [
  ["thetaDeg", "r"],
  ["thetaDeg", "l"],
  ["thetaDeg", "A"],
  ["thetaRad", "r"],
  ["thetaRad", "l"],
  ["thetaRad", "A"],
  ["r", "l"],
  ["r", "A"],
  ["l", "A"],
];

/** Probabilité du mode "conversion pure" (spec : "1 tirage sur 3 ou 4... pour garder à ce mode son
 * rôle de pratique isolée") — 1 sur 4, le reste réparti uniformément sur les 9 modes "2→3". */
const POIDS_CONVERSION = 0.25;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Multiple de 5 dans [min,max], JAMAIS 0. */
function multipleDe5(min: number, max: number): number {
  const minPas = Math.ceil(min / 5);
  const maxPas = Math.floor(max / 5);
  let pas: number;
  do {
    pas = entierAleatoire(minPas, maxPas);
  } while (pas === 0);
  return pas * 5;
}

function decimaleDeuxChiffres(min: number, max: number): number {
  const brut = min + Math.random() * (max - min);
  return Math.round(brut * 100) / 100;
}

export function calculerValeursExactes(r: number, thetaDeg: number): ValeursArcSecteur {
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const l = r * thetaRad;
  const A = 0.5 * r * r * thetaRad;
  return { thetaDeg, thetaRad, r, l, A };
}

export function genererExerciceDeuxVersTrois(): ExerciceModeDeuxVersTrois {
  const r = entierAleatoire(R_MIN, R_MAX);
  const thetaDeg = multipleDe5(THETA_DEG_MIN, THETA_DEG_MAX);
  const valeurs = calculerValeursExactes(r, thetaDeg);
  const connues = PAIRES_VALIDES[Math.floor(Math.random() * PAIRES_VALIDES.length)];
  return { mode: "deuxVersTrois", connues, valeurs };
}

export function genererExerciceConversion(): ExerciceModeConversion {
  const direction: DirectionConversion = Math.random() < 0.5 ? "degVersRad" : "radVersDeg";
  const type: TypeConversion = Math.random() < 0.5 ? "exacte" : "decimale";

  if (type === "exacte") {
    if (direction === "degVersRad") {
      const thetaDeg = multipleDe5(-90, 450);
      return { mode: "conversion", direction, type, valeurDepart: thetaDeg, valeurCible: (thetaDeg * Math.PI) / 180 };
    }
    const k = (() => {
      let candidat: number;
      do {
        candidat = entierAleatoire(-18, 90);
      } while (candidat === 0);
      return candidat;
    })();
    const thetaRad = (k * Math.PI) / 36;
    return { mode: "conversion", direction, type, valeurDepart: thetaRad, valeurCible: 5 * k };
  }

  if (direction === "degVersRad") {
    const thetaDeg = decimaleDeuxChiffres(-180, 720);
    return { mode: "conversion", direction, type, valeurDepart: thetaDeg, valeurCible: (thetaDeg * Math.PI) / 180 };
  }
  const thetaRad = decimaleDeuxChiffres(-3.14, 12.57);
  return { mode: "conversion", direction, type, valeurDepart: thetaRad, valeurCible: (thetaRad * 180) / Math.PI };
}

export function genererExerciceArcSecteur(): ExerciceArcSecteur {
  return Math.random() < POIDS_CONVERSION ? genererExerciceConversion() : genererExerciceDeuxVersTrois();
}
