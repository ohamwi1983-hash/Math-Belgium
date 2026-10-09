import type { ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogC, ExerciceEtudeLogNonE } from "../../core6e/etudeFonctionLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { construireSvgFonction } from "../../../export/svgGraph";
import {
  calculerViewBox,
  consigneAsymptotes,
  consigneComportementInfiniE,
  consigneConcavite,
  consigneCroissance,
  consigneDomaine,
  consigneGraphique,
  consigneLimites,
  contenuRecapPhase,
  evaluerCandidat,
  formatFonctionLatex,
  LIBELLE_PHASE_ETUDE_LOG,
} from "../../ui6e/formatEtudeFonctionLogarithme";
import type { PhaseEtudeFonctionLogarithme } from "../../moteur6e/typesEtudeFonctionLogarithme";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme>` pour `6gen21` (Étudier
 * une fonction — synthèse, logarithmes) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs6e/etudeFonctionExponentielle/exportEvaluation.ts` (6gen11) pour le pilote 6e le plus
 * proche (mêmes 6 écrans, familles A-D).
 *
 * Contrairement à 6gen11, le NOMBRE d'écrans (donc de questions écrites) varie ici avec la famille :
 * 6 pour A-D (domaine → limites → asymptotes → croissance → concavité → graphique, `App6gen21.tsx`),
 * 2 seulement pour E (domaine → comportementInfini, traitement qualitatif allégé, jamais de tableau
 * de variation ni de QCM graphique — voir `core6e/etudeFonctionLogarithme.types.ts`). Chaque
 * sous-question réutilise directement `ui6e/formatEtudeFonctionLogarithme.ts::contenuRecapPhase` —
 * LA MÊME fonction qui alimente déjà le récapitulatif final interactif — jamais recalculée
 * indépendamment ici.
 *
 * Famille C, écran "croissance" — SEULE famille dont l'écran interactif (`EtapeCroissanceGrilleCLog`)
 * est un vrai tableau de signe à 4 cases fixes (`CibleCroissanceGrilleC`, jamais un champ
 * catégorie+position comme A/B/D) : rendu ici avec `reponse: { type: 'tableau', ... }`/un
 * `BlocCorrection` de type `'tableau'`, même convention que le tableau de signe/variation de
 * `generateurs/analyseFonction/exportWord.ts`, plutôt que la zone "lignes" générique utilisée pour
 * toutes les autres sous-questions.
 *
 * QCM graphique réel (4 candidats tracés en `<svg>` statique, moteur générique `export/svgGraph.ts`
 * réutilisé tel quel — même principe que `export/svgGraphEtudeExpo.ts` pour 6gen11, pas besoin d'un
 * fichier d'habillage séparé pour une seule fonction de rendu ici), jamais réduit à une question
 * textuelle — famille E n'a pas cet écran.
 */

const LETTRES_GRAPHIQUE = "ABCD";

function construireGrilleSvgCandidats(exercice: ExerciceEtudeLogNonE, indexCorrectAAfficher?: number): string {
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

/** Même convention que `etudeFonctionExponentielle/exportEvaluation.ts::fragmentsContenuRecap` :
 * `contenuRecapPhase` reste l'unique source de vérité (texte et/ou LaTeX), jamais reconcaténée à la
 * main ici — tout fragment mathématique (`latexReponse`) passe par `latex(...)`, jamais mêlé au
 * `texte(...)` brut. */
function fragmentsContenuRecap(exercice: ExerciceEtudeFonctionLogarithme, phase: PhaseEtudeFonctionLogarithme): FragmentConsigne[] {
  const { texte: texteReponse, latex: latexReponse } = contenuRecapPhase(exercice, phase);
  if (latexReponse !== null) return texteReponse !== null ? [texte(`${texteReponse} : `), latex(latexReponse)] : [latex(latexReponse)];
  return [texte(texteReponse ?? "")];
}

/** Corrigé de l'écran "croissance" — forme "grilleC", famille C uniquement (voir le commentaire de
 * tête). Intervalles ET signes lus directement sur `exercice.croissance` (jamais recalculés). */
function construireCorrectionCroissanceGrilleC(exercice: ExerciceEtudeLogC): BlocCorrection[] {
  const k = exercice.k;
  const labelsIntervalles = [`]-∞ ; -${k}[`, `]-${k} ; 0[`, `]0 ; ${k}[`, `]${k} ; +∞[`];
  const labelsVariation = exercice.croissance.signes.map((s) => (s === "croissante" ? "Croissante" : "Décroissante"));
  return [
    { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], valeursParLigne: [labelsIntervalles, labelsVariation] },
    { type: "paragraphe", fragments: [texte(`Maximum local en x = ${exercice.croissance.positionMax}.`)] },
  ];
}

function construireEnonceEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): SectionExercice {
  const enteteFragments: FragmentConsigne[] = [texte("On considère la fonction suivante : "), latex(formatFonctionLatex(exercice))];

  if (exercice.famille === "E") {
    return {
      enteteFragments,
      questions: [
        { consigne: [texte(consigneDomaine(exercice))], reponse: { type: "lignes", nombre: 1 } },
        { consigne: [texte(consigneComportementInfiniE())], reponse: { type: "lignes", nombre: 2 } },
      ],
    };
  }

  const questions: QuestionExercice[] = [
    { consigne: [texte(consigneDomaine(exercice))], reponse: { type: "lignes", nombre: 2 } },
    { consigne: [texte(consigneLimites(exercice))], reponse: { type: "lignes", nombre: exercice.famille === "C" ? 6 : 2 } },
    { consigne: [texte(consigneAsymptotes(exercice))], reponse: { type: "lignes", nombre: exercice.famille === "B" ? 1 : 2 } },
    exercice.famille === "C"
      ? { consigne: [texte(consigneCroissance(exercice))], reponse: { type: "tableau", libellesLignes: ["Intervalle", "Variation de f"], nombreColonnes: 4 } }
      : { consigne: [texte(consigneCroissance(exercice))], reponse: { type: "lignes", nombre: 2 } },
    { consigne: [texte(consigneConcavite())], reponse: { type: "lignes", nombre: 2 } },
    { consigne: [texte(consigneGraphique())], reponse: { type: "lignes", nombre: 1 } },
  ];

  return {
    enteteFragments,
    enteteHtml: construireGrilleSvgCandidats(exercice),
    questions,
  };
}

