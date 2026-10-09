import type { ExerciceFamilleA_Direct } from "../../core6e/calculPrimitives.types";
import type { ExerciceIntegraleMoyenne } from "../../core6e/integralesDefinies.types";
import type { ContexteFamilleE, ExerciceFamilleE_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille E de `6gen29` : valeur moyenne en contexte applicatif, RÉUTILISE
 * DIRECTEMENT le type `ExerciceIntegraleMoyenne` (`core6e/integralesDefinies.types.ts`, 6gen25) et,
 * côté Couche B (`moteur6e/verificationIntegralesProblemes.ts`), les fonctions
 * `diagnostiquerFinalIntegrale`/`diagnostiquerValeurMoyenne` de `moteur6e/verificationIntegralesDefinies.ts`
 * — jamais réimplémentées (voir en-tête `core6e/integralesProblemes.types.ts`).
 *
 * `primitive` — un `ExerciceFamilleA_Direct` MINIMAL (au plus 2 termes affines : m·t et une
 * constante) construit ICI plutôt qu'emprunté à `generateurs6e/calculPrimitives/` : les 8 formes de
 * terme possibles là-bas (ln, arctan, 1/x...) produiraient un "taux de variation d'un stock/cours
 * de bourse" incohérent narrativement — mais l'objet reste 100% conforme au contrat
 * `ExerciceFamilleA_Direct` de `core6e/calculPrimitives.types.ts`, donc 100% compatible avec la
 * vérification empruntée sans aucune adaptation.
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

interface OptionsInterpretation {
  optionsInterpretation: { valeur: string; label: string }[];
  interpretationCorrecte: string;
}

function optionsPourContexte(contexte: ContexteFamilleE): OptionsInterpretation {
  if (contexte === "stock") {
    return {
      interpretationCorrecte: "moyenne",
      optionsInterpretation: [
        { valeur: "moyenne", label: "Le niveau moyen du stock sur toute la période considérée." },
        { valeur: "final", label: "Le niveau du stock à la toute fin de la période." },
        { valeur: "maximum", label: "Le niveau maximum jamais atteint par le stock." },
        { valeur: "variation_totale", label: "La variation totale du stock sur la période." },
      ],
    };
  }
  return {
    interpretationCorrecte: "moyenne",
    optionsInterpretation: [
      { valeur: "final", label: "Le cours de l'action à la fin de la période." },
      { valeur: "moyenne", label: "Le cours moyen de l'action sur toute la période considérée." },
      { valeur: "maximum", label: "Le cours le plus élevé atteint pendant la période." },
      { valeur: "variation_totale", label: "La variation totale du cours sur la période." },
    ],
  };
}

/** f(t) = m·t + c (au moins un coefficient non nul) — taux de variation. */
function construirePrimitive(): ExerciceFamilleA_Direct {
  const m = choisir([-3, -2, -1, 1, 2, 3]);
  const c = entierEntre(-5, 5);
  const termes = c === 0 ? [{ type: "puissance" as const, coef: m, n: 1 }] : [{ type: "puissance" as const, coef: m, n: 1 }, { type: "constante" as const, coef: c }];
  return {
    famille: "A",
    sousType: "direct",
    termes,
    primitiveReference: (t: number) => (m / 2) * t * t + c * t,
    integrandeReference: (t: number) => m * t + c,
  };
}

export function construireFamilleE(): ExerciceFamilleE_Problemes {
  const contexte: ContexteFamilleE = Math.random() < 0.5 ? "stock" : "action";
  const primitive = construirePrimitive();
  const b = choisir([4, 6, 8, 10]);
  const exerciceMoyenne: ExerciceIntegraleMoyenne = { scenario: "moyenne", primitive, a: 0, b };
  const { optionsInterpretation, interpretationCorrecte } = optionsPourContexte(contexte);
  return { famille: "E", contexte, exerciceMoyenne, optionsInterpretation, interpretationCorrecte };
}
