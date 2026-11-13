import type {
  ExerciceCourbe,
  ExerciceDeduction,
  ExerciceExpression,
  ReponseTranslations,
  SensVariation,
  VerdictComparaison,
} from "../core/portraitRobotFonction.types";
import type { FamilleReference } from "../core/fonctionsReference.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { evaluerFonction } from "./modelePortraitRobot";
import type { StatutVerification } from "./statutVerification";
import { sensSymetrique, valeurOpposee } from "../generateurs/portraitRobotFonction";

/**
 * Vérification de « Le portrait-robot d'une fonction » (gen71). Les choix fermés (famille, verdicts,
 * courbe, condition violée) se comparent directement ; l'expression de f se vérifie par
 * échantillonnage (même moteur que les autres générateurs du chapitre, `evaluerExpressionGenerale`),
 * en exigeant AUSSI le même domaine : une saisie définie là où f ne l'est pas (ou l'inverse) est
 * refusée.
 */

const TOLERANCE = 1e-6;
const DECALAGES = [0.37, 0.8, 1.3, 2.1, 2.9, 4.4, 6.3, 9.1];

export function nettoyerSaisieExpression(saisie: string): string {
  return saisie
    .replace(/[−–—]/g, "-")
    .replace(/,/g, ".")
    .replace(/^\s*(f\s*\(\s*x\s*\)|y)\s*=/i, "")
    .trim();
}

export function diagnostiquerExpression(e: ExerciceExpression, saisie: string): StatutVerification {
  const expression = nettoyerSaisieExpression(saisie);
  if (expression === "") return "parse_error";
  const pivot = e.cible.h;
  const points = [...DECALAGES, ...DECALAGES.map((d) => -d)].map((d) => pivot + d);
  let comparaisons = 0;
  for (const x of points) {
    let valeur: number;
    try {
      valeur = evaluerExpressionGenerale(expression, x);
    } catch {
      return "parse_error";
    }
    const cible = evaluerFonction(e.cible, x);
    if (cible === null) {
      if (Number.isFinite(valeur)) return "not_equivalent";
      continue;
    }
    if (!Number.isFinite(valeur) || Math.abs(valeur - cible) > TOLERANCE * Math.max(1, Math.abs(cible))) return "not_equivalent";
    comparaisons++;
  }
  return comparaisons >= 6 ? "correct" : "not_equivalent";
}

export function verifierFamille(e: ExerciceExpression, choix: FamilleReference): boolean {
  return e.cible.famille === choix;
}

export function verifierTranslations(e: ExerciceExpression, r: ReponseTranslations): boolean {
  return Math.abs(r.th - e.cible.h) < TOLERANCE && Math.abs(r.tv - e.cible.k) < TOLERANCE;
}

export function verifierControle(e: ExerciceExpression, valeur: number): boolean {
  return Math.abs(valeur - e.controle.y) < TOLERANCE;
}

export function verifierValeurOpposee(e: ExerciceDeduction, valeur: number): boolean {
  return Math.abs(valeur - valeurOpposee(e)) < TOLERANCE;
}

/** Choix « on ne peut pas savoir » de l'écran des variations : jamais la bonne réponse. */
export type ChoixVariations = SensVariation | "indetermine";

export function verifierVariations(e: ExerciceDeduction, choix: ChoixVariations): boolean {
  return choix === sensSymetrique(e);
}

export function verifierComparaisonImages(e: ExerciceDeduction, choix: VerdictComparaison): boolean {
  return choix === e.comparaisonImages.verdict;
}

export function verifierComparaisonValeur(e: ExerciceDeduction, choix: VerdictComparaison): boolean {
  return choix === e.comparaisonValeur.verdict;
}

export function verifierCourbe(e: ExerciceCourbe, index: number): boolean {
  return index === e.indexCorrect;
}

/** Indices (dans `courbes`) des 3 courbes écartées, dans l'ordre A → D. */
export function courbesEcartees(e: ExerciceCourbe): number[] {
  return e.courbes.map((_, i) => i).filter((i) => i !== e.indexCorrect);
}

export function verifierConditionViolee(e: ExerciceCourbe, indexCourbe: number, indexCondition: number): boolean {
  return e.violations[indexCourbe] === indexCondition;
}

/** Saisie numérique d'un champ (virgule décimale, « − » typographique) → nombre, ou `null`. */
export function lireNombre(saisie: string): number | null {
  const propre = saisie.replace(/[−–—]/g, "-").replace(",", ".").trim();
  if (propre === "" || propre === "-" || propre === ".") return null;
  const n = Number(propre);
  return Number.isFinite(n) ? n : null;
}
