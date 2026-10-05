/**
 * Couche B (5e) — types + ordre des écrans pour 5gen24 ("Étude complète"). N'importe jamais rien de
 * `src/generateurs5e/`. Pipeline linéaire à longueur VARIABLE (1 ou 2 exclusions, point vide
 * optionnel, coefficient directeur optionnel, cas spécial optionnel) — jamais un ordre fixe comme
 * 5gen20/5gen21, plutôt dérivé de `exercice` à chaque appel (même principe que 5gen23 pour le
 * dispatch par famille, mais ici la longueur elle-même varie). La variante bonus
 * ("constructionInverse") a sa PROPRE unique phase, jamais mélangée au pipeline.
 *
 * Refonte `prompt5gen24refontecomplete.md` — remplace l'ancien pipeline "domaine → exclusion1(2) →
 * infiniMoins/Plus → classification → casSpecial" par la nouvelle architecture à 8 écrans (détail
 * complet des règles pédagogiques : `docs/historique-5e-limites.md`) :
 * 1. "domaine" — valeurs exclues (inchangé).
 * 2. "typeLimite" — UN écran, classification ∞ vs 0/0 de CHAQUE exclusion (nouveau, remplace la
 *    classification implicite de l'ancien "exclusion1"/"exclusion2").
 * 3. "pointVideSimplification"/"pointVideLimite"/"pointVideConclusion" — UNIQUEMENT si une exclusion
 *    est classée "pointVide" (au plus une par construction) : 3 écrans dédiés (simplifier,
 *    recalculer la limite, conclure AV/domaine).
 * 4. "limitesGD1"/"limitesGD2" — UN écran PAR exclusion NON-point-vide (donc 0, 1 ou 2 écrans selon
 *    le tirage), limites gauche/droite en saisie libre "valeur ou infini".
 * 5. "av" — équation(s) des asymptotes verticales (renommé depuis l'ancien "classification", pour ne
 *    pas être confondu avec la nouvelle "typeLimite").
 * 6. "infini" — UN écran, 2 champs (limite de f(x) en −∞ ET en +∞), TOUJOURS en saisie libre
 *    "valeur ou infini" (remplace l'ancien dispatch par type horizontale/oblique/aucune sur 2 écrans
 *    séparés : la classification émerge désormais de la réponse elle-même, jamais présélectionnée
 *    par l'UI).
 * 7. "coefDirecteur" — UNIQUEMENT si `infini.type !== "horizontale"` (l'une des limites de
 *    l'écran 6 est infinie) : a=lim f(x)/x à chaque borne, distingue "oblique" (pente finie) de
 *    "aucune" (a lui-même infini).
 * 7bis. "coefB" (`prompt5gen24ecran6bisb.md`) — UNIQUEMENT si `infini.type === "oblique"` (a fini,
 *    conclu à l'écran 6) : b=lim (f(x)−a·x) à chaque borne, seule valeur qui distingue une vraie AO
 *    (b fini — toujours le cas ici) d'une absence totale d'asymptote (a déjà infini, écran "aucune",
 *    zéro b à calculer). JAMAIS présent si "aucune" : a est alors infini des DEUX côtés par
 *    construction mathématique (une fraction rationnelle n'a qu'un seul quotient de division
 *    polynomiale valide aux deux bornes — jamais une pente finie d'un côté et infinie de l'autre,
 *    voir `core5e/etudeComplete.types.ts`), donc "coefB" est soit absent, soit présent aux DEUX
 *    bornes simultanément — jamais un seul côté.
 * 8. "asymptoteInfini" — équation(s) AH/AO (ou "aucune"), 2 blocs indépendants "vers −∞"/"vers +∞".
 * 9. "casSpecial" — UNIQUEMENT si un recoupement réel a été construit (inchangé).
 */
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesSession5e } from "../core5e/session5e.types";

export type PhaseEtudeComplete =
  | "domaine"
  | "typeLimite"
  | "pointVideSimplification"
  | "pointVideLimite"
  | "pointVideConclusion"
  | "limitesGD1"
  | "limitesGD2"
  | "av"
  | "infini"
  | "coefDirecteur"
  | "coefB"
  | "asymptoteInfini"
  | "casSpecial"
  | "constructionInverse";

export function ordreComplet(exercice: ExerciceEtudeComplete): PhaseEtudeComplete[] {
  if (exercice.mode === "constructionInverse") return ["constructionInverse"];
  const ordre: PhaseEtudeComplete[] = ["domaine", "typeLimite"];
  const pointVide = exercice.exclusions.find((e) => e.type === "pointVide");
  if (pointVide) ordre.push("pointVideSimplification", "pointVideLimite", "pointVideConclusion");
  if (exercice.exclusions[0]?.type !== "pointVide") ordre.push("limitesGD1");
  if (exercice.exclusions[1] && exercice.exclusions[1].type !== "pointVide") ordre.push("limitesGD2");
  ordre.push("av", "infini");
  if (exercice.infini.type !== "horizontale") ordre.push("coefDirecteur");
  if (exercice.infini.type === "oblique") ordre.push("coefB");
  ordre.push("asymptoteInfini");
  if (exercice.casSpecial) ordre.push("casSpecial");
  return ordre;
}

export function phaseInitiale(exercice: ExerciceEtudeComplete): PhaseEtudeComplete {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceEtudeComplete, phase: PhaseEtudeComplete): PhaseEtudeComplete | "termine" {
  const ordre = ordreComplet(exercice);
  const i = ordre.indexOf(phase);
  return i === ordre.length - 1 ? "termine" : ordre[i + 1];
}

export interface ResultatExerciceEtudeComplete {
  exercice: ExerciceEtudeComplete;
  scores: Partial<Record<PhaseEtudeComplete, number>>;
}

export interface EtatSessionEtudeComplete {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceEtudeComplete;
  exerciceCourant: ExerciceEtudeComplete;
  phase: PhaseEtudeComplete;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEtudeComplete, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEtudeComplete[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
