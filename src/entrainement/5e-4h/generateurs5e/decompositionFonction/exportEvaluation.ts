import type { ExerciceDecompositionFonction } from "../../core5e/decompositionFonction.types";
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
import { labelLigne } from "../../ui5e/formatDecompositionFonction";
import { CATALOGUE_VARIANTES_DECOMPOSITION, construireAvecVariante, genererExerciceDecompositionFonction } from "./index";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { chaineComposee, correctionDetailleeDecompositionFonction, piegeDecomposition } from "./corrigeDetaille";
import { profilDecompositionFonction } from "../profilsEvaluationFonctions1-2";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDecompositionFonction>` pour 5gen2 (décomposer une
 * fonction composée) — feuille d'exercices et évaluation (méthode :
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale (composée de fonctions de référence, de la plus
 * intérieure à la plus extérieure) ; le nombre de couches n'est PAS imposé (décision B de l'audit :
 * toute décomposition en fonctions de référence qui reconstitue f est acceptée). Le corrigé justifie
 * chaque couche de l'intérieur vers l'extérieur (`couches[].propreLatex`, la même décomposition que
 * la révélation de l'écran), puis recompose f.
 *
 * Catalogue = `CATALOGUE_VARIANTES_DECOMPOSITION`, le MÊME que le sélecteur de l'appli (le QR code de
 * la feuille rouvre la même instance).
 */

function entete(exercice: ExerciceDecompositionFonction): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(exercice.fLatex), texte(".")];
}

const CONSIGNE_ECRAN = "Décompose f(x) en fonctions intermédiaires, de la plus intérieure (appliquée en premier) à la plus extérieure.";

function construireEnonceDecompositionFonction(exercice: ExerciceDecompositionFonction): SectionExercice {
  return { enteteFragments: entete(exercice), questions: [{ consigne: [texte(CONSIGNE_ECRAN)] }] };
}

function enoncePapierDecompositionFonction(exercice: ExerciceDecompositionFonction): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        ...entete(exercice),
        texte(" Écris f comme une composée de fonctions simples (fonction affine, polynôme simple, puissance, racine, inverse, valeur absolue), de la plus intérieure à la plus extérieure."),
      ],
      questions: [],
    },
  };
}

function reponseBreveDecompositionFonction(exercice: ExerciceDecompositionFonction): FragmentConsigne[] {
  const fr: FragmentConsigne[] = [];
  exercice.couches.forEach((couche, i) => {
    if (i > 0) fr.push(texte(" ; "));
    fr.push(latex(`${labelLigne(i)} ${couche.propreLatex}`));
  });
  fr.push(texte(" ; "), latex(`f = ${chaineComposee(exercice.couches.length)}`));
  return fr;
}

function baremeDecompositionFonction(exercice: ExerciceDecompositionFonction): BaremeExercice {
  const n = exercice.couches.length;
  const c = (texteCritere: string, points: number): CritereBareme => ({ sousQuestion: "a", critere: [texte(texteCritere)], points });
  const criteres =
    n === 2
      ? [c("Couche intérieure correcte", 1.5), c("Couche extérieure correcte", 1.5), c("La composée, dans cet ordre, reconstitue f", 1)]
      : [c("Couche la plus intérieure correcte", 1), c("Couches suivantes correctes", 2), c("Ordre d'application respecté : la composée reconstitue f", 1)];
  return {
    reponseFinale: reponseBreveDecompositionFonction(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte(piegeDecomposition(exercice))], cout: "−1" },
      { description: [texte("Une seule « couche » égale à f, ou une couche « x » : rien n'est décomposé")], cout: "0 pt" },
    ],
    reponsesAcceptees: [[texte("Toute décomposition en fonctions simples (affine, polynôme simple, puissance, racine, inverse, valeur absolue) qui reconstitue f, même avec un autre nombre de couches")]],
  };
}

/** Critères du niveau (grille commune), jugés sur l'énoncé papier : un seul écran (la
 * décomposition) ; méthode 1 (l'élève choisit lui-même le découpage : plusieurs décompositions
 * acceptées) ; piège dans les données : dernière couche affine (elle s'applique au RÉSULTAT) ou
 * polynôme intérieur à garder d'un bloc ; nombres 0. */
function criteresDifficulteDecompositionFonction(exercice: ExerciceDecompositionFonction): CriteresDifficulte {
  const piege: 0 | 1 = exercice.couches[exercice.couches.length - 1]!.estAffineFinale || exercice.couches[0]!.type === "brute" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeDecompositionFonction(exercice)), methode: 1, piege, nombres: 0 };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDecompositionFonction(exercice: ExerciceDecompositionFonction): BlocCorrection[] {
  return correctionDetailleeDecompositionFonction(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDecompositionFonction: AdaptateurFeuilleExercices<ExerciceDecompositionFonction> = {
  titreDocument: "Décomposer une fonction composée — Évaluation",
  nomFichierBase: "decomposition-fonction",
  genererInstance: genererExerciceDecompositionFonction,
  catalogueVariantes: CATALOGUE_VARIANTES_DECOMPOSITION,
  genererInstanceAvecVariante: (id) => construireAvecVariante(id),
  construireEnonce: construireEnonceDecompositionFonction,
  construireCorrection: construireCorrectionDecompositionFonction,
  criteresDifficulte: criteresDifficulteDecompositionFonction,
  reponseBreve: reponseBreveDecompositionFonction,
  correctionDetaillee: correctionDetailleeDecompositionFonction,
  bareme: baremeDecompositionFonction,
  enoncePapier: enoncePapierDecompositionFonction,
  profilInstance: profilDecompositionFonction,
};
