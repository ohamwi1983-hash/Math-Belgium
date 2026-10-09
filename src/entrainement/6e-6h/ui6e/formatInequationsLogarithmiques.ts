import type { AffineLog, BaseLog, Comparateur, ExerciceInequationLogarithmique, ExerciceLogA, ExerciceLogB, ExerciceLogC, ExerciceLogD, ExerciceLogE, ExerciceLogF } from "../core6e/inequationsLogarithmiques.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { PhaseInequationLogarithmique, ResultatExerciceInequationLogarithmique } from "../moteur6e/typesInequationsLogarithmiques";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen15`. Dispatch PAR FAMILLE (+ sous-type) —
 * les phases (`aCE`, `bCE`...) sont préfixées par famille et n'ont jamais de sens hors de leur
 * famille. Toute aide qui embarque un symbole LaTeX est retournée en `AideAvecLatex {texte,
 * latex}` — jamais interpolée en texte brut. Même principe que
 * `formatInequationsExponentielles.ts` (6gen10).
 */
export const CONSIGNE_GENERALE = "Résous l'inéquation logarithmique suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient nul affiché, jamais de coefficient `±1` littéral. */
function formatSommeTermes(termes: TermeSigne[]): string {
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

export function baseLatex(base: BaseLog): string {
  if (base.den === 1) return String(base.num);
  return `\\frac{${base.num}}{${base.den}}`;
}

function formatAffineLatex(f: AffineLog): string {
  return formatSommeTermes([
    { valeur: f.m, suffixe: "x" },
    { valeur: f.n, suffixe: "" },
  ]);
}

export function symboleComparateurLatex(cmp: Comparateur): string {
  switch (cmp) {
    case ">":
      return ">";
    case "<":
      return "<";
    case ">=":
      return "\\geq";
    case "<=":
      return "\\leq";
  }
}

function logBaseLatex(base: string, argument: string): string {
  return `\\log_{${base}}\\left(${argument}\\right)`;
}

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

function formatEnonceA(exercice: ExerciceLogA): string {
  return `${logBaseLatex(baseLatex(exercice.base), formatAffineLatex({ m: exercice.m, n: exercice.n }))} ${symboleComparateurLatex(exercice.comparateur)} ${exercice.k}`;
}

function consigneA(phase: "aCE" | "aResoudre"): string {
  if (phase === "aCE") return "Pose la condition d'existence : l'argument du logarithme doit être strictement positif.";
  return "À partir de la CE CORRECTE de l'étape précédente, résous l'inéquation en appliquant le bon sens (direct si la base est >1, inversé si elle est <1), puis intersecte avec la CE.";
}

function aideA1(phase: "aCE" | "aResoudre"): AideAvecLatex {
  if (phase === "aCE") return { texte: "L'argument d'un logarithme doit toujours être strictement positif.", latex: null };
  return { texte: "Le logarithme de base b est croissant si b>1, décroissant si 0<b<1 — le sens de l'inégalité doit être adapté en conséquence.", latex: null };
}

function aideA2(phase: "aCE" | "aResoudre", exercice: ExerciceLogA): AideAvecLatex {
  if (phase === "aCE") return { texte: "Condition d'existence :", latex: `${formatAffineLatex({ m: exercice.m, n: exercice.n })} > 0` };
  return {
    texte: `Base ${exercice.baseSuperieureA1 ? ">1" : "<1"} : sens ${exercice.baseSuperieureA1 ? "conservé" : "inversé"}. Inégalité sur l'argument SEUL (intersection avec la CE non faite) :`,
    latex: formatEnsembleReelLatex(exercice.argumentBrutEcran2),
  };
}

// ============================================================================
// Famille B — 2 écrans, 2 sous-types.
// ============================================================================

function formatArgumentB(exercice: ExerciceLogB): string {
  return exercice.sousType === "racine" ? `\\sqrt{${formatAffineLatex({ m: exercice.a, n: exercice.b })}}` : formatAffineLatex(exercice.f);
}

function formatEnonceB(exercice: ExerciceLogB): string {
  const bl = baseLatex(exercice.base);
  return `${logBaseLatex(bl, formatArgumentB(exercice))} ${symboleComparateurLatex(exercice.comparateur)} ${logBaseLatex(bl, formatAffineLatex(exercice.g))}`;
}

function consigneB(phase: "bCE" | "bResoudre", exercice: ExerciceLogB): string {
  if (phase === "bCE") return "Pose la CE : les DEUX arguments doivent être strictement positifs.";
  const justification = exercice.sousType === "racine" ? " (la comparaison sur les arguments se justifie ici par élévation au carré, valide car la CE garantit déjà leur positivité)" : "";
  return `À partir de la CE CORRECTE de l'étape précédente, compare directement les arguments avec le bon sens${justification}, puis ré-intersecte avec la CE.`;
}

function aideB1(phase: "bCE" | "bResoudre"): AideAvecLatex {
  if (phase === "bCE") return { texte: "Chacun des deux arguments doit être strictement positif — pose les deux conditions séparément.", latex: null };
  return {
    texte: "log_base(f) [symbole] log_base(g) équivaut à f [même symbole] g si base>1, ou f [symbole inversé] g si 0<base<1 — mais UNIQUEMENT à l'intérieur de la CE. Ne jamais oublier de ré-intersecter avec la CE après cette étape.",
    latex: null,
  };
}

function aideB2(phase: "bCE" | "bResoudre", exercice: ExerciceLogB): AideAvecLatex {
  if (phase === "bCE") {
    const argGauche = exercice.sousType === "racine" ? formatAffineLatex({ m: exercice.a, n: exercice.b }) : formatAffineLatex(exercice.f);
    return { texte: "Les 2 conditions de positivité :", latex: `${argGauche} > 0 \\quad\\text{ET}\\quad ${formatAffineLatex(exercice.g)} > 0` };
  }
  return { texte: "Intervalle de la comparaison d'arguments SEULE (intersection avec la CE non faite) :", latex: formatEnsembleReelLatex(exercice.comparaisonBruteEcran2) };
}

// ============================================================================
// Famille C — 3 écrans, 2 sous-types.
// ============================================================================

function operateurC(exercice: ExerciceLogC): string {
  return exercice.sousType === "produit" ? "+" : "-";
}

function formatEnonceC(exercice: ExerciceLogC): string {
  const bl = baseLatex(exercice.base);
  return `${logBaseLatex(bl, formatAffineLatex(exercice.f))} ${operateurC(exercice)} ${logBaseLatex(bl, formatAffineLatex(exercice.g))} ${symboleComparateurLatex(exercice.comparateur)} ${logBaseLatex(bl, String(exercice.k))}`;
}

export function formatCombinaisonC(exercice: ExerciceLogC): string {
  return exercice.sousType === "produit"
    ? `\\left(${formatAffineLatex(exercice.f)}\\right)\\left(${formatAffineLatex(exercice.g)}\\right)`
    : `\\dfrac{${formatAffineLatex(exercice.f)}}{${formatAffineLatex(exercice.g)}}`;
}

function consigneC(phase: "cCE" | "cCombiner" | "cComparer", exercice: ExerciceLogC): string {
  if (phase === "cCE") return "Pose la CE : les DEUX arguments doivent être strictement positifs.";
  if (phase === "cCombiner") {
    return exercice.sousType === "produit"
      ? "Combine le membre de gauche en un seul logarithme : log(f)+log(g)=log(f·g). Donne l'expression f(x)·g(x)."
      : "Combine le membre de gauche en un seul logarithme : log(f)-log(g)=log(f/g). Donne l'expression f(x)/g(x).";
  }
  return "À partir de la combinaison CORRECTE de l'étape précédente, compare les arguments avec le bon sens, puis intersecte avec la CE CORRECTE de l'étape 1.";
}

function aideC1(phase: "cCE" | "cCombiner" | "cComparer", exercice: ExerciceLogC): AideAvecLatex {
  if (phase === "cCE") return { texte: "Chacun des deux arguments doit être strictement positif — pose les deux conditions séparément.", latex: null };
  if (phase === "cCombiner") {
    return exercice.sousType === "produit" ? { texte: "Rappel : log_base(f)+log_base(g) = log_base(f·g).", latex: null } : { texte: "Rappel : log_base(f)-log_base(g) = log_base(f/g).", latex: null };
  }
  return { texte: "log_base(f·g ou f/g) [symbole] log_base(k) équivaut à (f·g ou f/g) [même ou inversé selon la base] k — uniquement à l'intérieur de la CE.", latex: null };
}

function aideC2(phase: "cCE" | "cCombiner" | "cComparer", exercice: ExerciceLogC): AideAvecLatex {
  if (phase === "cCE") return { texte: "Les 2 conditions de positivité :", latex: `${formatAffineLatex(exercice.f)} > 0 \\quad\\text{ET}\\quad ${formatAffineLatex(exercice.g)} > 0` };
  if (phase === "cCombiner") return { texte: "Combinaison partiellement effectuée — il ne reste qu'à l'écrire explicitement :", latex: `\\log_{${baseLatex(exercice.base)}}\\left(${formatCombinaisonC(exercice)}\\right)` };
  return { texte: "Base " + (exercice.baseSuperieureA1 ? ">1 (sens conservé)." : "<1 (sens inversé)."), latex: null };
}

// ============================================================================
// Famille D — 4 écrans.
// ============================================================================

export function formatQuadratiqueYLatex(exercice: ExerciceLogD): string {
  return formatSommeTermes([
    { valeur: exercice.A, suffixe: "y^2" },
    { valeur: exercice.B, suffixe: "y" },
    { valeur: exercice.C, suffixe: "" },
  ]);
}

function formatEnonceD(exercice: ExerciceLogD): string {
  const bl = baseLatex(exercice.base);
  const y = `\\log_{${bl}} x`;
  return `${formatSommeTermes([
    { valeur: exercice.A, suffixe: `\\left(${y}\\right)^2` },
    { valeur: exercice.B, suffixe: y },
    { valeur: exercice.C, suffixe: "" },
  ])} ${symboleComparateurLatex(exercice.comparateur)} 0`;
}

function consigneD(phase: "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX"): string {
  switch (phase) {
    case "dCE":
      return "Pose la CE : l'argument du logarithme doit être strictement positif.";
    case "dReecrire":
      return "Pose y=log_base(x) et réécris l'inéquation comme une inéquation du second degré en y (même comparateur).";
    case "dResoudreY":
      return "À partir de la réécriture CORRECTE de l'étape précédente, résous l'inéquation du second degré en y (tableau de signes).";
    case "dConvertirX":
      return "À partir de l'intervalle en y CORRECT de l'étape précédente, convertis-le en x (via x=base^y — attention à l'inversion des bornes si la base est <1), puis intersecte avec la CE.";
  }
}

function aideD1(phase: "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX"): AideAvecLatex {
  switch (phase) {
    case "dCE":
      return { texte: "L'argument d'un logarithme doit toujours être strictement positif.", latex: null };
    case "dReecrire":
      return { texte: "Remplace chaque occurrence de log_base(x) par y — le reste de l'expression ne change pas.", latex: null };
    case "dResoudreY":
      return { texte: "Calcule le discriminant (ou utilise les racines déjà visibles) pour construire le tableau de signes du trinôme en y.", latex: null };
    case "dConvertirX":
      return { texte: "Convertir un intervalle en y vers x via x=base^y conserve le sens si base>1, l'inverse si 0<base<1 — y compris pour l'ORDRE des bornes.", latex: null };
  }
}

function aideD2(phase: "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX", exercice: ExerciceLogD): AideAvecLatex {
  switch (phase) {
    case "dCE":
      return { texte: "Condition d'existence :", latex: "x > 0" };
    case "dReecrire":
      return { texte: "Réécriture attendue (avec y=log_base(x)) :", latex: `${formatQuadratiqueYLatex(exercice)} ${symboleComparateurLatex(exercice.comparateur)} 0` };
    case "dResoudreY":
      return { texte: "Les 2 racines du trinôme en y sont :", latex: `y=${exercice.y1} \\quad\\text{et}\\quad y=${exercice.y2}` };
    case "dConvertirX":
      return {
        texte: "Bornes en x calculées séparément (ordre final non tranché) :",
        latex: `${baseLatex(exercice.base)}^{${exercice.y1}} \\quad\\text{et}\\quad ${baseLatex(exercice.base)}^{${exercice.y2}}`,
      };
  }
}

// ============================================================================
// Famille E — 1 écran, TOUJOURS ∅.
// ============================================================================

function formatEnonceE(exercice: ExerciceLogE): string {
  const bl = baseLatex(exercice.base);
  return `${logBaseLatex(bl, formatAffineLatex({ m: 1, n: -exercice.p }))} ${symboleComparateurLatex(exercice.comparateur)} ${logBaseLatex(bl, formatAffineLatex({ m: -1, n: exercice.r }))}`;
}

function consigneE(): string {
  return "Sans résoudre l'inégalité principale : pose la CE, et détermine si elle est satisfiable.";
}

function aideE1(): AideAvecLatex {
  return { texte: "Avant de résoudre quoi que ce soit d'autre, vérifie toujours que la CE elle-même est non vide.", latex: null };
}

function aideE2(exercice: ExerciceLogE): AideAvecLatex {
  return { texte: "Les 2 conditions de la CE, côte à côte (incompatibilité non confirmée) :", latex: `x > ${exercice.p} \\quad\\text{ET}\\quad x < ${exercice.r}` };
}

// ============================================================================
// Famille F — 3 écrans.
// ============================================================================

export function formatCarreXMoinsR(r: number): string {
  return `\\left(${formatAffineLatex({ m: 1, n: -r })}\\right)^2`;
}

function formatEnonceF(exercice: ExerciceLogF): string {
  const g = formatAffineLatex({ m: 1, n: -exercice.p });
  const f = `${g}+${formatCarreXMoinsR(exercice.r)}`;
  return `${logBaseLatex("a", g)} ${symboleComparateurLatex(exercice.comparateur)} ${logBaseLatex("a", f)}`;
}

function consigneF(phase: "fCE" | "fSimplifier" | "fConclure"): string {
  switch (phase) {
    case "fCE":
      return "Pose la CE. Remarque : f(x)-g(x) est un carré, donc f(x)≥g(x) toujours — la CE se réduit-elle à une seule condition ?";
    case "fSimplifier":
      return "Simplifie f(x)-g(x) et reconnais un carré parfait.";
    case "fConclure":
      return "Traite séparément les cas a>1 et 0<a<1 — à partir de la CE CORRECTE de l'étape 1 et du carré parfait CORRECT de l'étape 2, conclus pour chaque cas.";
  }
}

function aideF1(phase: "fCE" | "fSimplifier" | "fConclure"): AideAvecLatex {
  switch (phase) {
    case "fCE":
      return { texte: "Pose les deux conditions de positivité séparément avant de chercher à les simplifier.", latex: null };
    case "fSimplifier":
      return { texte: "Développe f(x)-g(x) terme à terme, sans chercher à factoriser tout de suite.", latex: null };
    case "fConclure":
      return { texte: "Un carré est toujours ≥0, donc jamais strictement négatif — un des deux cas devient automatiquement impossible.", latex: null };
  }
}

function aideF2(phase: "fCE" | "fSimplifier" | "fConclure", exercice: ExerciceLogF): AideAvecLatex {
  const g = formatAffineLatex({ m: 1, n: -exercice.p });
  switch (phase) {
    case "fCE":
      return { texte: "Différence f(x)-g(x), non simplifiée (lien avec la CE non fait) :", latex: `\\left(${g}+${formatCarreXMoinsR(exercice.r)}\\right) - \\left(${g}\\right)` };
    case "fSimplifier":
      return {
        texte: "Forme non factorisée :",
        latex: formatSommeTermes([
          { valeur: 1, suffixe: "x^2" },
          { valeur: -2 * exercice.r, suffixe: "x" },
          { valeur: exercice.r * exercice.r, suffixe: "" },
        ]),
      };
    case "fConclure":
      return { texte: "Les deux inégalités à trancher séparément (conclusion non donnée) :", latex: `${formatCarreXMoinsR(exercice.r)} > 0 \\quad\\text{et}\\quad ${formatCarreXMoinsR(exercice.r)} < 0` };
  }
}

// ============================================================================
// Bloc "état actuel" — écrans ≥2 uniquement (CLAUDE.md : consigne générale → bloc données → bloc
// "état actuel" → bloc de travail). Dérivé UNIQUEMENT de l'exercice (jamais de la saisie brute de
// l'élève) : reprend le fait déjà CONFIRMÉ de(s) l'écran(s) précédent(s) — CE de l'écran 1 pour la
// plupart des familles, plus la combinaison (C) ou le carré parfait (F) une fois cet écran franchi.
// `null` sur le tout premier écran de chaque famille (rien à rappeler) — même convention que
// `etatActuel` de 6gen13/6gen16.
// ============================================================================

export function etatActuel(phase: PhaseInequationLogarithmique, exercice: ExerciceInequationLogarithmique): string[] | null {
  switch (exercice.famille) {
    case "A":
      if (phase === "aCE") return null;
      return [`\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`];
    case "B":
      if (phase === "bCE") return null;
      return [`\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`];
    case "C":
      if (phase === "cCE") return null;
      if (phase === "cCombiner") return [`\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`];
      return [
        `\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`,
        `\\text{Combiné : } \\log_{${baseLatex(exercice.base)}}\\left(${formatCombinaisonC(exercice)}\\right)`,
      ];
    case "D": {
      if (phase === "dCE") return null;
      const ce = `\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`;
      if (phase === "dReecrire") return [ce];
      const reecriture = `\\text{Réécriture : } ${formatQuadratiqueYLatex(exercice)} ${symboleComparateurLatex(exercice.comparateur)} 0`;
      if (phase === "dResoudreY") return [ce, reecriture];
      return [ce, reecriture, `\\text{Solution en y : } y \\in ${formatEnsembleReelLatex(exercice.solutionEcran3)}`];
    }
    case "E":
      return null;
    case "F":
      if (phase === "fCE") return null;
      if (phase === "fSimplifier") return [`\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`];
      return [`\\text{CE : } x \\in ${formatEnsembleReelLatex(exercice.ceEcran1)}`, `\\text{Carré parfait : } ${formatCarreXMoinsR(exercice.r)}`];
  }
}

// ============================================================================
// Dispatch public.
// ============================================================================

export function formatEnonceLatex(exercice: ExerciceInequationLogarithmique): string {
  switch (exercice.famille) {
    case "A":
      return formatEnonceA(exercice);
    case "B":
      return formatEnonceB(exercice);
    case "C":
      return formatEnonceC(exercice);
    case "D":
      return formatEnonceD(exercice);
    case "E":
      return formatEnonceE(exercice);
    case "F":
      return formatEnonceF(exercice);
  }
}

export function consigneEcran(phase: PhaseInequationLogarithmique, exercice: ExerciceInequationLogarithmique): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aCE" | "aResoudre");
    case "B":
      return consigneB(phase as "bCE" | "bResoudre", exercice);
    case "C":
      return consigneC(phase as "cCE" | "cCombiner" | "cComparer", exercice);
    case "D":
      return consigneD(phase as "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX");
    case "E":
      return consigneE();
    case "F":
      return consigneF(phase as "fCE" | "fSimplifier" | "fConclure");
  }
}

