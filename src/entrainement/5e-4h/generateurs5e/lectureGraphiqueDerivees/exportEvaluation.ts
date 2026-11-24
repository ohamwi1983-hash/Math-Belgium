import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneEcran,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatLectureGraphiqueDerivees";
import { svgLectureGraphiqueDerivees } from "./figure";
import { ecransParcourus, type EcranLectureGraphiqueDerivees } from "../../moteur5e/typesLectureGraphiqueDerivees";
import { listeAsymptotes } from "../../moteur5e/typesLectureGraphiqueLimites";
import {
  TOLERANCE_POSITION_INFLEXION,
  TOLERANCE_POSITION_TANGENTE,
  TOLERANCE_VALEUR_EXTREMUM,
} from "../../moteur5e/verificationLectureGraphiqueDerivees";
import { repartirSurQuatre } from "../etudeLocale/exportEvaluation";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeLectureGraphiqueDerivees, lettreEcranLectureGraphiqueDerivees } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./index";
import { profilLectureGraphiqueDerivees } from "../profilsEvaluationDerivees28-30";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees>` pour 5gen30 (Lecture
 * graphique — dérivées et applications) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Le graphique EST l'énoncé : dessiné ici (`svgLectureGraphiqueDerivees`) avec un quadrillage d'une
 * unité (lecture à 0,3 près annoncée), à partir des MÊMES morceaux de courbe que l'écran
 * (`construireSegmentsDerivees` : les branches sont prolongées jusqu'au bord du cadre près d'une
 * asymptote verticale, la divergence reste visible). Consigne globale qui ne révèle ni le nombre ni
 * le type d'asymptotes, ni l'existence d'extremums ou de points d'inflexion (« éventuels »). Les 6
 * écrans du générateur (`ecransParcourus` : asymptotes, tangentes horizontales, tableau de f',
 * valeurs des extremums, points d'inflexion, tableau de f'') sont les étapes du corrigé ; le corrigé
 * montre le graphique annoté (asymptotes nommées, extremums, paliers, points d'inflexion) et les deux
 * tableaux de signes (`tableauFPrimeAttendu`/`tableauFSecondeAttendu`, la source de l'écran).
 */

const LETTRES = "abcdefgh";

// ============================================================================
// Énoncé.
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (droites en pointillés orange : asymptotes de la courbe ; point plein : point de la courbe ; quadrillage d'une unité).";

function nombreTexte(v: number): string {
  return String(v).replace(".", ",");
}

const CONSIGNE_PAPIER =
  "Par lecture du graphique : nomme les éventuelles asymptotes de la courbe (verticale, horizontale ou oblique) avec leur équation ; donne l'abscisse de chaque point où la tangente est horizontale ; dresse le tableau de signes de f' et les variations de f, puis donne la valeur de chaque extremum ; donne l'abscisse de chaque point d'inflexion ; dresse le tableau de signes de f'' et la concavité de f. " +
  (TOLERANCE_POSITION_TANGENTE === TOLERANCE_VALEUR_EXTREMUM
    ? `Une lecture à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près est acceptée (à l'unité près pour les points d'inflexion : ligne verticale de la grille la plus proche).`
    : `Une lecture à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près est acceptée pour les abscisses et à ${nombreTexte(TOLERANCE_VALEUR_EXTREMUM)} près pour les valeurs (à l'unité près pour les points d'inflexion : ligne verticale de la grille la plus proche).`);

/** Consigne d'étape = celle de l'écran, sans les tournures d'interface (« coche… », « Complète… »). */
function consigneEtape(ecran: EcranLectureGraphiqueDerivees): FragmentConsigne[] {
  const t = consigneEcran(ecran)
    .replace(/S'il n'y en a aucune, coche « [^»]+ »\./, "S'il n'y en a aucune, indique-le.")
    .replace(/S'il n'y en a aucun, coche « [^»]+ »\./, "S'il n'y en a aucun, indique-le.")
    .replace("Complète le tableau", "Dresse le tableau")
    .replace("du graphique", "de la courbe");
  return [texte(t)];
}

function construireEnonceLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): SectionExercice {
  return {
    enteteFragments: [texte(LEGENDE)],
    enteteHtml: svgLectureGraphiqueDerivees(exercice, false),
    questions: ecransParcourus(exercice).map((ecran) => ({ consigne: consigneEtape(ecran) })),
  };
}

function enoncePapierLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): EnoncePapier {
  return {
    section: { enteteFragments: [texte(LEGENDE)], enteteHtml: svgLectureGraphiqueDerivees(exercice, false), questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [ecransParcourus(exercice).map((_, i) => LETTRES[i])],
  };
}

// ============================================================================
// Réponse brève, corrigé, barème.
// ============================================================================

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function reponseBreveLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): FragmentConsigne[] {
  return [
    ...joindre(formatReponseAttenduePhaseLatex(exercice, "asymptotes")),
    texte(" — "),
    ...(exercice.extrema.length > 0 ? joindre(formatReponseAttenduePhaseLatex(exercice, "extremums")) : [texte("aucun extremum")]),
    texte(" — points d'inflexion : "),
    ...joindre(formatReponseAttenduePhaseLatex(exercice, "inflexions")),
  ];
}

const POIDS_ECRAN: Record<EcranLectureGraphiqueDerivees, number> = { asymptotes: 1, zerosFPrime: 0.5, tableauFPrime: 1, extremums: 0.5, inflexions: 0.5, tableauFSeconde: 0.5 };

const CRITERE_ECRAN: Record<EcranLectureGraphiqueDerivees, string> = {
  asymptotes: "Asymptotes nommées avec leur équation (ou aucune)",
  zerosFPrime: "Abscisses des points à tangente horizontale",
  tableauFPrime: "Tableau de signes de f', variations et nature de chaque point",
  extremums: "Valeur de chaque extremum",
  inflexions: "Abscisses des points d'inflexion",
  tableauFSeconde: "Tableau de signes de f'' et concavité",
};

function baremeLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): BaremeExercice {
  const ordre = ecransParcourus(exercice);
  const points = repartirSurQuatre(ordre.map((e) => POIDS_ECRAN[e]));
  const criteres: CritereBareme[] = ordre.map((e, i) => ({ sousQuestion: LETTRES[i], critere: [texte(CRITERE_ECRAN[e])], points: points[i] }));
  const erreurs: ErreurFrequente[] = [];
  if (exercice.asymptotique.vas.length > 0) erreurs.push({ description: [texte("Asymptote verticale écrite « y = … » au lieu de « x = … »")], cout: "0 pt sur cette asymptote" });
  if (exercice.paliers.length > 0) erreurs.push({ description: [texte("Palier classé maximum ou minimum")], cout: "0 pt sur la nature de ce point" });
  erreurs.push({ description: [texte("Valeurs interdites (asymptotes verticales) oubliées dans les tableaux de signes")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveLectureGraphiqueDerivees(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte(`Lectures à ${nombreTexte(TOLERANCE_POSITION_TANGENTE)} près (abscisses, valeurs) et à ${nombreTexte(TOLERANCE_POSITION_INFLEXION)} près (points d'inflexion)`)], [texte("Asymptotes dans n'importe quel ordre")]],
  };
}

