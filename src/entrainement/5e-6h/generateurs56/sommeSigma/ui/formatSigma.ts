import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceSigma, Terme } from "../index";
import { nombreTermes, partieGeo, sommeDe, termesDe, totalMixte, valeurTerme } from "../index";

/**
 * Couche C — textes de `56gen21` « Calculer avec le symbole Σ » (notations du cours, étape 7 :
 * Σ_{i=1}^{n} uᵢ se lit « somme, pour i allant de 1 à n, de uᵢ » ; Sₙ = n(u₁ + uₙ)/2 ;
 * étape 8 : S = u₁(1 − qⁿ)/(1 − q)). Source unique de l'écran, des aides, du corrigé et du papier.
 */

type E = ExerciceSigma;
export type PhaseSigma =
  | "terme"
  | "borne"
  | "valeur"
  | "nbTermes"
  | "extremes"
  | "nature"
  | "elements"
  | "partieGeo"
  | "partieArith"
  | "total"
  | "extremesN"
  | "sommeN"
  | "nouvelleBorne"
  | "nouveauTerme";

export const COURS_SIGMA = "(cours, § 7)";
export const COURS_GEO = "(cours, § 8)";

export function phasesSigma(e: E): PhaseSigma[] {
  switch (e.variante) {
    case "ecrire":
      return ["terme", "borne", "valeur"];
    case "developper":
      return ["nbTermes", "extremes", "valeur"];
    case "uneSuite":
      return ["nature", "elements", "valeur"];
    case "mixte":
      return ["partieGeo", "partieArith", "total"];
    case "litteral":
      return ["extremesN", "sommeN"];
    case "changementIndice":
      return ["nouvelleBorne", "nouveauTerme", "valeur"];
  }
}

/* ------------------------------------------------------------------------------------------------
 * Écritures
 * ---------------------------------------------------------------------------------------------- */

/** Entier en LaTeX, entre parenthèses s'il est négatif. */
export const parL = (x: number) => (x < 0 ? `(${x})` : `${x}`);
/** « + 3 » / « - 3 » devant un terme. */
const signeL = (x: number) => (x < 0 ? `-${-x}` : `+${x}`);
/** Coefficient devant une lettre : « 3i », « -i », « i ». */
export function monomeL(a: number, v: string): string {
  if (a === 1) return v;
  if (a === -1) return `-${v}`;
  return `${a}${v}`;
}
/** a·v + b, écrit « b − |a|v » quand a < 0 < b (comme le cours : 1 − 2i). */
export function affineL(a: number, b: number, v: string): string {
  if (b === 0) return monomeL(a, v);
  if (a === 0) return `${b}`;
  if (a < 0 && b > 0) return `${b}-${monomeL(-a, v)}`;
  return `${monomeL(a, v)}${signeL(b)}`;
}
/** c·q^{exposant} (q entre parenthèses s'il est négatif). */
export function geoL(c: number, q: number, exposant: string): string {
  const base = q < 0 ? `(${q})` : `${q}`;
  const puissance = `${base}^{${exposant}}`;
  return c === 1 ? puissance : `${c}\\cdot ${puissance}`;
}

/** Terme général en la variable v (sans parenthèses). */
export function termeL(t: Terme, v = "i"): string {
  switch (t.kind) {
    case "arith":
      return affineL(t.a, t.b, v);
    case "geo":
      return geoL(t.c, t.q, t.s === 0 ? v : `${v}-${t.s}`);
    case "carrePlus":
      return `${v}^2${signeL(t.b)}`;
    case "produit":
      return `${v}(${v}+${t.b})`;
    case "deuxPuissanceMoinsI":
      return `2^{${v}}-${v}`;
    case "alterne":
      return `(-1)^{${v}}\\cdot ${v}`;
  }
}

