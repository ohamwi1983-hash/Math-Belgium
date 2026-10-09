import type { ExerciceArcSecteur, QuantiteArcSecteur } from "../../core5e/arcsSecteurs.types";
import { ORDRE_QUANTITES_ARC_SECTEUR } from "../../core5e/arcsSecteurs.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneConversion,
  formatValeurCibleConversionLatex,
  formatValeurQuantiteLatex,
  labelQuantite,
  labelReponseConversion,
  latexEnonceConversion,
} from "../../ui5e/formatArcsSecteurs";
import { genererExerciceArcSecteur, genererExerciceConversion, genererExerciceDeuxVersTrois } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceArcSecteur>` pour 5gen6 (Arcs et secteurs) —
 * feuille d'évaluation. `ExerciceArcSecteur` a 2 modes structurellement disjoints (voir
 * `core5e/arcsSecteurs.types.ts`) : "deuxVersTrois" (2 des 5 quantités θ°/θ_rad/r/l/A données, les
 * 3 autres à retrouver) et "conversion" (conversion degrés↔radians pure) — les deux gérés ici, tout
 * `formatValeurQuantiteLatex`/`labelQuantite` réutilisés tels quels de l'écran interactif.
 */

function construireEnonceArcSecteur(exercice: ExerciceArcSecteur): SectionExercice {
  if (exercice.mode === "conversion") {
    return {
      enteteFragments: [latex(latexEnonceConversion(exercice))],
      questions: [{ consigne: [texte(consigneConversion(exercice))], reponse: { type: "lignes", nombre: 2 } }],
    };
  }
  const manquantes = ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => !exercice.connues.includes(q));
  const [c0, c1] = exercice.connues;
  return {
    enteteFragments: [
      texte("Pour un secteur circulaire, on donne "),
      latex(`${labelQuantite(c0)} ${formatValeurQuantiteLatex(c0, exercice)} \\quad ${labelQuantite(c1)} ${formatValeurQuantiteLatex(c1, exercice)}`),
    ],
    questions: [
      {
        consigne: [texte(`Détermine les 3 quantités manquantes : ${manquantes.map((q) => labelQuantite(q).replace(/\s*=\s*$/, "")).join(", ")} (arrondis au centième près).`)],
        reponse: { type: "lignes", nombre: 4 },
      },
    ],
  };
}

function construireCorrectionArcSecteur(exercice: ExerciceArcSecteur): BlocCorrection[] {
  if (exercice.mode === "conversion") {
    return [{ type: "paragraphe", fragments: [latex(`${labelReponseConversion(exercice)} ${formatValeurCibleConversionLatex(exercice)}`)] }];
  }
  const manquantes = ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => !exercice.connues.includes(q));
  return manquantes.map((q: QuantiteArcSecteur) => ({
    type: "paragraphe",
    fragments: [latex(`${labelQuantite(q)} ${formatValeurQuantiteLatex(q, exercice)}`)],
  }));
}

export const adaptateurEvaluationArcSecteur: AdaptateurFeuilleExercices<ExerciceArcSecteur> = {
  titreDocument: "Arcs et secteurs — Évaluation",
  nomFichierBase: "arcs-secteurs",
  genererInstance: genererExerciceArcSecteur,
  catalogueVariantes: [
    { id: "deuxVersTrois", label: "2 données → 3 inconnues" },
    { id: "conversion", label: "Conversion degrés ↔ radians" },
  ],
  genererInstanceAvecVariante: (id) => (id === "conversion" ? genererExerciceConversion() : genererExerciceDeuxVersTrois()),
  construireEnonce: construireEnonceArcSecteur,
  construireCorrection: construireCorrectionArcSecteur,
};
