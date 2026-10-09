import type { ExerciceRelationsDroites } from "../../core/relationsDroites.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatEquationImpliciteLatex, type FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  consigneConstruction,
  consigneEquation,
  consigneExtraction,
  formatAideConstructionNiveau2Latex,
  formatAideEquationNiveau2Latex,
  formatDonneesRechercheeLatex,
  formatEnonceLatex,
  formatVecteurLatex,
  segmentsAideConstructionNiveau1,
  segmentsAideExtractionNiveau1,
  segmentsConsigneGeneraleRelationsDroites,
} from "../../ui/formatRelationsDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsDroites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRelationsDroites>` pour gen45 (Relations entre
 * droites — parallèle/perpendiculaire, chapitre "Géométrie analytique plane", `AppRelationsDroites.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question** (`moteur/sessionRelationsDroites.ts`, lu avant d'écrire ce fichier) — les 6
 * variantes du catalogue (`PARAMETRES_PAR_VARIANTE`, `generateurs/relationsDroites/index.ts`)
 * partagent TOUJOURS le même pipeline à 3 écrans FIXES, dans le même ordre, sans aucun cas
 * "impossible" (contrairement à "Équation d'une droite") — seuls varient : la forme d'entrée de la
 * droite de référence `b` (`formeEntree`, cartésienne implicite/explicite_y/explicite_x, ou déjà
 * paramétrique), la forme de sortie demandée pour la droite cherchée `d` (`formeSortie`) et le
 * critère (`critere`, parallèle ou perpendiculaire). D'où un dispatch UNIQUE sur ces 3 champs à
 * l'intérieur de 3 questions FIXES, jamais un dispatch par variante (contrairement à
 * `orthogonalite/exportEvaluation.ts`, dont les 4 variantes ont des séquences d'écrans disjointes) :
 * - **Écran 1 "extraction"** (`EtapeExtractionRelationsDroites.tsx`) → **question a)** : extraire
 *   (ou recopier, si `formeEntree === "parametrique"`) un vecteur directeur de `b` — `consigneExtraction`
 *   dispatche déjà ce libellé, réutilisé tel quel.
 * - **Écran 2 "construction"** (`EtapeConstructionRelationsDroites.tsx`) → **question b)** :
 *   construire un vecteur directeur de `d`, parallèle ou perpendiculaire (`consigneConstruction`,
 *   déjà paramétrée par `exercice.critere`) au vecteur de référence confirmé en a).
 * - **Écran 3 "equation"** (`EtapeEquationRelationsDroites.tsx`) → **question c)** : donner
 *   l'équation cartésienne ou la représentation paramétrique de `d` (`consigneEquation`, déjà
 *   paramétrée par `exercice.formeSortie`), à partir du point cherché confirmé dès l'énoncé et du
 *   vecteur construit en b).
 * Le bloc d'énoncé commun aux 3 écrans (consigne générale + équation de `b` + point `A`,
 * `ConsigneGeneraleRelationsDroites.tsx` + `equation-box`) devient `enteteFragments`, affiché UNE
 * SEULE FOIS en tête de l'exercice papier plutôt que répété sur 3 écrans successifs — seul son
 * placement change, jamais son contenu (`segmentsConsigneGeneraleRelationsDroites` +
 * `formatEnonceLatex` + `formatDonneesRechercheeLatex`, les 3 déjà utilisés tels quels côté écran).
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige une instance à TOUJOURS une seule question, à consigne
 * GÉNÉRIQUE (indépendante des valeurs tirées). Ce générateur produit systématiquement 3 questions par
 * instance (jamais 1 seule) et ses 3 consignes dépendent en outre de l'instance (`formeEntree`/
 * `critere`/`formeSortie`, jamais une constante) : aucun des deux critères n'est rempli, pour aucune
 * des 6 variantes.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 3 questions) —
 * même décision documentée que `orthogonalite`/`triangleQuelconque`/`quelAngle` (même
 * chapitre/projet) : l'élève répond sur une feuille à part, jamais sur la copie imprimée.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`vecteurReference`, `vecteurCherche`, `referenceImpliciteSortie`, `pointCherche` — jamais
 * recalculées indépendamment ici), en réutilisant directement les formateurs déjà utilisés côté
 * écran interactif (`ui/formatRelationsDroites.ts` — `segmentsAideExtractionNiveau1`/
 * `segmentsAideConstructionNiveau1`/`formatAideConstructionNiveau2Latex`/
 * `formatAideEquationNiveau2Latex`, les textes/formules d'aide progressive de chaque écran, déjà
 * corrects par construction) plutôt que d'en resynthétiser de nouvelles. Seule différence avec le
 * texte d'aide affiché à l'écran : la correction conclut chaque question par la valeur EFFECTIVEMENT
 * tirée (`vecteurReference`/`vecteurCherche`/`referenceImpliciteSortie`), jamais seulement la
 * formule générale — un correcteur doit voir le résultat concret, pas seulement la méthode.
 * `formatAideEquationNiveau2Latex` donne déjà, non simplifiée, la substitution point+vecteur dans le
 * gabarit (`a = ..., b = ..., c = -(...)` pour la forme cartésienne, la représentation paramétrique
 * complète et déjà simplifiée pour la forme paramétrique) — la question c) l'affiche donc telle
 * quelle pour "parametrique", et la fait suivre du résultat simplifié
 * (`formatEquationImpliciteLatex` sur `referenceImpliciteSortie.a/b/c`, seule vérité canonique de
 * l'écran 3 selon `moteur/verificationRelationsDroites.ts`) pour "cartesienne".
 */

/** `a) `/`b) `/`c) ` + fragments — même petit helper que `orthogonalite/exportEvaluation.ts`. */
function paragraphe(lettre: string, fragments: FragmentConsigne[]): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) `), ...fragments] };
}

