import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceApplicationPhysique } from "../core/applicationPhysique.types";
import {
  formatAideDeviationNiveau2Latex,
  formatAideNormeNiveau2Latex,
  notationVecteursApplicationPhysique,
  segmentsAideDeviationNiveau1,
  segmentsAideDeviationSens,
  segmentsAideNormeNiveau1,
} from "./formatApplicationPhysique";
import type { Fragments, Niveaux } from "./retoursVecteurs";

/**
 * Aides à deux niveaux et messages ciblés de gen29 (applications physiques : résultante) — audit
 * 4e ch. 6, lot B ; voir l'en-tête de `retoursVecteurs.ts`. Jamais le mot « radian » (pas au
 * programme de 4e) : une calculatrice mal réglée est dite « pas en mode degrés ».
 */

const RAD = Math.PI / 180;

/** Nombre saisi (virgule ou point, espaces ignorés ; « ° » final toléré pour un angle), ou null. */
export function lireNombrePhysique(texteSaisi: string, angle: boolean): number | null {
  let t = texteSaisi.trim().replace(/\s+/g, "").replace(",", ".");
  if (angle) t = t.replace(/°$/, "");
  if (t === "" || !/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function aidesNormePhysique(e: ExerciceApplicationPhysique): Niveaux {
  return [segmentsAideNormeNiveau1(e), [latex(formatAideNormeNiveau2Latex(e))]];
}

export function aidesDeviationPhysique(e: ExerciceApplicationPhysique): Niveaux {
  const sens = segmentsAideDeviationSens(e);
  return [segmentsAideDeviationNiveau1(e), [latex(formatAideDeviationNiveau2Latex(e)), ...(sens ? [texte(" "), ...sens] : [])]];
}

const proche = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

const MESSAGE_MODE_DEGRES: Fragments = [texte("Ta calculatrice n'est pas en mode degrés : règle-la en mode degrés (DEG) et recommence le calcul.")];

/** Écran « norme » : signe de la formule (θ = angle ENTRE les vecteurs), calculatrice mal réglée,
 * racine oubliée, normes additionnées. */
export function messageNormePhysique(e: ExerciceApplicationPhysique, valeur: number): Fragments | null {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(e.contexte);
  const a = e.v1;
  const b = e.v2;
  const theta = e.angleEntreVecteurs;
  const tol = 0.6;
  if (proche(valeur, a + b, tol) && e.variante === "angleDroit") {
    return [texte("Les normes ne s'additionnent pas : les deux vecteurs ne sont pas de même sens. Ils forment un angle droit — pense à Pythagore.")];
  }
  if (e.variante === "angleQuelconque") {
    const carreMoins = a * a + b * b - 2 * a * b * Math.cos(theta * RAD);
    if (carreMoins > 0 && proche(valeur, Math.sqrt(carreMoins), tol)) {
      return [
        texte("Relis le signe dans la formule de la résultante : avec θ, l'angle entre "),
        latex(v1),
        texte(" et "),
        latex(v2),
        texte(" donné dans l'énoncé, c'est "),
        latex(`\\|${resultante}\\|^2=\\|${v1}\\|^2+\\|${v2}\\|^2+2\\|${v1}\\|\\|${v2}\\|\\cos\\theta`),
        texte(" (avec un « + »)."),
      ];
    }
    const carreRad = a * a + b * b + 2 * a * b * Math.cos(theta);
    const carreRadMoins = a * a + b * b - 2 * a * b * Math.cos(theta);
    if ((carreRad > 0 && proche(valeur, Math.sqrt(carreRad), tol)) || (carreRadMoins > 0 && proche(valeur, Math.sqrt(carreRadMoins), tol))) return MESSAGE_MODE_DEGRES;
    if (proche(valeur, a + b, tol)) {
      return [texte("Les normes ne s'additionnent que si les deux vecteurs ont le même sens : utilise la formule de la résultante.")];
    }
  }
  const carre = e.triangle.a * e.triangle.a;
  if (proche(valeur, carre, Math.max(1, carre * 0.01))) {
    return [texte("Tu as trouvé le carré de la norme : il reste à prendre la racine carrée.")];
  }
  return null;
}

/** Écran « déviation » : calculatrice mal réglée, angle aigu de l'arcsin (ou 180° − pris à tort),
 * angle mesuré depuis le mauvais vecteur, angle de l'énoncé. */
export function messageDeviationPhysique(e: ExerciceApplicationPhysique, valeur: number): Fragments | null {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(e.contexte);
  const C = e.triangle.C;
  const theta = e.angleEntreVecteurs;
  const tol = 1;
  // Calculatrice pas en mode degrés : l'angle sort en une autre unité (nombre < 3,2), ou le sinus de
  // θ est calculé dans cette autre unité.
  if (valeur > 0 && valeur < 3.2 && proche(valeur, C * RAD, 0.05)) return MESSAGE_MODE_DEGRES;
  if (e.variante === "angleQuelconque") {
    const s = (e.v2 * Math.sin(theta)) / e.triangle.a;
    if (Math.abs(s) <= 1) {
      const faux = Math.asin(s) / RAD;
      if (proche(valeur, faux, tol) || proche(valeur, 180 - faux, tol)) return MESSAGE_MODE_DEGRES;
    }
    if (C > 90 && proche(valeur, 180 - C, tol)) {
      return [
        texte("C'est l'angle aigu donné par la calculatrice. Calcule le signe de "),
        latex(`\\|${v1}\\|+\\|${v2}\\|\\cos\\theta`),
        texte(" : la résultante penche-t-elle vers l'arrière ?"),
      ];
    }
    if (C < 90 && proche(valeur, 180 - C, tol)) {
      return [
        texte("On ne prend « 180° moins l'angle de la calculatrice » que si "),
        latex(`\\|${v1}\\|+\\|${v2}\\|\\cos\\theta`),
        texte(" est négatif (résultante qui penche vers l'arrière) : vérifie son signe."),
      ];
    }
    if (proche(valeur, theta - C, tol)) {
      return [texte("C'est l'angle entre "), latex(resultante), texte(" et "), latex(v2), texte(" : la déviation se mesure à partir de "), latex(v1), texte(".")];
    }
  }
  if (e.variante === "angleDroit" && proche(valeur, 90 - C, tol)) {
    return [
      texte("C'est l'angle entre "),
      latex(resultante),
      texte(" et "),
      latex(v2),
      texte(" : la déviation se mesure à partir de "),
      latex(v1),
      texte(" — côté opposé "),
      latex(`\\|${v2}\\|`),
      texte(", côté adjacent "),
      latex(`\\|${v1}\\|`),
      texte("."),
    ];
  }
  if (proche(valeur, theta, tol)) {
    return [texte("C'est l'angle θ de l'énoncé, entre les deux vecteurs composants — la déviation est l'angle entre "), latex(v1), texte(" et "), latex(resultante), texte(".")];
  }
  return null;
}

/**
 * Écran « modélisation » (retouche 4e ch. 6) : le piège réel est de juger la configuration à l'œil
 * sur le schéma, ou par l'angle du triangle des vecteurs mis bout à bout (180° − θ), au lieu de
 * l'angle θ de l'énoncé, entre les deux vecteurs placés à la même origine (corrigé, étape a).
 * Niveau 1 : la règle du cours ; niveau 2 : θ de l'instance et l'angle du triangle à NE PAS
 * utiliser — la comparaison à 90° reste à faire (même texte pour les deux variantes).
 */
export function aidesModelisationPhysique(e: ExerciceApplicationPhysique): Niveaux {
  const { v1, v2 } = notationVecteursApplicationPhysique(e.contexte);
  const theta = e.angleEntreVecteurs;
  return [
    [
      texte("La configuration se lit sur l'angle θ entre "),
      latex(v1),
      texte(" et "),
      latex(v2),
      texte(" placés à la même origine, celui que donne l'énoncé — pas à l'œil sur le schéma. Si "),
      latex("\\theta = 90^\\circ"),
      texte(", le parallélogramme des deux vecteurs est un rectangle (théorème de Pythagore, puis tangente) ; sinon, aigu ou obtus, l'angle est quelconque (formule de la résultante, puis loi des sinus)."),
    ],
    [
      texte("Ici, l'énoncé donne "),
      latex(`\\theta = ${theta}^\\circ`),
      texte(" entre "),
      latex(v1),
      texte(" et "),
      latex(v2),
      texte(" : compare cette valeur à "),
      latex("90^\\circ"),
      texte(". L'angle du triangle obtenu en mettant les vecteurs bout à bout, "),
      latex(`180^\\circ - ${theta}^\\circ = ${180 - theta}^\\circ`),
      texte(", n'est pas celui qui décide."),
    ],
  ];
}

/**
 * Écran « interprétation » (retouche 4e ch. 6) : pièges réels (corrigé, étape d) — croire la
 * résultante toujours côté Nord parce que le premier vecteur pointe plein Nord (une déviation
 * obtuse la fait passer côté Sud, ≈ 30 % des tirages « forces, angle quelconque »), et chercher le
 * côté Est / Ouest dans le calcul alors qu'il vient de l'énoncé. Niveau 1 : la méthode ; niveau 2 :
 * le côté donné par l'énoncé et la déviation de l'écran précédent (affichée par le récapitulatif) à
 * comparer à 90° — jamais la direction elle-même.
 */
export function aidesInterpretationPhysique(e: ExerciceApplicationPhysique): Niveaux {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(e.contexte);
  const cote = e.coteDeviation === "est" ? "l'Est" : "l'Ouest";
  return [
    [
      texte("Deux questions séparées. Est ou Ouest : la résultante est déviée du côté du second vecteur "),
      latex(v2),
      texte(", lu dans l'énoncé. Nord ou Sud : "),
      latex(v1),
      texte(" pointe plein Nord ; compare la déviation (angle entre "),
      latex(v1),
      texte(" et "),
      latex(resultante),
      texte(") à "),
      latex("90^\\circ"),
      texte(" — en dessous, la résultante reste côté Nord ; au-dessus, elle passe côté Sud."),
    ],
    [
      texte(`L'énoncé oriente le second vecteur « en direction de ${cote} ». La déviation trouvée à l'écran précédent vaut environ `),
      latex(`${Math.round(e.triangle.C)}^\\circ`),
      texte(" (récapitulatif) : compare-la à "),
      latex("90^\\circ"),
      texte(", puis assemble les deux réponses."),
    ],
  ];
}
