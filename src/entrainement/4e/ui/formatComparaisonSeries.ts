/**
 * Présentation — "Comparaison de deux séries statistiques" (chapitre 5, huitième et dernier
 * générateur du chapitre) — voir `promptgencomparaisonseriescreation.md`.
 *
 * **Mono-écran** (comme "Quel angle ?"/"Transformations graphiques") : un seul écran, une seule
 * question parmi 4 types possibles (`exercice.question.type`), jamais une séquence de phases.
 *
 * **Notation indicielle systématique** ($\bar x$/σ/$Q_1$/$Q_2$/$Q_3$/$x_{min}$/$x_{max}$), même
 * patron "prose + fragments KaTeX courts" que "Boîte à moustaches"/"Inégalité de Bienaymé-
 * Tchebychev" — `SegmentTexte` dupliqué (pas importé, petit type pur, même principe que le reste
 * du projet), rendu par le composant partagé `SegmentsInline.tsx`.
 *
 * **Contexte narratif** — réutilise `formatEnonceTexte` sur le même gabarit "comparaison" déjà
 * établi par "Boîte à moustaches" (toujours 2 séries, jamais un contexte par série), `articleDe`
 * dupliquée à l'identique (élision devant une voyelle).
 *
 * **Gender agreement** — les phrases d'interprétation évitent délibérément l'accord de genre du
 * caractère étudié en s'appuyant sur "valeur"/"une population où [caractère] est..." plutôt que sur
 * un adjectif directement accolé au caractère (`caractereIndefini`) — sauf pour "élevé(e)", dont
 * l'accord est dérivé de `contexte.comprisAccord` (même champ que le reste de la banque partagée,
 * jamais un nouveau champ de genre).
 */
import type {
  ExerciceComparaisonSeries,
  QuestionCentrage,
  QuestionDispersion,
  QuestionInterpretation,
  QuestionSeuil,
  TypeQuestionComparaisonSeries,
  VarianteComparaisonSeries,
} from "../core/comparaisonSeries.types";
import type { ArgumentDispersionOption } from "../moteur/verificationComparaisonSeries";

export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

export const LABEL_X_BAR = "\\bar{x}";
export const LABEL_SIGMA = "\\sigma";
export const LABEL_Q1 = "Q_1";
export const LABEL_Q2 = "Q_2";
export const LABEL_Q3 = "Q_3";
export const LABEL_X_MIN = "x_{min}";
export const LABEL_X_MAX = "x_{max}";
export const LABEL_VALEUR_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_EFFECTIF_CUMULE_VI = "v_i";

const LIBELLES_VARIANTE: Record<VarianteComparaisonSeries, string> = {
  tableaux: "Tableaux x_i / n_i",
  recapitulatif: "Tableau récapitulatif",
  graphique: "Courbes cumulées",
};

export function libelleVarianteComparaisonSeries(variante: VarianteComparaisonSeries): string {
  return LIBELLES_VARIANTE[variante];
}

const LIBELLES_TYPE_QUESTION: Record<TypeQuestionComparaisonSeries, string> = {
  centrage: "Centrage",
  dispersion: "Dispersion",
  seuil: "Lecture à un seuil",
  interpretation: "Interprétation",
};

export function libelleTypeQuestion(type: TypeQuestionComparaisonSeries): string {
  return LIBELLES_TYPE_QUESTION[type];
}

/** Élision de "de" devant une voyelle (ou un h muet) — dupliquée depuis
 * `formatBoiteMoustaches.ts` (contrats indépendants entre générateurs du même chapitre). */
function articleDe(mot: string): string {
  return /^[aeiouyàâäéèêëîïôöùûüh]/i.test(mot) ? "d'" : "de ";
}

/** Même gabarit "comparaison" que "Boîte à moustaches" — toujours 2 séries, TOUJOURS le même
 * contexte (jamais deux contextes indépendants pour A et B). */
