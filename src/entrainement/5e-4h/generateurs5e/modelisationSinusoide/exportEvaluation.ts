import type { ExerciceModelisationSinusoide } from "../../core5e/modelisationSinusoide.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGeneralePartie1, formatTermesDonneesConstructionLatex, formatTermesReponseAttendueModelisationSinusoide } from "../../ui5e/formatModelisationSinusoide";
import { genererDonneesB3 } from "./techniqueB3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceModelisationSinusoide>` pour 5gen13 (Modéliser une
 * fonction sinusoïdale en contexte) — feuille d'évaluation. `5gen13` combine 4 techniques de
 * construction (B1/B2/B3/donnée) et une Phase 2 optionnelle à 3 types (voir
 * `core5e/modelisationSinusoide.types.ts`) ; la version papier n'en couvre volontairement qu'UNE
 * combinaison — la technique B3 (système à 2 points), sans Phase 2 — même principe de
 * simplification que pour 5gen5/5gen10. `phase2: null` construit un `ExerciceModelisationSinusoide`
 * minimal, directement consommable par les fonctions de formatage déjà établies côté écran
 * interactif (qui prennent toutes l'exercice complet, jamais `DonneesB3` isolément).
 */

function construireExerciceB3(): ExerciceModelisationSinusoide {
  return { phase1: genererDonneesB3(), phase2: null };
}

function construireEnonceModelisationSinusoide(exercice: ExerciceModelisationSinusoide): SectionExercice {
  const donnees = formatTermesDonneesConstructionLatex(exercice);
  return {
    enteteFragments: [texte(consigneGeneralePartie1(exercice) + " Données : "), latex(donnees.join(" \\quad "))],
    questions: [
      {
        consigne: [texte("Détermine ω et φ, puis écris la fonction f(t) complète (arrondis au centième près).")],
        reponse: { type: "lignes", nombre: 3 },
      },
    ],
  };
}

function construireCorrectionModelisationSinusoide(exercice: ExerciceModelisationSinusoide): BlocCorrection[] {
  // `formatTermesReponseAttendueModelisationSinusoide(exercice, "fonctionFinale")` renvoie déjà
  // "f(t) = ..." préfixé (voir `formatFonctionLatex`, Couche présentation) — jamais reproduire le
  // label ici, sous peine d'un "f(t) = f(t) = ..." dupliqué.
  const reponse = formatTermesReponseAttendueModelisationSinusoide(exercice, "fonctionFinale");
  return [{ type: "paragraphe", fragments: reponse.map(latex) }];
}

export const adaptateurEvaluationModelisationSinusoide: AdaptateurFeuilleExercices<ExerciceModelisationSinusoide> = {
  titreDocument: "Modéliser une fonction sinusoïdale en contexte — Évaluation",
  nomFichierBase: "modelisation-sinusoide",
  genererInstance: construireExerciceB3,
  construireEnonce: construireEnonceModelisationSinusoide,
  construireCorrection: construireCorrectionModelisationSinusoide,
};
