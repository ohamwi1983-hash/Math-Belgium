import type { ExerciceLieuxA, ExerciceLieuxB, ExerciceLieuxC, ExerciceLieuxD, ExerciceLieuxE, ExerciceLieuxGeometriquesParametres, FamilleLieuxGeometriquesParametres, TypeStatutLieu } from "../core6e/lieuxGeometriquesParametres.types";
import type { PhaseLieuxGeometriquesParametres, ResultatExerciceLieuxGeometriquesParametres } from "../moteur6e/typesLieuxGeometriquesParametres";
import { phasesPourExercice } from "../moteur6e/typesLieuxGeometriquesParametres";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen56`. Dispatch sur
 * `exercice.famille` PUIS `sousType` PUIS `phase`, mirroir `formatDenombrementFondamental.ts`
 * (6gen43), jamais importé par un autre générateur (chaque générateur reste indépendant —
 * CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths ;
 * les labels de champ, eux, restent du texte SIMPLE (jamais rendus par KaTeX — voir
 * `EtapeChampsLieuxGeometriquesParametres.tsx`), donc écrits en unicode brut (⬚, ², ≥, …) — mirroir
 * `champTexte("n² − 3n − ⬚ = 0, ⬚ =", …)` de `formatDenombrementFondamental.ts`. Couverture de
 * régression : `formatLieuxGeometriquesParametres.test.ts`, scan sur fixtures ET tirages réels.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

function champChoix(label: string, options: OptionChoix[]): ChampDef {
  return { type: "choix", label, options };
}

/** Options du champ "nature du lieu" — 7 valeurs de `StatutLieu["type"]`, TOUJOURS proposées au
 * complet (jamais filtrées) sur les écrans de synthèse (famille B écran4, famille E "perpendiculaires"
 * /"secantes" écran4) : la compétence testée est de reconnaître la nature parmi des distracteurs
 * plausibles (ex. confondre "droite" et "pairDeDroites"), pas seulement parmi les issues possibles
 * de CE sous-type précis. */
const OPTIONS_NATURE: Record<TypeStatutLieu, string> = {
  vide: "∅ (ensemble vide)",
  point: "Un point isolé",
  droite: "Une droite",
  pairDeDroites: "Une paire de droites",
  cercle: "Un cercle",
  bandePleine: "Une région pleine (bords compris)",
  formeEtendue: "Une forme étendue (polygone)",
};
const TOUTES_OPTIONS_NATURE: OptionChoix[] = (Object.keys(OPTIONS_NATURE) as TypeStatutLieu[]).map((v) => ({ valeur: v, label: OPTIONS_NATURE[v] }));
function champNature(label = "Nature du lieu ="): ChampDef {
  return champChoix(label, TOUTES_OPTIONS_NATURE);
}

// Utilitaires d'affichage d'un terme signé (évite tout "+-"/"--" orphelin).
function termeSigne(premier: boolean, coef: number, variable: string): string {
  const abs = Math.abs(coef);
  const partie = abs === 1 ? variable : `${abs}${variable}`;
  if (premier) return coef < 0 ? `-${partie}` : partie;
  return coef < 0 ? ` - ${partie}` : ` + ${partie}`;
}
function constanteSigne(c: number): string {
  if (c === 0) return "";
  return c < 0 ? ` - ${Math.abs(c)}` : ` + ${c}`;
}

// ============================================================================
// Famille A — Lieux définis par une équation à valeurs absolues.
// ============================================================================

export function consigneGeneraleA(): string {
  return "Le lieu des points M(x;y) vérifiant l'équation à valeurs absolues donnée se détermine en distinguant les cas selon le signe du contenu de chaque valeur absolue.";
}

function labelCasAbsolu(a: number, b: number): string {
  return `${termeSigne(true, a, "x")}${termeSigne(false, b, "y")} + ⬚ = 0, ⬚ =`;
}

export function blocDonneesA(e: ExerciceLieuxA): string[] {
  if (e.sousType === "paralleles") return [`|${termeSigne(true, e.alpha, "x")}${termeSigne(false, e.beta, "y")}${constanteSigne(e.gamma)}| = ${e.k}`];
  const signe = e.sousType === "nonBorne" ? "-" : "+";
  return [`|x${constanteSigne(-e.p)}|${signe}|y${constanteSigne(-e.q)}| = ${e.k}`];
}

export function consigneEcranA(phase: PhaseLieuxGeometriquesParametres): string {
  if (phase.endsWith("Ecran1")) return "Combien de cas faut-il distinguer, selon le(s) signe(s) du contenu de la (ou des) valeur(s) absolue(s) ?";
  if (phase.endsWith("Ecran2")) return "Résous chaque cas identifié : complète la constante de l'équation obtenue dans chaque cas.";
  return "En annulant tour à tour chaque valeur absolue (cas CONFIRMÉS de l'étape précédente), donne les 4 sommets du losange.";
}

// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `aLosangeEcran3` ne montrait
// auparavant QUE les cas confirmés à `aLosangeEcran2`, sans le nombre de cas confirmé à
// `aLosangeEcran1`.
export function etatActuelA(e: ExerciceLieuxA, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  if (phase === "aLosangeEcran3" && e.sousType === "losange") {
    const nombreCasConfirme = `\\text{Nombre de cas confirmé : }${e.cas.length}`;
    const casConfirmes = e.cas.map((c) => `\\text{${c.label} : }${termeSigne(true, c.a, "x")}${termeSigne(false, c.b, "y")}${constanteSigne(c.c)}=0\\text{ (confirmé)}`);
    return [nombreCasConfirme, ...casConfirmes];
  }
  return null;
}

export function champsA(e: ExerciceLieuxA, phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  if (phase.endsWith("Ecran1")) return [champTexte("Nombre de cas =", "ex : 2")];
  if (phase === "aParallelesEcran2") {
    const gabarit = `${termeSigne(true, e.sousType === "paralleles" ? e.alpha : 1, "x")}${termeSigne(false, e.sousType === "paralleles" ? e.beta : 1, "y")}`;
    return [champTexte(`${gabarit} + ⬚ = 0 (contenu ≥ 0), ⬚ =`, "ex : -3"), champTexte(`${gabarit} + ⬚ = 0 (contenu < 0), ⬚ =`, "ex : 3")];
  }
  if (phase === "aNonBorneEcran2" || phase === "aLosangeEcran2") return e.sousType !== "paralleles" ? e.cas.map((c) => champTexte(`${c.label} : ${labelCasAbsolu(c.a, c.b)}`, "ex : -2")) : [];
  // aLosangeEcran3
  if (e.sousType === "losange") return e.sommets.flatMap((_s, i) => [champTexte(`Sommet ${i + 1} : x =`, "ex : 3"), champTexte(`Sommet ${i + 1} : y =`, "ex : -1")]);
  return [];
}

export function niveauAideMaxA(phase: PhaseLieuxGeometriquesParametres): number {
  return phase.endsWith("Ecran1") ? 2 : 0;
}
export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Chaque valeur absolue impose de distinguer le signe de son contenu : une valeur absolue seule donne 2 cas, deux valeurs absolues indépendantes en donnent 4 (tous les couples de signes possibles).", latex: null };
}
export function aideNiveau2A(e: ExerciceLieuxA): AideAvecLatex {
  if (e.sousType === "paralleles") return { texte: "1ᵉʳ cas (contenu ≥ 0) déjà posé — le second (contenu < 0) reste à écrire :", latex: `${termeSigne(true, e.alpha, "x")}${termeSigne(false, e.beta, "y")}${constanteSigne(e.gamma - e.k)}=0` };
  const c0 = e.cas[0];
  return { texte: `1ᵉʳ cas (${c0.label}) déjà posé — les 3 autres restent à écrire :`, latex: `${termeSigne(true, c0.a, "x")}${termeSigne(false, c0.b, "y")}${constanteSigne(c0.c)}=0` };
}

// ============================================================================
// Famille B — Lieu depuis une condition de distance au carré, avec seuils.
// ============================================================================

/** Une ou plusieurs LIGNES par sous-type (jamais une seule longue phrase française en un seul
 * fragment KaTeX — convention CLAUDE.md, "horizontal overflow from a long French sentence in one
 * KaTeX fragment" : `seuilCarre` déborde à 375-500px si condensé sur 1 seule ligne, corrigé en 2
 * lignes plus courtes après vérification Playwright). */
const LABEL_CONFIG_B: Record<ExerciceLieuxB["sousType"], string[]> = {
  bissectrices: ["Équidistance à 2 droites d₁, d₂"],
  droite: ["PA² − PB² = k (A, B fixes)"],
  cerclePerp: ["dist(P,d₁)² + dist(P,d₂)² = k", "(d₁⊥d₂)"],
  seuil2Points: ["PA² + PB² = k (A, B fixes)"],
  apollonius: ["PA² / PB² = k (A, B fixes)"],
  seuilCarre: ["Somme des carrés", "des distances aux 4", "côtés d'un carré = k"],
};

export function consigneGeneraleB(): string {
  return "Détermine la nature du lieu des points M vérifiant la condition de distance au carré donnée. Certains sous-types dépendent d'un seuil critique sur k, d'autres jamais — identifie lequel avant de conclure.";
}

export function blocDonneesB(e: ExerciceLieuxB): string[] {
  const config = LABEL_CONFIG_B[e.sousType].map((ligne) => `\\text{${ligne}}`);
  switch (e.sousType) {
    case "bissectrices":
      return [...config, `d_1 : x+y=${e.e1}`, `d_2 : x-y=${e.e2}`];
    case "droite":
      return [...config, `A(${e.xa};${e.ya})`, `B(${e.xb};${e.yb})`, `k=${e.k}`];
    case "cerclePerp":
      return [...config, `d_1 : x=${e.x0}`, `d_2 : y=${e.y0}`, `k=${e.k}`];
    case "seuil2Points":
      return [...config, `A(${e.xa};${e.ya})`, `B(${e.xb};${e.yb})`, `k=${e.k}`];
    case "apollonius":
      return [...config, `A(${-e.a};0)`, `B(${e.a};0)`, `k=${e.casK1 ? "1" : `${e.k.num}/${e.k.den}`}`];
    case "seuilCarre":
      return [...config, `\\text{carré de demi-côté }c=${e.c}`, `k=${e.k}`];
  }
}

export function consigneEcranB(e: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres): string {
  if (phase.endsWith("Ecran1")) return "Pose l'expression algébrique de la condition en x, y : identifie la (les) quantité(s) obtenue(s) en développant chaque distance élevée au carré.";
  if (phase.endsWith("Ecran2")) return "Développe et simplifie la condition (fais apparaître, quand c'est pertinent, la forme X²+Y²=… pour un cercle centré à l'origine).";
  if (phase.endsWith("Ecran3")) {
    if (e.sousType === "apollonius") return "Le rapport k vaut-il exactement 1, ou non ?";
    if (e.sousType === "seuil2Points" || e.sousType === "seuilCarre") return "Détermine le seuil critique (à partir de l'étape précédente, confirmé), puis compare k à ce seuil pour identifier le régime.";
    return "Ce sous-type nécessite-t-il de comparer k à un seuil critique avant de conclure ?";
  }
  return "Donne la nature finale du lieu (à partir du régime confirmé) et son équation complète (ou son statut ∅/point).";
}

// Accumulation (correctif transversal — le bloc "état actuel" doit lister TOUTES les réponses
// validées des écrans précédents, du plus ancien au plus récent, jamais seulement celle de l'écran
// immédiatement précédent, voir CLAUDE.md/`docs/historique-6e.md`) : la version d'origine ne
// montrait, à Ecran3, QUE le résultat de Ecran2 (jamais celui de Ecran1) et, à Ecran4, QUE le
// résultat de Ecran2 pour les 3 sous-types SANS seuil (jamais Ecran1 NI la confirmation "pas de
// seuil" de Ecran3) ou QUE le résultat de Ecran3 pour les 3 sous-types À seuil (jamais Ecran1 NI
// l'équation développée de Ecran2). Redécoupé en 3 fonctions `confirmeEcranNB`, une par écran,
// assemblées cumulativement ci-dessous.
function confirmeEcran1B(e: ExerciceLieuxB): string {
  switch (e.sousType) {
    case "bissectrices":
      return "\\text{Nombre de cas confirmé : }2";
    case "droite":
      return "\\text{Coefficients de x² dans PA² et PB² confirmés : }1\\text{ et }1";
    case "cerclePerp":
      return `\\text{x0}^2\\text{+y0}^2\\text{ confirmé : }${e.constanteEcran1}`;
    case "seuil2Points":
      return `\\text{xa}^2\\text{+ya}^2\\text{ et xb}^2\\text{+yb}^2\\text{ confirmés : }${e.constanteA}\\text{ et }${e.constanteB}`;
    case "apollonius":
      return `\\text{Coefficients confirmés (étape 1) : }${e.ecran1Val1}\\text{ et }${e.ecran1Val2}`;
    case "seuilCarre":
      return `\\text{Constante d'une paire de côtés confirmée : }${e.constanteEcran1}`;
  }
}
function confirmeEcran2B(e: ExerciceLieuxB): string {
  switch (e.sousType) {
    case "bissectrices":
      return `x=${e.xBis}\\text{ et }y=${e.yBis}\\text{ (confirmés)}`;
    case "droite":
      return `${e.A}x${termeSigne(false, e.B, "y")}${constanteSigne(e.C)}=0\\text{ (confirmé)}`;
    case "cerclePerp":
    case "seuil2Points":
      return `x^2+y^2${termeSigne(false, e.D, "x")}${termeSigne(false, e.E, "y")}${constanteSigne(e.F)}=0\\text{ (confirmé)}`;
    case "apollonius":
      return e.casK1 ? `${e.ecran2CoefX}x=0\\text{ (confirmé)}` : `x^2+y^2${termeSigne(false, e.ecran2CoefX, "x")}${constanteSigne(e.ecran2Constante as number)}=0\\text{ (confirmé)}`;
    case "seuilCarre":
      return `x^2+y^2=${e.rhsEcran2}\\text{ (confirmé)}`;
  }
}
function confirmeEcran3B(e: ExerciceLieuxB): string {
  switch (e.sousType) {
    case "bissectrices":
    case "droite":
    case "cerclePerp":
      return "\\text{Seuil critique nécessaire ? }\\textbf{Non}\\text{ (confirmé)}";
    case "seuil2Points":
    case "seuilCarre":
      return `\\text{seuil}=${e.seuil}\\text{, régime confirmé : }${e.regime}`;
    case "apollonius":
      return `\\text{cas confirmé : }${e.casK1 ? "k=1" : "k\\neq 1"}`;
  }
}
export function etatActuelB(e: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  if (phase.endsWith("Ecran3")) return [confirmeEcran1B(e), confirmeEcran2B(e)];
  if (phase.endsWith("Ecran4")) return [confirmeEcran1B(e), confirmeEcran2B(e), confirmeEcran3B(e)];
  return null;
}

