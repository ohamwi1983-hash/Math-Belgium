import type {
  ExerciceDomaineDeriveeLogA,
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogD,
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogF,
  ExerciceDomaineDeriveeLogG,
  ExerciceDomaineDeriveeLogarithme,
  FamilleDomaineDeriveeLogarithme,
} from "../../core6e/domaineDeriveeLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { aideNiveau2, blocDonnees, consigneEcran } from "../../ui6e/formatDomaineDeriveeLogarithme";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme>` pour `6gen16` (Domaine,
 * dérivée et dérivation logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (une seule question générique par instance), les 7
 * familles A-G de ce générateur ont un nombre d'écrans DIFFÉRENT (2 pour A/B/F, 3 pour C/D/E/G) et
 * une consigne d'en-tête qui dépend de la formule tirée (`blocDonnees`) — jamais `regroupable`
 * (aucune des 3 conditions de `AdaptateurFeuilleExercices.regroupable` n'est réunie : ni question
 * unique, ni consigne générique indépendante de l'instance). Chaque question écrite correspond
 * exactement à un écran interactif réel (voir `moteur6e/typesDomaineDeriveeLogarithme.ts::phaseApres`
 * pour la liste des écrans par famille) — jamais une question inventée.
 *
 * Réutilise au maximum les fonctions déjà EXPORTÉES de `ui6e/formatDomaineDeriveeLogarithme.ts`
 * (`blocDonnees` pour l'énoncé de f(x), `consigneEcran` pour le texte de chaque question,
 * `aideNiveau2` quand son contenu EST déjà la réponse finale substituée — familles A, B hors
 * `doubleContrainte` — jamais recalculé indépendamment dans ces cas). Quand aucune fonction
 * exportée ne donne la réponse finale (les aides de niveau 2 de C/D/E/F/G ne révèlent que des
 * ÉTAPES intermédiaires, jamais l'assemblage final — cohérent avec la pédagogie interactive), les
 * fonctions `facteursLatexC`/`ndLatexD`/`uvLatexG`/`formeSimplifieeLatexE` ci-dessous sont des
 * copies EXACTES des fonctions privées homonymes de `ui6e/formatDomaineDeriveeLogarithme.ts` (non
 * exportées là-bas, non modifiables ici — contrainte "ne toucher aucun autre fichier"), et les
 * dérivées finales (`deriveeSimplifieeLatexE`, `deriveeLatexF`, `derivesUVLatexG`) sont des
 * transcriptions directes des formules de référence NUMÉRIQUES déjà vérifiées de
 * `moteur6e/verificationDomaineDeriveeLogarithme.ts` (`deriveeSimplifieeE`, `referenceFDerivee`,
 * `uvDeG`) — vérifiées par échantillonnage contre les fonctions `diagnostiquerXxx` exportées de ce
 * même fichier lors de l'écriture de cet adaptateur (voir le script jetable de vérification, non
 * conservé dans le dépôt).
 */

// ============================================================================
// Petits formateurs locaux partagés.
// ============================================================================

/** `mx+n` / `mx-|n|` / `x` / `-x` selon signes — même convention que `formatSommeTermes` (privée à
 * `ui6e/formatDomaineDeriveeLogarithme.ts`), jamais de coefficient ±1 littéral. */
function formatAffine(m: number, n: number): string {
  const mPart = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (n === 0) return mPart;
  return n > 0 ? `${mPart}+${n}` : `${mPart}-${-n}`;
}

function entete(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice["enteteFragments"] {
  return [latex(blocDonnees(exercice)[0])];
}

// ============================================================================
// Famille A — 2 questions (domaine, dérivée). Réponse finale de dérivée = `aideNiveau2` (déjà la
// forme substituée, non simplifiée, acceptée par le moteur de vérification interactif).
// ============================================================================

function construireEnonceA(exercice: ExerciceDomaineDeriveeLogA): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "aDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "aDerivee"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionA(exercice: ExerciceDomaineDeriveeLogA): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine))] },
    { type: "paragraphe", fragments: [texte("b) f'(x) = "), latex(aideNiveau2(exercice, "aDerivee").latex ?? "")] },
  ];
}

