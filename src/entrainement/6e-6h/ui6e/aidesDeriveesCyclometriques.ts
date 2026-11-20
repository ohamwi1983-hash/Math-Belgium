import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";
import { fragmentsDepuisTexte } from "../components6e/RetourSaisieExpo";
import { arcfonctionDeriveeBase } from "../moteur6e/derivationCyclometrique";
import { diagnostiquerEquivalenceFonction } from "../moteur6e/equivalenceCyclometrique";
import * as V from "../moteur6e/verificationDeriveesCyclometriques";
import { formatAffineLatex, formatULatexA, formatVLatexB } from "./formatDeriveesCyclometriques";

/**
 * Aides, lecture et messages ciblés de `6gen4` (audit du 6e ch. 1, lot B : G3, G4, G5, G8). Niveau
 * 1 : la règle de dérivation ; niveau 2 : la règle posée pour l'instance (fonctions intérieures
 * nommées), sans le résultat de l'écran — l'ancien niveau 2 donnait la dérivée « déjà substituée »,
 * c'est-à-dire la réponse (il reste utilisé par le récapitulatif, qui montre les écrans clos).
 * Aucune notation clavier (« f'=-k·v'·[…] », « puissance -1 ») ni majuscule d'insistance.
 */

export interface AideDerivee {
  texte: string;
  latex: string | null;
}

type E = ExerciceDeriveesCyclometriques;
type P = PhaseDeriveesCyclometriques;

const NOM: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const REGLE_ARC: Record<Arcfonction, string> = {
  arcsin: "\\left(\\arcsin u\\right)' = \\dfrac{u'}{\\sqrt{1-u^{2}}}",
  arccos: "\\left(\\arccos u\\right)' = -\\dfrac{u'}{\\sqrt{1-u^{2}}}",
  arctan: "\\left(\\arctan u\\right)' = \\dfrac{u'}{1+u^{2}}",
};
const SIGNE_ARCCOS = " Attention au signe $-$ devant la dérivée de $\\arccos$.";
const ax = (a: number) => (a === 1 ? "x" : a === -1 ? "-x" : `${a}x`);
const QUOTIENT = "\\left(\\dfrac{N}{D}\\right)' = \\dfrac{N'D-ND'}{D^{2}}";

function regleArc(arc: Arcfonction, u: string): AideDerivee {
  return { texte: `Dérivée d'une arcfonction composée, avec $u(x) = ${u}$ (règle de la chaîne)${arc === "arccos" ? " ; attention au signe $-$" : ""} :`, latex: REGLE_ARC[arc] };
}

function arcsD(e: Extract<E, { famille: "D" }>): [Arcfonction, Arcfonction] {
  return e.orientation === "sinSurCos" ? ["arcsin", "arccos"] : ["arccos", "arcsin"];
}

