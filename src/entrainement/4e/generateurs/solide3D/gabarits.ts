import type { FaceSolide3D, NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";

/**
 * Catalogue de 6 gabarits de solides à coordonnées FIXES (les 4 historiques + pyramide régulière à
 * base carrée + campanile), plus 1 gabarit PARAMÉTRIQUE (`construireEscalierCaisses`, voir plus bas)
 * — chapitre "Géométrie dans l'espace", module frère partagé par les 3 générateurs du chapitre (même
 * principe que `generateurs/triangle/` pour le chapitre 3). Coordonnées 3D FIXES par gabarit du
 * catalogue fermé, jamais une génération géométrique paramétrique libre — la variété d'une instance
 * à l'autre vient uniquement du choix du plan/de la droite/des points de section à l'intérieur d'un
 * gabarit tiré, jamais de la forme du solide lui-même.
 *
 * Sommets nommés selon le patron standard (ABCD-EFGH pour le parallélépipède/cube/campanile,
 * ABC-DEF pour le prisme, ABCD pour le tétraèdre, ABCD-S pour la pyramide/le campanile — S pour
 * "sommet", l'apex) — jamais montrés à l'élève sous forme de coordonnées numériques, uniquement par
 * leur nom de sommet.
 */

const PARALLELEPIPEDE: Solide3D = {
  id: "parallelepipede",
  label: "Parallélépipède rectangle ABCD-EFGH",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 6, y: 0, z: 0 },
    C: { x: 6, y: 3, z: 0 },
    D: { x: 0, y: 3, z: 0 },
    E: { x: 0, y: 0, z: 4 },
    F: { x: 6, y: 0, z: 4 },
    G: { x: 6, y: 3, z: 4 },
    H: { x: 0, y: 3, z: 4 },
  },
  faces: [
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["A", "B", "F", "E"],
    ["D", "C", "G", "H"],
    ["A", "D", "H", "E"],
    ["B", "C", "G", "F"],
  ],
};

const CUBE: Solide3D = {
  id: "cube",
  label: "Cube ABCD-EFGH",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 4, y: 0, z: 0 },
    C: { x: 4, y: 4, z: 0 },
    D: { x: 0, y: 4, z: 0 },
    E: { x: 0, y: 0, z: 4 },
    F: { x: 4, y: 0, z: 4 },
    G: { x: 4, y: 4, z: 4 },
    H: { x: 0, y: 4, z: 4 },
  },
  faces: [
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["A", "B", "F", "E"],
    ["D", "C", "G", "H"],
    ["A", "D", "H", "E"],
    ["B", "C", "G", "F"],
  ],
};

const PRISME: Solide3D = {
  id: "prisme",
  label: "Prisme droit à base triangulaire ABC-DEF",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 5, y: 0, z: 0 },
    C: { x: 2, y: 4, z: 0 },
    D: { x: 0, y: 0, z: 4 },
    E: { x: 5, y: 0, z: 4 },
    F: { x: 2, y: 4, z: 4 },
  },
  faces: [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["A", "B", "E", "D"],
    ["B", "C", "F", "E"],
    ["C", "A", "D", "F"],
  ],
};

const TETRAEDRE: Solide3D = {
  id: "tetraedre",
  label: "Tétraèdre ABCD",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 5, y: 0, z: 0 },
    C: { x: 2, y: 4, z: 0 },
    D: { x: 2, y: 1, z: 4 },
  },
  faces: [
    ["A", "B", "C"],
    ["A", "B", "D"],
    ["B", "C", "D"],
    ["C", "A", "D"],
  ],
};

/** Pyramide régulière à base carrée ABCD, apex S centré au-dessus de la base — alimente la variante
 * "directionInconnue" de "Ombre au soleil" (voir sa Couche A, `generateurs/ombreSoleil/index.ts`),
 * jamais "Position droite/plan"/"Section plane d'un solide" (hors du périmètre de cette extension). */
