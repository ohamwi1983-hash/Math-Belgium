/**
 * Présentation de la famille « position de la courbe par rapport à son asymptote » (5gen21, lots
 * B–D) : consignes, libellés, réponses attendues, aides à deux niveaux et messages ciblés. UNE seule
 * source pour l'écran, les aides, le papier et le corrigé (`corrigePosition.ts` relit ces fonctions).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExercicePositionAsymptote, VerdictPosition } from "../core5e/asymptoteOblique.types";
import { cotesAttendus, pointRecoupementAttendu, type Cote, type PhasePositionAsymptote, type ReponseCotes, type ReponsePointRecoupement } from "../moteur5e/sessionPositionAsymptote";
import { egalAuPolynome, egaleA, lireLimite, valeurExpression } from "../moteur5e/saisieLimites";
import type { AideTrig } from "./aidesTrigonometrie";
import { mulP, polyFacteur, polyLatex, subP } from "./corrigeLimites";

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ----------------------------------------------------------------------------
// Écritures.
// ----------------------------------------------------------------------------

export const pLatex = (e: ExercicePositionAsymptote): string => polyLatex(e.coeffsP);
export const dLatex = (e: ExercicePositionAsymptote): string => polyLatex(e.coeffsD);
export const qPoly = (e: ExercicePositionAsymptote): number[] => (e.a === 0 ? [e.b] : [e.b, e.a]);
export const rPoly = (e: ExercicePositionAsymptote): number[] => (e.r === 0 ? [e.s] : [e.s, e.r]);
export const rLatex = (e: ExercicePositionAsymptote): string => polyLatex(rPoly(e));

/** « y=2x+1 » (AO) ou « y=3 » (AH). */
export const droiteLatex = (e: ExercicePositionAsymptote): string => `y=${polyLatex(qPoly(e))}`;

export const fonctionLatex = (e: ExercicePositionAsymptote): string => `f(x)=\\dfrac{${pLatex(e)}}{${dLatex(e)}}`;

/** « f(x)-(2x+1) », « f(x)-3 », « f(x)+3 », « f(x)-2x », « f(x)+x » : jamais « f(x)-(-3) ». */
export function ecartLatex(e: ExercicePositionAsymptote): string {
  const q = qPoly(e).filter((c) => c !== 0);
  const s = polyLatex(qPoly(e));
  if (q.length <= 1) return s.startsWith("-") ? `f(x)+${s.slice(1)}` : s === "0" ? "f(x)" : `f(x)-${s}`;
  return `f(x)-(${s})`;
}

/** Nom de la droite dans une phrase : « l'asymptote oblique d » / « l'asymptote horizontale d ». */
export const natureDroite = (e: ExercicePositionAsymptote): string => (e.asymptote === "oblique" ? "oblique" : "horizontale");

// ----------------------------------------------------------------------------
// Énoncé, consignes.
// ----------------------------------------------------------------------------

export function enonceFragments(e: ExercicePositionAsymptote): FragmentConsigne[] {
  return [t("On considère la fonction "), l(fonctionLatex(e)), t(" et la droite "), l(`d\\ :\\ ${droiteLatex(e)}`), t(`, asymptote ${natureDroite(e)} de sa courbe.`)];
}

/** Consigne papier COMMUNE à toutes les instances (aucune donnée tirée : regroupement a), b), c)). */
export function consignePapierFragments(_e: ExercicePositionAsymptote): FragmentConsigne[] {
  return [
    t("Étudie la position de la courbe de f par rapport à d : signe de la différence entre f(x) et l'expression de d, point de recoupement éventuel, et côté par lequel la courbe s'approche de d en "),
    l("-\\infty"),
    t(" et en "),
    l("+\\infty"),
    t(". Justifie ta démarche."),
  ];
}

export const LIBELLE_PHASE_POSITION: Record<PhasePositionAsymptote, string> = {
  numerateurEcart: "Écart réduit au même dénominateur",
  verdictPosition: "Position de la courbe",
  pointRecoupement: "Point de recoupement",
  cotesApproche: "Côté d'approche en −∞ et en +∞",
};

