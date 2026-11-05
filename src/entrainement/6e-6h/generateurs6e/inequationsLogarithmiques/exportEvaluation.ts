import type {
  BaseLog,
  Comparateur,
  ExerciceInequationLogarithmique,
  ExerciceLogA,
  ExerciceLogB,
  ExerciceLogC,
  ExerciceLogD,
  ExerciceLogE,
  ExerciceLogF,
} from "../../core6e/inequationsLogarithmiques.types";
import type { EnsembleReelGuide } from "../../core6e/ensembleReel.types";
import type {
  AdaptateurFeuilleExercices, EnoncePapier,
  BaremeExercice,
  BlocCorrection,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
  ZoneReponse,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale, type PhaseInequationLogarithmique } from "../../moteur6e/typesInequationsLogarithmiques";
import {
  CONSIGNE_GENERALE,
  LIBELLE_PHASE_LOG,
  baseLatex,
  consigneEcran,
  contenuRecapPhase,
  formatAffineLatex,
  formatCarreXMoinsR,
  formatCombinaisonC,
  formatEnonceLatex,
  formatQuadratiqueYLatex,
  inverserComparateurLatex,
  logBaseLatex,
  puissanceBaseLatex,
  symboleComparateurLatex,
} from "../../ui6e/formatInequationsLogarithmiques";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { formatFractionLatex } from "../../ui6e/formatFraction";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationLogarithmique, type IdVarianteInequationLogarithmique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationLogarithmique>` pour `6gen15` (Résoudre
 * une inéquation logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * 6 familles STRUCTURELLEMENT DISJOINTES, 1 à 4 écrans guidés côté interactif
 * (`typesInequationsLogarithmiques.ts::phaseInitiale`/`phaseApres`) — jamais un nombre fixe de
 * questions : `phasesDeLaFamille` rejoue exactement le même parcours que la session interactive
 * pour l'instance tirée, et chaque écran réellement traversé devient UNE question a)/b)/c)…
 * `consigneEcran` (côté consigne) et `contenuRecapPhase` (côté corrigé) sont les mêmes fonctions
 * déjà utilisées par `App6gen15.tsx`/`ResultatPanelInequationLogarithmique` — jamais recalculées
 * indépendamment ici.
 */

function phasesDeLaFamille(exercice: ExerciceInequationLogarithmique): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase: PhaseInequationLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

/** Taille de la zone de réponse — écrans "CE"/réécriture/simplification : courts (poser une ou deux
 * conditions) ; écrans "résoudre"/"comparer"/"convertir" : plus longs (tableau de signes puis
 * intersection rédigés en ligne). Même ordre de grandeur que les autres adaptateurs 6e du chantier
 * (2-3 lignes). */
function reponsePourPhase(phase: PhaseInequationLogarithmique): ZoneReponse {
  switch (phase) {
    case "aCE":
    case "bCE":
    case "cCE":
    case "dCE":
    case "fCE":
    case "eReconnaitre":
    case "cCombiner":
    case "dReecrire":
    case "fSimplifier":
      return { type: "lignes", nombre: 2 };
    case "aResoudre":
    case "bResoudre":
    case "cComparer":
    case "eResoudre":
    case "dResoudreY":
    case "dConvertirX":
    case "fConclure":
      return { type: "lignes", nombre: 3 };
  }
}

function construireEnonceInequationsLogarithmiques(exercice: ExerciceInequationLogarithmique): SectionExercice {
  const phases = phasesDeLaFamille(exercice);
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(exercice))],
    questions: phases.map((phase) => ({
      consigne: consigneEcran(phase, exercice),
      reponse: reponsePourPhase(phase),
    })),
  };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrectionInequationsLogarithmiques(exercice: ExerciceInequationLogarithmique): BlocCorrection[] {
  const phases = phasesDeLaFamille(exercice);
  return phases.map((phase, i) => {
    const lettre = LETTRES[i] ?? String(i + 1);
    const { texte: texteRecap, latex: latexRecap } = contenuRecapPhase(exercice, phase);
    return {
      type: "paragraphe",
      fragments: [texte(`${lettre}) ${LIBELLE_PHASE_LOG[phase]} : `), ...(latexRecap !== null ? [latex(latexRecap)] : [texte(texteRecap ?? "")]), texte(".")],
    };
  });
}

// ============================================================================
// Feuilles enrichies (corrigé détaillé, barème). Les ensembles intermédiaires
// et finals viennent TOUJOURS de l'instance (`ceEcran1`, `solutionEcran2`… — les mêmes champs que
// vérifie l'écran interactif et qu'affiche `construireCorrection` via `contenuRecapPhase`) ; seules
// les égalités de passage (argument ↔ puissance de la base, différence factorisée…) sont
// réécrites ici depuis les paramètres tirés. Barème : 4 critères d'1 point, en correspondance 1-1
// avec les 4 étapes du corrigé.
// ============================================================================

const DUREE_MINUTES_INEQUATIONS_LOG = 6;

/** Ensemble en LaTeX — `\varnothing` pour un ensemble vide (jamais une chaîne vide). */
function ensembleLatex(ensemble: EnsembleReelGuide): string {
  return ensemble.forme === "intervalles" && ensemble.morceaux.length === 0 ? "\\varnothing" : formatEnsembleReelLatex(ensemble);
}

function sym(cmp: Comparateur): string {
  return symboleComparateurLatex(cmp);
}

/** Comparateur sur les ARGUMENTS : conservé si base > 1, inversé si 0 < base < 1. */
function comparateurArguments(ex: { baseSuperieureA1: boolean; comparateur: Comparateur }): Comparateur {
  return ex.baseSuperieureA1 ? ex.comparateur : inverserComparateurLatex(ex.comparateur);
}

function phraseSens(ex: { baseSuperieureA1: boolean; base: BaseLog }): FragmentConsigne[] {
  return ex.baseSuperieureA1
    ? [texte("Base "), latex(`${baseLatex(ex.base)}>1`), texte(" : le logarithme est croissant, le sens de l'inégalité est CONSERVÉ.")]
    : [texte("Base "), latex(`0<${baseLatex(ex.base)}<1`), texte(" : le logarithme est décroissant, le sens de l'inégalité est INVERSÉ.")];
}

/** `base^k` en fraction exacte {num, den} (base = num/den, k entier relatif). */
function puissanceExacte(base: BaseLog, k: number): { num: number; den: number } {
  return k >= 0 ? { num: Math.pow(base.num, k), den: Math.pow(base.den, k) } : { num: Math.pow(base.den, -k), den: Math.pow(base.num, -k) };
}

/** Solution de `m·x + c [cmp] 0` (m ≠ 0) : « x [cmp'] −c/m », sens inversé si m < 0. */
function resoudrePremierDegreLatex(m: number, c: number, cmp: Comparateur): string {
  const cmpX = m > 0 ? cmp : inverserComparateurLatex(cmp);
  return `x ${sym(cmpX)} ${formatFractionLatex(-c, m)}`;
}

function sCorrige(ensemble: EnsembleReelGuide): FragmentConsigne[] {
  return [latex(`S=${ensembleLatex(ensemble)}`)];
}

function reponseBreveInequationsLog(exercice: ExerciceInequationLogarithmique): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return sCorrige(exercice.solutionEcran2);
    case "B":
      return sCorrige(exercice.solutionEcran2);
    case "C":
      return sCorrige(exercice.solutionEcran3);
    case "D":
      return sCorrige(exercice.solutionEcran4);
    case "E":
      return sCorrige(exercice.ceCompatible ? exercice.solution : exercice.ceEcran1);
    case "F": {
      const vide: EnsembleReelGuide = { forme: "intervalles", points: [], morceaux: [] };
      const sup = exercice.casVideEstSuperieurA1 ? vide : exercice.ensembleSansR;
      const inf = exercice.casVideEstSuperieurA1 ? exercice.ensembleSansR : vide;
      return [texte("si "), latex("a>1"), texte(" : "), latex(`S=${ensembleLatex(sup)}`), texte(" ; si "), latex("0<a<1"), texte(" : "), latex(`S=${ensembleLatex(inf)}`)];
    }
  }
}

function difficulteInequationsLog(exercice: ExerciceInequationLogarithmique): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return exercice.baseSuperieureA1 && exercice.m > 0 ? 1 : 2;
    case "B":
      return exercice.sousType === "racine" ? 3 : 2;
    case "C":
      return exercice.sousType === "produit" ? 3 : 2;
    case "D":
      return 3;
    case "E":
      return 2;
    case "F":
      return 3;
  }
}

// ---------------------------------------------------------------------------- Famille A

function passageA(ex: ExerciceLogA): { egalite: string; solution: string } {
  const bk = puissanceExacte(ex.base, ex.k);
  const cmp = comparateurArguments(ex);
  const affine = formatAffineLatex({ m: ex.m, n: ex.n });
  return {
    egalite: `${affine} ${sym(cmp)} ${puissanceBaseLatex(ex.base, ex.k)} = ${formatFractionLatex(bk.num, bk.den)}`,
    // m·x + n − P/Q [cmp] 0  ⟺  x [cmp'] (P − nQ)/(mQ)
    solution: resoudrePremierDegreLatex(ex.m * bk.den, ex.n * bk.den - bk.num, cmp),
  };
}

function correctionA(ex: ExerciceLogA): EtapeCorrection[] {
  const bl = baseLatex(ex.base);
  const { egalite, solution } = passageA(ex);
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`${formatAffineLatex({ m: ex.m, n: ex.n })}>0`), texte(", soit "), latex(`\\text{CE} : x\\in ${ensembleLatex(ex.ceEcran1)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("On écrit "), latex(`${ex.k}=${logBaseLatex(bl, puissanceBaseLatex(ex.base, ex.k))}`), texte(". "), ...phraseSens(ex)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(egalite), texte(", donc "), latex(solution), texte(".")] },
    { label: "Vérification", sousQuestion: "b", fragments: [texte("Intersection avec la CE "), latex(ensembleLatex(ex.ceEcran1)), texte(".")] },
    { label: "Conclusion", fragments: sCorrige(ex.solutionEcran2) },
    {
      label: "Piège",
      fragments: !ex.baseSuperieureA1
        ? [texte("Base entre 0 et 1 : on inverse le sens en enlevant le logarithme.")]
        : ex.m < 0
          ? [texte("Diviser par "), latex(String(ex.m)), texte(" (négatif) inverse le sens de l'inégalité.")]
          : [texte("Sans l'intersection avec la CE, on garderait des x pour lesquels le logarithme n'existe pas.")],
    },
  ];
}

