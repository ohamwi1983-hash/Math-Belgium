import type { ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogC } from "../../core6e/etudeFonctionLogarithme.types";
import type {
  AdaptateurFeuilleExercices, EnoncePapier,
  BaremeExercice,
  BlocCorrection,
  EtapeCorrection,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { construireSvgFonction } from "../../../export/svgGraph";
import {
  aideAsymptotesNiveau1,
  aideConcaviteNiveau1,
  aideConcaviteNiveau2,
  aideCroissanceNiveau1,
  aideCroissanceNiveau2,
  aideDomaineNiveau1,
  aideDomaineNiveau2,
  aideGraphiqueNiveau1,
  aideLimitesNiveau1,
  aideLimitesNiveau2,
  type AideAvecLatex,
  calculerViewBox,
  consigneAsymptotes,
  consigneConcavite,
  consigneCroissance,
  consigneDomaine,
  consigneGraphique,
  consigneLimites,
  contenuRecapLatex,
  evaluerCandidat,
  formatFonctionLatex,
  intervallesGrilleCLatex,
  LIBELLE_PHASE_ETUDE_LOG,
} from "../../ui6e/formatEtudeFonctionLogarithme";
import type { PhaseEtudeFonctionLogarithme } from "../../moteur6e/typesEtudeFonctionLogarithme";
import { termeConstanteLatex, trinomeLatex } from "./familles/latex";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionLogarithme } from "./index";
import { profilEtudeFonctionLogarithme, LIBELLE_CAS_ETUDE_LOG } from "../profilsEvaluationLogarithmes";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme>` pour `6gen21` (Étudier
 * une fonction — synthèse, logarithmes) — feuille d'évaluation. Une question par écran interactif
 * (6 pour les 5 familles) ; chaque réponse du corrigé vient de `contenuRecapLatex`, la même
 * fonction que la réponse révélée et le récapitulatif de l'appli. Le corrigé de la croissance et
 * de la concavité donne aussi la dérivée utilisée (démarche), jamais seulement la conclusion.
 *
 * Famille C, écran "croissance" : vrai tableau de signe à 4 colonnes (`type: "tableau"`).
 */

const LETTRES_GRAPHIQUE = "ABCD";

function construireGrilleSvgCandidats(exercice: ExerciceEtudeFonctionLogarithme, indexCorrectAAfficher?: number): string {
  const viewBox = calculerViewBox(exercice);
  const svgs = exercice.candidats
    .map((_, i) =>
      construireSvgFonction((x) => evaluerCandidat(exercice, i, x), viewBox, {
        lettre: LETTRES_GRAPHIQUE[i] ?? String(i + 1),
        estCorrect: indexCorrectAAfficher === i,
      }),
    )
    .join("");
  return `<div class="grille-graphes-cyclo">${svgs}</div>`;
}

function paragrapheReponse(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG[phase]} : `), latex(contenuRecapLatex(exercice, phase))] };
}

function paragrapheDemarche(fragmentsTexte: string, expression: string | null): BlocCorrection[] {
  if (expression === null) return [];
  return [{ type: "paragraphe", fragments: [texte(`${fragmentsTexte} `), latex(expression)] }];
}

/** Corrigé de l'écran "croissance", famille C — tableau de variation à 4 intervalles. */
function construireCorrectionCroissanceGrilleC(exercice: ExerciceEtudeLogC): BlocCorrection[] {
  const labelsIntervalles = intervallesGrilleCLatex(exercice).map((l) => l.replace(/\\,/g, " ").replace(/\\infty/g, "∞"));
  const labelsVariation = exercice.croissance.signes.map((s) => (s === "croissante" ? "Croissante" : "Décroissante"));
  return [
    { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], valeursParLigne: [labelsIntervalles, labelsVariation] },
    paragrapheReponse(exercice, "croissance"),
  ];
}

function construireEnonceEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): SectionExercice {
  const enteteFragments: FragmentConsigne[] = [texte("On considère la fonction suivante : "), latex(formatFonctionLatex(exercice))];
  const questions: QuestionExercice[] = [
    { consigne: consigneDomaine(exercice), reponse: { type: "lignes", nombre: 2 } },
    { consigne: consigneLimites(exercice), reponse: { type: "lignes", nombre: exercice.famille === "C" ? 6 : 2 } },
    { consigne: consigneAsymptotes(exercice), reponse: { type: "lignes", nombre: 2 } },
    exercice.famille === "C"
      ? { consigne: consigneCroissance(exercice), reponse: { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], nombreColonnes: 4 } }
      : { consigne: consigneCroissance(exercice), reponse: { type: "lignes", nombre: 3 } },
    { consigne: consigneConcavite(), reponse: { type: "lignes", nombre: 3 } },
    { consigne: consigneGraphique(), reponse: { type: "lignes", nombre: 1 } },
  ];
  return { enteteFragments, enteteHtml: construireGrilleSvgCandidats(exercice), questions };
}

function construireCorrectionEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): BlocCorrection[] {
  const blocs: BlocCorrection[] = [paragrapheReponse(exercice, "domaine"), paragrapheReponse(exercice, "limites"), paragrapheReponse(exercice, "asymptotes")];

  const derivee = aideCroissanceNiveau2(exercice);
  if (exercice.famille === "C") {
    blocs.push(...construireCorrectionCroissanceGrilleC(exercice));
  } else {
    blocs.push(...paragrapheDemarche("Démarche :", derivee.latex), paragrapheReponse(exercice, "croissance"));
  }

  blocs.push(...paragrapheDemarche("Démarche :", aideConcaviteNiveau2(exercice).latex), paragrapheReponse(exercice, "concavite"));

  const lettreCorrecte = LETTRES_GRAPHIQUE[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.graphique} : le graphique ${lettreCorrecte}.`)] });
  blocs.push({ type: "html", html: construireGrilleSvgCandidats(exercice, exercice.indexCorrect) });

  return blocs;
}

// ============================================================================
// Feuille d'exercices / évaluation enrichies — difficulté, réponse brève, corrigé détaillé, barème,
// Chaque réponse vient de `contenuRecapLatex` (celle de l'appli) ; chaque méthode
// des aides de niveau 1, chaque calcul intermédiaire des aides de niveau 2 (jamais leur texte, qui
// s'adresse à l'élève en cours de résolution).
// ============================================================================

const PHASES: PhaseEtudeFonctionLogarithme[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];
const LETTRE_SOUS_QUESTION: Record<PhaseEtudeFonctionLogarithme, string> = { domaine: "a", limites: "b", asymptotes: "c", croissance: "d", concavite: "e", graphique: "f" };

function fragmentsAide(aide: AideAvecLatex): FragmentConsigne[] {
  return aide.latex === null ? [texte(aide.texte)] : [texte(`${aide.texte} `), latex(aide.latex)];
}

/** f'(x) de la famille C — (m·ln|u|)' = m·u'/u, u = (x−p)² − q². */
function deriveeCLatex(exercice: ExerciceEtudeLogC): string {
  return `f'(x) = \\dfrac{${2 * exercice.m}\\left(x${termeConstanteLatex(-exercice.p)}\\right)}{${trinomeLatex(-2 * exercice.p, exercice.p * exercice.p - exercice.q * exercice.q)}}`;
}

function aideMethode(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): AideAvecLatex {
  switch (phase) {
    case "domaine":
      return aideDomaineNiveau1(exercice);
    case "limites":
      return aideLimitesNiveau1(exercice);
    case "asymptotes":
      return aideAsymptotesNiveau1(exercice);
    case "croissance":
      return aideCroissanceNiveau1(exercice);
    case "concavite":
      return aideConcaviteNiveau1(exercice);
    case "graphique":
      return aideGraphiqueNiveau1(exercice);
  }
}

/** Calcul intermédiaire (LaTeX) d'un écran, ou `null` s'il n'y en a pas. */
function calculIntermediaire(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): string | null {
  switch (phase) {
    case "domaine":
      return aideDomaineNiveau2(exercice).latex;
    case "limites":
      return aideLimitesNiveau2(exercice).latex;
    case "croissance":
      return exercice.famille === "C" ? deriveeCLatex(exercice) : aideCroissanceNiveau2(exercice).latex;
    case "concavite":
      return aideConcaviteNiveau2(exercice).latex;
    default:
      return null;
  }
}

const PIEGE: Record<ExerciceEtudeFonctionLogarithme["famille"], { phase: PhaseEtudeFonctionLogarithme; texte: string; cout: string }> = {
  A: { phase: "limites", texte: "En +∞, ln(x)/x tend vers 0 (croissances comparées) : ne pas conclure à +∞.", cout: "−1" },
  B: { phase: "asymptotes", texte: "La limite en 0⁺ est finie et 0 est une borne finie du domaine : x = 0 n'est PAS une asymptote.", cout: "−1" },
  C: { phase: "domaine", texte: "ln|u| n'exige que u ≠ 0 : on exclut seulement les deux zéros du trinôme, pas tout l'intervalle où il est négatif.", cout: "−1" },
  D: { phase: "asymptotes", texte: "Des limites infinies en ±∞ ne donnent ni asymptote verticale ni asymptote horizontale (domaine ℝ).", cout: "−1" },
  E: { phase: "limites", texte: "En 0⁺, ln(x) + c/x est une forme indéterminée : il faut la lever (même dénominateur) avant de conclure.", cout: "−1" },
};

const POIDS: Record<PhaseEtudeFonctionLogarithme, number> = { domaine: 1, limites: 2, asymptotes: 1, croissance: 2, concavite: 1, graphique: 1 };

function difficulteEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): 1 | 2 | 3 {
  return exercice.famille === "B" || exercice.famille === "C" ? 3 : 2;
}

function reponseBreveEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): FragmentConsigne[] {
  return PHASES.flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRE_SOUS_QUESTION[phase]}) `), latex(contenuRecapLatex(exercice, phase))]);
}

function correctionDetailleeEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): EtapeCorrection[] {
  const piege = PIEGE[exercice.famille];
  return PHASES.flatMap((phase) => {
    const sousQuestion = LETTRE_SOUS_QUESTION[phase];
    const etapes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: fragmentsAide(aideMethode(exercice, phase)) }];
    const calcul = calculIntermediaire(exercice, phase);
    if (calcul !== null) etapes.push({ label: "Calcul", sousQuestion, fragments: [latex(calcul)] });
    if (piege.phase === phase) etapes.push({ label: "Piège", sousQuestion, fragments: [texte(piege.texte)] });
    etapes.push({
      label: "Conclusion",
      sousQuestion,
      fragments: [latex(contenuRecapLatex(exercice, phase))],
      // Choix du graphique : les candidats, le bon mis en évidence (comme dans l'ancien corrigé).
      figureHtml: phase === "graphique" ? construireGrilleSvgCandidats(exercice, exercice.indexCorrect) : undefined,
    });
    return etapes;
  });
}

function baremeEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): BaremeExercice {
  const piege = PIEGE[exercice.famille];
  return {
    reponseFinale: reponseBreveEtudeFonctionLogarithme(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Domaine correct, conditions d'existence écrites")], points: POIDS.domaine },
      { sousQuestion: "b", critere: [texte("Toutes les limites aux bornes du domaine (la moitié des points si une limite manque ou est fausse)")], points: POIDS.limites },
      { sousQuestion: "c", critere: [texte("Asymptotes déduites des limites (et seulement elles)")], points: POIDS.asymptotes },
      { sousQuestion: "d", critere: [texte("f'(x) correcte")], points: 1 },
      { sousQuestion: "d", critere: [texte("Signe de f', variations et extremum")], points: POIDS.croissance - 1 },
      { sousQuestion: "e", critere: [texte("Signe de f'' : concavité et points d'inflexion")], points: POIDS.concavite },
      { sousQuestion: "f", critere: [texte("Graphique choisi, cohérent avec l'étude")], points: POIDS.graphique },
    ],
    erreursFrequentes: [
      { description: [texte(piege.texte)], cout: piege.cout },
      { description: [texte("Inverser croissance et décroissance en oubliant le signe du coefficient devant le logarithme")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Positions exactes (puissances de e, fractions) ou valeurs approchées au centième si la forme exacte est donnée")], [texte("Domaine écrit en intervalles ou en notation d'ensemble")]],
  };
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
const LIBELLE_PAPIER: Record<PhaseEtudeFonctionLogarithme, string> = {
  domaine: "Domaine : ",
  limites: "Limites : ",
  asymptotes: "Asymptotes : ",
  croissance: "Variations : ",
  concavite: "Concavité : ",
  graphique: "",
};

function enoncePapierEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): EnoncePapier {
  const { enteteFragments, enteteHtml } = construireEnonceEtudeFonctionLogarithme(exercice);
  return {
    section: {
      enteteFragments,
      enteteHtml,
      questions: [
        {
          consigne: [
            texte(
              "Étudie la fonction f : domaine de définition, limites aux bornes du domaine, asymptotes, variations et extremums, concavité et points d'inflexion (valeurs exactes ou arrondies au centième). Indique ensuite lequel des graphiques A à D représente f, et justifie.",
            ),
          ],
        },
      ],
    },
    etapesParQuestion: [PHASES.map((phase) => LETTRE_SOUS_QUESTION[phase])],
    reponseBreve: PHASES.flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LIBELLE_PAPIER[phase]}`), latex(contenuRecapLatex(exercice, phase))]),
  };
}

export const adaptateurEvaluationEtudeFonctionLogarithme: AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme> = {
  profilInstance: profilEtudeFonctionLogarithme,
  libelleCasParticulier: LIBELLE_CAS_ETUDE_LOG,
  titreDocument: "Étudier une fonction (synthèse, logarithmes) — Évaluation",
  nomFichierBase: "etude-fonction-logarithme",
  genererInstance: genererExerciceEtudeFonctionLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEtudeFonctionLogarithme,
  construireCorrection: construireCorrectionEtudeFonctionLogarithme,
  difficulte: difficulteEtudeFonctionLogarithme,
  reponseBreve: reponseBreveEtudeFonctionLogarithme,
  correctionDetaillee: correctionDetailleeEtudeFonctionLogarithme,
  bareme: baremeEtudeFonctionLogarithme,
  enoncePapier: enoncePapierEtudeFonctionLogarithme,
  dureeMinutes: 25,
};
