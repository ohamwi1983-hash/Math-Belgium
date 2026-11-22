import type { ExerciceOmbreSoleil, VarianteOmbreSoleil } from "../../core/ombreSoleil.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeOmbreSoleil } from "./corrigeDetaille";
import { construireSvgOmbreSoleil } from "./figure";
import { texte } from "../../../export/fragmentsDocx";
import {
  libelleObstacle,
  nomObstacle,
  texteConclusion,
} from "../../ui/formatOmbreSoleil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./index";
import { profilOmbreSoleil } from "../profilsEvaluation4eCh8";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOmbreSoleil>` pour gen41 (Ombre au soleil —
 * projection parallèle, `AppOmbreSoleil.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * **Écran → papier, adaptation « choix » → « tracé »** : à l'écran, l'élève choisit parmi 4 candidats
 * dessinés ; sur papier, il TRACE lui-même la construction (rayon parallèle au rayon de référence,
 * trace au sol parallèle à l'ombre de référence, intersection). L'énoncé montre la scène sans
 * l'ombre à trouver, la correction reprend l'image de l'écran de conclusion (`elementsConclusion`,
 * obstacle touché en vert, contour de l'ombre du campanile).
 *
 * **Aucune valeur numérique** (ni énoncé ni correction) : la direction de la lumière n'est jamais
 * chiffrée, la correction désigne les points étiquetés sur la figure.
 *
 * **Géométrie réutilisée, jamais réinventée** : projection (`ui/solide3DSketch.ts`) et éléments du
 * croquis (`ui/formatOmbreSoleil.ts`) sont les mêmes qu'à l'écran ; seule la rastérisation en
 * `<svg>` à attributs inline (le document de l'évaluation n'a pas accès aux feuilles de style) est
 * écrite ici. Pas `regroupable` : chaque instance a sa scène (`enteteHtml`).
 */

// --- Rendu SVG imprimé de la scène (voir le commentaire de tête ci-dessus) ---

// --- Énoncé papier et étapes ---

/** Contexte de la scène (ce que montre la figure), sans méthode. */
function contexteScene(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "directionInconnue") {
    const k = exercice.piquetConnu.id;
    return `L'ombre du sommet ${k} du campanile est connue : les deux traits pointillés relient ce sommet ${k}, puis son pied (le point du sol à sa verticale), à son ombre ${k}′ sur le sol. Ils donnent la direction de la lumière du soleil et celle des ombres au sol.`;
  }
  const exemple = "Le soleil éclaire le bâton A comme le bâton E : le trait pointillé est le rayon qui passe par le sommet de E, et l'ombre de E au sol va de son pied jusqu'à E′.";
  if (exercice.variante !== "obstacle") return exemple;
  const noms = exercice.obstacles.map((_, i) => nomObstacle(exercice, i)).filter((n): n is string => n !== null);
  if (noms.length === 0) return `${exemple} ${exercice.obstacles[0]!.type === "escalier" ? "Un escalier est posé" : "Une caisse est posée"} sur le sol.`;
  return `${exemple} Des obstacles, nommés ${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]} sur la figure, sont posés sur le sol.`;
}

function sommetsAProjeter(exercice: Extract<ExerciceOmbreSoleil, { variante: "directionInconnue" }>): string {
  const ids = exercice.piquets.map((p) => p.piquet.id);
  return ids.length > 1 ? `${ids.slice(0, -1).join(", ")} et ${ids[ids.length - 1]}` : ids[0];
}

function consignePapier(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") return "Construis l'ombre du bâton A au soleil ; nomme A′ l'ombre de son sommet.";
  // Obstacles NOMMÉS sur la figure quand il y en a plusieurs (audit 4e ch. 8, G11) : « lequel ? » a
  // alors une réponse écrite ; avec un seul obstacle, il n'y a rien à nommer.
  if (exercice.variante === "obstacle") {
    return exercice.obstacles.length >= 2
      ? "Construis l'ombre du bâton A (nomme A′ l'ombre de son sommet) et indique où elle s'arrête : sur le sol, ou sur un obstacle — lequel ?"
      : `Construis l'ombre du bâton A (nomme A′ l'ombre de son sommet) et indique où elle s'arrête : sur le sol, ou sur ${libelleObstacle(exercice, 0)}.`;
  }
  const autres = exercice.ombresAutres.length > 0 ? ", puis, par le même procédé, celles des autres sommets utiles," : ",";
  return `Construis les ombres des sommets ${sommetsAProjeter(exercice)} du campanile${autres} et trace le contour de l'ombre portée du campanile sur le sol.`;
}

