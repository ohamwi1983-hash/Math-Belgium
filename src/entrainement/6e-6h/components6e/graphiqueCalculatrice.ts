import { create, all } from "mathjs";

const math = create(all);

/** Même alias que `calculatriceScientifique.ts` ("ln" n'existe pas nativement dans mathjs) — repris
 * ici séparément plutôt qu'importé : cette instance mathjs est volontairement INDÉPENDANTE de celle
 * de la calculatrice scientifique (voir `compilerFonctionGraphique`, pourquoi RAD toujours). */
const PORTEE = { ln: Math.log };

export interface FonctionGraphiqueEtat {
  id: number;
  expression: string;
  couleur: string;
  visible: boolean;
}

/** Palette cyclique (jetons de couleur déjà utilisés ailleurs sur le site — accent, sky, rose, plan,
 * good — jamais de teinte inventée) : au plus `PALETTE_FONCTIONS.length` fonctions simultanées. */
export const PALETTE_FONCTIONS = ["#b65c1f", "#2f6fb0", "#b23a7a", "#5b4ea3", "#2f7a4f"];

export interface ResultatFonctionGraphique {
  evaluer: ((x: number) => number) | null;
  erreur: string | null;
}

/**
 * Compile une expression en `x` — toujours en RADIANS, à la différence du mode DEG/RAD de la
 * calculatrice scientifique : une courbe mathématique (sin, cos...) se trace sur la convention
 * d'analyse standard, jamais sur le réglage d'angle ponctuel de l'élève (qui ne concerne que le
 * pavé numérique). `math.compile` (plutôt que `math.evaluate` en boucle, utilisé côté pavé
 * numérique) : `Plot.OfX` appelle la fonction retournée des centaines de fois par rendu (un point
 * par pixel visible), recompiler l'expression à chaque appel serait un gaspillage mesurable.
 *
 * Validée immédiatement avec `x=1` : une expression syntaxiquement correcte mais utilisant un nom
 * de fonction inconnu (faute de frappe) ne lève souvent qu'à l'ÉVALUATION, jamais à la compilation
 * seule — sans ce test, l'erreur ne serait détectée qu'au premier pixel tracé par `Plot.OfX`,
 * jamais remontée à la ligne de saisie.
 */
export function compilerFonctionGraphique(expression: string): ResultatFonctionGraphique {
  if (expression.trim() === "") return { evaluer: null, erreur: null };
  try {
    const node = math.compile(expression);
    const test = node.evaluate({ x: 1, ...PORTEE });
    if (typeof test !== "number") return { evaluer: null, erreur: "Expression invalide" };
    return {
      evaluer: (x: number) => {
        const v = node.evaluate({ x, ...PORTEE });
        return typeof v === "number" && Number.isFinite(v) ? v : NaN;
      },
      erreur: null,
    };
  } catch {
    return { evaluer: null, erreur: "Expression invalide" };
  }
}
