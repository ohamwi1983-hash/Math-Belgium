import type { AffixeSimple, ExerciceComplexesA, ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesC, ExerciceComplexesD, ExerciceComplexesE, NatureLieu, ParamsLocus } from "../core6e/complexesAvances.types";
import type { PhaseComplexesAvances, ResultatExerciceComplexesAvances } from "../moteur6e/typesComplexesAvances";
import { phasesPourExercice } from "../moteur6e/typesComplexesAvances";
import { calculerArgument } from "../generateurs6e/formeTrigonometrique/familleA";
import { racineRationnelleLatex } from "../generateurs6e/complexesAvances/racineRationnelle";
import { pgcd } from "../generateurs6e/calculPrimitives/aleatoire";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen42`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts`/`formatTransformationsPlan.ts`
 * — jamais importé par un autre générateur (chaque générateur reste indépendant, CLAUDE.md).
 *
 * `calculerArgument` (`generateurs6e/formeTrigonometrique/familleA.ts`) réutilisé ICI (couche `ui6e/`
 * libre d'importer `generateurs6e/`, CLAUDE.md) UNIQUEMENT pour l'AFFICHAGE du récapitulatif famille
 * E (jamais côté `moteur6e/verificationComplexesAvances.ts`, qui reste `Math.atan2` brut — voir son
 * en-tête pour la justification de cette séparation stricte).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/26/34/
 * 37/40, CLAUDE.md) — `affixeLatex`/`affixeLatexRationnel` ci-dessous sont les SEULES fonctions qui
 * assemblent un "a+bi" — assemblent TOUJOURS signe+magnitude ENSEMBLE, jamais un signe bare.
 * Couverture de régression : `formatComplexesAvances.test.ts`, "signe orphelin" — scanne le LaTeX
 * rendu sur de nombreux tirages aléatoires des 5 familles.
 */

