import type { ExerciceAireA, ExerciceAireB, ExerciceAireC, ExerciceAireD, ExerciceAireD_Parametre, ExerciceCalculAires, SigneFonction } from "../core6e/calculAires.types";
import type { TermeA } from "../core6e/calculPrimitives.types";
import type { PhaseCalculAires, ResultatExerciceCalculAires } from "../moteur6e/typesCalculAires";
import { phasesPourExercice } from "../moteur6e/typesCalculAires";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen26`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et `sousType` où pertinent), mirroir `formatCalculPrimitives.ts`
 * (6gen23), jamais importé (ui↔ui n'a pas de contrainte, mais chaque générateur reste indépendant
 * par convention de ce chantier — CLAUDE.md).
 *
 * **Vigilance signe orphelin (point 11 des clarifications de la spec, bug déjà rencontré et corrigé
 * sur 6gen23)** : UNE SEULE fonction assemble un terme signé complet (`termePolyLatex` ci-dessous) —
 * jamais un helper "signe seul" utilisé nu ailleurs dans ce fichier. Testé par une régression
 * dédiée dès le premier jet (`formatCalculAires.test.ts`, "aucun signe/groupe vide dans le LaTeX
 * généré").
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

// ============================================================================
// Petits formateurs numériques/polynomiaux partagés.
// ============================================================================

/** Terme signé COMPLET (signe + magnitude), jamais le signe seul (voir en-tête de fichier). */
function termePolyLatex(t: TermeA, premier: boolean): string {
  const abs = Math.abs(t.coef);
  const s = t.coef < 0 ? (premier ? "-" : " - ") : premier ? "" : " + ";
  if (t.type === "constante") return `${s}${abs}`;
  if (t.type === "puissance") {
    const corps = t.n === 1 ? "x" : `x^{${t.n}}`;
    return `${s}${abs === 1 ? "" : abs}${corps}`;
  }
  // Famille A uniquement (terme unique, jamais mélangé à un polynôme) : expX/invX/cosX.
  switch (t.type) {
    case "expX":
      return `${s}${abs === 1 ? "" : abs}e^x`;
    case "invX":
      return `${s}${abs === 1 ? "" : abs}\\dfrac{1}{x}`;
    case "cosX":
      return `${s}${abs === 1 ? "" : abs}\\cos(x)`;
    default:
      return `${s}${abs}`;
  }
}

/** Somme de `TermeA` en LaTeX — `"0"` si vide (jamais une chaîne vide, qui produirait un groupe
 * KaTeX vide). */
export function polynomeLatex(termes: TermeA[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termePolyLatex(t, i === 0)).join("");
}

/** Arrondi à 3 décimales pour affichage (récapitulatif/aide) — jamais utilisé pour la vérification
 * (qui reste exacte, tolérance `moteur6e/`). */
function valeurArrondie(x: number): number {
  return Math.round(x * 1000) / 1000;
}

/** Valeur numérique approchée en LaTeX, toujours préfixée `\approx` : plusieurs familles
 * produisent des valeurs transcendantes (exponentielle/famille A) qu'aucune fraction ne représente
 * exactement. */
export function nombreLatex(x: number): string {
  return `\\approx ${valeurArrondie(x)}`;
}

const LABEL_SIGNE: Record<SigneFonction, string> = { positif: "f(x) \\geq 0", negatif: "f(x) \\leq 0" };

function signeLatex(s: SigneFonction): string {
  return LABEL_SIGNE[s];
}

const OPTIONS_SIGNE: OptionChoix[] = [
  { valeur: "positif", label: "f(x) ≥ 0" },
  { valeur: "negatif", label: "f(x) ≤ 0" },
];

const OPTIONS_ORDRE: OptionChoix[] = [
  { valeur: "fSurG", label: "f(x) ≥ g(x)" },
  { valeur: "gSurF", label: "g(x) ≥ f(x)" },
];

// ============================================================================
// Famille A — Aire courbe/axe, bornes données, signe constant.
// ============================================================================

function fLatexA(exercice: ExerciceAireA): string {
  return polynomeLatex([exercice.terme]);
}

export function consigneGeneraleA(): string {
  return "On considère la fonction f définie ci-dessous sur l'intervalle [a;b]. On veut calculer l'aire du domaine délimité par la courbe de f et l'axe des abscisses sur cet intervalle.";
}
export function blocDonneesA(exercice: ExerciceAireA): string[] {
  return [`f(x)=${fLatexA(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseCalculAires): string {
  if (phase === "aEcran1") return "Détermine le signe de f(x) sur l'intervalle [a;b].";
  return "Calcule l'aire du domaine délimité par la courbe de f et l'axe des abscisses sur [a;b], à partir du signe confirmé à l'étape précédente.";
}
export function etatActuelA(exercice: ExerciceAireA, phase: PhaseCalculAires): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`\\text{Signe confirmé : }${signeLatex(exercice.signe)}`];
}
export function champsA(phase: PhaseCalculAires): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "choix", label: "Signe de f sur [a;b] :", options: OPTIONS_SIGNE }];
  return [{ type: "texte", label: "Aire =", placeholder: "ex : 3 ou e^2-1" }];
}
export function niveauAideMaxA(): number {
  return 0;
}
export function aideNiveau1A(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2A(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Aire courbe/axe, bornes à trouver, signe constant.
// ============================================================================

export function consigneGeneraleB(): string {
  return "On considère la fonction f définie ci-dessous. On veut calculer l'aire du domaine délimité par sa courbe et l'axe des abscisses.";
}
export function blocDonneesB(exercice: ExerciceAireB): string[] {
  return [`f(x)=${polynomeLatex(exercice.termes)}`];
}
export function consigneEcranB(phase: PhaseCalculAires): string {
  if (phase === "bEcran1") return "Trouve les racines de f — ce sont les bornes de la région d'aire (aucune borne n'est donnée dans l'énoncé).";
  if (phase === "bEcran2") return "Confirme le signe de f entre les racines trouvées à l'étape précédente.";
  return "Calcule l'aire délimitée par la courbe de f et l'axe des abscisses entre ces racines, à partir du signe confirmé.";
}
export function etatActuelB(exercice: ExerciceAireB, phase: PhaseCalculAires): string[] | null {
  if (phase === "bEcran2") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
  if (phase === "bEcran3") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`, `\\text{Signe confirmé : }${signeLatex(exercice.signe)}`];
  return null;
}
export function champsB(phase: PhaseCalculAires): ChampDef[] {
  if (phase === "bEcran2") return [{ type: "choix", label: "Signe de f entre les racines :", options: OPTIONS_SIGNE }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Aire =", placeholder: "ex : 4" }];
  return []; // bEcran1 : géré par le composant add-as-needed dédié, jamais par champsEcran.
}
export function niveauAideMaxB(phase: PhaseCalculAires): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Les bornes d'une aire « entre une courbe et l'axe » sans bornes explicites sont les points où la courbe coupe l'axe des abscisses — les racines de f.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceAireB, phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Équation à résoudre :", latex: `${polynomeLatex(exercice.termes)}=0` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Signe changeant, découper et sommer (piège central).
// ============================================================================

function integralesSousIntervallesC(exercice: ExerciceAireC): { iGauche: number; iDroit: number } {
  return {
    iGauche: exercice.primitiveReference(exercice.r2) - exercice.primitiveReference(exercice.r1),
    iDroit: exercice.primitiveReference(exercice.r3) - exercice.primitiveReference(exercice.r2),
  };
}

export function consigneGeneraleC(): string {
  return "On considère la fonction f définie ci-dessous, dont le signe change sur l'intervalle étudié. On veut calculer l'aire TOTALE du domaine délimité par sa courbe et l'axe des abscisses.";
}
export function blocDonneesC(exercice: ExerciceAireC): string[] {
  return [`f(x)=${polynomeLatex(exercice.termes)}`];
}
export function consigneEcranC(phase: PhaseCalculAires): string {
  if (phase === "cEcran1") return "Trouve TOUTES les racines de f dans l'intervalle étudié (il y en a 3).";
  if (phase === "cEcran2") return "Détermine le signe de f sur chacun des deux sous-intervalles délimités par ces racines.";
  if (phase === "cEcran3") return "Calcule l'intégrale de f sur CHAQUE sous-intervalle séparément (une valeur positive, une négative).";
  return "Calcule l'aire TOTALE du domaine — attention, une aire est toujours positive.";
}
export function etatActuelC(exercice: ExerciceAireC, phase: PhaseCalculAires): string[] | null {
  const bornes = `r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}\\text{, }r_3=${exercice.r3}`;
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") lignes.push(bornes);
  if (phase === "cEcran3" || phase === "cEcran4") {
    lignes.push(`\\text{Signe sur }]${exercice.r1};${exercice.r2}[\\text{ : }${signeLatex(exercice.signeGauche)}`, `\\text{Signe sur }]${exercice.r2};${exercice.r3}[\\text{ : }${signeLatex(exercice.signeDroit)}`);
  }
  if (phase === "cEcran4") {
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    lignes.push(`I_1${nombreLatex(iGauche)}`, `I_2${nombreLatex(iDroit)}`);
  }
  return lignes.length > 0 ? lignes : null;
}
export function champsC(exercice: ExerciceAireC, phase: PhaseCalculAires): ChampDef[] {
  if (phase === "cEcran2") {
    return [
      { type: "choix", label: `Signe de f sur ]${exercice.r1};${exercice.r2}[ :`, options: OPTIONS_SIGNE },
      { type: "choix", label: `Signe de f sur ]${exercice.r2};${exercice.r3}[ :`, options: OPTIONS_SIGNE },
    ];
  }
  if (phase === "cEcran3") {
    return [
      { type: "texte", label: `Intégrale sur ]${exercice.r1};${exercice.r2}[ =`, placeholder: "ex : 2" },
      { type: "texte", label: `Intégrale sur ]${exercice.r2};${exercice.r3}[ =`, placeholder: "ex : -3" },
    ];
  }
  if (phase === "cEcran4") return [{ type: "texte", label: "Aire totale =", placeholder: "ex : 5" }];
  return []; // cEcran1 : composant add-as-needed dédié.
}
export function niveauAideMaxC(phase: PhaseCalculAires): number {
  return phase === "cEcran4" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "cEcran4") return { texte: "Une aire est toujours positive : chaque morceau où f est négative doit être compté en valeur absolue — jamais additionné tel quel à un morceau positif.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(exercice: ExerciceAireC, phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "cEcran4") {
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    return { texte: "Les 2 valeurs trouvées à l'étape précédente, AVEC leur signe :", latex: `I_1${nombreLatex(iGauche)}\\text{, }I_2${nombreLatex(iDroit)}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Aire entre deux courbes, avec variante paramètre.
// ============================================================================

function fLatexD(exercice: ExerciceAireD): string {
  if (exercice.sousType === "parametre") return "x^2";
  return polynomeLatex(exercice.termesF);
}
function gLatexD(exercice: ExerciceAireD): string {
  if (exercice.sousType === "parametre") return exercice.motif === "droiteParOrigine" ? "mx" : "m";
  return polynomeLatex(exercice.termesG);
}

export function consigneGeneraleD(exercice: ExerciceAireD): string {
  if (exercice.sousType === "parametre") return "On considère les 2 courbes ci-dessous, dépendant d'un paramètre m>0. On veut déterminer m pour que l'aire du domaine compris entre elles soit égale à la valeur visée.";
  return "On considère les 2 courbes f et g ci-dessous. On veut calculer l'aire du domaine compris entre elles.";
}

export function blocDonneesD(exercice: ExerciceAireD): string[] {
  if (exercice.sousType === "parametre") {
    const intervalle = exercice.motif === "droiteParOrigine" ? "[0\\text{ ; }m]" : "[-\\sqrt{m}\\text{ ; }\\sqrt{m}]";
    return [`f(x)=${fLatexD(exercice)}`, `g(x)=${gLatexD(exercice)}\\ (m>0)`, `\\text{Intervalle : }${intervalle}`, `\\text{Aire visée : }${nombreLatex(exercice.cible)}`];
  }
  const donnees = [`f(x)=${fLatexD(exercice)}`, `g(x)=${gLatexD(exercice)}`];
  if (exercice.sousType === "bornesDonnees") return [...donnees, `a=${exercice.r1}\\text{, }b=${exercice.r2}`];
  return donnees;
}

export function consigneEcranD(exercice: ExerciceAireD, phase: PhaseCalculAires): string {
  if (phase === "dEcran1") return "Trouve les points d'intersection de f et g — ce sont les bornes du domaine d'aire.";
  if (phase === "dEcran2") return "Détermine laquelle des 2 courbes est au-dessus de l'autre sur l'intervalle.";
  if (phase === "dEcran3") {
    if (exercice.sousType === "parametre") return "Calcule l'aire du domaine compris entre les 2 courbes, EN FONCTION de m, à partir de l'ordre confirmé.";
    return "Calcule l'aire du domaine compris entre les 2 courbes sur l'intervalle, à partir de l'ordre confirmé.";
  }
  return "Pose aire(m) = aire visée, à partir de l'expression trouvée à l'étape précédente, et résous pour m (m>0).";
}

/** Expression de aire(m) (famille D, sous-type "parametre") — factorisée pour être réutilisée à la
 * fois par `formatReponseAttenduePhaseLatex` (dEcran3) et `etatActuelD` (dEcran4, qui doit rappeler
 * cette expression déjà confirmée), jamais dupliquée littéralement à 2 endroits. */
function expressionAireParametreLatex(exercice: ExerciceAireD_Parametre): string {
  return exercice.motif === "droiteParOrigine" ? "\\dfrac{m^3}{6}" : "\\dfrac{4}{3}m^{3/2}";
}

export function etatActuelD(exercice: ExerciceAireD, phase: PhaseCalculAires): string[] | null {
  // "bornesATrouver" seulement : pour "bornesDonnees" les bornes sont déjà dans le bloc données
  // (jamais "trouvées" par l'élève) — les rappeler ici violerait "1er écran jamais d'état actuel"
  // (dEcran2 EST le 1er écran traversé pour "bornesDonnees"/"parametre", voir `phaseInitiale`).
  const lignes: string[] = [];
  const aBornesConfirmees = exercice.sousType === "bornesATrouver";
  if (aBornesConfirmees && (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4")) {
    lignes.push(`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`);
  }
  if (phase === "dEcran3" || phase === "dEcran4") {
    const ordreLatex = exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)";
    lignes.push(`\\text{Ordre confirmé : }${ordreLatex}`);
  }
  if (phase === "dEcran4" && exercice.sousType === "parametre") {
    lignes.push(`\\text{Aire}(m)=${expressionAireParametreLatex(exercice)}`, `\\text{Aire visée : }${nombreLatex(exercice.cible)}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsD(exercice: ExerciceAireD, phase: PhaseCalculAires): ChampDef[] {
  if (phase === "dEcran2") return [{ type: "choix", label: "Quelle courbe est au-dessus sur l'intervalle ?", options: OPTIONS_ORDRE }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Aire =", placeholder: exercice.sousType === "parametre" ? "ex : m^3/6" : "ex : 4" }];
  if (phase === "dEcran4") return [{ type: "texte", label: "m =", placeholder: "ex : 2" }];
  return []; // dEcran1 : composant add-as-needed dédié.
}

export function niveauAideMaxD(phase: PhaseCalculAires): number {
  return phase === "dEcran2" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseCalculAires): AideAvecLatex {
  if (phase === "dEcran2") return { texte: "Teste le signe de f(x)-g(x) en un point de l'intervalle : le signe indique quelle courbe est au-dessus.", latex: null };
  return AUCUNE_AIDE;
}
function valeurFMoinsGTestD(exercice: ExerciceAireD, testX: number): number {
  if (exercice.sousType !== "parametre") return exercice.fReference(testX) - exercice.gReference(testX);
  // f(x)=x^2 pour les 2 motifs paramètre — g dépend du motif (voir `gLatexD`).
  const g = exercice.motif === "droiteParOrigine" ? exercice.m * testX : exercice.m;
  return testX * testX - g;
}

export function aideNiveau2D(exercice: ExerciceAireD, phase: PhaseCalculAires): AideAvecLatex {
  if (phase !== "dEcran2") return AUCUNE_AIDE;
  const testX = exercice.sousType === "parametre" ? (exercice.motif === "droiteParOrigine" ? exercice.m / 2 : 0) : (exercice.r1 + exercice.r2) / 2;
  const valeur = valeurFMoinsGTestD(exercice, testX);
  return { texte: "Valeur de f(x)-g(x) en un point test x du domaine :", latex: `x=${valeurArrondie(testX)}\\text{, }f(x)-g(x)${nombreLatex(valeur)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceCalculAires): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD(exercice);
  }
}

export function blocDonnees(exercice: ExerciceCalculAires): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(exercice, phase);
  }
}

export function etatActuel(exercice: ExerciceCalculAires, phase: PhaseCalculAires): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceCalculAires, phase: PhaseCalculAires): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA();
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceCalculAires, phase: PhaseCalculAires): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceCalculAires, phase: PhaseCalculAires): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A();
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseCalculAires, string> = {
  aEcran1: "Étape 1 (signe)",
  aEcran2: "Étape 2 (aire)",
  bEcran1: "Étape 1 (racines)",
  bEcran2: "Étape 2 (signe)",
  bEcran3: "Étape 3 (aire)",
  cEcran1: "Étape 1 (racines)",
  cEcran2: "Étape 2 (signes)",
  cEcran3: "Étape 3 (intégrales par morceau)",
  cEcran4: "Étape 4 (aire totale)",
  dEcran1: "Étape 1 (bornes)",
  dEcran2: "Étape 2 (ordre)",
  dEcran3: "Étape 3 (aire)",
  dEcran4: "Étape 4 (résoudre m)",
};