/** Étapes du raisonnement, une par écran du générateur (titres « Étape n — … » du corrigé). */
function consignesEtapes(exercice: ExerciceOmbreSoleil): string[] {
  if (exercice.variante === "simple") return ["Construis l'ombre A′ du sommet du bâton A, puis l'ombre du bâton."];
  if (exercice.variante === "obstacle") {
    return [
      "Trace le rayon issu du sommet du bâton A, parallèle au rayon de l'exemple (du sommet de E à E′).",
      "Trouve le point A′ où l'ombre du sommet de A s'arrête réellement : sur un obstacle, ou sur le sol.",
    ];
  }
  const premier = exercice.piquets[0].piquet.id;
  return [
    `Trace le rayon issu du sommet ${premier}, dans la direction de la lumière (parallèle au rayon ${exercice.piquetConnu.id}${exercice.piquetConnu.id}′).`,
    ...exercice.piquets.map((p) => `Construis l'ombre ${p.piquet.id}′ du sommet ${p.piquet.id}.`),
    exercice.ombresAutres.length > 0
      ? "Construis de même les ombres des autres sommets utiles, puis trace le contour de l'ombre portée du campanile sur le sol."
      : "Trace le contour de l'ombre portée du campanile sur le sol.",
  ];
}

function construireEnonceOmbreSoleil(instance: ExerciceOmbreSoleil): SectionExercice {
  return {
    enteteFragments: [texte(contexteScene(instance))],
    enteteHtml: construireSvgOmbreSoleil(instance, false),
    questions: consignesEtapes(instance).map((c) => ({ consigne: [texte(c)] })),
  };
}

function construireCorrectionOmbreSoleil(instance: ExerciceOmbreSoleil): BlocCorrection[] {
  const figureCorrigee: BlocCorrection = { type: "html", html: construireSvgOmbreSoleil(instance, true) };
  let detail = texteConclusion(instance);
  if (instance.variante === "obstacle" && instance.indexObstacleTouche !== null) {
    detail = `La trace au sol issue du pied de A passe sous ${libelleObstacle(instance, instance.indexObstacleTouche)}. ${detail}`;
  }
  if (instance.variante === "directionInconnue") {
    const ids = [...instance.piquets.map((p) => p.piquet.id), ...instance.ombresAutres.map((o) => o.id)].join(", ");
    detail = `Chaque sommet hors du sol (${ids}) se projette en suivant la direction donnée par la paire connue ; ses ombres sont notées ${ids
      .split(", ")
      .map((id) => `${id}′`)
      .join(", ")}. ${detail}`;
  }
  return [figureCorrigee, { type: "paragraphe", fragments: [texte(detail)] }];
}

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème, énoncé papier). Méthodes =
// les aides de niveau 1 de l'écran (`ui/formatOmbreSoleil.ts`), figure = l'écran de conclusion.
// ============================================================================

const LETTRES = "abcdefghij";


/** Niveau : variante « simple » 1 étape ; « obstacle » et « direction inconnue » : l'écran du rayon
 * (tracer la parallèle au rayon connu) est une lecture. Méthode 1 (construction du cours à appliquer),
 * piège constant dans la variante « obstacle » (des obstacles sur la trace au sol, que le rayon les
 * heurte ou non : le verdict ne change pas le niveau), aucun nombre. */
function criteresDifficulteOmbreSoleil(exercice: ExerciceOmbreSoleil): CriteresDifficulte {
  const lecture = exercice.variante === "simple" ? [] : ["a"];
  return { ...etapesDuCorrige(correctionDetailleeOmbreSoleil(exercice), lecture), sansCharge: true, methode: 1, piege: exercice.variante === "obstacle" ? 1 : 0, nombres: 0 };
}

function reponseBreveOmbreSoleil(exercice: ExerciceOmbreSoleil): FragmentConsigne[] {
  if (exercice.variante === "simple") return [texte("Ombre du bâton A : du pied de A jusqu'à A′, parallèle à l'ombre de E (voir la figure du corrigé).")];
  if (exercice.variante === "obstacle") {
    return [
      texte(
        exercice.indexObstacleTouche === null
          ? "L'ombre du sommet de A atteint le sol (le rayon passe au-dessus des obstacles)."
          : `L'ombre du sommet de A s'arrête sur ${libelleObstacle(exercice, exercice.indexObstacleTouche)}.`,
      ),
    ];
  }
  return [texte(`Ombres ${exercice.piquets.map((p) => `${p.piquet.id}′`).join(", ")} et contour de l'ombre portée : voir la figure du corrigé.`)];
}