export type TypeChamp = "texte";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionQcm {
  id: string;
  label: string;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Assemblage "a+bi" — entier (affixeLatex) ou rationnel quelconque (affixeLatexRationnel).
// ============================================================================

export function affixeLatex(z: AffixeSimple): string {
  const { a, b } = z;
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

/** `x` (nombre décimal EXACTEMENT rationnel, dénominateur ≤12 — garanti par construction, voir
 * `generateurs6e/complexesAvances/familleB.ts`) → LaTeX fraction irréductible. */
function latexRationnel(x: number): string {
  if (Math.abs(x) < 1e-9) return "0";
  for (let den = 1; den <= 12; den++) {
    const num = x * den;
    if (Math.abs(num - Math.round(num)) < 1e-6) {
      let n = Math.round(num);
      let d = den;
      let g = Math.abs(n);
      let b = d;
      while (b !== 0) [g, b] = [b, g % b];
      g = g || 1;
      n /= g;
      d /= g;
      if (d === 1) return `${n}`;
      return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
    }
  }
  /* c8 ignore next */
  return x.toFixed(4); // safety net — jamais atteint par construction (voir en-tête de fichier).
}

export function affixeLatexRationnel(a: number, b: number): string {
  if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return "0";
  const aPart = Math.abs(a) < 1e-9 ? "" : latexRationnel(a);
  if (Math.abs(b) < 1e-9) return aPart;
  const bAbsLatex = latexRationnel(Math.abs(b));
  const bPart = bAbsLatex === "1" ? "i" : `${bAbsLatex}i`;
  const sign = b < 0 ? "-" : aPart === "" ? "" : "+";
  return `${aPart}${sign}${bPart}`;
}

// ============================================================================
// Famille A.
// ============================================================================

export function consigneGeneraleA(e: ExerciceComplexesA): string {
  return `z=a+bi est un nombre complexe quelconque (a et b réels). On étudie zⁿ pour n=${e.n}, et on cherche la condition sur a et b pour que zⁿ soit un réel strictement supérieur à k=${e.k}.`;
}

export function blocDonneesA(e: ExerciceComplexesA): string[] {
  return [`z=a+bi\\quad n=${e.n}\\quad k=${e.k}`];
}

export function consigneEcranA(phase: PhaseComplexesAvances): string {
  if (phase === "aEcran1") return "Quelle est la condition sur θ (l'argument de z) pour que zⁿ soit un réel STRICTEMENT POSITIF (pas seulement réel) ?";
  if (phase === "aEcran2") return "En utilisant la condition CONFIRMÉE sur θ, quelle est la condition correspondante sur a et b ?";
  return "En ajoutant la condition sur le module pour que zⁿ dépasse strictement k, quelle est la condition complète finale ?";
}

const LIBELLE_CAB: Record<3 | 4, string> = {
  4: "a=0 OU b=0 (z purement réel OU purement imaginaire, signe quelconque)",
  3: "(b=0 et a>0) OU (b=√3·a et a<0) OU (b=-√3·a et a<0)",
};

export function optionsEcran1A(n: 3 | 4): OptionQcm[] {
  return [
    { id: "correct", label: `${n}·θ ≡ 0 (mod 2π)` },
    { id: "trapReel", label: `${n}·θ ≡ 0 (mod π) — réel, mais pas forcément positif` },
    { id: "distrSansN", label: `θ ≡ 0 (mod 2π)` },
    { id: "distrNegatif", label: `${n}·θ ≡ π (mod 2π)` },
  ];
}

export function optionsEcran2A(n: 3 | 4): OptionQcm[] {
  if (n === 4) {
    return [
      { id: "correct", label: LIBELLE_CAB[4] },
      { id: "trapReel", label: "a=b OU a=-b (z sur une des 2 bissectrices)" },
      { id: "distr1", label: "a≠0 ET b≠0" },
      { id: "distr2", label: "a=0 ET b=0" },
    ];
  }
  return [
    { id: "correct", label: LIBELLE_CAB[3] },
    { id: "trapReel", label: "b=0 OU b=√3·a OU b=-√3·a (signe de a non précisé)" },
    { id: "distr1", label: "b=0 et a>0 (uniquement ce cas)" },
    { id: "distr2", label: "(b=0 et a<0) OU (b=√3·a et a>0) OU (b=-√3·a et a>0)" },
  ];
}

export function optionsEcran3A(e: ExerciceComplexesA): OptionQcm[] {
  const Cab = LIBELLE_CAB[e.n];
  const seuil = `k^{1/${e.n}} (= racine ${e.n}-ième de ${e.k})`;
  return [
    { id: "correct", label: `${Cab}, ET √(a²+b²) > ${seuil}` },
    { id: "distr1", label: `${Cab}, ET √(a²+b²) < ${seuil}` },
    { id: "distr2", label: `√(a²+b²) > ${seuil}  (condition sur a,b oubliée)` },
    { id: "distr3", label: `${Cab}, ET √(a²+b²) > ${e.k}` },
  ];
}

export function etatActuelA(phase: PhaseComplexesAvances): string[] | null {
  const conditionThetaConfirmee = "\\text{Condition sur }\\theta\\text{ confirmée}";
  if (phase === "aEcran2") return [conditionThetaConfirmee];
  // Écran 3 : cumule la condition sur θ (écran 1) ET la condition sur a,b (écran 2), du plus ancien
  // au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état
  // actuel cumulatif").
  if (phase === "aEcran3") return [conditionThetaConfirmee, "\\text{Condition sur }a,b\\text{ confirmée}"];
  return null;
}

export function niveauAideMaxA(phase: PhaseComplexesAvances): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "zⁿ réel signifie nθ≡0 (mod π) — mais zⁿ réel POSITIF est plus restrictif : il faut nθ≡0 (mod 2π) EXACTEMENT (pas mod π).", latex: null };
}
export function aideNiveau2A(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "Parmi les valeurs de θ qui donnent un résultat réel (nθ≡0 mod π), une sur deux seulement donne un résultat POSITIF — l'autre moitié donne un résultat réel NÉGATIF (conclusion non donnée).", latex: null };
}

// ============================================================================
// Famille B.
// ============================================================================

const LIBELLE_SOUS_TYPE_B: Record<ExerciceComplexesB["sousType"], string> = {
  droite: "droite (condition : rapport réel)",
  thales: "cercle de Thalès (condition : rapport imaginaire pur)",
  apollonius: "cercle d'Apollonius (condition : rapport de modules)",
  demiDroites: "demi-droite(s) (condition : z+z̄=c|z|)",
  cercleO: "cercle centré en O (condition : |z|=k)",
  intersection: "intersection de 2 lieux",
};