function baremeA(ex: ExerciceLogA): BaremeExercice {
  const { egalite, solution } = passageA(ex);
  const erreurs: ErreurFrequente[] = [];
  if (!ex.baseSuperieureA1) erreurs.push({ description: [texte("Sens non inversé alors que la base est entre 0 et 1")], cout: "−1" });
  if (ex.m < 0) erreurs.push({ description: [texte("Sens non inversé en divisant par "), latex(String(ex.m))], cout: "−1" });
  erreurs.push({ description: [texte("Intersection avec la CE oubliée")], cout: "−1" });
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex(`x\\in ${ensembleLatex(ex.ceEcran1)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Enlève le logarithme avec le bon sens : "), latex(egalite)], points: 1 },
      { sousQuestion: "b", critere: [texte("Résout : "), latex(solution)], points: 1 },
      { sousQuestion: "b", critere: [texte("Intersecte avec la CE : "), ...sCorrige(ex.solutionEcran2)], points: 1 },
    ],
    erreursFrequentes: erreurs.slice(0, 3),
    reponsesAcceptees: [[texte("Solution écrite sous forme d'inégalités (ex. "), latex("a<x\\le b"), texte(")")]],
  };
}

// ---------------------------------------------------------------------------- Famille B

function argumentGaucheB(ex: ExerciceLogB): string {
  return ex.sousType === "racine" ? formatAffineLatex({ m: ex.a, n: ex.b }) : formatAffineLatex(ex.f);
}

/** Passage aux arguments (avec élévation au carré pour la racine) et inéquation obtenue. */
function passageB(ex: ExerciceLogB): { comparaison: string; resolution: string } {
  const cmp = comparateurArguments(ex);
  const g = formatAffineLatex(ex.g);
  if (ex.sousType === "racine") {
    // (ax+b) − g² = −m²·(x − z1)(x − z2) par construction (voir familles/B.ts).
    const coef = -ex.g.m * ex.g.m;
    const facteurs = `\\left(${formatAffineLatex({ m: 1, n: -ex.z1 })}\\right)\\left(${formatAffineLatex({ m: 1, n: -ex.z2 })}\\right)`;
    return {
      comparaison: `\\sqrt{${argumentGaucheB(ex)}} ${sym(cmp)} ${g} \\iff ${argumentGaucheB(ex)} ${sym(cmp)} \\left(${g}\\right)^{2}`,
      resolution: `${coef === -1 ? "-" : coef}${facteurs} ${sym(cmp)} 0 \\iff x\\in ${ensembleLatex(ex.comparaisonBruteEcran2)}`,
    };
  }
  return {
    comparaison: `${formatAffineLatex(ex.f)} ${sym(cmp)} ${g}`,
    resolution: resoudrePremierDegreLatex(ex.f.m - ex.g.m, ex.f.n - ex.g.n, cmp),
  };
}

function correctionB(ex: ExerciceLogB): EtapeCorrection[] {
  const { comparaison, resolution } = passageB(ex);
  const etapes: EtapeCorrection[] = [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`${argumentGaucheB(ex)}>0`), texte(" et "), latex(`${formatAffineLatex(ex.g)}>0`), texte(", soit "), latex(`\\text{CE} : x\\in ${ensembleLatex(ex.ceEcran1)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Même base des deux côtés : on compare les arguments. "), ...phraseSens(ex)] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(comparaison), texte(", donc "), latex(resolution), texte(".")] },
  ];
  if (ex.sousType === "racine") etapes.splice(2, 0, { label: "Méthode", sousQuestion: "b", fragments: [texte("Sur la CE, les deux membres sont positifs : on peut élever au carré sans changer le sens.")] });
  etapes.push({ label: "Vérification", sousQuestion: "b", fragments: [texte("Intersection avec la CE "), latex(ensembleLatex(ex.ceEcran1)), texte(".")] });
  etapes.push({ label: "Conclusion", fragments: sCorrige(ex.solutionEcran2) });
  etapes.push({
    label: "Piège",
    fragments:
      ex.sousType === "racine"
        ? [texte("Élever au carré n'est permis QUE parce que la CE rend les deux membres positifs.")]
        : !ex.baseSuperieureA1
          ? [texte("Base entre 0 et 1 : comparer les arguments INVERSE le sens.")]
          : [texte("La comparaison des arguments ne vaut que sur la CE : il faut toujours intersecter.")],
  });
  return etapes;
}

function baremeB(ex: ExerciceLogB): BaremeExercice {
  const { comparaison, resolution } = passageB(ex);
  const erreurs: ErreurFrequente[] = [];
  if (!ex.baseSuperieureA1) erreurs.push({ description: [texte("Sens non inversé (base entre 0 et 1)")], cout: "−1" });
  erreurs.push({ description: [texte("CE limitée à un seul des deux arguments")], cout: "−0,5" });
  erreurs.push({ description: [texte("Intersection avec la CE oubliée")], cout: "−1" });
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE (deux conditions) : "), latex(`x\\in ${ensembleLatex(ex.ceEcran1)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Compare les arguments avec le bon sens : "), latex(comparaison)], points: 1 },
      { sousQuestion: "b", critere: [texte("Résout : "), latex(resolution)], points: 1 },
      { sousQuestion: "b", critere: [texte("Intersecte avec la CE : "), ...sCorrige(ex.solutionEcran2)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Solution écrite sous forme d'inégalités")]],
  };
}

