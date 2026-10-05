/**
 * Contrat partagé — chapitre 6 ("Géométrie dans l'espace"), générateurs "Position d'une droite par
 * rapport à un plan", "Section plane d'un solide" et "Ombre au soleil". Premier chapitre du projet à
 * manipuler de vraies coordonnées 3D internes (jamais montrées à l'élève sous forme numérique) —
 * même principe de réutilisation assumée entre plusieurs générateurs qu'ailleurs dans le projet
 * (`Triangle`, chapitre 3 ; `Composantes`, chapitre 4).
 *
 * Catalogue FERMÉ de solides à coordonnées 3D FIXES — aucune génération géométrique paramétrique
 * libre (voir `generateurs/solide3D/gabarits.ts`). Les arêtes et leur visibilité (trait plein/
 * pointillé en perspective cavalière) sont toujours DÉRIVÉES des faces, jamais saisies à la main
 * par gabarit — voir `ui/solide3DSketch.ts::calculerAretesAvecVisibilite` (rendu uniquement,
 * jamais consommé par la vérité terrain de `moteur/geometrieEspace.ts`).
 *
 * **Exception au catalogue fermé** : `construireEscalierCaisses` (`generateurs/solide3D/gabarits.ts`)
 * génère PARAMÉTRIQUEMENT ses coordonnées (le nombre de marches varie d'un tirage à l'autre) —
 * jamais un membre de `NomSolide3D` (qui resterait alors exhaustivement exigé par
 * `Record<NomSolide3D, Solide3D>` = `GABARITS_SOLIDE3D`), donc `Solide3D.id` reste une simple
 * `string` plutôt qu'un `NomSolide3D` strict — le solide généré satisfait malgré tout le même
 * contrat `Solide3D`, donc consommé sans aucune adaptation par le composant de rendu partagé.
 */

/** Point en coordonnées 3D internes — jamais montré à l'élève sous forme numérique. */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type NomSolide3D = "parallelepipede" | "cube" | "prisme" | "tetraedre" | "pyramideCarree" | "campanile";

/**
 * Une face plane et convexe du solide, désignée par la liste ORDONNÉE de ses sommets (le sens de
 * parcours — horaire ou antihoraire — n'a pas besoin d'être cohérent entre faces : la normale
 * extérieure est recalculée de façon robuste, voir `moteur/geometrieEspace.ts`).
 */
export type FaceSolide3D = string[];

export interface Solide3D {
  /** Un `NomSolide3D` pour les 6 gabarits du catalogue fermé, ou `"escalier"` (jamais un membre de
   * `NomSolide3D`, voir plus haut) pour le seul gabarit paramétrique. */
  id: string;
  /** Libellé pédagogique du gabarit, ex. "Parallélépipède rectangle ABCD-EFGH". */
  label: string;
  /** Sommets nommés selon le patron standard du gabarit (ex. A,B,C,D,E,F,G,H). */
  sommets: Record<string, Point3D>;
  faces: FaceSolide3D[];
  /** Override RARE (campanile uniquement pour l'instant) : force toutes les arêtes en trait plein,
   * jamais en pointillé, indépendamment de la visibilité réelle de leurs faces adjacentes — absent/
   * `false` pour tous les autres gabarits, comportement de `calculerAretesAvecVisibilite` inchangé. */
  toutesAretesVisibles?: boolean;
}

/** Une arête DÉRIVÉE des faces, avec sa visibilité précalculée pour le rendu (trait plein si au
 * moins une face adjacente est visible depuis la caméra fixe, pointillé sinon). */
export interface AreteSolide3D {
  sommets: [string, string];
  visible: boolean;
}

/** Un plan désigné par 3 sommets nommés du solide (jamais par une équation cartésienne, invisible
 * à l'élève). */
export type PlanSolide3D = [string, string, string];

/** Une droite désignée par 2 sommets nommés du solide. */
export type DroiteSolide3D = [string, string];