export const LIBELLE_FAMILLE: Record<ExerciceCalculAires["famille"], string> = {
  A: "A — Aire courbe/axe (signe constant)",
  B: "B — Aire courbe/axe (bornes à trouver)",
  C: "C — Signe changeant (découper et sommer)",
  D: "D — Aire entre deux courbes",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceCalculAires, phase: PhaseCalculAires): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [signeLatex(exercice.signe)];
    const aire = Math.abs(exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a));
    return [`\\text{Aire}${nombreLatex(aire)}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
    if (phase === "bEcran2") return [signeLatex(exercice.signe)];
    const aire = Math.abs(exercice.primitiveReference(exercice.r2) - exercice.primitiveReference(exercice.r1));
    return [`\\text{Aire}${nombreLatex(aire)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}\\text{, }r_3=${exercice.r3}`];
    if (phase === "cEcran2") return [`${signeLatex(exercice.signeGauche)}\\text{, }${signeLatex(exercice.signeDroit)}`];
    const { iGauche, iDroit } = integralesSousIntervallesC(exercice);
    if (phase === "cEcran3") return [`I_1${nombreLatex(iGauche)}\\text{, }I_2${nombreLatex(iDroit)}`];
    return [`\\text{Aire totale}${nombreLatex(Math.abs(iGauche) + Math.abs(iDroit))}`];
  }
  // Famille D.
  if (phase === "dEcran1" && exercice.sousType !== "parametre") return [`r_1=${exercice.r1}\\text{, }r_2=${exercice.r2}`];
  if (phase === "dEcran2") return [exercice.ordre === "fSurG" ? "f(x)\\geq g(x)" : "g(x)\\geq f(x)"];
  if (phase === "dEcran3") {
    if (exercice.sousType === "parametre") {
      return [`\\text{Aire}(m)=${expressionAireParametreLatex(exercice)}`];
    }
    const aire = Math.abs(exercice.primitiveHReference(exercice.r2) - exercice.primitiveHReference(exercice.r1));
    return [`\\text{Aire}${nombreLatex(aire)}`];
  }
  if (exercice.sousType === "parametre") return [`m=${exercice.m}`];
  return [`\\text{${LIBELLE_PHASE[phase]}}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsCalculAires(resultat: ResultatExerciceCalculAires): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
