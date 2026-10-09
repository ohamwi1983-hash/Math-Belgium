import type { ExerciceFormeCanoniqueTransformation } from "../../core/formeCanoniqueTransformations.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FonctionCanonique } from "../../moteur/verificationFormeCanoniqueTransformations";
import { formatFonctionCanoniqueLatex, formatFormeGeneraleLatex } from "../../ui/formatFormeCanoniqueTransformations";
import { genererExerciceFormeCanoniqueTransformation } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeCanoniqueTransformation>` pour gen9 (Forme
 * canonique et transformations) — feuille d'évaluation.
 *
 * Condense la séquence guidée à 4 écrans (forme canonique → TH → EV/CV/SOX → TV, voir
 * `core/formeCanoniqueTransformations.types.ts`) en une seule question écrite : le résultat final
 * (la forme canonique complète) est ce que la séquence construit progressivement, jamais recalculé
 * indépendamment ici — `formatFonctionCanoniqueLatex`/`formatFormeGeneraleLatex` sont les mêmes
 * fonctions déjà utilisées par l'écran interactif (`ui/formatFormeCanoniqueTransformations.ts`).
 */

function construireEnonceFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(formatFormeGeneraleLatex(exercice)), texte(".")],
    questions: [
      {
        consigne: [texte("Écris cette fonction sous forme canonique "), latex("f(x) = a(x-p)^2 + q"), texte(", en précisant les coordonnées du sommet.")],
        reponse: { type: "lignes", nombre: 4 },
      },
    ],
  };
}

function construireCorrectionFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): BlocCorrection[] {
  const fonction: FonctionCanonique = { numA: exercice.sox ? -exercice.ev : exercice.ev, denA: exercice.cv, p: exercice.xS, q: exercice.yS };
  return [
    { type: "paragraphe", fragments: [texte(`Sommet : S(${exercice.xS} ; ${exercice.yS}).`)] },
    { type: "paragraphe", fragments: [texte("Forme canonique : "), latex(formatFonctionCanoniqueLatex(fonction))] },
  ];
}

export const adaptateurEvaluationFormeCanoniqueTransformations: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueTransformation> = {
  titreDocument: "Forme canonique et transformations — Évaluation",
  nomFichierBase: "forme-canonique-transformations",
  genererInstance: genererExerciceFormeCanoniqueTransformation,
  construireEnonce: construireEnonceFormeCanoniqueTransformations,
  construireCorrection: construireCorrectionFormeCanoniqueTransformations,
};
