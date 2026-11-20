import type { ExerciceEtudeFonctionExponentielle } from "../../core6e/etudeFonctionExponentielle.types";
import { profilEtudeFonctionExponentielle } from "../profilsEvaluationExponentielles";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { construireGrilleSvgCandidatsEtudeExpo } from "../../export6e/svgGraphEtudeExpo";
import type { PhaseEtudeFonctionExponentielle } from "../../moteur6e/typesEtudeFonctionExponentielle";
import {
  calculerViewBox,
  consigneAsymptotes,
  consigneAsymptotesB,
  consigneConcavite,
  consigneCroissance,
  consigneDomaine,
  consigneGraphique,
  consigneLimites,
  contenuRecapPhase,
  formatFonctionLatex,
  LIBELLE_PHASE_ETUDE,
} from "../../ui6e/formatEtudeFonctionExponentielle";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionExponentielle } from "./index";
import { correctionDetailleeEtudeFonctionExpo, ORDRE_PHASES_ETUDE_EXPO } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeFonctionExponentielle>` pour `6gen11` (Étude
 * complète d'une fonction exponentielle) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : les 6 écrans guidés (domaine, limites, asymptotes, croissance, concavité,
 * graphique — séquence FIXE) = les étapes du corrigé ; l'énoncé PAPIER (`enoncePapier`) donne f, les
 * quatre graphiques candidats (`svgGraphEtudeExpo.ts`) et une consigne globale. Corrigé détaillé
 * « comme au tableau » : `corrigeDetaille.ts` (source unique, partagée avec `App6gen11.tsx`) ;
 * résultats = `contenuRecapPhase` (ceux de l'appli).
 */

const LETTRES = "abcdef";

function consigneEcrite(e: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): FragmentConsigne[] {
  switch (phase) {
    case "domaine":
      return consigneDomaine();
    case "limites":
      return consigneLimites(e);
    case "asymptotes":
      return e.famille === "B" ? consigneAsymptotesB(e.p) : consigneAsymptotes(e);
    case "croissance":
      return consigneCroissance();
    case "concavite":
      return consigneConcavite();
    case "graphique":
      return consigneGraphique();
  }
}

function enteteFragments(e: ExerciceEtudeFonctionExponentielle): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatFonctionLatex(e)), texte(".")];
}

function construireEnonce(e: ExerciceEtudeFonctionExponentielle): SectionExercice {
  return {
    enteteFragments: enteteFragments(e),
    enteteHtml: construireGrilleSvgCandidatsEtudeExpo(e, calculerViewBox(e)),
    questions: ORDRE_PHASES_ETUDE_EXPO.map((phase) => ({ consigne: consigneEcrite(e, phase) })),
  };
}

function fragmentsRecap(e: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): FragmentConsigne[] {
  const { texte: t, latex: l } = contenuRecapPhase(e, phase);
  return l !== null ? [latex(l)] : [texte(t ?? "")];
}

function construireCorrection(e: ExerciceEtudeFonctionExponentielle): BlocCorrection[] {
  return [
    ...ORDRE_PHASES_ETUDE_EXPO.map((phase): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE[phase]} : `), ...fragmentsRecap(e, phase)] })),
    { type: "html", html: construireGrilleSvgCandidatsEtudeExpo(e, calculerViewBox(e), e.indexCorrect) },
  ];
}

function reponseBreve(e: ExerciceEtudeFonctionExponentielle): FragmentConsigne[] {
  return ORDRE_PHASES_ETUDE_EXPO.flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...fragmentsRecap(e, phase)]);
}

/**
 * Niveau (grille commune), jugé sur l'énoncé PAPIER (fonction donnée → méthode au plus 1) :
 * écran de pure lecture = f (choisir le graphique qui correspond aux conclusions) ; méthode 1 pour
 * B (exposant fractionnaire, deux côtés du point exclu) et C (asymptote oblique, forme ∞ − ∞), 0
 * sinon ; piège dans les DONNÉES : A coefficient de x négatif (asymptote en +∞), B asymptote
 * verticale d'un seul côté, C forme ∞ − ∞, D forme 0 × ∞ en −∞ ; nombres : C (ln 2, ln 3, ln 5).
 */
function criteresDifficulte(e: ExerciceEtudeFonctionExponentielle): CriteresDifficulte {
  const methode: 0 | 1 = e.famille === "B" || e.famille === "C" ? 1 : 0;
  const piege: 0 | 1 = e.famille === "A" ? (e.m < 0 ? 1 : 0) : 1;
  return { ...etapesDuCorrige(correctionDetailleeEtudeFonctionExpo(e), ["f"]), methode, piege, nombres: e.famille === "C" ? 1 : 0 };
}

const POIDS: Record<PhaseEtudeFonctionExponentielle, number> = { domaine: 0.5, limites: 1, asymptotes: 0.5, croissance: 1, concavite: 0.5, graphique: 0.5 };

function bareme(e: ExerciceEtudeFonctionExponentielle): BaremeExercice {
  const piege: Record<ExerciceEtudeFonctionExponentielle["famille"], string> = {
    A: "Asymptote placée du mauvais côté (signe du coefficient de x ignoré)",
    B: "Asymptote verticale annoncée des deux côtés du point exclu",
    C: "Forme ∞ − ∞ en +∞ tranchée sans la lever, ou asymptote oblique oubliée",
    D: "Limite −∞ annoncée en −∞ (la croissance comparée donne 0)",
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: ORDRE_PHASES_ETUDE_EXPO.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: [texte(`${LIBELLE_PHASE_ETUDE[phase]} : `), ...fragmentsRecap(e, phase)], points: POIDS[phase] })),
    erreursFrequentes: [
      { description: [texte(piege[e.famille])], cout: "−1" },
      { description: [texte("Dérivée fausse (oubli du facteur u′ dans la dérivée de l'exponentielle)")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Positions écrites en fraction ou en décimal ; coefficients en ln écrits exactement")]],
  };
}

function enoncePapier(e: ExerciceEtudeFonctionExponentielle): EnoncePapier {
  return {
    section: {
      enteteFragments: enteteFragments(e),
      enteteHtml: construireGrilleSvgCandidatsEtudeExpo(e, calculerViewBox(e)),
      questions: [
        {
          consigne: [
            texte(
              "Étudie la fonction f : domaine de définition, limites aux bornes du domaine, asymptotes, variations et extremum, concavité et point d'inflexion. Indique ensuite lequel des graphiques A à D représente f, et justifie.",
            ),
          ],
        },
      ],
    },
    etapesParQuestion: [ORDRE_PHASES_ETUDE_EXPO.map((_, i) => LETTRES[i]!)],
    reponseBreve: ORDRE_PHASES_ETUDE_EXPO.flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LIBELLE_PHASE_ETUDE[phase]} : `), ...fragmentsRecap(e, phase)]),
  };
}

export const adaptateurEvaluationEtudeFonctionExponentielle: AdaptateurFeuilleExercices<ExerciceEtudeFonctionExponentielle> = {
  profilInstance: profilEtudeFonctionExponentielle,
  titreDocument: "Étude complète d'une fonction exponentielle — Évaluation",
  nomFichierBase: "etude-fonction-exponentielle",
  genererInstance: genererExerciceEtudeFonctionExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEtudeFonctionExpo,
  bareme,
  enoncePapier,
};
