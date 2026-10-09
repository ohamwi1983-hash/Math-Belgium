import type { ExerciceTrianglesC, PointComplexe } from "../../core6e/trianglesComplexes.types";
import { pgcd, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Triangle équilatéral et point remarquable") de `6gen41`.
 *
 * ============================================================================
 * **Construction O,B,F — PREUVE algébrique que OBF est équilatéral (demandée explicitement par le
 * prompt de mission)**
 * ============================================================================
 * `O=0`, `B` un affixe quelconque de module `r`, `F=B·e^{iπ/3}` (rotation de 60° AUTOUR DE O) :
 * - `|OF| = |B|·|e^{iπ/3}| = |B|·1 = r = |OB|`.
 * - `|BF| = |F−B| = |B|·|e^{iπ/3}−1|`. Or `|e^{iθ}−1| = 2·sin(θ/2)` (identité standard — corde du
 *   cercle unité), donc `|e^{iπ/3}−1| = 2·sin(π/6) = 2×0.5 = 1` ⟹ `|BF| = r·1 = r`.
 * Donc `|OB|=|OF|=|BF|=r` EXACTEMENT, pour TOUT `B` — équilatéral garanti par construction, preuve
 * indépendante du choix de `B`. Vérifié aussi numériquement sur de nombreux tirages,
 * `familleC.test.ts`.
 *
 * ============================================================================
 * **`A` (centre) — formule fermée dérivée (voir `docs/historique-6e.md` pour le détail du calcul)**
 * ============================================================================
 * `A = (O+B+F)/3`. En écrivant `B=r·(cosβ,sinβ)` (β = 0/90/180/270°, seule rotation entière — voir
 * `construction.ts`, `rotation90`), un développement trigonométrique direct donne
 * `A = (r/√3)·(cos(β+30°), sin(β+30°))` — un point à `β+30°` (TOUJOURS un angle remarquable puisque
 * β est un multiple de 90°) et de module `r/√3`. Les 4 cas possibles (β=0/90/180/270°) sont donc
 * ÉNUMÉRÉS EXPLICITEMENT ci-dessous (`CAS_PAR_DIRECTION`) plutôt que recalculés par trigonométrie à
 * chaque appel — chaque composante finale est soit un ENTIER (r/2), soit un radical simple en √3
 * (r√3/2 ou r√3/6), jamais un mélange à 2 radicaux différents (`r` choisi multiple de 6 — voir plus
 * bas — pour que ces 2 dénominateurs restent toujours des entiers propres).
 *
 * ============================================================================
 * **Écran 2 — distance centre→sommet IRRATIONNELLE, exception délibérée documentée en tête de
 * `core6e/trianglesComplexes.types.ts`** : rayon circonscrit d'un équilatéral de côté `r` entier =
 * `r/√3 = r√3/3`, mathématiquement irrationnel — réutilise le pattern déjà établi par `6gen37`
 * (module tapé sous forme radicale via `moteur6e/equivalenceExponentielle.ts`, qui supporte
 * `sqrt(...)`), jamais un pattern nouveau.
 */

const RAYONS = [6, 12, 18] as const;

interface Composante {
  latex: string;
  numerique: number;
}

function entiere(num: number): Composante {
  if (num === 0) return { latex: "0", numerique: 0 };
  return { latex: `${num}`, numerique: num };
}

/** `(num/den)·√3`, fraction simplifiée — jamais mélangée à un autre radical (voir en-tête). */
function radicale3(num: number, den: number): Composante {
  if (num === 0) return { latex: "0", numerique: 0 };
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  const numerique = (n / d) * Math.sqrt(3);
  const signe = n < 0 ? "-" : "";
  const magnitude = Math.abs(n) === 1 ? "" : `${Math.abs(n)}`;
  const radical = `${magnitude}\\sqrt{3}`;
  return { latex: d === 1 ? `${signe}${radical}` : `\\frac{${signe}${radical}}{${d}}`, numerique };
}

function assemblerLatex(re: Composante, im: Composante): string {
  const reZero = re.numerique === 0;
  const imZero = im.numerique === 0;
  if (reZero && imZero) return "0";
  if (imZero) return re.latex;
  const imNeg = im.latex.startsWith("-");
  const imMag = imNeg ? im.latex.slice(1) : im.latex;
  const signe = imNeg ? "-" : "+";
  if (reZero) return `${imNeg ? "-" : ""}${imMag}i`;
  return `${re.latex}${signe}${imMag}i`;
}

export function construireFamilleC(): ExerciceTrianglesC {
  const r = tirerParmi(RAYONS);
  const k = tirerParmi([0, 1, 2, 3] as const);

  // β = k×90°. Formules fermées dérivées en en-tête de fichier, une par direction.
  let bRe: Composante, bIm: Composante, fRe: Composante, fIm: Composante, aRe: Composante, aIm: Composante;
  switch (k) {
    case 0:
      bRe = entiere(r);
      bIm = entiere(0);
      fRe = entiere(r / 2);
      fIm = radicale3(r, 2);
      aRe = entiere(r / 2);
      aIm = radicale3(r, 6);
      break;
    case 1:
      bRe = entiere(0);
      bIm = entiere(r);
      fRe = radicale3(-r, 2);
      fIm = entiere(r / 2);
      aRe = radicale3(-r, 6);
      aIm = entiere(r / 2);
      break;
    case 2:
      bRe = entiere(-r);
      bIm = entiere(0);
      fRe = entiere(-r / 2);
      fIm = radicale3(-r, 2);
      aRe = entiere(-r / 2);
      aIm = radicale3(-r, 6);
      break;
    default:
      bRe = entiere(0);
      bIm = entiere(-r);
      fRe = radicale3(r, 2);
      fIm = entiere(-r / 2);
      aRe = radicale3(r, 6);
      aIm = entiere(-r / 2);
      break;
  }

  const O: PointComplexe = { re: 0, im: 0, latex: "0" };
  const B: PointComplexe = { re: bRe.numerique, im: bIm.numerique, latex: assemblerLatex(bRe, bIm) };
  const F: PointComplexe = { re: fRe.numerique, im: fIm.numerique, latex: assemblerLatex(fRe, fIm) };
  const A: PointComplexe = { re: aRe.numerique, im: aIm.numerique, latex: assemblerLatex(aRe, aIm) };

  const distCentre = radicale3(r, 3); // r/√3 = (r/3)·√3.

  return {
    famille: "C",
    O,
    B,
    F,
    A,
    cote: r,
    distanceCentre: { numerique: distCentre.numerique, latex: distCentre.latex },
  };
}