export function aideNiveau1(phase: PhaseInequationLogarithmique, exercice: ExerciceInequationLogarithmique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(phase as "aCE" | "aResoudre");
    case "B":
      return aideB1(phase as "bCE" | "bResoudre");
    case "C":
      return aideC1(phase as "cCE" | "cCombiner" | "cComparer", exercice);
    case "D":
      return aideD1(phase as "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX");
    case "E":
      return aideE1();
    case "F":
      return aideF1(phase as "fCE" | "fSimplifier" | "fConclure");
  }
}

export function aideNiveau2(phase: PhaseInequationLogarithmique, exercice: ExerciceInequationLogarithmique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(phase as "aCE" | "aResoudre", exercice);
    case "B":
      return aideB2(phase as "bCE" | "bResoudre", exercice);
    case "C":
      return aideC2(phase as "cCE" | "cCombiner" | "cComparer", exercice);
    case "D":
      return aideD2(phase as "dCE" | "dReecrire" | "dResoudreY" | "dConvertirX", exercice);
    case "E":
      return aideE2(exercice);
    case "F":
      return aideF2(phase as "fCE" | "fSimplifier" | "fConclure", exercice);
  }
}

// ============================================================================
// Récapitulatif final — un libellé + un contenu PAR ÉCRAN RÉELLEMENT TRAVERSÉ.
// ============================================================================

