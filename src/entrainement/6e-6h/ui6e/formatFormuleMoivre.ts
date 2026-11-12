import type { ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../core6e/formuleMoivre.types";
import type { PhaseFormuleMoivre } from "../moteur6e/typesFormuleMoivre";

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

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts`, rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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
/** Polynôme en cos(x) (coefficients par puissance croissante), puissances décroissantes. */
function polynomeCosLatex(coefs: number[]): string {
  const termes: { signe: number; magnitude: string }[] = [];
  for (let p = coefs.length - 1; p >= 0; p--) {
    const c = coefs[p];
    if (c === 0) continue;
    const abs = Math.abs(c);
    const magnitude = p === 0 ? `${abs}` : combinerFacteurs(coefLatex(abs), cosPuissanceLatex(p));
    termes.push({ signe: c > 0 ? 1 : -1, magnitude });
  }
  return sommeSigneeLatex(termes);
}

/** `cos(nx)` = exactement la liste réelle de l'écran 2 (déjà la bonne somme). */
function cosNxLatex(exercice: ExerciceFormuleMoivre): string {
  return listeReelleLatex(exercice);
}

// ============================================================================
// Consignes / données / état actuel.
// ============================================================================

export function consigneGenerale(exercice: ExerciceFormuleMoivre): FragmentConsigne[] {
  const developper = [texte(", en développant "), latex(`(\\cos(x)+i\\sin(x))^{${exercice.n}}`), texte(" par le binôme de Newton.")];
  if (exercice.cible === "standard") {
    return [texte("Formule de Moivre : exprime "), latex(`\\cos(${exercice.n}x)`), texte(" et "), latex(`\\sin(${exercice.n}x)`), texte(" en fonction de "), latex("\\cos(x)"), texte(" et "), latex("\\sin(x)"), ...developper];
  }
  return [texte("Formule de Moivre : exprime "), latex(cibleEcran3Latex(exercice)), texte(" en fonction de "), latex("\\cos(x)"), texte(" seulement"), ...developper];
}

/** Deux lignes (audit 6e ch. 5, point 35 : l'égalité sur une seule ligne était coupée à 390 px). */
export function blocDonnees(exercice: ExerciceFormuleMoivre): string[] {
  return [`(\\cos(x)+i\\sin(x))^{${exercice.n}}`, `=\\cos(${exercice.n}x)+i\\sin(${exercice.n}x)`];
}

/** Ce que l'écran 3 fait exprimer, en LaTeX. */
function cibleEcran3Latex(exercice: ExerciceFormuleMoivre): string {
  if (exercice.cible === "sinSurSin") return `\\frac{\\sin(${exercice.n}x)}{\\sin(x)}`;
  return `\\cos(${exercice.n}x)`;
}

export function consigneEcran(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  switch (phase) {
    case "ecran1":
      return [
        texte("Développe "),
        latex(`(\\cos(x)+i\\cdot\\sin(x))^{${exercice.n}}`),
        texte(" par le binôme de Newton : écris la somme des termes "),
        latex("C_n^k\\cos^{n-k}(x)\\,(i\\sin(x))^k"),
        texte(" pour "),
        latex(`k=0,\\ldots,${exercice.n}`),
        texte(", sans simplifier les puissances de i."),
      ];
    case "ecran2":
      return [
        texte("Simplifie chaque puissance de i dans le développement confirmé à l'étape précédente (cycle "),
        latex("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"),
        texte(", de période 4), puis sépare les termes d'indice k pair (réels) des termes d'indice k impair (imaginaires)."),
      ];
    case "ecran3":
      if (exercice.cible === "cosSeul") {
        return [texte("Écris "), latex(`\\cos(${exercice.n}x)`), texte(" (somme des termes réels confirmés) en fonction de "), latex("\\cos(x)"), texte(" seulement, grâce à "), latex("\\sin^2(x)=1-\\cos^2(x)"), texte(".")];
      }
      if (exercice.cible === "sinSurSin") {
        return [texte("À partir de "), latex(`\\sin(${exercice.n}x)`), texte(" (coefficient de i dans les termes imaginaires confirmés), écris "), latex(cibleEcran3Latex(exercice)), texte(" en fonction de "), latex("\\cos(x)"), texte(" seulement, grâce à "), latex("\\sin^2(x)=1-\\cos^2(x)"), texte(".")];
      }
      return [
        texte("Écris "),
        latex(`\\cos(${exercice.n}x)`),
        texte(" (somme des termes réels confirmés) et "),
        latex(`\\sin(${exercice.n}x)`),
        texte(" (somme des termes imaginaires confirmés, facteur i mis en évidence puis retiré)."),
      ];
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
      return [developpementConfirme, `\\text{réels : }${listeReelleLatex(exercice)}`, `\\text{imaginaires : }i\\left(${listeImaginaireReduiteLatex(exercice)}\\right)`];
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

/** Placeholders hors des tirages (audit 6e ch. 5, point 11) : exemples bâtis sur n = 7, jamais
 * tiré (n ∈ {3 ; 4 ; 5 ; 6}) — ni « * », ni point décimal, notation usuelle cos^k(x). */
export function champsEcran(exercice: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): ChampDef[] {
  switch (phase) {
    case "ecran1":
      return [{ type: "texte", label: "Développement complet (non simplifié) =", placeholder: "ex : 21cos^5(x)(i sin(x))^2 + …" }];
    case "ecran2":
      return [
        // Libellés courts : l'ancien « Termes imaginaires (k impair), i inclus = » débordait à 390 px.
        { type: "texte", label: "Termes réels (k pair) =", placeholder: "ex : cos^7(x) − 21cos^5(x)sin^2(x) + …" },
        { type: "texte", label: "Termes en i (k impair) =", placeholder: "ex : 7i cos^6(x)sin(x) − …" },
      ];
    case "ecran3":
      if (exercice.cible === "cosSeul") return [{ type: "texte", label: `cos(${exercice.n}x) =`, placeholder: "ex : 64cos^7(x) − 112cos^5(x) + …" }];
      if (exercice.cible === "sinSurSin") return [{ type: "texte", label: `sin(${exercice.n}x) / sin(x) =`, placeholder: "ex : 64cos^6(x) − 80cos^4(x) + …" }];
      return [
        { type: "texte", label: `cos(${exercice.n}x) =`, placeholder: "ex : cos^7(x) − 21cos^5(x)sin^2(x) + …" },
        { type: "texte", label: `sin(${exercice.n}x) =`, placeholder: "ex : 7cos^6(x)sin(x) − …" },
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
        texte: "Les puissances de i se répètent tous les 4 exposants ; applique ce cycle à chaque terme, selon son propre k :",
        latex: "i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i,\\ i^4=1,\\ \\ldots",
      };
    case "ecran3":
      if (exercice.cible !== "standard") {
        return { texte: "Remplace chaque puissance paire de sin(x) grâce à la relation ci-dessous, puis développe et regroupe :", latex: "\\sin^2(x)=1-\\cos^2(x)\\qquad\\sin^4(x)=\\left(1-\\cos^2(x)\\right)^2" };
      }
      return {
        texte: "Identifie les parties réelles et imaginaires des deux membres de la formule de Moivre :",
        latex: `\\cos(${exercice.n}x)=\\text{partie réelle}\\qquad\\sin(${exercice.n}x)=\\text{coefficient de } i`,
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
        texte: "Puissances de i déjà simplifiées pour les premiers termes — continue de même pour les suivants :",
        latex: descriptions.join("\\text{, }"),
      };
    }
    case "ecran3":
      if (exercice.cible === "cosSeul") return { texte: "Point de départ, à transformer :", latex: `\\cos(${exercice.n}x)=${cosNxLatex(exercice)}` };
      if (exercice.cible === "sinSurSin") return { texte: "Point de départ : mets sin(x) en évidence dans cette expression, puis transforme le reste :", latex: `\\sin(${exercice.n}x)=${sinNxLatex(exercice)}` };
      return { texte: "Partie réelle déjà assemblée — assemble de même la partie imaginaire (sans le facteur i) :", latex: `\\cos(${exercice.n}x)=${cosNxLatex(exercice)}` };
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
      return [`\\text{réels : }${listeReelleLatex(exercice)}`, `\\text{imaginaires : }${listeImaginaireLatex(exercice)}`];
    case "ecran3":
      if (exercice.cible !== "standard") return [`${cibleEcran3Latex(exercice)}=${polynomeCosLatex(exercice.polynomeCos)}`];
      return [`\\cos(${exercice.n}x)=${cosNxLatex(exercice)}`, `\\sin(${exercice.n}x)=${sinNxLatex(exercice)}`];
  }
}