export function consignePhaseFragments(e: ExercicePositionAsymptote, phase: PhasePositionAsymptote): FragmentConsigne[] {
  switch (phase) {
    case "numerateurEcart":
      return [t("Réduis "), l(ecartLatex(e)), t(" au même dénominateur "), l(`D(x)=${dLatex(e)}`), t(" : donne le numérateur "), l("R(x)"), t(".")];
    case "verdictPosition":
      return [t("Étudie le signe de "), l(ecartLatex(e)), t(" sur "), l("\\mathbb{R}"), t(" et conclus sur la position de la courbe de f par rapport à d.")];
    case "pointRecoupement":
      return [t("Donne les coordonnées du point commun à la courbe de f et à d, ou indique qu'il n'y en a aucun.")];
    case "cotesApproche":
      return [t("De quel côté de d la courbe de f s'approche-t-elle en "), l("-\\infty"), t(", puis en "), l("+\\infty"), t(" ?")];
  }
}

/** Libellé KaTeX du champ de l'écran 1. */
export const labelNumerateur = (e: ExercicePositionAsymptote): string => `${ecartLatex(e)}=\\dfrac{R(x)}{${dLatex(e)}}`;

export const OPTIONS_VERDICT: VerdictPosition[] = ["dessus", "dessous", "recoupe"];

export function optionVerdictFragments(e: ExercicePositionAsymptote, v: VerdictPosition): FragmentConsigne[] {
  const ec = ecartLatex(e);
  if (v === "dessus") return [l(`${ec}>0`), t(" pour tout réel x : la courbe est au-dessus de d")];
  if (v === "dessous") return [l(`${ec}<0`), t(" pour tout réel x : la courbe est en dessous de d")];
  return [l(ec), t(" change de signe : la courbe recoupe d et passe de l'autre côté")];
}

export const LIBELLE_COTE: Record<Cote, string> = { dessus: "au-dessus de d", dessous: "en dessous de d" };

// ----------------------------------------------------------------------------
// Réponses attendues.
// ----------------------------------------------------------------------------

export function phraseVerdict(e: ExercicePositionAsymptote): FragmentConsigne[] {
  const p = pointRecoupementAttendu(e);
  if (e.verdict === "dessus") return [t("La courbe de f est au-dessus de d sur "), l("\\mathbb{R}"), t(".")];
  if (e.verdict === "dessous") return [t("La courbe de f est en dessous de d sur "), l("\\mathbb{R}"), t(".")];
  const x0 = p!.x;
  const avant = e.r > 0 ? "en dessous" : "au-dessus";
  const apres = e.r > 0 ? "au-dessus" : "en dessous";
  return [t(`La courbe de f recoupe d : elle est ${avant} de d pour `), l(`x<${x0}`), t(` et ${apres} de d pour `), l(`x>${x0}`), t(".")];
}

export function pointLatex(e: ExercicePositionAsymptote): string | null {
  const p = pointRecoupementAttendu(e);
  return p ? `(${p.x}\\,;\\,${p.y})` : null;
}

export function phraseCotes(e: ExercicePositionAsymptote): FragmentConsigne[] {
  const c = cotesAttendus(e);
  return [t("En "), l("-\\infty"), t(`, la courbe s'approche de d par ${c.moinsInfini === "dessus" ? "au-dessus" : "en dessous"} ; en `), l("+\\infty"), t(`, par ${c.plusInfini === "dessus" ? "au-dessus" : "en dessous"}.`)];
}

/** Réponse attendue de l'écran (fragments) — validation, fiche de puce, récapitulatif, papier. */
export function reponseAttenduePosition(e: ExercicePositionAsymptote, phase: PhasePositionAsymptote): FragmentConsigne[] {
  switch (phase) {
    case "numerateurEcart":
      return [l(`R(x)=${rLatex(e)}`), t(", donc "), l(`${ecartLatex(e)}=\\dfrac{${rLatex(e)}}{${dLatex(e)}}`)];
    case "verdictPosition":
      return phraseVerdict(e);
    case "pointRecoupement": {
      const p = pointLatex(e);
      return p ? [t("Point de recoupement "), l(p), t(".")] : [t("Aucun point commun : "), l(`R(x)=${e.s}`), t(" ne s'annule jamais.")];
    }
    case "cotesApproche":
      return phraseCotes(e);
  }
}

// ----------------------------------------------------------------------------
// Aides : niveau 1 = la propriété du cours ; niveau 2 = la propriété posée pour l'instance (jamais
// la réponse).
// ----------------------------------------------------------------------------

