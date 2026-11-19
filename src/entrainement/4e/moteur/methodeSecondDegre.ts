import type { Categorie, Enonce, Exercice } from "../core/generateur.types";

/**
 * Méthodes proposées à l'écran « Méthode » de gen1 (« Résoudre par la méthode la plus rapide »).
 * En plus des catégories du contrat partagé (`Categorie`, inchangé pour gen3–gen6 et le ch. 1) :
 * - `racine_evidente` (décision 1 de l'utilisateur) : quand a + b + c = 0 ou a − b + c = 0 dans un
 *   cas général, la racine évidente ET le discriminant sont acceptés ; l'écran suivant s'adapte
 *   (factorisation par la racine évidente, ou Δ) ;
 * - `aucune_solution` (décision 2) : b = 0 et a, c de même signe — x² = −c/a serait négatif.
 */
export type ChoixMethode = Exclude<Categorie, "mise_en_evidence_generalisee" | "irreductible"> | "racine_evidente" | "aucune_solution";

export const LIBELLES_METHODE: Record<ChoixMethode, string> = {
  mise_en_evidence: "Mise en évidence (c = 0)",
  binome_conjugue: "Binôme conjugué (b = 0, a et c de signes opposés)",
  produit_remarquable: "Produit remarquable (carré parfait)",
  racine_evidente: "Racine évidente (a + b + c = 0 ou a − b + c = 0)",
  aucune_solution: "Aucune solution (b = 0, a et c de même signe)",
  cas_general: "Aucune méthode rapide (formule générale)",
};

/** Ordre des boutons : l'ordre des tests du cours (c = 0, b = 0, carré parfait, racine évidente, Δ). */
export const OPTIONS_METHODE: { valeur: ChoixMethode; libelle: string }[] = (
  ["mise_en_evidence", "binome_conjugue", "aucune_solution", "produit_remarquable", "racine_evidente", "cas_general"] as const
).map((valeur) => ({ valeur, libelle: LIBELLES_METHODE[valeur] }));

export function libelleMethode(choix: ChoixMethode): string {
  return LIBELLES_METHODE[choix];
}

/** 1 si a + b + c = 0, −1 si a − b + c = 0 (et pas le premier), sinon null. Coefficients rationnels
 * seulement (la variante irrationnelle n'a jamais de racine évidente : b = B√k). */
export function racineEvidente(enonce: Enonce): 1 | -1 | null {
  const { a, b, c } = enonce;
  if (a + b + c === 0) return 1;
  if (a - b + c === 0) return -1;
  return null;
}

/** Une racine évidente « compte » comme méthode seulement dans un cas général (les raccourcis
 * c = 0, b = 0, carré parfait passent avant, dans l'ordre du cours). */
export function aRacineEvidente(exercice: Exercice): boolean {
  return exercice.categorie === "cas_general" && !exercice.irrationnel && (exercice.solution.delta ?? 0) > 0 && racineEvidente(exercice.enonce) !== null;
}

/** Méthodes justes pour l'instance (écran « Méthode », choix fermé à UNE tentative). */
export function methodesAcceptees(exercice: Exercice): ChoixMethode[] {
  switch (exercice.categorie) {
    case "irreductible":
      return ["aucune_solution"];
    case "cas_general":
      return aRacineEvidente(exercice) ? ["racine_evidente", "cas_general"] : ["cas_general"];
    case "mise_en_evidence_generalisee":
      return [];
    default:
      return [exercice.categorie];
  }
}

/** Méthode retenue quand le choix est révélé (réponse attendue, corrigé papier) : la racine
 * évidente quand il y en a une (décision 1 : « le corrigé montre la racine évidente »). */
export function methodeParDefaut(exercice: Exercice): ChoixMethode | null {
  return methodesAcceptees(exercice)[0] ?? null;
}

/** Texte de la réponse attendue : « Racine évidente (…) — le discriminant marche aussi ». */
export function libelleMethodesAttendues(exercice: Exercice): string {
  const m = methodesAcceptees(exercice);
  if (m.length === 0) return "";
  return m.length === 1 ? libelleMethode(m[0]!) : `${libelleMethode(m[0]!)} — la formule générale (Δ) marche aussi`;
}

function monoX(a: number): string {
  return a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
}

/** Forme factorisée par la racine évidente (sans espaces) : (x − 1)(ax − c) si a + b + c = 0,
 * (x + 1)(ax + c) si a − b + c = 0 — démonstration du cours (§ 1). */
export function formeRacineEvidente(enonce: Enonce): string {
  const r = racineEvidente(enonce);
  const { a, c } = enonce;
  const k = r === 1 ? -c : c;
  return `(x${r === 1 ? "-1" : "+1"})(${monoX(a)}${k >= 0 ? "+" : "-"}${Math.abs(k)})`;
}

/** Instance sans racine réelle (Δ < 0, ou b = 0 avec a, c de même signe). */
export function sansRacineReelle(exercice: Exercice): boolean {
  return Number.isNaN(exercice.solution.racines[0]);
}
