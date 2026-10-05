/**
 * Couche A — "Triangle quelconque" (remplace "Aire d'un triangle quelconque" à la position 19,
 * `promptcreationgenerateur19trianglequelconque.md`). Réutilise `resoudreAAS`/`resoudreSSS`
 * (`generateurs/triangle/resoudreTriangle.ts`, module partagé) — import générateur→générateur.
 * Jamais un triangle tiré au hasard puis classé a posteriori : chaque configuration choisit
 * d'abord ses données connues, puis en déduit le triangle complet.
 *
 * Deux configurations UNIQUEMENT, jamais le cas ambigu SSA — voir sa doc,
 * `core/triangleQuelconque.types.ts`. Rôles toujours fixes (même simplification que "Loi des
 * sinus"/"Loi des cosinus", voir CLAUDE.md) : `loiSinus` cherche toujours `b`, `alKashi` cherche
 * toujours `A` — la variété vient des valeurs tirées, pas de la combinatoire des rôles.
 *
 * `unite` (`promptcorrectionsgenerateur19unitesnotation.md`) : tirée uniformément parmi les 5
 * valeurs de `UniteLongueur`, une seule fois par exercice — jamais retirée indépendamment pour
 * l'écran 2, qui réutilise la même valeur.
 */
import type {
  ConfigurationTriangleQuelconque,
  ExerciceTriangleQuelconque,
  GenerateurExerciceTriangleQuelconque,
  UniteLongueur,
} from "../../core/triangleQuelconque.types";
import { resoudreAAS, resoudreSSS } from "../triangle/resoudreTriangle";
import { randomInt } from "./aleatoire";

/** Unité de longueur tirée uniformément, fixée pour tout l'exercice (les deux écrans) —
 * `promptcorrectionsgenerateur19unitesnotation.md`. */
const UNITES_LONGUEUR: UniteLongueur[] = ["mm", "cm", "dm", "m", "km"];

function tirerUnite(): UniteLongueur {
  return UNITES_LONGUEUR[randomInt(0, UNITES_LONGUEUR.length - 1)];
}

/**
 * Config `loiSinus` (AAS, jamais ambigu) : `A`, `B` tirés dans [20°,140°] avec `A+B` contraint dans
 * [30°,160°] (`C` reste dans [20°,150°], jamais de triangle dégénéré/trop plat — même plage que
 * "Loi des sinus"), `a` (opposé à `A`) un petit entier. L'élève cherche `b`.
 */
function construireLoiSinus(): ExerciceTriangleQuelconque {
  let A = 0;
  let B = 0;
  do {
    A = randomInt(20, 140);
    B = randomInt(20, 140);
  } while (A + B < 30 || A + B > 160);

  const a = randomInt(4, 20);
  return { configuration: "loiSinus", triangle: resoudreAAS(A, B, a), donneeManquante: "b", unite: tirerUnite() };
}

/**
 * Config `alKashi` (SSS, jamais ambigu sur [0°,180°]) : `a`, `b`, `c` tirés dans [5,20], rejetés
 * (marge 2) tant que l'inégalité triangulaire n'est pas respectée avec une marge suffisante — même
 * précaution que "Loi des cosinus" (jamais un triangle presque dégénéré, angle proche de 0°/180°).
 * L'élève cherche toujours `A`.
 */
function construireAlKashi(): ExerciceTriangleQuelconque {
  const MARGE = 2;
  let a = 0;
  let b = 0;
  let c = 0;
  do {
    a = randomInt(5, 20);
    b = randomInt(5, 20);
    c = randomInt(5, 20);
  } while (a + MARGE >= b + c || b + MARGE >= a + c || c + MARGE >= a + b);

  return { configuration: "alKashi", triangle: resoudreSSS(a, b, c), donneeManquante: "A", unite: tirerUnite() };
}

export const CATALOGUE_VARIANTES: { id: ConfigurationTriangleQuelconque; label: string }[] = [
  { id: "loiSinus", label: "Côté manquant (loi des sinus)" },
  { id: "alKashi", label: "Angle manquant (Al-Kashi)" },
];

/** Convention CLAUDE.md ("Catalogue de variantes") — force la configuration demandée. */
export function construireAvecVarianteId(varianteId: ConfigurationTriangleQuelconque): ExerciceTriangleQuelconque {
  return varianteId === "loiSinus" ? construireLoiSinus() : construireAlKashi();
}

export const genererExerciceTriangleQuelconque: GenerateurExerciceTriangleQuelconque = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