const OPTIONS_OUI_NON: OptionChoix[] = [
  { valeur: "oui", label: "Oui, un seuil critique s'applique ici" },
  { valeur: "non", label: "Non, ce sous-type ne nécessite aucun seuil" },
];
const OPTIONS_REGIME_3: (labels: [TypeStatutLieu, TypeStatutLieu, TypeStatutLieu]) => OptionChoix[] = (labels) => labels.map((v) => ({ valeur: v, label: OPTIONS_NATURE[v] }));
const OPTIONS_K1: OptionChoix[] = [
  { valeur: "k1", label: "k = 1 (médiatrice de [AB])" },
  { valeur: "kAutre", label: "k ≠ 1 (cercle)" },
];

export function champsB(e: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  if (phase.endsWith("Ecran1")) {
    switch (e.sousType) {
      case "bissectrices":
        return [champTexte("Nombre de cas =", "ex : 2")];
      case "droite":
        return [champTexte("Coefficient de x² dans PA² =", "ex : 1"), champTexte("Coefficient de x² dans PB² =", "ex : 1")];
      case "cerclePerp":
        return [champTexte(`x0²+y0² =`, "ex : 5")];
      case "seuil2Points":
        return [champTexte("xa²+ya² =", "ex : 0"), champTexte("xb²+yb² =", "ex : 16")];
      case "apollonius":
        return e.casK1 ? [champTexte("Coefficient de x² dans PA² =", "ex : 1"), champTexte("Coefficient de x² dans PB² =", "ex : 1")] : [champTexte("Coefficient de x dans PA² =", "ex : 6"), champTexte("Coefficient de x dans PB² =", "ex : -6")];
      case "seuilCarre":
        return [champTexte("Constante d'UNE paire de côtés opposés =", "ex : 8")];
    }
  }
  if (phase.endsWith("Ecran2")) {
    switch (e.sousType) {
      case "bissectrices":
        return [champTexte("Bissectrice verticale : x =", "ex : 1"), champTexte("Bissectrice horizontale : y =", "ex : 3")];
      case "droite":
        return [champTexte("Coefficient de x =", "ex : 4"), champTexte("Coefficient de y =", "ex : -6"), champTexte("Constante =", "ex : -1")];
      case "cerclePerp":
      case "seuil2Points":
        return [champTexte("Coefficient de x =", "ex : -2"), champTexte("Coefficient de y =", "ex : 4"), champTexte("Constante =", "ex : -4")];
      case "apollonius":
        return e.casK1 ? [champTexte("Coefficient de x (équation 4a·x=0) =", "ex : 12")] : [champTexte("Coefficient de x =", "ex : -10"), champTexte("Constante =", "ex : 9")];
      case "seuilCarre":
        return [champTexte("x²+y² = ⬚, ⬚ =", "ex : 4")];
    }
  }
  if (phase.endsWith("Ecran3")) {
    switch (e.sousType) {
      case "bissectrices":
      case "droite":
      case "cerclePerp":
        return [champChoix("Un seuil critique s'applique-t-il ici ?", OPTIONS_OUI_NON)];
      case "seuil2Points":
        return [champTexte("Seuil critique =", "ex : 8"), champChoix("Régime (k comparé au seuil) =", OPTIONS_REGIME_3(["cercle", "point", "vide"]))];
      case "apollonius":
        return [champChoix("k=1 ou k≠1 ?", OPTIONS_K1)];
      case "seuilCarre":
        return [champTexte("Seuil critique =", "ex : 16"), champChoix("Régime (k comparé au seuil) =", OPTIONS_REGIME_3(["cercle", "point", "vide"]))];
    }
  }
  // écran4
  switch (e.sousType) {
    case "bissectrices":
      return [champNature(), champTexte("x de la bissectrice verticale =", "ex : 1"), champTexte("y de la bissectrice horizontale =", "ex : 3")];
    case "droite":
      return [champNature(), champTexte("Coefficient de x =", "ex : 4"), champTexte("Coefficient de y =", "ex : -6"), champTexte("Constante =", "ex : -1")];
    case "cerclePerp":
      return [champNature(), champTexte("Centre : x =", "ex : 1"), champTexte("Centre : y =", "ex : -2"), champTexte("Rayon =", "ex : 3")];
    case "seuil2Points":
      if (e.regime === "vide") return [champNature()];
      if (e.regime === "point") return [champNature(), champTexte("Centre/point : x =", "ex : 2"), champTexte("Centre/point : y =", "ex : 0")];
      return [champNature(), champTexte("Centre : x =", "ex : 2"), champTexte("Centre : y =", "ex : 0"), champTexte("Rayon =", "ex : 2")];
    case "apollonius":
      return e.casK1 ? [champNature(), champTexte("x (médiatrice) =", "ex : 0")] : [champNature(), champTexte("Centre : x =", "ex : 5"), champTexte("Centre : y =", "ex : 0"), champTexte("Rayon =", "ex : 4")];
    case "seuilCarre":
      if (e.regime === "vide") return [champNature()];
      if (e.regime === "point") return [champNature(), champTexte("Centre : x =", "ex : 0"), champTexte("Centre : y =", "ex : 0")];
      return [champNature(), champTexte("Centre : x =", "ex : 0"), champTexte("Centre : y =", "ex : 0"), champTexte("Rayon =", "ex : 2")];
  }
}