export function formatEnonceTexte(exercice: ExerciceComparaisonSeries): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez deux groupes ${articleDe(contexte.population)}${contexte.population} — série A et série B :`;
}

// ============================================================================
// Question "centrage" — quelle série a la plus grande médiane ?
// ============================================================================

export function segmentsConsigneCentrage(): SegmentTexte[] {
  return [T("Quelle série a la médiane ("), Kx(LABEL_Q2), T(") la plus élevée ?")];
}

export function segmentsAideCentrageNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : la médiane ("),
    Kx(LABEL_Q2),
    T(") partage la série en deux moitiés de même effectif — compare sa VALEUR entre les deux séries, pas leur étendue."),
  ];
}

export function segmentsAideCentrageNiveau2(exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  if (exercice.variante === "recapitulatif") {
    return [T("Consulte directement la ligne "), Kx(LABEL_Q2), T(" du tableau récapitulatif de chaque série.")];
  }
  return [T("Sur le graphique, la médiane correspond à l'abscisse où la courbe atteint la moitié de l'effectif total (ou 50 % en fréquence cumulée).")];
}

export function segmentsCentrageAttendu(question: QuestionCentrage): SegmentTexte[] {
  return [T(`La série ${question.medianePlusGrande} a la médiane la plus élevée.`)];
}

// ============================================================================
// Question "dispersion" — quelle série est la plus homogène, justifiée par N argument(s).
// ============================================================================

export const OPTIONS_ARGUMENT_DISPERSION: { id: ArgumentDispersionOption; label: string }[] = [
  { id: "ecartType", label: "Écart-type (σ)" },
  { id: "ecartInterquartile", label: "Écart interquartile (Q3-Q1)" },
  { id: "etendue", label: "Étendue (max - min)" },
];

export function segmentsConsigneDispersion(question: QuestionDispersion): SegmentTexte[] {
  const nombre = question.nombreArguments === 1 ? "1 argument statistique" : "2 arguments statistiques";
  return [T(`Dans quelle série les valeurs sont-elles les plus homogènes ? Justifie à l'aide de ${nombre}.`)];
}

export function segmentsAideDispersionNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : une série est homogène quand ses valeurs sont peu dispersées — plus l'écart-type ("),
    Kx(LABEL_SIGMA),
    T(") ou l'écart interquartile ("),
    Kx(`${LABEL_Q3}-${LABEL_Q1}`),
    T(") est petit, plus la série est homogène. Ne confonds pas ces deux mesures avec l'étendue (max - min), qui ne tient compte que des deux valeurs extrêmes."),
  ];
}

export function segmentsAideDispersionNiveau2(exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  if (exercice.variante === "recapitulatif") {
    return [
      T("Consulte directement les lignes "),
      Kx(LABEL_SIGMA),
      T(" et "),
      Kx(`${LABEL_Q3}-${LABEL_Q1}`),
      T(" du tableau récapitulatif — la série avec les valeurs les plus petites est la plus homogène."),
    ];
  }
  return [T("Sur le graphique, la série dont la courbe monte le plus rapidement — sur l'intervalle le plus étroit — est la plus homogène.")];
}

export function segmentsDispersionAttendu(question: QuestionDispersion): SegmentTexte[] {
  return [T(`La série ${question.serieHomogene} est la plus homogène.`)];
}

// ============================================================================
// Question "seuil" — lecture d'un effectif/pourcentage à un seuil ou sur une tranche.
// ============================================================================

export function segmentsConsigneSeuil(question: QuestionSeuil, exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  const serie = question.serie === "A" ? exercice.serieA : exercice.serieB;
  const valeurHaut = serie.lignes[question.indexHaut].valeur;
  const unite = exercice.contexte.unite;
  const sujet = question.estFrequence ? "Quel pourcentage des données de la série" : "Combien d'individus de la série";
  const verbe = question.estFrequence ? "a une valeur" : "ont une valeur";
  const precision = question.estFrequence ? " (arrondi à l'unité)" : "";

  if (question.indexBas === null) {
    return [T(`${sujet} ${question.serie} ${verbe} inférieure ou égale à ${valeurHaut} ${unite} ?${precision}`)];
  }

  const valeurBas = serie.lignes[question.indexBas].valeur;
  return [
    T(`${sujet} ${question.serie} ${verbe} dans `),
    Kx(`]${valeurBas}\\,;\\,${valeurHaut}]`),
    T(` ${unite} ?${precision}`),
  ];
}

export function segmentsAideSeuilNiveau1(exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  if (exercice.variante === "tableaux") {
    return [T("Repère la ligne du tableau correspondant à la valeur seuil, puis lis directement l'effectif cumulé — ou soustrais deux effectifs cumulés pour une tranche.")];
  }
  return [T("Sur le graphique, repère l'abscisse correspondant à la valeur seuil, puis lis l'ordonnée de la courbe de la série concernée à cet endroit.")];
}

