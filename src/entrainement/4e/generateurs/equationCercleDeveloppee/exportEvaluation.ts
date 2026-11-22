import type { ExerciceEquationCercleDeveloppee } from "../../core/equationCercleDeveloppee.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEquationCercleDeveloppee } from "./corrigeDetaille";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_COMPLETION,
  CONSIGNE_GENERALE_CENTRE_RAYON,
  consigneRegroupement,
  formatCentreAttenduLatex,
  formatCompletionLatex,
  formatEquationDeveloppeeLatex,
  formatRayonApprocheTexte,
  formatRayonAttenduLatex,
  formatRegroupementLatex,
  segmentsConsigneCentreRayon,
} from "../../ui/formatEquationCercleDeveloppee";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercleDeveloppee } from "./index";
import { PARAMETRES_CERCLE_DEVELOPPE, profilEquationCercleDeveloppee } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationCercleDeveloppee>` pour gen50 (Centre et
 * rayon d'un cercle depuis l'équation développée, `AppEquationCercleDeveloppee.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question : `AppEquationCercleDeveloppee.tsx`/`moteur/sessionEquationCercleDeveloppee.ts`
 * enchaîne 3 phases FIXES, toujours dans le même ordre (`PhaseEquationCercleDeveloppee` —
 * "regroupement", "completion", "centreRayon", voir `moteur/typesEquationCercleDeveloppee.ts`), les
 * 3 affichant la MÊME équation développée fixe (`formatEquationDeveloppeeLatex`) précédée de la
 * MÊME consigne d'ensemble `CONSIGNE_GENERALE_CENTRE_RAYON` ("Détermine le centre et le rayon du
 * cercle d'équation :"). Ceci devient ici, comme pour `simplification/exportEvaluation.ts` (même
 * structure "3 écrans successifs par instance"), UNE question papier PAR ÉCRAN plutôt qu'une seule
 * consigne fourre-tout : a) regroupement/factorisation du coefficient commun
 * (`CONSIGNE_REGROUPEMENT`), b) complétion du carré sur chaque groupe (`CONSIGNE_COMPLETION`),
 * c) identification du centre et du rayon (`segmentsConsigneCentreRayon`, qui varie SELON LA
 * VARIANTE — précision "forme exacte ou valeur décimale arrondie au centième" ajoutée uniquement
 * pour `"irrationnel"`, voir son commentaire de tête dans `ui/formatEquationCercleDeveloppee.ts`).
 * L'énoncé fixe (équation développée) est levé une seule fois en tête d'exercice
 * (`enteteFragments`), jamais répété dans chaque question — contrairement à l'écran interactif qui
 * le réaffiche par pur confort de navigation entre 3 pages séparées, inutile sur une feuille
 * imprimée où tout est visible d'un coup.
 *
 * PAS `regroupable` : (1) 3 questions par instance, jamais 1 seule — la 1ʳᵉ condition du mécanisme
 * échoue déjà à elle seule (voir `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) ; (2) la consigne de la question c) n'est de toute façon PAS
 * générique — elle dépend de la variante tirée (`segmentsConsigneCentreRayon`, note supplémentaire
 * pour `"irrationnel"` uniquement), pas juste des valeurs numériques.
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est l'équation et la
 * consigne globale « détermine le centre et le rayon » ; les 3 écrans (regroupement, complétion du
 * carré, centre et rayon) deviennent les étapes 1 à 3 du corrigé détaillé. Aucune place de réponse.
 * Tirage équilibré : `profilsEvaluation4eCh7Coniques.ts` (k ≠ 1 et centre fractionnaire au choix).
 */

function construireEnonceEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_CENTRE_RAYON} `), latex(formatEquationDeveloppeeLatex(instance))],
    questions: [{ consigne: [texte(consigneRegroupement(instance))] }, { consigne: [texte(CONSIGNE_COMPLETION)] }, { consigne: segmentsConsigneCentreRayon(instance) }],
  };
}

/** Énoncé papier : l'équation et la consigne globale (les 3 écrans deviennent les étapes du
 * corrigé). La forme attendue du rayon est annoncée : valeur exacte. */
function enoncePapierEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte("Détermine le centre et le rayon du cercle d'équation "),
        latex(formatEquationDeveloppeeLatex(instance)),
        texte(instance.variante === "irrationnel" ? ". Donne le rayon en valeur exacte." : "."),
      ],
      questions: [],
    },
  };
}

function construireCorrectionEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Regroupement : "), latex(formatRegroupementLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: [texte("Complétion du carré : "), latex(formatCompletionLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: [texte("Centre "), latex(formatCentreAttenduLatex(instance)), texte(", rayon "), latex(rayonLatex(instance)), texte(".")] },
  ];
}

/** Nombre exact (entier ou fraction irréductible) en LaTeX, signe devant la fraction. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(Math.abs(valeur));
  const m = /^(\d+)\/(\d+)$/.exec(brut);
  const corps = m ? `\\dfrac{${m[1]}}{${m[2]}}` : brut;
  return valeur < 0 ? `-${corps}` : corps;
}



/** R exact (racine simplifiée), suivi de sa valeur arrondie quand il est irrationnel. */
function rayonLatex(instance: ExerciceEquationCercleDeveloppee): string {
  const exact = `r = ${formatRayonAttenduLatex(instance)}`;
  return instance.variante === "irrationnel" ? `${exact} \\approx ${formatRayonApprocheTexte(instance).replace(",", "{,}")}` : exact;
}





function reponseBreveEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): FragmentConsigne[] {
  return [texte("Centre "), latex(formatCentreAttenduLatex(instance)), texte(", rayon "), latex(rayonLatex(instance)), texte(".")];
}

/** Niveau (« Noter un nouveau chapitre ») : trois écrans qui transforment (regroupement,
 * complétion, centre et rayon — R se calcule), méthode imposée par les consignes, aucun piège dans
 * les données (le signe du centre est la méthode) ; valeurs exactes. */
function criteresDifficulte(instance: ExerciceEquationCercleDeveloppee): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeEquationCercleDeveloppee(instance)), methode: 0, piege: 0, nombres: 0 };
}

function baremeEquationCercleDeveloppee(instance: ExerciceEquationCercleDeveloppee): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Rayon confondu avec "), latex("r^2"), texte(" (racine carrée oubliée)")], cout: "−1" },
    { description: [texte("Carrés ajoutés dans une parenthèse mais pas retranchés (ou pas reportés dans le second membre)")], cout: "−1" },
    { description: [texte("Signe d'une coordonnée du centre inversé")], cout: "−0,5" },
  ];
  if (instance.k !== 1) erreurs.push({ description: [texte(`Second membre non divisé par ${instance.k}`)], cout: "−1" });
  return {
    reponseFinale: reponseBreveEquationCercleDeveloppee(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte(instance.k === 1 ? "Termes regroupés par variable" : `Division par ${instance.k} et termes regroupés par variable`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Carrés complétés : "), latex(formatCompletionLatex(instance))], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Centre "), latex(formatCentreAttenduLatex(instance))], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Rayon exact "), latex(`r = ${formatRayonAttenduLatex(instance)}`)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: instance.variante === "irrationnel" ? [[texte("Racine non simplifiée de "), latex(`r^2 = ${nombreLatex(instance.rayonCarre)}`), texte(" si elle est exacte")]] : [[texte("Rayon écrit sous forme décimale exacte")]],
  };
}

export const adaptateurEvaluationEquationCercleDeveloppee: AdaptateurFeuilleExercices<ExerciceEquationCercleDeveloppee> = {
  titreDocument: "Centre et rayon d'un cercle depuis l'équation développée — Évaluation",
  nomFichierBase: "equation-cercle-developpee",
  genererInstance: genererExerciceEquationCercleDeveloppee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationCercleDeveloppee,
  construireCorrection: construireCorrectionEquationCercleDeveloppee,
  reponseBreve: reponseBreveEquationCercleDeveloppee,
  correctionDetaillee: correctionDetailleeEquationCercleDeveloppee,
  criteresDifficulte,
  bareme: baremeEquationCercleDeveloppee,
  enoncePapier: enoncePapierEquationCercleDeveloppee,
  profilInstance: profilEquationCercleDeveloppee,
  parametresAuChoix: PARAMETRES_CERCLE_DEVELOPPE,
};