/** Terme général tel qu'il s'écrit derrière Σ (entre parenthèses s'il a plusieurs termes). */
export function termeSousSigmaL(t: Terme, v = "i"): string {
  return t.kind === "geo" ? termeL(t, v) : `\\left(${termeL(t, v)}\\right)`;
}

export const sigmaL = (k: number | string, m: number | string, corps: string, v = "i") => `\\sum\\limits_{${v}=${k}}^{${m}}${corps}`;

/** Σ de l'énoncé. */
export function sommeEnonceL(e: E): string {
  if (e.variante === "mixte") return sigmaL(1, e.m, `\\left(${geoL(e.geo!.c, e.geo!.q, "i")}+${termeL(e.terme)}\\right)`);
  if (e.variante === "litteral") return sigmaL(1, "n", termeSousSigmaL(e.terme));
  return sigmaL(e.k, e.m, termeSousSigmaL(e.terme));
}

/** Somme en extension : « 5 + 8 + 11 + ⋯ + 62 » (négatifs entre parenthèses). */
export function extensionL(e: E): string {
  const t = termesDe(e);
  return `${t[0]}+${parL(t[1])}+${parL(t[2])}+\\cdots+${parL(t[t.length - 1])}`;
}

/** Terme de la suite uᵢ = terme(i) — nom de la suite dans les calculs. */
export const uL = (i: number | string) => `u_{${i}}`;

/* ------------------------------------------------------------------------------------------------
 * Énoncé
 * ---------------------------------------------------------------------------------------------- */

export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "ecrire":
      return [tx("On considère la somme "), lx(`S=${extensionL(e)}`), tx(`, dont les termes forment une suite ${e.terme.kind === "arith" ? "arithmétique" : "géométrique"}.`)];
    case "mixte":
      return [tx("On considère la somme "), lx(`S=${sommeEnonceL(e)}`), tx(".")];
    case "litteral":
      return [tx("On considère la somme "), lx(`S_n=${sommeEnonceL(e)}`), tx(", où "), lx("n"), tx(" est un naturel non nul.")];
    case "changementIndice":
      return [tx("On considère la somme "), lx(`S=${sommeEnonceL(e)}`), tx(". On veut l'écrire avec un indice "), lx("j"), tx(" qui commence à 1.")];
    default:
      return [tx("On considère la somme "), lx(`S=${sommeEnonceL(e)}`), tx(".")];
  }
}

export const consigneGenerale = situation;

export function libelle(e: E, phase: PhaseSigma): string {
  switch (phase) {
    case "terme":
      return "Terme général";
    case "borne":
      return "Borne supérieure";
    case "valeur":
      return "Valeur de la somme";
    case "nbTermes":
      return "Nombre de termes";
    case "extremes":
      return "Premier et dernier termes";
    case "nature":
      return "Nature des termes";
    case "elements":
      return e.terme.kind === "geo" ? "Premier terme, raison, nombre de termes" : "Premier et dernier termes, nombre de termes";
    case "partieGeo":
      return "Partie géométrique";
    case "partieArith":
      return "Partie arithmétique";
    case "total":
      return "Valeur de la somme";
    case "extremesN":
      return "Premier et dernier termes";
    case "sommeN":
      return "Somme en fonction de n";
    case "nouvelleBorne":
      return "Nouvelle borne";
    case "nouveauTerme":
      return "Nouveau terme général";
  }
}