export function segmentsAideSeuilNiveau2(question: QuestionSeuil, exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  const serie = question.serie === "A" ? exercice.serieA : exercice.serieB;
  const ligneHaut = serie.lignes[question.indexHaut];
  const cumuleHaut = question.estFrequence ? ligneHaut.frequenceCumulee : ligneHaut.effectifCumule;
  const suffixe = question.estFrequence ? " %" : "";

  if (question.indexBas === null) {
    return [T(`À la valeur ${ligneHaut.valeur}, le cumul vaut ${cumuleHaut}${suffixe}.`)];
  }

  const ligneBas = serie.lignes[question.indexBas];
  const cumuleBas = question.estFrequence ? ligneBas.frequenceCumulee : ligneBas.effectifCumule;
  return [T(`À la valeur ${ligneBas.valeur}, le cumul vaut ${cumuleBas}${suffixe} ; à la valeur ${ligneHaut.valeur}, il vaut ${cumuleHaut}${suffixe}.`)];
}

export function segmentsSeuilAttendu(question: QuestionSeuil): SegmentTexte[] {
  return [T(`Réponse attendue : ${question.reponseAttendue}${question.estFrequence ? " %" : ""}.`)];
}

// ============================================================================
// Question "interpretation" — associer un profil narratif à l'une des deux séries.
// ============================================================================

/** Accord de "élevé"/"élevée" — dérivé de `comprisAccord` (déjà porté par la banque de contextes
 * partagée), jamais un nouveau champ de genre. */
function accordEleve(compris: "compris" | "comprise"): string {
  return compris === "comprise" ? "élevée" : "élevé";
}

/** Décrit le profil de la série `serie` — dérivé de sa médiane/dispersion RELATIVES à l'autre
 * série, jamais d'une valeur absolue (ni d'un domaine sémantique figé comme "jeune"/"âgé", trop
 * spécifique à un seul contexte narratif parmi la banque). */
export function texteProfilSerie(exercice: ExerciceComparaisonSeries, serie: "A" | "B"): string {
  const { contexte, serieA, serieB } = exercice;
  const cible = serie === "A" ? serieA : serieB;
  const autre = serie === "A" ? serieB : serieA;
  const niveauBas = cible.mediane < autre.mediane;
  const homogene = cible.sigma < autre.sigma;
  const niveauTexte = niveauBas ? "plutôt faible" : `plutôt ${accordEleve(contexte.comprisAccord)}`;
  const dispersionTexte = homogene ? "peu variée d'un individu à l'autre" : "très variée d'un individu à l'autre";
  return `une population où ${contexte.caractereDefini} est ${niveauTexte} et ${dispersionTexte}`;
}

export function segmentsConsigneInterpretation(question: QuestionInterpretation, exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  return [T(`Voici le profil d'une des deux séries : « ${texteProfilSerie(exercice, question.serieDecrite)} ». Laquelle des deux séries, A ou B, correspond à ce profil ?`)];
}

export function segmentsAideInterpretationNiveau1(): SegmentTexte[] {
  return [T("Compare d'abord les médianes (le niveau général), puis les dispersions (l'homogénéité) des deux séries pour identifier celle qui correspond au profil décrit.")];
}

export function segmentsAideInterpretationNiveau2(exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  return [
    T(
      `Rappel : ${exercice.contexte.caractereDefini} le plus faible se lit sur la série dont la médiane est la plus basse ; l'homogénéité se lit sur celle dont l'écart-type (ou l'écart interquartile) est le plus petit.`,
    ),
  ];
}

export function segmentsInterpretationAttendu(question: QuestionInterpretation): SegmentTexte[] {
  return [T(`La série ${question.serieDecrite} correspond à ce profil.`)];
}

// ============================================================================
// Dispatch — révélation, panneau de résultat.
// ============================================================================

/** Point d'entrée unique pour le panneau de résultat — dispatch sur `exercice.question.type`,
 * jamais dupliqué côté composant. */
export function segmentsReponseAttendue(exercice: ExerciceComparaisonSeries): SegmentTexte[] {
  const { question } = exercice;
  if (question.type === "centrage") return segmentsCentrageAttendu(question);
  if (question.type === "dispersion") return segmentsDispersionAttendu(question);
  if (question.type === "seuil") return segmentsSeuilAttendu(question);
  return segmentsInterpretationAttendu(question);
}
