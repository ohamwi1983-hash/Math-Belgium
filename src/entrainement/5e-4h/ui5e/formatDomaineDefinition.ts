import type { EnsembleReelGuide, ExerciceDomaineDefinition, GrilleQuotientDomf, MorceauEnsemble, SlotCE, SymboleCE } from "../core5e/domaineDefinition.types";
import type { ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import { formatFractionIrreductible } from "../ui/formatFraction";

/** Une option de `<select>` — `texte` (plain text, seul affichable par un `<option>` HTML natif)
 * ET `latex` (conservé pour d'éventuels autres usages, ex. révélation/récapitulatif rendus en
 * KaTeX) — voir `components5e/EtapeCEDomaineDefinition.tsx`. */
export interface OptionPolynomeLatex {
  id: string;
  latex: string;
  texte: string;
}

/** Consigne générale redondante (point 1.1) — affichée sur chaque écran, quelle que soit la
 * question spécifique posée. */
export const CONSIGNE_GENERALE_DOMAINE_DEFINITION = "Détermine le domaine de définition de f.";

export const LIBELLE_ROLE_SLOT: Record<SlotCE["role"], string> = {
  denominateur: "dénominateur",
  radicande: "radicande",
};

/** Fraction irréductible en LaTeX réel (`\dfrac{p}{q}`), jamais un décimal brut — les bornes de
 * 5gen1 sont toujours des entiers par construction, mais celles de 5gen3 (composition de
 * fonctions) peuvent être des rationnels non entiers issus de la résolution du solveur
 * (`generateurs5e/composerFonctions/solveur.ts`) : réutilise `formatFractionIrreductible` (4e,
 * import cross-chantier déjà établi pour ce type de petite primitive pure — voir CLAUDE.md section
 * 5gen1) plutôt que `String(valeur)`, qui affichait un flottant brut illisible avant ce correctif
 * (bug trouvé par vérification Playwright de 5gen3). */
export function formatValeurLatex(valeur: number): string {
  const rendu = formatFractionIrreductible(valeur);
  if (rendu.includes("/")) {
    const [n, d] = rendu.split("/");
    // Signe SORTI de la fraction (audit 5e ch. 1, point 6) : « −\\dfrac{5}{3} », jamais
    // « \\dfrac{-5}{3} ».
    const negatif = n.startsWith("-");
    return `${negatif ? "-" : ""}\\dfrac{${negatif ? n.slice(1) : n}}{${d}}`;
  }
  // Aucune fraction "propre" trouvée (borne réellement irrationnelle — possible pour 5gen3, une
  // composition élevant au carré peut faire apparaître une racine non exacte) : repli sur une
  // valeur arrondie lisible plutôt que les 17 décimales brutes d'un flottant IEEE-754.
  return Number.isInteger(Number(rendu)) ? rendu : (Math.round(Number(rendu) * 10000) / 10000).toString();
}

function formatBorneLatex(valeur: number | null, infini: string): string {
  return valeur === null ? infini : formatValeurLatex(valeur);
}

function formatMorceauLatex(m: MorceauEnsemble): string {
  const gauche = m.infInclus ? "[" : "]";
  const droite = m.supInclus ? "]" : "[";
  return `${gauche}${formatBorneLatex(m.inf, "-\\infty")}\\,;\\,${formatBorneLatex(m.sup, "+\\infty")}${droite}`;
}

/** LaTeX d'un ensemble déjà complet — utilisé pour la révélation (panneau de résultat), jamais
 * pour l'aperçu en cours de saisie (l'élève construit via `EnsembleReelGuideBuilder`, jamais de
 * LaTeX libre à interpréter). */
export function formatEnsembleReelLatex(ensemble: EnsembleReelGuide): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") {
    return `\\mathbb{R} \\setminus \\{${ensemble.points.map(formatValeurLatex).join("\\,;\\,")}\\}`;
  }
  return ensemble.morceaux.map(formatMorceauLatex).join(" \\cup ");
}

/** « dom f = … » — `\\operatorname{dom}` (romain, espacé), jamais « domf » lu d·o·m·f en italique
 * (audit 5e ch. 1, point 8). Signature inchangée : aussi utilisée par 5gen3 et les feuilles. */
export const LATEX_DOM_F = "\\operatorname{dom}f";
export function formatDomfLatex(ensemble: EnsembleReelGuide): string {
  return `${LATEX_DOM_F} = ${formatEnsembleReelLatex(ensemble)}`;
}

