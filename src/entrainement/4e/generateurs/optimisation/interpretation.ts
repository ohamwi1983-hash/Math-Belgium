/**
 * Couche A — construction des 4 options de l'écran "interpretation" (QCM, écran 6), PARTAGÉE par
 * les 5 familles : les 3 pièges ciblés par la spec (sens/signe inversé, unité fautive, confusion
 * variable/grandeur) sont un motif purement mécanique — substitution de mots dans un même gabarit
 * de phrase — jamais narratif, donc légitimement factorisé ici plutôt que répliqué 5 fois.
 */
import type { GenreGrandeur, OptionInterpretation, PointOptimisation, SensOptimisation } from "../../core/optimisation.types";
import { melanger } from "./aleatoire";

// `GenreGrandeur` vit désormais dans `core/optimisation.types.ts` (consommé aussi par
// `ui/formatOptimisation.ts` pour les écrans 6/7 contextualisés) — réexporté ici pour compatibilité
// avec les imports existants (`import type { GenreGrandeur } from "../interpretation"`).
export type { GenreGrandeur };

export interface ParametresInterpretation {
  sens: SensOptimisation;
  /** Toujours en minuscule ("l'aire", "le revenu"...) — capitalisée automatiquement en début de
   * phrase (`capitaliser`), jamais stockée déjà capitalisée (cohérence avec les autres écrans qui
   * l'utilisent en milieu de phrase). */
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteGrandeur: string;
  /** Unité plausible mais fausse pour la grandeur (ex. "m" au lieu de "m²") — piège "unité fautive". */
  uniteGrandeurFautive: string;
  labelVariable: string;
  uniteVariable: string;
  optimal: PointOptimisation;
  /**
   * Distracteur(s) SUPPLÉMENTAIRE(S), propres à une famille précise, au-delà des 3 génériques
   * toujours présents — mécanisme d'extension par famille (`spec-gen55-optimisation-second-degre.md`,
   * section 4, écran 8 : "piège supplémentaire, propre à la famille A"). Absent (ou `[]`) pour toutes
   * les autres familles ⇒ comportement STRICTEMENT inchangé (toujours 4 options, 1 correcte + 3
   * distracteurs génériques). Chaque texte fourni ici est ajouté tel quel (déjà rédigé, jamais un
   * gabarit à substituer — contrairement aux 3 distracteurs génériques, ce piège est narratif, pas
   * mécanique).
   */
  distracteursSupplementaires?: string[];
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

function accordGenre(mot: string, genre: GenreGrandeur): string {
  return genre === "feminin" ? `${mot}e` : mot;
}

function motSens(sens: SensOptimisation, genre: GenreGrandeur): string {
  return accordGenre(sens === "max" ? "maximal" : "minimal", genre);
}

function motSensInverse(sens: SensOptimisation, genre: GenreGrandeur): string {
  return accordGenre(sens === "max" ? "minimal" : "maximal", genre);
}

function phrase(p: ParametresInterpretation, sensTexte: string, valeurGrandeur: number, uniteGrandeur: string, valeurVariable: number): string {
  return `${capitaliser(p.nomGrandeur)} ${sensTexte} : ${valeurGrandeur} ${uniteGrandeur}, atteinte pour ${p.labelVariable} = ${valeurVariable} ${p.uniteVariable}.`;
}

/** Question finale de l'exercice (ex. "Quelle est l'aire maximale ?"), affichée PERSISTANTE sur
 * chaque écran via `ContexteOptimisationCommun.questionFinale` (voir CLAUDE.md, "Question finale
 * persistante") — jamais réutilisée pour gen57 (ses 4 familles embarquées passent `null` à la
 * place et portent leur propre question, structurellement différente). "Quel"/"Quelle" s'accorde
 * sur `genreGrandeur`, au même titre que l'adjectif "maximal(e)"/"minimal(e)" (`motSens`). */
export function formatQuestionFinale(sens: SensOptimisation, nomGrandeur: string, genreGrandeur: GenreGrandeur): string {
  const quel = genreGrandeur === "feminin" ? "Quelle" : "Quel";
  return `${quel} est ${nomGrandeur} ${motSens(sens, genreGrandeur)} ?`;
}

export function construireOptionsInterpretation(p: ParametresInterpretation): OptionInterpretation[] {
  const correcte = phrase(p, motSens(p.sens, p.genreGrandeur), p.optimal.y, p.uniteGrandeur, p.optimal.x);
  const sensInverse = phrase(p, motSensInverse(p.sens, p.genreGrandeur), p.optimal.y, p.uniteGrandeur, p.optimal.x);
  const uniteFautive = phrase(p, motSens(p.sens, p.genreGrandeur), p.optimal.y, p.uniteGrandeurFautive, p.optimal.x);
  const variableConfondue = phrase(p, motSens(p.sens, p.genreGrandeur), p.optimal.x, p.uniteGrandeur, p.optimal.y);

  return melanger([
    { texte: correcte, correcte: true },
    { texte: sensInverse, correcte: false },
    { texte: uniteFautive, correcte: false },
    { texte: variableConfondue, correcte: false },
    ...(p.distracteursSupplementaires ?? []).map((texte) => ({ texte, correcte: false })),
  ]);
}