export function consigneGeneraleB(e: ExerciceComplexesB): string {
  if (e.sousType === "intersection") {
    return "M est un point d'affixe z=x+yi. Il vérifie SIMULTANÉMENT 2 conditions : (z-q1)/(z-q2) est un nombre RÉEL (M est sur une droite passant par q1 et q2), ET z·z̄=k (M est sur un cercle centré en O). Détermine chaque lieu, puis les points d'intersection.";
  }
  switch (e.sousType) {
    case "droite":
      return "M est un point d'affixe z=x+yi. On sait que le rapport (z-p1)/(z-p2) est un nombre RÉEL. Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M (le pôle éventuel est exclu du lieu).";
    case "thales":
      return "M est un point d'affixe z=x+yi. On sait que le rapport (z-p1)/(z-p2) est un nombre IMAGINAIRE PUR. Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M (le pôle éventuel est exclu du lieu).";
    case "apollonius":
      return "M est un point d'affixe z=x+yi tel que |z-p1| = k·|z-p2| (k≠1, donné). Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M.";
    case "demiDroites":
      return "M est un point d'affixe z=x+yi (z≠0) tel que z+z̄ = c·|z| (c donné). Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M.";
    case "cercleO":
      return "M est un point d'affixe z=x+yi tel que z·z̄ = k (k donné, k>0). Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M.";
  }
}

export function blocDonneesB(e: ExerciceComplexesB): string[] {
  if (e.sousType === "intersection") {
    return [`q_1=${affixeLatex(e.q1)}\\quad q_2=${affixeLatex(e.q2)}\\quad k=${e.kCercleO}`];
  }
  switch (e.sousType) {
    case "droite":
    case "thales":
      return [`p_1=${affixeLatex(e.p1)}\\quad p_2=${affixeLatex(e.p2)}`];
    case "apollonius":
      return [`p_1=${affixeLatex(e.p1)}\\quad p_2=${affixeLatex(e.p2)}\\quad k=${e.k}`];
    case "demiDroites":
      return [`c=${e.cLatex}`];
    case "cercleO":
      return [`k=${e.k}`];
  }
}

export function consigneEcranB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): string {
  if (e.sousType === "intersection") {
    if (phase === "bInterEcran1") return "Pose l'équation en x,y de la droite (q1,q2), PUIS l'équation en x,y du cercle centré en O (2 champs).";
    if (phase === "bInterEcran2") return "Donne les paramètres de chaque lieu CONFIRMÉ ci-dessus : 2 points pour la droite, centre et rayon pour le cercle.";
    return "Résous le système des 2 équations CONFIRMÉES pour trouver les points d'intersection.";
  }
  if (phase === "bEcran1") return "Pose l'équation en x,y correspondant à la condition donnée.";
  return "À partir de l'équation CONFIRMÉE, identifie la nature du lieu (droite, cercle, ou demi-droite(s)), puis donne ses paramètres.";
}

export function etatActuelB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): string[] | null {
  if (e.sousType === "intersection") {
    const equationsConfirmees = "\\text{2 équations confirmées}";
    if (phase === "bInterEcran2") return [equationsConfirmees];
    // Écran 3 : cumule les 2 équations (écran 1) ET la droite/le cercle (écran 2), du plus ancien
    // au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état
    // actuel cumulatif").
    if (phase === "bInterEcran3") return [equationsConfirmees, "\\text{Droite et cercle confirmés}"];
    return null;
  }
  if (phase === "bEcran2") return ["\\text{Équation confirmée}"];
  return null;
}

