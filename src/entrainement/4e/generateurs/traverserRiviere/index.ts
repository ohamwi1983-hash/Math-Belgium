import type { ExerciceTraverserRiviere, QuatriemeRiviere, SituationRiviere } from "../../core/traverserRiviere.types";
import { abscisseAccostage, estDecimalCourt } from "../../moteur/modeleTraverserRiviere";

/**
 * Générateur de « Traverser une rivière : vitesses en composantes » (gen87). Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - valeurs plausibles par situation (nageur ≈ 1 m/s, bateau jusqu'à 6 m/s…), m et m/s seulement
 *   (aucune conversion) ;
 * - `accostage` : durée ENTIÈRE (L = py · t), composantes à une décimale au plus, x(v_R) > 0 (le
 *   courant l'emporte : on accoste en aval), x_A entre 0,1 L et 2,5 L ; px ≠ 0 en dehors du cas
 *   « perpendiculairement aux rives » ;
 * - `enFace` : vitesse propre nettement supérieure au courant (v ≥ 1,25 c) : la traversée juste en
 *   face est toujours possible (le cas v ≤ c n'est jamais tiré) ;
 * - environ une instance sur deux a une norme décimale (triplet pythagoricien : faisable sans
 *   calculatrice), l'autre une racine irrationnelle (valeur arrondie demandée).
 */

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}

interface Plages {
  vy: [number, number];
  courant: [number, number];
  /** Pas des vitesses tirées au hasard (hors triplets). */
  pas: number;
  largeur: [number, number];
  /** |px| maximal (vitesse propre oblique). */
  pxMax: number;
  /** Norme de la vitesse propre (`enFace`). */
  norme: [number, number];
  /** Pas de la largeur tirée au hasard (`enFace` irrationnel). */
  pasLargeur: number;
}

const PLAGES: Record<SituationRiviere, Plages> = {
  nageur: { vy: [0.5, 1.6], courant: [0.3, 1.2], pas: 0.1, largeur: [20, 90], pxMax: 0.6, norme: [0.8, 2], pasLargeur: 5 },
  kayak: { vy: [1, 3], courant: [0.4, 2], pas: 0.1, largeur: [30, 150], pxMax: 1, norme: [1.5, 3.5], pasLargeur: 5 },
  bateau: { vy: [2, 6], courant: [0.5, 3], pas: 0.5, largeur: [60, 400], pxMax: 2, norme: [3, 8], pasLargeur: 10 },
  bac: { vy: [1.5, 4], courant: [0.5, 2.5], pas: 0.5, largeur: [80, 400], pxMax: 1.5, norme: [2, 5], pasLargeur: 10 },
};

export const SITUATIONS: SituationRiviere[] = ["bateau", "nageur", "kayak", "bac"];

/** Triplets pythagoriciens de base (a, b, h) et facteurs d'échelle (une décimale au plus). */
const TRIPLETS: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];
const ECHELLES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5];

function dans(v: number, [min, max]: [number, number]): boolean {
  return v >= min - 1e-9 && v <= max + 1e-9;
}

function grille([min, max]: [number, number], pas: number): number[] {
  const valeurs: number[] = [];
  for (let v = min; v <= max + 1e-9; v += pas) valeurs.push(r1(v));
  return valeurs;
}

/** Durées entières t telles que L = vy · t soit un entier de la plage. */
function choisirDuree(vy: number, plage: [number, number]): { t: number; largeur: number } | null {
  const candidats: { t: number; largeur: number }[] = [];
  for (let t = 4; t <= 600; t++) {
    const l = vy * t;
    if (Math.abs(l - Math.round(l)) > 1e-9 || !dans(l, plage)) continue;
    candidats.push({ t, largeur: Math.round(l) });
  }
  if (candidats.length === 0) return null;
  // Largeurs « rondes » (multiples de 5) préférées quand il y en a.
  const ronds = candidats.filter((c) => c.largeur % 5 === 0);
  return choisir(ronds.length > 0 && Math.random() < 0.7 ? ronds : candidats);
}

