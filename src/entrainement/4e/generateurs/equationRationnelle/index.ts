import type { ExerciceEquationRationnelle, GenerateurExerciceEquationRationnelle } from "../../core/equationRationnelle.types";
import { construireUnDenominateur } from "./construireUnDenominateur";
import { construireDeuxDenominateurs } from "./construireDeuxDenominateurs";
import { construireDeuxFractionsLineaires } from "./construireDeuxFractionsLineaires";
import { construireCas4a } from "./construireCas4a";
import { construireCas4b } from "./construireCas4b";

/**
 * Poids de tirage par construction (voir `genererExerciceEquationRationnelle` ci-dessous pour la
 * justification complète) — p2_sur_p1/p1_sur_p2 pèsent le double des 3 autres, pour compenser le
 * fait qu'elles sont les SEULES à laisser l'écran final "racines étrangères" varier réellement cas
 * par cas, plutôt que d'être entièrement déterminé par la construction tirée.
 */
const CONSTRUCTEURS_PONDERES: Array<{ construire: () => ExerciceEquationRationnelle; poids: number }> = [
  { construire: construireUnDenominateur, poids: 1 },
  { construire: construireDeuxDenominateurs, poids: 1 },
  { construire: construireDeuxFractionsLineaires, poids: 1 },
  { construire: construireCas4a, poids: 2 },
  { construire: construireCas4b, poids: 2 },
];

const POIDS_TOTAL = CONSTRUCTEURS_PONDERES.reduce((somme, c) => somme + c.poids, 0);

/**
 * Identifiant de variante (convention RETROFIT-variantes-generateurs.md) — réutilise directement le
 * champ `construction` déjà présent sur `ExerciceEquationRationnelle` (union discriminée, voir
 * `core/equationRationnelle.types.ts`), id naturel déjà existant, contrairement à l'exercice 2.
 * Point d'attention documenté dans AUDIT-variantes-generateurs.md, section 5 : `construction:
 * "deux_fractions_lineaires"` tire en interne l'une de 3 sous-variantes (a/b/c), jamais exposée
 * dans le contrat retourné — forcer cette variante ne force donc PAS la sous-variante, qui reste
 * tirée aléatoirement à chaque appel, comportement cohérent avec la demande (aucun sous-niveau
 * prévu par la convention).
 */
export type VarianteEquationRationnelleId = ExerciceEquationRationnelle["construction"];

export interface VarianteEquationRationnelle {
  id: VarianteEquationRationnelleId;
  label: string;
}

/** Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md). */
export const CATALOGUE_VARIANTES: VarianteEquationRationnelle[] = [
  { id: "un_denominateur", label: "Un seul dénominateur (A/(x-p) = x-q)" },
  { id: "deux_denominateurs", label: "Deux dénominateurs avec un facteur commun" },
  { id: "deux_fractions_lineaires", label: "Deux fractions du 1er degré (P1/P1 = P1/P1)" },
  { id: "p2_sur_p1", label: "P2/P1 = P0/P1 (numérateur gauche du 2nd degré)" },
  { id: "p1_sur_p2", label: "P1/P2 = P1/P0 (dénominateur gauche du 2nd degré)" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteEquationRationnelleId, () => ExerciceEquationRationnelle> = {
  un_denominateur: construireUnDenominateur,
  deux_denominateurs: construireDeuxDenominateurs,
  deux_fractions_lineaires: construireDeuxFractionsLineaires,
  p2_sur_p1: construireCas4a,
  p1_sur_p2: construireCas4b,
};

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md).
 */
export function construireAvecVarianteId(varianteId: VarianteEquationRationnelleId): ExerciceEquationRationnelle {
  return CONSTRUCTEURS_PAR_ID[varianteId]();
}

/**
 * Implémentation de la Couche A pour l'exercice "L'inconnue au dénominateur" : tirage PONDÉRÉ
 * entre les 5 constructions (spec-equations-rationnelles-un-denominateur.md /
 * prompt-deux-denominateurs-racine-etrangere.md / prompt-2-cas3-degre1.md / prompt-cas4a-4b.md),
 * remplaçant l'ancien tirage à poids strictement égal (1/5 chacune, laissé "à affiner globalement
 * plus tard" depuis la première version, jamais repris).
 *
 * Repris après audit pédagogique du chapitre 2 : la ligne juste au-dessus dit déjà "l'élève ne
 * doit jamais pouvoir deviner à l'avance dans quel cas il se trouve à partir de la seule
 * apparence de l'énoncé" — vrai pour les 4 premiers écrans de chaque construction, mais PAS pour
 * le dernier ("racines étrangères"), où la construction tirée déterminait seule la réponse dans
 * 3 cas sur 5 :
 * - un_denominateur : `p` est exclu des racines de l'équation PAR CONSTRUCTION
 *   (construireDonnees.ts) — A/(x-p)=x-q exige A≠0 pour que l'équation ait un sens, et p=racine
 *   donnerait A=0 (dégénéré, pas un choix d'implémentation arbitraire). Donc TOUJOURS "les deux
 *   valides", par nécessité mathématique de cette forme, pas par accident.
 * - deux_denominateurs : le facteur commun (x-p) entre les deux dénominateurs est le principe
 *   même de cette construction (construireDeuxDenominateurs.ts, "racine étrangère systématique").
 *   Donc TOUJOURS "x=p à rejeter", par conception.
 * - deux_fractions_lineaires : ses 3 sous-variantes internes sont également déterministes
 *   (construireSousVarianteA/B/C.ts) — a toujours 1 rejet, b toujours 0 rejet, c exclut
 *   explicitement toute coïncidence racine/CE "pour garantir généralement aucun rejet".
 * Seules p2_sur_p1 (cas4a) et p1_sur_p2 (cas4b) laissent la coïncidence racine/CE émerger d'une
 * vraie recherche numérique (chercherParametreEtRacines.ts), sans jamais l'exclure ni la forcer —
 * les deux SEULES constructions où répondre juste à l'écran "racines étrangères" exige un vrai
 * contrôle de la CE plutôt que la reconnaissance de la forme de l'équation (une seule fraction ?
 * deux fractions partageant un facteur visible ? etc.).
 *
 * Les 3 autres restent dans la rotation à poids 1, jamais 0 : chacune teste une mécanique de
 * résolution différente (un seul dénominateur, deux dénominateurs à facteur commun, deux
 * fractions du 1er degré) qui reste utile à pratiquer pour elle-même — seule la pondération
 * change, pas leur place dans le générateur.
 */
export const genererExerciceEquationRationnelle: GenerateurExerciceEquationRationnelle = () => {
  let tirage = Math.random() * POIDS_TOTAL;
  for (const { construire, poids } of CONSTRUCTEURS_PONDERES) {
    if (tirage < poids) return construire();
    tirage -= poids;
  }
  // Ne devrait jamais arriver (somme des poids parcourus == POIDS_TOTAL) — dernier recours défensif.
  return CONSTRUCTEURS_PONDERES[CONSTRUCTEURS_PONDERES.length - 1].construire();
};