const PYRAMIDE_CARREE: Solide3D = {
  id: "pyramideCarree",
  label: "Pyramide régulière à base carrée ABCD-S",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 4, y: 0, z: 0 },
    C: { x: 4, y: 4, z: 0 },
    D: { x: 0, y: 4, z: 0 },
    S: { x: 2, y: 2, z: 5 },
  },
  faces: [
    ["A", "B", "C", "D"],
    ["A", "B", "S"],
    ["B", "C", "S"],
    ["C", "D", "S"],
    ["D", "A", "S"],
  ],
};

/** Prisme droit surmonté d'un toit pyramidal (type campanile) — base ABCD, sommet du prisme
 * EFGH, apex du toit S. **Toutes les arêtes sont visibles/données** (`toutesAretesVisibles: true`,
 * spec section 1.b) : aucune étape de complétion de pointillés pour ce gabarit précis, contrairement
 * aux 6 autres — voir `ui/solide3DSketch.ts::calculerAretesAvecVisibilite`. Alimente la variante
 * "directionInconnue" de "Ombre au soleil" comme la pyramide ci-dessus. */
const CAMPANILE: Solide3D = {
  id: "campanile",
  label: "Prisme à toit pyramidal (campanile) ABCD-EFGH-S",
  sommets: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 4, y: 0, z: 0 },
    C: { x: 4, y: 4, z: 0 },
    D: { x: 0, y: 4, z: 0 },
    E: { x: 0, y: 0, z: 3 },
    F: { x: 4, y: 0, z: 3 },
    G: { x: 4, y: 4, z: 3 },
    H: { x: 0, y: 4, z: 3 },
    S: { x: 2, y: 2, z: 6 },
  },
  faces: [
    ["A", "B", "C", "D"],
    ["A", "B", "F", "E"],
    ["B", "C", "G", "F"],
    ["C", "D", "H", "G"],
    ["D", "A", "E", "H"],
    ["E", "F", "S"],
    ["F", "G", "S"],
    ["G", "H", "S"],
    ["H", "E", "S"],
  ],
  toutesAretesVisibles: true,
};

/** Catalogue fermé — parallélépipède/cube/prisme réutilisés par les 3 générateurs du chapitre,
 * tétraèdre réservé à "Section plane d'un solide"/"Ombre au soleil", pyramideCarree/campanile
 * réservés à la variante "directionInconnue" de "Ombre au soleil" (jamais "Position droite/plan",
 * dont le catalogue s'arrête aux 3 premiers gabarits, ni "Section plane d'un solide", dont le
 * catalogue n'a pas été étendu par cette extension — voir `GABARITS_TOUS`). */
export const GABARITS_SOLIDE3D: Record<NomSolide3D, Solide3D> = {
  parallelepipede: PARALLELEPIPEDE,
  cube: CUBE,
  prisme: PRISME,
  tetraedre: TETRAEDRE,
  pyramideCarree: PYRAMIDE_CARREE,
  campanile: CAMPANILE,
};

/** Les 3 gabarits ouverts à "Position d'une droite par rapport à un plan" — jamais le tétraèdre. */
export const GABARITS_POSITION_DROITE_PLAN: NomSolide3D[] = ["parallelepipede", "cube", "prisme"];

/** Les 4 gabarits ouverts à "Section plane d'un solide"/"Ombre au soleil" (variantes "simple"/
 * "obstacle") — inchangé par cette extension, jamais étendu à pyramideCarree/campanile/escalier. */
export const GABARITS_TOUS: NomSolide3D[] = ["parallelepipede", "cube", "prisme", "tetraedre"];

/** Les 2 gabarits qui alimentent la variante "directionInconnue" de "Ombre au soleil" (spec
 * section 3) — jamais l'escalier de caisses, réservé à son rôle d'obstacle en variante B. */