export function niveauAideMaxB(e: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres): number {
  if (phase.endsWith("Ecran2")) return 2;
  if (phase.endsWith("Ecran3") && (e.sousType === "seuil2Points" || e.sousType === "apollonius" || e.sousType === "seuilCarre")) return 2;
  return 0;
}
export function aideNiveau1B(phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  if (phase.endsWith("Ecran2")) return { texte: "Les termes quadratiques (x²,y²) s'ANNULENT pour une DIFFÉRENCE de distances au carré (le lieu est alors une droite), mais PERSISTENT pour une SOMME ou un RAPPORT (le lieu est alors un cercle en général).", latex: null };
  return { texte: "La somme des carrés des distances à des points/droites fixes admet une valeur MINIMALE géométrique, atteinte en un point particulier (souvent le centre de symétrie de la configuration) — compare k à cette valeur minimale.", latex: null };
}
export function aideNiveau2B(e: ExerciceLieuxB, phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  if (phase.endsWith("Ecran2")) {
    switch (e.sousType) {
      case "bissectrices":
        return { texte: "Développement partiel : la bissectrice verticale s'obtient en additionnant e1 et e2, la bissectrice horizontale en les soustrayant — division par 2 non encore faite.", latex: `x=\\dfrac{e_1+e_2}{2},\\ y=\\dfrac{e_1-e_2}{2}` };
      case "droite":
        return { texte: "Coefficient de x déjà développé (coefficient de y et constante restent à déterminer) :", latex: `${e.A}` };
      case "cerclePerp":
      case "seuil2Points":
        return { texte: "Coefficient de x déjà développé (coefficient de y et constante restent à déterminer) :", latex: `${e.D}` };
      case "apollonius":
        return { texte: "Coefficient de x déjà développé (constante éventuelle restant à déterminer) :", latex: `${e.ecran2CoefX}` };
      case "seuilCarre":
        return { texte: "Le −4c² a déjà été isolé du côté droit (division par 2 restant à faire) :", latex: `x^2+y^2=\\dfrac{k-${e.seuil}}{2}` };
    }
  }
  switch (e.sousType) {
    case "seuil2Points":
      return { texte: "Valeur du seuil déjà calculée (comparaison à k non faite) :", latex: `${e.seuil}` };
    case "seuilCarre":
      return { texte: "Valeur du seuil déjà calculée (comparaison à k non faite) :", latex: `${e.seuil}` };
    case "apollonius":
      return { texte: "Rappel : k=1 correspond exactement au cas où PA²=PB² (mêmes coefficients quadratiques que pour une droite) — comparaison à la valeur réelle de k non encore faite.", latex: null };
    default:
      return AUCUNE_AIDE;
  }
}

