import type { ExerciceQuelAngle } from "../core/quelAngle.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { estEgalite, membreEgaliteLatex, texteAideQuadrants } from "./formatQuelAngle";

/**
 * gen18 « Trouver l'angle » — aides à deux niveaux (KaTeX) et messages ciblés (audit 4e ch. 5,
 * lot B) : seconde solution oubliée, solution du mauvais quadrant (elle donne −k), angle hors de
 * [0° ; 360°[, famille confondue (−β au lieu de 180° − β pour le sinus). Jamais la réponse.
 */

type Aides = FragmentConsigne[][];

const RAD = Math.PI / 180;
const reduit = (a: number) => ((a % 360) + 360) % 360;

function valeur(f: "sin" | "cos" | "tan", a: number): number {
  return f === "sin" ? Math.sin(a * RAD) : f === "cos" ? Math.cos(a * RAD) : Math.tan(a * RAD);
}

const REGLE: Record<"sin" | "cos" | "tan", string> = {
  sin: "\\sin(180^\\circ - \\alpha_0) = \\sin\\alpha_0",
  cos: "\\cos(-\\alpha_0) = \\cos\\alpha_0",
  tan: "\\tan(\\alpha_0 + 180^\\circ) = \\tan\\alpha_0",
};

export function aidesQuelAngle(e: ExerciceQuelAngle): Aides {
  const f = e.fonction;
  if (estEgalite(e)) {
    return [
      f === "sin"
        ? [texte("Deux angles supplémentaires ont le même sinus :"), latex("\\sin(180^\\circ - \\beta) = \\sin\\beta")]
        : [texte("Deux angles opposés ont le même cosinus :"), latex("\\cos(-\\beta) = \\cos\\beta")],
      [
        texte("Ici "),
        latex(`\\beta = ${e.angleEgal}^\\circ`),
        texte(` : une solution est évidente, l'autre vient de la famille ${f === "sin" ? "supplémentaire" : "des opposés"}. Ramène chacune dans [0° ; 360°[ (ajoute ou retire 360°). Contrôle : `),
        latex(membreEgaliteLatex(e)),
        texte(` a le signe ${f === "sin" ? "de l'ordonnée" : "de l'abscisse"} de chaque point.`),
      ],
    ];
  }
  const niveau1: FragmentConsigne[] = [
    texte(`${f === "tan" ? "La tangente prend toute valeur" : `Pour tout angle, ${f} α est compris entre −1 et 1`}. Quand une solution α₀ existe, l'autre vient de la règle `),
    latex(REGLE[f]),
    texte(f === "tan" ? " (période de 180°)." : " : deux solutions dans [0° ; 360°[, confondues seulement sur un axe."),
  ];
  const niveau2: FragmentConsigne[] =
    e.solutions.length === 0
      ? [texte("Compare la valeur absolue du second membre à 1.")]
      : [texte(`Cherche α₀ dans la table des valeurs remarquables (avec la valeur sans le signe). ${texteAideQuadrants(e)} La figure montre les points du cercle concernés.`)];
  return [niveau1, niveau2];
}

/** Message ciblé sur la DERNIÈRE réponse fausse (valeurs en degrés, verdict « au moins une »). */
export function messageQuelAngle(e: ExerciceQuelAngle, valeurs: number[]): FragmentConsigne[] | null {
  if (e.solutions.length === 0 || valeurs.length === 0) return null;
  const f = e.fonction;
  const k = valeur(f, e.solutions[0]!);
  const estSolution = (v: number) => e.solutions.some((s) => Math.abs(s - v) <= 0.5);
  for (const v of valeurs) {
    if (!estSolution(v) && e.solutions.some((s) => Math.abs(s - reduit(v)) <= 0.5)) {
      return [texte(`${v}° donne bien la bonne valeur, mais les solutions sont demandées dans [0° ; 360°[ : ajoute ou retire 360°.`)];
    }
  }
  if (estEgalite(e)) {
    const b = e.angleEgal;
    const confusion = f === "sin" ? reduit(-b) : reduit(180 - b);
    if (valeurs.some((v) => Math.abs(reduit(v) - confusion) <= 0.5 && !estSolution(v))) {
      return f === "sin"
        ? [texte("−β a le même cosinus que β, pas le même sinus : pour le sinus, la seconde solution est "), latex("180^\\circ - \\beta"), texte(".")]
        : [texte("180° − β a le même sinus que β, pas le même cosinus : pour le cosinus, la seconde solution est "), latex("-\\beta"), texte(".")];
    }
  }
  const mauvaisQuadrant = valeurs.find((v) => !estSolution(v) && Math.abs(k) > 1e-9 && Math.abs(valeur(f, v) + k) < 1e-6);
  if (mauvaisQuadrant !== undefined) {
    return [texte(`${mauvaisQuadrant}° donne la valeur opposée : mauvais quadrant. Le signe du second membre indique les quadrants des solutions.`)];
  }
  const justes = valeurs.filter(estSolution);
  if (justes.length === valeurs.length && new Set(justes.map((v) => Math.round(v))).size < e.solutions.length) {
    return [texte(`Il manque une solution : dans [0° ; 360°[, ${f === "tan" ? "la tangente reprend la même valeur 180° plus loin" : `deux angles ont le même ${f === "sin" ? "sinus" : "cosinus"}`}.`)];
  }
  return null;
}