/** Rendu "bloc fitter" — un fragment KaTeX par morceau (le symbole `\cup` porté par tous les
 * fragments sauf le dernier), pour un union à enrouler entre morceaux plutôt qu'un unique bloc
 * `\cup`-joined non-wrappable (KaTeX rend en `white-space: nowrap` interne à CHAQUE fragment — un
 * union à 3+ morceaux, courant pour un domaine composé de 5gen3, débordait sinon horizontalement,
 * même principe déjà établi ailleurs sur la plateforme, ex. l'expression télescopique de "Réduction
 * d'une somme de vecteurs"). `ensemble.morceaux.length <= 1`, `reel`, `prive_points` : un seul
 * fragment, rien à scinder. */
export function formatTermesEnsembleReelLatex(ensemble: EnsembleReelGuide): string[] {
  if (ensemble.forme !== "intervalles" || ensemble.morceaux.length <= 1) {
    return [formatEnsembleReelLatex(ensemble)];
  }
  return ensemble.morceaux.map((m, i) => formatMorceauLatex(m) + (i < ensemble.morceaux.length - 1 ? " \\cup" : ""));
}

// ============================================================================
// Écran 1 (CE) — combobox symbole (point 2, transversal), texte de la condition, aide.
// ============================================================================

const LATEX_SYMBOLE_CE: Record<SymboleCE, string> = { "≠": "\\neq 0", "≥": "\\geq 0", ">": "> 0" };

/** Options du `<select>` "type d'inégalité" (≠0/≥0/>0), distinct du `<select>` de choix de
 * polynôme (point 1.9) — transversal à toutes les familles (point 2, "les appliquer partout où
 * c'est pertinent"). */
export const OPTIONS_SYMBOLE_CE: OptionPolynomeLatex[] = [
  { id: "≠", latex: LATEX_SYMBOLE_CE["≠"], texte: "≠ 0" },
  { id: "≥", latex: LATEX_SYMBOLE_CE["≥"], texte: "≥ 0" },
  { id: ">", latex: LATEX_SYMBOLE_CE[">"], texte: "> 0" },
];

/** Exportée pour B.0.2 (promptcorrectionsregroupees.md) : recapituler UNE seule condition (pas les
 * 2 slots à la fois) sur l'écran de résolution d'UNE CE individuelle de "racineSurFraction"/
 * "racineSurD", voir `EtapeResolutionDomaineDefinition.tsx::ResolutionRacineSurFraction`. */
export function formatSlotConditionLatex(slot: SlotCE): string {
  return `${slot.latex} ${LATEX_SYMBOLE_CE[slot.symboleAttendu]}`;
}

function slotsExercice(exercice: ExerciceDomaineDefinition): SlotCE[] {
  return exercice.famille === "pasDeCE" ? [] : exercice.slots;
}

/** LaTeX de la CE correcte, EN UN SEUL fragment (jamais scindé) — utilisé quand une seule ligne
 * est en jeu (la quasi-totalité des familles) ou pour un simple `join` de secours. */
export function formatCEAttendueLatex(exercice: ExerciceDomaineDefinition): string {
  if (exercice.aucuneCE) return "\\text{Aucune CE}";
  return slotsExercice(exercice).map(formatSlotConditionLatex).join(" \\text{ et } ");
}

/** Une condition par fragment, en LaTeX PUR (aucune prose en mode math : le « et » qui les relie
 * est écrit en texte par l'appelant). Vide quand l'exercice n'a aucune CE. */
export function formatConditionsLatex(exercice: ExerciceDomaineDefinition): string[] {
  if (exercice.aucuneCE) return [];
  return slotsExercice(exercice).map(formatSlotConditionLatex);
}

/** Conditions TOUJOURS VRAIES d'un exercice « sans CE » qui a pourtant un dénominateur ou un
 * radicande (ex. « x²+2 ≠ 0 ») — acceptées comme réponse (décision A, audit 5e ch. 1). Vide pour
 * « pasDeCE » ou pour un exercice qui a de vraies CE. */
export function formatConditionsToujoursVraiesLatex(exercice: ExerciceDomaineDefinition): string[] {
  if (!exercice.aucuneCE) return [];
  return slotsExercice(exercice).map(formatSlotConditionLatex);
}

/**
 * Aide écran 1, EN PALIERS — un texte par niveau, révélé progressivement. Quand `aucuneCE`, un
 * texte GÉNÉRIQUE unique sert pour n'importe quelle famille (la raison structurelle exacte —
 * dénominateur toujours positif, discriminant négatif, N/D de même signe constant... — varie
 * d'une famille à l'autre, mais la conclusion pédagogique à retenir est toujours la même : rien à
 * exclure) — jamais de texte dédié par famille pour ce cas, non spécifié par la spec. `pasDeCE`
 * n'a JAMAIS d'aide (retourne toujours `[]`, spécifique à cette famille, point 4).
 */
