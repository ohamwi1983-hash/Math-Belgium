import type { ExerciceDomaineDeriveeExponentielle } from "../../core6e/domaineDeriveeExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CONSIGNE_GENERALE, formatFonctionLatex } from "../../ui6e/formatDomaineDeriveeExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeExponentielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDeriveeExponentielle>` pour `6gen7`
 * (Domaine et dérivée de fonctions exponentielles) — feuille d'évaluation.
 *
 * Domaine et dérivée sont deux tâches INDÉPENDANTES (voir `core6e/domaineDeriveeExponentielles.types.ts`),
 * posées comme 2 questions écrites. Le domaine du corrigé est lu directement sur `exercice.domaine`
 * (champ précalculé, jamais recalculé). La dérivée n'a pas de forme finale symbolique déjà exposée
 * par `ui6e/formatDomaineDeriveeExponentielles.ts` (la vérification y est numérique) — les petites
 * formules ci-dessous (u/v, N/D, forme simplifiée de E) DUPLIQUENT donc fidèlement celles déjà
 * écrites dans ce fichier (même convention que `moteur6e/verificationDomaineDeriveeExponentielles.ts`,
 * qui duplique déjà ces mêmes formules pour la vérification — voir la note de conception en tête du
 * fichier core), pour assembler la dérivée complète via la règle adaptée (chaîne/produit/quotient).
 */

function formatSommeTermes(termes: { valeur: number; suffixe: string }[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatBase(base: number, baseEstE: boolean): string {
  return baseEstE ? "e" : String(base);
}

/** `[coeff x^3, coeff x^2, coeff x, constante]` d'une `FormeGA` — duplique fidèlement
 * `coeffsGA`/`formatGAMoinsGA` (`ui6e/formatDomaineDeriveeExponentielles.ts`, famille E sous-type
 * "j"), pour combiner g(x)−h(x) terme à terme plutôt qu'une simple concaténation textuelle. */
function coeffsGA(g: { type: "affine"; m: number; n: number } | { type: "puissance"; exposant: 2 | 3 }): [number, number, number, number] {
  if (g.type === "affine") return [0, 0, g.m, g.n];
  return g.exposant === 2 ? [0, 1, 0, 0] : [1, 0, 0, 0];
}

function formatGAMoinsGA(
  g: { type: "affine"; m: number; n: number } | { type: "puissance"; exposant: 2 | 3 },
  h: { type: "affine"; m: number; n: number } | { type: "puissance"; exposant: 2 | 3 },
): string {
  const [g3, g2, g1, g0] = coeffsGA(g);
  const [h3, h2, h1, h0] = coeffsGA(h);
  return formatSommeTermes([
    { valeur: g3 - h3, suffixe: "x^3" },
    { valeur: g2 - h2, suffixe: "x^2" },
    { valeur: g1 - h1, suffixe: "x" },
    { valeur: g0 - h0, suffixe: "" },
  ]);
}

function formatDeriveeLatex(exercice: ExerciceDomaineDeriveeExponentielle): string {
  switch (exercice.famille) {
    case "A": {
      const b = formatBase(exercice.base, exercice.baseEstE);
      if (exercice.sousType === "direct") {
        const g = exercice.g;
        const gLatex = g.type === "affine" ? formatSommeTermes([{ valeur: g.m, suffixe: "x" }, { valeur: g.n, suffixe: "" }]) : g.exposant === 2 ? "x^2" : "x^3";
        const gPrime = g.type === "affine" ? String(g.m) : `${g.exposant}${g.exposant === 2 ? "x" : "x^2"}`;
        return `\\left(${gPrime}\\right)\\cdot ${b}^{${gLatex}}\\cdot\\ln(${b})`;
      }
      const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
      return `2\\left(${b}^{${puissance}} - ${exercice.c}\\right)\\cdot ${exercice.m}\\cdot\\ln(${b})\\cdot ${b}^{${puissance}}`;
    }
    case "B": {
      const b = String(exercice.base);
      if (exercice.sousType === "racine") {
        const u = `\\sqrt{x^2-${exercice.k}^2}`;
        const uPrime = `\\dfrac{x}{${u}}`;
        return `\\left(${uPrime}\\right)\\cdot ${b}^{${u}}\\cdot\\ln(${b})`;
      }
      const num = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
      const den = formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }]);
      const uPrime = `\\dfrac{${exercice.m}(${den})-${exercice.p}(${num})}{(${den})^2}`;
      return `\\left(${uPrime}\\right)\\cdot ${b}^{\\frac{${num}}{${den}}}\\cdot\\ln(${b})`;
    }
    case "C": {
      if (exercice.sousType === "d") {
        const p = formatSommeTermes([{ valeur: exercice.a, suffixe: "x^3" }, { valeur: exercice.b, suffixe: "x^2" }]);
        const uPrime = formatSommeTermes([{ valeur: 3 * exercice.a, suffixe: "x^2" }, { valeur: 2 * exercice.b, suffixe: "x" }]);
        return `\\left(${uPrime}\\right)e^{${p}} + \\left(${p}\\right)\\left(${uPrime}\\right)e^{${p}}`;
      }
      if (exercice.sousType === "e") {
        const u = `x^{${exercice.r}}`;
        const uPrime = exercice.r === 1 ? "1" : `${exercice.r}x`;
        return `\\left(${uPrime}\\right)e^{\\sqrt{x}} + ${u}\\cdot\\dfrac{1}{2\\sqrt{x}}\\cdot e^{\\sqrt{x}}`;
      }
      const u = `${exercice.base}^x-${exercice.c}`;
      const uPrime = `\\ln(${exercice.base})\\cdot ${exercice.base}^x`;
      const v = exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
      const vPrime = exercice.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
      return `\\left(${uPrime}\\right)${v} + \\left(${u}\\right)\\left(${vPrime}\\right)`;
    }
    case "D": {
      const base = exercice.baseEstE ? "e" : String(exercice.base);
      if (exercice.sousType === "f") {
        const n = `${base}^x+${exercice.c}`;
        const d = exercice.k === 1 ? "x" : `${exercice.k}x`;
        const nPrime = `\\ln(${base})\\cdot ${base}^x`;
        return `\\dfrac{\\left(${nPrime}\\right)(${d})-(${n})(${exercice.k})}{(${d})^2}`;
      }
      if (exercice.sousType === "h") {
        const n = `${base}^x+${base}^{-x}`;
        const d = `x^2+${exercice.c}`;
        const nPrime = `\\ln(${base})\\cdot(${base}^x-${base}^{-x})`;
        return `\\dfrac{\\left(${nPrime}\\right)(${d})-(${n})(2x)}{(${d})^2}`;
      }
      if (exercice.sousType === "i") {
        const n = exercice.k === 1 ? "x^2" : `${exercice.k}x^2`;
        const d = `${base}^{${exercice.m === 1 ? "x" : `${exercice.m}x`}}+${exercice.c}`;
        const nPrime = exercice.k === 1 ? "2x" : `${2 * exercice.k}x`;
        const dPrime = `${exercice.m}\\ln(${base})\\cdot ${base}^{${exercice.m === 1 ? "x" : `${exercice.m}x`}}`;
        return `\\dfrac{\\left(${nPrime}\\right)(${d})-(${n})\\left(${dPrime}\\right)}{(${d})^2}`;
      }
      const n = `${base}^{-x}-${base}^x`;
      const d = `${base}^{2x}+1`;
      const nPrime = `-\\ln(${base})\\cdot(${base}^{-x}+${base}^x)`;
      const dPrime = `2\\ln(${base})\\cdot ${base}^{2x}`;
      return `\\dfrac{\\left(${nPrime}\\right)(${d})-(${n})\\left(${dPrime}\\right)}{(${d})^2}`;
    }
    case "E": {
      if (exercice.sousType === "j") {
        const b = formatBase(exercice.base, exercice.baseEstE);
        const [g3, g2, g1] = coeffsGA(exercice.g);
        const [h3, h2, h1] = coeffsGA(exercice.h);
        const exposantCombine = formatGAMoinsGA(exercice.g, exercice.h);
        const deriveeExposant = formatSommeTermes([{ valeur: 3 * (g3 - h3), suffixe: "x^2" }, { valeur: 2 * (g2 - h2), suffixe: "x" }, { valeur: g1 - h1, suffixe: "" }]);
        return `\\left(${deriveeExposant}\\right)\\cdot\\ln(${b})\\cdot ${b}^{${exposantCombine}}`;
      }
      if (exercice.sousType === "m") {
        const b = formatBase(exercice.base, exercice.baseEstE);
        return `\\ln(${b})\\cdot ${b}^{-x}`;
      }
      const termeC = exercice.c === 1 ? `\\left(\\dfrac{1}{${exercice.base2}}\\right)^x` : `${exercice.c}\\cdot\\left(\\dfrac{1}{${exercice.base2}}\\right)^x`;
      return `\\ln\\left(\\dfrac{${exercice.base1}}{${exercice.base2}}\\right)\\cdot\\left(\\dfrac{${exercice.base1}}{${exercice.base2}}\\right)^x-\\ln\\left(\\dfrac{1}{${exercice.base2}}\\right)\\cdot ${termeC}`;
    }
    case "F": {
      const w = `e^{x^2-${exercice.k}}`;
      const wPrime = `2x\\cdot ${w}`;
      const trigPrime = exercice.trig === "cos" ? `-\\sin\\left(${w}\\right)` : `-\\dfrac{1}{\\sqrt{1-\\left(${w}\\right)^2}}`;
      return `\\left(${trigPrime}\\right)\\cdot\\left(${wPrime}\\right)`;
    }
  }
}

function construireEnonceDomaineDeriveeExponentielles(exercice: ExerciceDomaineDeriveeExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE), latex(formatFonctionLatex(exercice))],
    questions: [
      { consigne: [texte("Détermine le domaine de définition de f.")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Calcule la dérivée f'(x).")], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionDomaineDeriveeExponentielles(exercice: ExerciceDomaineDeriveeExponentielle): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine)), texte(".")] },
    { type: "paragraphe", fragments: [texte("b) "), latex(`f'(x) = ${formatDeriveeLatex(exercice)}`)] },
  ];
}

export const adaptateurEvaluationDomaineDeriveeExponentielles: AdaptateurFeuilleExercices<ExerciceDomaineDeriveeExponentielle> = {
  titreDocument: "Domaine et dérivée (fonctions exponentielles) — Évaluation",
  nomFichierBase: "domaine-derivee-exponentielles",
  genererInstance: genererExerciceDomaineDeriveeExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceDomaineDeriveeExponentielles,
  construireCorrection: construireCorrectionDomaineDeriveeExponentielles,
};
