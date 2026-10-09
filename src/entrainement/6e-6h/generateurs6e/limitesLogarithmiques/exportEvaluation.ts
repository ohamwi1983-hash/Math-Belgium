import type { ExerciceLimiteLogarithmique } from "../../core6e/limitesLogarithmiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreAffiche } from "../../ui6e/formatGraphiquesCyclometriques";
import { CONSIGNE_GENERALE, configDiagnosticPartiesC, consigneEcran, formatCategorieLabel, formatCibleTexte, formatLimiteEnonceLatex } from "../../ui6e/formatLimitesLogarithmiques";
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
 * `moteur6e/typesLimitesLogarithmiques.ts` (`phaseInitiale`/`phaseApres`) : familles A/B/C = 2
 * écrans, D/E = 3 écrans. Chaque écran RÉELLEMENT traversé devient donc une question a)/b)/(c)
 * séparée (même principe que `equationsCyclometriques`, 6gen3, PAS `deriveesCyclometriques`) —
 * `regroupable` n'est donc PAS activé ici (plusieurs questions par instance, consignes non
 * génériques). Les consignes réutilisent directement `consigneEcran` (ui6e), jamais réécrites en
 * dur ici, pour rester en synchronie avec le texte affiché côté écran interactif. Le corrigé
 * réutilise uniquement des valeurs déjà calculées par le générateur ou des formules déjà établies
 * et documentées dans `core6e/limitesLogarithmiques.types.ts`/`moteur6e/
 * verificationLimitesLogarithmiques.ts` (jamais recalculées indépendamment) :
 * - Famille A : `dominanceNumerateur`/`dominanceDenominateur`/`limiteGlobale`.
 * - Famille B : reformulation en `u=x/x0−1` (forme vérifiée par `verifierBReformuler`) puis
 *   `limiteFinale` (= m·x0/k pour "quotient", x0·ln(k) pour "produit", cf. `familles/B.ts`).
 * - Famille C : `partieNumerateur`/`partieDenominateur` (ou `partieFacteur1`/`partieFacteur2` pour
 *   c2) puis `limiteFinale`.
 * - Famille D : exposant `(c/x²)·ln(cos(kx))` (forme vérifiée par `verifierDExposant`), puis
 *   `limiteExposant`, puis `limiteFinale` (= e^limiteExposant).
 * - Famille E (instance unique) : numérateur développé à l'ordre 2 `x²(ln3+1/2)` (forme vérifiée
 *   par `verifierEDevelopper`), puis le rapport simplifié — qui vaut déjà `limiteFinale`, la
 *   simplification par x² ne changeant pas la valeur numérique — puis `limiteFinale`.
 */

function formatUnPlusKU(coefficient: number): string {
  if (coefficient === 0) return "1";
  const abs = Math.abs(coefficient);
  const corps = abs === 1 ? "u" : `${abs}u`;
  return coefficient > 0 ? `1+${corps}` : `1-${corps}`;
}

function formatKU(coefficient: number): string {
  if (coefficient === 1) return "u";
  if (coefficient === -1) return "-u";
  return `${coefficient}u`;
}