export function consigne(e: E, phase: PhaseSigma): Frag[] {
  switch (phase) {
    case "terme":
      return [tx("Écris le terme général "), lx("u_i"), tx(" de cette somme en fonction de "), lx("i"), tx(", l'indice "), lx("i"), tx(" allant de 1 à "), lx("n"), tx(" (le premier terme est "), lx("u_1"), tx(").")];
    case "borne":
      return [tx("Combien la somme a-t-elle de termes ? Déduis-en la borne supérieure "), lx("n"), tx(" dans "), lx(`S=${sigmaL(1, "n", "u_i")}`), tx(".")];
    case "valeur":
      return [tx("Calcule la valeur de la somme "), lx("S"), tx(".")];
    case "nbTermes":
      return [tx("Combien de termes compte cette somme ?")];
    case "extremes":
      return [tx("Écris le premier et le dernier terme de la somme.")];
    case "nature":
      return [tx("Les termes de cette somme forment-ils une suite arithmétique, une suite géométrique, ou ni l'une ni l'autre ?")];
    case "elements":
      return e.terme.kind === "geo" ? [tx("Donne le premier terme de la somme, la raison et le nombre de termes.")] : [tx("Donne le premier terme de la somme, son dernier terme et le nombre de termes.")];
    case "partieGeo":
      return [tx("Sépare la somme en deux (linéarité) et calcule d'abord la partie géométrique "), lx(sigmaL(1, e.m, geoL(e.geo!.c, e.geo!.q, "i"))), tx(".")];
    case "partieArith":
      return [tx("Calcule ensuite la partie arithmétique "), lx(sigmaL(1, e.m, termeSousSigmaL(e.terme))), tx(".")];
    case "total":
      return [tx("Déduis-en la valeur de "), lx("S"), tx(".")];
    case "extremesN":
      return [tx("Écris le premier terme de la somme, puis son dernier terme en fonction de "), lx("n"), tx(".")];
    case "sommeN":
      return [tx("Calcule "), lx("S_n"), tx(" en fonction de "), lx("n"), tx(".")];
    case "nouvelleBorne":
      return [tx("On pose "), lx(`j=i${e.k === 1 ? "" : signeL(1 - e.k)}`), tx(" pour que "), lx("j"), tx(" commence à 1. Jusqu'où va "), lx("j"), tx(" ?")];
    case "nouveauTerme":
      return [tx("Écris le terme général en fonction de "), lx("j"), tx(" : "), lx(`S=${sigmaL(1, nombreTermes(e), "\\,\\ldots", "j")}`), tx(".")];
  }
}

export const OPTIONS_NATURE: OptionEcran[] = [
  { id: "arith", fragments: [tx("Une suite arithmétique")] },
  { id: "geo", fragments: [tx("Une suite géométrique")] },
  { id: "aucune", fragments: [tx("Ni l'une ni l'autre")] },
];

export function champs(e: E, phase: PhaseSigma): ChampEcran[] {
  switch (phase) {
    case "terme":
      return [{ label: "terme général u_i", labelLatex: "u_i=", placeholder: "ex. : 4i + 1", apercu: true }];
    case "borne":
      return [{ label: "borne supérieure n", labelLatex: "n=", placeholder: "ex. : 15" }];
    case "valeur":
    case "total":
      return [{ label: "valeur de S", labelLatex: "S=", placeholder: "ex. : 345" }];
    case "nbTermes":
      return [{ label: "nombre de termes", labelLatex: "\\text{nombre de termes}=", placeholder: "ex. : 6" }];
    case "extremes":
      return [
        { label: "premier terme", labelLatex: `${uL(e.k)}=`, placeholder: "ex. : 4" },
        { label: "dernier terme", labelLatex: `${uL(e.m)}=`, placeholder: "ex. : 39" },
      ];
    case "elements":
      return e.terme.kind === "geo"
        ? [
            { label: "premier terme", labelLatex: "\\text{premier terme}=", placeholder: "ex. : 6" },
            { label: "raison", labelLatex: "q=", placeholder: "ex. : 2" },
            { label: "nombre de termes", labelLatex: "\\text{nombre de termes}=", placeholder: "ex. : 7" },
          ]
        : [
            { label: "premier terme", labelLatex: "\\text{premier terme}=", placeholder: "ex. : 5" },
            { label: "dernier terme", labelLatex: "\\text{dernier terme}=", placeholder: "ex. : 62" },
            { label: "nombre de termes", labelLatex: "\\text{nombre de termes}=", placeholder: "ex. : 20" },
          ];
    case "partieGeo":
      return [{ label: "partie géométrique", labelLatex: "\\text{partie géométrique}=", placeholder: "ex. : 1 020" }];
    case "partieArith":
      return [{ label: "partie arithmétique", labelLatex: "\\text{partie arithmétique}=", placeholder: "ex. : 56" }];
    case "extremesN":
      return [
        { label: "premier terme", labelLatex: "u_1=", placeholder: "ex. : 7" },
        { label: "dernier terme en fonction de n", labelLatex: "u_n=", placeholder: "ex. : 3n + 4", apercu: true },
      ];
    case "sommeN":
      return [{ label: "somme en fonction de n", labelLatex: "S_n=", placeholder: "ex. : n(3n + 5)/2", apercu: true }];
    case "nouvelleBorne":
      return [{ label: "borne supérieure de j", labelLatex: "j\\ \\text{va jusqu'à}", placeholder: "ex. : 12" }];
    case "nouveauTerme":
      return [{ label: "terme général en fonction de j", labelLatex: "\\text{terme}=", placeholder: "ex. : 2j + 7", apercu: true }];
    default:
      return [];
  }
}

