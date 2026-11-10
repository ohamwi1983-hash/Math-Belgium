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


/** Nombre en texte : virgule décimale, « − » typographique, au plus 2 décimales. */
function nombre(valeur: number): string {
  return String(Math.round(valeur * 100) / 100).replace(".", ",").replace("-", "−");
}

/** « l'aire maximale », mais « la valeur minimale de l'aire totale des 2 formes » : derrière un nom
 * de grandeur qui a un complément (plus de 2 mots), l'adjectif se retrouvait loin de son nom
 * (« Quelle est l'aire totale des 2 formes minimale ? »). Rend aussi le genre du groupe obtenu
 * (« valeur » est féminin) pour accorder la suite de la phrase (« atteinte »). */
export function groupeGrandeurQualifiee(
  sens: SensOptimisation,
  nomGrandeur: string,
  genreGrandeur: GenreGrandeur,
  options: { avant?: string; apres?: string } = {},
): { texte: string; genre: GenreGrandeur } {
  const long = nomGrandeur.trim().split(/\s+/).length > 2 && !nomGrandeur.startsWith("la valeur ");
  const genre: GenreGrandeur = long ? "feminin" : genreGrandeur;
  const adjectif = [options.avant, motSens(sens, genre), options.apres].filter(Boolean).join(" ");
  if (!long) return { texte: `${nomGrandeur} ${adjectif}`, genre };
  const de = nomGrandeur.startsWith("le ") ? `du ${nomGrandeur.slice(3)}` : nomGrandeur.startsWith("les ") ? `des ${nomGrandeur.slice(4)}` : `de ${nomGrandeur}`;
  return { texte: `la valeur ${adjectif} ${de}`, genre };
}

export function grandeurQualifiee(sens: SensOptimisation, nomGrandeur: string, genreGrandeur: GenreGrandeur, options: { avant?: string; apres?: string } = {}): string {
  return groupeGrandeurQualifiee(sens, nomGrandeur, genreGrandeur, options).texte;
}

function phrase(p: ParametresInterpretation, sens: SensOptimisation, valeurGrandeur: number, uniteGrandeur: string, valeurVariable: number): string {
  const groupe = groupeGrandeurQualifiee(sens, p.nomGrandeur, p.genreGrandeur);
  return `${capitaliser(groupe.texte)} : ${nombre(valeurGrandeur)} ${uniteGrandeur}, ${accordGenre("atteint", groupe.genre)} pour ${p.labelVariable} = ${nombre(valeurVariable)} ${p.uniteVariable}.`;
}

/** Question finale de l'exercice (ex. "Quelle est l'aire maximale ?"), affichée PERSISTANTE sur
 * chaque écran via `ContexteOptimisationCommun.questionFinale` (voir CLAUDE.md, "Question finale
 * persistante") — jamais réutilisée pour gen57 (ses 4 familles embarquées passent `null` à la
 * place et portent leur propre question, structurellement différente). "Quel"/"Quelle" s'accorde
 * sur `genreGrandeur`, au même titre que l'adjectif "maximal(e)"/"minimal(e)" (`motSens`). */
export function formatQuestionFinale(sens: SensOptimisation, nomGrandeur: string, genreGrandeur: GenreGrandeur): string {
  const groupe = groupeGrandeurQualifiee(sens, nomGrandeur, genreGrandeur);
  return `${groupe.genre === "feminin" ? "Quelle" : "Quel"} est ${groupe.texte} ?`;
}

export function construireOptionsInterpretation(p: ParametresInterpretation): OptionInterpretation[] {
  const inverse: SensOptimisation = p.sens === "max" ? "min" : "max";
  const correcte = phrase(p, p.sens, p.optimal.y, p.uniteGrandeur, p.optimal.x);
  const sensInverse = phrase(p, inverse, p.optimal.y, p.uniteGrandeur, p.optimal.x);
  const uniteFautive = phrase(p, p.sens, p.optimal.y, p.uniteGrandeurFautive, p.optimal.x);
  const variableConfondue = phrase(p, p.sens, p.optimal.x, p.uniteGrandeur, p.optimal.y);

  return melanger([
    { texte: correcte, correcte: true },
    { texte: sensInverse, correcte: false },
    { texte: uniteFautive, correcte: false },
    { texte: variableConfondue, correcte: false },
    ...(p.distracteursSupplementaires ?? []).map((texte) => ({ texte, correcte: false })),
  ]);
}
