import type { ExerciceLieuxGeometriques } from "../../core/lieuxGeometriques.types";
import { estParalleleAxe } from "../../core/lieuxGeometriques.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { conclusionLieux, correctionDetailleeLieuxGeometriques } from "./corrigeDetaille";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  CONSIGNE_GENERALE_EQUATIONS,
  CONSIGNE_GENERALE_RESOLUTION,
  formatEtatActuelSystemeLatex,
  formatQuadratiqueSubstitutionLatex,
  segmentsEnonce,
} from "../../ui/formatLieuxGeometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./index";
import { profilLieuxGeometriques } from "../profilsEvaluation4eCh7Coniques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLieuxGeometriques>` pour gen54 (Intersection de
 * deux lieux géométriques — chapitre "Géométrie analytique plane" (4e), `AppLieuxGeometriques.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question, IDENTIQUE pour les 6 variantes** (`moteur/typesLieuxGeometriques.ts` :
 * `PhaseLieuxGeometriques = "identification" | "equations" | "resolution"`, 3 phases fixes,
 * toujours dans le même ordre, jamais de saut conditionnel — voir son commentaire de tête). Les 2
 * grandes variantes (`paire` : cercle-droite, droite-parabole) × les 3 sous-cas
 * (`nombrePoints` : 0, 1 tangence, 2) partagent donc EXACTEMENT la même structure papier, jamais de
 * dispatch par variante contrairement à `orthogonalite/exportEvaluation.ts` :
 * - **Écran "identification"** (`EtapeIdentificationLieuxGeometriques.tsx`,
 *   `CONSIGNE_GENERALE_IDENTIFICATION`) → **question a)** : reconnaître le type de chacun des 2
 *   lieux puis en extraire les caractéristiques — même consigne générale, réutilisée telle quelle.
 * - **Écran "equations"** (`EtapeEquationsLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_EQUATIONS`) →
 *   **question b)** : écrire l'équation de chacun des 2 lieux.
 * - **Écran "resolution"** (`EtapeResolutionLieuxGeometriques.tsx`, `CONSIGNE_GENERALE_RESOLUTION`)
 *   → **question c)** : résoudre le système (élimination d'une variable), dénombrer puis donner
 *   le(s) point(s) d'intersection.
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige un générateur qui produit TOUJOURS une seule question
 * par instance. C'est déjà faux structurellement ici : chaque instance produit 3 questions a/b/c
 * (une par écran), jamais 1 seule — peu importe que les 3 consignes soient chacune GÉNÉRIQUES
 * (`CONSIGNE_GENERALE_*`, indépendantes des valeurs tirées) : `regroupable` suppose une consigne
 * UNIQUE par instance, pas 3.
 *
 * **Feuille d'exercices / évaluation (refonte papier)** : l'énoncé papier est la question (les deux
 * lieux définis en mots) et la consigne globale « détermine les coordonnées de ces points, s'il y en
 * a » ; les 3 écrans deviennent les étapes 1 à 3 du corrigé détaillé (discriminant compris). Aucune
 * place de réponse. Le nombre de points est un VERDICT : jamais un cas particulier du tirage
 * (`profilsEvaluation4eCh7Coniques.ts` ne fixe que la forme, orientation de la parabole).
 *
 * **Aucun graphique** — contrairement à ce qu'un générateur combinant droites/cercles/paraboles
 * pourrait laisser supposer, `AppLieuxGeometriques.tsx` et ses 4 composants d'écran
 * (`Etape*LieuxGeometriques.tsx`, `ResultatPanelLieuxGeometriques.tsx`) ne contiennent AUCUN SVG/
 * Mafs/canvas (vérifié par recherche exhaustive) : chaque lieu est décrit et manipulé purement
 * VERBALEMENT/ALGÉBRIQUEMENT (voir la convention d'énoncé documentée en tête de
 * `ui/formatLieuxGeometriques.ts` — jamais d'équation ni de croquis dans l'énoncé, l'élève déduit
 * le type de chaque lieu de sa définition littérale). `enteteHtml`/SVG n'a donc pas sa place ici ;
 * `enteteFragments` (texte + LaTeX inline) suffit, exactement le même contrat que l'écran.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`lieu1`/`lieu2`/`points`/`nombrePoints`), en réutilisant directement les formateurs déjà utilisés
 * côté écran interactif (`ui/formatLieuxGeometriques.ts` — `segmentsEnonce`/`segmentsDescriptionLieu`/
 * `libelleChampEquation`/`formatEquationLieuLatex`/`formatEtatActuelSystemeLatex`/
 * `segmentsAideResolutionNiveau1`/`formatQuadratiqueSubstitutionLatex`/`substitutionResolution`/
 * `texteNombrePointsAttendu`/`formatPointLatex`) plutôt que d'en resynthétiser de nouveaux. Seule
 * addition propre à ce fichier : la question c) va plus loin que l'écran (qui s'arrête à poser
 * l'équation du second degré, aide niveau 2 — voir `EtapeResolutionLieuxGeometriques.tsx`, jamais
 * résolue à l'écran) en énonçant aussi ses solutions, extraites directement de `instance.points`
 * (jamais recalculées via le discriminant : la variable réellement éliminée par la méthode décrite
 * — `x` ou `y`, donnée par `substitutionResolution(instance).variable` — est une fonction injective
 * des points d'intersection ici (droite toujours résoluble en l'autre variable), donc
 * trier `instance.points` selon cette variable EST trier les racines de l'équation quadratique,
 * sans jamais raisoner indépendamment sur `instance.quadratique`/discriminant).
 */



function construireEnonceLieuxGeometriques(instance: ExerciceLieuxGeometriques): SectionExercice {
  return {
    enteteFragments: segmentsEnonce(instance),
    questions: [
      // Version papier de `CONSIGNE_GENERALE_IDENTIFICATION` (« complète » visait les champs de l'écran).
      { consigne: [texte("Identifie la nature de chacun des deux lieux géométriques et ses caractéristiques.")] },
      { consigne: [texte(CONSIGNE_GENERALE_EQUATIONS)] },
      { consigne: [texte(CONSIGNE_GENERALE_RESOLUTION)] },
    ],
  };
}

/** Énoncé papier : la question (les deux lieux définis en mots) et la consigne globale — les 3
 * écrans (identification, équations, résolution) deviennent les étapes du corrigé. La consigne ne
 * dit jamais combien il y a de points (verdict de l'exercice). */
function enoncePapierLieuxGeometriques(instance: ExerciceLieuxGeometriques): EnoncePapier {
  return {
    section: {
      enteteFragments: [...segmentsEnonce(instance), texte(" Détermine les coordonnées de ces points, s'il y en a, en justifiant par le calcul.")],
      questions: [],
    },
  };
}

function construireCorrectionLieuxGeometriques(instance: ExerciceLieuxGeometriques): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Système : "), latex(formatEtatActuelSystemeLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: [texte("Équation obtenue par substitution : "), latex(formatQuadratiqueSubstitutionLatex(instance)), texte(".")] },
    { type: "paragraphe", fragments: conclusionLieux(instance) },
  ];
}

// ---------------------------------------------------------------------------------------------
// Équation du second degré à coefficients entiers et discriminant (corrigé détaillé).
// ---------------------------------------------------------------------------------------------









function reponseBreveLieuxGeometriques(instance: ExerciceLieuxGeometriques): FragmentConsigne[] {
  return conclusionLieux(instance);
}

/** Niveau (« Noter un nouveau chapitre ») : trois écrans qui transforment ; méthode 1 (reconnaître
 * chaque lieu dans sa phrase parmi les trois du cours, choisir l'inconnue à remplacer) ; aucun piège
 * dans les données. Niveau et durée CONSTANTS quel que soit le nombre de points communs (le verdict :
 * `sansCharge`, sinon la résolution plus courte d'un Δ < 0 trahirait la réponse). */
function criteresDifficulte(instance: ExerciceLieuxGeometriques): CriteresDifficulte {
  // Droite parallèle à l'axe (variante à part) : piège dans les données — un seul point, sans tangence.
  const droite = instance.lieu1.type === "droite" ? instance.lieu1 : instance.lieu2.type === "droite" ? instance.lieu2 : null;
  const axe = droite !== null && estParalleleAxe(droite);
  return { ...etapesDuCorrige(correctionDetailleeLieuxGeometriques(instance)), methode: 1, piege: axe ? 1 : 0, nombres: 0, sansCharge: true };
}

function baremeLieuxGeometriques(instance: ExerciceLieuxGeometriques): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Équation de la parabole écrite avec la distance au foyer seule (directrice oubliée), ou rayon au lieu de son carré pour le cercle")], cout: "−0,5" },
    { description: [texte("Erreur de développement lors de la substitution")], cout: "−1" },
  ];
  if (instance.nombrePoints > 0) erreurs.push({ description: [texte("Seule la première coordonnée des points est donnée")], cout: "−0,5" });
  return {
    reponseFinale: conclusionLieux(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte("Les deux lieux identifiés avec leurs caractéristiques")], points: 1 },
      { sousQuestion: "b", critere: [texte("Les deux équations correctes")], points: 1 },
      { sousQuestion: "c", critere: [texte("Substitution et équation du second degré "), latex(formatQuadratiqueSubstitutionLatex(instance))], points: 1 },
      { sousQuestion: "c", critere: [texte(instance.nombrePoints === 0 ? "Discriminant négatif et conclusion : aucun point commun" : "Résolution et coordonnées des points communs")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute méthode de résolution correcte (substitution de l'autre variable, formule ou factorisation)")]],
  };
}

/** Groupes à verdict (audit 4e ch. 7, G6, décision 1) : le nom de la variante disait le nombre de
 * points communs ; dans le panneau d'évaluation, chaque paire devient UNE rangée dont le verdict
 * est tiré (paquet mélangé, série B ≠ série A). La pente est tirée avant le verdict dans une même
 * liste (`generateurs/lieuxGeometriques/index.ts`) : elle ne le trahit plus. La variante « droite
 * parallèle à l'axe » reste à part (son équation y = k se voit dans l'énoncé). */
const GROUPES_VERDICT: { id: string; label: string; variantes: string[] }[] = [
  { id: "groupe_points_cercle", label: "Cercle-droite — 0, 1 ou 2 points communs, au hasard", variantes: ["cercleDroite_0", "cercleDroite_1", "cercleDroite_2"] },
  { id: "groupe_points_parabole", label: "Droite-parabole — 0, 1 ou 2 points communs, au hasard", variantes: ["droiteParabole_0", "droiteParabole_1", "droiteParabole_2"] },
];

export const adaptateurEvaluationLieuxGeometriques: AdaptateurFeuilleExercices<ExerciceLieuxGeometriques> = {
  groupesVerdict: GROUPES_VERDICT,
  titreDocument: "Intersection de deux lieux géométriques — Évaluation",
  nomFichierBase: "lieux-geometriques-intersection",
  genererInstance: genererExerciceLieuxGeometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceLieuxGeometriques,
  construireCorrection: construireCorrectionLieuxGeometriques,
  reponseBreve: reponseBreveLieuxGeometriques,
  correctionDetaillee: correctionDetailleeLieuxGeometriques,
  criteresDifficulte,
  bareme: baremeLieuxGeometriques,
  enoncePapier: enoncePapierLieuxGeometriques,
  profilInstance: profilLieuxGeometriques,
};
