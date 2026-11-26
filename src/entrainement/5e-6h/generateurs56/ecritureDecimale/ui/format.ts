import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, ModeEcran, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { decomposer, decompositionL } from "../../communReels/outilsReels";
import { RACCOURCIS_DECOMPOSITION, apercuDecomposition } from "../../irrationaliteRacine/ui/format";
import { developpementL, lireDecimale } from "../core/decimales";
import { PHASES_PAR_VARIANTE } from "../core/types";
import type { ExerciceDecimale, PhaseDecimale } from "../core/types";

/**
 * Couche C — textes de `56gen16` « Écriture décimale et fraction » : consignes, options, aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance ; jamais la réponse), réponses. La période se
 * TAPE entre parenthèses (« 0,2(428571) ») et s'affiche avec la barre du cours. Source unique de
 * l'écran, du corrigé et du papier.
 */

type E = ExerciceDecimale;
type P = PhaseDecimale;

export const phases = (e: E): P[] => PHASES_PAR_VARIANTE[e.variante];

export const fracL = (n: number, d: number): string => (d === 1 ? `${n}` : `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`);
export const xL = (e: E): string => developpementL(e.dev);
/** « 1000x », « 10x », « x ». */
export const puissanceX = (a: number): string => (a === 0 ? "x" : `${10 ** a}x`);
/** Valeur de 10ᵃx (développement décalé), pour le corrigé : « 2136{,}\overline{36} ». */
export function decaleL(e: E, a: number): string {
  const d = e.dev;
  let chiffres = d.avant;
  while (chiffres.length < a) chiffres += d.periode;
  const ent = `${d.entier}${chiffres.slice(0, a)}`.replace(/^0+(?=\d)/, "");
  const reste = chiffres.slice(a);
  // Ce qui suit la virgule : le reste des chiffres non périodiques déjà lus, puis la période décalée.
  const k = d.avant.length;
  const p = d.periode.length;
  if (a >= k) {
    const decalage = (a - k) % p;
    const periode = d.periode.slice(decalage) + d.periode.slice(0, decalage);
    return `${ent}{,}\\overline{${periode}}`;
  }
  return `${ent}{,}${reste}\\overline{${d.periode}}`;
}
export const difference = (e: E): number => {
  const [a, b] = [e.k + e.p, e.k];
  const val = (m: number) => {
    let c = e.dev.avant;
    while (c.length < m) c += e.dev.periode;
    return Number(`${e.dev.entier}${c.slice(0, m)}`);
  };
  return val(a) - val(b);
};

export function consigneGenerale(e: E): Frag[] {
  switch (e.variante) {
    case "diviser":
      return [tx("On écrit "), lx(fracL(e.num, e.den)), tx(" sous forme décimale, en posant la division de "), lx(`${e.num}`), tx(" par "), lx(`${e.den}`), tx(".")];
    case "versFraction":
      return [tx("On veut écrire "), lx(`x=${xL(e)}`), tx(" sous forme de fraction irréductible.")];
    case "critere":
      return [tx("Sans effectuer la division, on veut savoir si "), lx(fracL(e.numDonne, e.denDonne)), tx(" a une écriture décimale limitée ou illimitée périodique.")];
  }
}