function baremeOmbreSoleil(exercice: ExerciceOmbreSoleil): BaremeExercice {
  const reponseFinale = reponseBreveOmbreSoleil(exercice);
  if (exercice.variante === "simple") {
    return {
      reponseFinale,
      criteres: [
        { sousQuestion: "a", critere: [texte("Rayon issu du sommet de A, parallèle au rayon de l'exemple")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("Trace au sol issue du pied de A, parallèle à l'ombre de E")], points: 1.5 },
        { sousQuestion: "a", critere: [texte("A′ à l'intersection des deux droites, ombre du bâton tracée")], points: 1 },
      ],
      erreursFrequentes: [{ description: [texte("Ombre de A tracée de même longueur que celle de E (bâtons de hauteurs différentes)")], cout: "−1" }],
      reponsesAcceptees: [[texte("Construction juste sans tracer les droites en entier, si A′ est bien placé")]],
    };
  }
  if (exercice.variante === "obstacle") {
    const auSol = exercice.indexObstacleTouche === null;
    return {
      reponseFinale,
      criteres: [
        { sousQuestion: "a", critere: [texte("Rayon issu du sommet de A, parallèle au rayon de l'exemple")], points: 1 },
        { sousQuestion: "b", critere: [texte("Trace au sol issue du pied de A, parallèle à l'ombre de E")], points: 1 },
        { sousQuestion: "b", critere: [texte(auSol ? "Rayon reconnu au-dessus des obstacles" : `Premier obstacle heurté : ${libelleObstacle(exercice, exercice.indexObstacleTouche!)}`)], points: 1 },
        { sousQuestion: "b", critere: [texte(auSol ? "A′ placé au sol, ombre du bâton tracée" : "A′ placé sur la surface de l'obstacle")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte(auSol ? "Ombre arrêtée sur un obstacle que le rayon survole" : "Ombre prolongée jusqu'au sol à travers l'obstacle")], cout: "0 pt sur le point A′" },
        { description: [texte("Rayon non parallèle au rayon de l'exemple")], cout: "0 pt sur a), suite notée sans double pénalité" },
      ],
    };
  }
  const fin = LETTRES[exercice.piquets.length + 1];
  return {
    reponseFinale,
    criteres: [
      { sousQuestion: "a", critere: [texte(`Direction de la lumière reportée depuis chaque sommet (parallèle à ${exercice.piquetConnu.id}${exercice.piquetConnu.id}′)`)], points: 1 },
      { sousQuestion: "b", critere: [texte(`Ombres ${exercice.piquets.map((p) => `${p.piquet.id}′`).join(", ")} : intersection du rayon et de la trace au sol issue du pied`)], points: 2 },
      {
        sousQuestion: fin,
        critere: [texte(exercice.ombresAutres.length > 0 ? `Ombres des autres sommets (${exercice.ombresAutres.map((o) => `${o.id}′`).join(", ")}) et contour de l'ombre portée tracés` : "Contour de l'ombre portée tracé (base et ombres des sommets)")],
        points: 1,
      },
    ],
    erreursFrequentes: [
      { description: [texte("Trace au sol issue d'un coin de la base au lieu du pied du sommet")], cout: "0 pt sur l'ombre de ce sommet" },
      { description: [texte("Rayon tracé dans le sens opposé (vers le haut)")], cout: "0 pt sur a)" },
    ],
  };
}

function enoncePapierOmbreSoleil(exercice: ExerciceOmbreSoleil): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(contexteScene(exercice))],
      enteteHtml: construireSvgOmbreSoleil(exercice, false),
      questions: [{ consigne: [texte(consignePapier(exercice))] }],
    },
    etapesParQuestion: [consignesEtapes(exercice).map((_, i) => LETTRES[i])],
  };
}

export const adaptateurEvaluationOmbreSoleil: AdaptateurFeuilleExercices<ExerciceOmbreSoleil> = {
  titreDocument: "Ombre au soleil — projection parallèle — Évaluation",
  nomFichierBase: "ombre-soleil",
  genererInstance: genererExerciceOmbreSoleil,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteOmbreSoleil),
  construireEnonce: construireEnonceOmbreSoleil,
  construireCorrection: construireCorrectionOmbreSoleil,
  criteresDifficulte: criteresDifficulteOmbreSoleil,
  reponseBreve: reponseBreveOmbreSoleil,
  correctionDetaillee: correctionDetailleeOmbreSoleil,
  bareme: baremeOmbreSoleil,
  enoncePapier: enoncePapierOmbreSoleil,
  profilInstance: profilOmbreSoleil,
  // `enteteHtml` (la scène) utilisé systématiquement : condition à elle seule déjà exclusive pour
  // `regroupable`, quel que soit le nombre de questions par instance — voir le commentaire de tête.
};