// ============================================================================
// Famille C — Cercle depuis une équation quadratique.
// ============================================================================

export function consigneGeneraleC(): string {
  return "Regroupe les termes en x et en y séparément, divise par le coefficient commun de x² et y², puis complète le carré pour identifier le cercle.";
}
export function blocDonneesC(e: ExerciceLieuxC): string[] {
  return [`${e.m > 1 ? e.m : ""}x^2+${e.m > 1 ? e.m : ""}y^2${termeSigne(false, e.D, "x")}${termeSigne(false, e.E, "y")}${constanteSigne(e.F)}=0`];
}
export function consigneEcranC(phase: PhaseLieuxGeometriquesParametres): string {
  if (phase === "cEcran1") return "Complète le carré : donne h, k' (valeurs ajoutées dans chaque carré) et R (rayon au carré), sous la forme (x+h)²+(y+k')²=R.";
  return "Identifie le centre et le rayon du cercle (à partir de la forme confirmée).";
}
export function etatActuelC(e: ExerciceLieuxC, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  if (phase === "cEcran2") return [`(x${constanteSigne(e.h)})^2+(y${constanteSigne(e.kPrime)})^2=${e.R}\\text{ (confirmé)}`];
  return null;
}
export function champsC(phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  if (phase === "cEcran1") return [champTexte("h =", "ex : -2"), champTexte("k' =", "ex : 3"), champTexte("R (rayon au carré) =", "ex : 16")];
  return [champTexte("Centre : x =", "ex : 2"), champTexte("Centre : y =", "ex : -3"), champTexte("Rayon =", "ex : 4")];
}
export function niveauAideMaxC(phase: PhaseLieuxGeometriquesParametres): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(): AideAvecLatex {
  return { texte: "Avant de compléter le carré, divise TOUTE l'équation par le coefficient commun de x² et de y² (s'il diffère de 1).", latex: null };
}
export function aideNiveau2C(e: ExerciceLieuxC): AideAvecLatex {
  return { texte: "Division déjà effectuée (complétion du carré non encore faite) :", latex: `x^2+y^2${termeSigne(false, e.D / e.m, "x")}${termeSigne(false, e.E / e.m, "y")}${constanteSigne(e.F / e.m)}=0` };
}