export function niveauAideMaxB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): number {
  if (e.sousType === "intersection") return 0;
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(e: ExerciceComplexesB, phase: PhaseComplexesAvances): AideAvecLatex {
  if (e.sousType === "intersection" || phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "Pose z=x+yi et substitue dans la condition donnée : réel ⟺ partie imaginaire nulle ; imaginaire pur ⟺ partie réelle nulle ; condition de module ⟺ élève au carré des 2 côtés.", latex: null };
}
export function aideNiveau2B(e: ExerciceComplexesB, phase: PhaseComplexesAvances): AideAvecLatex {
  if (e.sousType === "intersection" || phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: `Sous-type : ${LIBELLE_SOUS_TYPE_B[e.sousType]} — substitution amorcée, simplification non faite.`, latex: null };
}

// Natures toujours proposées à l'écran "lieu structuré" (droite/cercle/demiDroite).
export const NATURES_DISPONIBLES: { id: NatureLieu; label: string }[] = [
  { id: "droite", label: "Droite" },
  { id: "cercle", label: "Cercle" },
  { id: "demiDroite", label: "Demi-droite(s)" },
];

function latexParamsLocus(resultat: ParamsLocus): string[] {
  if (resultat.nature === "droite") return [`\\text{Droite passant par }${affixeLatex(resultat.point1)}\\text{ et }${affixeLatex(resultat.point2)}`];
  if (resultat.nature === "cercle") return [`\\text{Centre }${affixeLatexRationnel(resultat.centre.a, resultat.centre.b)}\\text{, rayon }${resultat.rayonLatex}`];
  return resultat.angles.map((a, i) => `\\theta_{${i + 1}}=${a.latex}`);
}

// ============================================================================
// Famille C.
// ============================================================================

export function consigneGeneraleC(): string {
  return `z est un point du cercle unité (|z|=1, donc z·z̄=1). On considère la transformation z'=(z-p)/(1-p̄z), avec p=a+bi. On note z̄ le conjugué de z (à taper "zb" dans les formules). Démontre que |z'|=1, en développant |z-p|² puis |1-p̄z|² SANS jamais poser z=x+yi — utilise uniquement z·z̄=1 et z-z̄=2i·Im(z).`;
}

export function blocDonneesC(e: ExerciceComplexesC): string[] {
  return [`p=${e.a}${e.b < 0 ? "" : "+"}${e.b}i`, `z\\cdot\\, \\bar{z}=1`];
}

export function consigneEcranC(phase: PhaseComplexesAvances): string {
  if (phase === "cEcran1") return "Développe |z-p|² = (z-p)(z̄-p̄), en utilisant z·z̄=1 (donné). Champ : expression simplifiée (en z et zb).";
  if (phase === "cEcran2") return "Développe |1-p̄z|² = (1-p̄z)(1-pz̄), en utilisant les mêmes relations. Champ : expression simplifiée (en z et zb).";
  return "Conclus : les 2 expressions confirmées sont-elles égales (donc |z'|=1) ? Et la réciproque (échanger z et z' redonne une transformation analogue) est-elle vraie ?";
}

export function etatActuelC(phase: PhaseComplexesAvances): string[] | null {
  // Écran 2 : montrait null auparavant (aucune trace du développement confirmé à l'écran 1) — bug
  // trouvé ici (audit transversal "état actuel cumulatif") : dès le 2e écran, la réponse validée de
  // l'écran précédent doit être visible. Écran 3 : cumule les 2 développements (écrans 1 ET 2), du
  // plus ancien au plus récent.
  const numerateurConfirme = "\\text{|z-p|² confirmé}";
  if (phase === "cEcran2") return [numerateurConfirme];
  if (phase === "cEcran3") return [numerateurConfirme, "\\text{|1-p̄z|² confirmé}"];
  return null;
}

export function optionsStatutC(): OptionQcm[] {
  return [
    { id: "correct", label: "Égales — donc |z'|=1" },
    { id: "distr1", label: "Différentes — donc |z'|≠1 en général" },
    { id: "distr2", label: "On ne peut pas conclure" },
  ];
}
export function optionsReciproqueC(): OptionQcm[] {
  return [
    { id: "correct", label: "Vraie — par symétrie de la transformation (échanger z et z' redonne une forme analogue)" },
    { id: "distr1", label: "Fausse en général" },
    { id: "distr2", label: "Vraie seulement si p=0" },
  ];
}

export function niveauAideMaxC(phase: PhaseComplexesAvances): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Pour tout complexe w, |w|²=w·w̄. Ici z·z̄=1 (donné) — remplace-le dès qu'il apparaît.", latex: null };
}
export function aideNiveau2C(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Développement amorcé (terme en z·z̄ non encore remplacé par 1) :", latex: `(z-p)(\\bar z-\\bar p)=z\\bar z-\\bar p z-p\\bar z+p\\bar p` };
}

