/**
 * Présentation — "Paramètres de position" (chapitre 5, quatrième générateur, renommé depuis
 * "Médiane" sur toute l'interface — voir `core/mediane.types.ts` ; les identifiants de code
 * internes, ce fichier compris, restent inchangés) — `promptgen33creation.md`, puis
 * `promptgen33modifications.md` (écrans Q1/Q3/"Min, max et mode(s)" pour la variante "discrete",
 * écran "Polygone" remplaçant "Identifie la classe médiane" pour la variante "classes"), puis
 * `promptgen33modifications2.md` (3 écrans de lecture graphique Q1/médiane/Q3 remplaçant
 * "composantsFormule"/"calculFinal", puis un écran final "Synthèse" — variante "classes"
 * uniquement, la variante "discrete" n'est pas concernée par ce dernier prompt).
 *
 * En-têtes indiciels KaTeX (convention transversale, "entier la première apparition, symbole seul
 * ensuite") — appliquée INDÉPENDAMMENT par variante, puisque "discrete" (4 écrans) et "classes"
 * (5 écrans) n'affichent jamais leur table simultanément dans la même séquence.
 *
 * **Contexte narratif** (`promptgen33contexte.md`) : `formatEnonceTexte` compose une phrase
 * d'intro persistante ("Voici la répartition..."), affichée en tête de TOUS les écrans des 2
 * variantes — même template que "Tableau de fréquences"/"Regroupement en classes et histogramme"/
 * "Moyenne pondérée" (dupliqué ici, pas importé — contrats indépendants entre générateurs du même
 * chapitre). L'unité est en plus mentionnée explicitement dans la consigne de chaque écran qui
 * porte directement sur une valeur x_i/interpolée dans cette unité (médiane/Q1/Q3/min/max/mode,
 * lecture graphique, synthèse) — jamais sur l'écran "Polygone" (construction graphique, aucun
 * champ numérique dans l'unité) ni sur un champ purement catégoriel.
 *
 * **Notation KaTeX des aides "niveau 1"/"niveau 2" de l'écran discrete**
 * (`promptinvestigationpoint3latexmobile.md`) : `texteAideMedianeNiveau1`/`texteAideQ1Niveau1`/
 * `texteAideQ3Niveau1`/`texteAideMinMaxModeNiveau1`/`Niveau2` retournent désormais des
 * `SegmentTexte[]` (xᵢ/nᵢ en KaTeX plutôt qu'en Unicode souscrit brut) — mesuré empiriquement à
 * 375px sans aucun débordement (simples symboles courts insérés dans une phrase qui enveloppe
 * naturellement).
 *
 * **Précision de lecture par palier d'amplitude** (`promptgen33gen35precisionlecture.md`,
 * Correction 2 — les 3 écrans de lecture graphique "classes" uniquement) : `consigneLecture`
 * n'affiche plus une précision/tolérance fixe ±0,1, mais le palier RÉELLEMENT applicable à
 * l'instance générée (`precisionLecture(exercice.etendue)`, importée depuis `verificationMediane.ts`
 * — Couche B, jamais recalculée ici) — `libellePrecisionLecture` formule ce palier en français
 * naturel ("arrondi au dixième"/"à l'unité"/"au multiple de 5 le plus proche"...), jamais
 * littéralement "arrondi à 20". La tolérance de vérification restant toujours ÉGALE au pas du
 * palier (voir `verificationMediane.ts::toleranceLecture`), la consigne n'affiche donc qu'un seul
 * nombre pour l'arrondi ET la marge acceptée. La Correction 1 (n toujours pair, positionnement de
 * la barre de seuil) est, elle, entièrement portée par la Couche A (`generateurs/mediane/index.ts`)
 * — aucun changement nécessaire dans ce fichier de présentation.
 */
import type { ExerciceMediane, ExerciceMedianeClasses, ExerciceMedianeDiscrete } from "../core/mediane.types";
import { type ParametreLecture, precisionLecture, seuilLecture } from "../moteur/verificationMediane";
import { pointsEncadrementSeuil } from "./lectureQuartileGraph";
import type { PointPolygoneXY } from "./lectureQuartileGraph";

/** Phrase d'intro, persistante sur les 7 écrans possibles de ce générateur. */
export function formatEnonceTexte(exercice: ExerciceMediane): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

