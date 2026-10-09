import type { ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../core6e/formuleMoivre.types";
import type { PhaseFormuleMoivre, ResultatExerciceFormuleMoivre } from "../moteur6e/typesFormuleMoivre";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen38` ("Formule de Moivre :
 * développer cos(nx) et sin(nx)"). Dispatch sur `phase` uniquement (UNE seule famille, contrairement
 * à `formatNombresComplexes.ts`) — jamais importé par un autre générateur (indépendance CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/
 * 6gen26/6gen34, documenté par CLAUDE.md) — PARTICULIÈREMENT pertinent ICI : le développement
 * binomial affiche jusqu'à 7 termes (n=6) à signes ALTERNÉS dès que la partie réelle/imaginaire est
 * assemblée (écran 2/3, une fois i^k résolu en ±1/±i). `sommeSigneeLatex`/`termeSigneLatex`
 * ci-dessous sont les DEUX SEULES fonctions qui assemblent une somme de termes signés — assemblent
 * TOUJOURS signe+magnitude ENSEMBLE (jamais un signe bare, jamais deux signes adjacents type "+-"),
 * jamais appelées en dehors de ce module. `combinerFacteurs` (produit de facteurs, pas une somme)
 * ne peut structurellement jamais produire un groupe vide (repli sur "1" si tous les facteurs sont
 * l'unité). Testé explicitement (`formatFormuleMoivre.test.ts`, scan de motifs interdits sur les 4
 * valeurs de n, les 3 écrans, le bloc données ET le récapitulatif final).
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

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Formatage LaTeX — facteurs élémentaires (jamais de groupe vide, voir en-tête de fichier).
// ============================================================================

function coefLatex(coef: number): string {
  return coef === 1 ? "" : `${coef}`;
}

function cosPuissanceLatex(p: number): string {
  if (p === 0) return "";
  if (p === 1) return "\\cos(x)";
  return `\\cos^{${p}}(x)`;
}

function sinPuissanceLatex(p: number): string {
  if (p === 0) return "";
  if (p === 1) return "\\sin(x)";
  return `\\sin^{${p}}(x)`;
}

function facteurISinLatex(k: number): string {
  if (k === 0) return "";
  if (k === 1) return "(i\\sin(x))";
  return `(i\\sin(x))^{${k}}`;
}

/** Concatène des FACTEURS (produit, jamais une somme) — repli sur "1" si tous vides, jamais une
 * chaîne vide (voir en-tête de fichier). */
function combinerFacteurs(...facteurs: string[]): string {
  const nonVides = facteurs.filter((f) => f !== "");
  return nonVides.length > 0 ? nonVides.join("") : "1";
}

/** Terme du développement, écran 1 : C(n,k)·cos^(n-k)(x)·(i·sin(x))^k — TOUJOURS non signé (le
 * binôme de Newton ne produit que des coefficients positifs ; le signe n'apparaît qu'une fois i^k
 * résolu, écran 2). Aucun risque de signe orphelin ici : simple somme de facteurs positifs, jointe
 * par "+". */
function termeEcran1Latex(t: TermeDeveloppementMoivre): string {
  return combinerFacteurs(coefLatex(t.coefBinomial), cosPuissanceLatex(t.puissanceCos), facteurISinLatex(t.k));
}

function developpementLatex(exercice: ExerciceFormuleMoivre): string {
  return exercice.termes.map(termeEcran1Latex).join("+");
}

/** Magnitude (jamais de signe) d'un terme RÉEL (k pair, i déjà résolu à ±1 — ne reste que le
 * coefficient réel et les puissances de cos/sin). */
function magnitudeReelleLatex(t: TermeDeveloppementMoivre): string {
  return combinerFacteurs(coefLatex(t.coefBinomial), cosPuissanceLatex(t.puissanceCos), sinPuissanceLatex(t.k));
}

/** Magnitude (jamais de signe) d'un terme IMAGINAIRE (k impair, i encore en facteur — retiré
 * seulement à l'écran 3). */
function magnitudeImaginaireLatex(t: TermeDeveloppementMoivre): string {
  return combinerFacteurs(coefLatex(t.coefBinomial), "i", cosPuissanceLatex(t.puissanceCos), sinPuissanceLatex(t.k));
}

/** UN terme signé "±magnitude" — jamais un signe seul (voir en-tête de fichier). */
function termeSigneLatex(signe: number, magnitude: string, premier: boolean): string {
  const signeTxt = signe >= 0 ? (premier ? "" : "+") : "-";
  return `${signeTxt}${magnitude}`;
}

/** Somme de termes signés — LA fonction d'assemblage pour toute liste réelle/imaginaire de ce
 * générateur (écrans 2 et 3). Signe+magnitude TOUJOURS ensemble (voir en-tête de fichier). */
function sommeSigneeLatex(termes: { signe: number; magnitude: string }[]): string {
  if (termes.length === 0) return "0";
  return termes.map((t, i) => termeSigneLatex(t.signe, t.magnitude, i === 0)).join("");
}

function termesReels(exercice: ExerciceFormuleMoivre): TermeDeveloppementMoivre[] {
  return exercice.termes.filter((t) => t.k % 2 === 0);
}
function termesImaginaires(exercice: ExerciceFormuleMoivre): TermeDeveloppementMoivre[] {
  return exercice.termes.filter((t) => t.k % 2 === 1);
}

function listeReelleLatex(exercice: ExerciceFormuleMoivre): string {
  return sommeSigneeLatex(termesReels(exercice).map((t) => ({ signe: t.reI, magnitude: magnitudeReelleLatex(t) })));
}
function listeImaginaireLatex(exercice: ExerciceFormuleMoivre): string {
  return sommeSigneeLatex(termesImaginaires(exercice).map((t) => ({ signe: t.imI, magnitude: magnitudeImaginaireLatex(t) })));
}
/** Même liste que `listeImaginaireLatex`, SANS le "i" (facteur déjà retiré) — c'est `sin(nx)`. */
function sinNxLatex(exercice: ExerciceFormuleMoivre): string {
  return sommeSigneeLatex(termesImaginaires(exercice).map((t) => ({ signe: t.imI, magnitude: magnitudeReelleLatex(t) })));
}
/** `cos(nx)` = exactement la liste réelle de l'écran 2 (déjà la bonne somme). */
function cosNxLatex(exercice: ExerciceFormuleMoivre): string {
  return listeReelleLatex(exercice);
}

// ============================================================================
// Consignes / données / état actuel.
// ============================================================================

export function consigneGenerale(exercice: ExerciceFormuleMoivre): string {
  return `Formule de Moivre : exprime cos(${exercice.n}x) et sin(${exercice.n}x) en fonction de cos(x) et sin(x), en développant (cos(x)+i·sin(x))^${exercice.n} par le binôme de Newton.`;
}

export function blocDonnees(exercice: ExerciceFormuleMoivre): string[] {
  return [`(\\cos(x)+i\\sin(x))^{${exercice.n}}=\\cos(${exercice.n}x)+i\\sin(${exercice.n}x)`];
}

export function consigneEcran(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): string {
  switch (phase) {
    case "ecran1":
      return `Développe (cos(x)+i·sin(x))^${exercice.n} via le binôme de Newton : liste chaque terme C(n,k)·cos^(n−k)(x)·(i·sin(x))^k pour k=0,...,${exercice.n}, SANS simplifier les puissances de i.`;
    case "ecran2":
      return "Simplifie chaque puissance de i présente dans les termes du développement CONFIRMÉ à l'étape précédente (cycle i⁰=1, i¹=i, i²=−1, i³=−i, périodique de période 4), puis sépare les termes d'indice k PAIR (réels) des termes d'indice k IMPAIR (imaginaires).";
    case "ecran3":
      return `Écris cos(${exercice.n}x) (somme des termes réels CONFIRMÉS) et sin(${exercice.n}x) (somme des termes imaginaires CONFIRMÉS, facteur i mis en évidence puis retiré).`;
  }
}

export function etatActuel(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): string[] | null {
  const developpementConfirme = `(\\cos(x)+i\\sin(x))^{${exercice.n}}=${developpementLatex(exercice)}`;
  switch (phase) {
    case "ecran1":
      return null;
    case "ecran2":
      return [developpementConfirme];
    case "ecran3":
      // Cumule le développement confirmé à l'écran 1 ET la séparation réels/imaginaires confirmée à
      // l'écran 2, du plus ancien au plus récent — jamais seulement l'écran immédiatement précédent
      // (audit transversal "état actuel cumulatif").
      return [developpementConfirme, `\\text{Réels}=${listeReelleLatex(exercice)}\\text{, }\\text{Imaginaires}=i\\left(${listeImaginaireReduiteLatex(exercice)}\\right)`];
  }
}

/** Même contenu que `listeImaginaireLatex`, mais SANS le "i" répété devant chaque terme (facteur mis
 * en évidence UNE fois via `i(...)`, voir `etatActuel` ecran3) — magnitude réelle, signe imaginaire. */
function listeImaginaireReduiteLatex(exercice: ExerciceFormuleMoivre): string {
  return sommeSigneeLatex(termesImaginaires(exercice).map((t) => ({ signe: t.imI, magnitude: magnitudeReelleLatex(t) })));
}

// ============================================================================
// Champs de saisie.
// ============================================================================

export function champsEcran(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): ChampDef[] {
  switch (phase) {
    case "ecran1":
      return [{ type: "texte", label: "Développement complet (non simplifié) =", placeholder: "ex : 6*cos(x)^4*(i*sin(x))^2 + ..." }];
    case "ecran2":
      return [
        { type: "texte", label: "Termes réels (k pair) =", placeholder: "ex : cos(x)^4-6*cos(x)^2*sin(x)^2+sin(x)^4" },
        { type: "texte", label: "Termes imaginaires (k impair), i inclus =", placeholder: "ex : 4i*cos(x)^3*sin(x)-4i*cos(x)*sin(x)^3" },
      ];
    case "ecran3":
      return [
        { type: "texte", label: `cos(${exercice.n}x) =`, placeholder: "ex : cos(x)^4-6*cos(x)^2*sin(x)^2+sin(x)^4" },
        { type: "texte", label: `sin(${exercice.n}x) =`, placeholder: "ex : 4*cos(x)^3*sin(x)-4*cos(x)*sin(x)^3" },
      ];
  }
}

// ============================================================================
// Aide progressive — max=0 sur écran1 (rien à simplifier, structure directe du binôme).
// ============================================================================

export function niveauAideMaxEcran(_exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): number {
  return phase === "ecran1" ? 0 : 2;
}

/** Décrit le signe résolu de i^k pour un terme donné — utilisé par l'aide niveau 2 de l'écran 2. */
function descriptionSigneTerme(t: TermeDeveloppementMoivre): string {
  if (t.k % 2 === 0) return `i^{${t.k}}=${t.reI === 1 ? "1" : "-1"}`;
  return `i^{${t.k}}=${t.imI === 1 ? "i" : "-i"}`;
}

export function aideNiveau1(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): AideAvecLatex {
  switch (phase) {
    case "ecran1":
      return AUCUNE_AIDE;
    case "ecran2":
      return {
        texte: "Le cycle des puissances de i est périodique de période 4 : i⁰=1, i¹=i, i²=−1, i³=−i, puis ça recommence (i⁴=1, i⁵=i, ...). Applique-le terme à terme, selon la valeur de k de CE terme précis — ne suppose jamais que 'i disparaît' globalement pour la partie imaginaire.",
        latex: null,
      };
    case "ecran3":
      return {
        texte: `cos(${exercice.n}x) est la PARTIE RÉELLE du développement confirmé à l'étape précédente (les termes sans i restant). sin(${exercice.n}x) est le COEFFICIENT de i dans la partie imaginaire (facteur i mis en évidence puis retiré) — jamais la partie imaginaire i comprise.`,
        latex: null,
      };
  }
}