/* ------------------------------------------------------------------------------------------------
 * Aides (deux niveaux : propriété du cours, puis posée pour l'instance — jamais la réponse)
 * ---------------------------------------------------------------------------------------------- */

const aideArith: AideEcran = { texte: [tx(`Somme de termes consécutifs d'une suite arithmétique ${COURS_SIGMA} :`)], latex: "S=\\dfrac{\\text{nombre de termes}\\times(\\text{premier}+\\text{dernier})}{2}" };
const aideGeo: AideEcran = { texte: [tx(`Somme de termes consécutifs d'une suite géométrique de raison q ≠ 1 ${COURS_GEO} :`)], latex: "S=\\text{premier terme}\\times\\dfrac{1-q^{\\text{nombre de termes}}}{1-q}" };

export function aide1(e: E, phase: PhaseSigma): AideEcran {
  switch (phase) {
    case "terme":
      return e.terme.kind === "arith"
        ? { texte: [tx(`Les termes forment une suite arithmétique : le terme de rang i vaut le premier terme plus (i − 1) fois la raison ${COURS_SIGMA} :`)], latex: "u_i=u_1+(i-1)\\,r" }
        : { texte: [tx(`Les termes forment une suite géométrique : le terme de rang i vaut le premier terme multiplié par la raison à la puissance i − 1 ${COURS_GEO} :`)], latex: "u_i=u_1\\cdot q^{\\,i-1}" };
    case "borne":
      return { texte: [tx("Le dernier terme est "), lx("u_n"), tx(" : écris l'équation qui dit que le terme de rang "), lx("n"), tx(" est égal au dernier terme, puis résous-la.")] };
    case "valeur":
      if (e.variante === "developper") return { texte: [tx("Écris tous les termes (remplace i par chaque entier entre les bornes), puis additionne-les.")] };
      return e.terme.kind === "arith" ? aideArith : aideGeo;
    case "nbTermes":
      return { texte: [tx("De i = k à i = m, il y a m − k + 1 entiers (on compte les deux bornes) :")], latex: "\\text{nombre de termes}=m-k+1" };
    case "extremes":
      return { texte: [tx("Le premier terme s'obtient en remplaçant i par la borne inférieure, le dernier en remplaçant i par la borne supérieure.")] };
    case "nature":
      return { texte: [tx("Calcule la différence et le quotient de deux termes consécutifs : si la différence est constante, la suite est arithmétique ; si le quotient est constant, elle est géométrique.")] };
    case "elements":
      return { texte: [tx("Remplace i par la borne inférieure pour le premier terme ; le nombre de termes de i = k à i = m est m − k + 1.")] };
    case "partieGeo":
      return { texte: [tx(`La somme d'une somme est la somme des sommes (linéarité) ; la partie géométrique a pour premier terme sa valeur en i = 1 ${COURS_GEO} :`)], latex: "\\sum\\limits_{i=1}^{N}c\\,q^{i}=c\\,q\\cdot\\dfrac{1-q^{N}}{1-q}" };
    case "partieArith":
      return aideArith;
    case "total":
      return { texte: [tx("Par linéarité, la somme cherchée est la somme des deux parties :")], latex: "\\sum\\limits_{i=1}^{N}(a_i+b_i)=\\sum\\limits_{i=1}^{N}a_i+\\sum\\limits_{i=1}^{N}b_i" };
    case "extremesN":
      return { texte: [tx("Remplace i par 1 pour le premier terme, par n pour le dernier.")] };
    case "sommeN":
      return e.terme.kind === "arith" ? { ...aideArith, texte: [tx(`La somme a n termes ; somme d'une suite arithmétique ${COURS_SIGMA} :`)] } : { ...aideGeo, texte: [tx(`La somme a n termes ; somme d'une suite géométrique ${COURS_GEO} :`)] };
    case "nouvelleBorne":
      return { texte: [tx("Remplace i par la borne supérieure dans la relation entre j et i. Le nombre de termes ne change pas.")] };
    case "nouveauTerme":
      return { texte: [tx("Exprime i en fonction de j, puis remplace i par cette expression dans le terme général.")] };
  }
}