// ============================================================================
// Famille D.
// ============================================================================

export function consigneGeneraleD(e: ExerciceComplexesD): string {
  switch (e.sousType) {
    case "ratio":
      return `On cherche à résoudre (z+c)ⁿ=k·zⁿ, ce qui équivaut à ((z+c)/z)ⁿ=k (pour z≠0). On pose u=(z+c)/z : trouve d'abord toutes les solutions u de uⁿ=k, PUIS calcule z depuis la solution réelle u=m.`;
    case "reelles":
      return `L'équation z²+[-A+(m₀-m)i]z+[P+k(m-m₀)i]=0 dépend d'un paramètre réel m. Trouve la valeur de m pour laquelle cette équation admet 2 solutions réelles.`;
    case "coef":
      return `L'équation z²+αz+β=0 a des coefficients α,β réels INCONNUS. On sait qu'elle admet la racine donnée z₀. Retrouve α et β.`;
    case "modules":
      return `Trouve z tel que |z|=|1/z| ET |z|=|z-d| (d donné) soient simultanément vérifiées.`;
  }
}

export function blocDonneesD(e: ExerciceComplexesD): string[] {
  switch (e.sousType) {
    case "ratio":
      return [`n=${e.n}\\quad c=${e.c}\\quad k=${e.m}^{${e.n}}=${e.m ** e.n}`];
    case "reelles": {
      const A = e.x1 + e.x2;
      const P = e.x1 * e.x2;
      return [`A=${A}\\quad P=${P}\\quad m_0\\text{ inconnu}\\quad k=${e.k}`];
    }
    case "coef":
      return [`z_0=${e.p}${e.q < 0 ? "" : "+"}${e.q}i`];
    case "modules": {
      // d=2p/r réduit à sa forme irréductible (le triplet pythagoricien peut être non primitif,
      // ex. [6,8,10]=2·[3,4,5] — jamais afficher une fraction non simplifiée, CLAUDE.md).
      const num = 2 * e.p;
      const g = pgcd(num, e.r);
      const numReduit = num / g;
      const denReduit = e.r / g;
      return [denReduit === 1 ? `d=${numReduit}` : `d=\\frac{${numReduit}}{${denReduit}}`];
    }
  }
}

export function consigneEcranD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): string {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran1" ? `Trouve les ${e.n} solutions u de uⁿ=k (ajoute une ligne par solution).` : "Utilise la solution RÉELLE u=m (confirmée) pour calculer z=c/(u-1).";
    case "reelles":
      if (phase === "dReellesEcran1") return "Substitue z=x (réel), sépare l'équation en 2 équations réelles (partie réelle=0, partie imaginaire=0).";
      if (phase === "dReellesEcran2") return "À partir des 2 équations CONFIRMÉES, déduis la valeur de m pour laquelle elles partagent les mêmes racines x.";
      return "Donne les 2 solutions réelles, pour le m CONFIRMÉ.";
    case "coef":
      return phase === "dCoefEcran1" ? "Substitue z₀ dans le polynôme, développe, sépare en 2 équations (partie réelle=0, partie imaginaire=0) en α et β." : "Résous le système CONFIRMÉ pour α et β.";
    case "modules":
      return phase === "dModulesEcran1" ? "Déduis |z| depuis |z|=|1/z|." : "Utilise |z|=1 CONFIRMÉ et |z|=|z-d| pour trouver les solutions z (ajoute une ligne par solution).";
  }
}

export function etatActuelD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): string[] | null {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran2" ? ["\\text{Les } n \\text{ solutions } u \\text{ confirmées}"] : null;
    case "reelles": {
      const equationsConfirmees = "\\text{2 équations confirmées}";
      if (phase === "dReellesEcran2") return [equationsConfirmees];
      // Écran 3 : cumule les 2 équations (écran 1) ET la valeur de m (écran 2), du plus ancien au
      // plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état
      // actuel cumulatif").
      if (phase === "dReellesEcran3") return [equationsConfirmees, `m=${e.m0}\\text{ (confirmé)}`];
      return null;
    }
    case "coef":
      return phase === "dCoefEcran2" ? ["\\text{2 équations confirmées}"] : null;
    case "modules":
      return phase === "dModulesEcran2" ? ["|z|=1\\text{ (confirmé)}"] : null;
  }
}