export function aideNiveau2(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): AideAvecLatex {
  switch (phase) {
    case "ecran1":
      return AUCUNE_AIDE;
    case "ecran2": {
      const nbAffiches = Math.min(3, exercice.termes.length);
      const descriptions = exercice.termes.slice(0, nbAffiches).map(descriptionSigneTerme);
      return {
        texte: `Signes déjà déterminés pour les ${nbAffiches} premiers termes (k=0..${nbAffiches - 1}) — à toi de continuer pour les suivants :`,
        latex: descriptions.join("\\text{, }"),
      };
    }
    case "ecran3":
      return { texte: `cos(${exercice.n}x) déjà assemblé (partie réelle) — à toi d'assembler sin(${exercice.n}x) avec la même méthode (partie imaginaire, i retiré) :`, latex: `\\cos(${exercice.n}x)=${cosNxLatex(exercice)}` };
  }
}

// ============================================================================
// Libellés / récapitulatif.
// ============================================================================

export const LIBELLE_PHASE: Record<PhaseFormuleMoivre, string> = {
  ecran1: "Étape 1 (développement)",
  ecran2: "Étape 2 (réel / imaginaire)",
  ecran3: "Étape 3 (formules finales)",
};

export function libelleExercice(exercice: ExerciceFormuleMoivre): string {
  return `n=${exercice.n}`;
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève (mirroir `formatNombresComplexes.ts`). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): string[] {
  switch (phase) {
    case "ecran1":
      return [developpementLatex(exercice)];
    case "ecran2":
      return [`\\text{Réels}=${listeReelleLatex(exercice)}\\text{, }\\text{Imaginaires}=${listeImaginaireLatex(exercice)}`];
    case "ecran3":
      return [`\\cos(${exercice.n}x)=${cosNxLatex(exercice)}\\text{, }\\sin(${exercice.n}x)=${sinNxLatex(exercice)}`];
  }
}

/** Total points du récapitulatif final — maximum TOUJOURS 300 (3 écrans fixes, contrairement à
 * `calculerTotalPointsNombresComplexes` de 6gen34 dont le maximum varie par famille). */
export function calculerTotalPointsFormuleMoivre(resultat: ResultatExerciceFormuleMoivre): { total: number; maximum: number } {
  const phases: PhaseFormuleMoivre[] = ["ecran1", "ecran2", "ecran3"];
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
