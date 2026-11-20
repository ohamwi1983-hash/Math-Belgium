/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen3 (composer f et g) et 5gen4 (composée
 * et lecture graphique), chapitre 1 de 5e. Toutes les valeurs sont exactes (fractions, lectures sur
 * des nœuds entiers) et aucune ne demande la calculatrice : `calcul` ABSENT (sans objet, convention de
 * `profilsEvaluationLogarithmes.ts`) — avec `'exacte'`, une évaluation « calculatrice autorisée »
 * cherchait en vain un cas « calculatrice » (≈ 350 ms perdues par question, mesuré).
 *
 * 5gen3 — `forme` = combinaison de familles et sens (f∘g seul, g∘f seul, les deux) : même question
 * d'une série à l'autre. Cas particulier `domaine-vide` (décision de l'utilisateur, audit 5e ch. 1) :
 * une composée dont le domaine est vide (« √(x + 1) ≤ −2 »), produite de temps en temps (≈ 10 % du
 * tirage libre, `composition.ts::PROBA_VIDE`), jamais filtrée par le générateur ; une évaluation ne
 * la tire que si la case « Inclure un cas particulier » est cochée. Un domaine « inchangé » (égal à
 * celui de l'intérieure) n'est plus gardé qu'une fois sur cinq (`PROBA_CONDITION2_SANS_EFFET`).
 *
 * 5gen4 — `forme` = courbe restreinte (f ou g) et nombre de questions. L'existence de chaque
 * composée est un VERDICT (0 à 3 « n'existe pas » par exercice, ≈ 30 % par question,
 * `composeeGraphique/index.ts::selectionnerQuestions`) : son nombre n'est PAS dans la forme (audit
 * 5e ch. 1, V3 — sinon la série B recopiait celui de la série A, comme gen75 / gen79 en 4e). AUCUN
 * cas particulier.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import type { ExerciceComposeeGraphique } from "../core5e/composeeGraphique.types";
import { normaliserEnMorceaux } from "./composerFonctions/intervalles";

export const LIBELLE_CAS_COMPOSER_FONCTIONS = "Inclure un cas particulier (composée de domaine vide)";

/** Une direction au moins a un domaine vide. */
export function aDomaineVide(e: ExerciceComposerFonctions): boolean {
  return [e.fRondG, e.gRondF].some((d) => d !== null && normaliserEnMorceaux(d.domaine).length === 0);
}

function familleDe(e: ExerciceComposerFonctions, nom: "f" | "g"): string {
  return (nom === "f" ? e.f : e.g).fonction.type;
}

export function profilComposerFonctions(e: ExerciceComposerFonctions): ProfilInstance {
  return { casParticulier: aDomaineVide(e) ? "domaine-vide" : null, forme: `${familleDe(e, "f")}+${familleDe(e, "g")}-${e.sens}` };
}

export function profilComposeeGraphique(e: ExerciceComposeeGraphique): ProfilInstance {
  return { casParticulier: null, forme: `${e.restreinte}-${e.questions.length}q` };
}
