import type { ExerciceAsymptoteOblique } from "../../core5e/asymptoteOblique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatAsymptoteOblique";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceAsymptoteOblique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAsymptoteOblique>` pour 5gen21 (Asymptote
 * oblique) — feuille d'évaluation. L'écran interactif fait passer par 3 phases par variante
 * (`moteur5e/typesAsymptoteOblique.ts::ordreComplet` — jamais importé ici, voir ci-dessous) : soit
 * diviserEuclidienne → ecrireFormeDeveloppee → conclureEquationAsymptote (variante
 * "divisionEuclidienne"), soit calculerCoefficientA → calculerCoefficientB →
 * conclureEquationAsymptote (variante "viaLimites"). La version papier condense cela en UNE
 * question ("détermine l'équation de l'asymptote oblique, en justifiant") — même principe que
 * gen1/domaineDefinition et gen11/formeCanoniqueFonctionsReference : demander le résultat justifié
 * plutôt que rejouer chaque écran guidé séparément, la technique de justification exigée restant
 * libre (division euclidienne OU passage à la limite), les 2 étant mathématiquement valides pour
 * n'importe quelle instance tirée — `exercice.variante` ne sert donc ici qu'à choisir QUEL corrigé
 * type présenter (les 2 techniques aboutissant à la même équation), jamais à changer la question
 * posée à l'élève.
 *
 * Contrainte explicite de cette tâche : ne JAMAIS importer `moteur5e/` depuis cet adaptateur
 * (règle Couche A/Couche B). Le corrigé n'a donc pas accès à `ordreComplet` — il dispatche
 * directement sur `exercice.variante` (champ `core5e`, pas une notion `moteur5e`) pour savoir
 * quelles phases resynthétiser via `formatReponseAttenduePhaseLatex` (`ui5e/formatAsymptoteOblique.ts`,
 * déjà la fonction utilisée côté écran pour le récapitulatif des réponses attendues) — jamais un
 * calcul recréé indépendamment ici.
 *
 * `regroupable: true` — une seule question par instance, consigne GÉNÉRIQUE (`CONSIGNE_GENERALE`,
 * dérivée de `consigneGenerale()` déjà utilisée côté écran + exigence de justification ajoutée pour
 * le papier, aucune valeur tirée interpolée), sans `enteteHtml` : remplit exactement les 3
 * conditions de `AdaptateurFeuilleExercices.regroupable` (voir `export/genererFeuilleExercices.ts`
 * et le précédent direct `generateurs/formeCanoniqueFonctionsReference/exportEvaluation.ts`).
 */

const CONSIGNE_GENERALE = `${consigneGenerale()} Justifie ta démarche.`;

function construireEnonceAsymptoteOblique(exercice: ExerciceAsymptoteOblique): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(`f(x) = ${formatTermesDonneesLatex(exercice)[0]}`), texte(".")],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 6 } }],
  };
}

/** Corrigé "division euclidienne" — resynthétise Q(x)/R(x), la forme développée de f(x), puis
 * l'équation de l'asymptote, chacune déjà une réponse attendue existante (`formatReponseAttenduePhaseLatex`). */
function construireCorrectionViaDivision(exercice: ExerciceAsymptoteOblique, equationAsymptote: string): BlocCorrection[] {
  const [quotient, reste] = formatReponseAttenduePhaseLatex(exercice, "diviserEuclidienne");
  const [formeDeveloppee] = formatReponseAttenduePhaseLatex(exercice, "ecrireFormeDeveloppee");
  return [
    { type: "paragraphe", fragments: [texte("Division euclidienne : "), latex(quotient), texte(", "), latex(reste), texte(".")] },
    { type: "paragraphe", fragments: [texte("Donc f(x)"), latex(formeDeveloppee), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation de l'asymptote oblique : "), latex(equationAsymptote), texte(".")] },
  ];
}

/** Corrigé "via les limites" — resynthétise a=lim f(x)/x puis b=lim[f(x)-ax], puis l'équation de
 * l'asymptote, chacune déjà une réponse attendue existante (`formatReponseAttenduePhaseLatex`). */
function construireCorrectionViaLimites(exercice: ExerciceAsymptoteOblique, equationAsymptote: string): BlocCorrection[] {
  const [coeffA] = formatReponseAttenduePhaseLatex(exercice, "calculerCoefficientA");
  const [coeffB] = formatReponseAttenduePhaseLatex(exercice, "calculerCoefficientB");
  return [
    { type: "paragraphe", fragments: [texte("Coefficient a : "), latex(coeffA), texte(".")] },
    { type: "paragraphe", fragments: [texte("Coefficient b : "), latex(coeffB), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation de l'asymptote oblique : "), latex(equationAsymptote), texte(".")] },
  ];
}

function construireCorrectionAsymptoteOblique(exercice: ExerciceAsymptoteOblique): BlocCorrection[] {
  const [equationAsymptote] = formatReponseAttenduePhaseLatex(exercice, "conclureEquationAsymptote");
  return exercice.variante === "divisionEuclidienne"
    ? construireCorrectionViaDivision(exercice, equationAsymptote)
    : construireCorrectionViaLimites(exercice, equationAsymptote);
}

export const adaptateurEvaluationAsymptoteOblique: AdaptateurFeuilleExercices<ExerciceAsymptoteOblique> = {
  titreDocument: "Asymptote oblique — Évaluation",
  nomFichierBase: "asymptote-oblique",
  genererInstance: genererExerciceAsymptoteOblique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceAsymptoteOblique,
  construireCorrection: construireCorrectionAsymptoteOblique,
  regroupable: true,
};