export function aidesDerivee(e: E, phase: P): [AideDerivee, AideDerivee] {
  switch (e.famille) {
    case "A": {
      const u = formatULatexA(e);
      if (phase === "aDeriveeU") {
        const regle =
          e.uType === "affine"
            ? "(ax+b)' = a"
            : e.uType === "puissance"
              ? "\\left(x^{n}\\right)' = n\\,x^{n-1}"
              : e.uType === "racine"
                ? "\\left(\\sqrt{v}\\right)' = \\dfrac{v'}{2\\sqrt{v}}"
                : "\\left(\\dfrac{k}{x}\\right)' = -\\dfrac{k}{x^{2}}";
        return [
          { texte: "Règle de dérivation de la fonction intérieure :", latex: regle },
          { texte: "Applique cette règle à la fonction intérieure de f :", latex: `u(x) = ${u}` },
        ];
      }
      return [
        { texte: `$f$ est une constante plus $k$ fois une arcfonction de $u$ : la constante disparaît, $k$ reste en facteur.${e.arcfonction === "arccos" ? SIGNE_ARCCOS : ""}`, latex: REGLE_ARC[e.arcfonction] },
        { texte: "Remplace $u$ par son expression et $u'$ par la dérivée trouvée à l'écran précédent :", latex: `f'(x) = ${e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}\\cdot`}\\left(${NOM[e.arcfonction]}\\,u\\right)' \\quad\\text{avec}\\quad u(x) = ${u}` },
      ];
    }
    case "B": {
      const v = formatVLatexB(e);
      if (phase === "bDeriveeU") return [
        { texte: "La dérivée d'une fonction linéaire $m\\,x$ est le nombre $m$.", latex: null },
        { texte: "Ici :", latex: `u(x) = ${ax(e.m)}` },
      ];
      if (phase === "bDeriveeArc") return [regleArc(e.arcfonction, v), { texte: e.vType === "simple" ? "Ici l'argument est $x$, de dérivée $1$ :" : "Ici l'argument n'est pas $x$ : calcule $v'(x)$ puis remplace dans la règle :", latex: `v(x) = ${v}` }];
      return [
        { texte: "Règle du produit (n'oublie aucun des deux termes) :", latex: "(u\\,w)' = u'\\,w + u\\,w'" },
        { texte: "Avec les deux facteurs de f, et $w'$ trouvée à l'écran précédent :", latex: `u(x) = ${ax(e.m)} \\qquad w(x) = ${NOM[e.arcfonction]}\\left(${v}\\right)` },
      ];
    }
    case "C": {
      const N = `${e.k === 1 ? "" : e.k}${NOM[e.arcfonction]}\\left(${ax(e.a)}\\right)`;
      const D = `\\sqrt{1-\\left(${ax(e.a)}\\right)^{2}}`;
      if (phase === "cNumerateur") return [regleArc(e.arcfonction, ax(e.a)), { texte: "Le numérateur à dériver ($k$ reste en facteur) :", latex: `N(x) = ${N}` }];
      if (phase === "cDenominateur") return [
        { texte: "Dérivée d'une racine composée :", latex: "\\left(\\sqrt{v}\\right)' = \\dfrac{v'}{2\\sqrt{v}}" },
        { texte: "Ici, la fonction sous la racine (développe le carré entier) :", latex: `v(x) = 1-\\left(${ax(e.a)}\\right)^{2}` },
      ];
      return [
        { texte: "Règle du quotient :", latex: QUOTIENT },
        { texte: "Avec $N'$ et $D'$ des deux écrans précédents :", latex: `N(x) = ${N} \\qquad D(x) = ${D}` },
      ];
    }
    case "D": {
      const u = formatAffineLatex(e.a, e.b);
      const [haut, bas] = arcsD(e);
      if (phase === "dNumerateur") return [regleArc(haut, u), { texte: "Le numérateur à dériver :", latex: `N(x) = ${NOM[haut]}\\left(${u}\\right)` }];
      if (phase === "dDenominateur") return [regleArc(bas, u), { texte: "Le dénominateur à dériver :", latex: `D(x) = ${NOM[bas]}\\left(${u}\\right)` }];
      if (phase === "dBrut") return [
        { texte: "Règle du quotient (résultat brut demandé, sans simplifier) :", latex: QUOTIENT },
        { texte: "Avec $N'$ et $D'$ des deux écrans précédents :", latex: `N(x) = ${NOM[haut]}\\left(${u}\\right) \\qquad D(x) = ${NOM[bas]}\\left(${u}\\right)` },
      ];
      return [
        { texte: "Pour tout $u \\in [-1\\,;1]$ :", latex: "\\arcsin u + \\arccos u = \\dfrac{\\pi}{2}" },
        { texte: "Ici $D' = -N'$ : mets $N'$ en évidence au numérateur, la somme des deux arcfonctions apparaît :", latex: `N'D-ND' = N'(x)\\left[\\arcsin\\left(${u}\\right)+\\arccos\\left(${u}\\right)\\right]` },
      ];
    }
    case "E": {
      const w = `${NOM[e.arcfonction]}\\left(${ax(e.a)}\\right)`;
      if (phase === "eDeriveeInterne") return [regleArc(e.arcfonction, ax(e.a)), { texte: "La fonction intérieure à dériver :", latex: `w(x) = ${w}` }];
      return [
        { texte: `La dernière opération est ${e.gType === "carre" ? "le carré" : "la racine carrée"} : dérive-la en premier.`, latex: e.gType === "carre" ? "\\left(w^{2}\\right)' = 2\\,w\\,w'" : "\\left(\\sqrt{w}\\right)' = \\dfrac{w'}{2\\sqrt{w}}" },
        { texte: "Avec $w'$ trouvée à l'écran précédent :", latex: `w(x) = ${w}` },
      ];
    }
    case "F": {
      const u = `${NOM[e.arcfonction]}\\left(${ax(e.a)}\\right)`;
      if (phase === "fBrute") return [
        { texte: "Règle de la chaîne à deux niveaux (le résultat peut garder une fonction trigonométrique d'une arcfonction) :", latex: e.trig === "sin" ? "\\left(\\sin u\\right)' = u'\\cos u" : "\\left(\\cos u\\right)' = -u'\\sin u" },
        { texte: "Ici l'angle $u$ est lui-même une arcfonction, à dériver avec sa règle :", latex: `u(x) = ${u}` },
      ];
      return [
        { texte: "Identités utiles :", latex: "\\sin(\\arcsin u) = u \\quad \\cos(\\arccos u) = u \\quad \\cos(\\arcsin u) = \\sin(\\arccos u) = \\sqrt{1-u^{2}}" },
        { texte: "Repère l'identité qui correspond à la composée de f, puis simplifie (avant ou après la dérivation) :", latex: `f(x) = \\${e.trig}\\left(${u}\\right)` },
      ];
    }
    case "G": {
      if (e.sousCas === "h") {
        const v = `x^{2}${e.c >= 0 ? "+" : "-"}${Math.abs(e.c)}`;
        if (phase === "gDeriveeInterne") return [
          { texte: "La dérivée de $x^{2}$ est $2x$, celle d'une constante est $0$.", latex: null },
          { texte: "Ici :", latex: `v(x) = ${v}` },
        ];
        return [
          { texte: `f est un nombre divisé par une arcfonction : dérive $\\dfrac{k}{w}$, puis $w$ avec sa règle.${e.arcfonction === "arccos" ? SIGNE_ARCCOS : ""}`, latex: "\\left(\\dfrac{k}{w}\\right)' = -\\dfrac{k\\,w'}{w^{2}}" },
          { texte: "Ici, avec $v'$ de l'écran précédent :", latex: `w(x) = ${NOM[e.arcfonction]}\\left(${v}\\right)` },
        ];
      }
      const d = e.c === 0 ? "x" : `x${e.c > 0 ? "+" : "-"}${Math.abs(e.c)}`;
      if (phase === "gDeriveeInterne") return [
        { texte: "Dérivée d'un nombre divisé par une fonction affine :", latex: "\\left(\\dfrac{k}{x+c}\\right)' = -\\dfrac{k}{(x+c)^{2}}" },
        { texte: "Ici :", latex: `u(x) = \\dfrac{${e.k}}{${d}}` },
      ];
      return [regleArc(e.arcfonction, `\\dfrac{${e.k}}{${d}}`), { texte: "Remplace $u$ et $u'$ (écran précédent) dans la règle :", latex: `f(x) = ${NOM[e.arcfonction]}\\left(u(x)\\right)` }];
    }
  }
}

