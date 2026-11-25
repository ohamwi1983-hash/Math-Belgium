import type { StatutVerification } from "../moteur/statutVerification";
import { MESSAGES_ILLISIBLE, diagnostiquerSaisie, lireListeEntiers, messageRefus } from "./saisieCombinatoire";
import type { Cible, NatureSaisie } from "./saisieCombinatoire";

/**
 * Ce qu'attend chaque champ d'un écran des générateurs 6gen43–6gen48 (même ordre que les champs du
 * format). La vérification de chaque générateur ne fait que décrire ses attentes ; le diagnostic,
 * les refus sans tentative et le statut champ par champ sont communs (ce fichier).
 */
export type Attente =
  | { nature: Exclude<NatureSaisie, "liste" | "polynome">; cible: Cible }
  | { nature: "liste"; cible: number[] }
  | { nature: "polynome"; cible: Parameters<typeof diagnostiquerSaisie>[2] }
  /** Choix fermé : identifiant de la bonne option. */
  | { choix: string }
  /** Liste de lignes (une par ligne du champ « liste ») : ensemble de multiensembles d'entiers. */
  | { lignes: number[][] };

const SEPARATEUR_LIGNES = "\n";

export function joindreLignes(lignes: string[]): string {
  return lignes.join(SEPARATEUR_LIGNES);
}

function cle(l: number[]): string {
  return [...l].sort((a, b) => a - b).join(",");
}

function statutLignes(valeur: string, attendu: number[][]): StatutVerification {
  const lignes = valeur.split(SEPARATEUR_LIGNES).filter((l) => l.trim() !== "");
  const lues = lignes.map(lireListeEntiers);
  if (lues.length === 0 || lues.some((l) => l === null)) return "parse_error";
  const cles = lues.map((l) => cle(l!));
  if (new Set(cles).size !== cles.length) return "not_equivalent";
  const attendues = new Set(attendu.map(cle));
  return cles.length === attendues.size && cles.every((c) => attendues.has(c)) ? "correct" : "not_equivalent";
}

export function statutsAttentes(attentes: Attente[], valeurs: string[]): StatutVerification[] {
  return attentes.map((a, i) => {
    const v = valeurs[i] ?? "";
    if ("choix" in a) return v === a.choix ? "correct" : "not_equivalent";
    if ("lignes" in a) return statutLignes(v, a.lignes);
    return diagnostiquerSaisie(v, a.nature, a.cible as never);
  });
}

export function combinerStatuts(statuts: StatutVerification[]): StatutVerification {
  if (statuts.includes("parse_error")) return "parse_error";
  if (statuts.includes("not_equivalent")) return "not_equivalent";
  return "correct";
}

export function diagnostiquerAttentes(attentes: Attente[], valeurs: string[]): StatutVerification {
  return combinerStatuts(statutsAttentes(attentes, valeurs));
}

/** Premier message de refus sans tentative de l'écran (null : tout est lisible et de bonne forme). */
export function refusAttentes(attentes: Attente[], valeurs: string[]): string | null {
  for (let i = 0; i < attentes.length; i++) {
    const a = attentes[i];
    const v = valeurs[i] ?? "";
    if ("choix" in a) continue;
    if ("lignes" in a) {
      if (statutLignes(v, a.lignes) === "parse_error") return MESSAGES_ILLISIBLE.liste;
      continue;
    }
    const msg = messageRefus(v, a.nature, a.nature === "liste" || a.nature === "polynome" ? undefined : (a.cible as Cible));
    if (msg) return msg;
  }
  return null;
}