export function champsD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): ChampDef[] {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran2" ? [{ type: "texte", label: "z =", placeholder: "ex : 3" }] : [];
    case "reelles":
      if (phase === "dReellesEcran1") return [{ type: "texte", label: "Partie réelle = 0 :", placeholder: "ex : x^2-4*x+3=0" }, { type: "texte", label: "Partie imaginaire = 0 :", placeholder: "ex : (m0-m)*(x-k)=0" }];
      if (phase === "dReellesEcran2") return [{ type: "texte", label: "m =", placeholder: "ex : 2" }];
      return [];
    case "coef":
      if (phase === "dCoefEcran1") return [{ type: "texte", label: "Partie réelle = 0 :", placeholder: "ex : p*alpha+beta+c=0" }, { type: "texte", label: "Partie imaginaire = 0 :", placeholder: "ex : q*alpha+d=0" }];
      return [{ type: "texte", label: "α =", placeholder: "ex : -2" }, { type: "texte", label: "β =", placeholder: "ex : 5" }];
    case "modules":
      return phase === "dModulesEcran1" ? [{ type: "texte", label: "|z| =", placeholder: "ex : 1" }] : [];
  }
}

export function niveauAideMaxD(): number {
  return 0;
}

// ============================================================================
// Famille E.
// ============================================================================

export function consigneGeneraleE(): string {
  return "A, B, C, D sont 4 points donnés par leurs affixes. Détermine si les droites (AB) et (CD) sont parallèles, perpendiculaires, ou ni l'un ni l'autre, en étudiant l'argument du rapport (zD-zC)/(zB-zA).";
}

export function blocDonneesE(e: ExerciceComplexesE): string[] {
  return [`z_A=${affixeLatex(e.zA)}\\quad z_B=${affixeLatex(e.zB)}\\quad z_C=${affixeLatex(e.zC)}\\quad z_D=${affixeLatex(e.zD)}`];
}

export function consigneEcranE(phase: PhaseComplexesAvances): string {
  if (phase === "eEcran1") return "Calcule le rapport (zD-zC)/(zB-zA), sous forme a+bi.";
  if (phase === "eEcran2") return "À partir du rapport CONFIRMÉ, détermine son argument.";
  return "Conclus : les droites (AB) et (CD) sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ?";
}

export function etatActuelE(phase: PhaseComplexesAvances): string[] | null {
  const rapportConfirme = "\\text{Rapport confirmé}";
  if (phase === "eEcran2") return [rapportConfirme];
  // Écran 3 : cumule le rapport (écran 1) ET l'argument (écran 2), du plus ancien au plus récent —
  // jamais seulement l'écran immédiatement précédent (audit transversal "état actuel cumulatif").
  if (phase === "eEcran3") return [rapportConfirme, "\\text{Argument confirmé}"];
  return null;
}

export function optionsStatutE(): { id: string; label: string }[] {
  return [
    { id: "paralleles", label: "(AB) et (CD) sont parallèles" },
    { id: "perpendiculaires", label: "(AB) et (CD) sont perpendiculaires" },
    { id: "aucun", label: "Ni l'un ni l'autre" },
  ];
}

export function niveauAideMaxE(phase: PhaseComplexesAvances): number {
  return phase === "eEcran3" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "eEcran3") return AUCUNE_AIDE;
  return { texte: "(AB) ∥ (CD) ⟺ le rapport des affixes-différences est RÉEL. (AB) ⊥ (CD) ⟺ ce rapport est IMAGINAIRE PUR.", latex: null };
}
export function aideNiveau2E(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "eEcran3") return AUCUNE_AIDE;
  return { texte: "Partie réelle et partie imaginaire du rapport, rappelées séparément (une des deux est-elle nulle ? conclusion non donnée) :", latex: null };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceComplexesAvances): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD(exercice);
    case "E":
      return consigneGeneraleE();
  }
}

export function blocDonnees(exercice: ExerciceComplexesAvances): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
  }
}

export function consigneEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(exercice, phase);
    case "E":
      return consigneEcranE(phase);
  }
}

export function etatActuel(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(phase);
  }
}

