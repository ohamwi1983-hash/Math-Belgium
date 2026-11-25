/**
 * Mots réels (majuscules sans accent) à lettres répétées, partagés par 6gen100 (« Quelle formule ? »)
 * et 6gen103 (« Anagrammes et contraintes ») — 6e ch. 7, lot H. Nombre de permutations distinctes
 * ≤ 34 650 (MISSISSIPPI, décision de l'utilisateur du 18/11 : 11 lettres, 4 I, 4 S, 2 P).
 */

export const MOTS_REPETES = [
  "ANANAS",
  "BANANE",
  "CERISE",
  "POMME",
  "TOMATE",
  "CARAMEL",
  "PAPAYE",
  "BALLON",
  "SALADE",
  "CANARD",
  "ESSAI",
  "KAYAK",
  "RADAR",
  "CHOCOLAT",
  "PAPILLON",
  "ASSIETTE",
  "NOUNOURS",
  "MISSISSIPPI",
] as const;

export const VOYELLES = new Set(["A", "E", "I", "O", "U", "Y"]);

/** Lettres distinctes dans l'ordre de première apparition, avec leur nombre d'occurrences. */
export function lettresDuMot(mot: string): { lettre: string; nb: number }[] {
  const out: { lettre: string; nb: number }[] = [];
  for (const c of mot) {
    const x = out.find((o) => o.lettre === c);
    if (x) x.nb++;
    else out.push({ lettre: c, nb: 1 });
  }
  return out;
}

/** « 3 A, 2 N, 1 S » (texte brut). */
export function descriptionLettres(mot: string): string {
  return lettresDuMot(mot)
    .map((l) => `${l.nb} ${l.lettre}`)
    .join(", ");
}
