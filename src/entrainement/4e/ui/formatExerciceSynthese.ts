/**
 * Présentation — "Exercice de synthèse" (chapitre 5, remplace "Étendue et écart interquartile" à
 * la même position, gen35 — `promptgen35synthese.md`).
 *
 * Les 15 écrans REPRIS des 5 générateurs sources (gen32/33/34/36) affichent chacun leur propre
 * "Enonce*"/leurs propres textes/formats — construits pour leur propre contrat, mais réutilisés ICI
 * TELS QUELS sur les objets MAPPÉS (`verificationExerciceSynthese.ts::versXxx`), donc rendus de
 * façon strictement identique à leur générateur d'origine. Ce fichier ne porte QUE ce qui est propre
 * à "Exercice de synthèse" : la phrase d'intro persistante (dupliquée depuis les 5 générateurs
 * sources, même template, même principe de duplication assumée entre générateurs du même chapitre),
 * le libellé de variante, et les 2 écrans "gen37 adaptée" (btIntervalle/btPourcent) qui n'ont pas
 * d'équivalent réutilisable dans gen37 (ses 8 variantes sont chacune typées trop étroitement).
 *
 * **σ à l'écran BT réutilise directement `ecartTypeEtatActuel` de "Paramètres de dispersion"**
 * (via le mapper `versDispersion`) — même donnée, même calcul "=" vs "≈", jamais une seconde
 * logique dupliquée. x̄, en revanche, n'a jamais besoin de ce traitement : toujours déjà exact par
 * construction, pour les 2 variantes (voir `core/exerciceSynthese.types.ts`). `borneInfBT`/
 * `borneSupBT` sont en revanche propres à cet exercice (gen37 n'a pas de champ équivalent avec
 * `kBT` fixé à 2) — leur signe "=" vs "≈" est donc dupliqué localement (`estArrondiExact`), même
 * principe que `formatDispersion.ts`/`formatBienaymeTchebychev.ts`.
 */
import type { ExerciceSynthese, VarianteExerciceSynthese } from "../core/exerciceSynthese.types";
import { versDispersion } from "../moteur/verificationExerciceSynthese";
import { ecartTypeEtatActuel } from "./formatDispersion";

export function formatEnonceTexte(exercice: ExerciceSynthese): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

const LIBELLES_VARIANTE: Record<VarianteExerciceSynthese, string> = {
  discrete: "Cas discret",
  classes: "Cas continu (classes)",
};

export function libelleVarianteExerciceSynthese(variante: VarianteExerciceSynthese): string {
  return LIBELLES_VARIANTE[variante];
}

export const LABEL_XBAR = "\\bar{x}";
export const LABEL_SIGMA = "\\sigma";

/** Notation décimale FRANÇAISE (virgule, `{,}`) pour toute valeur potentiellement décimale insérée
 * dans un bloc KaTeX — un entier reste affiché tel quel. Dupliquée depuis
 * `formatBienaymeTchebychev.ts`/`formatDispersion.ts`, jamais importée. */
function formatNombreLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

/** Même notation, pour du texte HTML brut (jamais passé par KaTeX). */
function formatNombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",");
}

// ============================================================================
// État actuel — x̄/σ CONFIRMÉS (quotient/varianceEcartType), rappelés sur les 2 écrans BT.
// ============================================================================

/** Rappel empilé sur 2 lignes (`\begin{gathered}`, jamais côte à côte — précaution
 * anti-débordement mobile déjà établie ailleurs dans le projet). */
export function formatEtatActuelXBarSigmaLatex(exercice: ExerciceSynthese): string {
  const sigma = ecartTypeEtatActuel(versDispersion(exercice));
  return `\\begin{gathered} ${LABEL_XBAR} = ${formatNombreLatex(exercice.xBar)} \\\\ ${LABEL_SIGMA} ${sigma.exact ? "=" : "\\approx"} ${formatNombreLatex(sigma.valeur)} \\end{gathered}`;
}

// ============================================================================
// Signe "=" vs "≈" pour borneInfBT/borneSupBT — dupliqué depuis "Paramètres de dispersion"/
// "Inégalité de Bienaymé-Tchebychev" (`estArrondiExact`), jamais importé.
// ============================================================================

const EPSILON_SIGNE = 1e-9;

function estArrondiExact(valeurExacte: number, valeurAffichee: number): boolean {
  return Math.abs(valeurExacte - valeurAffichee) < EPSILON_SIGNE;
}

