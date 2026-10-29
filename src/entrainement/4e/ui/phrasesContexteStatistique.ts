/**
 * Phrases de contexte partagées par les générateurs du chapitre « Statistique descriptive » (gen30 à
 * gen38) — une seule source pour la grammaire des énoncés (audit du chapitre 4, point 13) : avant,
 * chaque `ui/format*.ts` recopiait « la répartition de ${caractereComplement} … chez les … », d'où
 * « la répartition de âge », « intervalle de ancienneté » ou « chez les smartphones ».
 *
 * La banque de contextes (`generateurs/bienaymeTchebychev/contextes.ts`) fournit déjà l'article de
 * chaque caractère (`caractereDefini`) ; `populationAnimee` dit si « chez » convient (personnes,
 * animaux) ou s'il faut « pour » (objets, lieux, végétaux).
 */
import type { ContexteBienaymeTchebychev } from "../core/bienaymeTchebychev.types";

/** Voyelle initiale (jamais « h » : les seuls mots en « h » de la banque — « hauteur » — ont un h
 * aspiré, « de hauteur », jamais « d'hauteur »). */
const VOYELLE_INITIALE = /^[aeiouyàâäéèêëîïôöùûüœ]/i;

/** « de » élidé devant une voyelle : `de("âge")` → « d'âge », `de("taille")` → « de taille ». */
export function de(mot: string): string {
  return VOYELLE_INITIALE.test(mot) ? `d'${mot}` : `de ${mot}`;
}

/** « de » contracté avec l'article défini du caractère : « du poids », « de la taille », « de l'âge ». */
export function deCaractere(contexte: ContexteBienaymeTchebychev): string {
  const defini = contexte.caractereDefini;
  if (defini.startsWith("le ")) return `du ${defini.slice(3)}`;
  if (defini.startsWith("les ")) return `des ${defini.slice(4)}`;
  return `de ${defini}`;
}

/** Population reprise par un démonstratif : « ces véhicules », jamais « ces véhicules d'un parc
 * automobile » (le complément est déjà dans l'énoncé — audit gen37). Garde le nom seul, avant son
 * premier complément (« d'un/d'une/de/du/des/en … »). */
export function populationReprise(contexte: ContexteBienaymeTchebychev): string {
  return contexte.population.split(/ (?:d'|de |du |des |en )/)[0];
}

/** « chez les étudiants » / « pour les véhicules d'un parc automobile ». */
export function aupresDesPopulation(contexte: ContexteBienaymeTchebychev): string {
  return `${contexte.populationAnimee ? "chez" : "pour"} les ${contexte.population}`;
}

/** Même tournure en début de phrase : « Chez les étudiants » / « Pour les véhicules… ». */
export function aupresDesPopulationMajuscule(contexte: ContexteBienaymeTchebychev): string {
  const texte = aupresDesPopulation(contexte);
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** Énoncé commun des générateurs à une série : « Voici la répartition du poids (en kg) chez les
 * étudiants : ». */
export function phraseRepartition(contexte: ContexteBienaymeTchebychev): string {
  return `Voici la répartition ${deCaractere(contexte)} (en ${contexte.unite}) ${aupresDesPopulation(contexte)} :`;
}

/** Énoncé commun des générateurs à deux séries (boîte à moustaches « comparaison », comparaison de
 * séries) : « … chez deux groupes d'étudiants — série A et série B : ». */
export function phraseRepartitionDeuxGroupes(contexte: ContexteBienaymeTchebychev): string {
  const preposition = contexte.populationAnimee ? "chez" : "pour";
  return `Voici la répartition ${deCaractere(contexte)} (en ${contexte.unite}) ${preposition} deux groupes ${de(contexte.population)} — série A et série B :`;
}
