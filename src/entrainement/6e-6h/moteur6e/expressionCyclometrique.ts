import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — évaluateur d'expression partagé par 6gen2/6gen3/6gen4/6gen5 (chapitre 1).
 *
 * Délègue à l'analyseur récursif-descendant du chapitre 2 (`expressionExponentielle.ts`), qui a la
 * même grammaire que l'ancien analyseur de ce fichier (`x`, `pi`, `e`, entiers/décimaux `.`/`,`,
 * `+ - * / ^`, parenthèses, multiplication implicite `2x`, `2sqrt(x)`, `(x+1)(x-1)`, `²`/`³`,
 * `sqrt`/`rac`/`racN`/`abs`/`cbrt`/`sin`/`cos`/`tan`/`asin`/`arcsin`/`acos`/`arccos`/`atan`/
 * `arctan`, trigonométrie en RADIANS) et lit EN PLUS les écritures des claviers de téléphone et des
 * manuels (audit du 6e ch. 1, G7 : « π/3 », « √3/3 », « 2x/√(1−x⁴) » valaient « illisible », donc
 * une tentative perdue) : « π », « √ » (avec ou sans parenthèses), « · », « × », « ÷ », valeur
 * absolue « |…| », racine impaire d'un négatif ((−8)^(1/3) = −2). Ajouts propres au chapitre :
 * « sin⁻¹ », « sin^-1 », « sin^(-1) » lus comme arcsin. Aucune exception pour un problème de
 * DOMAINE (`NaN`/`Infinity` propagés) ; seule une erreur de SYNTAXE lève.
 */
function normaliserCyclo(texte: string): string {
  return texte.replace(/[−–—]/g, "-").replace(/(sin|cos|tan)\s*(\^\s*\(?\s*-\s*1\s*\)?|⁻¹)/gi, "arc$1").replace(/arcarc/gi, "arc");
}

/** Lève sur toute erreur de syntaxe ; `NaN`/`Infinity` propagés nativement pour un problème de
 * domaine (jamais une exception pour ceux-là). */
export function evaluerExpressionCyclometrique(texte: string, x: number): number {
  return evaluerExpressionExponentielle(normaliserCyclo(texte), { x });
}

/** Valeur numérique pure (aucune variable : « x » y est illisible) — angle en multiple de π, valeur
 * remarquable irrationnelle... `null` sur toute erreur de syntaxe OU résultat non fini (domaine
 * invalide). */
export function evaluerValeurCyclometrique(texte: string): number | null {
  try {
    const v = evaluerExpressionExponentielle(normaliserCyclo(texte), {});
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
