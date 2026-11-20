import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { formatCarreCibleLatex, formatCarreLatex, formatFonctionCibleLatex, formatValeurCibleSimplifieeLatex, valeurFinale } from "./formatUnSansLautre";
import type { Aides } from "./aidesCercleTrigo";

/**
 * gen16 « L'un sans l'autre » — aides à deux niveaux (KaTeX) et messages ciblés (audit 4e ch. 5,
 * lot B) : ± oublié, carré confondu avec la valeur (ou racine donnée au lieu du carré), carré
 * oublié dans 1 − cos²θ, quotient renversé. Jamais la réponse.
 */

const proche = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));

function valeurConnueLatex(e: ExerciceUnSansLautre): string {
  const corps = e.q === 1 ? `${e.p}` : `\\frac{${e.p}}{${e.q}}`;
  return e.signeConnu === -1 ? `-${corps}` : corps;
}

const BORNES: Record<string, string> = { I: "0^\\circ < \\theta < 90^\\circ", II: "90^\\circ < \\theta < 180^\\circ", III: "180^\\circ < \\theta < 270^\\circ", IV: "270^\\circ < \\theta < 360^\\circ" };

export function aidesCarreUnSansLautre(e: ExerciceUnSansLautre): Aides {
  if (e.fonctionConnue === "tan") {
    return [
      [texte("Divise l'identité fondamentale "), latex("\\cos^2\\theta + \\sin^2\\theta = 1"), texte(" par "), latex("\\cos^2\\theta"), texte(" :"), latex("1 + \\tan^2\\theta = \\dfrac{1}{\\cos^2\\theta}")],
      [texte("Donc "), latex(`\\cos^2\\theta = \\dfrac{1}{1 + \\tan^2\\theta} = \\dfrac{1}{1 + \\left(${valeurConnueLatex(e)}\\right)^2}`), texte(" : calcule le carré, puis la fraction.")],
    ];
  }
  return [
    [texte("Identité fondamentale :"), latex("\\cos^2\\theta + \\sin^2\\theta = 1")],
    [
      texte("Isole le carré demandé, puis remplace : "),
      latex(`${formatCarreLatex(e.fonctionCible)} = 1 - ${formatCarreLatex(e.fonctionConnue)} = 1 - \\left(${valeurConnueLatex(e)}\\right)^2`),
      texte(". Le carré d'un nombre négatif est positif."),
    ],
  ];
}

export function messageCarreUnSansLautre(e: ExerciceUnSansLautre, v: number): FragmentConsigne[] | null {
  const c = e.carreCibleNum / e.carreCibleDen;
  const k = e.valeurConnue;
  if (proche(v, c)) return null;
  if (e.fonctionConnue === "tan") {
    if (proche(v, 1 + k * k)) return [texte("C'est "), latex("1 + \\tan^2\\theta"), texte(" : "), latex("\\cos^2\\theta"), texte(" en est l'inverse.")];
    if (proche(v, 1 - c)) return [texte("C'est "), latex("\\sin^2\\theta"), texte(" : l'écran demande "), latex("\\cos^2\\theta"), texte(".")];
    return null;
  }
  const nomConnu = e.fonctionConnue === "cos" ? "\\cos\\theta" : "\\sin\\theta";
  if (proche(v, 1 - Math.abs(k)) || proche(v, 1 - k)) return [texte("N'oublie pas le carré : on retire "), latex(formatCarreLatex(e.fonctionConnue)), texte(", pas "), latex(nomConnu), texte(".")];
  if (proche(v, k * k)) return [texte("C'est "), latex(formatCarreLatex(e.fonctionConnue)), texte(" : l'écran demande "), latex(formatCarreLatex(e.fonctionCible)), texte(".")];
  if (proche(v, Math.sqrt(c))) return [texte("C'est déjà la racine : cet écran demande le carré "), latex(formatCarreLatex(e.fonctionCible)), texte(".")];
  if (proche(v, 1 + k * k)) return [texte("Attention au signe : "), latex(`${formatCarreLatex(e.fonctionCible)} = 1 - ${formatCarreLatex(e.fonctionConnue)}`), texte(".")];
  return null;
}

