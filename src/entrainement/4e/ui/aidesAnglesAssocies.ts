import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";

/**
 * gen17 « Angles associés » — textes des aides (KaTeX) qui accompagnent les figures progressives
 * de l'écran, et messages ciblés (audit 4e ch. 5, lot B) : signe du quadrant oublié, sinus et
 * cosinus échangés (ou pas échangés quand il le fallait). Jamais la réponse.
 */

const proche = (a: number, b: number) => Math.abs(a - b) <= 0.0015;

function fonction(e: ExerciceAnglesAssocies): "sin" | "cos" | "tan" {
  return e.variante === "sinCos" ? e.fonctionCible : "tan";
}

/** Niveau 1 : les règles du cours pour la fonction demandée. */
export function aideAnglesAssociesNiveau1(e: ExerciceAnglesAssocies): FragmentConsigne[] {
  const f = fonction(e);
  const regles =
    f === "tan"
      ? "\\tan(180^\\circ - x) = -\\tan x,\\quad \\tan(180^\\circ + x) = \\tan x,\\quad \\tan(-x) = -\\tan x"
      : f === "sin"
        ? "\\sin(90^\\circ - x) = \\cos x,\\quad \\sin(90^\\circ + x) = \\cos x,\\quad \\sin(180^\\circ - x) = \\sin x,\\quad \\sin(180^\\circ + x) = -\\sin x,\\quad \\sin(-x) = -\\sin x"
        : "\\cos(90^\\circ - x) = \\sin x,\\quad \\cos(90^\\circ + x) = -\\sin x,\\quad \\cos(180^\\circ - x) = -\\cos x,\\quad \\cos(180^\\circ + x) = -\\cos x,\\quad \\cos(-x) = \\cos x";
  return [texte("Écris l'angle demandé à l'aide d'un angle aigu x, puis applique la règle de sa famille (cours, § 4) : "), latex(regles), texte(". La figure montre l'angle et la valeur cherchée.")];
}

/** Niveau 2 : l'écriture de θ (la figure ajoute l'angle associé en orange). */
export function aideAnglesAssociesNiveau2(e: ExerciceAnglesAssocies): FragmentConsigne[] {
  const { theta, xReference: x } = e;
  switch (e.relation) {
    case "complementaireDirecte":
      return [latex(`${theta}^\\circ = 90^\\circ - ${e.alpha}^\\circ`), texte(" : famille complémentaire.")];
    case "plus90":
      return [latex(`${theta}^\\circ = 90^\\circ + ${e.alpha}^\\circ`), texte(" : règle de 90° + θ.")];
    case "supplementaire":
      return [latex(`${theta}^\\circ = 180^\\circ - ${x}^\\circ`), texte(" : famille supplémentaire.")];
    case "antiSupplementaire":
      return [latex(`${theta}^\\circ = 180^\\circ + ${x}^\\circ`), texte(" : famille anti-supplémentaire.")];
    case "oppose":
      return [latex(`${theta}^\\circ = 360^\\circ - ${x}^\\circ`), texte(" : même point que "), latex(`-${x}^\\circ`), texte(", famille des angles opposés.")];
  }
}

/** Niveau 3 (seulement si x ≠ α) : passage au complémentaire. */
export function aideAnglesAssociesNiveau3(e: ExerciceAnglesAssocies): FragmentConsigne[] {
  return [latex(`${e.xReference}^\\circ = 90^\\circ - ${e.alpha}^\\circ`), texte(" : le sinus de l'un est le cosinus de l'autre.")];
}

export function messageAnglesAssocies(e: ExerciceAnglesAssocies, v: number): FragmentConsigne[] | null {
  const t = e.valeurCible;
  if (proche(v, t)) return null;
  if (t !== 0 && proche(v, -t)) return [texte(`La valeur sans le signe est juste, mais le signe ne l'est pas : ${e.theta}° est dans le quadrant ${e.quadrant}.`)];
  if (e.variante === "sinCos") {
    const utilisee = proche(Math.abs(t), e.sinAlpha) ? "sin" : "cos";
    const autre = utilisee === "sin" ? e.cosAlpha : e.sinAlpha;
    if (proche(Math.abs(v), autre) && !proche(e.sinAlpha, e.cosAlpha)) {
      return [
        texte(`C'est la valeur de ${utilisee === "sin" ? "cos" : "sin"} ${e.alpha}° : relis la famille de ${e.theta}° pour savoir si elle échange sinus et cosinus (complémentaire, 90° + α) ou non.`),
      ];
    }
  }
  return null;
}