export function aide2(e: E, phase: PhaseSigma): AideEcran | null {
  const t = termesDe(e);
  switch (phase) {
    case "terme":
      return e.terme.kind === "arith" ? { texte: [tx("Ici, le premier terme est "), lx(`${t[0]}`), tx(" et la raison vaut "), lx(`${t[1]}-${parL(t[0])}`), tx(".")] } : { texte: [tx("Ici, le premier terme est "), lx(`${t[0]}`), tx(" et la raison vaut "), lx(`\\dfrac{${t[1]}}{${t[0]}}`), tx(".")] };
    case "borne":
      return e.terme.kind === "arith"
        ? { texte: [tx("Ici :")], latex: `${t[0]}+(n-1)\\cdot ${parL(t[1] - t[0])}=${t[t.length - 1]}` }
        : { texte: [tx("Ici :")], latex: `${t[0]}\\cdot ${parL(t[1] / t[0])}^{\\,n-1}=${t[t.length - 1]}` };
    case "valeur":
      if (e.variante === "developper") return { texte: [tx("Ici, les termes sont :")], latex: t.map(parL).join(";\\ ") };
      if (e.variante === "changementIndice" || e.variante === "uneSuite" || e.variante === "ecrire") {
        return e.terme.kind === "arith"
          ? { texte: [tx("Ici, avec "), lx(`${nombreTermes(e)}`), tx(" termes :")], latex: `S=\\dfrac{${nombreTermes(e)}\\cdot(${t[0]}+${parL(t[t.length - 1])})}{2}` }
          : { texte: [tx("Ici, avec "), lx(`${nombreTermes(e)}`), tx(" termes :")], latex: `S=${t[0]}\\cdot\\dfrac{1-${parL((e.terme as { q: number }).q)}^{${nombreTermes(e)}}}{1-${parL((e.terme as { q: number }).q)}}` };
      }
      return null;
    case "nbTermes":
      return { texte: [tx("Ici, i va de "), lx(`${e.k}`), tx(" à "), lx(`${e.m}`), tx(".")] };
    case "extremes":
      return { texte: [tx("Ici :")], latex: `${uL(e.k)}=${termeAvecL(e.terme, e.k)}\\qquad ${uL(e.m)}=${termeAvecL(e.terme, e.m)}` };
    case "nature":
      return { texte: [tx("Ici, les premiers termes sont "), lx(t.slice(0, 3).map(parL).join(";\\ ")), tx(".")] };
    case "elements":
      return { texte: [tx("Ici, i va de "), lx(`${e.k}`), tx(" à "), lx(`${e.m}`), tx(" ; premier terme : "), lx(termeAvecL(e.terme, e.k)), tx(".")] };
    case "partieGeo":
      return { texte: [tx("Ici :")], latex: `${sigmaL(1, e.m, geoL(e.geo!.c, e.geo!.q, "i"))}=${e.geo!.c * e.geo!.q}\\cdot\\dfrac{1-${e.geo!.q}^{${e.m}}}{1-${e.geo!.q}}` };
    case "partieArith":
      return { texte: [tx("Ici, "), lx(`${e.m}`), tx(" termes, de "), lx(`${t[0]}`), tx(" à "), lx(`${t[t.length - 1]}`), tx(".")] };
    case "total":
      return null;
    case "extremesN":
      return { texte: [tx("Ici :")], latex: `u_1=${termeAvecL(e.terme, 1)}\\qquad u_n=${termeL(e.terme, "n")}` };
    case "sommeN":
      return e.terme.kind === "arith"
        ? { texte: [tx("Ici :")], latex: `S_n=\\dfrac{n\\left(${valeurTerme(e.terme, 1)}+${termeL(e.terme, "n").startsWith("-") ? `(${termeL(e.terme, "n")})` : termeL(e.terme, "n")}\\right)}{2}` }
        : { texte: [tx("Ici :")], latex: `S_n=${valeurTerme(e.terme, 1)}\\cdot\\dfrac{1-${(e.terme as { q: number }).q}^{n}}{1-${(e.terme as { q: number }).q}}` };
    case "nouvelleBorne":
      return { texte: [tx("Ici, pour "), lx(`i=${e.m}`), tx(" :")], latex: `j=${e.m}${signeL(1 - e.k)}` };
    case "nouveauTerme":
      return { texte: [tx("Ici :")], latex: `i=j${signeL(e.k - 1)}` };
  }
}