export const LABEL_VALEUR_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_EFFECTIF_CUMULE_VI = "v_i";
/** Habillage KaTeX du label "Médiane" (`promptgen33modifications.md`, point 1) — jamais un texte
 * brut "Q2", toujours composé en JSX comme "Médiane <Katex expression={LABEL_MEDIANE_Q2}/> =". */
export const LABEL_MEDIANE_Q2 = "Q_2";
export const LABEL_Q1 = "Q_1";
export const LABEL_Q3 = "Q_3";
/** Notation indicielle réelle (`promptgen33ajustements.md`, point 3) — jamais un tiret bas
 * littéral affiché à l'écran ("x_min"), toujours composée via `<Katex>` là où ces symboles
 * apparaissent : labels des champs de l'écran "Synthèse", texte de son Aide 1, et la révélation
 * du panneau de résultat (`ResultatPanelMediane.tsx`). */
export const LABEL_X_MIN = "x_{min}";
export const LABEL_X_MAX = "x_{max}";

/** Fragments texte/KaTeX — nécessaire dès qu'une phrase mêle plusieurs symboles distincts (ex.
 * xᵢ ET nᵢ dans la même aide) — même patron que `formatDispersion.ts`/`formatComparaisonSeries.ts`
 * (`SegmentTexte` dupliqué ici, pas importé, petit type pur — `promptinvestigationpoint3latexmobile.md`),
 * rendu via le composant partagé `SegmentsInline` côté présentation. */
export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

export const PLACEHOLDER_SEUIL = "ex : 10";
export const PLACEHOLDER_MEDIANE = "ex : 7";
export const PLACEHOLDER_Q1 = "ex : 5";
export const PLACEHOLDER_Q3 = "ex : 9";
export const PLACEHOLDER_MIN = "ex : 2";
export const PLACEHOLDER_MAX = "ex : 14";
export const PLACEHOLDER_LECTURE = "ex : 5,3";
export const PLACEHOLDER_XMIN = "ex : 0";
export const PLACEHOLDER_XMAX = "ex : 20";
export const PLACEHOLDER_ETENDUE = "ex : 20";
export const PLACEHOLDER_MODE = "ex : 4,5";

/** Borne supérieure exclue pour toute classe sauf la dernière, incluse pour la dernière — même
 * convention francophone à crochets inversés que "Regroupement en classes et histogramme". */
export function estDerniereClasse(exercice: ExerciceMedianeClasses, index: number): boolean {
  return index === exercice.classes.length - 1;
}

export function formatClasseTexte(exercice: ExerciceMedianeClasses, index: number): string {
  const classe = exercice.classes[index];
  const fermante = estDerniereClasse(exercice, index) ? "]" : "[";
  return `[${classe.borneInf} ; ${classe.borneSup}${fermante}`;
}

/** Le polygone COMPLET des effectifs cumulés (point fixe + un point par classe) — toujours dérivé
 * des vraies données confirmées de l'exercice, jamais d'une saisie résiduelle de l'écran "Polygone"
 * (`promptgen33modifications2.md`, consommé par les 3 écrans de lecture graphique). */
export function polygonePoints(exercice: ExerciceMedianeClasses): { x: number; y: number }[] {
  return [{ x: exercice.classes[0].borneInf, y: 0 }, ...exercice.classes.map((c) => ({ x: c.borneSup, y: c.effectifCumule }))];
}

// ============================================================================
// Surlignage du tableau (Aide 2 des écrans "mediane"/"q1"/"q3") —
// `promptgen33modifications.md`, point 1.
// ============================================================================

export type SurlignageSeuilTable = { type: "ligne"; index: number } | { type: "valeur"; index: number };

/**
 * Détermine ce qu'il faut surligner dans le tableau à l'activation de l'Aide 2 : si `seuil`
 * coïncide EXACTEMENT avec l'effectif cumulé d'une ligne (cas limite), surligne UNIQUEMENT cette
 * valeur (jamais toute la ligne — ce n'est pas la réponse, la règle stricte impose de prendre la
 * ligne suivante) ; sinon, surligne la ligne entière `indexReponse` (la première dont l'effectif
 * cumulé dépasse strictement le seuil — c'est alors bien la ligne réponse).
 */
export function surlignageSeuilTable(exercice: ExerciceMedianeDiscrete, seuil: number, indexReponse: number): SurlignageSeuilTable {
  const indexEgal = exercice.lignes.findIndex((l) => l.effectifCumule === seuil);
  if (indexEgal !== -1) return { type: "valeur", index: indexEgal };
  return { type: "ligne", index: indexReponse };
}