export const LIBELLE_PHASE_LOG: Record<PhaseInequationLogarithmique, string> = {
  aCE: "Condition d'existence",
  aResoudre: "Résolution (ensemble-solution)",
  bCE: "Condition d'existence",
  bResoudre: "Comparaison (ensemble-solution)",
  cCE: "Condition d'existence",
  cCombiner: "Combinaison en un seul log",
  cComparer: "Comparaison (ensemble-solution)",
  dCE: "Condition d'existence",
  dReecrire: "Réécriture en y",
  dResoudreY: "Résolution en y",
  dConvertirX: "Conversion en x (ensemble-solution)",
  eReconnaitre: "Reconnaissance",
  fCE: "Condition d'existence",
  fSimplifier: "Carré parfait",
  fConclure: "Conclusion (2 cas)",
};

export interface ContenuRecap {
  texte: string | null;
  latex: string | null;
}

function formatCasBaseLogLatex(estVide: boolean, ensembleAttendu: EnsembleReelGuide): string {
  return estVide ? "\\emptyset" : formatEnsembleReelLatex(ensembleAttendu);
}

export function contenuRecapPhase(exercice: ExerciceInequationLogarithmique, phase: PhaseInequationLogarithmique): ContenuRecap {
  switch (exercice.famille) {
    case "A":
      if (phase === "aCE") return { texte: null, latex: formatEnsembleReelLatex(exercice.ceEcran1) };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran2) };
    case "B":
      if (phase === "bCE") return { texte: null, latex: formatEnsembleReelLatex(exercice.ceEcran1) };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran2) };
    case "C":
      if (phase === "cCE") return { texte: null, latex: formatEnsembleReelLatex(exercice.ceEcran1) };
      if (phase === "cCombiner") return { texte: null, latex: `\\log_{${baseLatex(exercice.base)}}\\left(${formatCombinaisonC(exercice)}\\right)` };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran3) };
    case "D":
      if (phase === "dCE") return { texte: null, latex: formatEnsembleReelLatex(exercice.ceEcran1) };
      if (phase === "dReecrire") return { texte: null, latex: `${formatQuadratiqueYLatex(exercice)} ${symboleComparateurLatex(exercice.comparateur)} 0` };
      if (phase === "dResoudreY") return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran3) };
      return { texte: null, latex: formatEnsembleReelLatex(exercice.solutionEcran4) };
    case "E":
      return { texte: "∅ — CE incompatible, aucune solution", latex: null };
    case "F":
      if (phase === "fCE") return { texte: null, latex: formatEnsembleReelLatex(exercice.ceEcran1) };
      if (phase === "fSimplifier") return { texte: null, latex: formatCarreXMoinsR(exercice.r) };
      return {
        texte: null,
        latex: `a>1 : ${formatCasBaseLogLatex(exercice.casVideEstSuperieurA1, exercice.ensembleSansR)} \\qquad 0<a<1 : ${formatCasBaseLogLatex(!exercice.casVideEstSuperieurA1, exercice.ensembleSansR)}`,
      };
  }
}

// ============================================================================
// Total de points du récapitulatif — réutilise TEL QUEL le score RÉEL déjà calculé par
// `moteur/etapeTentatives.ts` + la pénalité d'aide de `sessionInequationsLogarithmiques.ts`.
// ============================================================================

export interface TotalRecap {
  total: number;
  maximum: number;
}

export function totalPointsRecap(resultat: ResultatExerciceInequationLogarithmique): TotalRecap {
  switch (resultat.famille) {
    case "A":
      return { total: resultat.scoreCE + resultat.scoreResoudre, maximum: 200 };
    case "B":
      return { total: resultat.scoreCE + resultat.scoreResoudre, maximum: 200 };
    case "C":
      return { total: resultat.scoreCE + resultat.scoreCombiner + resultat.scoreComparer, maximum: 300 };
    case "D":
      return { total: resultat.scoreCE + resultat.scoreReecrire + resultat.scoreResoudreY + resultat.scoreConvertirX, maximum: 400 };
    case "E":
      return { total: resultat.score, maximum: 100 };
    case "F":
      return { total: resultat.scoreCE + resultat.scoreSimplifier + resultat.scoreConclure, maximum: 300 };
  }
}

