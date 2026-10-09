import type { AffixeSimple, ExerciceComplexesBIntersection, ExerciceComplexesBSimple, SousTypeLieuB } from "../../core6e/complexesAvances.types";
import { POINTS_REMARQUABLES, combinerModuleAngle } from "../formeTrigonometrique/familleA";
import { angleDepuisFraction } from "../formeTrigonometrique/angles";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { racineRationnelleLatex } from "./racineRationnelle";

/**
 * Couche A (6e) — génération, famille B ("Lieux géométriques") de `6gen42`, chapitre 7 "Nombres
 * complexes" (générateur de clôture).
 *
 * ============================================================================
 * **6 sous-types, tirage ÉQUIPROBABLE (mirroir `familleB.ts`/6gen40)**
 * ============================================================================
 * `droite`, `thales`, `apollonius`, `demiDroites`, `cercleO` — 2 écrans chacun (poser l'équation en
 * x,y ; identifier nature+paramètres). `intersection` — 3 écrans, TOUJOURS la combinaison FIXE
 * droite∩cercleO (voir `construireFamilleBIntersection` ci-dessous), construite "depuis la cible" :
 * les 2 points d'intersection sont choisis EN PREMIER, la droite et le cercle sont ENSUITE dérivés
 * pour passer exactement par ces 2 points — jamais l'inverse (qui donnerait des points
 * d'intersection génériquement IRRATIONNELS, non typables dans `moteur6e/expressionComplexe.ts`,
 * qui n'a AUCUN `sqrt`).
 *
 * ============================================================================
 * **Rationalité des paramètres — pourquoi `apollonius`/`thales` restent typables SANS `sqrt`**
 * ============================================================================
 * `moteur6e/expressionComplexe.ts` (vérificateur des champs "affixe a+bi", ex. centre d'un cercle)
 * n'a AUCUNE fonction `sqrt` — mais `k` est toujours un ENTIER ici (2 ou 3), donc le centre
 * d'Apollonius `(p1-k²p2)/(1-k²)` reste une combinaison RATIONNELLE de `p1,p2,k²` (÷ par un entier
 * non nul) — TOUJOURS rationnel, jamais irrationnel, quels que soient `p1,p2` entiers. Le RAYON,
 * lui, est vérifié via `moteur6e/equivalenceExponentielle.ts` (`diagnostiquerValeur`, `sqrt` supporté
 * nativement) — peut donc rester irrationnel (`|p1-p2|` n'est pas toujours un carré parfait) SANS
 * poser de problème de saisie. Même raisonnement pour `thales` (centre = milieu, toujours rationnel ;
 * rayon = distance/2, `sqrt` accepté).
 *
 * ============================================================================
 * **`demiDroites` — angle(s) tiré(s) via la banque des 16 remarquables (fermeture EXACTE de `c`)**
 * ============================================================================
 * `z+z̄=c|z|` ⟺ `2x=c√(x²+y²)` ⟺ (pour `x²+y²>0`) `cos(θ)=c/2`. En tirant `θ0` parmi les 9 angles
 * remarquables de `[0;π]` (réutilisation directe de `POINTS_REMARQUABLES`, `formeTrigonometrique/
 * familleA.ts`, Couche A ↔ Couche A libre — CLAUDE.md) et en posant `c=2cos(θ0)` (EXACT, via
 * `combinerModuleAngle(2,·)`, jamais reconstruit depuis un flottant), on obtient TOUJOURS un `c`
 * EXACT et une solution en angle(s) EXACTE(S) : `θ0∈{0,π}` (`cos=±1`) ⟹ UNE seule demi-droite
 * (`+θ0` et `-θ0` coïncident, `sin θ0=0`) ; sinon ⟹ DEUX demi-droites, `±θ0` (`cos` est PAIRE,
 * `sin(±θ0)` diffère seulement de signe mais `√(x²+y²)` ne voit pas ce signe — les 2 branches
 * vérifient bien l'équation d'origine, voir `familleB.test.ts` pour la vérification numérique
 * directe de cette propriété sur les 9 angles).
 *
 * ============================================================================
 * **Piège transversal — exclusion du pôle (`droite`/`thales` uniquement)**
 * ============================================================================
 * `poleExclu=p2` pour ces 2 sous-types (dénominateur `z-p2` de la condition source s'annule en
 * `z=p2`) — `null` pour les 3 autres (aucun dénominateur dans leur condition source). Consommé côté
 * `components6e/EtapeLocusComplexesAvances.tsx` (3e champ conditionnel, demandé UNIQUEMENT quand
 * `poleExclu!==null` ET que l'élève a choisi la nature CORRESPONDANTE) et
 * `moteur6e/verificationComplexesAvances.ts`.
 */

function tirerPointNonNul(min: number, max: number): AffixeSimple {
  let a = 0;
  let b = 0;
  do {
    a = tirerEntier(min, max);
    b = tirerEntier(min, max);
  } while (a === 0 && b === 0);
  return { a, b };
}