/** Niveau 1–7 : écrans de pure lecture = tangentes horizontales, valeurs des extremums, points
 * d'inflexion, et asymptotes sauf oblique (pente calculée) ; les deux tableaux de signes sont un
 * raisonnement (sens / courbure → signe). Méthode 0 (lecture imposée). Piège dans les DONNÉES : point
 * plein au bord d'une AV, branches de même signe, deux AH distinctes, aucune asymptote. */
function criteresDifficulteLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): CriteresDifficulte {
  const corrige = correctionDetailleeLectureGraphiqueDerivees(exercice);
  const L = (x: EcranLectureGraphiqueDerivees) => lettreEcranLectureGraphiqueDerivees(exercice, x);
  const { vas, infini } = exercice.asymptotique;
  const lecture = [L("zerosFPrime"), L("extremums"), L("inflexions"), ...(infini.type === "oblique" ? [] : [L("asymptotes")])].filter((x) => corrige.some((c) => c.sousQuestion === x));
  const piege =
    vas.some((va) => va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined || va.signeGauche === va.signeDroit) ||
    (infini.type === "horizontale" && infini.limitePlusInfini !== infini.limiteMoinsInfini) ||
    listeAsymptotes(exercice.asymptotique).length === 0
      ? 1
      : 0;
  // Nombres 0 : les « ≈ » sont des lectures sur un quadrillage d'une unité (points sur la grille 0,5), pas un calcul arrondi.
  return { ...etapesDuCorrige(corrige, lecture), methode: 0, piege, nombres: 0 };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): BlocCorrection[] {
  return correctionDetailleeLectureGraphiqueDerivees(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationLectureGraphiqueDerivees: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueDerivees> = {
  titreDocument: "Lecture graphique — dérivées et applications — Évaluation",
  nomFichierBase: "lecture-graphique-derivees",
  genererInstance: genererExerciceLectureGraphiqueDerivees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLectureGraphiqueDerivees,
  construireCorrection: construireCorrectionLectureGraphiqueDerivees,
  criteresDifficulte: criteresDifficulteLectureGraphiqueDerivees,
  reponseBreve: reponseBreveLectureGraphiqueDerivees,
  correctionDetaillee: correctionDetailleeLectureGraphiqueDerivees,
  bareme: baremeLectureGraphiqueDerivees,
  enoncePapier: enoncePapierLectureGraphiqueDerivees,
  profilInstance: profilLectureGraphiqueDerivees,
  // Graphique (`enteteHtml`) : pas de regroupement.
};
