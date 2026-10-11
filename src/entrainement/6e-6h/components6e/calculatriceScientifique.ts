import { create, all } from "mathjs";
import type { Complex } from "mathjs";

const math = create(all);

export type ModeAngle = "DEG" | "RAD";

export interface ResultatCalculatrice {
  valeur: number | null;
  /** Résultat complexe (touche "i", réservée au 6e-6h — nombres complexes), déjà formaté en chaîne
   * finale (ex. "2 + 3i") — jamais aussi dans `valeur`, qui reste `null` dans ce cas. Séparé de
   * `valeur` plutôt qu'un type `number | Complex` unifié : `formatNombreCalculatrice` (10 chiffres
   * significatifs, bruit de flottant) ne s'applique qu'à un réel, un `Complex` a besoin de son
   * propre format (partie réelle ET imaginaire arrondies, `i`/`-i` pour une partie imaginaire ±1,
   * terme nul omis) — voir `formatComplexeCalculatrice`. */
  valeurComplexe: string | null;
  erreur: string | null;
}

/** Portée mathjs qui redéfinit sin/cos/tan/asin/acos/atan pour travailler en degrés — mathjs
 * n'expose aucun mode global "angles: deg" fonctionnel dans la version installée (vérifié : accepté
 * silencieusement par `config()` mais sans effet sur `evaluate`), donc le mode DEG est implémenté en
 * surchargeant ces 6 fonctions via la portée passée à `evaluate`, plutôt qu'en pré-traitant la
 * chaîne de caractères (fragile face aux arguments composés, ex. `sin(30+15)`). */
const PORTEE_DEG = {
  sin: (x: number) => Math.sin((x * Math.PI) / 180),
  cos: (x: number) => Math.cos((x * Math.PI) / 180),
  tan: (x: number) => Math.tan((x * Math.PI) / 180),
  asin: (x: number) => (Math.asin(x) * 180) / Math.PI,
  acos: (x: number) => (Math.acos(x) * 180) / Math.PI,
  atan: (x: number) => (Math.atan(x) * 180) / Math.PI,
};

/** `ln` n'existe pas nativement dans mathjs (`log` y désigne déjà le logarithme népérien, `log10`
 * le logarithme décimal) — alias ajouté à la portée pour accepter la notation `ln(...)` telle que
 * produite par le bouton "ln" de la calculatrice, dans les deux modes d'angle. */
const PORTEE_BASE = { ln: Math.log };

export function evaluerExpressionCalculatrice(expression: string, mode: ModeAngle): ResultatCalculatrice {
  if (expression.trim() === "") return { valeur: null, valeurComplexe: null, erreur: null };
  try {
    const resultat = math.evaluate(expression, mode === "DEG" ? { ...PORTEE_BASE, ...PORTEE_DEG } : { ...PORTEE_BASE });
    if (math.isComplex(resultat)) {
      return { valeur: null, valeurComplexe: formatComplexeCalculatrice(resultat), erreur: null };
    }
    if (typeof resultat !== "number" || !Number.isFinite(resultat)) {
      return { valeur: null, valeurComplexe: null, erreur: "Résultat non défini" };
    }
    return { valeur: resultat, valeurComplexe: null, erreur: null };
  } catch {
    return { valeur: null, valeurComplexe: null, erreur: "Expression invalide" };
  }
}

/** Traduction purement visuelle des opérateurs internes (`*`/`/`, syntaxe mathjs) vers les symboles
 * usuels d'une calculatrice (`×`/`÷`) — jamais appliquée à la chaîne réellement évaluée. */
export function formatExpressionAffichage(expression: string): string {
  return expression.replaceAll("*", "×").replaceAll("/", "÷");
}

/** Affichage court d'un résultat : 10 chiffres significatifs (absorbe le bruit de flottant IEEE-754
 * sans jamais tronquer un résultat entier/décimal simple), zéros de fin et point décimal superflus
 * retirés via un aller-retour par `Number` plutôt qu'une regex ad hoc. */
export function formatNombreCalculatrice(valeur: number): string {
  return Number(valeur.toPrecision(10)).toString();
}

/** Format d'un résultat complexe — jamais `z.toString()` de mathjs tel quel : il reporte le bruit de
 * flottant IEEE-754 de chaque partie sans arrondi (ex. "0.30000000000000004 + i"), alors que
 * `formatNombreCalculatrice` l'absorbe déjà pour un réel. Les parties réelle et imaginaire sont donc
 * arrondies séparément via `formatNombreCalculatrice`, puis la chaîne reconstruite à la main :
 * partie réelle nulle omise (ex. "3i", pas "0 + 3i"), partie imaginaire ±1 affichée "i"/"-i" (pas
 * "1i"/"-1i") — mêmes conventions qu'une calculatrice scientifique physique. */
export function formatComplexeCalculatrice(z: Complex): string {
  const re = Number(z.re.toPrecision(10));
  const im = Number(z.im.toPrecision(10));
  if (im === 0) return formatNombreCalculatrice(re);
  const partieImaginaire = Math.abs(im) === 1 ? "i" : `${formatNombreCalculatrice(Math.abs(im))}i`;
  if (re === 0) return im < 0 ? `-${partieImaginaire}` : partieImaginaire;
  return `${formatNombreCalculatrice(re)} ${im < 0 ? "-" : "+"} ${partieImaginaire}`;
}
