import type {
  DonneesVecteurs,
  ExerciceDetectiveVecteurs,
  IdDescriptionVecteurs,
  IdScenarioVecteurs,
  Point,
  SousVarianteVecteurs,
  TypeErreurVecteurs,
} from "../../core/detectiveVecteurs.types";
import { SCENARIOS, SCENARIOS_PAR_TYPE, SOUS_VARIANTES, copieEleve, descriptionCorrecte, indiceLigneFausse, memeValeur, resolutionCorrecte } from "../../moteur/modeleDetectiveVecteurs";

/**
 * Générateur de « Le détective d'erreurs vectoriel » (gen91). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice (données, sous-variante, ordre des descriptions).
 *
 * Variante = type d'erreur ; dans une variante, le scénario (support + ligne fausse) puis la
 * sous-variante sont tirés uniformément (chaque forme sort avec une probabilité d'au moins 25 % :
 * séries équilibrées faciles à reproduire, `profil.ts`).
 *
 * Garanties (vérifiées par tirages massifs) :
 * - coordonnées entières (milieu : demi-entiers), composantes non nulles là où l'erreur doit se voir ;
 * - l'erreur se VOIT : la valeur de la ligne fausse ET le point final (s'il y en a un) diffèrent des
 *   bonnes valeurs ;
 * - question à décider (isocèle, alignés, rectangle) : le VERDICT juste est tiré à pile ou face,
 *   indépendamment du scénario ; celui de la copie en découle (il s'inverse ou non selon les cas) ;
 * - triangle non aplati (A, B, C jamais alignés quand la question n'est pas l'alignement).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function nonNul(max: number): number {
  const v = entier(1, max);
  return Math.random() < 0.5 ? -v : v;
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const add = (P: Point, x: number, y: number): Point => ({ x: P.x + x, y: P.y + y });
const det = (a: Point, b: Point) => a.x * b.y - a.y * b.x;

function pointDepart(): Point {
  return { x: entier(-3, 4), y: entier(-3, 4) };
}

function vecteurNonNul(max: number): Point {
  return { x: nonNul(max), y: nonNul(max) };
}

/** Données entières du support (le verdict juste, s'il y en a un, est tiré ici à pile ou face). */
function tirerDonnees(scenario: IdScenarioVecteurs, sousVariante: SousVarianteVecteurs): DonneesVecteurs {
  const A = pointDepart();
  switch (SCENARIOS[scenario].support) {
    case "relation": {
      for (;;) {
        const u = vecteurNonNul(4);
        const v = vecteurNonNul(4);
        if (det(u, v) === 0) continue;
        return { A, B: add(A, u.x, u.y), C: add(A, v.x, v.y), k: choisir([2, 3, -2] as const) };
      }
    }
    case "chasles": {
      const p = (): Point => ({ x: entier(-4, 7), y: entier(-4, 7) });
      return { A: p(), B: p(), C: p(), D: p() };
    }
    case "isocele": {
      for (;;) {
        const u = vecteurNonNul(5);
        let v: Point;
        if (Math.random() < 0.5) {
          v = choisir([
            { x: u.y, y: -u.x },
            { x: -u.y, y: u.x },
            { x: u.y, y: u.x },
            { x: -u.y, y: -u.x },
            { x: -u.x, y: u.y },
            { x: u.x, y: -u.y },
          ]);
        } else {
          v = vecteurNonNul(5);
          if (v.x * v.x + v.y * v.y === u.x * u.x + u.y * u.y) continue;
        }
        if (det(u, v) === 0) continue;
        if (sousVariante === "carre") {
          const w = scenario === "N1" ? u : v;
          const negatif = w.x < 0 ? w.x : w.y < 0 ? w.y : 0;
          const positif = w.x < 0 ? w.y : w.x;
          if ((w.x < 0) === (w.y < 0) || Math.abs(negatif) >= Math.abs(positif)) continue;
        }
        return { A, B: add(A, u.x, u.y), C: add(A, v.x, v.y) };
      }
    }
    case "alignement": {
      for (;;) {
        let u: Point;
        let v: Point;
        if (Math.random() < 0.5) {
          const w = vecteurNonNul(3);
          const k = choisir([2, 3, -2, -3] as const);
          [u, v] = Math.random() < 0.5 ? [w, { x: k * w.x, y: k * w.y }] : [{ x: k * w.x, y: k * w.y }, w];
        } else {
          u = vecteurNonNul(5);
          v = vecteurNonNul(5);
          if (det(u, v) === 0) continue;
        }
        return { A, B: add(A, u.x, u.y), C: add(A, v.x, v.y) };
      }
    }
    case "rectangle": {
      for (;;) {
        const u = vecteurNonNul(4);
        let v: Point;
        if (Math.random() < 0.5) {
          const m = choisir([1, 2, -1, -2] as const);
          v = { x: -m * u.y, y: m * u.x };
        } else {
          v = vecteurNonNul(5);
          if (u.x * v.x + u.y * v.y === 0 || det(u, v) === 0) continue;
        }
        if (sousVariante === "produit" && !((u.x < 0 && v.x < 0) || (u.y < 0 && v.y < 0))) continue;
        return { A, B: add(A, u.x, u.y), C: add(A, v.x, v.y) };
      }
    }
    case "parallelogramme":
    case "milieu": {
      for (;;) {
        const P = { x: entier(-3, 7), y: entier(-3, 7) };
        const u = vecteurNonNul(5);
        const v = vecteurNonNul(6);
        if (det(u, v) === 0) continue;
        if (SCENARIOS[scenario].support === "milieu" && (P.x === 0 || P.y === 0)) continue;
        return { A: P, B: add(P, u.x, u.y), C: add(P, v.x, v.y) };
      }
    }
  }
}