/** Terme général évalué en i = valeur, substitution écrite : « 3\cdot 4+2 ». */
export function termeAvecL(t: Terme, i: number): string {
  const p = parL(i);
  switch (t.kind) {
    case "arith":
      return `${t.a === 1 ? "" : t.a === -1 ? "-" : `${t.a}\\cdot `}${p}${signeL(t.b)}`;
    case "geo":
      return `${t.c === 1 ? "" : `${t.c}\\cdot `}${parL(t.q)}^{${t.s === 0 ? i : i - t.s}}`;
    case "carrePlus":
      return `${p}^2${signeL(t.b)}`;
    case "produit":
      return `${p}\\cdot(${i}+${t.b})`;
    case "deuxPuissanceMoinsI":
      return `2^{${i}}-${p}`;
    case "alterne":
      return `(-1)^{${i}}\\cdot ${p}`;
  }
}

export function messageIllisible(_e: E, phase: PhaseSigma): string {
  if (phase === "terme") return "Expression non reconnue : écris le terme en fonction de i, par exemple 4i + 1 ou 3·2^(i−1). Cette saisie ne compte pas comme une tentative.";
  if (phase === "nouveauTerme") return "Expression non reconnue : écris le terme en fonction de j, par exemple 2j + 7 ou 3·2^(j+1). Cette saisie ne compte pas comme une tentative.";
  if (phase === "extremesN" || phase === "sommeN") return "Expression non reconnue : écris une expression en n, par exemple 3n + 4 ou n(3n + 5)/2. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre entier, par exemple 345 ou −12. Cette saisie ne compte pas comme une tentative.";
}

/* ------------------------------------------------------------------------------------------------
 * Réponses
 * ---------------------------------------------------------------------------------------------- */

