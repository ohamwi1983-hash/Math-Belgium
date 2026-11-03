import type { ExerciceHyperboliques } from "../../core6e/hyperboliques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale, type PhaseHyperboliques } from "../../moteur6e/typesHyperboliques";
import { CONSIGNE_GENERALE, blocDonnees, consigneEcran, reponseAttendueLatex } from "../../ui6e/formatHyperboliques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques, type VarianteId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceHyperboliques>` pour `6gen19` (Sinus et cosinus
 * hyperboliques, sh/ch) — feuille d'évaluation.
 *
 * 4 familles STRUCTURELLEMENT DISJOINTES (1 ou 2 écrans chacune, voir `moteur6e/
 * typesHyperboliques.ts`) — condensées ici en autant de questions écrites qu'il y a d'écrans
 * RÉELLEMENT traversés par la famille tirée (`phasesPourExercice`, dérivé des mêmes
 * `phaseInitiale`/`phaseApres` que le moteur de session). Consignes reprises telles quelles depuis
 * `consigneEcran` (texte affiché à l'écran). Famille A ajoute « Justifie en calculant f(−x). » :
 * une feuille papier sans exigence de justification ne testerait rien.
 *
 * Le corrigé réutilise `reponseAttendueLatex` — exactement la réponse révélée à l'écran (valeurs
 * EXACTES, jamais un arrondi), jamais une formule dupliquée ici.
 */

const LETTRES = "abcd";

const NOMBRE_LIGNES_PAR_PHASE: Record<PhaseHyperboliques, number> = {
  aParite: 3,
  bValeurs: 3,
  cDerivee: 3,
  cDeriveeSeconde: 3,
  dReecriture: 3,
  dLimites: 3,
};

function phasesPourExercice(exercice: ExerciceHyperboliques): PhaseHyperboliques[] {
  const phases: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

function construireEnonceHyperboliques(exercice: ExerciceHyperboliques): SectionExercice {
  const phases = phasesPourExercice(exercice);
  const donnees = blocDonnees(exercice);
  return {
    enteteFragments: [...CONSIGNE_GENERALE, latex(donnees.join(",\\quad "))],
    questions: phases.map((phase) => {
      const suffixe = phase === "aParite" ? " Justifie en calculant f(−x)." : "";
      return {
        consigne: suffixe ? [...consigneEcran(exercice, phase), texte(suffixe)] : consigneEcran(exercice, phase),
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_PHASE[phase] },
      };
    }),
  };
}

function construireCorrectionHyperboliques(exercice: ExerciceHyperboliques): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) `), latex(reponseAttendueLatex(exercice, phase))],
  }));
}

export const adaptateurEvaluationHyperboliques: AdaptateurFeuilleExercices<ExerciceHyperboliques> = {
  titreDocument: "Sinus et cosinus hyperboliques (sh, ch) — Évaluation",
  nomFichierBase: "hyperboliques",
  genererInstance: genererExerciceHyperboliques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteId),
  construireEnonce: construireEnonceHyperboliques,
  construireCorrection: construireCorrectionHyperboliques,
};