// ---------------------------------------------------------------------------- Famille C

function inequationArgumentsC(ex: ExerciceLogC): { comparaison: string; resolution: string } {
  const cmp = comparateurArguments(ex);
  if (ex.sousType === "produit") {
    // f·g − k = m2·(x − z1)(x − z2), racines entières par construction (voir familles/C.ts).
    const produitMoinsK = { a: ex.g.m, b: ex.g.n + ex.g.m * ex.f.n, c: ex.f.n * ex.g.n - ex.k };
    const delta = produitMoinsK.b * produitMoinsK.b - 4 * produitMoinsK.a * produitMoinsK.c;
    const r = Math.sqrt(delta);
    const racines = [(-produitMoinsK.b - r) / (2 * produitMoinsK.a), (-produitMoinsK.b + r) / (2 * produitMoinsK.a)].map((v) => Math.round(v)).sort((u, v) => u - v);
    const trinome = `${produitMoinsK.a === 1 ? "" : produitMoinsK.a === -1 ? "-" : produitMoinsK.a}x^{2}${produitMoinsK.b === 0 ? "" : produitMoinsK.b > 0 ? `+${produitMoinsK.b === 1 ? "" : produitMoinsK.b}x` : `-${produitMoinsK.b === -1 ? "" : -produitMoinsK.b}x`}${produitMoinsK.c === 0 ? "" : produitMoinsK.c > 0 ? `+${produitMoinsK.c}` : `-${-produitMoinsK.c}`}`;
    return {
      comparaison: `${formatCombinaisonC(ex)} ${sym(cmp)} ${ex.k}`,
      resolution: `${trinome} ${sym(cmp)} 0\\ \\text{(racines } ${racines[0]} \\text{ et } ${racines[1]}\\text{)}`,
    };
  }
  // f/g [cmp] k  ⟺  f [cmp] k·g (g > 0 sur la CE)  ⟺  (m1 − k·m2)x + (n1 − k·n2) [cmp] 0.
  return {
    comparaison: `${formatCombinaisonC(ex)} ${sym(cmp)} ${ex.k} \\iff ${formatAffineLatex(ex.f)} ${sym(cmp)} ${ex.k === 1 ? "" : ex.k}\\left(${formatAffineLatex(ex.g)}\\right)`,
    resolution: resoudrePremierDegreLatex(ex.f.m - ex.k * ex.g.m, ex.f.n - ex.k * ex.g.n, cmp),
  };
}