export function libelle(_e: E, p: P): string {
  return {
    ecriture: "Écriture décimale",
    longueur: "Longueur de la période",
    borne: "Longueur maximale",
    puissances: "Puissances de 10",
    difference: "Différence",
    fraction: "Fraction irréductible",
    simplifier: "Fraction irréductible",
    denominateur: "Dénominateur",
    verdict: "Limitée ou périodique",
  }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "ecriture":
      return [tx("Écris l'écriture décimale de "), lx(fracL(e.num, e.den)), tx(" ; tape la période entre parenthèses (par exemple 0,1(6) pour "), lx("0{,}1\\overline{6}=0{,}1666\\ldots"), tx(").")];
    case "longueur":
      return [tx("Combien de chiffres la période compte-t-elle ?")];
    case "borne":
      return [tx("Sans poser la division, combien de chiffres la période de "), lx(fracL(e.num, e.den)), tx(" pouvait-elle compter au plus ? Pourquoi ?")];
    case "puissances":
      return [tx("Par quels multiples de "), lx("x"), tx(" faut-il passer pour que, dans leur différence, les périodes s'éliminent ?")];
    case "difference": {
      const [a, b] = [e.k + e.p, e.k];
      return [tx("Calcule cette différence : "), lx(`${puissanceX(a)}-${puissanceX(b)}=\\ ?`)];
    }
    case "fraction":
      return [tx("Écris "), lx("x"), tx(" sous forme de fraction irréductible.")];
    case "simplifier":
      return [tx("Écris "), lx(fracL(e.numDonne, e.denDonne)), tx(" sous forme de fraction irréductible.")];
    case "denominateur":
      return [tx("Décompose en facteurs premiers le dénominateur de la fraction irréductible.")];
    case "verdict":
      return [tx("Quelle est l'écriture décimale de "), lx(fracL(e.numDonne, e.denDonne)), tx(" ?")];
  }
}

export const estChoix = (_e: E, p: P): boolean => p === "borne" || p === "puissances" || p === "verdict";

export function options(e: E, p: P): OptionEcran[] {
  if (p === "borne") {
    const n = e.den;
    return [
      { id: "A", fragments: [tx("Au plus "), lx(`${n - 1}`), tx(" chiffres : les restes non nuls possibles sont "), lx(`1, 2, \\ldots, ${n - 1}`)] },
      { id: "B", fragments: [tx("Au plus "), lx(`${n}`), tx(" chiffres : les restes possibles sont "), lx(`0, 1, \\ldots, ${n - 1}`)] },
      { id: "C", fragments: [tx("Au plus "), lx(`${Math.abs(e.num)}`), tx(" chiffres : autant que le numérateur")] },
      { id: "D", fragments: [tx("On ne peut pas le prévoir : une période peut être aussi longue qu'on veut")] },
    ];
  }
  if (p === "puissances") return e.paires.map(([a, b], i) => ({ id: `${i}`, fragments: [lx(`${puissanceX(a)}\\text{ et }${puissanceX(b)}`)] }));
  return [
    { id: "limitee", fragments: [tx("Limitée")] },
    { id: "periodique", fragments: [tx("Illimitée périodique")] },
    { id: "nonPeriodique", fragments: [tx("Illimitée non périodique")] },
  ];
}

export function bonneOptionId(e: E, p: P): string {
  if (p === "borne") return "A";
  if (p === "puissances") return `${e.paires.findIndex(([a, b]) => a === e.k + e.p && b === e.k)}`;
  return e.verdict ?? "limitee";
}

/** Aperçu KaTeX de l'écriture décimale saisie (rien si illisible). */
function apercuDecimale(texte: string): string | null {
  const l = lireDecimale(texte);
  return l.type === "valeur" ? developpementL(l.dev) : null;
}

export function mode(e: E, p: P): ModeEcran {
  switch (p) {
    case "ecriture":
      return { type: "champs", champs: [{ label: "Écriture décimale", labelLatex: `${fracL(e.num, e.den)}=`, placeholder: "ex. : 0,1(6)", apercuLatex: apercuDecimale, raccourcis: [{ libelle: "(", texte: "(" }, { libelle: ")", texte: ")" }] }] };
    case "longueur":
      return { type: "champs", champs: [{ label: "Nombre de chiffres de la période", placeholder: "un naturel" }] };
    case "difference": {
      const [a, b] = [e.k + e.p, e.k];
      return { type: "champs", champs: [{ label: "Différence", labelLatex: `${puissanceX(a)}-${puissanceX(b)}=`, placeholder: "un nombre" }] };
    }
    case "fraction":
      return { type: "champs", champs: [{ label: "Fraction irréductible", labelLatex: "x=", placeholder: "ex. : 47/22", apercuLatex: apercuFraction }] };
    case "simplifier":
      return { type: "champs", champs: [{ label: "Fraction irréductible", labelLatex: `${fracL(e.numDonne, e.denDonne)}=`, placeholder: "ex. : 7/20", apercuLatex: apercuFraction }] };
    case "denominateur":
      return { type: "champs", champs: [{ label: "Décomposition du dénominateur", labelLatex: `${e.den}=`, placeholder: "ex. : 2² · 5", apercuLatex: apercuDecomposition, raccourcis: RACCOURCIS_DECOMPOSITION }] };
    default:
      return { type: "choix", options: options(e, p) };
  }
}