function sousVariantePour(scenario: IdScenarioVecteurs): SousVarianteVecteurs {
  const liste = SOUS_VARIANTES[scenario];
  return liste ? choisir(liste) : null;
}

const dansCadre = (x: number) => x >= -20 && x <= 25;

/** Toutes les garanties de l'en-tête. */
export function instanceValide(e: ExerciceDetectiveVecteurs): boolean {
  const copie = copieEleve(e);
  const correcte = resolutionCorrecte(e);
  const i = indiceLigneFausse(e);
  // Coordonnées et composantes dans un cadre raisonnable (un nombre isolé — norme, déterminant,
  // produit scalaire — peut être plus grand).
  for (const l of [...copie, ...correcte]) {
    const v = l.valeur;
    if (!v || v.genre === "verdict") continue;
    if (v.genre === "nombre" ? !Number.isFinite(v.valeur) : !Number.isFinite(v.x) || !Number.isFinite(v.y) || !dansCadre(v.x) || !dansCadre(v.y)) return false;
  }
  const d = e.donnees;
  for (const P of [d.A, d.B, d.C]) if (!dansCadre(P.x) || !dansCadre(P.y)) return false;
  if (correcte[i]!.valeur && memeValeur(copie[i]!.valeur, correcte[i]!.valeur)) return false;
  const finCopie = copie[copie.length - 1]!.valeur;
  const finJuste = correcte[correcte.length - 1]!.valeur!;
  if (finJuste.genre === "point") {
    // L'erreur doit déplacer le point sur les DEUX coordonnées (sinon une ligne de la copie
    // tomberait juste par hasard et semblerait, elle aussi, être la ligne fausse).
    if (finCopie?.genre !== "point" || finCopie.x === finJuste.x || finCopie.y === finJuste.y) return false;
  }
  const s = SCENARIOS[e.scenario].support;
  if (s === "chasles") {
    const P = [d.A, d.B, d.C, d.D!];
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (P[a]!.x === P[b]!.x && P[a]!.y === P[b]!.y) return false;
    const vc = copie[0]!.valeur!;
    if (vc.genre !== "vecteur" || vc.x === 0 || vc.y === 0) return false;
  }
  if (s === "isocele") {
    const n = copie[i]!.valeur;
    if (n?.genre !== "nombre" || n.valeur <= 0) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

function leurres(scenario: IdScenarioVecteurs, sousVariante: SousVarianteVecteurs): IdDescriptionVecteurs[] {
  switch (scenario) {
    case "S1":
    case "S2":
      return ["milieuVecteur", "chaslesSuivi", "translationSigne"];
    case "S3":
      return ["parallelogrammeCD", "milieuVecteur", "translationSigne"];
    case "C1":
      return ["sens", "translationSigne", "milieuVecteur"];
    case "N1":
    case "N2":
      return [sousVariante === "carre" ? "racine" : "carre", "normeSomme", "pythagoreIsocele"];
    case "K1":
      return [sousVariante === "rapports" ? "detSigne" : "rapports", "confondOrthogonalite", "conditionNorme"];
    case "O1":
      return [sousVariante === "produit" ? "scalaireSigne" : "produitSigne", "confondColinearite", "conditionNorme"];
    case "P1":
      return ["parallelogrammeAD", "milieu", "translationSigne"];
    case "P2":
      return ["milieuDiagonales", "milieuDouble", "parallelogrammeCD"];
  }
}

export function genererDetectiveVecteurs(scenario: IdScenarioVecteurs): ExerciceDetectiveVecteurs {
  for (;;) {
    const sousVariante = sousVariantePour(scenario);
    const e: ExerciceDetectiveVecteurs = { scenario, donnees: tirerDonnees(scenario, sousVariante), sousVariante, options: [] };
    if (!instanceValide(e)) continue;
    return { ...e, options: melanger([descriptionCorrecte(e), ...leurres(scenario, sousVariante)]) };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: TypeErreurVecteurs; label: string }[] = [
  { id: "sens", label: "Composantes de AB calculées A − B" },
  { id: "chasles", label: "Relation de Chasles mal enchaînée" },
  { id: "norme", label: "Norme : racine oubliée ou carré négatif" },
  { id: "colinearite", label: "Mauvais critère de colinéarité" },
  { id: "orthogonalite", label: "Signe faux dans le produit scalaire" },
  { id: "parallelogramme", label: "Parallélogramme : AB = CD ou milieu faux" },
];

export function construireAvecVariante(id: string): ExerciceDetectiveVecteurs {
  const scenarios = SCENARIOS_PAR_TYPE[id as TypeErreurVecteurs];
  if (!scenarios) return genererExerciceDetectiveVecteurs();
  return genererDetectiveVecteurs(choisir(scenarios));
}

/** Tirage libre : un type d'erreur au hasard, puis un scénario de ce type. */
export function genererExerciceDetectiveVecteurs(): ExerciceDetectiveVecteurs {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