// ============================================================================
// Écran "mediane" — variante "discrete", première étape de sa séquence (plus jamais terminale).
// ============================================================================

export function consigneMedianeDiscrete(exercice: ExerciceMedianeDiscrete): string {
  return `Calcule le seuil n/2, puis détermine la médiane (en ${exercice.contexte.unite}) à partir du tableau.`;
}

/** Rendu KaTeX (`promptinvestigationpoint3latexmobile.md`) — un simple symbole court inséré dans
 * une phrase qui enveloppe naturellement sur mobile, mesuré à 375px sans aucun débordement. */
export function texteAideMedianeNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : la médiane correspond à la première valeur "),
    Kx(LABEL_VALEUR_XI),
    T(" du tableau dont l'effectif cumulé dépasse STRICTEMENT n/2 (jamais « ≥ »)."),
  ];
}

export function texteAideMedianeNiveau2(exercice: ExerciceMedianeDiscrete): string {
  return `Le seuil n/2 vaut ${exercice.seuil}. Il reste à chercher, dans le tableau, la première valeur dont l'effectif cumulé dépasse ce seuil.`;
}

// ============================================================================
// Écran "q1" — variante "discrete" uniquement, `promptgen33modifications.md`. Même structure/
// logique que "mediane", seuil n/4, calculée DIRECTEMENT sur le tableau complet (jamais en
// cascade par rapport à la position de la médiane).
// ============================================================================

export function consigneQ1(exercice: ExerciceMedianeDiscrete): string {
  return `Calcule le seuil n/4, puis détermine le premier quartile Q1 (en ${exercice.contexte.unite}) à partir du tableau complet.`;
}

export function texteAideQ1Niveau1(): SegmentTexte[] {
  return [
    T("Rappel : Q1 correspond à la première valeur "),
    Kx(LABEL_VALEUR_XI),
    T(
      " du tableau dont l'effectif cumulé dépasse STRICTEMENT n/4 (jamais « ≥ »). Calcul direct sur le tableau complet, indépendant de la position de la médiane.",
    ),
  ];
}

export function texteAideQ1Niveau2(exercice: ExerciceMedianeDiscrete): string {
  return `Le seuil n/4 vaut ${exercice.seuilQ1}. Il reste à chercher, dans le tableau, la première valeur dont l'effectif cumulé dépasse ce seuil.`;
}

// ============================================================================
// Écran "q3" — variante "discrete" uniquement, même structure/logique, seuil 3n/4.
// ============================================================================

export function consigneQ3(exercice: ExerciceMedianeDiscrete): string {
  return `Calcule le seuil 3n/4, puis détermine le troisième quartile Q3 (en ${exercice.contexte.unite}) à partir du tableau complet.`;
}

export function texteAideQ3Niveau1(): SegmentTexte[] {
  return [
    T("Rappel : Q3 correspond à la première valeur "),
    Kx(LABEL_VALEUR_XI),
    T(
      " du tableau dont l'effectif cumulé dépasse STRICTEMENT 3n/4 (jamais « ≥ »). Calcul direct sur le tableau complet, indépendant de la position de la médiane.",
    ),
  ];
}

export function texteAideQ3Niveau2(exercice: ExerciceMedianeDiscrete): string {
  return `Le seuil 3n/4 vaut ${exercice.seuilQ3}. Il reste à chercher, dans le tableau, la première valeur dont l'effectif cumulé dépasse ce seuil.`;
}

// ============================================================================
// Écran "minMaxMode" — variante "discrete" uniquement, dernière étape de sa séquence. Aide
// UNIQUEMENT sur la partie mode(s), min/max en lecture directe sans aide dédiée.
// ============================================================================

export function consigneMinMaxMode(exercice: ExerciceMedianeDiscrete): string {
  return `Détermine le minimum, le maximum et le(s) mode(s) (en ${exercice.contexte.unite}) de cette série.`;
}

export function texteAideMinMaxModeNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : le mode correspond à la valeur "),
    Kx(LABEL_VALEUR_XI),
    T(" dont l'effectif "),
    Kx(LABEL_EFFECTIF_NI),
    T(" est MAXIMAL — pas une propriété de "),
    Kx(LABEL_VALEUR_XI),
    T(" lui-même (ni la plus grande valeur, ni la valeur médiane)."),
  ];
}