function construireEnonceLimitesLogarithmiques(exercice: ExerciceLimiteLogarithmique): SectionExercice {
  const entete = [texte(CONSIGNE_GENERALE + " "), latex(formatLimiteEnonceLatex(exercice))];

  switch (exercice.famille) {
    case "A":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: [texte(consigneEcran("aDominance", exercice))], reponse: { type: "lignes", nombre: 2 } },
          { consigne: [texte(consigneEcran("aConclure", exercice))], reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "B":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: [texte(consigneEcran("bReformuler", exercice))], reponse: { type: "lignes", nombre: 2 } },
          { consigne: [texte(consigneEcran("bConclure", exercice))], reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "C":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: [texte(consigneEcran("cDiagnostic", exercice))], reponse: { type: "lignes", nombre: 2 } },
          { consigne: [texte(consigneEcran("cConclure", exercice))], reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "D":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: [texte(consigneEcran("dExposant", exercice))], reponse: { type: "lignes", nombre: 2 } },
          { consigne: [texte(consigneEcran("dLimiteExposant", exercice))], reponse: { type: "lignes", nombre: 1 } },
          { consigne: [texte(consigneEcran("dConclure", exercice))], reponse: { type: "lignes", nombre: 1 } },
        ],
      };
    case "E":
      return {
        enteteFragments: entete,
        questions: [
          { consigne: [texte(consigneEcran("eDevelopper", exercice))], reponse: { type: "lignes", nombre: 3 } },
          { consigne: [texte(consigneEcran("eSimplifier", exercice))], reponse: { type: "lignes", nombre: 2 } },
          { consigne: [texte(consigneEcran("eConclure", exercice))], reponse: { type: "lignes", nombre: 1 } },
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
        { type: "paragraphe", fragments: [texte("b) Limite : "), latex(formatCibleTexte(exercice.limiteGlobale)), texte(".")] },
      ];

    case "B": {
      const reformulationLatex =
        exercice.sousType === "quotient"
          ? `\\dfrac{\\ln\\!\\left(${formatUnPlusKU(exercice.m * exercice.x0)}\\right)}{${exercice.k}\\ln(1+u)}`
          : `\\dfrac{${formatKU(exercice.x0)}\\cdot\\ln(${exercice.k})}{\\ln(1+u)}`;
      const formuleLimiteLatex = exercice.sousType === "quotient" ? `\\dfrac{${exercice.m}\\cdot ${exercice.x0}}{${exercice.k}}` : `${exercice.x0}\\ln(${exercice.k})`;
      return [
        { type: "paragraphe", fragments: [texte("a) En posant u = x/x0 − 1, f devient : "), latex(reformulationLatex), texte(" (u → 0 puisque ln(1+u)/u → 1).")] },
        {
          type: "paragraphe",
          fragments: [texte("b) Limite : "), latex(formuleLimiteLatex), texte(" = "), latex(formatNombreAffiche(exercice.limiteFinale)), texte(".")],
        },
      ];
    }

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

    case "D": {
      const exposantLatex = `\\dfrac{${exercice.c}}{x^2}\\cdot\\ln\\!\\left(\\cos(${exercice.k}x)\\right)`;
      return [
        { type: "paragraphe", fragments: [texte("a) f^g = e^(g·ln f), avec exposant g(x)·ln(f(x)) = "), latex(exposantLatex), texte(".")] },
        { type: "paragraphe", fragments: [texte("b) Limite de l'exposant : "), latex(formatNombreAffiche(exercice.limiteExposant)), texte(".")] },
        {
          type: "paragraphe",
          fragments: [texte("c) Conclusion : "), latex(`e^{${formatNombreAffiche(exercice.limiteExposant)}}`), texte(" ≈ "), latex(formatNombreAffiche(exercice.limiteFinale)), texte(".")],
        },
      ];
    }

    case "E":
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) Numérateur développé à l'ordre 2 : "),
            latex("\\left(x+x^2\\ln 3\\right) - \\left(x-\\dfrac{x^2}{2}\\right) = x^2\\left(\\ln 3+\\dfrac{1}{2}\\right)"),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments: [
            texte("b) Dénominateur x⁴+4x² ~ 4x² en x→0, donc le rapport simplifié vaut : "),
            latex("\\dfrac{x^2\\left(\\ln 3+\\frac12\\right)}{4x^2} = \\dfrac{\\ln 3+\\frac12}{4}"),
            texte(" ≈ "),
            latex(formatNombreAffiche(exercice.limiteFinale)),
            texte("."),
          ],
        },
        { type: "paragraphe", fragments: [texte("c) Conclusion : "), latex(formatNombreAffiche(exercice.limiteFinale)), texte(".")] },
      ];
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
