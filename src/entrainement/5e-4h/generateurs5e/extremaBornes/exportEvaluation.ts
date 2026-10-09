import type { ExerciceExtremaBornes } from "../../core5e/extremaBornes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGeneraleExtremaBornes, formatFDeTLatex, formatReponseAttenduePhaseLatex, questionFinaleExtremaBornes } from "../../ui5e/formatExtremaBornes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, evalPoly, genererExerciceExtremaBornes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtremaBornes>` pour 5gen34 ("Extrema en
 * contexte borné") — feuille d'évaluation. L'écran interactif traverse 5 phases TOUJOURS présentes
 * dans le même ordre (`moteur5e/typesExtremaBornes.ts::ORDRE_ECRANS_EXTREMA_BORNES`, jamais importé
 * ici, voir ci-dessous) : "deriver" → "tableauFPrime" → "valeursExtremums" → "valeursBornes" →
 * "comparaison". La version papier condense cela en UNE seule question ("détermine le maximum ET
 * le minimum absolus, en détaillant ta démarche"), même principe que `asymptoteOblique`/`limites` :
 * demander le résultat justifié plutôt que rejouer chaque écran guidé séparément. La consigne
 * reprend `questionFinaleExtremaBornes()` TELLE QUELLE (déjà générique — littéralement "[0;T]",
 * aucune valeur tirée interpolée) complétée d'une phrase demandant explicitement le détail des 4
 * familles de candidats (dérivée, tableau de signes, valeurs aux extrema locaux, valeurs aux
 * bornes) — reflet direct du piège pédagogique de la section : la correction doit comparer TOUTES
 * ces valeurs avant de conclure, jamais s'arrêter au premier extremum local trouvé.
 *
 * Le corrigé RESYNTHÉTISE chaque étape via `formatReponseAttenduePhaseLatex` (`ui5e/formatExtremaBornes.ts`,
 * déjà la fonction utilisée côté écran 5 pour le récapitulatif des réponses attendues) — jamais
 * recalculée indépendamment. Seule exception : `formatReponseAttenduePhaseLatex(..., "comparaison",
 * candidatMax, candidatMin)` attend 2 objets `CandidatComparaisonBorne` (`moteur5e/verificationExtremaBornes.ts`).
 * Contrainte explicite de cette tâche : ne JAMAIS importer `moteur5e/` depuis cet adaptateur (règle
 * Couche A/Couche B). `candidatExtremeBorne` ci-dessous REPLIQUE donc localement la recherche du
 * candidat max/min (même patron que `evalPoly`/`derivativeCoeffs`, déjà répliqués entre
 * `generateurs5e/extremaBornes/index.ts` et `moteur5e/verificationExtremaBornes.ts`, voir le
 * commentaire de tête de ce dernier) — construite uniquement depuis `evalPoly` (Couche A,
 * `./index`) et les champs déjà connus de l'instance tirée (`coeffs`, `racinesFPrime`,
 * `classificationFPrime`, `T`), jamais un nouveau calcul mathématique indépendant : c'est
 * exactement la même comparaison max/min que celle déjà faite en Couche A lors de la génération
 * (`index.ts::calculerCas`), seulement restituée sous la forme `{t, valeur}` qu'attend le
 * formateur.
 *
 * `regroupable: true` — une seule question par instance, consigne GÉNÉRIQUE (`CONSIGNE_GENERALE`,
 * aucune valeur tirée interpolée), sans `enteteHtml` : remplit les 3 conditions de
 * `AdaptateurFeuilleExercices.regroupable` (voir `export/genererFeuilleExercices.ts` et le
 * précédent direct `generateurs5e/asymptoteOblique/exportEvaluation.ts`). Tout le contenu
 * dépendant de l'instance (contexte narratif, f(t), domaine [0;T]) vit dans `enteteFragments`
 * (déjà instance-par-instance par construction du mécanisme de regroupement, voir
 * `AppEvaluation5e.tsx::construireItemRegroupe`), jamais dans la consigne. `enteteFragments`
 * contient un SEUL fragment `latex()` (f(t) complète) — le contexte narratif et le domaine [0;T]
 * (déjà énoncés en toutes lettres par `consigneGeneraleExtremaBornes`, jamais du LaTeX) restent en
 * `texte()`, conformément au piège découvert cette session : `assemblerEvaluationHtml.ts` rend
 * TOUJOURS `enteteFragments` en mode KaTeX display, donc aucun fragment LaTeX COURT mêlé au texte
 * ici — seulement ce fragment `latex()` unique, sans risque.
 */

const CONSIGNE_GENERALE = `${questionFinaleExtremaBornes()} Détaille toute ta démarche : dérivée f'(t), résolution de f'(t)=0 et tableau de signes pour identifier les extrema locaux, valeur de f à CHAQUE extremum local ET aux 2 bornes du domaine, puis comparaison de TOUTES ces valeurs pour conclure.`;

interface CandidatBornePapier {
  t: number;
  valeur: number;
  origine: "extremum" | "borne";
  classification: "max" | "min" | null;
}

function tousCandidatsBorne(exercice: ExerciceExtremaBornes): CandidatBornePapier[] {
  const extrema: CandidatBornePapier[] = exercice.racinesFPrime.map((t, i) => ({
    t,
    valeur: evalPoly(exercice.coeffs, t),
    origine: "extremum",
    classification: exercice.classificationFPrime[i],
  }));
  const bornes: CandidatBornePapier[] = [
    { t: 0, valeur: evalPoly(exercice.coeffs, 0), origine: "borne", classification: null },
    { t: exercice.T, valeur: evalPoly(exercice.coeffs, exercice.T), origine: "borne", classification: null },
  ];
  return [...extrema, ...bornes];
}

/** Candidat de valeur extrême (max ou min) parmi TOUS les candidats (extrema locaux + 2 bornes) —
 * même comparaison que `index.ts::calculerCas`, restituée sous la forme `{t, valeur, origine,
 * classification}` qu'attend `formatReponseAttenduePhaseLatex`. */
function candidatExtremeBorne(exercice: ExerciceExtremaBornes, sens: "max" | "min"): CandidatBornePapier {
  const candidats = tousCandidatsBorne(exercice);
  return candidats.reduce((meilleur, c) => ((sens === "max" ? c.valeur > meilleur.valeur : c.valeur < meilleur.valeur) ? c : meilleur));
}

function construireEnonceExtremaBornes(exercice: ExerciceExtremaBornes): SectionExercice {
  return {
    enteteFragments: [texte(consigneGeneraleExtremaBornes(exercice)), texte(" "), latex(formatFDeTLatex(exercice))],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 8 } }],
  };
}

function construireCorrectionExtremaBornes(exercice: ExerciceExtremaBornes): BlocCorrection[] {
  const candidatMax = candidatExtremeBorne(exercice, "max");
  const candidatMin = candidatExtremeBorne(exercice, "min");

  const [derivee] = formatReponseAttenduePhaseLatex(exercice, "deriver", candidatMax, candidatMin);
  const racinesEtClassification = formatReponseAttenduePhaseLatex(exercice, "tableauFPrime", candidatMax, candidatMin);
  const valeursExtremums = formatReponseAttenduePhaseLatex(exercice, "valeursExtremums", candidatMax, candidatMin);
  const valeursBornes = formatReponseAttenduePhaseLatex(exercice, "valeursBornes", candidatMax, candidatMin);
  const [maxTexte, minTexte] = formatReponseAttenduePhaseLatex(exercice, "comparaison", candidatMax, candidatMin);

  return [
    { type: "paragraphe", fragments: [texte("Dérivée : "), latex(derivee)] },
    { type: "paragraphe", fragments: [texte("Extrema locaux (signe de f') : "), latex(racinesEtClassification.join(" \\quad "))] },
    { type: "paragraphe", fragments: [texte("Valeur de f à chaque extremum local : "), latex(valeursExtremums.join(" \\quad "))] },
    { type: "paragraphe", fragments: [texte("Valeur de f aux 2 bornes : "), latex(valeursBornes.join(" \\quad "))] },
    { type: "paragraphe", fragments: [texte("Comparaison de toutes les valeurs candidates ⟹ "), latex(maxTexte), texte(" ; "), latex(minTexte)] },
  ];
}

export const adaptateurEvaluationExtremaBornes: AdaptateurFeuilleExercices<ExerciceExtremaBornes> = {
  titreDocument: "Extrema en contexte borné — Évaluation",
  nomFichierBase: "extrema-bornes",
  genererInstance: genererExerciceExtremaBornes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceExtremaBornes,
  construireCorrection: construireCorrectionExtremaBornes,
  regroupable: true,
};
