import type { ExerciceApproximationAffine } from "../core5e/approximationAffine";
import { approximation, erreur, fa, fpa, nombre, valeurCalculatrice } from "../core5e/approximationAffine";
import type { AideEcran, ChampEcran, Frag } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { decL, decT, parD, sciL } from "./ecrituresApplicationsDerivees";

/**
 * Couche C — textes de `5gen68` « Approximation affine » : écritures (nombre à estimer, f, f′, a, h),
 * consignes, champs, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du
 * corrigé.
 */

type E = ExerciceApproximationAffine;
export type PhaseApproximationAffine = "ah" | "derivee" | "valeurs" | "approx" | "erreur";
export const PHASES: PhaseApproximationAffine[] = ["ah", "derivee", "valeurs", "approx", "erreur"];

// ============================================================================
// Écritures.
// ============================================================================

/** Nom de la fonction (f, V ou A). */
export const nomF = (e: E): string => (e.contexte === "cube" ? "V" : e.contexte === "carre" ? "A" : "f");

/** a en LaTeX (« 4 », « \pi », « \dfrac{\pi}{2} »). */
export function aL(e: E): string {
  if (e.aPi === 1) return "\\pi";
  if (e.aPi === 0.5) return "\\dfrac{\\pi}{2}";
  return decL(e.a);
}

/** a en texte brut. */
export const aT = (e: E): string => (e.aPi === 1 ? "π" : e.aPi === 0.5 ? "π/2" : decT(e.a));

/** Argument a + h (trigo : « \pi+0{,}1 » ; sinon le décimal N). */
export function argumentL(e: E): string {
  if (e.fn === "sin" || e.fn === "cos" || e.fn === "tan") {
    if (e.aPi === 0) return decL(e.h);
    const a = e.aPi === 1 ? "\\pi" : "\\tfrac{\\pi}{2}";
    return `${a}${e.h < 0 ? "-" : "+"}${decL(Math.abs(e.h))}`;
  }
  return decL(nombre(e));
}

/** Nombre à estimer (« \sqrt{4{,}02} », « 1{,}02^{5} », « \dfrac{1}{0{,}98} », « \sin(0{,}1) », « V(5{,}02) »). */
export function nombreL(e: E): string {
  if (e.contexte) return `${nomF(e)}(${argumentL(e)})`;
  switch (e.fn) {
    case "racine":
      return `\\sqrt{${argumentL(e)}}`;
    case "puissance":
      return `${argumentL(e)}^{${e.n}}`;
    case "inverse":
      return `\\dfrac{1}{${argumentL(e)}}`;
    default:
      return `\\${e.fn}(${argumentL(e)})`;
  }
}

/** Expression de f (sans « f(x) = »). */
export function exprF(e: E): string {
  switch (e.fn) {
    case "racine":
      return "\\sqrt{x}";
    case "puissance":
      return `x^{${e.n}}`;
    case "inverse":
      return "\\dfrac{1}{x}";
    default:
      return `\\${e.fn} x`;
  }
}

/** Expression de f′ (sans « f′(x) = »). */
export function exprFp(e: E): string {
  switch (e.fn) {
    case "racine":
      return "\\dfrac{1}{2\\sqrt{x}}";
    case "puissance":
      return e.n === 2 ? "2x" : `${e.n}x^{${e.n - 1}}`;
    case "inverse":
      return "-\\dfrac{1}{x^2}";
    case "sin":
      return "\\cos x";
    case "cos":
      return "-\\sin x";
    case "tan":
      return "\\dfrac{1}{\\cos^2 x}";
  }
}

export const fL = (e: E): string => `${nomF(e)}(x)=${exprF(e)}`;
export const fpL = (e: E): string => `${nomF(e)}'(x)=${exprFp(e)}`;

/** Unité du contexte (cm³, cm²) ; vide hors contexte. */
export const unite = (e: E): string => (e.contexte === "cube" ? "cm³" : e.contexte === "carre" ? "cm²" : "");
export const uniteL = (e: E): string => (e.contexte === "cube" ? "\\text{ cm}^3" : e.contexte === "carre" ? "\\text{ cm}^2" : "");