// ============================================================================
// Famille B — 2 questions (domaine, dérivée). 3 sous-types sur 4 : `aideNiveau2` donne déjà la
// forme finale substituée. Sous-type `doubleContrainte` : l'aide ne donne que u/u' (pas encore
// assemblés, voir `ui6e/formatDomaineDeriveeLogarithme.ts::aideBNiveau2`) — assemblage fait ici
// via `-w'/(2√(1-w))`, transcription directe de `referenceBDerivee` (`verificationDomaineDeriveeLogarithme.ts`).
// ============================================================================

function deriveeLatexB(exercice: ExerciceDomaineDeriveeLogB): string {
  if (exercice.sousType !== "doubleContrainte") return aideNiveau2(exercice, "bDerivee").latex ?? "";
  const { base, m, n } = exercice;
  const arg = formatAffine(m, n);
  return `-\\dfrac{\\dfrac{${m}}{(${arg})\\cdot\\ln(${base})}}{2\\sqrt{1-\\log_{${base}}(${arg})}}`;
}

function construireEnonceB(exercice: ExerciceDomaineDeriveeLogB): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "bDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "bDerivee"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionB(exercice: ExerciceDomaineDeriveeLogB): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine))] },
    { type: "paragraphe", fragments: [texte("b) f'(x) = "), latex(deriveeLatexB(exercice))] },
  ];
}

// ============================================================================
// Famille C — 3 questions (domaine, facteurs u'/v', assemblage). `facteursLatexC` = copie exacte
// de la fonction privée homonyme de `ui6e/formatDomaineDeriveeLogarithme.ts`.
// ============================================================================

function facteursLatexC(exercice: ExerciceDomaineDeriveeLogC): { u: string; uPrime: string; v: string; vPrime: string } {
  if (exercice.sousType === "produitLn") return { u: `${exercice.k}x`, uPrime: `${exercice.k}`, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  if (exercice.sousType === "trigLn") {
    const trig = exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trigPrime = exercice.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
    const trig2 = exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trig2Prime = exercice.trig2 === "sin" ? "\\cos(x)" : "-\\sin(x)";
    return { u: trig, uPrime: trigPrime, v: `\\ln(2+${trig2})`, vPrime: `\\dfrac{${trig2Prime}}{2+${trig2}}` };
  }
  if (exercice.sousType === "expoLn") {
    const b = exercice.baseEstE ? "e" : String(exercice.base);
    const uPrime = exercice.baseEstE ? "e^x" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x`;
    return { u: `${b}^x`, uPrime, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  }
  if (exercice.sousType === "carreLn") {
    const arg = formatAffine(exercice.m, exercice.n);
    return { u: "x^2", uPrime: "2x", v: `\\ln(${arg})`, vPrime: `\\dfrac{${exercice.m}}{${arg}}` };
  }
  const { k } = exercice;
  return { u: "\\ln(x)", uPrime: "\\dfrac{1}{x}", v: `\\sqrt{x^2-${k}^2}`, vPrime: `\\dfrac{x}{\\sqrt{x^2-${k}^2}}` };
}

function construireEnonceC(exercice: ExerciceDomaineDeriveeLogC): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "cDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "cFacteurs"))], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(consigneEcran(exercice, "cAssemblage"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionC(exercice: ExerciceDomaineDeriveeLogC): BlocCorrection[] {
  const { u, uPrime, v, vPrime } = facteursLatexC(exercice);
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine))] },
    { type: "paragraphe", fragments: [texte("b) "), latex(`u'(x) = ${uPrime}`), texte(" ; "), latex(`v'(x) = ${vPrime}`)] },
    { type: "paragraphe", fragments: [texte("c) f'(x) = u'v + uv' = "), latex(`(${uPrime})\\cdot ${v} + ${u}\\cdot(${vPrime})`)] },
  ];
}

// ============================================================================
// Famille D — 3 questions (domaine, N'/D', assemblage). `ndLatexD` = copie exacte de la fonction
// privée homonyme (`nDLatexD`) de `ui6e/formatDomaineDeriveeLogarithme.ts`.
// ============================================================================

function ndLatexD(exercice: ExerciceDomaineDeriveeLogD): { n: string; nPrime: string; d: string; dPrime: string } {
  if (exercice.sousType === "sommeLog") {
    const n = exercice.baseEstE ? "x+\\ln(x)" : `x+\\log_{${exercice.base}}(x)`;
    const nPrime = exercice.baseEstE ? "1+\\dfrac{1}{x}" : `1+\\dfrac{1}{x\\ln(${exercice.base})}`;
    return { n, nPrime, d: "x", dPrime: "1" };
  }
  if (exercice.sousType === "lnSurKx") return { n: "\\ln(x)", nPrime: "\\dfrac{1}{x}", d: `${exercice.k}x`, dPrime: `${exercice.k}` };
  const b = exercice.baseEstE ? "e" : String(exercice.base);
  const n = `${b}^x+x`;
  const nPrime = exercice.baseEstE ? "e^x+1" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x+1`;
  return { n, nPrime, d: "\\ln(x)", dPrime: "\\dfrac{1}{x}" };
}

function construireEnonceD(exercice: ExerciceDomaineDeriveeLogD): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "dDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "dND"))], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(consigneEcran(exercice, "dAssemblage"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionD(exercice: ExerciceDomaineDeriveeLogD): BlocCorrection[] {
  const { n, nPrime, d, dPrime } = ndLatexD(exercice);
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine))] },
    { type: "paragraphe", fragments: [texte("b) "), latex(`N'(x) = ${nPrime}`), texte(" ; "), latex(`D'(x) = ${dPrime}`)] },
    { type: "paragraphe", fragments: [texte("c) f'(x) = "), latex(`\\dfrac{(${nPrime})\\cdot(${d}) - (${n})\\cdot(${dPrime})}{(${d})^2}`)] },
  ];
}