function tirerDeuxPointsDistincts(min: number, max: number): [AffixeSimple, AffixeSimple] {
  const p1 = tirerPointNonNul(min, max);
  let p2 = tirerPointNonNul(min, max);
  while (p2.a === p1.a && p2.b === p1.b) p2 = tirerPointNonNul(min, max);
  return [p1, p2];
}

/** `distance(p1,p2)²`, EXACT (entier) — p1,p2 toujours entiers ici. */
function distanceCarree(p1: AffixeSimple, p2: AffixeSimple): number {
  return (p1.a - p2.a) ** 2 + (p1.b - p2.b) ** 2;
}

const SOUS_TYPES: SousTypeLieuB[] = ["droite", "thales", "apollonius", "demiDroites", "cercleO"];

export function construireFamilleBSimple(sousTypeForce?: SousTypeLieuB): ExerciceComplexesBSimple {
  const sousType = sousTypeForce ?? tirerParmi(SOUS_TYPES);

  if (sousType === "droite") {
    const [p1, p2] = tirerDeuxPointsDistincts(-4, 4);
    return { famille: "B", sousType, p1, p2, poleExclu: p2, resultat: { nature: "droite", point1: p1, point2: p2 } };
  }

  if (sousType === "thales") {
    const [p1, p2] = tirerDeuxPointsDistincts(-4, 4);
    const centre = { a: (p1.a + p2.a) / 2, b: (p1.b + p2.b) / 2 };
    const rayonExact = racineRationnelleLatex(distanceCarree(p1, p2), 4);
    return { famille: "B", sousType, p1, p2, poleExclu: p2, resultat: { nature: "cercle", centre, rayon: rayonExact.numerique, rayonLatex: rayonExact.latex } };
  }

  if (sousType === "apollonius") {
    const [p1, p2] = tirerDeuxPointsDistincts(-4, 4);
    const k = tirerParmi([2, 3] as const);
    const denom = 1 - k * k;
    const centre = { a: (p1.a - k * k * p2.a) / denom, b: (p1.b - k * k * p2.b) / denom };
    const rayonExact = racineRationnelleLatex(k * k * distanceCarree(p1, p2), denom * denom);
    return { famille: "B", sousType, p1, p2, k, poleExclu: null, resultat: { nature: "cercle", centre, rayon: rayonExact.numerique, rayonLatex: rayonExact.latex } };
  }

  if (sousType === "demiDroites") {
    const candidats = POINTS_REMARQUABLES.filter((pt) => pt.angle.p >= 0);
    const point = tirerParmi(candidats);
    const theta0 = point.angle;
    const cValeur = combinerModuleAngle(2, point.cos);
    const c = cValeur.numerique;
    const unSeulRayon = theta0.p === 0 || theta0.p === theta0.q;
    const angles = unSeulRayon ? [theta0] : [theta0, angleDepuisFraction(-theta0.p, theta0.q)];
    // p1/p2 sans rôle ici — champs conservés à (0,0) pour uniformité du contrat (jamais lus par
    // l'écran 1/2 de ce sous-type, voir `ui6e/formatComplexesAvances.ts`).
    return { famille: "B", sousType, p1: { a: 0, b: 0 }, p2: { a: 0, b: 0 }, c, cLatex: cValeur.latex, poleExclu: null, resultat: { nature: "demiDroite", angles } };
  }

  // cercleO
  const k = tirerEntier(2, 9);
  const rayonExact = racineRationnelleLatex(k, 1);
  return { famille: "B", sousType, p1: { a: 0, b: 0 }, p2: { a: 0, b: 0 }, k, poleExclu: null, resultat: { nature: "cercle", centre: { a: 0, b: 0 }, rayon: rayonExact.numerique, rayonLatex: rayonExact.latex } };
}

/** Sous-type "intersection" — TOUJOURS droite∩cercleO, construit EN ARRIÈRE depuis 2 points cibles
 * `q1`/`q2=-q1` (diamétralement opposés, garantit `|q1|=|q2|` par construction directe — voir
 * en-tête de fichier). */
export function construireFamilleBIntersection(): ExerciceComplexesBIntersection {
  const q1 = tirerPointNonNul(-4, 4);
  const q2: AffixeSimple = { a: -q1.a, b: -q1.b };
  const kCercleO = q1.a * q1.a + q1.b * q1.b;
  return { famille: "B", sousType: "intersection", q1, q2, kCercleO };
}

export type ExerciceFamilleB = ExerciceComplexesBSimple | ExerciceComplexesBIntersection;

const SOUS_TYPES_TOUS: (SousTypeLieuB | "intersection")[] = ["droite", "thales", "apollonius", "demiDroites", "cercleO", "intersection"];

export function construireFamilleB(): ExerciceFamilleB {
  const sousType = tirerParmi(SOUS_TYPES_TOUS);
  if (sousType === "intersection") return construireFamilleBIntersection();
  return construireFamilleBSimple(sousType);
}