/** Champs texte génériques — UNIQUEMENT pour les écrans NON dédiés (jamais les écrans A (QCM),
 * bEcran2 simple, bInterEcran3, cEcran3, dRatioEcran1, dReellesEcran3, dModulesEcran2, eEcran3 —
 * tous rendus par un composant spécialisé, voir `App6gen42.tsx`). */
export function champsEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): ChampDef[] {
  switch (exercice.famille) {
    case "B":
      if (exercice.sousType === "intersection") {
        if (phase === "bInterEcran1") return [{ type: "texte", label: "Équation de la droite (x,y) :", placeholder: "ex : y-x=1" }, { type: "texte", label: "Équation du cercle (x,y) :", placeholder: "ex : x^2+y^2=5" }];
        if (phase === "bInterEcran2") return [{ type: "texte", label: "Point 1 (a+bi) :", placeholder: "ex : 1+2i" }, { type: "texte", label: "Point 2 (a+bi) :", placeholder: "ex : -1-2i" }, { type: "texte", label: "Centre (a+bi) :", placeholder: "ex : 0" }, { type: "texte", label: "Rayon :", placeholder: "ex : sqrt(5)" }];
        return [];
      }
      return phase === "bEcran1" ? [{ type: "texte", label: "Équation (x,y) :", placeholder: "ex : x^2+y^2=5" }] : [];
    case "C":
      return phase === "cEcran1" || phase === "cEcran2" ? [{ type: "texte", label: "Expression développée :", placeholder: "ex : 1-zb*a-z*a+1" }] : [];
    case "D":
      return champsD(exercice, phase);
    case "E":
      if (phase === "eEcran1") return [{ type: "texte", label: "Rapport =", placeholder: "ex : 2-i" }];
      if (phase === "eEcran2") return [{ type: "texte", label: "Argument =", placeholder: "ex : pi/2" }];
      return [];
    default:
      return [];
  }
}

export function niveauAideMaxEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(exercice, phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD();
    case "E":
      return niveauAideMaxE(phase);
  }
}