export function aidesPosition(e: ExercicePositionAsymptote, phase: PhasePositionAsymptote): AideTrig[] {
  const ec = ecartLatex(e);
  const qd = e.a === 0 ? `${e.b < 0 ? `(${e.b})` : e.b}\\cdot D(x)` : `${polyFacteur(qPoly(e))}\\cdot D(x)`;
  switch (phase) {
    case "numerateurEcart":
      return [
        { texte: [t("Pour soustraire la droite, on l'écrit sur le dénominateur "), l("D(x)"), t(" :")], formules: [`f(x)-(ax+b)=\\dfrac{P(x)-(ax+b)\\cdot D(x)}{D(x)}`] },
        { texte: [t("Ici, développe d'abord le produit, puis soustrais-le de "), l("P(x)"), t(" terme à terme (le signe − porte sur tout le produit) :")], formules: [`R(x)=${pLatex(e)}-${qd}`] },
      ];
    case "verdictPosition":
      return [
        { texte: [t("Le signe de "), l("f(x)-(ax+b)"), t(" donne la position : positif, la courbe est au-dessus de d ; négatif, en dessous ; nul, elle la touche. Pour un quotient, on étudie le signe du numérateur et celui du dénominateur.")] },
        { texte: [t("Ici, calcule le discriminant de "), l("D(x)"), t(" : sans racine, "), l("D(x)"), t(" garde le signe de son coefficient dominant ; le signe de "), l(ec), t(" est alors celui de "), l("R(x)"), t(" (étape 1) :")], formules: [`\\Delta=(${e.coeffsD[1]})^2-4\\cdot 1\\cdot ${e.coeffsD[0]}`] },
      ];
    case "pointRecoupement":
      return [
        { texte: [t("Un point commun vérifie "), l("f(x)=ax+b"), t(", c'est-à-dire "), l("f(x)-(ax+b)=0"), t(" : le numérateur s'annule (le dénominateur ne s'annule jamais).")], formules: ["\\dfrac{R(x)}{D(x)}=0\\iff R(x)=0"] },
        { texte: [t("Ici, résous "), l("R(x)=0"), t(" avec le numérateur de l'étape 1 ; une solution "), l("x_0"), t(" a pour ordonnée celle de d :")], formules: [`y_0=${polyLatex(qPoly(e), "x_0")}`] },
      ];
    case "cotesApproche":
      return [
        { texte: [t("Pour x très grand en valeur absolue, la courbe est du côté de d donné par le signe de "), l("f(x)-(ax+b)"), t(" : positif, elle arrive au-dessus ; négatif, en dessous.")] },
        { texte: [t("Ici, "), l("D(x)>0"), t(" : regarde le signe de "), l("R(x)"), t(" pour une très grande valeur de x, puis pour une valeur très négative :")], formules: ["R(1000)\\qquad R(-1000)"] },
      ];
  }
}

// ----------------------------------------------------------------------------
// Messages ciblés (erreurs du cours), jamais la réponse.
// ----------------------------------------------------------------------------

function valeurPoly(c: number[], x: number): number {
  return c.reduce((acc, k, i) => acc + k * x ** i, 0);
}

export function cibleNumerateur(e: ExercicePositionAsymptote, brut: string): FragmentConsigne[] | null {
  const R = rPoly(e);
  const QD = mulP(qPoly(e), e.coeffsD);
  if (egalAuPolynome(brut, R.map((c) => -c))) return [t("Signe inversé : on calcule "), l(ecartLatex(e)), t(", c'est-à-dire f(x) moins la droite, pas la droite moins f(x).")];
  if (egalAuPolynome(brut, subP(e.coeffsP, qPoly(e)))) return [t("Pour soustraire la droite d'une fraction, multiplie-la d'abord par le dénominateur "), l("D(x)"), t(".")];
  if (egalAuPolynome(brut, subP(e.coeffsP, QD.map((c) => -c)))) return [t("Le signe − porte sur tout le produit "), l(e.a === 0 ? `${e.b < 0 ? `(${e.b})` : e.b}\\cdot D(x)` : "(ax+b)\\cdot D(x)"), t(" : change le signe de chacun de ses termes.")];
  if (egalAuPolynome(brut, e.coeffsP)) return [t("C'est le numérateur de f : il faut encore lui soustraire le produit de la droite par "), l("D(x)"), t(".")];
  if (egaleA(brut, (x) => valeurPoly(R, x) / valeurPoly(e.coeffsD, x))) return [t("On demande seulement le numérateur "), l("R(x)"), t(" : le dénominateur reste "), l("D(x)"), t(".")];
  const v0 = valeurExpression(brut, 0);
  const v1 = valeurExpression(brut, 1);
  if (v0 !== null && v1 !== null && egaleA(brut, (x) => v0 + (v1 - v0) * x))
    return [t("Ton numérateur est bien de degré au plus 1 ; revois la soustraction terme à terme : le terme en x et la constante de "), l("P(x)"), t(" moins ceux du produit.")];
  return [t("Les termes de plus haut degré doivent s'annuler : "), l("R(x)"), t(" est de degré au plus 1. Revois le développement du produit par "), l("D(x)"), t(".")];
}