const AIDE_REPERER = "Quelles opérations de f(x) ne sont pas possibles pour tous les réels ?";
const AIDE_DIVISION_RACINE = "Cherche une division (que doit vérifier le dénominateur ?) et une racine d'indice pair (que doit vérifier le radicande ?).";

/**
 * Aides de MÉTHODE (audit 5e ch. 1, point 2) : elles orientent vers les opérations à surveiller,
 * jamais vers le symbole à choisir ni vers la conclusion (« aucune CE »). Le nombre de paliers suit
 * `niveauAideMaxCE`. `pasDeCE` n'a jamais d'aide.
 */
export function texteAideCE(exercice: ExerciceDomaineDefinition): string[] {
  if (exercice.famille === "pasDeCE") return [];
  if (exercice.aucuneCE) {
    const verifier = "Repère l'expression qui pourrait poser problème, puis demande-toi si elle peut réellement prendre une valeur interdite pour un réel x.";
    return exercice.famille === "racineSurFraction" ? [AIDE_REPERER, verifier] : [verifier];
  }
  switch (exercice.famille) {
    case "rationnelle":
    case "racineImpaireDenominateur":
    case "irrationnelleSimple":
      return [AIDE_REPERER];
    case "fractionSousRacine":
      return [AIDE_REPERER, AIDE_DIVISION_RACINE];
    case "racineSurFraction":
      return exercice.structure === "nSurRacineD"
        ? [AIDE_REPERER, "Ici, la racine est elle-même au dénominateur : la même expression doit respecter deux contraintes à la fois."]
        : [AIDE_REPERER, AIDE_DIVISION_RACINE];
  }
}

// ============================================================================
// Bloc "état actuel" (point 1.2) — récapitule les valeurs déjà validées, dérivé PUREMENT de
// l'exercice (jamais de la saisie brute de l'élève, même convention que le reste du projet).
// ============================================================================

/** État actuel sur les écrans "resolution"/"domf" — les CE justes, une par fragment (LaTeX pur ;
 * le libellé « CE : » et le « et » sont écrits en texte par le composant). Vide si l'exercice n'a
 * aucune CE (le composant écrit alors « aucune »). */
export function formatTermesEtatActuelCELatex(exercice: ExerciceDomaineDefinition): string[] {
  return formatConditionsLatex(exercice);
}

// ============================================================================
// Écran "resolution" de "fractionSousRacine" (tableau de signes) — aide par surlignage vert
// (point 6, écran 3/domf), repris tel quel du principe du gen6 4e (`calculerAideGrilleQuotient`,
// `generateurs/inequationRationnelle/grilleQuotient.ts`) mais réimplémenté ICI (petite fonction
// pure, jamais importée cross-chantier) : le symbole est toujours "≥" pour ce générateur (jamais
// besoin d'un paramètre `Symbole` comme côté 4e, qui gère aussi ">"/"≤"/"<").
// ============================================================================

function colonneSatisfaitDomf(valeur: ValeurCelluleQuotient): boolean {
  return valeur === "0" || valeur === "+";
}

export function calculerAideGrilleDomf(grille: GrilleQuotientDomf, racines: number[]): { colonnes: boolean[]; racines: boolean[] } {
  const colonnes = grille.ligneQuotient.map(colonneSatisfaitDomf);
  const racinesAidees = racines.map((_, j) => colonnes[2 * j + 1]);
  return { colonnes, racines: racinesAidees };
}

// ============================================================================
// Récapitulatif final (point 1.7) — réponse attendue de l'écran "resolution", quand il existe.
// ============================================================================

/** LaTeX de la réponse attendue à l'écran "resolution", pour les familles qui en ont un — `null`
 * pour "fractionSousRacine" (son écran "resolution" est un TABLEAU, pas une expression, rendu à
 * part via `GrilleQuotientDomfRecap` par l'appelant) et pour toute famille sans écran "resolution"
 * séparé (voir `phaseApresCE`, moteur5e/typesDomaineDefinition.ts). */
export function formatResolutionAttendueLatex(exercice: ExerciceDomaineDefinition): string[] | null {
  if (exercice.famille === "racineSurFraction" && exercice.structure === "racineSurD") {
    const partieN = formatEnsembleReelLatex(exercice.resolutionRadicande);
    const d = exercice.resolutionDenominateur;
    return [`x\\in ${partieN}`, `x\\neq ${d === null ? "?" : formatValeurLatex(d)}`];
  }
  return null;
}