export function effectifMaximalMinMaxMode(exercice: ExerciceMedianeDiscrete): number {
  return Math.max(...exercice.lignes.map((l) => l.effectif));
}

export function texteAideMinMaxModeNiveau2(exercice: ExerciceMedianeDiscrete): SegmentTexte[] {
  return [
    T(`L'effectif maximal du tableau vaut ${effectifMaximalMinMaxMode(exercice)}. Il reste à trouver la ou les valeurs `),
    Kx(LABEL_VALEUR_XI),
    T(" qui l'atteignent."),
  ];
}

// ============================================================================
// Écran "polygone" — variante "classes" uniquement, remplace "Identifie la classe médiane"
// (`promptgen33modifications.md`, point 5). Une seule aide générique, jamais de coordonnées de
// l'exercice révélées.
// ============================================================================

export const CONSIGNE_POLYGONE = "Sur base des données du tableau, construis le polygone des effectifs cumulés.";

export function texteAidePolygoneNiveau1(): string {
  return "Rappel : le premier point est fixe, en (borne inférieure de la première classe ; 0). Pour chaque classe suivante, place un point en (borne supérieure de la classe ; effectif cumulé de cette classe), puis relie-le au point précédent par un segment.";
}

// ============================================================================
// Écrans "lectureQ1"/"lectureMediane"/"lectureQ3" — variante "classes" uniquement,
// `promptgen33modifications2.md` (remplacent "composantsFormule"/"calculFinal") : un seul champ
// (la valeur lue), aucun champ "seuil" séparé — la démarche de calcul du seuil est expliquée par
// l'aide, jamais notée à part comme dans la variante "discrete".
// ============================================================================

const CONSIGNE_LECTURE_DEBUT: Record<ParametreLecture, string> = {
  q1: "Calcule le seuil n/4, positionne la barre à cette hauteur sur le polygone, puis lis le premier quartile Q1",
  mediane: "Calcule le seuil n/2, positionne la barre à cette hauteur sur le polygone, puis lis la médiane",
  q3: "Calcule le seuil 3n/4, positionne la barre à cette hauteur sur le polygone, puis lis le troisième quartile Q3",
};

/** Formule le palier de précision de lecture en français naturel — jamais littéralement "arrondi à
 * 20" (`promptgen33gen35precisionlecture.md`, Correction 2) : réutilise la même convention de
 * formulation déjà établie ailleurs dans le projet pour les paliers nommables
 * (`formatBienaymeTchebychev.ts::PRECISION_UNITE = "arrondi à l'unité"`,
 * `formatDispersion.ts::PRECISION_2_DECIMALES`), avec un repli générique "arrondi au multiple de X
 * le plus proche" pour les paliers 5/20, qui n'ont pas de nom français court usuel. */
export function libellePrecisionLecture(precision: number): string {
  if (precision === 0.1) return "arrondi au dixième";
  if (precision === 1) return "arrondi à l'unité";
  return `arrondi au multiple de ${precision} le plus proche`;
}

/** Notation française du pas de précision (virgule pour 0,1, entier nu pour 1/5/20 — jamais de
 * point décimal affiché à l'élève). */
function formatPrecisionTexte(precision: number): string {
  return precision === 0.1 ? "0,1" : String(precision);
}

/** Consigne DYNAMIQUE — reflète le palier de précision RÉELLEMENT applicable à l'instance générée
 * (`promptgen33gen35precisionlecture.md`, Correction 2 — remplace l'ancienne mention fixe "à ±0,1
 * près", devenue inexacte dès qu'un contexte à grande amplitude est tiré). La tolérance de
 * vérification (`toleranceLecture`, `verificationMediane.ts`) est TOUJOURS ÉGALE au pas du palier
 * — la consigne mentionne donc une seule et même valeur pour l'arrondi attendu ET la marge
 * acceptée, jamais deux nombres distincts qui suggéreraient une double exigence. */
export function consigneLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): string {
  const precision = precisionLecture(exercice.etendue);
  const texte = formatPrecisionTexte(precision);
  return `${CONSIGNE_LECTURE_DEBUT[parametre]} (en ${exercice.contexte.unite}, ${libellePrecisionLecture(precision)}, réponse acceptée à ±${texte} près).`;
}

