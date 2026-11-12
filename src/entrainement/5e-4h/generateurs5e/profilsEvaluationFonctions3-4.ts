/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen3 (composer f et g) et 5gen4 (composée
 * et lecture graphique), chapitre 1 de 5e. Toutes les valeurs sont exactes (fractions, lectures sur
 * des nœuds entiers) et aucune ne demande la calculatrice : `calcul` ABSENT (sans objet, convention de
 * `profilsEvaluationLogarithmes.ts`) — avec `'exacte'`, une évaluation « calculatrice autorisée »
 * cherchait en vain un cas « calculatrice » (≈ 350 ms perdues par question, mesuré).
 *
 * 5gen3 — `forme` = combinaison de familles et sens (f∘g seul, g∘f seul, les deux) : même question
 * d'une série à l'autre. AUCUN cas particulier : le « domaine vide » n'existe pas dans ce générateur
 * (`composition.ts::estDomainePathologique` retire les domaines vides ou réduits à des points), et
 * un domaine « inchangé » (égal à celui de l'intérieure) n'est pas rare dans plusieurs combinaisons
 * (85 % pour racine sur fraction + racine sur fraction, mesuré sur 150 tirages) : ce n'est pas un cas
 * particulier, c'est la situation normale de ces combinaisons.
 *
 * 5gen4 — `forme` = courbe restreinte (f ou g), nombre de questions et nombre de questions « n'existe
 * pas » (1 ou 2). AUCUN cas particulier : chaque exercice contient par construction au moins une
 * question dont le résultat n'existe pas (`composeeGraphique/index.ts::selectionnerQuestions`), ce
 * n'est donc pas une situation particulière mais le piège central de l'exercice.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import type { ExerciceComposeeGraphique } from "../core5e/composeeGraphique.types";

function familleDe(e: ExerciceComposerFonctions, nom: "f" | "g"): string {
  return (nom === "f" ? e.f : e.g).fonction.type;
}

export function profilComposerFonctions(e: ExerciceComposerFonctions): ProfilInstance {
  return { casParticulier: null, forme: `${familleDe(e, "f")}+${familleDe(e, "g")}-${e.sens}` };
}

export function profilComposeeGraphique(e: ExerciceComposeeGraphique): ProfilInstance {
  const horsDomaine = e.questions.filter((q) => !q.resultatExiste).length;
  return { casParticulier: null, forme: `${e.restreinte}-${e.questions.length}q-${horsDomaine}hors` };
}
