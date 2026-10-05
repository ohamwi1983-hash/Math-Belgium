import type { Categorie } from "../core/generateur.types";
import type {
  ExerciceEquationRationnelle,
  GenerateurExerciceEquationRationnelle,
} from "../core/equationRationnelle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Séquence ce → [simplifier] → isolement → [reconnaissance] → champ1 → champ2 →
 * racinesEtrangeres. La phase "simplifier" est sautée quand `exercice.fractionsSimplifiables` est
 * vide (voir `necessiteSimplification` dans sessionEquationRationnelle.ts —
 * prompt-3-simplifier-et-isolement-flexible.md). La phase "reconnaissance" est sautée quand
 * `equationIsolee.categorie === "mise_en_evidence_generalisee"` (voir `necessiteReconnaissance`
 * dans sessionEquationRationnelle.ts) — construction `deux_fractions_lineaires` sous-variantes
 * (a)/(b), prompt-2-cas3-degre1.md — même principe que `necessiteReconnaissance` de session.ts
 * (exercice 1, famille 5). Pour toutes les autres constructions/sous-variantes, la séquence reste
 * fixe et complète (jamais de saut).
 *
 * Cas 4a/4b (prompt-cas4a-4b.md, `exercice.fractionGauche` présent) : séquence entièrement
 * différente — ce → [simplifierReduction →] simplifierReconnaissance → simplifierChamp1 →
 * simplifierChamp2 → simplifierFraction → isolement → [reconnaissance] → champ1 → champ2 →
 * racinesEtrangeres. Les 4 phases "simplifier*" (denomReconnaissance/Champ1/Champ2/Fraction)
 * forment un **premier passage** (reconnaissance/factorisation/racines du P2 embarqué dans la
 * fraction de gauche, puis les 2 champs num/dénom simplifiés) — jamais sautées (systématiques par
 * construction) — suivi d'un **second passage** identique aux autres constructions sur
 * `equationIsolee` (la même équation finale, une fois la fraction simplifiée mise en croix). Les
 * deux passages ont des champs de score entièrement distincts (voir
 * `ResultatExerciceEquationRationnelle` ci-dessous) pour ne jamais les confondre au récapitulatif.
 *
 * "simplifierReduction" (nouvelle, prompt utilisateur du 26/09 — généralise à ce générateur
 * l'étape déjà présente sur gen1/gen2/gen3) : le P2 embarqué dans `fractionGauche` réutilise les
 * mêmes catégories de trinômes que gen1/gen3 (a=randomInt(1,4)) et peut donc avoir des
 * coefficients non réduits — sautée quand pgcd(|a|,|b|,|c|)=1 (voir necessiteReductionCoefficients,
 * sessionEquationRationnelle.ts), sinon toujours la première des phases "simplifier*" (avant même
 * simplifierReconnaissance). Jamais à confondre avec "simplifier" (léger, fractionsSimplifiables)
 * ni "simplifierFraction" (finale, simplifie la fraction complète en factorisant les deux côtés).
 *
 * "champ2" (second passage, equationIsolee) clôture directement l'exercice (→ racinesEtrangeres),
 * quelle que soit la catégorie — l'ancienne étape "factorisation" (a(x-x1)(x-x2)=0 à partir des
 * racines déjà trouvées via Δ, cas_general uniquement) a été retirée
 * (promptgenerateur4equationRationnelle.md, point 4) : une fois Δ calculé et les racines obtenues,
 * refactoriser n'apporte plus rien — les solutions sont déjà connues. Ce retrait est scopé au
 * **second passage** (equationIsolee) uniquement ; "simplifierFactorisation" (premier passage, P2
 * de fractionGauche) reste inchangée, non concernée par ce point.
 */
export type PhaseEquationRationnelle =
  | "ce"
  | "simplifier"
  | "simplifierReduction"
  | "simplifierReconnaissance"
  | "simplifierChamp1"
  | "simplifierChamp2"
  | "simplifierFactorisation"
  | "simplifierFraction"
  | "isolement"
  | "reconnaissance"
  | "champ1"
  | "champ2"
  | "racinesEtrangeres";