/** Tirage d'un triplet mis à l'échelle : [cathète 1, cathète 2, hypoténuse]. */
function triplet(): [number, number, number] {
  const [a, b, h] = choisir(TRIPLETS);
  const k = choisir(ECHELLES);
  const [p, q] = Math.random() < 0.5 ? [a, b] : [b, a];
  return [r1(p * k), r1(q * k), r1(h * k)];
}

export function genererAccostage(situation: SituationRiviere, perpendiculaire: boolean, quatrieme?: QuatriemeRiviere, exacte?: boolean): ExerciceTraverserRiviere {
  const p = PLAGES[situation];
  const avecTriplet = exacte ?? Math.random() < 0.5;
  for (;;) {
    let vx: number;
    let vy: number;
    if (avecTriplet) {
      [vx, vy] = triplet();
    } else {
      vy = choisir(grille(p.vy, p.pas));
      vx = choisir(grille([p.pas, p.courant[1] + p.pxMax], p.pas));
      if (estDecimalCourt(Math.hypot(vx, vy))) continue;
    }
    if (!dans(vy, p.vy) || vx <= 0) continue;
    let courant: number;
    let px: number;
    if (perpendiculaire) {
      courant = vx;
      px = 0;
      if (!dans(courant, p.courant)) continue;
    } else {
      courant = choisir(grille(p.courant, p.pas));
      px = r1(vx - courant);
      if (Math.abs(px) < 0.2 || Math.abs(px) > p.pxMax) continue;
      // Une vitesse propre surtout « vers l'aval » serait peu plausible : |px| reste inférieur à py.
      if (Math.abs(px) >= vy) continue;
    }
    const d = choisirDuree(vy, p.largeur);
    if (!d) continue;
    const e: ExerciceTraverserRiviere = {
      variante: "accostage",
      situation,
      largeur: d.largeur,
      courant,
      px,
      py: vy,
      perpendiculaire,
      normePropre: 0,
      quatrieme: quatrieme ?? choisir(["vitesse", "distance"] as const),
    };
    const xA = abscisseAccostage(e);
    if (xA < 0.1 * e.largeur || xA > 2.5 * e.largeur) continue;
    return e;
  }
}

export function genererEnFace(situation: SituationRiviere, exacte?: boolean): ExerciceTraverserRiviere {
  const p = PLAGES[situation];
  const avecTriplet = exacte ?? Math.random() < 0.5;
  for (;;) {
    let courant: number;
    let norme: number;
    let largeur: number;
    if (avecTriplet) {
      const [a, b, h] = triplet();
      courant = a;
      norme = h;
      if (!dans(courant, p.courant) || !dans(norme, p.norme) || !dans(b, p.vy)) continue;
      const d = choisirDuree(b, p.largeur);
      if (!d) continue;
      largeur = d.largeur;
    } else {
      courant = choisir(grille(p.courant, p.pas));
      norme = choisir(grille(p.norme, p.pas));
      const vy = Math.sqrt(norme ** 2 - courant ** 2);
      if (!Number.isFinite(vy) || estDecimalCourt(vy) || !dans(vy, p.vy)) continue;
      largeur = choisir(grille(p.largeur, p.pasLargeur).filter((l) => l % p.pasLargeur === 0));
    }
    if (norme < 1.25 * courant) continue;
    return { variante: "enFace", situation, largeur, courant, px: 0, py: 0, perpendiculaire: false, normePropre: norme, quatrieme: "vitesse" };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "accostage-perpendiculaire", label: "Où accoste-t-il ? — vitesse propre perpendiculaire aux rives" },
  { id: "accostage-oblique", label: "Où accoste-t-il ? — vitesse propre donnée par ses composantes" },
  { id: "en-face", label: "Quelle direction pour arriver juste en face ?" },
];

export function construireAvecVariante(id: string): ExerciceTraverserRiviere {
  const situation = choisir(SITUATIONS);
  if (id === "accostage-perpendiculaire") return genererAccostage(situation, true);
  if (id === "accostage-oblique") return genererAccostage(situation, false);
  if (id === "en-face") return genererEnFace(situation);
  return genererExerciceTraverserRiviere();
}

/** Tirage libre : les trois variantes, à parts égales. */
export function genererExerciceTraverserRiviere(): ExerciceTraverserRiviere {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
