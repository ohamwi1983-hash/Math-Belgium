import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../../core/formeCanoniqueFonctionsReference.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { cibleFinale } from "../../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatCibleLatex, formatFormeDepartLatex } from "../../ui/formatFormeCanoniqueFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFormeCanoniqueFonctionReference } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference>` pour gen11
 * (Transformer une fonction de référence — forme canonique et transformations, chapitre 2,
 * `AppFormeCanoniqueFonctionsReference.tsx`) — feuille d'évaluation.
 *
 * Analogue direct de gen9 (`generateurs/formeCanoniqueTransformations/exportEvaluation.ts`),
 * généralisé aux 6 familles de référence (`FAMILLES`) : l'écran interactif fait passer par 6
 * phases fixes (reconnaissance de la famille → forme canonique → EH/CH/SOY → TH → EV/CV/SOX → TV,
 * voir `core/formeCanoniqueFonctionsReference.types.ts`), mais SEULE la toute première étape
 * écrite (`EtapeCanoniqueFR.tsx`, phase "canonique") correspond à un travail effectivement
 * reproductible sur papier : l'élève y simplifie `formeDepart` (affichée telle quelle, jamais
 * pré-simplifiée) en un unique champ libre `f(x) = ...`. Les phases suivantes (EH/CH/SOY, TH,
 * EV/CV/SOX, TV) ne font que reconstruire CE MÊME résultat morceau par morceau via des curseurs —
 * elles n'ajoutent aucune information supplémentaire à vérifier par écrit (contrairement à gen9,
 * où cette même condensation en une question unique était déjà le choix fait).
 *
 * Cible utilisée pour la correction — `cibleEtape1` (vérification de la phase "canonique") est
 * TOUJOURS égale, terme à terme, à `cibleFinale` du même exercice (propriété de cohérence
 * documentée dans `verificationFormeCanoniqueFonctionsReference.ts`, section "Étape 1") : la forme
 * canonique demandée ici EST donc directement la fonction finale complète, jamais un résultat
 * partiel. `cibleFinale`/`formatCibleLatex` sont réutilisées telles quelles (déjà les fonctions du
 * module de vérification/formatage utilisées côté écran) plutôt que recalculées indépendamment ici
 * — même principe que `generateurs/fonctionsReference/exportEvaluation.ts` (gen10), qui importe
 * lui aussi directement `moteur/verificationFonctionsReference.ts` (la règle "`src/generateurs/`
 * n'importe jamais `src/moteur/`" ne s'applique qu'à la Couche A — génération, `index.ts` — jamais
 * à l'export, qui a toujours légitimement réutilisé la vérification/le formatage existants).
 *
 * `regroupable: true` — une seule question par instance, consigne GÉNÉRIQUE (constante, aucune
 * valeur tirée interpolée), sans `enteteHtml` : remplit exactement les 3 conditions de
 * `AdaptateurFeuilleExercices.regroupable` (voir `export/genererFeuilleExercices.ts`). gen9 ne
 * l'active pas lui-même, mais seulement parce que son adaptateur a été écrit avant l'introduction
 * de ce mécanisme (commit `64eeb7e`, antérieur à `5faf026` qui l'introduit) — jamais parce qu'il ne
 * remplirait pas les conditions ; gen11, écrit après, l'active donc directement.
 */

const CONSIGNE_GENERALE = "Simplifie cette expression pour obtenir sa forme canonique (fonction de référence transformée).";

function construireEnonceFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFormeDepartLatex(exercice)), texte(".")],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)], reponse: { type: "lignes", nombre: 3 } }],
  };
}

function construireCorrectionFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): BlocCorrection[] {
  const libelleFamille = CATALOGUE_VARIANTES.find((variante) => variante.id === exercice.famille)?.label ?? exercice.famille;
  return [
    { type: "paragraphe", fragments: [texte(`Fonction de référence reconnue : ${libelleFamille}.`)] },
    {
      type: "paragraphe",
      fragments: [texte("Forme canonique : "), latex(formatCibleLatex(exercice.famille, cibleFinale(exercice)))],
    },
  ];
}

export const adaptateurEvaluationFormeCanoniqueFonctionsReference: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference> = {
  titreDocument: "Transformer une fonction de référence — forme canonique — Évaluation",
  nomFichierBase: "forme-canonique-fonctions-reference",
  genererInstance: genererExerciceFormeCanoniqueFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFormeCanoniqueFonctionsReference,
  construireCorrection: construireCorrectionFormeCanoniqueFonctionsReference,
  regroupable: true,
};
