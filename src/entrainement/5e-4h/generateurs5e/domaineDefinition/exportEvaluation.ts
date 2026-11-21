import type { ExerciceDomaineDefinition, Polynome } from "../../core5e/domaineDefinition.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatDomfLatex } from "../../ui5e/formatDomaineDefinition";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDomaineDefinition, lettresDomaine, piegeDomaineDefinition } from "./corrigeDetaille";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./index";
import { LIBELLE_CAS_DOMAINE_DEFINITION, profilDomaineDefinition } from "../profilsEvaluationFonctions1-2";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDefinition>` pour 5gen1 (domaine de
 * définition) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Détermine son domaine de définition ». Les
 * écrans du générateur (conditions d'existence, résolution — seulement pour √N/D et la fraction sous
 * racine —, domaine) passent dans le corrigé « Étape n — consigne », avec CHAQUE condition résolue
 * puis l'intersection.
 *
 * Valeurs : les champs de l'instance (`slots`, `resolution…`, `domf`, `grille`) et les formateurs de
 * l'écran (`formatSlotConditionLatex`, `formatEnsembleReelLatex`, `formatDomfLatex`,
 * `formatValeurLatex`) — les racines d'un radicande du 2e degré sont relues sur `coeffs` (Δ et
 * racines exactes, entières ou rationnelles par construction), jamais une autre résolution.
 *
 * Aucune prose en mode math : « Aucune CE » et « et » sont écrits en texte (l'ancien
 * `formatCEAttendueLatex` n'est plus utilisé ici).
 */

// ============================================================================
// Outils : polynômes (coefficients par degré croissant), étapes.
// ============================================================================

function degre(p: Polynome): number {
  let d = p.length - 1;
  while (d > 0 && Math.abs(p[d]) < 1e-12) d--;
  return d;
}


// ============================================================================
// Énoncés.
// ============================================================================

function entete(exercice: ExerciceDomaineDefinition): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(exercice.fLatex), texte(".")];
}

const CONSIGNE_CE = "Écris la ou les conditions d'existence de f(x) (sans les résoudre).";
const CONSIGNE_DOMAINE = "Exprime le domaine de définition de f en notation ensembliste.";

function consigneResolution(exercice: ExerciceDomaineDefinition): string {
  return exercice.famille === "fractionSousRacine"
    ? "Résous la condition d'existence à l'aide d'un tableau de signes."
    : "Résous chacune des deux conditions d'existence.";
}

function construireEnonceDomaineDefinition(exercice: ExerciceDomaineDefinition): SectionExercice {
  const l = lettresDomaine(exercice);
  return {
    enteteFragments: entete(exercice),
    questions: [
      { consigne: [texte(CONSIGNE_CE)] },
      ...(l.resolution ? [{ consigne: [texte(consigneResolution(exercice))] }] : []),
      { consigne: [texte(CONSIGNE_DOMAINE)] },
    ],
  };
}

function enoncePapierDomaineDefinition(exercice: ExerciceDomaineDefinition): EnoncePapier {
  return { section: { enteteFragments: [...entete(exercice), texte(" Détermine son domaine de définition, en justifiant.")], questions: [] } };
}

function reponseBreveDomaineDefinition(exercice: ExerciceDomaineDefinition): FragmentConsigne[] {
  return [latex(formatDomfLatex(exercice.domf))];
}

// ============================================================================
// Barème, difficulté.
// ============================================================================

function baremeDomaineDefinition(exercice: ExerciceDomaineDefinition): BaremeExercice {
  const l = lettresDomaine(exercice);
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  let criteres: CritereBareme[];
  if (exercice.famille === "pasDeCE") {
    criteres = [c(l.ce, "Aucune condition d'existence, justifiée (racine d'indice impair ou valeur absolue)", 2), c(l.domaine, "Domaine ℝ", 2)];
  } else if (exercice.aucuneCE) {
    criteres = [c(l.ce, "Condition d'existence écrite", 1), c(l.resolution ?? l.domaine, "Condition toujours vraie justifiée (aucune valeur exclue)", 2), c(l.domaine, "Domaine ℝ", 1)];
  } else if (exercice.famille === "fractionSousRacine") {
    criteres = [c(l.ce, "Les deux conditions (quotient ≥ 0 et dénominateur ≠ 0)", 1), c("b", "Tableau de signes correct", 1.5), c(l.domaine, "Domaine : bornes du dénominateur exclues, celles du numérateur incluses", 1.5)];
  } else if (exercice.famille === "racineSurFraction" && exercice.structure === "racineSurD") {
    criteres = [
      c(l.ce, "Les deux conditions d'existence", 1),
      c("b", "Radicande résolu", 1),
      c("b", "Valeur exclue par le dénominateur", 0.5),
      c(l.domaine, "Intersection et notation ensembliste", 1.5),
    ];
  } else {
    criteres = [c(l.ce, "Condition d'existence correcte (bon symbole)", 1), c(l.domaine, "Condition résolue", 2), c(l.domaine, "Domaine en notation ensembliste", 1)];
  }
  return {
    reponseFinale: reponseBreveDomaineDefinition(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piegeDomaineDefinition(exercice))], cout: "−1" },
      ...(exercice.famille === "pasDeCE" ? [] : [{ description: [texte("Domaine juste sans aucune condition écrite")], cout: "0 pt sur les conditions" }]),
    ],
    reponsesAcceptees: [
      [texte("Toute écriture équivalente du domaine (réunion d'intervalles ou ℝ privé de valeurs)")],
      ...(exercice.aucuneCE && exercice.famille !== "pasDeCE" ? [[texte("« Aucune condition d'existence », ou la condition écrite puis reconnue toujours vraie")]] : []),
    ],
  };
}

/** Critères du niveau (grille commune, `export/niveauDifficulte.ts`), jugés sur l'énoncé PAPIER
 * (la fonction + « Détermine son domaine de définition ») :
 * - écrans : tous transforment (poser les conditions est une décision ; résoudre ; intersecter),
 *   sauf le domaine de « pas de CE » (ℝ se lit sur l'étape précédente : lecture) ;
 * - méthode 1 dès qu'il faut choisir une technique de signe (trinôme, tableau de signes) ou combiner
 *   deux conditions, 0 sinon ;
 * - piège (données) : coefficient de x négatif dans un radicande du 1er degré (sens changé), racine
 *   au dénominateur (condition stricte), valeur exclue DANS l'intervalle du radicande, racine
 *   d'indice impair (rien à poser sous elle), fraction sous racine (zéros du dénominateur exclus,
 *   du numérateur inclus) ; « pas de CE » et « condition toujours vraie » sont des cas
 *   particuliers (raccourcis), pas des pièges ;
 * - nombres 0 (valeurs exactes). */
function criteresDifficulteDomaineDefinition(exercice: ExerciceDomaineDefinition): CriteresDifficulte {
  const l = lettresDomaine(exercice);
  const etapes = etapesDuCorrige(correctionDetailleeDomaineDefinition(exercice), exercice.famille === "pasDeCE" ? [l.domaine] : []);
  const quadratique = exercice.famille !== "pasDeCE" && exercice.famille !== "fractionSousRacine" && exercice.slots.some((s) => s.symboleAttendu !== "≠" && degre(s.coeffs) === 2);
  const methode: 0 | 1 = exercice.famille === "fractionSousRacine" || quadratique || l.resolution !== null ? 1 : 0;
  let piege: 0 | 1 = 0;
  if (exercice.famille === "racineImpaireDenominateur" || exercice.famille === "fractionSousRacine") piege = 1;
  else if (exercice.famille === "racineSurFraction" && (exercice.structure === "nSurRacineD" || exercice.exclusionDansIntervalle)) piege = 1;
  if (exercice.famille !== "pasDeCE" && exercice.slots.some((s) => s.symboleAttendu !== "≠" && degre(s.coeffs) === 1 && (s.coeffs[1] ?? 0) < 0)) piege = 1;
  if (exercice.famille === "fractionSousRacine" && exercice.aucuneCE) piege = 0;
  return { ...etapes, methode, piege, nombres: 0 };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDomaineDefinition(exercice: ExerciceDomaineDefinition): BlocCorrection[] {
  return correctionDetailleeDomaineDefinition(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDomaineDefinition: AdaptateurFeuilleExercices<ExerciceDomaineDefinition> = {
  titreDocument: "Domaine de définition — Évaluation",
  nomFichierBase: "domaine-definition",
  genererInstance: genererExerciceDomaineDefinition,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceDomaineDefinition,
  construireCorrection: construireCorrectionDomaineDefinition,
  criteresDifficulte: criteresDifficulteDomaineDefinition,
  reponseBreve: reponseBreveDomaineDefinition,
  correctionDetaillee: correctionDetailleeDomaineDefinition,
  bareme: baremeDomaineDefinition,
  enoncePapier: enoncePapierDomaineDefinition,
  profilInstance: profilDomaineDefinition,
  libelleCasParticulier: LIBELLE_CAS_DOMAINE_DEFINITION,
};