// ============================================================================
// Famille E — 3 questions (domaine sur l'expression ORIGINALE, simplifier, dérivée de la forme
// simplifiée). `formeSimplifieeLatexE` = copie exacte de la fonction privée homonyme de
// `ui6e/formatDomaineDeriveeLogarithme.ts`. `deriveeSimplifieeLatexE` = transcription directe de
// `deriveeSimplifieeE` (numérique, `verificationDomaineDeriveeLogarithme.ts`) — aucune fonction
// exportée ne donne cette dérivée finale (l'aide de niveau 2 de l'écran `eDerivee` ne fait que
// rappeler la forme À dériver, jamais le résultat, spec explicite "accepte toute forme équivalente").
// ============================================================================

function formeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "2\\ln\\left|e^x-1\\right|";
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      return `\\ln(${formatAffine(m, n)})-\\ln(${formatAffine(p, q)})`;
    }
    case "puissanceSimple":
      return "\\dfrac{1}{2}\\ln(x)";
    case "combinaison":
      return "(\\ln x)^3-3\\ln(x)";
    case "valeurAbsolueQuadratique":
      return `2\\ln\\left|x^2-${exercice.k}^2\\right|`;
    case "dejaSimplifie":
      return "x\\ln(x)";
  }
}

function deriveeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "\\dfrac{2e^x}{e^x-1}";
    case "quotientDifference": {
      const { m, n, p, q } = exercice;
      return `\\dfrac{${m}}{${formatAffine(m, n)}}-\\dfrac{${p}}{${formatAffine(p, q)}}`;
    }
    case "puissanceSimple":
      return "\\dfrac{1}{2x}";
    case "combinaison":
      return "\\dfrac{3(\\ln x)^2}{x}-\\dfrac{3}{x}";
    case "valeurAbsolueQuadratique":
      return `\\dfrac{4x}{x^2-${exercice.k}^2}`;
    case "dejaSimplifie":
      return "\\ln(x)+1";
  }
}

function construireEnonceE(exercice: ExerciceDomaineDeriveeLogE): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "eDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "eSimplifier"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "eDerivee"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionE(exercice: ExerciceDomaineDeriveeLogE): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) Domaine (sur l'expression originale) : "), latex(formatEnsembleReelLatex(exercice.domaine))] },
    { type: "paragraphe", fragments: [texte("b) Forme simplifiée : f(x) = "), latex(formeSimplifieeLatexE(exercice))] },
    { type: "paragraphe", fragments: [texte("c) f'(x) = "), latex(deriveeSimplifieeLatexE(exercice))] },
  ];
}

