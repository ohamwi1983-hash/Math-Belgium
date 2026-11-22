/**
 * Classe d'une option d'un choix fermé (audit 4e ch. 7) : tant que le choix n'est pas jugé, l'option
 * sélectionnée est `toggle-active` ; une fois jugé (figé par le moteur, ou écran clos), l'option
 * CHOISIE par l'élève est marquée fausse (`is-faux`, rouge ✗) si elle ne l'était pas, et la bonne
 * option juste (`is-juste`, vert ✓). Avant, la bonne option prenait le style « sélectionné » : l'élève
 * croyait l'avoir choisie et lisait juste en dessous qu'il s'était trompé.
 */
export function classeOptionChoixFerme<T>(option: T, etat: { selection: T | null; choisie: T | null; bonne: T }): string {
  if (etat.choisie === null) return option === etat.selection ? "btn toggle-active" : "btn";
  if (option === etat.bonne) return "btn is-juste";
  if (option === etat.choisie) return "btn is-faux";
  return "btn";
}

/** Libellé accessible ajouté à une option jugée (« réponse juste » / « ton choix, faux »). */
export function ariaOptionChoixFerme<T>(option: T, etat: { choisie: T | null; bonne: T }): string | undefined {
  if (etat.choisie === null) return undefined;
  if (option === etat.bonne) return option === etat.choisie ? "ton choix, juste" : "bonne réponse";
  if (option === etat.choisie) return "ton choix, faux";
  return undefined;
}
