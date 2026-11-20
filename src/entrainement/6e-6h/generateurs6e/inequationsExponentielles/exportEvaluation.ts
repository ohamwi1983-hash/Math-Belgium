import type { ExerciceInequationExponentielle } from "../../core6e/inequationsExponentielles.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { versionPapier } from "../../../export/consignePapier";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { PhaseInequationExponentielle } from "../../moteur6e/typesInequationsExponentielles";
import { CONSIGNE_GENERALE, LIBELLE_PHASE_INEQ, consigneEcran, contenuRecapPhase, formatEnonceLatex } from "../../ui6e/formatInequationsExponentielles";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationExponentielle } from "./index";
import { correctionDetailleeInequationsExpo, phasesInequationExpo } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequationExponentielle>` pour `6gen10` (Résoudre
 * une inéquation exponentielle) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par écran réellement traversé (`phasesInequationExpo`, mêmes
 * consignes que l'appli) — ce sont les étapes du corrigé ; l'énoncé PAPIER (`enoncePapier`) n'a que
 * l'inéquation et la consigne globale. Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts`
 * (source unique, partagée avec `App6gen10.tsx`). Résultats : `contenuRecapPhase` (ceux de l'appli).
 */

function fragmentsRecap(e: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle): FragmentConsigne[] {
  const { texte: t, latex: l } = contenuRecapPhase(e, phase);
  return l !== null ? [latex(l)] : [texte(t ?? "")];
}

function construireEnonce(e: ExerciceInequationExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(e))],
    questions: phasesInequationExpo(e).map((phase) => ({ consigne: consigneEcran(phase, e) })),
  };
}

function construireCorrection(e: ExerciceInequationExponentielle): BlocCorrection[] {
  return phasesInequationExpo(e).map((phase) => ({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_INEQ[phase]} : `), ...fragmentsRecap(e, phase)] }));
}

/** Ensemble des solutions final (réponse du dernier écran). */
function solutionFinale(e: ExerciceInequationExponentielle): string {
  switch (e.famille) {
    case "A":
    case "E":
      return formatEnsembleReelLatex(e.solutionEcran2);
    case "B":
      return "\\varnothing";
    case "C":
      return "\\mathbb{R}";
    case "D":
      return formatEnsembleReelLatex(e.sousType === "constant" ? e.solutionEcran2 : e.solutionEcran3);
  }
}

function reponseBreve(e: ExerciceInequationExponentielle): FragmentConsigne[] {
  return [latex(`S=${solutionFinale(e)}`)];
}

/**
 * Niveau (grille commune, `export/niveauDifficulte.ts`), jugé sur l'énoncé PAPIER (« Résous
 * l'inéquation ») : aucun écran de pure lecture ; méthode 0 quand elle est imposée (même base, ou
 * positivité d'une puissance), 1 quand il faut la choisir (regrouper deux bases, étudier un signe,
 * diviser par un facteur de signe connu) ; piège dans les DONNÉES : base (ou rapport) entre 0 et 1,
 * premier facteur négatif, facteur positif avant son zéro. Inéquation « toujours vraie / toujours
 * fausse » = cas particulier (décision de l'utilisateur) : pas de piège pour B et C-f. Nombres
 * exacts partout.
 */
function criteresDifficulte(e: ExerciceInequationExponentielle): CriteresDifficulte {
  let methode: 0 | 1 = 1;
  let piege: 0 | 1 = 0;
  switch (e.famille) {
    case "A":
      methode = 0;
      piege = e.baseSuperieureA1 ? 0 : 1;
      break;
    case "B":
      methode = 0;
      break;
    case "C":
      piege = e.sousType === "k" ? 1 : 0;
      break;
    case "D":
      piege = e.sousType === "constant" ? (e.premierFacteur.positif ? 0 : 1) : e.sens1 === "positif_puis_negatif" || e.sens2 === "positif_puis_negatif" ? 1 : 0;
      break;
    case "E":
      piege = e.ratioSuperieurA1 ? 0 : 1;
      break;
  }
  return { ...etapesDuCorrige(correctionDetailleeInequationsExpo(e)), methode, piege, nombres: 0 };
}

const LETTRES = "abcdefgh";

function bareme(e: ExerciceInequationExponentielle): BaremeExercice {
  const phases = phasesInequationExpo(e);
  const poids = phases.length === 1 ? [4] : phases.length === 2 ? [1, 3] : [1, 1, 2];
  const erreurs: ErreurFrequente[] = [];
  if ((e.famille === "A" && !e.baseSuperieureA1) || (e.famille === "E" && !e.ratioSuperieurA1) || (e.famille === "C" && e.sousType === "k")) erreurs.push({ description: [texte("Sens non inversé alors que la base (ou le rapport des bases) est comprise entre 0 et 1")], cout: "−1" });
  if (e.famille === "D" && e.sousType === "constant" && !e.premierFacteur.positif) erreurs.push({ description: [texte("Sens non inversé en divisant par le premier facteur, toujours négatif")], cout: "−1" });
  if (e.famille === "B") erreurs.push({ description: [texte("Passage au logarithme d'un nombre négatif")], cout: "−2" });
  if (e.famille === "D" && e.sousType === "variable") erreurs.push({ description: [texte("Crochets faux aux zéros (inégalité large : fermés ; stricte : ouverts)")], cout: "−0,5" });
  erreurs.push({ description: [texte("Crochet fermé du côté de ±∞")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: [texte(`${LIBELLE_PHASE_INEQ[phase]} : `), ...fragmentsRecap(e, phase)], points: poids[i]! })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Solution écrite sous forme d'inégalité (ex. "), latex("x>3"), texte(")")]],
  };
}

function enoncePapier(e: ExerciceInequationExponentielle): EnoncePapier {
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(e)), texte(".")], questions: [] } };
}

export const adaptateurEvaluationInequationsExponentielles: AdaptateurFeuilleExercices<ExerciceInequationExponentielle> = versionPapier({
  titreDocument: "Résoudre une inéquation exponentielle — Évaluation",
  nomFichierBase: "inequations-exponentielles",
  genererInstance: genererExerciceInequationExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeInequationsExpo,
  bareme,
  enoncePapier,
});