// ============================================================================
// Famille F — 2 questions (domaine, dérivée). Aucune fonction exportée ne donne la dérivée finale
// (l'aide de niveau 2 de l'écran `fDerivee` reste volontairement muette sur le résultat, spec
// "synthèse transversale") — `deriveeLatexF` transcrit directement `referenceFDerivee` (numérique,
// `verificationDomaineDeriveeLogarithme.ts`).
// ============================================================================

function deriveeLatexF(exercice: ExerciceDomaineDeriveeLogF): string {
  switch (exercice.sousType) {
    case "lnSurSin":
      return "\\dfrac{\\cos(e^x)\\cdot e^x\\cdot\\left(1-\\ln(2+\\sin(e^x))\\right)}{\\left(2+\\sin(e^x)\\right)^2}";
    case "arcsinLog": {
      const { p } = exercice;
      return `\\dfrac{${p}}{\\sqrt{1-(${p}x)^2}}`;
    }
    case "racineArcsin":
      return "\\dfrac{-\\dfrac{e^x}{2\\sqrt{1-e^x}}}{\\sqrt{1-\\left(\\sqrt{1-e^x}\\right)^2}}";
    case "arctanLog":
      return "\\dfrac{\\dfrac{2}{1+4x^2}\\cdot\\left(1-\\log_{10}(2x)\\right) - \\arctan(2x)\\cdot\\left(-\\dfrac{1}{x\\ln(10)}\\right)}{\\left(1-\\log_{10}(2x)\\right)^2}";
  }
}

function construireEnonceF(exercice: ExerciceDomaineDeriveeLogF): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "fDomaine"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "fDerivee"))], reponse: { type: "lignes", nombre: 4 } },
    ],
  };
}

function construireCorrectionF(exercice: ExerciceDomaineDeriveeLogF): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: [texte("a) Domaine : "), latex(formatEnsembleReelLatex(exercice.domaine))] }];
  if (exercice.sousType === "arcsinLog") {
    const { base, k, p } = exercice;
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte("b) On a "),
        latex(`\\log_{${base}}(${k}^x) = ${p}x`),
        texte(" (car "),
        latex(`${k} = ${base}^{${p}}`),
        texte("), donc f'(x) = "),
        latex(deriveeLatexF(exercice)),
      ],
    });
  } else {
    blocs.push({ type: "paragraphe", fragments: [texte("b) f'(x) = "), latex(deriveeLatexF(exercice))] });
  }
  return blocs;
}

// ============================================================================
// Famille G — 3 questions (identifier u^v, f'/f, isoler f'), AUCUN écran de domaine (voir
// `core6e/domaineDeriveeLogarithme.types.ts`, hypothèse "bases supposées strictement positives").
// `uvLatexG` = copie exacte de la fonction privée homonyme de `ui6e/formatDomaineDeriveeLogarithme.ts`.
// `derivesUVLatexG` transcrit directement `uvDeG` (numérique, `verificationDomaineDeriveeLogarithme.ts`)
// — u'/v' n'apparaissent dans AUCUNE aide exportée (seuls u/v y figurent). Sous-type "produit" :
// u/v désignent UNIQUEMENT la partie puissance x^(-(1+x)), jamais f(x) entier (même convention que
// le moteur) — `isolerLatexG` applique alors la règle du produit avec le facteur affine (1+x),
// transcription de `referenceGIsoler`.
// ============================================================================

function uvLatexG(exercice: ExerciceDomaineDeriveeLogG): { u: string; v: string } {
  switch (exercice.variante) {
    case "xx":
      return { u: "x", v: "x" };
    case "xSinx":
      return { u: "x", v: "\\sin(x)" };
    case "cosTan":
      return { u: "\\cos(x)", v: "\\tan(x)" };
    case "unSurXPuissanceX":
      return { u: "1+\\dfrac{1}{x}", v: "x" };
    case "sinXInvX":
      return { u: "\\sin(x)", v: "\\dfrac{1}{x}" };
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return { u: "x", v: "1+\\dfrac{x}{2}" };
    case "produit":
      return { u: "x", v: "-(1+x)" };
  }
}