/** « 2{,}004993766 » (valeur de la calculatrice). */
export const calculatriceL = (e: E): string => decL(valeurCalculatrice(e).valeur, 9);
/** Relation entre le nombre et la valeur affichée (« = » si exacte, « ≈ » sinon). */
export const relationCalculatrice = (e: E): string => (valeurCalculatrice(e).exacte ? "=" : "\\approx");

/** Phrase du contexte (sans la question). */
function phraseContexte(e: E): Frag[] {
  const d = decT(Math.abs(e.h));
  if (e.contexte === "cube")
    return [
      tx(`Un cube de métal a une arête de ${decT(e.a)} cm. ${e.h > 0 ? `Chauffé, il se dilate : son arête s'allonge de ${d} cm.` : `Refroidi, il se contracte : son arête raccourcit de ${d} cm.`} Son volume (en cm³) est `),
      lx("V(x)=x^3"),
      tx(", où x est la longueur de l'arête en cm."),
    ];
  return [
    tx(`Une plaque de métal carrée a un côté de ${decT(e.a)} cm. ${e.h > 0 ? `Chauffée, elle se dilate : son côté s'allonge de ${d} cm.` : `Refroidie, elle se contracte : son côté raccourcit de ${d} cm.`} Son aire (en cm²) est `),
    lx("A(x)=x^2"),
    tx(", où x est la longueur du côté en cm."),
  ];
}

const estTrigo = (e: E) => e.fn === "sin" || e.fn === "cos" || e.fn === "tan";

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseApproximationAffine, string> = {
  ah: "Point a et écart h",
  derivee: "Fonction dérivée",
  valeurs: "Valeur et pente en a",
  approx: "Approximation affine",
  erreur: "Erreur commise",
};

export const libelle = (_e: E, p: PhaseApproximationAffine): string => LIBELLES[p];

export function consigneGenerale(e: E): Frag[] {
  if (e.contexte) return [...phraseContexte(e), tx(e.contexte === "cube" ? " On veut estimer son nouveau volume sans calculatrice, à l'aide de la tangente." : " On veut estimer sa nouvelle aire sans calculatrice, à l'aide de la tangente.")];
  return [tx("On veut estimer "), lx(nombreL(e)), tx(" sans calculatrice, à l'aide de l'approximation affine de "), lx(fL(e)), tx(estTrigo(e) ? " (x en radians) près d'un nombre a bien choisi : " : " près d'un nombre a bien choisi : "), lx(`${nomF(e)}(a+h)\\approx ${nomF(e)}(a)+${nomF(e)}'(a)\\cdot h`), tx(".")];
}

export function consigne(e: E, p: PhaseApproximationAffine): Frag[] {
  const F = nomF(e);
  if (p === "ah") {
    if (e.contexte) return [tx(`Écris la nouvelle longueur sous la forme a + h : a est la longueur de départ et h sa variation (positive ou négative). Donne a et h.`)];
    return [tx("Écris le nombre sous la forme "), lx(`${F}(a+h)`), tx(" : a est un nombre proche où "), lx(`${F}(a)`), tx(" et "), lx(`${F}'(a)`), tx(" se calculent sans calculatrice, et h est l'écart (petit, positif ou négatif). Donne a et h.")];
  }
  if (p === "derivee") return [tx("Calcule la fonction dérivée "), lx(`${F}'(x)`), tx(".")];
  if (p === "valeurs") return [tx("Calcule la valeur "), lx(`${F}(${aL(e)})`), tx(" et la pente de la tangente "), lx(`${F}'(${aL(e)})`), tx(", en valeurs exactes.")];
  if (p === "approx") {
    if (e.contexte) return [tx(e.contexte === "cube" ? "Estime le nouveau volume " : "Estime la nouvelle aire "), lx(`${nombreL(e)}\\approx ${F}(a)+${F}'(a)\\cdot h`), tx(".")];
    return [tx("Calcule l'approximation affine "), lx(`${nombreL(e)}\\approx ${F}(a)+${F}'(a)\\cdot h`), tx(".")];
  }
  if (e.contexte)
    return [
      tx("La valeur exacte est "),
      lx(`${nombreL(e)}=${calculatriceL(e)}${uniteL(e)}`),
      tx(". Calcule l'erreur commise, c'est-à-dire l'écart entre cette valeur et ton estimation, à deux chiffres significatifs."),
    ];
  return [
    tx("La calculatrice affiche "),
    lx(`${nombreL(e)}${relationCalculatrice(e)}${calculatriceL(e)}`),
    tx(". Calcule l'erreur commise, c'est-à-dire l'écart entre cette valeur et ton approximation, à deux chiffres significatifs."),
  ];
}

const RACCOURCIS_F = [
  { libelle: "x", texte: "x" },
  { libelle: "√", texte: "√(" },
  { libelle: "/", texte: "/" },
  { libelle: "( )", texte: "()" },
];

export function champs(e: E, p: PhaseApproximationAffine): ChampEcran[] {
  const F = nomF(e);
  if (p === "ah")
    return [
      { label: "a", labelLatex: "a=", placeholder: estTrigo(e) ? "ex. : 0 ou π" : "ex. : 9", unite: e.contexte ? "cm" : undefined, raccourcis: estTrigo(e) ? [{ libelle: "π", texte: "π" }] : undefined },
      { label: "h", labelLatex: "h=", placeholder: "ex. : −0,03", unite: e.contexte ? "cm" : undefined },
    ];
  if (p === "derivee")
    return [
      {
        label: `${F}′(x)`,
        labelLatex: `${F}'(x)=`,
        placeholder: estTrigo(e) ? "ex. : −sin x" : "ex. : 4x³ ou 1/(2√x)",
        apercu: !estTrigo(e),
        raccourcis: estTrigo(e) ? [{ libelle: "sin", texte: "sin x" }, { libelle: "cos", texte: "cos x" }, { libelle: "/", texte: "/" }, { libelle: "²", texte: "²" }] : RACCOURCIS_F,
      },
    ];
  if (p === "valeurs")
    return [
      { label: `${F}(${aT(e)})`, labelLatex: `${F}(${aL(e)})=`, placeholder: "ex. : 3", unite: unite(e) || undefined },
      { label: `${F}′(${aT(e)})`, labelLatex: `${F}'(${aL(e)})=`, placeholder: "ex. : 0,5 ou 1/4" },
    ];
  if (p === "approx") return [{ label: nombreT(e), labelLatex: `${nombreL(e)}\\approx`, placeholder: "ex. : 3,012", unite: unite(e) || undefined }];
  return [{ label: "Erreur commise", labelLatex: "\\text{erreur}\\approx", placeholder: "ex. : 0,00041 ou 4,1·10^-4", unite: unite(e) || undefined }];
}

/** Texte brut du nombre à estimer (aria-label). */
export function nombreT(e: E): string {
  const N = decT(nombre(e));
  if (e.contexte) return `${nomF(e)}(${N})`;
  if (e.fn === "racine") return `√${N}`;
  if (e.fn === "puissance") return `${N} puissance ${e.n}`;
  if (e.fn === "inverse") return `1/${N}`;
  return `${e.fn}(${e.aPi === 0 ? decT(e.h) : `${aT(e)} ${e.h < 0 ? "−" : "+"} ${decT(Math.abs(e.h))}`})`;
}

export function aide1(e: E, p: PhaseApproximationAffine): AideEcran {
  const F = nomF(e);
  if (p === "ah") {
    if (e.contexte) return { texte: [tx("La longueur de départ est connue : c'est a. La variation h est positive si la longueur augmente, négative si elle diminue.")] };
    if (e.fn === "racine") return { texte: [tx("Choisis pour a un carré parfait proche du nombre sous la racine : sa racine se calcule de tête. Puis h est ce qu'il faut ajouter à a pour retrouver ce nombre.")] };
    if (estTrigo(e)) return { texte: [tx("Choisis pour a un angle remarquable (0, π/2 ou π) dont le sinus, le cosinus ou la tangente sont connus ; h est le petit écart restant.")] };
    return { texte: [tx("Choisis pour a l'entier le plus proche du nombre ; h est ce qu'il faut lui ajouter :")], latex: `${argumentL(e)}=a+h` };
  }
  if (p === "derivee") return { texte: [tx("Utilise le tableau des dérivées de référence (cours, § 3).")] };
  if (p === "valeurs") return { texte: [tx("Remplace x par a dans "), lx(`${F}(x)`), tx(" puis dans "), lx(`${F}'(x)`), tx(".")] };
  if (p === "approx") return { texte: [tx("La tangente en a remplace la courbe près de a :")], latex: `${F}(a+h)\\approx ${F}(a)+${F}'(a)\\cdot h` };
  return { texte: [tx("L'erreur est l'écart entre la valeur exacte (ou celle de la calculatrice) et l'approximation, pris positivement :")], latex: "\\text{erreur}=\\left|\\,\\text{valeur exacte}-\\text{approximation}\\,\\right|" };
}

export function aide2(e: E, p: PhaseApproximationAffine): AideEcran | null {
  const F = nomF(e);
  if (p === "ah") {
    if (e.fn === "racine" && !e.contexte) return { texte: [tx("Ici le carré parfait le plus proche est "), lx(`${e.a}=${Math.sqrt(e.a)}^2`), tx(" ; calcule l'écart :")], latex: `h=${argumentL(e)}-${e.a}` };
    if (estTrigo(e)) return { texte: [tx("L'angle s'écrit déjà « angle remarquable + écart » ; si aucun angle n'apparaît, c'est que a = 0.")] };
    return { texte: [tx("Ici "), lx(`a=${aL(e)}`), tx(" ; l'écart se calcule par une soustraction :")], latex: `h=${argumentL(e)}-${aL(e)}` };
  }
  if (p === "derivee") {
    if (e.fn === "racine") return { texte: [tx("La dérivée de la racine carrée est :")], latex: "(\\sqrt{x})'=\\dfrac{1}{2\\sqrt{x}}" };
    if (e.fn === "puissance") return { texte: [tx("Pour une puissance, l'exposant passe devant et diminue de 1 :")], latex: "(x^n)'=n\\,x^{n-1}" };
    if (e.fn === "inverse") return { texte: [tx("La dérivée de l'inverse est négative :")], latex: "\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^2}" };
    if (e.fn === "tan") return { texte: [tx("La dérivée de la tangente est :")], latex: "(\\tan x)'=\\dfrac{1}{\\cos^2 x}" };
    return { texte: [tx("Les dérivées de sinus et cosinus (x en radians) sont :")], latex: "(\\sin x)'=\\cos x\\qquad(\\cos x)'=-\\sin x" };
  }
  if (p === "valeurs") return { texte: [tx("Il reste à remplacer x par "), lx(aL(e)), tx(" dans :")], latex: `${F}(x)=${exprF(e)}\\qquad ${F}'(x)=${exprFp(e)}` };
  if (p === "approx") return { texte: [tx("Remplace par tes valeurs, puis effectue le produit avant la somme :")], latex: `${nombreL(e)}\\approx ${decL(fa(e))}+${parD(fpa(e))}\\cdot ${parD(e.h)}` };
  return { texte: [tx("Soustrais les deux nombres, prends la valeur absolue, puis garde deux chiffres significatifs (les deux premiers chiffres non nuls) :")], latex: `\\left|${calculatriceL(e)}-${parD(approximation(e))}\\right|` };
}

export function reponse(e: E, p: PhaseApproximationAffine): Frag[] {
  const F = nomF(e);
  if (p === "ah") return [lx(`a=${aL(e)}`), tx(" et "), lx(`h=${decL(e.h)}`)];
  if (p === "derivee") return [lx(fpL(e))];
  if (p === "valeurs") return [lx(`${F}(${aL(e)})=${decL(fa(e))}`), tx(" et "), lx(`${F}'(${aL(e)})=${decL(fpa(e))}`)];
  if (p === "approx") return [lx(`${nombreL(e)}\\approx ${decL(approximation(e))}${uniteL(e)}`)];
  return [lx(`\\text{erreur}\\approx ${sciL(erreur(e))}${uniteL(e)}`)];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseApproximationAffine): string {
  if (p === "derivee")
    return estTrigo(e)
      ? "Expression non reconnue : écris par exemple cos x, −sin x ou 1/cos²x. Cette saisie ne compte pas comme une tentative."
      : "Expression non reconnue : écris par exemple 5x^4, −1/x^2 ou 1/(2√x). Cette saisie ne compte pas comme une tentative.";
  if (p === "erreur") return "Nombre non reconnu : écris par exemple 0,00041 ou 4,1·10^-4. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre, par exemple 4, −0,03, 1/4 ou π. Cette saisie ne compte pas comme une tentative.";
}
