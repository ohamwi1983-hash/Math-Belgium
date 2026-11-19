import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceComposerForces } from "../../core/composerForces.types";
import {
  angleCap,
  deviation,
  estCap,
  intensiteResultante,
} from "../../moteur/modeleComposerForces";
import {
  angleCapNom,
  angleLatex,
  consignesEcrans,
  deviationNom,
  enonceFragments,
  intensiteLatex,
  intensiteNom,
  questionsPapier,
  uniteTexte,
} from "../../ui/formatComposerForces";
import { construireFigureComposerForces } from "../../ui/figureComposerForces";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceComposerForces } from "./index";
import { profilComposerForces } from "./profil";
import { correctionDetailleeComposerForces } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen80. Énoncé papier = situation + figure (« ? »
 * sur les inconnues) + les VRAIES questions : l'intensité seule, ou a) l'intensité et b) la
 * direction, ou (cap) a) l'angle entre le cap et la route et b) la vitesse obtenue. Les écrans
 * d'apprentissage (choix du triangle, angle intérieur…) deviennent les étapes a, b, c, d du corrigé,
 * la première avec la figure du triangle utilisé et de son angle intérieur (`figureHtml`).
 * Valeurs exactes gardées en mémoire de calculatrice : seules les valeurs AFFICHÉES sont arrondies.
 */

function figureEnonce(e: ExerciceComposerForces): string {
  return construireFigureComposerForces(e, { theme: "papier" });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceComposerForces): SectionExercice {
  return {
    enteteFragments: enonceFragments(e),
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e, "papier").map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceComposerForces): EnoncePapier {
  const etapes: string[][] = e.question === "intensite" ? [["a", "b", "c"]] : e.question === "direction" ? [["a", "b", "c"], ["d"]] : [["a", "b"], ["c", "d"]];
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: etapes,
  };
}

function resultatIntensite(e: ExerciceComposerForces): FragmentConsigne[] {
  return [latex(`${intensiteNom(e, "R")} \\approx ${intensiteLatex(intensiteResultante(e))}`), texte(uniteTexte(e))];
}

function reponseBreve(e: ExerciceComposerForces): FragmentConsigne[] {
  if (e.question === "intensite") return resultatIntensite(e);
  if (e.question === "direction") return [...resultatIntensite(e), texte(" ; "), latex(`${deviationNom(e)} \\approx ${angleLatex(deviation(e))}`)];
  return [texte("angle entre le cap et la route : "), latex(`${angleCapNom(e)} \\approx ${angleLatex(angleCap(e))}`), texte(" ; "), ...resultatIntensite(e)];
}

function construireCorrection(e: ExerciceComposerForces): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceComposerForces): BaremeExercice {
  const erreurs = [
    { description: [texte("Unité absente ou fausse")], cout: "−0,5 pt" },
    { description: [texte("Calculatrice en radians")], cout: "moitié des points de l'étape concernée" },
  ];
  if (estCap(e)) {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Triangle utile repéré (report de la vitesse propre, angle connu en O)")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Angle entre le cap et la route par la loi des sinus")], points: 1.5 },
        { sousQuestion: "c", critere: [texte("Troisième angle du triangle")], points: 0.5 },
        { sousQuestion: "d", critere: [texte("Intensité de la vitesse sur la route (loi des sinus), avec l'unité")], points: 1.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Rapports de la loi des sinus inversés (côté et angle qui ne se font pas face)")], cout: "0 pt sur l'étape concernée" },
        { description: [texte("Angle donné remplacé par son supplémentaire (180° moins l'angle) alors qu'il est déjà un angle du triangle")], cout: "0 pt sur les étapes b à d (pas de double sanction ensuite)" },
        ...erreurs,
      ],
      reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Résultat juste à partir d'un angle intermédiaire faux : points de méthode accordés (pas de double sanction)")]],
    };
  }
  const criteres =
    e.question === "intensite"
      ? [
          { sousQuestion: "a", critere: [texte("Triangle utile repéré (report d'un vecteur, résultante comme côté)")], points: 1 },
          { sousQuestion: "b", critere: [texte("Angle intérieur : 180° moins l'angle entre les vecteurs")], points: 1 },
          { sousQuestion: "c", critere: [texte("Al-Kashi correctement appliqué, intensité avec l'unité")], points: 2 },
        ]
      : [
          { sousQuestion: "a", critere: [texte("Triangle utile repéré (report d'un vecteur, résultante comme côté)")], points: 0.5 },
          { sousQuestion: "b", critere: [texte("Angle intérieur : 180° moins l'angle entre les vecteurs")], points: 1 },
          { sousQuestion: "c", critere: [texte("Al-Kashi correctement appliqué, intensité avec l'unité")], points: 1.5 },
          { sousQuestion: "d", critere: [texte("Direction par la loi des sinus")], points: 1 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Angle entre les vecteurs mis directement dans Al-Kashi (longueur de l'autre diagonale)")], cout: "0 pt sur les étapes b et c" },
      ...(e.question === "direction" ? [{ description: [texte("Angle pris avec l'autre vecteur")], cout: "moitié des points de l'étape d" }] : []),
      ...erreurs,
    ],
    reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Formule de la résultante du chapitre 6 avec un « + » et l'angle entre les vecteurs (équivalente)")]],
  };
}

/** Niveau : méthode 2 (l'élève construit le modèle : parallélogramme, triangle à résoudre, angle du
 * triangle déduit de l'énoncé) ; piège 0 (rien dans les données : la confusion angle entre vecteurs /
 * angle du triangle fait partie du modèle) ; aucun écran de lecture ; calculatrice. */
function criteresDifficulte(e: ExerciceComposerForces): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeComposerForces(e)), methode: 2, piege: 0, nombres: 1 };
}

export const adaptateurEvaluationComposerForces: AdaptateurFeuilleExercices<ExerciceComposerForces> = {
  profilInstance: profilComposerForces,
  calculatriceIndispensable: true,
  titreDocument: "Composer deux forces ou deux vitesses — Évaluation",
  nomFichierBase: "composer-forces-vitesses",
  genererInstance: genererExerciceComposerForces,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeComposerForces,
  bareme,
  enoncePapier,
};