export function aidesValeurSigneeUnSansLautre(e: ExerciceUnSansLautre): Aides {
  const f = formatFonctionCibleLatex(e);
  return [
    [
      texte("Un carré a deux racines carrées : "),
      latex(`${f} = \\sqrt{${formatCarreCibleLatex(e)}} \\ \\text{ou}\\ ${f} = -\\sqrt{${formatCarreCibleLatex(e)}}`),
      texte(". C'est le quadrant de θ qui choisit le signe."),
    ],
    [
      texte("Ici "),
      latex(BORNES[e.quadrant]!),
      texte(` : θ est dans le quadrant ${e.quadrant}. Regarde le signe de `),
      latex(f),
      texte(" dans ce quadrant, puis simplifie : "),
      latex("\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}"),
      texte("."),
    ],
  ];
}

export function messageValeurSigneeUnSansLautre(e: ExerciceUnSansLautre, v: number): FragmentConsigne[] | null {
  const t = e.valeurCible;
  const c = e.carreCibleNum / e.carreCibleDen;
  if (proche(v, t)) return null;
  if (proche(v, -t)) return [texte(`La valeur sans le signe est juste, mais le signe ne l'est pas : θ est dans le quadrant ${e.quadrant}, et le carré ne dit rien du signe (± oublié).`)];
  if (proche(Math.abs(v), c)) return [texte("C'est le carré : prends sa racine carrée.")];
  return null;
}

export function aidesFinaleUnSansLautre(e: ExerciceUnSansLautre): Aides {
  if (e.fonctionConnue === "tan") {
    return [
      [texte("Multiplie les deux membres de la définition de la tangente par "), latex("\\cos\\theta"), texte(" :"), latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} \\iff \\sin\\theta = \\tan\\theta \\cdot \\cos\\theta")],
      [texte("Remplace : "), latex(`\\sin\\theta = ${valeurConnueLatex(e)} \\cdot \\left(${formatValeurCibleSimplifieeLatex(e)}\\right)`), texte(", puis simplifie.")],
    ];
  }
  const sin = e.fonctionConnue === "sin" ? valeurConnueLatex(e) : formatValeurCibleSimplifieeLatex(e);
  const cos = e.fonctionConnue === "cos" ? valeurConnueLatex(e) : formatValeurCibleSimplifieeLatex(e);
  return [
    [texte("Définition de la tangente :"), latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}")],
    [
      texte("Remplace : "),
      latex(`\\tan\\theta = \\dfrac{${sin}}{${cos}}`),
      texte(". Diviser par une fraction, c'est multiplier par son inverse ; simplifie ensuite (et rends le dénominateur entier si une racine y reste)."),
    ],
  ];
}

export function messageFinaleUnSansLautre(e: ExerciceUnSansLautre, v: number): FragmentConsigne[] | null {
  const t = valeurFinale(e);
  if (proche(v, t)) return null;
  if (proche(v, -t)) return [texte("La valeur sans le signe est juste, mais le signe ne l'est pas : un quotient (ou un produit) de deux nombres de même signe est positif, de signes contraires négatif.")];
  if (e.fonctionConnue !== "tan" && t !== 0 && proche(v, 1 / t)) return [texte("C'est l'inverse : dans "), latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(", le sinus est au numérateur.")];
  if (e.fonctionConnue === "tan" && proche(v, e.valeurConnue / e.cosValeur)) return [texte("On multiplie par "), latex("\\cos\\theta"), texte(", on ne divise pas : "), latex("\\sin\\theta = \\tan\\theta \\cdot \\cos\\theta"), texte(".")];
  return null;
}