// ============================================================================
// Famille D — Éliminer un paramètre.
// ============================================================================

const OPTIONS_METHODE_D: OptionChoix[] = [
  { valeur: "substitution", label: "Isoler t, substituer (élever au carré/cube si besoin)" },
  { valeur: "fractions", label: "Manipuler les fractions pour isoler t" },
  { valeur: "ratio", label: "Reconnaître un rapport qui élimine directement t" },
];

export function consigneGeneraleD(): string {
  return "Le point M(x;y) est défini par 2 expressions paramétrées par t. Identifie la méthode d'élimination adaptée, puis élimine t pour obtenir l'équation cartésienne du lieu.";
}
export function blocDonneesD(e: ExerciceLieuxD): string[] {
  if (e.sousType === "substitution") return [`x=\\sqrt{t}${constanteSigne(e.p)}\\ (t\\geqslant 0)`, `y=${e.q}t${constanteSigne(e.r)}`];
  if (e.sousType === "fractions") return [`x=\\dfrac{1}{t${constanteSigne(e.a)}}`, `y=\\dfrac{t${constanteSigne(e.b)}}{t${constanteSigne(e.a)}}`];
  return [`x=${e.a}t^{${e.exposantY}}`, `y=${e.b}t^{${e.exposantX}}`];
}
export function consigneEcranD(phase: PhaseLieuxGeometriquesParametres): string {
  if (phase.endsWith("Ecran1")) return "Quelle méthode d'élimination est la mieux adaptée ici ?";
  if (phase.endsWith("Ecran2")) return "Applique la méthode CONFIRMÉE : isole t (ou l'expression clé qui l'élimine).";
  return "Substitue et simplifie pour obtenir l'équation cartésienne finale.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `Ecran3` ne montrait
// auparavant QUE le résultat confirmé à `Ecran2`, sans la méthode confirmée à `Ecran1`. `methodeDTexte`
// est définie plus bas dans ce fichier (déclaration de fonction, donc hissée — utilisable ici).
export function etatActuelD(e: ExerciceLieuxD, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  if (!phase.endsWith("Ecran3")) return null;
  const methodeConfirmee = `\\text{Méthode confirmée : }${methodeDTexte(e.sousType)}`;
  if (e.sousType === "substitution") return [methodeConfirmee, `t=x^2${termeSigne(false, e.coefX, "x")}${constanteSigne(e.coefConst)}\\text{ (confirmé)}`];
  if (e.sousType === "fractions") return [methodeConfirmee, `y=${e.pente}x+1\\text{ (pente confirmée)}`];
  return [methodeConfirmee, `x^{${e.exposantX}}/y^{${e.exposantY}}\\text{ constant (exposants confirmés)}`];
}
export function champsD(e: ExerciceLieuxD, phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  if (phase.endsWith("Ecran1")) return [champChoix("Méthode =", OPTIONS_METHODE_D)];
  if (e.sousType === "substitution") {
    if (phase === "dSubstitutionEcran2") return [champTexte("t = x² + ⬚·x + ⬚, coefficient de x =", "ex : -2"), champTexte("t = x² + ⬚·x + ⬚, constante =", "ex : 1")];
    return [champTexte("y = ⬚x²+⬚x+⬚, coefficient de x² =", "ex : 2"), champTexte("coefficient de x =", "ex : -4"), champTexte("constante =", "ex : 1")];
  }
  if (e.sousType === "fractions") {
    if (phase === "dFractionsEcran2") return [champTexte("y = ⬚·x + 1, coefficient (b−a) =", "ex : 2")];
    return [champTexte("Coefficient de x =", "ex : 2"), champTexte("Constante =", "ex : 1")];
  }
  if (phase === "dRatioEcran2") return [champTexte("Exposant à appliquer à x =", "ex : 2"), champTexte("Exposant à appliquer à y =", "ex : 3")];
  return [champTexte("Constante C (x^exposantX = C·y^exposantY) =", "ex : 4/27")];
}
export function niveauAideMaxD(phase: PhaseLieuxGeometriquesParametres): number {
  return phase.endsWith("Ecran1") ? 2 : 0;
}
export function aideNiveau1D(): AideAvecLatex {
  return { texte: "Des fractions dans l'expression suggèrent d'isoler t algébriquement ; un rapport direct (quand les 2 expressions partagent un facteur commun en t, ex. des puissances de t) offre souvent un raccourci plus rapide.", latex: null };
}
export function aideNiveau2D(e: ExerciceLieuxD): AideAvecLatex {
  if (e.sousType === "substitution") return { texte: "x est de la forme √t+constante (structure commentée, méthode non encore choisie) : isoler t exige d'élever au carré.", latex: null };
  if (e.sousType === "fractions") return { texte: "x et y partagent le même dénominateur (t+a) (structure commentée, méthode non encore choisie).", latex: null };
  return { texte: "x et y sont chacun une puissance pure de t (structure commentée, méthode non encore choisie) : un rapport bien choisi élimine t sans jamais isoler t explicitement.", latex: null };
}

// ============================================================================
// Famille E — Lieu par seuil, somme de distances simples.
// ============================================================================

const LABEL_CONFIG_E: Record<ExerciceLieuxE["sousType"], string> = {
  paralleles: "2 droites parallèles",
  perpendiculaires: "2 droites perpendiculaires",
  secantes: "2 droites sécantes non perpendiculaires",
  carre: "4 côtés d'un carré",
};
/** Mêmes libellés que `LABEL_CONFIG_E`, scindés en lignes COURTES pour un usage KaTeX (jamais pour
 * un bouton/label de champ, texte SIMPLE qui s'enroule naturellement) — "2 droites sécantes non
 * perpendiculaires" (40 caractères) déborde à 375px en 1 seul fragment (convention CLAUDE.md,
 * corrigé après vérification Playwright, même piège que `LABEL_CONFIG_B`). */
const LABEL_CONFIG_E_KATEX: Record<ExerciceLieuxE["sousType"], string[]> = {
  paralleles: ["2 droites parallèles"],
  perpendiculaires: ["2 droites", "perpendiculaires"],
  secantes: ["2 droites sécantes", "non perpendiculaires"],
  carre: ["4 côtés d'un carré"],
};
const OPTIONS_CONFIG_E: OptionChoix[] = (Object.keys(LABEL_CONFIG_E) as ExerciceLieuxE["sousType"][]).map((v) => ({ valeur: v, label: LABEL_CONFIG_E[v] }));
const OPTIONS_STRATEGIE_E: OptionChoix[] = [
  { valeur: "seuil", label: "Raisonnement par seuil nécessaire" },
  { valeur: "direct", label: "Forme directe, aucun seuil" },
];

export function consigneGeneraleE(): string {
  return "La somme des distances de M aux 2 références (droites, ou côtés d'un carré) vaut k. Identifie d'abord si un raisonnement par seuil s'impose ici, avant de déterminer le lieu.";
}
export function blocDonneesE(e: ExerciceLieuxE): string[] {
  // "Configuration : " et le libellé sur 2 fragments SÉPARÉS (jamais concaténés en 1 seule ligne)
  // — le libellé le plus long ("2 droites sécantes non perpendiculaires") déborde à 375-500px sinon
  // (convention CLAUDE.md, corrigé après vérification Playwright).
  const config = [`\\text{Configuration :}`, ...LABEL_CONFIG_E_KATEX[e.sousType].map((ligne) => `\\text{${ligne}}`)];
  switch (e.sousType) {
    case "paralleles":
      return [...config, `a: x=0,\\ b: x=${e.d}`, `k=${e.k}`];
    case "perpendiculaires":
      return [...config, `a: x=0,\\ b: y=0`, `k=${e.k}`];
    case "secantes":
      return [...config, `a: y=0,\\ b: 3x-4y=0`, `k=${e.k}`];
    case "carre":
      return [...config, `\\text{carré de demi-côté }c=${e.c}`, `k=${e.k}`];
  }
}
export function consigneEcranE(e: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres): string {
  if (phase.endsWith("Ecran1")) return "Identifie la configuration donnée et choisis la stratégie adaptée.";
  if (phase.endsWith("Ecran2")) return "Détermine le seuil critique (valeur minimale géométriquement atteignable de la somme), à partir de la configuration confirmée.";
  if (phase.endsWith("Ecran3")) return e.sousType === "perpendiculaires" || e.sousType === "secantes" ? "Construis directement la forme (aucune comparaison à un seuil n'est nécessaire ici)." : "Compare k au seuil confirmé et détermine le régime.";
  return "Donne l'équation ou la description complète du lieu, pour le régime confirmé.";
}
// Accumulation (correctif transversal, voir `etatActuelB` ci-dessus) : `Ecran3` ne montrait
// auparavant QUE le seuil (rien de `Ecran1`) et `Ecran4` ne montrait QUE le régime confirmé à
// `Ecran3` (ni la configuration/stratégie de `Ecran1`, ni le seuil de `Ecran2`). `configETexte`/
// `strategieETexte` sont définies plus bas dans ce fichier (déclarations de fonction, hissées).
export function etatActuelE(e: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  if (e.sousType !== "paralleles" && e.sousType !== "carre") return null;
  const configConfirmee = `\\text{Configuration confirmée : }${configETexte(e.sousType)}\\text{, stratégie confirmée : }${strategieETexte("seuil")}`;
  const seuilConfirme = `\\text{seuil}=${e.sousType === "paralleles" ? e.d : e.seuil}\\text{ (confirmé)}`;
  if (phase.endsWith("Ecran3")) return [configConfirmee, seuilConfirme];
  if (phase.endsWith("Ecran4")) return [configConfirmee, seuilConfirme, `\\text{régime confirmé : }${e.regime}`];
  return null;
}
export function champsE(e: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  if (phase.endsWith("Ecran1")) return [champChoix("Configuration =", OPTIONS_CONFIG_E), champChoix("Stratégie =", OPTIONS_STRATEGIE_E)];
  if (e.sousType === "paralleles") {
    if (phase === "eParallelesEcran2") return [champTexte("Seuil (distance entre les 2 droites) =", "ex : 4")];
    if (phase === "eParallelesEcran3") return [champChoix("Régime =", OPTIONS_REGIME_3(["vide", "bandePleine", "pairDeDroites"]))];
    if (e.regime === "bandePleine") return [champTexte("Borne gauche de la bande : x =", "ex : 0"), champTexte("Borne droite de la bande : x =", "ex : 4")];
    return [champTexte("Nouvelle droite gauche : x =", "ex : -1"), champTexte("Nouvelle droite droite : x =", "ex : 5")];
  }
  if (e.sousType === "perpendiculaires") return [champNature("Nature du lieu ="), champTexte("Sommet sur l'axe positif (k;0) : k =", "ex : 5")];
  if (e.sousType === "secantes") return [champNature("Nature du lieu ="), champTexte("Sommet sur a (y=0) : x =", "ex : 10"), champTexte("Sommet sur b : x =", "ex : 8"), champTexte("Sommet sur b : y =", "ex : 6")];
  // carre
  if (phase === "eCarreEcran2") return [champTexte("Seuil (=4×demi-côté) =", "ex : 8")];
  if (phase === "eCarreEcran3") return [champChoix("Régime =", OPTIONS_REGIME_3(["vide", "bandePleine", "formeEtendue"]))];
  if (e.regime === "bandePleine") return [champTexte("Côté du carré (2c) =", "ex : 4")];
  return [champTexte("Coordonnée des sommets de l'octogone (m) =", "ex : 4")];
}
export function niveauAideMaxE(e: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres): number {
  if (phase.endsWith("Ecran1")) return 2;
  if (phase.endsWith("Ecran2") && (e.sousType === "paralleles" || e.sousType === "carre")) return 2;
  return 0;
}
export function aideNiveau1E(phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  if (phase.endsWith("Ecran1")) return { texte: "Seules les configurations où les 2 références sont OPPOSÉES avec un écart minimal incompressible (parallèles, côtés opposés d'un carré) exigent un raisonnement par seuil ; les configurations CONCOURANTES (perpendiculaires, sécantes) donnent toujours une forme bien définie, quel que soit k>0.", latex: null };
  return { texte: "Le seuil correspond à la valeur MINIMALE géométriquement atteignable de la somme (distance entre les 2 droites parallèles, ou côté du carré).", latex: null };
}
export function aideNiveau2E(e: ExerciceLieuxE, phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  if (phase.endsWith("Ecran1")) return { texte: `Configuration reconnue (${LABEL_CONFIG_E[e.sousType]}) — la stratégie précise reste à choisir.`, latex: null };
  if (e.sousType === "paralleles") return { texte: "Élément géométrique pertinent identifié (la distance entre les 2 droites), valeur du seuil non encore calculée.", latex: null };
  if (e.sousType === "carre") return { texte: "Élément géométrique pertinent identifié (le côté du carré), valeur du seuil non encore calculée.", latex: null };
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLieuxGeometriquesParametres): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
  }
}

