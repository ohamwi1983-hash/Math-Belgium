/**
 * Couche A — "Centre et rayon d'un cercle depuis l'équation développée". 2 variantes qui
 * différencient réellement la compétence exercée : `"rationnel"` (le rayon final est une fraction
 * simple) et `"irrationnel"` (le rayon reste sous forme de racine, jamais simplifiable en
 * rationnel).
 *
 * Construction — direction centre/rayon → équation développée (jamais l'inverse, plus fiable pour
 * garantir une équation "propre", coefficients entiers) :
 *  - a = A/2, b = B/2 (A,B entiers, jamais tous deux nuls) : le centre, entier ou demi-entier.
 *  - Q un entier strictement positif ; r² = a²+b²+Q, soit r² = R/4 avec R = A²+B²+4Q.
 *  - k un entier strictement positif (coefficient commun devant x² ET y², jamais deux coefficients
 *    distincts — la contrainte de génération "même valeur, même signe" essentielle à ce que
 *    l'équation représente bien un cercle, jamais une ellipse).
 *  - bx = -kA = -2ka, by = -kB = -2kb, c = kQ = k(r²-a²-b²) : coefficients TOUJOURS entiers par
 *    construction (kQ, kA, kB sont des produits d'entiers), quels que soient a/b demi-entiers.
 *
 * Preuve que r est rationnel ⟺ R est un carré parfait d'ENTIER (jamais un artefact de la
 * représentation R/4 choisie — une vraie propriété arithmétique) : si r=p/q en fraction
 * irréductible et r²=R/4, alors 4p²=Rq² ; comme pgcd(p,q)=1, q² divise 4 donc q∈{1,2} ; dans les
 * deux cas R est le carré d'un entier (p² si q=2, 4p² si q=1). Réciproquement R=m² donne
 * directement r=m/2, rationnel. Corollaire utile pour la génération : si A ET B sont tous deux
 * impairs, A²+B²≡2 (mod 4) et R=A²+B²+4Q≡2 (mod 4) pour TOUT Q — or un carré parfait n'est jamais
 * ≡2 (mod 4) (0 ou 1 seulement) : le rayon ne peut alors JAMAIS être rationnel, quel que soit Q.
 * La variante `"rationnel"` exclut donc explicitement ce cas (A et B tous deux impairs) plutôt que
 * de chercher indéfiniment un Q qui n'existe pas.
 */
import type { ExerciceEquationCercleDeveloppee, VarianteEquationCercleDeveloppee } from "../../core/equationCercleDeveloppee.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const BORNE_AB = 6;
const K_VALEURS = [1, 2, 3, 4];
const Q_MIN = 1;
const Q_MAX = 12;

function estCarreParfait(n: number): boolean {
  if (n < 0) return false;
  const racine = Math.round(Math.sqrt(n));
  return racine * racine === n;
}

/** A,B non nuls (chaque groupe x/y a toujours un terme linéaire à l'écran 1), pas tous deux impairs
 * si `exigerRationnelPossible` (sinon aucun Q ne peut jamais donner un rayon rationnel). */
function tirerAB(exigerRationnelPossible: boolean): [number, number] {
  for (;;) {
    const A = randomInt(-BORNE_AB, BORNE_AB);
    const B = randomInt(-BORNE_AB, BORNE_AB);
    if (A === 0 || B === 0) continue;
    if (exigerRationnelPossible && A % 2 !== 0 && B % 2 !== 0) continue;
    return [A, B];
  }
}

/** Cherche, parmi Q∈[Q_MIN,Q_MAX], ceux dont R=A²+B²+4Q satisfait la condition de carré parfait
 * demandée par la variante — `null` si aucun (l'appelant retire alors A/B). */
function candidatsQ(A: number, B: number, variante: VarianteEquationCercleDeveloppee): number[] {
  const candidats: number[] = [];
  for (let Q = Q_MIN; Q <= Q_MAX; Q++) {
    const R = A * A + B * B + 4 * Q;
    const carre = estCarreParfait(R);
    if (variante === "rationnel" ? carre : !carre) candidats.push(Q);
  }
  return candidats;
}

export function construireExercice(variante: VarianteEquationCercleDeveloppee): ExerciceEquationCercleDeveloppee {
  for (;;) {
    const [A, B] = tirerAB(variante === "rationnel");
    const candidats = candidatsQ(A, B, variante);
    if (candidats.length === 0) continue;
    const Q = candidats[randomInt(0, candidats.length - 1)]!;
    const R = A * A + B * B + 4 * Q;
    const k = K_VALEURS[randomInt(0, K_VALEURS.length - 1)]!;

    const centre = { x: A / 2, y: B / 2 };
    const rayonCarre = R / 4;
    const rayon = Math.sqrt(rayonCarre);
    const bx = -k * A;
    const by = -k * B;
    const c = k * Q;

    return { variante, k, bx, by, c, centre, rayonCarre, rayon };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteEquationCercleDeveloppee; label: string }[] = [
  { id: "rationnel", label: "Rayon rationnel" },
  { id: "irrationnel", label: "Rayon irrationnel" },
];

export function construireAvecVarianteId(varianteId: VarianteEquationCercleDeveloppee): ExerciceEquationCercleDeveloppee {
  return construireExercice(varianteId);
}

export function genererExerciceEquationCercleDeveloppee(): ExerciceEquationCercleDeveloppee {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
