import type { ExercicePolygonesArcsSecteurs } from "../../core5e/polygonesArcsSecteurs.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneGenerale,
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
} from "../../ui5e/formatPolygonesArcsSecteurs";
import { construireAvecPresence, genererExercicePolygonesArcsSecteurs } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePolygonesArcsSecteurs>` pour 5gen7 (Polygones,
 * arcs et secteurs) — feuille d'évaluation. L'écran interactif fait lire le nombre de crans "k"
 * d'un segment multi-pas DIRECTEMENT sur un diagramme (`polygoneCercleSketch.ts`) — la version
 * papier n'a pas de diagramme et révèle donc "k" en toutes lettres dans l'énoncé plutôt que de
 * demander un comptage visuel, seule adaptation nécessaire (les formules/réponses restent
 * identiques, réutilisées telles quelles de `ui5e/formatPolygonesArcsSecteurs.ts`).
 */

function construireEnoncePolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): SectionExercice {
  const questions: QuestionExercice[] = [
    { consigne: [texte("Calcule la circonférence et l'aire du cercle entier (arrondis au centième près).")], reponse: { type: "lignes", nombre: 2 } },
    { consigne: [texte("Calcule la longueur de l'arc élémentaire, entre 2 sommets consécutifs (arrondis au centième près).")], reponse: { type: "lignes", nombre: 1 } },
    { consigne: [texte("Calcule l'aire du secteur élémentaire, entre 2 sommets consécutifs (arrondis au centième près).")], reponse: { type: "lignes", nombre: 1 } },
  ];
  if (exercice.arcMultiPas !== null) {
    questions.push({
      consigne: [texte(`Calcule la longueur de l'arc reliant 2 sommets espacés de ${exercice.arcMultiPas.k} crans, dans le sens le plus court (arrondis au centième près).`)],
      reponse: { type: "lignes", nombre: 1 },
    });
  }
  if (exercice.secteurMultiPas !== null) {
    questions.push({
      consigne: [texte(`Calcule l'aire du secteur reliant 2 sommets espacés de ${exercice.secteurMultiPas.k} crans, dans le sens le plus court (arrondis au centième près).`)],
      reponse: { type: "lignes", nombre: 1 },
    });
  }
  return { enteteFragments: [texte(consigneGenerale(exercice))], questions };
}

function construireCorrectionPolygonesArcsSecteurs(exercice: ExercicePolygonesArcsSecteurs): BlocCorrection[] {
  const blocs: BlocCorrection[] = [
    {
      type: "paragraphe",
      fragments: [texte("Circonférence = "), latex(formatCirconferenceAttendueLatex(exercice)), texte(", Aire = "), latex(formatAireTotaleAttendueLatex(exercice)), texte(".")],
    },
    { type: "paragraphe", fragments: [texte("Arc élémentaire = "), latex(formatArcElementaireAttendueLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [texte("Secteur élémentaire = "), latex(formatSecteurElementaireAttendueLatex(exercice)), texte(".")] },
  ];
  const arcMultiPas = formatArcMultiPasAttendueLatex(exercice);
  if (arcMultiPas !== null) blocs.push({ type: "paragraphe", fragments: [texte("Arc multi-pas = "), latex(arcMultiPas), texte(".")] });
  const secteurMultiPas = formatSecteurMultiPasAttendueLatex(exercice);
  if (secteurMultiPas !== null) blocs.push({ type: "paragraphe", fragments: [texte("Secteur multi-pas = "), latex(secteurMultiPas), texte(".")] });
  return blocs;
}

export const adaptateurEvaluationPolygonesArcsSecteurs: AdaptateurFeuilleExercices<ExercicePolygonesArcsSecteurs> = {
  titreDocument: "Polygones, arcs et secteurs — Évaluation",
  nomFichierBase: "polygones-arcs-secteurs",
  genererInstance: genererExercicePolygonesArcsSecteurs,
  catalogueVariantes: [
    { id: "aucun", label: "Sans écran bonus" },
    { id: "arc", label: "+ arc multi-pas" },
    { id: "secteur", label: "+ secteur multi-pas" },
    { id: "les-deux", label: "+ arc et secteur multi-pas" },
  ],
  genererInstanceAvecVariante: (id) => construireAvecPresence(id === "arc" || id === "les-deux", id === "secteur" || id === "les-deux"),
  construireEnonce: construireEnoncePolygonesArcsSecteurs,
  construireCorrection: construireCorrectionPolygonesArcsSecteurs,
};
