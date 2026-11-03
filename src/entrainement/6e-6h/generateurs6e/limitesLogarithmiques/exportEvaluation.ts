import type { ExerciceLimiteLogarithmique } from "../../core6e/limitesLogarithmiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, configDiagnosticPartiesC, consigneEcran, formatCategorieLabel, formatCibleTexte, formatLimiteEnonceLatex, formatReformulationBLatex } from "../../ui6e/formatLimitesLogarithmiques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLimiteLogarithmique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique>` pour `6gen17` (Calcul de
 * limites, fonctions logarithmes) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (6gen4, UNE seule question générique par instance),
 * `6gen17` a une consigne écran PAR FAMILLE (et parfois par sous-type, ex. B) qui change de nature
 * à chaque étape (identifier une dominance, poser une substitution, diagnostiquer chaque partie,
 * calculer un exposant puis sa limite, développer puis simplifier...) — voir
 * `moteur6e/typesLimitesLogarithmiques.ts` (`phaseInitiale`/`phaseApres`) : 2 écrans par famille.
 * Chaque écran RÉELLEMENT traversé devient donc une question a)/b) séparée — `regroupable` n'est
 * donc PAS activé ici. Les consignes réutilisent directement `consigneEcran` (ui6e), jamais
 * réécrites en dur ici. Le corrigé n'affiche que des formes EXACTES déjà construites par le
 * générateur (`CibleLimiteLog.latex`, `limiteLatex`, `formatReformulationBLatex`) et une valeur
 * approchée à virgule quand elle est utile — jamais un flottant brut à point décimal (audit
 * chapitre 3 de 6e, point 7).
 */

/** Valeur approchée au centième, virgule décimale. */
function formatApproche(valeur: number): string {
  return valeur.toFixed(2).replace(".", "{,}");
}

function construireEnonceLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): SectionExercice {
  const entete = [texte(CONSIGNE_GENERALE + " "), latex(formatLimiteEnonceLatex(exercice))];

  switch (exercice.famille) {
    case "A":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("aDominance", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("aConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "B":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("bReformuler", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("bConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "C":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: consigneEcran("cDiagnostic", exercice), reponse: { type: "lignes", nombre: 2 } },
          { consigne: consigneEcran("cConclure", exercice), reponse: { type: "lignes", nombre: 1 } },
        ],
      };
  }
}

function construireCorrectionLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): BlocCorrection[] {
  switch (exercice.famille) {
    case "A":
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) Dominance — numérateur : "),
            texte(formatCategorieLabel(exercice.dominanceNumerateur)),
            texte(", dénominateur : "),
            texte(formatCategorieLabel(exercice.dominanceDenominateur)),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments:
            exercice.limiteGlobale.type === "valeur" && exercice.limiteGlobale.latex !== "1"
              ? [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(" ≈ "), latex(formatApproche(exercice.limiteGlobale.valeur)), texte(".")]
              : [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(".")],
        },
      ];

    case "B":
      return [
        { type: "paragraphe", fragments: [texte("a) En posant u = x/x₀ − 1 (u → 0), f devient : "), latex(formatReformulationBLatex(exercice)), texte(", où apparaît la limite de référence ln(1+u)/u → 1.")] },
        {
          type: "paragraphe",
          fragments:
            exercice.sousType === "produit"
              ? [texte("b) Limite : "), latex(exercice.limiteLatex), texte(" ≈ "), latex(formatApproche(exercice.limiteFinale)), texte(".")]
              : [texte("b) Limite : "), latex(exercice.limiteLatex), texte(".")],
        },
      ];

    case "C": {
      const { partie1, partie2 } = configDiagnosticPartiesC(exercice);
      const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
      return [
        {
          type: "paragraphe",
          fragments: [
            texte(`a) ${partie1.label} : `),
            latex(formatCibleTexte(cible1)),
            texte(`. ${partie2.label} : `),
            latex(formatCibleTexte(cible2)),
            texte("."),
          ],
        },
        { type: "paragraphe", fragments: [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteFinale)), texte(".")] },
      ];
    }
  }
}

export const adaptateurEvaluationLimitesLogarithmiques: AdaptateurFeuilleExercices<ExerciceLimiteLogarithmique> = {
  titreDocument: "Calcul de limites (fonctions logarithmes) — Évaluation",
  nomFichierBase: "limites-logarithmiques",
  genererInstance: genererExerciceLimiteLogarithmique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceLimitesLogarithmiques,
  construireCorrection: construireCorrectionLimitesLogarithmiques,
};