function construireCorrectionEtudeFonctionLogarithme(exercice: ExerciceEtudeFonctionLogarithme): BlocCorrection[] {
  if (exercice.famille === "E") {
    return [
      { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.domaine} : `), ...fragmentsContenuRecap(exercice, "domaine")] },
      { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.comportementInfini} : `), ...fragmentsContenuRecap(exercice, "comportementInfini")] },
    ];
  }

  const blocs: BlocCorrection[] = [
    { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.domaine} : `), ...fragmentsContenuRecap(exercice, "domaine")] },
    { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.limites} : `), ...fragmentsContenuRecap(exercice, "limites")] },
    { type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.asymptotes} : `), ...fragmentsContenuRecap(exercice, "asymptotes")] },
  ];

  if (exercice.famille === "C") {
    blocs.push(...construireCorrectionCroissanceGrilleC(exercice));
  } else {
    blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.croissance} : `), ...fragmentsContenuRecap(exercice, "croissance")] });
  }

  blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.concavite} : `), ...fragmentsContenuRecap(exercice, "concavite")] });

  const lettreCorrecte = LETTRES_GRAPHIQUE[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  blocs.push({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE_ETUDE_LOG.graphique} : le graphique ${lettreCorrecte}.`)] });
  blocs.push({ type: "html", html: construireGrilleSvgCandidats(exercice, exercice.indexCorrect) });

  return blocs;
}

export const adaptateurEvaluationEtudeFonctionLogarithme: AdaptateurFeuilleExercices<ExerciceEtudeFonctionLogarithme> = {
  titreDocument: "Étudier une fonction (synthèse, logarithmes) — Évaluation",
  nomFichierBase: "etude-fonction-logarithme",
  genererInstance: genererExerciceEtudeFonctionLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEtudeFonctionLogarithme,
  construireCorrection: construireCorrectionEtudeFonctionLogarithme,
};