function correctionC(ex: ExerciceLogC): EtapeCorrection[] {
  const bl = baseLatex(ex.base);
  const { comparaison, resolution } = inequationArgumentsC(ex);
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`${formatAffineLatex(ex.f)}>0`), texte(" et "), latex(`${formatAffineLatex(ex.g)}>0`), texte(", soit "), latex(`\\text{CE} : x\\in ${ensembleLatex(ex.ceEcran1)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte(ex.sousType === "produit" ? "Somme de logarithmes = logarithme du produit : " : "Différence de logarithmes = logarithme du quotient : "), latex(`${logBaseLatex(bl, formatCombinaisonC(ex))} ${sym(ex.comparateur)} ${logBaseLatex(bl, String(ex.k))}`), texte(".")] },
    { label: "Méthode", sousQuestion: "c", fragments: phraseSens(ex) },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(comparaison), texte(", soit "), latex(resolution), texte(".")] },
    { label: "Vérification", sousQuestion: "c", fragments: [texte("Intersection avec la CE "), latex(ensembleLatex(ex.ceEcran1)), texte(".")] },
    { label: "Conclusion", fragments: sCorrige(ex.solutionEcran3) },
    {
      label: "Piège",
      fragments:
        ex.sousType === "quotient"
          ? [texte("Multiplier par "), latex(formatAffineLatex(ex.g)), texte(" ne change pas le sens SEULEMENT parce que ce facteur est positif sur la CE.")]
          : [texte("La CE se pose sur l'inéquation de DÉPART (chaque argument), pas sur le produit combiné.")],
    },
  ];
}

function baremeC(ex: ExerciceLogC): BaremeExercice {
  const bl = baseLatex(ex.base);
  const { comparaison } = inequationArgumentsC(ex);
  const erreurs: ErreurFrequente[] = [
    { description: [texte("CE posée sur l'argument combiné au lieu des deux arguments de départ")], cout: "−1" },
    { description: [texte(ex.sousType === "produit" ? "Somme de logarithmes transformée en logarithme de la somme" : "Différence de logarithmes transformée en quotient de logarithmes")], cout: "0 pt sur b)" },
  ];
  if (!ex.baseSuperieureA1) erreurs.push({ description: [texte("Sens non inversé (base entre 0 et 1)")], cout: "−1" });
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex(`x\\in ${ensembleLatex(ex.ceEcran1)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Combinaison : "), latex(logBaseLatex(bl, formatCombinaisonC(ex)))], points: 1 },
      { sousQuestion: "c", critere: [texte("Compare les arguments avec le bon sens : "), latex(comparaison)], points: 1 },
      { sousQuestion: "c", critere: [texte("Résout et intersecte avec la CE : "), ...sCorrige(ex.solutionEcran3)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Produit développé au lieu de la forme factorisée")], [texte("Solution écrite sous forme d'inégalités")]],
  };
}

// ---------------------------------------------------------------------------- Famille D

function correctionD(ex: ExerciceLogD): EtapeCorrection[] {
  const bl = baseLatex(ex.base);
  const [ya, yb] = [ex.y1, ex.y2].sort((u, v) => u - v);
  const pa = puissanceExacte(ex.base, ya);
  const pb = puissanceExacte(ex.base, yb);
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex("x>0"), texte(", soit "), latex(`\\text{CE} : x\\in ${ensembleLatex(ex.ceEcran1)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("On pose "), latex(`y=\\log_{${bl}}(x)`), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`${formatQuadratiqueYLatex(ex)} ${sym(ex.comparateur)} 0`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [texte("Racines "), latex(`y=${ya}`), texte(" et "), latex(`y=${yb}`), texte(" ; coefficient de "), latex("y^{2}"), texte(` ${ex.A > 0 ? "positif" : "négatif"} : `), latex(`y\\in ${ensembleLatex(ex.solutionEcran3)}`), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "d",
      fragments: [
        latex(`x=${ex.base.den === 1 ? bl : `\\left(${bl}\\right)`}^{y}`),
        texte(ex.baseSuperieureA1 ? " est croissante (bornes dans le même ordre) : " : " est décroissante (bornes échangées) : "),
        latex(`${puissanceBaseLatex(ex.base, ya)}=${formatFractionLatex(pa.num, pa.den)}`),
        texte(", "),
        latex(`${puissanceBaseLatex(ex.base, yb)}=${formatFractionLatex(pb.num, pb.den)}`),
        texte(", puis intersection avec la CE."),
      ],
    },
    { label: "Conclusion", fragments: sCorrige(ex.solutionEcran4) },
    {
      label: "Piège",
      fragments: ex.baseSuperieureA1 ? [texte("L'ensemble trouvé en y n'est PAS la réponse : il faut revenir à x avec "), latex(`x=${bl}^{y}`), texte(".")] : [texte("Base entre 0 et 1 : "), latex(`x=\\left(${bl}\\right)^{y}`), texte(" est décroissante, l'ordre des bornes s'inverse.")],
    },
  ];
}

function baremeD(ex: ExerciceLogD): BaremeExercice {
  const erreurs: ErreurFrequente[] = [{ description: [texte("Ensemble en y donné comme réponse finale")], cout: "−1" }];
  if (!ex.baseSuperieureA1) erreurs.push({ description: [texte("Bornes non échangées au retour en x (base entre 0 et 1)")], cout: "−1" });
  erreurs.push({ description: [texte("Racines en y converties avec "), latex("x=y^{\\text{base}}"), texte(" au lieu de "), latex("x=\\text{base}^{y}")], cout: "−1" });
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex("x>0")], points: 1 },
      { sousQuestion: "b", critere: [texte("Inéquation en y : "), latex(`${formatQuadratiqueYLatex(ex)} ${sym(ex.comparateur)} 0`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Solution en y : "), latex(`y\\in ${ensembleLatex(ex.solutionEcran3)}`)], points: 1 },
      { sousQuestion: "d", critere: [texte("Retour en x et CE : "), ...sCorrige(ex.solutionEcran4)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Bornes laissées sous forme de puissances (ex. "), latex(puissanceBaseLatex(ex.base, ex.y1)), texte(")")]],
  };
}

// ---------------------------------------------------------------------------- Famille E

function correctionE(ex: ExerciceLogE): EtapeCorrection[] {
  const conditions: EtapeCorrection = { label: "Condition", sousQuestion: "a", fragments: [latex(`x-${ex.p}>0`.replace("--", "+")), texte(" et "), latex(`-x+${ex.r}>0`.replace("+-", "-")), texte(", soit "), latex(`x>${ex.p}`), texte(" et "), latex(`x<${ex.r}`), texte(".")] };
  if (!ex.ceCompatible) {
    return [
      conditions,
      { label: "Vérification", sousQuestion: "a", fragments: [texte("Comme "), latex(`${ex.r}\\le ${ex.p}`), texte(", aucun réel n'est à la fois "), latex(`>${ex.p}`), texte(" et "), latex(`<${ex.r}`), texte(" : la CE est vide.")] },
      { label: "Conclusion", fragments: [latex("S=\\varnothing"), texte(" (inutile de résoudre).")] },
      { label: "Piège", fragments: [texte("Résoudre sans examiner la CE donne un ensemble faux : on doit d'abord vérifier que l'inéquation a un sens.")] },
    ];
  }
  const cmp = comparateurArguments(ex);
  return [
    conditions,
    { label: "Vérification", sousQuestion: "a", fragments: [texte("Comme "), latex(`${ex.p}<${ex.r}`), texte(", la CE est "), latex(ensembleLatex(ex.ceEcran1)), texte(" : elle admet des solutions.")] },
    { label: "Méthode", sousQuestion: "b", fragments: phraseSens(ex) },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`${formatAffineLatex({ m: 1, n: -ex.p })} ${sym(cmp)} ${formatAffineLatex({ m: -1, n: ex.r })}`), texte(", donc "), latex(resoudrePremierDegreLatex(2, -(ex.p + ex.r), cmp)), texte(", puis intersection avec la CE.")] },
    { label: "Conclusion", fragments: sCorrige(ex.solution) },
    { label: "Piège", fragments: [texte("Le résultat de la comparaison des arguments doit rester dans la CE "), latex(ensembleLatex(ex.ceEcran1)), texte(".")] },
  ];
}

function baremeE(ex: ExerciceLogE): BaremeExercice {
  if (!ex.ceCompatible) {
    return {
      reponseFinale: reponseBreveInequationsLog(ex),
      criteres: [
        { sousQuestion: "a", critere: [texte("Condition du premier argument : "), latex(`x>${ex.p}`)], points: 1 },
        { sousQuestion: "a", critere: [texte("Condition du second argument : "), latex(`x<${ex.r}`)], points: 1 },
        { sousQuestion: "a", critere: [texte("Constate qu'aucun x ne vérifie les deux")], points: 1 },
        { sousQuestion: "a", critere: [texte("Conclut "), latex("S=\\varnothing")], points: 1 },
      ],
      erreursFrequentes: [{ description: [texte("Inéquation résolue sans voir que la CE est vide")], cout: "−2" }],
      reponsesAcceptees: [[texte("Justification par un axe gradué (intervalles disjoints)")]],
    };
  }
  const cmp = comparateurArguments(ex);
  const erreurs: ErreurFrequente[] = [{ description: [texte("Intersection avec la CE oubliée")], cout: "−1" }];
  if (!ex.baseSuperieureA1) erreurs.push({ description: [texte("Sens non inversé (base entre 0 et 1)")], cout: "−1" });
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex(`x\\in ${ensembleLatex(ex.ceEcran1)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Compare les arguments avec le bon sens : "), latex(`${formatAffineLatex({ m: 1, n: -ex.p })} ${sym(cmp)} ${formatAffineLatex({ m: -1, n: ex.r })}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Résout : "), latex(resoudrePremierDegreLatex(2, -(ex.p + ex.r), cmp))], points: 1 },
      { sousQuestion: "b", critere: [texte("Intersecte avec la CE : "), ...sCorrige(ex.solution)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Solution écrite sous forme d'inégalités")]],
  };
}

// ---------------------------------------------------------------------------- Famille F

function correctionF(ex: ExerciceLogF): EtapeCorrection[] {
  const g = formatAffineLatex({ m: 1, n: -ex.p });
  const carre = formatCarreXMoinsR(ex.r);
  const vide: EnsembleReelGuide = { forme: "intervalles", points: [], morceaux: [] };
  const casSup = ex.casVideEstSuperieurA1 ? vide : ex.ensembleSansR;
  const casInf = ex.casVideEstSuperieurA1 ? ex.ensembleSansR : vide;
  // a > 1 : g [cmp] g + carré ⟺ 0 [cmp] carré ; 0 < a < 1 : sens inversé.
  const cmpSup = ex.comparateur === "<" ? `${carre}>0` : `${carre}<0`;
  const cmpInf = ex.comparateur === "<" ? `${carre}<0` : `${carre}>0`;
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`${g}>0`), texte(" et "), latex(`${g}+${carre}>0`), texte(" ; la seconde découle de la première (un carré est positif), donc "), latex(`\\text{CE} : x\\in ${ensembleLatex(ex.ceEcran1)}`), texte(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`f(x)-g(x)=\\left(${g}+${carre}\\right)-\\left(${g}\\right)=${carre}`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [texte("Si "), latex("a>1"), texte(" (sens conservé) : "), latex(`${cmpSup}`), texte(", donc "), latex(`S=${ensembleLatex(casSup)}`), texte(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: [texte("Si "), latex("0<a<1"), texte(" (sens inversé) : "), latex(`${cmpInf}`), texte(", donc "), latex(`S=${ensembleLatex(casInf)}`), texte(".")] },
    { label: "Conclusion", fragments: reponseBreveInequationsLog(ex) },
    { label: "Piège", fragments: [texte("Un carré est nul en "), latex(`x=${ex.r}`), texte(" : cette valeur est exclue quand l'inégalité est stricte.")] },
  ];
}

function baremeF(ex: ExerciceLogF): BaremeExercice {
  const vide: EnsembleReelGuide = { forme: "intervalles", points: [], morceaux: [] };
  const casSup = ex.casVideEstSuperieurA1 ? vide : ex.ensembleSansR;
  const casInf = ex.casVideEstSuperieurA1 ? ex.ensembleSansR : vide;
  return {
    reponseFinale: reponseBreveInequationsLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex(`x\\in ${ensembleLatex(ex.ceEcran1)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Carré parfait : "), latex(formatCarreXMoinsR(ex.r))], points: 1 },
      { sousQuestion: "c", critere: [texte("Cas "), latex("a>1"), texte(" : "), latex(`S=${ensembleLatex(casSup)}`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Cas "), latex("0<a<1"), texte(" : "), latex(`S=${ensembleLatex(casInf)}`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Valeur "), latex(`x=${ex.r}`), texte(" non exclue (le carré y est nul)")], cout: "−0,5" },
      { description: [texte("Un seul cas traité")], cout: "−1" },
    ],
    reponsesAcceptees: [[latex(`${ensembleLatex(ex.ceEcran1)}\\setminus\\{${ex.r}\\}`), texte(" pour la réunion de deux intervalles")]],
  };
}

// ---------------------------------------------------------------------------- Dispatch

function correctionDetailleeInequationsLog(exercice: ExerciceInequationLogarithmique): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A":
      return correctionA(exercice);
    case "B":
      return correctionB(exercice);
    case "C":
      return correctionC(exercice);
    case "D":
      return correctionD(exercice);
    case "E":
      return correctionE(exercice);
    case "F":
      return correctionF(exercice);
  }
}

function baremeInequationsLog(exercice: ExerciceInequationLogarithmique): BaremeExercice {
  switch (exercice.famille) {
    case "A":
      return baremeA(exercice);
    case "B":
      return baremeB(exercice);
    case "C":
      return baremeC(exercice);
    case "D":
      return baremeD(exercice);
    case "E":
      return baremeE(exercice);
    case "F":
      return baremeF(exercice);
  }
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierInequationsLog(exercice: ExerciceInequationLogarithmique): EnoncePapier {
  const discussion: FragmentConsigne[] =
    exercice.famille === "F" ? [texte(", où "), latex("a>0"), texte(" et "), latex("a\\neq 1"), texte(". Distingue les cas "), latex("a>1"), texte(" et "), latex("0<a<1"), texte(".")] : [texte(".")];
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(exercice)), ...discussion], questions: [] } };
}

export const adaptateurEvaluationInequationsLogarithmiques: AdaptateurFeuilleExercices<ExerciceInequationLogarithmique> = {
  titreDocument: "Résoudre une inéquation logarithmique — Évaluation",
  nomFichierBase: "inequations-logarithmiques",
  genererInstance: genererExerciceInequationLogarithmique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as IdVarianteInequationLogarithmique),
  construireEnonce: construireEnonceInequationsLogarithmiques,
  construireCorrection: construireCorrectionInequationsLogarithmiques,
  difficulte: difficulteInequationsLog,
  reponseBreve: reponseBreveInequationsLog,
  correctionDetaillee: correctionDetailleeInequationsLog,
  bareme: baremeInequationsLog,
  enoncePapier: enoncePapierInequationsLog,
  dureeMinutes: DUREE_MINUTES_INEQUATIONS_LOG,
  // Plusieurs questions par instance (1 à 4 selon la famille) ET consigne dépendante de l'instance
  // pour plusieurs familles (B/C mentionnent le sous-type, F mentionne le carré parfait) — aucune
  // des deux conditions de `regroupable` n'est réunie, voir sa doc dans `genererFeuilleExercices.ts`.
};