const FORMULE_SEUIL: Record<ParametreLecture, string> = { q1: "n/4", mediane: "n/2", q3: "3n/4" };
const LABEL_LECTURE: Record<ParametreLecture, string> = { q1: "Q_1", mediane: "Q_2", q3: "Q_3" };

export function labelChampLecture(parametre: ParametreLecture): string {
  return LABEL_LECTURE[parametre];
}

/** Aide 1 — rappel de la MÉTHODE (jamais les valeurs de l'exercice) : calculer le seuil, placer la
 * barre, lire l'intersection avec la courbe puis l'abscisse correspondante. */
export function texteAideLectureNiveau1(parametre: ParametreLecture): string {
  return `Rappel : calcule d'abord le seuil ${FORMULE_SEUIL[parametre]}, place la barre orange à cette hauteur sur le graphe — les pointillés et la croix se tracent automatiquement jusqu'à la courbe puis jusqu'à l'axe des x, où tu peux lire l'abscisse correspondante.`;
}

/** Aide 2 — révèle le SEUIL déjà calculé pour cet exercice précis, jamais la valeur finale
 * elle-même (l'élève doit encore positionner la barre et lire l'abscisse). */
export function texteAideLectureNiveau2(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): string {
  const seuil = parametre === "q1" ? exercice.seuilQ1 : parametre === "q3" ? exercice.seuilQ3 : exercice.seuil;
  return `Le seuil ${FORMULE_SEUIL[parametre]} vaut ${seuil}. Positionne la barre à cette hauteur, puis lis l'abscisse où le pointillé vertical croise l'axe des x.`;
}

/** Les 2 sommets du polygone (déjà confirmé, `polygonePoints`) qui encadrent le seuil du paramètre
 * demandé — les extrémités du segment sur lequel se fait l'interpolation linéaire
 * (`promptgen33gen35aidesinterpolation.md`, aides 3/4). Consommé à la fois pour le texte de l'aide 3
 * (`texteAideLectureNiveau3` ci-dessous) et pour le surlignage orange sur le graphe
 * (`LectureQuartileGraph`, prop `pointsEncadres`) — une seule source de vérité, jamais recalculée
 * différemment entre le texte et le graphe. */
export function pointsEncadresLecture(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): { inf: PointPolygoneXY; sup: PointPolygoneXY } {
  return pointsEncadrementSeuil(polygonePoints(exercice), seuilLecture(exercice, parametre));
}

/** Aide 3 — fait repérer visuellement l'INTERVALLE d'interpolation (les 2 points mis en évidence en
 * orange sur le graphe), sans encore nommer les effectifs cumulés associés (réservé à l'aide 4). */
export function texteAideLectureNiveau3(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): SegmentTexte[] {
  const { inf, sup } = pointsEncadresLecture(exercice, parametre);
  return [
    T("La valeur de "),
    Kx(LABEL_LECTURE[parametre]),
    T(" est comprise entre "),
    Kx(`x_{inf}=${inf.x}`),
    T(" et "),
    Kx(`x_{sup}=${sup.x}`),
    T("."),
  ];
}

const FORMULE_SEUIL_LATEX: Record<ParametreLecture, string> = {
  q1: "\\dfrac{n}{4}",
  mediane: "\\dfrac{n}{2}",
  q3: "\\dfrac{3n}{4}",
};

/** Aide 4 — la formule d'interpolation linéaire elle-même, avec $v_{inf}$/$v_{sup}$ (même notation
 * $v_i$ que la colonne des effectifs cumulés du tableau — jamais $y_i$, une notation parallèle non
 * introduite ailleurs sur cet écran). Identique en structure sur les 3 écrans, seuls le seuil
 * ($n/4$/$n/2$/$3n/4$) et le quartile ($Q_1$/$Q_2$/$Q_3$) changent. */
export function formatFormuleInterpolationLatex(parametre: ParametreLecture): string {
  return `${LABEL_LECTURE[parametre]} = x_{inf} + \\dfrac{x_{sup}-x_{inf}}{v_{sup}-v_{inf}}\\left(${FORMULE_SEUIL_LATEX[parametre]}-v_{inf}\\right)`;
}

// ============================================================================
// Écran "synthese" — variante "classes" uniquement, dernière étape,
// `promptgen33modifications2.md` (remplace "calculFinal") : tableau réaffiché, xMin/xMax/étendue,
// classe modale catégorielle, mode = centre de la classe modale (vérifié indépendamment).
// ============================================================================