export const GABARITS_OMBRE_DIRECTION_INCONNUE: NomSolide3D[] = ["pyramideCarree", "campanile"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Tire un nom de gabarit uniformément parmi une liste donnée — jamais un tirage pondéré. */
export function tirerNomGabarit(candidats: NomSolide3D[]): NomSolide3D {
  return candidats[randomInt(0, candidats.length - 1)];
}

/**
 * Escalier de caisses empilées — ⚠️ **seul gabarit PARAMÉTRIQUE du chapitre** (spec section 1.c) :
 * rompt délibérément avec la règle "catalogue fermé, coordonnées fixes" des 6 gabarits ci-dessus —
 * le nombre de marches varie d'un tirage à l'autre, donc ses coordonnées sont GÉNÉRÉES plutôt que
 * codées en dur. Jamais un membre de `NomSolide3D`/`GABARITS_SOLIDE3D` (voir le contrat,
 * `core/geometrieEspace.types.ts`) — réservé à son rôle d'obstacle dans la variante "obstacle" de
 * "Ombre au soleil" (spec section 2), jamais à la variante "directionInconnue" (spec section 3).
 *
 * Profil en escalier dans le plan xz (silhouette fermée par le mur arrière et le sol), extrudé le
 * long de y — construction ALGORITHMIQUE générique, jamais énumérée face par face à la main comme
 * les 6 gabarits fixes : pour un profil fermé à `2N+2` sommets (N marches), chaque ARÊTE du profil
 * (y compris l'arête de fermeture) engendre exactement 1 face latérale rectangulaire reliant sa
 * copie avant (y=0) à sa copie arrière (y=profondeur) — plus les 2 faces avant/arrière elles-mêmes
 * (le profil complet, à chaque extrémité de l'extrusion). Watertight par construction : chaque
 * arête 3D appartient alors à exactement 2 faces (vérifié par test).
 */
export const NOMBRE_MARCHES_MIN = 3;
export const NOMBRE_MARCHES_MAX = 6;

/** Dimensions exportées (Section 2, `promptgenombresoleilextension.md`) — la variante "obstacle" de
 * "Ombre au soleil" en a besoin pour placer l'escalier dans sa scène et calculer la trajectoire de
 * l'ombre qui le traverse ; export plutôt que duplication pour ne jamais risquer de désynchroniser
 * le solide RENDU (ce fichier) de la géométrie CALCULÉE (`generateurs/ombreSoleil/`) — les deux
 * doivent toujours utiliser exactement les mêmes dimensions. */
export const LARGEUR_MARCHE_ESCALIER = 2;
export const HAUTEUR_MARCHE_ESCALIER = 1.5;
export const PROFONDEUR_ESCALIER = 3;

export function construireEscalierCaisses(nombreMarches: number): Solide3D {
  const n = Math.min(NOMBRE_MARCHES_MAX, Math.max(NOMBRE_MARCHES_MIN, Math.round(nombreMarches)));

  // Profil (plan xz) : sol → marche 1 (montée + palier) → ... → marche n → mur arrière → retour au sol.
  const profil: { x: number; z: number }[] = [{ x: 0, z: 0 }];
  for (let i = 1; i <= n; i++) {
    profil.push({ x: (i - 1) * LARGEUR_MARCHE_ESCALIER, z: i * HAUTEUR_MARCHE_ESCALIER });
    profil.push({ x: i * LARGEUR_MARCHE_ESCALIER, z: i * HAUTEUR_MARCHE_ESCALIER });
  }
  profil.push({ x: n * LARGEUR_MARCHE_ESCALIER, z: 0 });

  const sommets: Record<string, Point3D> = {};
  const nomsAvant: string[] = [];
  const nomsArriere: string[] = [];
  profil.forEach((p, i) => {
    const nomAvant = `A${i}`;
    const nomArriere = `B${i}`;
    sommets[nomAvant] = { x: p.x, y: 0, z: p.z };
    sommets[nomArriere] = { x: p.x, y: PROFONDEUR_ESCALIER, z: p.z };
    nomsAvant.push(nomAvant);
    nomsArriere.push(nomArriere);
  });

  const faces: FaceSolide3D[] = [nomsAvant, [...nomsArriere].reverse()];
  for (let i = 0; i < profil.length; i++) {
    const j = (i + 1) % profil.length;
    faces.push([nomsAvant[i], nomsAvant[j], nomsArriere[j], nomsArriere[i]]);
  }

  return {
    id: "escalier",
    label: `Escalier de ${n} caisses empilées`,
    sommets,
    faces,
  };
}
