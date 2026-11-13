import type { Composantes, Point } from "../../core/vecteur.types";
import type {
  Deplacement,
  Direction,
  ExerciceDeplacementsSuccessifs,
  QuestionDeplacements,
  SituationDeplacements,
} from "../../core/deplacementsSuccessifs.types";
import { carreNorme, composantes, echelle, estDiagonale, positions, simplifierRacine, total } from "../../moteur/modeleDeplacementsSuccessifs";

/**
 * Générateur de « Carte au trésor et randonnée : déplacements successifs » (gen86). Tout le hasard
 * passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine,
 * et le QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - 3 ou 4 déplacements, jamais deux de suite dans la même direction ni dans des directions
 *   opposées ; au moins un déplacement à composante négative (ouest ou sud : le piège du signe) ;
 *   au moins un déplacement qui change x et un qui change y ; carte au trésor : 0 ou 1 pas en
 *   diagonale ;
 * - le trajet ne repasse jamais par le départ ni par un point déjà atteint, et tout tient dans une
 *   carte de 18 cases × 18 cases au plus (figure lisible à 390 px) ;
 * - le vecteur dont on demande la norme (DA, PC ou RT) a deux composantes non nulles et une norme
 *   irrationnelle (√41, 3√5, 100√13…), sauf dans le cas particulier « sur un axe » (≈ 1 tirage sur
 *   9 pour le retour et le dernier déplacement, jamais pour le grand pas répété) ;
 * - grand pas w : deux composantes non nulles, k entre 3 et 5.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const AXES: Direction[] = ["E", "N", "O", "S"];
const DIAGONALES: Direction[] = ["NE", "NO", "SE", "SO"];
const OPPOSEES: Record<Direction, Direction> = { E: "O", O: "E", N: "S", S: "N", NE: "SO", SO: "NE", NO: "SE", SE: "NO" };
const PROBA_SUR_UN_AXE = 1 / 9;
const DEMI_CARTE = 9;
const ETENDUE_MAX = 16;

const LONGUEUR_MAX: Record<SituationDeplacements, number> = { tresor: 7, randonnee: 8, drone: 6 };

function estCarreParfait(n: number): boolean {
  return simplifierRacine(n).b === 1;
}

/** Vecteur « générique » : deux composantes non nulles, norme irrationnelle. */
function generique(v: Composantes): boolean {
  return v.x !== 0 && v.y !== 0 && !estCarreParfait(carreNorme(v));
}

function surAxe(v: Composantes): boolean {
  return (v.x === 0) !== (v.y === 0);
}

/** Suite de déplacements en unités de CASE (×100 m ensuite pour le drone). */
function tirerDeplacements(situation: SituationDeplacements, n: number, diagonale: boolean): Deplacement[] | null {
  const rangDiagonale = diagonale ? entier(0, n - 1) : -1;
  const liste: Deplacement[] = [];
  for (let i = 0; i < n; i++) {
    const pool = i === rangDiagonale ? DIAGONALES : AXES;
    const precedent = liste[i - 1]?.direction;
    const possibles = pool.filter((d) => d !== precedent && (precedent === undefined || d !== OPPOSEES[precedent]));
    const direction = choisir(possibles);
    const longueur = estDiagonale(direction) ? entier(1, 4) : entier(1, LONGUEUR_MAX[situation]);
    liste.push({ direction, longueur });
  }
  const vecteurs = liste.map(composantes);
  if (!vecteurs.some((v) => v.x < 0 || v.y < 0)) return null;
  if (!vecteurs.some((v) => v.x !== 0) || !vecteurs.some((v) => v.y !== 0)) return null;
  return liste;
}

/** Tous les points (départ, positions, cible, étapes du grand pas) tiennent dans la carte, sans
 * repasser par un point déjà atteint. */
function carteLisible(points: Point[], trajet: Point[]): boolean {
  if (points.some((p) => Math.abs(p.x) > DEMI_CARTE || Math.abs(p.y) > DEMI_CARTE)) return false;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  if (Math.max(...xs) - Math.min(...xs) > ETENDUE_MAX || Math.max(...ys) - Math.min(...ys) > ETENDUE_MAX) return false;
  const vus = new Set<string>(["0;0"]);
  for (const p of trajet) {
    const cle = `${p.x};${p.y}`;
    if (vus.has(cle)) return false;
    vus.add(cle);
  }
  return true;
}

const GRANDS_PAS: Composantes[] = [
  { x: 2, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: -1 },
  { x: 1, y: -2 },
  { x: -2, y: 1 },
  { x: -1, y: 2 },
  { x: -2, y: -1 },
  { x: -1, y: -2 },
  { x: 3, y: 1 },
  { x: 1, y: 3 },
  { x: 3, y: -1 },
  { x: -1, y: 3 },
];