/** Message sous la réponse révélée du choix fermé (une seule tentative). */
export function cibleVerdict(e: ExercicePositionAsymptote, choix: VerdictPosition): FragmentConsigne[] | null {
  if (choix === e.verdict) return null;
  const p = pointRecoupementAttendu(e);
  if (e.verdict === "recoupe") return [l(`R(x)=${rLatex(e)}`), t(" est du premier degré : il s'annule en "), l(`x=${p!.x}`), t(" et change de signe, donc la courbe recoupe d.")];
  if (choix === "recoupe") return [l(`R(x)=${e.s}`), t(" est une constante non nulle et "), l("D(x)>0"), t(" : l'écart garde le même signe, la courbe ne recoupe pas d.")];
  return [l("D(x)>0"), t(" et "), l(`R(x)=${e.s}`), t(e.s > 0 ? " > 0 : le quotient est positif, la courbe est au-dessus de d." : " < 0 : le quotient est négatif, la courbe est en dessous de d.")];
}

export function ciblePoint(e: ExercicePositionAsymptote, r: ReponsePointRecoupement): FragmentConsigne[] | null {
  const p = pointRecoupementAttendu(e);
  if (!p) return r.aucun ? null : [l(`R(x)=${e.s}`), t(" est une constante non nulle : "), l(ecartLatex(e)), t(" ne s'annule jamais.")];
  if (r.aucun) return [t("Le numérateur "), l("R(x)"), t(" est du premier degré : il s'annule pour une valeur de x, il y a donc un point commun.")];
  const x = lireLimite(r.x);
  const y = lireLimite(r.y);
  if (x === null || y === null) return null;
  if (Math.abs(x - p.x) < 1e-9) {
    if (Math.abs(y) < 1e-9 && p.y !== 0) return [t("L'abscisse est juste ; un point commun n'est pas un zéro de f : son ordonnée est celle de d en "), l("x_0"), t(".")];
    return [t("L'abscisse est juste ; l'ordonnée se calcule sur d : "), l(`y_0=${polyLatex(qPoly(e), "x_0")}`), t(".")];
  }
  if (Math.abs(x + p.x) < 1e-9) return [t("Revois le signe en résolvant "), l("R(x)=0"), t(" : on isole x en divisant par le coefficient de x.")];
  return [t("Le point commun annule le numérateur "), l("R(x)"), t(" de l'étape 1 : vérifie que ton abscisse l'annule.")];
}

export function cibleCotes(e: ExercicePositionAsymptote, r: ReponseCotes): FragmentConsigne[] | null {
  const c = cotesAttendus(e);
  if (r.moinsInfini === c.moinsInfini && r.plusInfini === c.plusInfini) return null;
  if (e.r === 0) return [l(`R(x)=${e.s}`), t(" ne change pas de signe : la courbe reste du même côté de d en "), l("-\\infty"), t(" et en "), l("+\\infty"), t(".")];
  if (r.moinsInfini === r.plusInfini) return [t("La courbe change de côté au point de recoupement : elle arrive d'un côté en "), l("-\\infty"), t(" et repart de l'autre en "), l("+\\infty"), t(".")];
  return [t("Pour x très grand, "), l(rLatex(e)), t(" a le signe du coefficient de x ; pour x très négatif, le signe contraire.")];
}