export function blocDonnees(exercice: ExerciceLieuxGeometriquesParametres): string[] {
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

export function consigneEcran(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(exercice, phase);
    case "E":
      return champsE(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(exercice, phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(exercice, phase);
  }
}

export function aideNiveau1(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau1A();
    case "B":
      return niveauAideMaxB(exercice, phase) === 0 ? AUCUNE_AIDE : aideNiveau1B(phase);
    case "C":
      return niveauAideMaxC(phase) === 0 ? AUCUNE_AIDE : aideNiveau1C();
    case "D":
      return niveauAideMaxD(phase) === 0 ? AUCUNE_AIDE : aideNiveau1D();
    case "E":
      return niveauAideMaxE(exercice, phase) === 0 ? AUCUNE_AIDE : aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau2A(exercice);
    case "B":
      return niveauAideMaxB(exercice, phase) === 0 ? AUCUNE_AIDE : aideNiveau2B(exercice, phase);
    case "C":
      return niveauAideMaxC(phase) === 0 ? AUCUNE_AIDE : aideNiveau2C(exercice);
    case "D":
      return niveauAideMaxD(phase) === 0 ? AUCUNE_AIDE : aideNiveau2D(exercice);
    case "E":
      return niveauAideMaxE(exercice, phase) === 0 ? AUCUNE_AIDE : aideNiveau2E(exercice, phase);
  }
}

export const LIBELLE_FAMILLE: Record<FamilleLieuxGeometriquesParametres, string> = {
  A: "A — Valeurs absolues",
  B: "B — Distance au carré, avec seuils",
  C: "C — Cercle depuis une équation quadratique",
  D: "D — Éliminer un paramètre",
  E: "E — Seuil, somme de distances simples",
};

const LIBELLE_ECRAN: Record<string, string> = {
  Ecran1: "Étape 1",
  Ecran2: "Étape 2",
  Ecran3: "Étape 3",
  Ecran4: "Étape 4",
};

export function libellePhase(phase: PhaseLieuxGeometriquesParametres): string {
  const suffixe = (["Ecran1", "Ecran2", "Ecran3", "Ecran4"] as const).find((s) => phase.endsWith(s)) ?? "Ecran1";
  return LIBELLE_ECRAN[suffixe];
}

function texte(s: string): string {
  return `\\text{${s}}`;
}

/** Libellés COURTS dédiés au récapitulatif final (jamais les libellés de bouton complets et
 * descriptifs, gardés tels quels pour l'écran interactif — `OPTIONS_NATURE`/`OPTIONS_OUI_NON`/…
 * ci-dessus) : un `\text{...}` KaTeX ne s'enroule JAMAIS sur plusieurs lignes, contrairement au
 * texte HTML normal d'un bouton — trouvé par vérification Playwright (`E_secantes`/`E_carre`,
 * texte tronqué visible sur le récapitulatif malgré `document.body.scrollWidth<=innerWidth` —
 * débordement interne au conteneur `.equation-box-termes`, jamais capturé par ce seul check
 * page-level, même piège que `LABEL_CONFIG_B`/`_E` déjà rencontré et corrigé plus haut). */
const NATURE_COURT: Record<TypeStatutLieu, string> = {
  vide: "∅",
  point: "Point",
  droite: "Droite",
  pairDeDroites: "Paire de droites",
  cercle: "Cercle",
  bandePleine: "Région pleine",
  formeEtendue: "Forme étendue",
};
function natureTexte(tag: TypeStatutLieu): string {
  return texte(NATURE_COURT[tag]);
}
function ouiNonTexte(valeur: "oui" | "non"): string {
  return texte(valeur === "oui" ? "Oui" : "Non");
}
function k1Texte(valeur: "k1" | "kAutre"): string {
  return valeur === "k1" ? "\\text{k=1 (médiatrice)}" : "\\text{k}\\neq\\text{1 (cercle)}";
}
const METHODE_D_COURT: Record<ExerciceLieuxD["sousType"], string> = {
  substitution: "Substitution",
  fractions: "Fractions",
  ratio: "Ratio",
};
function methodeDTexte(sousType: ExerciceLieuxD["sousType"]): string {
  return texte(METHODE_D_COURT[sousType]);
}
const CONFIG_E_COURT: Record<ExerciceLieuxE["sousType"], string> = {
  paralleles: "Parallèles",
  perpendiculaires: "Perpendiculaires",
  secantes: "Sécantes non ⊥",
  carre: "Carré",
};
function configETexte(sousType: ExerciceLieuxE["sousType"]): string {
  return texte(CONFIG_E_COURT[sousType]);
}
function strategieETexte(valeur: "seuil" | "direct"): string {
  return texte(valeur === "seuil" ? "Seuil nécessaire" : "Forme directe");
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. Ordre EXACTEMENT celui des champs (`champsEcran`) et des
 * valeurs attendues par `moteur6e/verificationLieuxGeometriquesParametres.ts` pour cette phase —
 * écrit indépendamment (même convention que `formatReponseAttenduePhaseLatex` de 6gen43). Les
 * réponses `choix` affichent le LIBELLE complet du bouton choisi (jamais l'identifiant technique
 * brut type "cercle"/"non") — toujours entouré de `\text{...}` (jamais de texte français brut en
 * mode maths KaTeX, CLAUDE.md). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLieuxGeometriquesParametres, phase: PhaseLieuxGeometriquesParametres): string[] {
  if (exercice.famille === "A") {
    if (phase.endsWith("Ecran1")) return [`${exercice.sousType === "paralleles" ? 2 : 4}`];
    if (phase.endsWith("Ecran2")) return exercice.sousType === "paralleles" ? [`${exercice.constante1}`, `${exercice.constante2}`] : exercice.cas.map((c) => `${c.c}`);
    return exercice.sousType === "losange" ? exercice.sommets.flatMap((s) => [`${s.x}`, `${s.y}`]) : [];
  }
  if (exercice.famille === "B") {
    if (phase.endsWith("Ecran1")) {
      switch (exercice.sousType) {
        case "bissectrices":
          return ["2"];
        case "droite":
          return ["1", "1"];
        case "cerclePerp":
          return [`${exercice.constanteEcran1}`];
        case "seuil2Points":
          return [`${exercice.constanteA}`, `${exercice.constanteB}`];
        case "apollonius":
          return [`${exercice.ecran1Val1}`, `${exercice.ecran1Val2}`];
        case "seuilCarre":
          return [`${exercice.constanteEcran1}`];
      }
    }
    if (phase.endsWith("Ecran2")) {
      switch (exercice.sousType) {
        case "bissectrices":
          return [`${exercice.xBis}`, `${exercice.yBis}`];
        case "droite":
          return [`${exercice.A}`, `${exercice.B}`, `${exercice.C}`];
        case "cerclePerp":
        case "seuil2Points":
          return [`${exercice.D}`, `${exercice.E}`, `${exercice.F}`];
        case "apollonius":
          return exercice.casK1 ? [`${exercice.ecran2CoefX}`] : [`${exercice.ecran2CoefX}`, `${exercice.ecran2Constante}`];
        case "seuilCarre":
          return [`${exercice.rhsEcran2}`];
      }
    }
    if (phase.endsWith("Ecran3")) {
      switch (exercice.sousType) {
        case "bissectrices":
        case "droite":
        case "cerclePerp":
          return [ouiNonTexte("non")];
        case "seuil2Points":
          return [`${exercice.seuil}`, natureTexte(exercice.regime)];
        case "apollonius":
          return [k1Texte(exercice.casK1 ? "k1" : "kAutre")];
        case "seuilCarre":
          return [`${exercice.seuil}`, natureTexte(exercice.regime)];
      }
    }
    // écran4
    switch (exercice.sousType) {
      case "bissectrices":
        return [natureTexte("pairDeDroites"), `${exercice.xBis}`, `${exercice.yBis}`];
      case "droite":
        return [natureTexte("droite"), `${exercice.A}`, `${exercice.B}`, `${exercice.C}`];
      case "cerclePerp":
        return [natureTexte("cercle"), `${exercice.x0}`, `${exercice.y0}`, `${exercice.r}`];
      case "seuil2Points": {
        const mx = (exercice.xa + exercice.xb) / 2;
        const my = (exercice.ya + exercice.yb) / 2;
        if (exercice.regime === "vide") return [natureTexte("vide")];
        if (exercice.regime === "point") return [natureTexte("point"), `${mx}`, `${my}`];
        return [natureTexte("cercle"), `${mx}`, `${my}`, `${exercice.rayon}`];
      }
      case "apollonius":
        return exercice.casK1 ? [natureTexte("droite"), "0"] : [natureTexte("cercle"), `${exercice.x0}`, "0", `${exercice.r}`];
      case "seuilCarre":
        if (exercice.regime === "vide") return [natureTexte("vide")];
        if (exercice.regime === "point") return [natureTexte("point"), "0", "0"];
        return [natureTexte("cercle"), "0", "0", `${exercice.rayon}`];
    }
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`${exercice.h}`, `${exercice.kPrime}`, `${exercice.R}`];
    return [`${exercice.cx}`, `${exercice.cy}`, `${exercice.r}`];
  }
  if (exercice.famille === "D") {
    if (phase.endsWith("Ecran1")) return [methodeDTexte(exercice.sousType)];
    if (exercice.sousType === "substitution") return phase === "dSubstitutionEcran2" ? [`${exercice.coefX}`, `${exercice.coefConst}`] : [`${exercice.Afinal}`, `${exercice.Bfinal}`, `${exercice.Cfinal}`];
    if (exercice.sousType === "fractions") return phase === "dFractionsEcran2" ? [`${exercice.pente}`] : [`${exercice.pente}`, "1"];
    return phase === "dRatioEcran2" ? [`${exercice.exposantX}`, `${exercice.exposantY}`] : [`${exercice.C.num}/${exercice.C.den}`];
  }
  // famille E
  if (phase.endsWith("Ecran1")) {
    const strategie = exercice.sousType === "paralleles" || exercice.sousType === "carre" ? "seuil" : "direct";
    return [configETexte(exercice.sousType), strategieETexte(strategie)];
  }
  if (exercice.sousType === "paralleles") {
    if (phase === "eParallelesEcran2") return [`${exercice.d}`];
    if (phase === "eParallelesEcran3") return [natureTexte(exercice.regime)];
    return exercice.regime === "bandePleine" ? ["0", `${exercice.d}`] : [`${exercice.xGauche}`, `${exercice.xDroite}`];
  }
  if (exercice.sousType === "perpendiculaires") return [natureTexte("formeEtendue"), `${exercice.k}`];
  if (exercice.sousType === "secantes") return [natureTexte("formeEtendue"), `${exercice.sommets[0].x}`, `${exercice.sommets[2].x}`, `${exercice.sommets[2].y}`];
  // carre
  if (phase === "eCarreEcran2") return [`${exercice.seuil}`];
  if (phase === "eCarreEcran3") return [natureTexte(exercice.regime)];
  return exercice.regime === "bandePleine" ? [`${2 * exercice.c}`] : [`${exercice.m}`];
}

export function calculerTotalPointsLieuxGeometriquesParametres(resultat: ResultatExerciceLieuxGeometriquesParametres): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