function apercuFraction(texte: string): string | null {
  const m = texte.replace(/\s+/g, "").replace(/[−–—]/g, "-").match(/^(-?)(\d+)\/(\d+)$/);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : null;
}

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "ecriture":
      return { texte: [tx("Pose la division : à chaque étape, multiplie le reste par 10 et divise par "), lx(`${e.den}`), tx(" ; tu obtiens un chiffre et un nouveau reste. Dès qu'un reste revient, les chiffres se répètent (cours, étape 2).")] };
    case "longueur":
      return { texte: [tx("La période est le bloc de chiffres qui se répète, le plus court possible.")] };
    case "borne":
      return { texte: [tx("Dans la division par "), lx(`${e.den}`), tx(", chaque reste est un naturel plus petit que "), lx(`${e.den}`), tx(". Un reste nul arrêterait la division ; un reste qui revient fait recommencer les mêmes chiffres (cours, étape 2).")] };
    case "puissances":
      return { texte: [tx("Avec k chiffres avant la période et p chiffres dans la période, les nombres "), lx("10^{k}x"), tx(" et "), lx("10^{k+p}x"), tx(" ont exactement la même partie après la virgule (cours, étape 2) :")], latex: "10^{k+p}x-10^{k}x\\ \\text{est un entier}" };
    case "difference":
      return { texte: [tx("Écris les deux multiples de "), lx("x"), tx(" en décalant la virgule, puis soustrais : les parties périodiques s'éliminent.")] };
    case "fraction":
      return { texte: [tx("De "), lx("10^{k+p}x-10^{k}x=D"), tx(", on tire "), lx("x=\\dfrac{D}{10^{k+p}-10^{k}}"), tx(" ; simplifie ensuite par le PGCD du numérateur et du dénominateur.")] };
    case "simplifier":
      return { texte: [tx("Divise le numérateur et le dénominateur par leur plus grand diviseur commun.")] };
    case "denominateur":
      return { texte: [tx("Divise par 2, puis par 3, par 5, par 7… tant que c'est possible ; regroupe en puissances.")] };
    case "verdict":
      return { texte: [tx("Une fraction irréductible a une écriture décimale limitée si et seulement si son dénominateur ne contient que les facteurs premiers 2 et 5 ; sinon, son écriture est illimitée périodique (cours, étape 2) :")], latex: "\\dfrac{m}{n}\\ \\text{limitée}\\iff n=2^{a}\\cdot 5^{b}" };
  }
}