export function consigneSynthese(exercice: ExerciceMedianeClasses): string {
  return `À partir du tableau ci-dessous (en ${exercice.contexte.unite}), détermine les paramètres suivants.`;
}

/** Aide 1 (`promptgen33modifications2.md`) — décomposée en fragments texte/LaTeX
 * (`promptgen33ajustements.md`, point 3 : `LABEL_X_MIN`/`LABEL_X_MAX` composés via `<Katex>` dans
 * `EtapeSyntheseMediane.tsx`, jamais un tiret bas littéral "xmin"/"xmax" affiché à l'écran — même
 * principe que `RAPPEL_VECTORIEL_ORTHOGONALITE_AVANT/ENTRE/APRES`, "Orthogonalité"). */
export const TEXTE_AIDE_SYNTHESE_1_AVANT = "Rappel :";
export const TEXTE_AIDE_SYNTHESE_1_ENTRE_1 = "est la borne inférieure de la première classe,";
export const TEXTE_AIDE_SYNTHESE_1_ENTRE_2 = "la borne supérieure de la dernière. L'étendue =";
export const TEXTE_AIDE_SYNTHESE_1_ENTRE_3 = "−";
export const TEXTE_AIDE_SYNTHESE_1_APRES =
  ". La classe modale est celle dont l'effectif est MAXIMAL ; le mode demandé ici est le CENTRE de cette classe, (borne inférieure + borne supérieure) / 2.";

export function effectifMaximalSynthese(exercice: ExerciceMedianeClasses): number {
  return Math.max(...exercice.classes.map((c) => c.effectif));
}

export function texteAideSyntheseNiveau2(exercice: ExerciceMedianeClasses): string {
  return `L'effectif maximal du tableau vaut ${effectifMaximalSynthese(exercice)}. Il reste à identifier la classe qui l'atteint, puis à calculer son centre.`;
}

// ============================================================================
// Révélation — panneau de résultat.
// ============================================================================

export function formatMedianeAttendueTexte(exercice: { seuil: number; mediane: number }): string {
  return `seuil = ${exercice.seuil}, médiane = ${exercice.mediane}`;
}

export function formatQ1AttendueTexte(exercice: ExerciceMedianeDiscrete): string {
  return `seuil = ${exercice.seuilQ1}, Q1 = ${exercice.q1}`;
}

export function formatQ3AttendueTexte(exercice: ExerciceMedianeDiscrete): string {
  return `seuil = ${exercice.seuilQ3}, Q3 = ${exercice.q3}`;
}

export function formatMinMaxModeAttendueTexte(exercice: ExerciceMedianeDiscrete): string {
  const modes = exercice.modes.join(", ");
  return `min = ${exercice.min}, max = ${exercice.max}, mode(s) = ${modes}`;
}

export function formatPolygoneAttenduTexte(exercice: ExerciceMedianeClasses): string {
  return exercice.classes.map((c, i) => `${formatClasseTexte(exercice, i)} → (${c.borneSup} ; ${c.effectifCumule})`).join(", ");
}

/** `≈` plutôt que `=` — révélation d'un écran à tolérance non nulle (le pas du palier de précision
 * applicable, `toleranceLecture`, `verificationMediane.ts`), jamais une correspondance exacte, quel
 * que soit le palier réellement en jeu. */
export function formatLectureAttendueTexte(exercice: ExerciceMedianeClasses, parametre: ParametreLecture): string {
  const valeur = parametre === "q1" ? exercice.q1 : parametre === "q3" ? exercice.q3 : exercice.mediane;
  return `${labelChampLecture(parametre).replace("_", "")} ≈ ${valeur}`;
}

/** Ne couvre plus que la portion sans `x_{min}`/`x_{max}` (`promptgen33ajustements.md`, point 3) —
 * ces deux valeurs sont composées séparément en JSX dans `ResultatPanelMediane.tsx`, avec la
 * notation indicielle réelle (`LABEL_X_MIN`/`LABEL_X_MAX`), jamais un tiret bas littéral. */
export function formatSyntheseAttendueTexte(exercice: ExerciceMedianeClasses): string {
  const classeModale = formatClasseTexte(exercice, exercice.indexClasseModale);
  return `étendue = ${exercice.etendue}, classe modale = ${classeModale}, mode = ${exercice.modeCentreClasseModale}`;
}