export interface ResultatExerciceEquationRationnelle {
  categorie: Categorie;
  scoreCE: number;
  /** true seulement pour la variante EtapeRacinesFlexibles de "ce" (plusieurs CE) — jamais pour EtapeCEDirecte (une seule CE, pas d'aide). */
  aideCeUtilisee: boolean;
  /** null si l'étape "simplifier" a été sautée (aucune fraction individuellement réductible) */
  scoreSimplifier: number | null;
  /** null si l'étape a été sautée (P2 de fractionGauche déjà réduit, ou pas de fractionGauche) */
  scoreSimplifierReduction: number | null;
  aideSimplifierReductionUtilisee: boolean;
  /** premier passage (cas 4a/4b uniquement) : reconnaissance/factorisation/racines du P2 de fractionGauche, puis simplification — null sinon */
  scoreSimplifierReconnaissance: number | null;
  simplifierCategorieRevelee: boolean;
  scoreSimplifierChamp1: number | null;
  aideSimplifierChamp1Utilisee: boolean;
  scoreSimplifierChamp2: number | null;
  aideSimplifierChamp2Utilisee: boolean;
  /** score de l'étape "simplifierFactorisation" (prompt-corrections-etat-actuel-et-duplication.md,
   * point 1), null sauf si le P2 de fractionGauche est cas_general. */
  scoreSimplifierFactorisation: number | null;
  aideSimplifierFactorisationUtilisee: boolean;
  scoreSimplifierFraction: number | null;
  aideSimplifierFractionUtilisee: boolean;
  scoreIsolement: number;
  aideIsolementUtilisee: boolean;
  /** null si l'étape de reconnaissance a été sautée (categorie mise_en_evidence_generalisee) */
  scoreReconnaissance: number | null;
  categorieRevelee: boolean;
  /** null si la factorisation a été sautée (equationIsolee.enonce.a===0, chemin linéaire — prompt-4-chemin-lineaire.md) */
  scoreChampPrincipal: number | null;
  aideChamp1Utilisee: boolean;
  scoreRacines: number;
  aideChamp2Utilisee: boolean;
  scoreRacinesEtrangeres: number;
}

export interface EtatSessionEquationRationnelle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationRationnelle;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceEquationRationnelle;
  phase: PhaseEquationRationnelle;
  etapeCourante: EtatEtapeTentatives;
  scoreCEExercice: number | null;
  scoreSimplifierExercice: number | null;
  scoreSimplifierReductionExercice: number | null;
  scoreSimplifierReconnaissanceExercice: number | null;
  simplifierCategorieRevelee: boolean;
  scoreSimplifierChamp1Exercice: number | null;
  scoreSimplifierChamp2Exercice: number | null;
  scoreSimplifierFactorisationExercice: number | null;
  scoreSimplifierFractionExercice: number | null;
  scoreIsolementExercice: number | null;
  scoreReconnaissanceExercice: number | null;
  categorieRevelee: boolean;
  scoreChampPrincipalExercice: number | null;
  scoreRacinesExercice: number | null;
  /**
   * Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture —
   * conceptionaidescomposantspartageshistorique.md) — remises à false au passage à l'exercice
   * suivant, comme les autres champs "transitoires" ci-dessus. `aideCeUtilisee` ne concerne que la
   * variante `EtapeRacinesFlexibles` de la phase "ce" (plusieurs CE) — `EtapeCEDirecte` (une seule
   * CE) n'a pas d'aide.
   */
  aideCeUtilisee: boolean;
  aideSimplifierReductionUtilisee: boolean;
  aideSimplifierChamp1Utilisee: boolean;
  aideSimplifierChamp2Utilisee: boolean;
  aideSimplifierFactorisationUtilisee: boolean;
  aideSimplifierFractionUtilisee: boolean;
  aideIsolementUtilisee: boolean;
  aideChamp1Utilisee: boolean;
  aideChamp2Utilisee: boolean;
  resultats: ResultatExerciceEquationRationnelle[];
  terminee: boolean;
}