/** Diagnostic de l'écran courant (mêmes fonctions que le moteur). */
export function diagnostiquerPhaseDerivee(e: E, phase: P, t: string): StatutVerification {
  switch (phase) {
    case "aDeriveeU":
      return e.famille === "A" ? V.diagnostiquerADeriveeU(e, t) : "parse_error";
    case "aDeriveeFinale":
      return e.famille === "A" ? V.diagnostiquerADeriveeFinale(e, t) : "parse_error";
    case "bDeriveeU":
      return e.famille === "B" ? V.diagnostiquerBDeriveeU(e, t) : "parse_error";
    case "bDeriveeArc":
      return e.famille === "B" ? V.diagnostiquerBDeriveeArc(e, t) : "parse_error";
    case "bDeriveeFinale":
      return e.famille === "B" ? V.diagnostiquerBDeriveeFinale(e, t) : "parse_error";
    case "cNumerateur":
      return e.famille === "C" ? V.diagnostiquerCNumerateur(e, t) : "parse_error";
    case "cDenominateur":
      return e.famille === "C" ? V.diagnostiquerCDenominateur(e, t) : "parse_error";
    case "cDeriveeFinale":
      return e.famille === "C" ? V.diagnostiquerCDeriveeFinale(e, t) : "parse_error";
    case "dNumerateur":
      return e.famille === "D" ? V.diagnostiquerDNumerateur(e, t) : "parse_error";
    case "dDenominateur":
      return e.famille === "D" ? V.diagnostiquerDDenominateur(e, t) : "parse_error";
    case "dBrut":
      return e.famille === "D" ? V.diagnostiquerDBrut(e, t) : "parse_error";
    case "dSimplifiee":
      return e.famille === "D" ? V.diagnostiquerDSimplifiee(e, t) : "parse_error";
    case "eDeriveeInterne":
      return e.famille === "E" ? V.diagnostiquerEDeriveeInterne(e, t) : "parse_error";
    case "eDeriveeFinale":
      return e.famille === "E" ? V.diagnostiquerEDeriveeFinale(e, t) : "parse_error";
    case "fBrute":
      return e.famille === "F" ? V.diagnostiquerFBrute(e, t) : "parse_error";
    case "fSimplifiee":
      return e.famille === "F" ? V.diagnostiquerFSimplifiee(e, t) : "parse_error";
    case "gDeriveeInterne":
      return e.famille === "G" ? V.diagnostiquerGDeriveeInterne(e, t) : "parse_error";
    case "gDeriveeFinale":
      return e.famille === "G" ? V.diagnostiquerGDeriveeFinale(e, t) : "parse_error";
  }
}

