import type { ExerciceSignesProduit } from "../../core/signesProduit.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceSignesProduitLatex } from "../../ui/formatSignesProduit";
import { formatSolutionEnsembleProduitLatex } from "../../ui/formatSolutionEnsembleProduit";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSignesProduit, type VarianteSignesProduitId } from "./index";
import { consigneEcranSignesProduit, correctionDetailleeSignesProduit, ecransSignesProduit, lettresLectureSignesProduit } from "./corrigeDetaille";
import { profilSignesProduit } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSignesProduit>` pour gen5 (signe d'un produit de
 * plusieurs facteurs) — méthode des feuilles : `.claude/rules/feuilles-evaluations.md`.
 *
 * Énoncé papier (`enoncePapier`) : l'inéquation et la consigne globale de l'appli (« Résous cette
 * inéquation en étudiant le signe de chacun de ses facteurs »), sans sous-question. Les écrans de
 * l'appli (`ecransSignesProduit` : par facteur, puis tableau de signes et ensemble-solution) sont
 * les étapes du corrigé, une lettre par écran. Corrigé détaillé « comme au tableau » :
 * `corrigeDetaille.ts` (partagé avec l'appli).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const CONSIGNE_GLOBALE = "Résous l'inéquation suivante en étudiant le signe de chacun de ses facteurs : ";

function construireEnonceSignesProduit(exercice: ExerciceSignesProduit): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GLOBALE), latex(formatEnonceSignesProduitLatex(exercice))],
    questions: ecransSignesProduit(exercice).map((ecran) => ({ consigne: consigneEcranSignesProduit(exercice, ecran) })),
  };
}

function enoncePapierSignesProduit(exercice: ExerciceSignesProduit): EnoncePapier {
  return { section: { enteteFragments: [texte(CONSIGNE_GLOBALE), latex(formatEnonceSignesProduitLatex(exercice)), texte(".")], questions: [] } };
}

/** Ancien corrigé (paragraphes) — les résultats du corrigé détaillé, une seule source. */
function construireCorrectionSignesProduit(exercice: ExerciceSignesProduit): BlocCorrection[] {
  return correctionDetailleeSignesProduit(exercice)
    .filter((l) => l.type === "resultat")
    .map((l): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreveSignesProduit(exercice: ExerciceSignesProduit): FragmentConsigne[] {
  return [latex(`S = ${formatSolutionEnsembleProduitLatex(exercice.solution)}`)];
}

/**
 * Niveau (grille commune) : un écran = une étape ; signe d’un facteur sans racine, réduction et racines
 * lues sur une forme factorisée = lectures (le choix de la méthode et la factorisation après Δ sont des
 * étapes depuis le lot E de l'audit 4e ch. 2). Méthode 1 dès qu'un facteur du second degré est à traiter (choisir
 * la technique de factorisation), 0 avec des facteurs du premier degré seuls. Piège dans les données :
 * racine double (pas de changement de signe) ou facteur du premier degré à coefficient négatif.
 */
function criteresSignesProduit(exercice: ExerciceSignesProduit): CriteresDifficulte {
  const quadratique = exercice.facteurs.some((f) => f.type !== "lineaire");
  const carre = exercice.facteurs.some((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1]);
  const negatif = exercice.facteurs.some((f) => f.type === "lineaire" && f.polynome.k < 0);
  return { ...etapesDuCorrige(correctionDetailleeSignesProduit(exercice), lettresLectureSignesProduit(exercice)), methode: quadratique ? 1 : 0, piege: carre || negatif ? 1 : 0 };
}

function critereEcran(exercice: ExerciceSignesProduit, i: number): FragmentConsigne[] {
  const res = correctionDetailleeSignesProduit(exercice).find((l) => l.sousQuestion === LETTRES[i] && l.type === "resultat");
  return res ? res.fragments : [];
}

function baremeSignesProduit(exercice: ExerciceSignesProduit): BaremeExercice {
  const ecrans = ecransSignesProduit(exercice);
  const lTableau = LETTRES[ecrans.length - 2];
  const lSolution = LETTRES[ecrans.length - 1];
  const nbFacteur = ecrans.length - 2;
  const criteres: CritereBareme[] = ecrans.map((ecran, i) => {
    if (ecran.phase === "grille") return { sousQuestion: LETTRES[i], critere: [texte("Tableau de signes complet : une ligne par facteur, ligne du produit juste")], points: 1.5 };
    if (ecran.phase === "intervalle") return { sousQuestion: LETTRES[i], critere: [...critereEcran(exercice, i), texte(" (crochets justes)")], points: 1 };
    return { sousQuestion: LETTRES[i], critere: critereEcran(exercice, i), points: Math.round((150 / nbFacteur)) / 100 };
  });
  const erreurs: ErreurFrequente[] = [];
  if (exercice.facteurs.some((f) => f.type === "lineaire" && f.polynome.k < 0)) {
    erreurs.push({ description: [texte("Signe d'un facteur du premier degré inversé (coefficient de x négatif)")], cout: `−1 sur ${lTableau})` });
  }
  if (exercice.facteurs.some((f) => f.type === "quadratique_irreductible")) {
    erreurs.push({ description: [texte("Facteur sans racine oublié dans le tableau, ou supposé changer de signe")], cout: `0 pt sur ${lTableau})` });
  }
  if (exercice.facteurs.some((f) => f.type === "quadratique_factorisable" && f.exercice.solution.racines[0] === f.exercice.solution.racines[1])) {
    erreurs.push({ description: [texte("Racine double traitée comme une racine simple (changement de signe)")], cout: `−1 sur ${lTableau})` });
  }
  erreurs.push({ description: [texte("Crochets mal choisis : racines incluses avec une inégalité stricte, ou exclues avec une inégalité large")], cout: `−0,5 sur ${lSolution})` });
  return {
    reponseFinale: reponseBreveSignesProduit(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble décrit par des inégalités (ex. « x ≤ … ou x ≥ … »)")], [texte("Facteurs rangés dans un autre ordre dans le tableau")]],
  };
}

export const adaptateurEvaluationSignesProduit: AdaptateurFeuilleExercices<ExerciceSignesProduit> = {
  profilInstance: profilSignesProduit,
  titreDocument: "Signe d'un produit de plusieurs facteurs — Évaluation",
  nomFichierBase: "signes-produit",
  genererInstance: genererExerciceSignesProduit,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteSignesProduitId),
  construireEnonce: construireEnonceSignesProduit,
  construireCorrection: construireCorrectionSignesProduit,
  criteresDifficulte: criteresSignesProduit,
  reponseBreve: reponseBreveSignesProduit,
  correctionDetaillee: correctionDetailleeSignesProduit,
  bareme: baremeSignesProduit,
  enoncePapier: enoncePapierSignesProduit,
  // La consigne mentionne l'inéquation tirée : jamais `regroupable`.
};