export interface ValeurEtatActuelBT {
  valeur: number;
  exact: boolean;
}

function borneInfBTValeurExacte(exercice: ExerciceSynthese): number {
  return exercice.xBar - exercice.kBT * exercice.ecartTypeAttendu;
}

function borneSupBTValeurExacte(exercice: ExerciceSynthese): number {
  return exercice.xBar + exercice.kBT * exercice.ecartTypeAttendu;
}

export function borneInfBTEtatActuel(exercice: ExerciceSynthese): ValeurEtatActuelBT {
  return { valeur: exercice.borneInfBT, exact: estArrondiExact(borneInfBTValeurExacte(exercice), exercice.borneInfBT) };
}

export function borneSupBTEtatActuel(exercice: ExerciceSynthese): ValeurEtatActuelBT {
  return { valeur: exercice.borneSupBT, exact: estArrondiExact(borneSupBTValeurExacte(exercice), exercice.borneSupBT) };
}

// ============================================================================
// Écran "btIntervalle" — consigne + aide (2 niveaux : formule non substituée, puis substituée).
// ============================================================================

export function consigneBtIntervalle(exercice: ExerciceSynthese): string {
  return `Avec k = ${exercice.kBT}, quel est l'intervalle garanti par l'inégalité de Bienaymé-Tchebychev (en ${exercice.contexte.unite}) ? (arrondi à 2 décimales)`;
}

export interface AideDeuxLignes {
  texte: string;
  latex: string;
}

export function texteAideBtIntervalleNiveau1(): AideDeuxLignes {
  return {
    texte: "Rappel : l'intervalle garanti par l'inégalité de Bienaymé-Tchebychev est :",
    latex: `[${LABEL_XBAR}-k${LABEL_SIGMA}\\,;\\,${LABEL_XBAR}+k${LABEL_SIGMA}]`,
  };
}

export function texteAideBtIntervalleNiveau2(exercice: ExerciceSynthese): AideDeuxLignes {
  const xBar = formatNombreLatex(exercice.xBar);
  const sigma = formatNombreLatex(exercice.ecartTypeAttendu);
  return {
    texte: "Avec les valeurs de cet exercice (non calculé) :",
    latex: `[${xBar}-${exercice.kBT}\\times${sigma}\\,;\\,${xBar}+${exercice.kBT}\\times${sigma}]`,
  };
}

/** Révélation panneau de résultat — chaque borne indépendamment "=" ou "≈". */
export function formatBtIntervalleAttenduTexte(exercice: ExerciceSynthese): string {
  const inf = borneInfBTEtatActuel(exercice);
  const sup = borneSupBTEtatActuel(exercice);
  const signe = inf.exact && sup.exact ? "=" : "≈";
  return `${signe} [${formatNombreTexte(inf.valeur)} ; ${formatNombreTexte(sup.valeur)}]`;
}

// ============================================================================
// Écran "btPourcent" — consigne + aide (1 seul niveau : formule substituée, non calculée).
// ============================================================================

/** Rappel de l'intervalle CONFIRMÉ à l'écran précédent — jamais resaisi. */
export function formatEtatActuelIntervalleBTLatex(exercice: ExerciceSynthese): string {
  const inf = borneInfBTEtatActuel(exercice);
  const sup = borneSupBTEtatActuel(exercice);
  const signe = inf.exact && sup.exact ? "=" : "\\approx";
  return `I ${signe} [${formatNombreLatex(inf.valeur)}\\,;\\,${formatNombreLatex(sup.valeur)}]`;
}

export function consigneBtPourcent(): string {
  return "Quel est le pourcentage minimal d'effectif garanti dans cet intervalle ?";
}

export function texteAideBtPourcentNiveau1(exercice: ExerciceSynthese): AideDeuxLignes {
  return {
    texte: "Rappel : la proportion minimale garantie est 1-1/k² (non calculée) :",
    latex: `1-\\dfrac{1}{${exercice.kBT}^2}`,
  };
}

/** `pourcentAttenduBT` est toujours exactement 75 pour kBT=2 (aucun arrondi) — jamais de "≈". */
export function formatBtPourcentAttenduTexte(exercice: ExerciceSynthese): string {
  return `= ${formatNombreTexte(exercice.pourcentAttenduBT)} %`;
}
