/**
 * Contrat — "Statistique descriptive à une variable" (quiz vrai/faux), cinquante-neuvième
 * générateur du projet, dixième du chapitre 5 ("Statistiques") — voir CLAUDE.md, section
 * "Création — cinquante-neuvième exercice".
 *
 * Contrairement aux 9 autres générateurs du chapitre 5 (gen30-38), qui posent chacun un problème
 * élaboré à construire/calculer, celui-ci est une banque de RAPPEL : 200 affirmations vrai/faux
 * PRÉ-ÉCRITES (jamais générées procéduralement), couvrant l'intégralité du chapitre en 10 thèmes de
 * 20 questions chacun. Chaque thème correspond à une `VarianteQuizStatistiqueDescriptive` — ici le
 * catalogue de variantes n'est pas qu'un habillage de présentation (comme pour les autres
 * générateurs), il PARTITIONNE le contenu réellement posé, et le thème est choisi par l'ÉLÈVE lui-
 * même en écran d'accueil (jamais par le panneau dev, qui reste réservé à forcer un thème précis
 * pendant le développement — CLAUDE.md, "Panneau dev").
 *
 * **Mono-écran** (comme "Comparaison de deux séries statistiques"/"Quel angle ?") — une seule
 * question par exercice, tirée dans la banque du thème actif. **Une seule tentative** (jamais
 * `tentativesMax` du réglage global) : avec exactement 2 réponses possibles, un second essai après
 * un échec serait trivialement deviné, donc pédagogiquement sans valeur — voir
 * `moteur/sessionQuizStatistiqueDescriptive.ts`.
 */

export type VarianteQuizStatistiqueDescriptive =
  | "vocabulaire"
  | "effectifsFrequences"
  | "graphiques"
  | "mode"
  | "moyenne"
  | "medianeQuartiles"
  | "dispersion"
  | "boiteMoustaches"
  | "bienaymeTchebychev"
  | "comparaisonSeries";

/** Une affirmation pré-écrite, sa réponse correcte et sa justification pédagogique — jamais
 * générée à partir de valeurs numériques tirées, contrairement à tous les autres exercices du
 * projet (contenu figé, vérifié une fois pour toutes à la rédaction). */
export interface QuestionVraiFaux {
  enonce: string;
  reponse: boolean;
  justification: string;
}

export interface ExerciceQuizStatistiqueDescriptive {
  variante: VarianteQuizStatistiqueDescriptive;
  question: QuestionVraiFaux;
}

export type GenerateurExerciceQuizStatistiqueDescriptive = () => ExerciceQuizStatistiqueDescriptive;