/** Mise à l'échelle (drone : une case = 100 m). */
function aLEchelle(e: ExerciceDeplacementsSuccessifs): ExerciceDeplacementsSuccessifs {
  const f = echelle(e.situation);
  if (f === 1) return e;
  return {
    ...e,
    deplacements: e.deplacements.map((d) => ({ ...d, longueur: d.longueur * f })),
    cible: e.cible ? { x: e.cible.x * f, y: e.cible.y * f } : null,
  };
}

export function genererDeplacementsSuccessifs(
  situation: SituationDeplacements,
  question: QuestionDeplacements,
  options: { n?: number; diagonale?: boolean; surUnAxe?: boolean; precision?: "exacte" | "arrondi" } = {},
): ExerciceDeplacementsSuccessifs {
  const n = options.n ?? entier(3, 4);
  const diagonale = situation === "tresor" ? (options.diagonale ?? Math.random() < 0.5) : false;
  const axe = question === "repetition" ? false : (options.surUnAxe ?? Math.random() < PROBA_SUR_UN_AXE);
  const precision = options.precision ?? (Math.random() < 0.5 ? "exacte" : "arrondi");
  for (;;) {
    const deplacements = tirerDeplacements(situation, n, diagonale);
    if (!deplacements) continue;
    const base: ExerciceDeplacementsSuccessifs = { situation, question, deplacements, precision, cible: null, pas: null, k: null };
    const trajet = positions(base);
    const arrivee = total(base);
    if (question === "retour") {
      if (axe ? !surAxe(arrivee) : !generique(arrivee)) continue;
      if (!carteLisible([{ x: 0, y: 0 }, ...trajet], trajet)) continue;
      return aLEchelle(base);
    }
    if (question === "dernier") {
      const v: Composantes = axe
        ? choisir([
            { x: 0, y: choisir([-1, 1]) * entier(2, 7) },
            { x: choisir([-1, 1]) * entier(2, 7), y: 0 },
          ])
        : { x: choisir([-1, 1]) * entier(1, 7), y: choisir([-1, 1]) * entier(1, 7) };
      if (!axe && !generique(v)) continue;
      const cible = { x: arrivee.x + v.x, y: arrivee.y + v.y };
      if (cible.x === 0 && cible.y === 0) continue;
      if (trajet.some((p) => p.x === cible.x && p.y === cible.y)) continue;
      if (!carteLisible([{ x: 0, y: 0 }, ...trajet, cible], trajet)) continue;
      return aLEchelle({ ...base, cible });
    }
    // repetition : le rocher R, puis k fois le grand pas w jusqu'au trésor T.
    const pas = choisir(GRANDS_PAS);
    const k = entier(3, 5);
    const etapes = Array.from({ length: k }, (_, j) => ({ x: arrivee.x + (j + 1) * pas.x, y: arrivee.y + (j + 1) * pas.y }));
    const cible = etapes[k - 1]!;
    if (etapes.some((p) => p.x === 0 && p.y === 0)) continue;
    if (!carteLisible([{ x: 0, y: 0 }, ...trajet, ...etapes], [...trajet, ...etapes])) continue;
    return { ...base, cible, pas, k };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

const VARIANTES: { id: string; situation: SituationDeplacements; question: QuestionDeplacements; label: string }[] = [
  { id: "tresor-retour", situation: "tresor", question: "retour", label: "Carte au trésor — revenir au départ" },
  { id: "tresor-repetition", situation: "tresor", question: "repetition", label: "Carte au trésor — répéter un grand pas" },
  { id: "randonnee-retour", situation: "randonnee", question: "retour", label: "Randonnée — rentrer en ligne droite" },
  { id: "randonnee-dernier", situation: "randonnee", question: "dernier", label: "Randonnée — rejoindre le refuge" },
  { id: "drone-retour", situation: "drone", question: "retour", label: "Drone — rentrer à l'entrepôt" },
  { id: "drone-dernier", situation: "drone", question: "dernier", label: "Drone — livrer le client" },
];

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = VARIANTES.map(({ id, label }) => ({ id, label }));

export function varianteDe(e: ExerciceDeplacementsSuccessifs): string {
  return `${e.situation}-${e.question}`;
}

export function construireAvecVariante(id: string): ExerciceDeplacementsSuccessifs {
  const v = VARIANTES.find((x) => x.id === id);
  if (!v) return genererExerciceDeplacementsSuccessifs();
  return genererDeplacementsSuccessifs(v.situation, v.question);
}

/** Tirage libre : une des six variantes au hasard. */
export function genererExerciceDeplacementsSuccessifs(): ExerciceDeplacementsSuccessifs {
  const v = choisir(VARIANTES);
  return genererDeplacementsSuccessifs(v.situation, v.question);
}
