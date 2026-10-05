/**
 * Couche B (5e) — types pour 5gen10, EXTENSION à 4 familles ("Équations trigonométriques", voir
 * CLAUDE.md section 5gen10 "Extension — 4 familles"). Écran 0 ("reconnaissance", commun) PUIS
 * dispatch sur `exercice.famille` vers l'une de 4 séquences structurellement DISJOINTES — jamais
 * un même nom de phase partagé entre 2 familles (sauf "reconnaissance", commune par construction).
 *
 * - **directe** : reconnaissance → argument → [isolerX →] solutions (`isolerX`/`solutions` sautés
 *   ENSEMBLE si `exercice.exercice.aucuneSolution`, comportement hérité tel quel de la version
 *   pré-extension).
 * - **produit** : reconnaissance → [prefacteur →] separerFacteurs → argumentProduit →
 *   isolerXProduit → solutionsProduit (`prefacteur` présent ssi `exercice.sousCas ===
 *   "nonFactoree"`).
 * - **pythagoricienne** : reconnaissance → conversionPythagoricienne → racinesPythagoricienne →
 *   racinesResolution → solutionsPythagoricienne (séquence FIXE, jamais de saut — les racines
 *   invalides sont REJETÉES à l'écran "racinesResolution", pas sautées en amont).
 * - **egalite** : reconnaissance → conversionEgalite → resoudreEgalite → solutionsEgalite
 *   (séquence FIXE ; "resoudreEgalite" fusionne les écrans "appliquer l'identité"/"isoler x" de la
 *   spec — voir `generateurs5e/equationsTrigonometriques/egaliteExpressions.ts`).
 *
 * `scoresPartiels: Partial<Record<PhaseEquationTrigonometrique, number>>` — le SET de phases
 * réellement scoré varie structurellement d'une famille à l'autre (4 séquences disjointes, pas un
 * sous-ensemble d'un ensemble fixe commun) : un `Partial<Record>` reste ici la modélisation la plus
 * honnête, même principe déjà établi pour `ResultatExerciceDeuxVersTrois` (5gen6, voir CLAUDE.md).
 */
import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  FamilleEquationTrigonometrique,
} from "../core5e/equationsTrigonometriques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEquationTrigonometrique =
  | "reconnaissance"
  | "argument"
  | "isolerX"
  | "solutions"
  | "prefacteur"
  | "separerFacteurs"
  | "argumentProduit"
  | "isolerXProduit"
  | "solutionsProduit"
  | "conversionPythagoricienne"
  | "racinesPythagoricienne"
  | "racinesResolution"
  | "solutionsPythagoricienne"
  | "conversionEgalite"
  | "resoudreEgalite"
  | "solutionsEgalite";

export function phaseInitiale(): PhaseEquationTrigonometrique {
  return "reconnaissance";
}

/** Détermine la phase suivante à partir de la phase COURANTE et de l'exercice — `"termine"` marque
 * la dernière phase de chaque famille. Chaque branche de phase est atteignable par UNE SEULE
 * famille (sauf "reconnaissance"), donc aucune ambiguïté à lever depuis `exercice.famille` seul. */
export function phaseApres(exercice: ExerciceEquationTrigonometrique, phase: PhaseEquationTrigonometrique): PhaseEquationTrigonometrique | "termine" {
  switch (phase) {
    case "reconnaissance":
      switch (exercice.famille) {
        case "directe":
          return "argument";
        case "produit":
          return exercice.sousCas === "nonFactoree" ? "prefacteur" : "separerFacteurs";
        case "pythagoricienne":
          return "conversionPythagoricienne";
        case "egalite":
          return "conversionEgalite";
      }
      break;
    case "argument": {
      if (exercice.famille !== "directe") throw new Error("phaseApres : phase 'argument' hors famille 'directe'");
      return exercice.exercice.aucuneSolution ? "termine" : "isolerX";
    }
    case "isolerX":
      return "solutions";
    case "solutions":
      return "termine";
    case "prefacteur":
      return "separerFacteurs";
    case "separerFacteurs":
      return "argumentProduit";
    case "argumentProduit":
      return "isolerXProduit";
    case "isolerXProduit":
      return "solutionsProduit";
    case "solutionsProduit":
      return "termine";
    case "conversionPythagoricienne":
      return "racinesPythagoricienne";
    case "racinesPythagoricienne":
      return "racinesResolution";
    case "racinesResolution":
      return "solutionsPythagoricienne";
    case "solutionsPythagoricienne":
      return "termine";
    case "conversionEgalite":
      return "resoudreEgalite";
    case "resoudreEgalite":
      return "solutionsEgalite";
    case "solutionsEgalite":
      return "termine";
  }
  throw new Error(`phaseApres : transition inconnue depuis ${phase}`);
}

export interface ResultatDirecteEquationTrig {
  famille: "directe";
  exercice: ExerciceEquationTrig;
  scoreReconnaissance: number;
  scoreArgument: number;
  /** `null` ssi `exercice.aucuneSolution` (écrans absents de la séquence). */
  scoreIsolerX: number | null;
  scoreSolutions: number | null;
}

export interface ResultatProduitEquationTrig {
  famille: "produit";
  exercice: ExerciceProduitFacteurs;
  scoreReconnaissance: number;
  /** `null` ssi `exercice.sousCas === "factoree"` (écran absent). */
  scorePrefacteur: number | null;
  scoreSeparerFacteurs: number;
  scoreArgumentProduit: number;
  scoreIsolerXProduit: number;
  scoreSolutionsProduit: number;
}

export interface ResultatPythagoricienneEquationTrig {
  famille: "pythagoricienne";
  exercice: ExercicePythagoricienne;
  scoreReconnaissance: number;
  scoreConversionPythagoricienne: number;
  scoreRacinesPythagoricienne: number;
  scoreRacinesResolution: number;
  scoreSolutionsPythagoricienne: number;
}

export interface ResultatEgaliteEquationTrig {
  famille: "egalite";
  exercice: ExerciceEgaliteExpressions;
  scoreReconnaissance: number;
  scoreConversionEgalite: number;
  scoreResoudreEgalite: number;
  scoreSolutionsEgalite: number;
}

export type ResultatExerciceEquationTrigonometrique = ResultatDirecteEquationTrig | ResultatProduitEquationTrig | ResultatPythagoricienneEquationTrig | ResultatEgaliteEquationTrig;

export interface EtatSessionEquationTrigonometrique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceEquationTrigonometrique;
  exerciceCourant: ExerciceEquationTrigonometrique;
  phase: PhaseEquationTrigonometrique;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase. */
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEquationTrigonometrique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEquationTrigonometrique[];
  terminee: boolean;
  /** `revele` de la phase qui vient de SE FERMER (celle qui a produit CET état), capturé au moment
   * précis de la transition — jamais celui de `etat.phase` courante (qui n'a pas encore de verdict).
   * C.3 : corrige le bug où `App5gen10.tsx::terminerEtape` lisait `etat.etapeCourante.revelee`
   * PRÉ-soumission (donc structurellement toujours `false` — une phase révélée transite
   * IMMÉDIATEMENT, jamais de render intermédiaire où `etat.etapeCourante.revelee` serait vrai). Lire
   * ce champ sur l'état RETOURNÉ par `soumettreReponseXxx`, jamais sur l'état pré-soumission. `false`
   * à l'état initial (aucune phase encore fermée). */
  derniereEtapeRevelee: boolean;
}

export type { FamilleEquationTrigonometrique };
