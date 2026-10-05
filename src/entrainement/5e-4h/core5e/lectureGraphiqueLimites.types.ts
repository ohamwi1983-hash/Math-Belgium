/**
 * Couche core (5e) — contrat pour 5gen22 ("Limites et asymptotes, lecture graphique"). Pure lecture
 * graphique (aucun calcul) : plutôt que des familles figées, l'exercice est décrit par des
 * DIMENSIONS COMBINABLES (nombre d'AV, comportement de chaque AV, comportement à l'infini, point
 * isolé rare) — la variété vient de leur combinaison, jamais d'un tirage sur une liste de scénarios
 * fixes. Type pur, aucune logique — voir `generateurs5e/lectureGraphiqueLimites/` pour la génération
 * et `ui5e/lectureGraphiqueLimitesCourbe.ts` pour la construction procédurale de la courbe.
 */

export type SigneInfini = 1 | -1;

/**
 * Comportement d'une asymptote verticale x=position — un signe de divergence PAR CÔTÉ, jamais un
 * seul signe global (permet aussi bien "signes opposés" — cas standard, deux limites unilatérales
 * distinctes — que "signes identiques" — cas plus rare, une seule limite bilatérale en pratique).
 * `pointIsoleGauche`/`pointIsoleDroit` : au plus UN des deux côtés (jamais les deux — l'asymptote
 * resterait sinon fictive, aucun côté ne divergeant plus) peut remplacer sa divergence par une
 * valeur finie définie par continuité (lim=f(a)=valeur) — piège rare distinguant vraie limite
 * infinie et simple discontinuité de valeur ponctuelle.
 */
export interface ComportementVA {
  position: number;
  signeGauche: SigneInfini;
  signeDroit: SigneInfini;
  pointIsoleGauche?: number;
  pointIsoleDroit?: number;
}

/**
 * Comportement à l'infini — UNE dimension parmi 3, jamais combinées. "horizontale" autorise des
 * valeurs différentes en +∞/−∞ (rare, la plupart du temps identiques) : DEUX asymptotes horizontales
 * distinctes si `limitePlusInfini !== limiteMoinsInfini`, une seule sinon. "oblique" reste la MÊME
 * droite des deux côtés (le manuel ne présente jamais d'asymptote oblique différente en ±∞).
 * "aucune" : la fonction diverge sans jamais s'approcher d'une droite (signe indépendant par
 * direction, pour varier — jamais forcément symétrique).
 */
export type ComportementInfini =
  | { type: "horizontale"; limitePlusInfini: number; limiteMoinsInfini: number }
  | { type: "oblique"; pente: number; ordonnee: number }
  | { type: "aucune"; signePlusInfini: SigneInfini; signeMoinsInfini: SigneInfini };

export interface ExerciceLectureGraphiqueLimites {
  /** 0, 1 ou 2 éléments, TOUJOURS triés par position croissante. */
  vas: ComportementVA[];
  infini: ComportementInfini;
}

export type GenerateurExerciceLectureGraphiqueLimites = () => ExerciceLectureGraphiqueLimites;