function construireEnonceRelationsDroites(exercice: ExerciceRelationsDroites): SectionExercice {
  // `enteteFragments` est toujours rendu en mode KaTeX "bloc" (`assemblerEvaluationHtml.ts`) : la
  // consigne générale (`segmentsConsigneGeneraleRelationsDroites`, des segments texte/latex courts
  // pensés pour un rendu EN LIGNE) s'y casserait en blocs KaTeX "display" disjoints. Elle se termine
  // en outre par « ... qui a pour équation : », qui attend l'équation de `b` immédiatement à sa
  // suite — donc `formatEnonceLatex`/`formatDonneesRechercheeLatex` (l'équation de `b`, le point
  // `A`) restent EN LIGNE juste après elle, dans la consigne de la question a), plutôt que déplacés
  // dans un bloc séparé (même correction que `distanceDroite`/`lieuxGeometriques/exportEvaluation.ts`,
  // mais ici la consigne et les données ne peuvent pas être séparées sans casser la phrase).
  return {
    questions: [
      {
        consigne: [
          ...segmentsConsigneGeneraleRelationsDroites(exercice),
          texte(" "),
          latex(formatEnonceLatex(exercice)),
          texte(", "),
          latex(formatDonneesRechercheeLatex(exercice)),
          texte(". "),
          texte(consigneExtraction(exercice)),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
      { consigne: [texte(consigneConstruction(exercice))], reponse: { type: "lignes", nombre: 0 } },
      { consigne: [texte(consigneEquation(exercice))], reponse: { type: "lignes", nombre: 0 } },
    ],
  };
}

function construireCorrectionRelationsDroites(exercice: ExerciceRelationsDroites): BlocCorrection[] {
  const { vecteurCherche, referenceImpliciteSortie } = exercice;

  const blocs: BlocCorrection[] = [
    paragraphe("a", [
      ...segmentsAideExtractionNiveau1(exercice),
      texte(" On peut donc choisir "),
      latex(`\\vec{u} = ${formatVecteurLatex(exercice.vecteurReference)}`),
      texte(" (tout multiple non nul convient)."),
    ]),
    paragraphe("b", [
      ...segmentsAideConstructionNiveau1(exercice.critere),
      texte(" En appliquant ce critère au vecteur de référence, "),
      latex(formatAideConstructionNiveau2Latex(exercice)),
      texte(", on peut donc choisir "),
      latex(`\\vec{v} = ${formatVecteurLatex(vecteurCherche)}`),
      texte(" (tout vecteur colinéaire à celui-ci convient)."),
    ]),
  ];

  if (exercice.formeSortie === "cartesienne") {
    blocs.push(
      paragraphe("c", [
        texte("En substituant le point "),
        latex("A"),
        texte(" et le vecteur "),
        latex("\\vec{v}"),
        texte(" confirmés ci-dessus dans le gabarit "),
        latex("a = y_{\\vec v}, \\; b = -x_{\\vec v}, \\; c = -(a\\cdot x_A + b\\cdot y_A)"),
        texte(", on obtient "),
        latex(formatAideEquationNiveau2Latex(exercice)),
        texte(", soit, une fois simplifié : "),
        latex(formatEquationImpliciteLatex(referenceImpliciteSortie.a, referenceImpliciteSortie.b, referenceImpliciteSortie.c)),
        texte("."),
      ]),
    );
  } else {
    blocs.push(
      paragraphe("c", [
        texte("En substituant le point "),
        latex("A"),
        texte(" et le vecteur "),
        latex("\\vec{v}"),
        texte(" confirmés ci-dessus dans le gabarit "),
        latex("x = x_A + x_{\\vec v}\\cdot t, \\; y = y_A + y_{\\vec v}\\cdot t"),
        texte(", on obtient : "),
        latex(formatAideEquationNiveau2Latex(exercice)),
        texte("."),
      ]),
    );
  }

  return blocs;
}

export const adaptateurEvaluationRelationsDroites: AdaptateurFeuilleExercices<ExerciceRelationsDroites> = {
  titreDocument: "Relations entre droites (parallèles / perpendiculaires) — Évaluation",
  nomFichierBase: "relations-droites-paralleles-perpendiculaires",
  genererInstance: genererExerciceRelationsDroites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceRelationsDroites,
  construireCorrection: construireCorrectionRelationsDroites,
  // PAS regroupable : toujours 3 questions par instance (jamais 1 seule), à consigne dépendante de
  // l'instance (formeEntree/critere/formeSortie) — voir le commentaire de tête.
};