export function aide2(e: E, p: P): AideEcran {
  switch (p) {
    case "ecriture": {
      const l = e.lignesDivision[0];
      return { texte: [tx("Ici, la partie entière vaut "), lx(`${e.dev.entier}`), tx(" ; le premier reste multiplié par 10 donne "), lx(`${l.dividende}`), tx(", à diviser par "), lx(`${e.den}`), tx(".")] };
    }
    case "longueur":
      return { texte: [tx("Ici, compte les chiffres placés entre les parenthèses de ton écriture (sous la barre).")] };
    case "borne":
      return { texte: [tx("Ici, liste les restes possibles dans une division par "), lx(`${e.den}`), tx(", puis retire celui qui arrêterait la division.")] };
    case "puissances":
      return { texte: [tx("Ici, "), lx(`x=${xL(e)}`), tx(" a "), lx(`${e.k}`), tx(` chiffre${e.k > 1 ? "s" : ""} avant la période et `), lx(`${e.p}`), tx(` chiffre${e.p > 1 ? "s" : ""} dans la période.`)] };
    case "difference": {
      const [a, b] = [e.k + e.p, e.k];
      return { texte: [tx("Ici, "), lx(`${puissanceX(a)}=${decaleL(e, a)}`), tx(" ; écris de même "), lx(puissanceX(b)), tx(".")] };
    }
    case "fraction": {
      const [a, b] = [e.k + e.p, e.k];
      return { texte: [tx("Ici, "), lx(`x=\\dfrac{${difference(e)}}{${10 ** a - 10 ** b}}`), tx(" : simplifie cette fraction.")] };
    }
    case "simplifier":
      return { texte: [tx("Ici, "), lx(`${e.numDonne}`), tx(" et "), lx(`${e.denDonne}`), tx(" sont tous deux divisibles par "), lx(`${e.g}`), tx(".")] };
    case "denominateur":
      return { texte: [tx("Ici, commence par diviser "), lx(`${e.den}`), tx(" par "), lx(`${decomposer(e.den)[0][0]}`), tx(".")] };
    case "verdict":
      return { texte: [tx("Ici, regarde la décomposition "), lx(`${e.den}=${decompositionL(decomposer(e.den))}`), tx(" : contient-elle un facteur premier autre que 2 et 5 ?")] };
  }
}

export function messageIllisible(_e: E, p: P): string {
  switch (p) {
    case "ecriture":
      return "Écris un nombre décimal, la période entre parenthèses (par exemple 0,1(6) ou 3,(142857)). Cette saisie ne compte pas comme une tentative.";
    case "longueur":
    case "difference":
      return "Écris un nombre entier. Cette saisie ne compte pas comme une tentative.";
    case "fraction":
    case "simplifier":
      return "Écris une fraction avec une barre oblique (par exemple 7/20) ou un entier. Cette saisie ne compte pas comme une tentative.";
    case "denominateur":
      return "Écris un produit de nombres, par exemple 2² · 5 ou 2 · 2 · 5. Cette saisie ne compte pas comme une tentative.";
    default:
      return "Choisis une des propositions. Cette saisie ne compte pas comme une tentative.";
  }
}

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "ecriture":
      return [lx(`${fracL(e.num, e.den)}=${xL(e)}`)];
    case "longueur":
      return [tx("La période "), lx(e.dev.periode), tx(" compte "), lx(`${e.dev.periode.length}`), tx(e.dev.periode.length > 1 ? " chiffres" : " chiffre")];
    case "borne":
      return [tx("Au plus "), lx(`${e.den - 1}`), tx(" chiffres : les restes non nuls possibles sont "), lx(`1, 2, \\ldots, ${e.den - 1}`)];
    case "puissances":
      return [lx(`${puissanceX(e.k + e.p)}\\text{ et }${puissanceX(e.k)}`)];
    case "difference":
      return [lx(`${puissanceX(e.k + e.p)}-${puissanceX(e.k)}=${difference(e)}`)];
    case "fraction":
      return [lx(`x=${fracL(e.num, e.den)}`)];
    case "simplifier":
      return [lx(`${fracL(e.numDonne, e.denDonne)}=${fracL(e.num, e.den)}`)];
    case "denominateur":
      return [lx(`${e.den}=${decompositionL(decomposer(e.den))}`)];
    case "verdict":
      return e.verdict === "limitee" ? [tx("Limitée : "), lx(`${fracL(e.numDonne, e.denDonne)}=${xL(e)}`)] : [tx("Illimitée périodique : "), lx(`${fracL(e.numDonne, e.denDonne)}=${xL(e)}`)];
  }
}

export const recap = reponse;

export function explication(e: E, p: P): string {
  if (p === "borne") return `Les restes non nuls d'une division par ${e.den} sont au plus ${e.den - 1} : un reste revient donc au bout d'au plus ${e.den - 1} chiffres.`;
  if (p === "puissances") return "Les deux multiples doivent avoir exactement la même partie après la virgule.";
  return e.verdict === "limitee" ? `Le dénominateur irréductible ${e.den} ne contient que des facteurs 2 et 5.` : `Le dénominateur irréductible ${e.den} contient un facteur premier autre que 2 et 5.`;
}
