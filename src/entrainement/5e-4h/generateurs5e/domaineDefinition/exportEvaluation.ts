import type { ExerciceDomaineDefinition, FamilleDomaineDefinition } from "../../core5e/domaineDefinition.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatCEAttendueLatex, formatDomfLatex } from "../../ui5e/formatDomaineDefinition";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDefinition>` pour 5gen1 (Domaine de
 * définition) — feuille d'évaluation. L'écran interactif guide la résolution en plusieurs étapes
 * (choix du/des slot(s) de CE, résolution détaillée, éventuellement un tableau de signes pour
 * "fractionSousRacine") ; la version papier condense cela en UNE question ("détermine le domaine de
 * définition, en justifiant") — même principe que gen8 (4e) : demander le résultat justifié plutôt
 * que rejouer chaque écran guidé séparément. Le corrigé resynthétise directement depuis les champs
 * déjà connus de l'instance (`formatCEAttendueLatex`/`formatDomfLatex`, `ui5e/formatDomaineDefinition.ts`,
 * déjà utilisés côté écran interactif pour la révélation), jamais une transcription des étapes
 * intermédiaires (résolution détaillée/tableau de signes de "fractionSousRacine"), qui varient trop
 * d'une famille à l'autre pour un texte de corrigé uniforme et concis.
 */

function construireEnonceDomaineDefinition(exercice: ExerciceDomaineDefinition): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(exercice.fLatex)],
    questions: [
      {
        consigne: [texte("Détermine le domaine de définition de "), latex("f"), texte(", en précisant la ou les condition(s) d'existence.")],
        reponse: { type: "lignes", nombre: 4 },
      },
    ],
  };
}

function construireCorrectionDomaineDefinition(exercice: ExerciceDomaineDefinition): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Condition(s) d'existence : "), latex(formatCEAttendueLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [latex(formatDomfLatex(exercice.domf)), texte(".")] },
  ];
}

export const adaptateurEvaluationDomaineDefinition: AdaptateurFeuilleExercices<ExerciceDomaineDefinition> = {
  titreDocument: "Domaine de définition — Évaluation",
  nomFichierBase: "domaine-definition",
  genererInstance: genererExerciceDomaineDefinition,
  catalogueVariantes: CATALOGUE_FAMILLES as { id: string; label: string }[],
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleDomaineDefinition),
  construireEnonce: construireEnonceDomaineDefinition,
  construireCorrection: construireCorrectionDomaineDefinition,
};
