import { create, all } from "mathjs";

const math = create(all);

export type ModeAngle = "DEG" | "RAD";

export interface ResultatCalculatrice {
  valeur: number | null;
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
  if (expression.trim() === "") return { valeur: null, erreur: null };
  try {
    const resultat = math.evaluate(expression, mode === "DEG" ? { ...PORTEE_BASE, ...PORTEE_DEG } : { ...PORTEE_BASE });
    if (typeof resultat !== "number" || !Number.isFinite(resultat)) {
      return { valeur: null, erreur: "Résultat non défini" };
    }
    return { valeur: resultat, erreur: null };
  } catch {
    return { valeur: null, erreur: "Expression invalide" };
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