/** Facteur « dérivée de l'argument » de l'écran, quand c'est une constante (u = ax + b, ax). */
function facteurChaine(e: E, phase: P): number | null {
  if (e.famille === "A" && phase === "aDeriveeFinale" && e.uType === "affine") return e.a;
  if (e.famille === "C" && phase === "cNumerateur") return e.a;
  if (e.famille === "D" && (phase === "dNumerateur" || phase === "dDenominateur")) return e.a;
  if (e.famille === "E" && phase === "eDeriveeInterne") return e.a;
  return null;
}

/** Argument a·x (b = 0) d'une arcfonction de l'écran, pour l'erreur « (3x)² écrit 3x² ». */
function argumentAX(e: E, phase: P): { arc: Arcfonction; a: number; k: number } | null {
  if (e.famille === "A" && phase === "aDeriveeFinale" && e.uType === "affine" && e.b === 0) return { arc: e.arcfonction, a: e.a, k: e.k };
  if (e.famille === "C" && phase === "cNumerateur") return { arc: e.arcfonction, a: e.a, k: e.k };
  if (e.famille === "E" && phase === "eDeriveeInterne") return { arc: e.arcfonction, a: e.a, k: 1 };
  return null;
}

function arccosEnJeu(e: E, phase: P): boolean {
  if (e.famille === "D") return phase === "dNumerateur" ? e.orientation === "cosSurSin" : phase === "dDenominateur" ? e.orientation === "sinSurCos" : false;
  return "arcfonction" in e && e.arcfonction === "arccos";
}

/** Message ciblé : signe oublié (dérivée de arccos), u′ oublié (règle de la chaîne), carré de
 * l'argument mal développé ((3x)² écrit 3x²). Jamais la réponse. */
export function cibleDerivee(e: E, phase: P, t: string): FragmentConsigne[] | null {
  const vaut = (texte: string) => diagnostiquerPhaseDerivee(e, phase, texte) === "correct";
  if (vaut(`-(${t})`)) return fragmentsDepuisTexte(arccosEnJeu(e, phase) ? "Relis le signe : la dérivée de $\\arccos$ commence par $-$." : "Relis le signe de ton résultat.");
  const f = facteurChaine(e, phase);
  if (f !== null && f !== 1 && vaut(`(${t})*(${f})`)) return fragmentsDepuisTexte("Il manque la dérivée de l'argument : règle de la chaîne, on multiplie par $u'(x)$.");
  const arg = argumentAX(e, phase);
  if (arg && arg.a > 1) {
    const faux = (x: number) => arg.k * arcfonctionDeriveeBase(arg.arc, Math.sqrt(arg.a) * x) * arg.a;
    if (diagnostiquerEquivalenceFonction(t, faux, e.pointsEchantillonnage) === "correct") {
      return fragmentsDepuisTexte(`Le carré porte sur tout l'argument : $\\left(${arg.a}x\\right)^{2} = ${arg.a * arg.a}x^{2}$.`);
    }
  }
  return null;
}