export function aideNiveau1(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return AUCUNE_AIDE;
    case "E":
      return aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(phase);
    case "D":
      return AUCUNE_AIDE;
    case "E":
      return aideNiveau2E(phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseComplexesAvances, string> = {
  aEcran1: "Étape 1 (condition sur θ)",
  aEcran2: "Étape 2 (condition sur a,b)",
  aEcran3: "Étape 3 (condition complète)",
  bEcran1: "Étape 1 (équation)",
  bEcran2: "Étape 2 (nature du lieu)",
  bInterEcran1: "Étape 1 (2 équations)",
  bInterEcran2: "Étape 2 (paramètres des 2 lieux)",
  bInterEcran3: "Étape 3 (points d'intersection)",
  cEcran1: "Étape 1 (|numérateur|²)",
  cEcran2: "Étape 2 (|dénominateur|²)",
  cEcran3: "Étape 3 (conclusion)",
  dRatioEcran1: "Étape 1 (racines de uⁿ=k)",
  dRatioEcran2: "Étape 2 (z depuis u réel)",
  dReellesEcran1: "Étape 1 (2 équations)",
  dReellesEcran2: "Étape 2 (valeur de m)",
  dReellesEcran3: "Étape 3 (solutions réelles)",
  dCoefEcran1: "Étape 1 (2 équations)",
  dCoefEcran2: "Étape 2 (α, β)",
  dModulesEcran1: "Étape 1 (|z|)",
  dModulesEcran2: "Étape 2 (solutions)",
  eEcran1: "Étape 1 (rapport)",
  eEcran2: "Étape 2 (argument)",
  eEcran3: "Étape 3 (conclusion)",
};

export const LIBELLE_FAMILLE: Record<ExerciceComplexesAvances["famille"], string> = {
  A: "A — Condition pour (a+bi)ⁿ réel positif",
  B: "B — Lieux géométriques",
  C: "C — Préservation du cercle unité",
  D: "D — Équations avec paramètre(s)",
  E: "E — Parallélisme / perpendicularité",
};

function reponseA(exercice: ExerciceComplexesA, phase: PhaseComplexesAvances): string[] {
  if (phase === "aEcran1") return ["n·θ ≡ 0 (mod 2π)"];
  if (phase === "aEcran2") return [LIBELLE_CAB[exercice.n]];
  const seuil = `k^{1/${exercice.n}}`;
  return [`${LIBELLE_CAB[exercice.n]}, ET √(a²+b²) > ${seuil}`];
}

function reponseB(exercice: ExerciceComplexesB, phase: PhaseComplexesAvances): string[] {
  if (exercice.sousType === "intersection") {
    if (phase === "bInterEcran1") return ["\\text{2 équations en x,y}"];
    if (phase === "bInterEcran2") return [`\\text{Droite par }${affixeLatex(exercice.q1)}\\text{,}${affixeLatex(exercice.q2)}\\text{ ; cercle centre }0\\text{ rayon }${racineRationnelleLatex(exercice.kCercleO, 1).latex}`];
    return [`${affixeLatex(exercice.q1)}\\quad\\text{et}\\quad${affixeLatex(exercice.q2)}`];
  }
  if (phase === "bEcran1") return ["\\text{équation en x,y}"];
  return latexParamsLocus(exercice.resultat);
}

function reponseC(phase: PhaseComplexesAvances): string[] {
  if (phase === "cEcran1" || phase === "cEcran2") return ["1-\\bar p z-p\\bar z+|p|^2"];
  return ["\\text{Égales — }|z'|=1\\text{ ; réciproque vraie par symétrie}"];
}

function reponseD(exercice: ExerciceComplexesD, phase: PhaseComplexesAvances): string[] {
  switch (exercice.sousType) {
    case "ratio": {
      if (phase === "dRatioEcran1") {
        const racines: string[] = [];
        for (let k = 0; k < exercice.n; k++) {
          const angle = (2 * Math.PI * k) / exercice.n;
          racines.push(affixeLatexRationnel(exercice.m * Math.cos(angle), exercice.m * Math.sin(angle)));
        }
        return racines;
      }
      return [`z=${latexRationnel(exercice.c / (exercice.m - 1))}`];
    }
    case "reelles":
      if (phase === "dReellesEcran1") return ["\\text{2 équations en x,m}"];
      if (phase === "dReellesEcran2") return [`m=${exercice.m0}`];
      return [`${exercice.x1}`, `${exercice.x2}`];
    case "coef":
      if (phase === "dCoefEcran1") return ["\\text{2 équations en }\\alpha,\\beta"];
      return [`\\alpha=${-2 * exercice.p}\\quad\\beta=${exercice.p * exercice.p + exercice.q * exercice.q}`];
    case "modules":
      if (phase === "dModulesEcran1") return ["|z|=1"];
      return [affixeLatexRationnel(exercice.p / exercice.r, exercice.q / exercice.r), affixeLatexRationnel(exercice.p / exercice.r, -exercice.q / exercice.r)];
  }
}

function reponseE(exercice: ExerciceComplexesE, phase: PhaseComplexesAvances): string[] {
  const num: AffixeSimple = { a: exercice.zD.a - exercice.zC.a, b: exercice.zD.b - exercice.zC.b };
  const den: AffixeSimple = { a: exercice.zB.a - exercice.zA.a, b: exercice.zB.b - exercice.zA.b };
  const norme = den.a * den.a + den.b * den.b;
  const ratio = { re: (num.a * den.a + num.b * den.b) / norme, im: (num.b * den.a - num.a * den.b) / norme };
  if (phase === "eEcran1") return [affixeLatexRationnel(ratio.re, ratio.im)];
  if (phase === "eEcran2") {
    const angle = calculerArgument(ratio.re, ratio.im);
    return [angle.latex];
  }
  const libelles: Record<string, string> = { paralleles: "\\text{parallèles}", perpendiculaires: "\\text{perpendiculaires}", aucun: "\\text{ni l'un ni l'autre}" };
  return [libelles[exercice.statut]];
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseA(exercice, phase);
    case "B":
      return reponseB(exercice, phase);
    case "C":
      return reponseC(phase);
    case "D":
      return reponseD(exercice, phase);
    case "E":
      return reponseE(exercice, phase);
  }
}

/** Total points du récapitulatif final — maximum VARIABLE selon le nombre d'écrans réellement
 * traversés par CET exercice (2 à 4 selon famille/sous-type). */
export function calculerTotalPointsComplexesAvances(resultat: ResultatExerciceComplexesAvances): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
