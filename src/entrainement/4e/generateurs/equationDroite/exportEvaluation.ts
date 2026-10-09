import type { ExerciceEquationDroite } from "../../core/equationDroite.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneCoefficients,
  consigneExtraction,
  formatAideCoefficientsNiveau2Latex,
  formatAideExtractionNiveau2Latex,
  formatAideNiveau2PossibiliteCoefficientsLatex,
  formatEnonceLatex,
  formatEquationExpliciteXLatex,
  formatEquationExpliciteYLatex,
  formatEquationImpliciteLatex,
  formatEtatActuelPointVecteurLatex,
  segmentsAideExtractionNiveau1,
  segmentsConsignePossibiliteCoefficients,
} from "../../ui/formatEquationDroite";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationDroite } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationDroite>` pour gen42 (Équation d'une
 * droite, `AppEquationDroite.tsx`/`moteur/sessionEquationDroite.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question papier : l'écran interactif enchaîne TOUJOURS "extraction" (point + vecteur
 * directeur) en premier, puis diverge selon `formeCible` sur exactement 1 écran supplémentaire
 * (`moteur/typesEquationDroite.ts::PhaseEquationDroite` — 3 chemins disjoints) :
 * - "implicite" : `extraction → possibilite → coefficients`, mais l'écran "possibilite" y est
 *   TRIVIAL (`exercice.possible` toujours vrai pour cette forme, `construireExercice` dans
 *   `index.ts`) — jamais une vraie question pour l'élève. Fusionné ici avec "coefficients" en une
 *   seule question b) qui demande directement l'équation cartésienne, jamais un "peut-elle
 *   s'écrire sous cette forme ?" sans enjeu.
 * - "parametrique" : `extraction → coefficients` (écran "possibilite" déjà supprimé côté écran,
 *   toute droite admettant toujours une représentation paramétrique) → question b) demande
 *   directement les équations paramétriques.
 * - "explicite_y"/"explicite_x" : `extraction → possibiliteCoefficients` (écran fusionné,
 *   `promptgen42modificationsv2.md` partie A) → question b) reprend exactement cette même
 *   consigne fusionnée (`segmentsConsignePossibiliteCoefficients`) : "Cette droite peut-elle
 *   s'écrire sous forme y=mx+p (ou x=ny+q) ?", suivie en correction du choix possible/impossible
 *   ET de l'équation qui en découle (forme testée si possible, forme implicite de secours sinon) —
 *   c'est la SEULE des 3 formes où la question a un enjeu réel (`possible` peut être faux, droite
 *   verticale/horizontale, tirée avec une fréquence délibérée par `PROBABILITE_PIEGE` dans
 *   `index.ts`).
 *
 * Donc toujours exactement 2 questions par instance (a) extraction, b) forme cible), jamais 3 —
 * l'écran "possibilite" séparé n'existe qu'à l'écran interactif pour rythmer la progression/les
 * tentatives, il n'apporte rien à re-poser séparément sur une feuille imprimée pour la forme
 * "implicite" (toujours vrai) ; pour "explicite_y"/"explicite_x" il est de toute façon déjà fusionné
 * côté écran, donc directement réutilisable tel quel ici.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`referenceImplicite`/`refExpliciteY`/`refExpliciteX`/`point`/`vecteur`), jamais recalculée
 * indépendamment — réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatEquationDroite.ts`, aides niveau 1/2 de chaque écran) plutôt que d'en reconstruire de
 * nouveaux : `segmentsAideExtractionNiveau1`/`formatAideExtractionNiveau2Latex` (méthode générique
 * puis substitution, écran "extraction"), `formatAideCoefficientsNiveau2Latex` (substitution,
 * écran "coefficients" — pour "parametrique" cette fonction délègue déjà à
 * `formatRepresentationParametriqueLatex`, qui EST le résultat final, la substitution ne
 * nécessitant aucun calcul supplémentaire pour cette forme), `formatAideNiveau2PossibiliteCoefficients
 * Latex` (substitution adaptée au choix possible/impossible, écran fusionné). Le résultat final
 * simplifié (jamais juste la substitution non résolue) est ensuite affiché via les formateurs de
 * forme finale `formatEquationImpliciteLatex`/`formatEquationExpliciteYLatex`/
 * `formatEquationExpliciteXLatex` (fraction irréductible si non entier, jamais de décimal — même
 * garantie que côté écran).
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 2 questions)
 * — même décision documentée par `generateurs/applicationPhysique/exportEvaluation.ts`/
 * `generateurs/quelAngle/exportEvaluation.ts` : l'élève répond sur une feuille à part.
 *
 * `regroupable` : NON — 2 questions par instance (jamais 1 seule), et la consigne de la question a)
 * dépend du type de donnée d'entrée (`consigneExtraction`, 5 textes différents selon
 * `donnees.type`) tandis que celle de la question b) dépend de `formeCible` (4 textes différents) —
 * jamais une consigne GÉNÉRIQUE constante comme l'exige `AdaptateurFeuilleExercices.regroupable`
 * (voir sa doc, `export/genererFeuilleExercices.ts`, et le précédent `anglesAssocies/exportEvaluation.ts`
 * pour la même distinction "plusieurs variantes ≠ regroupable si le texte varie avec l'instance").
 */

const ZONE_SANS_REPONSE = { type: "lignes", nombre: 0 } as const;

function construireEnonceEquationDroite(instance: ExerciceEquationDroite): SectionExercice {
  const questionCoefficients: FragmentConsigne[] =
    instance.formeCible === "explicite_y" || instance.formeCible === "explicite_x"
      ? segmentsConsignePossibiliteCoefficients(instance)
      : [texte(consigneCoefficients(instance))];

  return {
    enteteFragments: [texte("On donne : "), latex(formatEnonceLatex(instance))],
    questions: [
      { consigne: [texte(consigneExtraction(instance))], reponse: ZONE_SANS_REPONSE },
      { consigne: questionCoefficients, reponse: ZONE_SANS_REPONSE },
    ],
  };
}

/** Question a) — extraction : méthode générique puis substitution, puis le point/vecteur
 * confirmés (même enchaînement que l'aide niveau 1 → niveau 2 de l'écran interactif). */
function fragmentsCorrectionExtraction(instance: ExerciceEquationDroite): FragmentConsigne[] {
  return [
    texte("a) "),
    ...segmentsAideExtractionNiveau1(instance),
    texte(" "),
    latex(formatAideExtractionNiveau2Latex(instance)),
    texte(", donc "),
    latex(formatEtatActuelPointVecteurLatex(instance)),
    texte("."),
  ];
}

/** Justification possible/impossible de la question b) — uniquement pour "explicite_y"/
 * "explicite_x", seules formes où `possible` peut être faux (droite verticale/horizontale). */
function fragmentsJustificationPossibilite(instance: ExerciceEquationDroite): FragmentConsigne[] {
  const forme = instance.formeCible as "explicite_y" | "explicite_x";
  if (forme === "explicite_y") {
    return instance.possible
      ? [texte("Le vecteur directeur n'est pas vertical ("), latex("x_{\\vec{u}} \\neq 0"), texte("), cette forme est donc possible.")]
      : [texte("Le vecteur directeur est vertical ("), latex("x_{\\vec{u}} = 0"), texte("), cette droite est verticale : impossible sous cette forme.")];
  }
  return instance.possible
    ? [texte("Le vecteur directeur n'est pas horizontal ("), latex("y_{\\vec{u}} \\neq 0"), texte("), cette forme est donc possible.")]
    : [texte("Le vecteur directeur est horizontal ("), latex("y_{\\vec{u}} = 0"), texte("), cette droite est horizontale : impossible sous cette forme.")];
}

/** Équation finale simplifiée de la question b), quelle que soit `formeCible` — pour
 * "explicite_y"/"explicite_x" avec `possible === false`, c'est la forme implicite de secours
 * (même principe que `latexGabaritPossibiliteCoefficients`/`formatAideNiveau2PossibiliteCoefficients
 * Latex` côté écran : la forme testée si possible, l'implicite sinon). */
function equationFinaleLatex(instance: ExerciceEquationDroite): string {
  switch (instance.formeCible) {
    case "parametrique":
      return formatAideCoefficientsNiveau2Latex(instance);
    case "implicite":
      return formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
    case "explicite_y":
      return instance.refExpliciteY !== null
        ? formatEquationExpliciteYLatex(instance.refExpliciteY.m, instance.refExpliciteY.p)
        : formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
    case "explicite_x":
      return instance.refExpliciteX !== null
        ? formatEquationExpliciteXLatex(instance.refExpliciteX.n, instance.refExpliciteX.q)
        : formatEquationImpliciteLatex(instance.referenceImplicite.a, instance.referenceImplicite.b, instance.referenceImplicite.c);
  }
}

/** Question b) — forme cible : "parametrique" s'obtient par simple substitution (le gabarit
 * substitué EST déjà le résultat final, aucun calcul de simplification supplémentaire — un seul
 * bloc LaTeX, jamais répété) ; "implicite" affiche la formule substituée puis le résultat simplifié
 * (2 blocs distincts, la substitution `a=…, b=…, c=…` n'étant pas encore l'équation lisible) ;
 * "explicite_y"/"explicite_x" justifient d'abord possible/impossible (seules formes où ça peut être
 * faux) avant la formule substituée puis le résultat qui en découle. */
function fragmentsCorrectionCoefficients(instance: ExerciceEquationDroite): FragmentConsigne[] {
  if (instance.formeCible === "parametrique") {
    return [texte("b) En substituant le point et le vecteur directeur dans le gabarit paramétrique : "), latex(equationFinaleLatex(instance)), texte(".")];
  }

  const fragments: FragmentConsigne[] = [texte("b) ")];
  if (instance.formeCible === "explicite_y" || instance.formeCible === "explicite_x") {
    const choix: "possible" | "impossible" = instance.possible ? "possible" : "impossible";
    fragments.push(...fragmentsJustificationPossibilite(instance), texte(" Formule : "), latex(formatAideNiveau2PossibiliteCoefficientsLatex(instance, choix)));
  } else {
    fragments.push(texte("Formule : "), latex(formatAideCoefficientsNiveau2Latex(instance)));
  }
  fragments.push(texte(", donc "), latex(equationFinaleLatex(instance)), texte("."));
  return fragments;
}

function construireCorrectionEquationDroite(instance: ExerciceEquationDroite): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: fragmentsCorrectionExtraction(instance) },
    { type: "paragraphe", fragments: fragmentsCorrectionCoefficients(instance) },
  ];
}

export const adaptateurEvaluationEquationDroite: AdaptateurFeuilleExercices<ExerciceEquationDroite> = {
  titreDocument: "Équation d'une droite — Évaluation",
  nomFichierBase: "equation-droite",
  genererInstance: genererExerciceEquationDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceEquationDroite,
  construireCorrection: construireCorrectionEquationDroite,
};