function derivesUVLatexG(exercice: ExerciceDomaineDeriveeLogG): { uPrime: string; vPrime: string } {
  switch (exercice.variante) {
    case "xx":
      return { uPrime: "1", vPrime: "1" };
    case "xSinx":
      return { uPrime: "1", vPrime: "\\cos(x)" };
    case "cosTan":
      return { uPrime: "-\\sin(x)", vPrime: "\\dfrac{1}{\\cos^2(x)}" };
    case "unSurXPuissanceX":
      return { uPrime: "-\\dfrac{1}{x^2}", vPrime: "1" };
    case "sinXInvX":
      return { uPrime: "\\cos(x)", vPrime: "-\\dfrac{1}{x^2}" };
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return { uPrime: "1", vPrime: "\\dfrac{1}{2}" };
    case "produit":
      return { uPrime: "1", vPrime: "-1" };
  }
}

function fPrimeSurFLatexG(exercice: ExerciceDomaineDeriveeLogG): string {
  const { u, v } = uvLatexG(exercice);
  const { uPrime, vPrime } = derivesUVLatexG(exercice);
  return `(${vPrime})\\cdot\\ln(${u}) + \\dfrac{(${v})\\cdot(${uPrime})}{${u}}`;
}

function isolerLatexG(exercice: ExerciceDomaineDeriveeLogG): string {
  const { u, v } = uvLatexG(exercice);
  const gLatex = `(${u})^{${v}}`;
  const fSurF = fPrimeSurFLatexG(exercice);
  if (exercice.variante !== "produit") return `${gLatex}\\cdot\\left(${fSurF}\\right)`;
  return `${gLatex} + (1+x)\\cdot ${gLatex}\\cdot\\left(${fSurF}\\right)`;
}

function construireEnonceG(exercice: ExerciceDomaineDeriveeLogG): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(consigneEcran(exercice, "gIdentifier"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "gFPrimeSurF"))], reponse: { type: "lignes", nombre: 3 } },
      { consigne: [texte(consigneEcran(exercice, "gIsoler"))], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionG(exercice: ExerciceDomaineDeriveeLogG): BlocCorrection[] {
  const { u, v } = uvLatexG(exercice);
  const noteProduit = exercice.variante === "produit" ? " (partie « puissance » uniquement — le facteur (1+x) est traité séparément en c)" : "";
  return [
    {
      type: "paragraphe",
      fragments: [texte("a) u(x) = "), latex(u), texte(", v(x) = "), latex(v), texte(", donc f(x) = "), latex(`(${u})^{${v}}`), texte(noteProduit)],
    },
    { type: "paragraphe", fragments: [texte("b) f'/f = "), latex(fPrimeSurFLatexG(exercice))] },
    { type: "paragraphe", fragments: [texte("c) f'(x) = "), latex(isolerLatexG(exercice))] },
  ];
}

// ============================================================================
// Dispatch public + export de l'adaptateur.
// ============================================================================

function construireEnonceDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice {
  switch (exercice.famille) {
    case "A":
      return construireEnonceA(exercice);
    case "B":
      return construireEnonceB(exercice);
    case "C":
      return construireEnonceC(exercice);
    case "D":
      return construireEnonceD(exercice);
    case "E":
      return construireEnonceE(exercice);
    case "F":
      return construireEnonceF(exercice);
    case "G":
      return construireEnonceG(exercice);
  }
}

function construireCorrectionDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): BlocCorrection[] {
  switch (exercice.famille) {
    case "A":
      return construireCorrectionA(exercice);
    case "B":
      return construireCorrectionB(exercice);
    case "C":
      return construireCorrectionC(exercice);
    case "D":
      return construireCorrectionD(exercice);
    case "E":
      return construireCorrectionE(exercice);
    case "F":
      return construireCorrectionF(exercice);
    case "G":
      return construireCorrectionG(exercice);
  }
}

export const adaptateurEvaluationDomaineDeriveeLogarithme: AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme> = {
  titreDocument: "Domaine, dérivée et dérivation logarithmique — Évaluation",
  nomFichierBase: "domaine-derivee-logarithme",
  genererInstance: genererExerciceDomaineDeriveeLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleDomaineDeriveeLogarithme),
  construireEnonce: construireEnonceDomaineDeriveeLogarithme,
  construireCorrection: construireCorrectionDomaineDeriveeLogarithme,
  // Nombre de questions VARIABLE selon la famille (2 pour A/B/F, 3 pour C/D/E/G) et en-tête
  // dépendant de l'instance (`blocDonnees`) — aucune des conditions de `regroupable` n'est réunie.
};