/** Écriture simplifiée de Sₙ (arithmétique : n(an + a + 2b)/2 ; géométrique : cq(qⁿ − 1)/(q − 1)). */
export function sommeNL(t: Terme): string {
  if (t.kind === "arith") {
    const a = t.a;
    const c = t.a + 2 * t.b;
    if (a % 2 === 0 && c % 2 === 0) return c === 0 ? `${monomeL(a / 2, "n")}\\cdot n` : `n\\left(${affineL(a / 2, c / 2, "n")}\\right)`;
    return `\\dfrac{n\\left(${affineL(a, c, "n")}\\right)}{2}`;
  }
  if (t.kind === "geo") {
    const cq = t.c * t.q;
    const d = t.q - 1;
    if (cq % d === 0) {
      const f = cq / d;
      return f === 1 ? `${t.q}^{n}-1` : `${f}\\left(${t.q}^{n}-1\\right)`;
    }
    return `\\dfrac{${cq}\\left(${t.q}^{n}-1\\right)}{${d}}`;
  }
  return "";
}

/** Terme général g(j) = f(j + k − 1), simplifié. */
export function nouveauTermeL(e: E): string {
  const t = e.terme;
  if (t.kind === "arith") return affineL(t.a, t.a * (e.k - 1) + t.b, "j");
  if (t.kind === "geo") {
    const d = e.k - 1;
    return geoL(t.c, t.q, d === 0 ? "j" : `j${signeL(d)}`);
  }
  return termeL(t, "j");
}

export function bonneNature(e: E): string {
  return e.terme.kind === "arith" ? "arith" : e.terme.kind === "geo" ? "geo" : "aucune";
}

export function reponse(e: E, phase: PhaseSigma): Frag[] {
  const t = termesDe(e);
  switch (phase) {
    case "terme":
      return [lx(`u_i=${termeL(e.terme)}`)];
    case "borne":
      return [lx(`n=${e.m}`), tx(` (${e.m} termes)`)];
    case "valeur":
      return [lx(`S=${sommeDe(e)}`)];
    case "nbTermes":
      return [tx(`${nombreTermes(e)} termes`)];
    case "extremes":
      return [lx(`${uL(e.k)}=${t[0]}`), tx(" ; "), lx(`${uL(e.m)}=${t[t.length - 1]}`)];
    case "nature":
      return [tx(e.terme.kind === "arith" ? "Une suite arithmétique" : "Une suite géométrique"), tx(" de raison "), lx(e.terme.kind === "arith" ? `${(e.terme as { a: number }).a}` : `${(e.terme as { q: number }).q}`)];
    case "elements":
      return e.terme.kind === "geo"
        ? [tx("premier terme "), lx(`${t[0]}`), tx(", raison "), lx(`${e.terme.q}`), tx(", "), lx(`${nombreTermes(e)}`), tx(" termes")]
        : [tx("premier terme "), lx(`${t[0]}`), tx(", dernier terme "), lx(`${t[t.length - 1]}`), tx(", "), lx(`${nombreTermes(e)}`), tx(" termes")];
    case "partieGeo":
      return [lx(`${sigmaL(1, e.m, geoL(e.geo!.c, e.geo!.q, "i"))}=${partieGeo(e)}`)];
    case "partieArith":
      return [lx(`${sigmaL(1, e.m, termeSousSigmaL(e.terme))}=${sommeDe(e)}`)];
    case "total":
      return [lx(`S=${totalMixte(e)}`)];
    case "extremesN":
      return [lx(`u_1=${valeurTerme(e.terme, 1)}`), tx(" ; "), lx(`u_n=${termeL(e.terme, "n")}`)];
    case "sommeN":
      return [lx(`S_n=${sommeNL(e.terme)}`)];
    case "nouvelleBorne":
      return [tx("jusqu'à "), lx(`j=${nombreTermes(e)}`)];
    case "nouveauTerme":
      return [lx(`S=${sigmaL(1, nombreTermes(e), e.terme.kind === "geo" ? nouveauTermeL(e) : `\\left(${nouveauTermeL(e)}\\right)`, "j")}`)];
  }
}

export const recap = reponse;
