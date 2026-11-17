import type { ExercicePolygones, ExerciceSommets, PointEntier } from "../core6e/polygonesReguliers.types";
import { diagnostiquerAngle, ecartAngulaire } from "./equivalenceExponentielle";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import {
  aireExacte,
  centreEnO,
  coteExact,
  perimetreExact,
  piegesSommet,
  rayonCarre,
  sommeSansA,
  sommeSommets,
  sommetExact,
  sommetsAutres,
  valeurComplexe,
  valeurR,
  valeurRayon,
  vecteurCA,
} from "./modelePolygonesReguliers";
import { prevaliderSaisiesComplexes } from "./saisieComplexe";
import type { PhasePolygones } from "./typesPolygonesReguliers";

/**
 * Couche B (6e) — vérification de `6gen97` « Polygones réguliers et racines n-ièmes ». N'importe
 * rien de `generateurs6e/`. Valeurs saisies (`string[]`) :
 * - choix fermés (`formule`, `identite`, `conclusion`) : [identifiant de l'option] — « juste » est
 *   la bonne ;
 * - `donnees` : [a − c (forme a + bi), angle θ (radians, à 2kπ près)] ;
 * - `sommet1` : [Re z₁, Im z₁] ; `autresSommets` : [Re z₂, Im z₂(, Re z₃, Im z₃)] — nombres RÉELS
 *   exacts (√, fractions), évalués par `expressionExponentielle.ts` : une partie comme 1 + √3 ne
 *   s'écrit pas dans un champ « a + bi » à forme réduite (même choix que 6gen39) ;
 * - `rayon`, `cote`, `perimetre`, `aire` : [un réel exact] ;
 * - `somme`, `sansA` : [un complexe à coordonnées entières, forme a + bi].
 * Une saisie illisible, une valeur décimale approchée d'une valeur exacte, un angle en degrés, une
 * forme non réduite ne consomment jamais de tentative.
 */

export const ID_JUSTE = "juste";

const EPS = 1e-9;
const SEUIL_APPROCHE = 0.05;

const MESSAGE_ILLISIBLE_REEL =
  "Saisie non reconnue — écris par exemple 3, −1, √3/2, 1+√2 ou 3√3/4 (virgule décimale acceptée). Cette saisie ne compte pas comme une tentative.";
const MESSAGE_APPROCHE = "Donne la valeur exacte (avec √ ou une fraction si besoin), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ANGLE_DEGRES = "Donne l'angle en radians (avec π), pas en degrés. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ANGLE_APPROCHE = "Donne la valeur exacte de l'angle (avec π), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";

function lireReel(texte: string | undefined): number | null {
  const v = evaluerValeurExponentielle(texte ?? "");
  return v === null || !Number.isFinite(v) ? null : v;
}

function approche(v: number, cible: number): boolean {
  const d = Math.abs(v - cible);
  return d > EPS && d < SEUIL_APPROCHE;
}

function egal(v: number, cible: number): boolean {
  return Math.abs(v - cible) <= EPS;
}

/** Valeurs réelles attendues, champ par champ, des écrans à réels exacts. */
export function ciblesReelles(e: ExercicePolygones, phase: PhasePolygones): number[] | null {
  if (e.variante === "sommets" && (phase === "sommet1" || phase === "autresSommets")) {
    const ks = phase === "sommet1" ? [1] : sommetsAutres(e);
    return ks.flatMap((k) => {
      const z = valeurComplexe(sommetExact(e, k));
      return [z.re, z.im];
    });
  }
  if (e.variante === "mesures") {
    if (phase === "rayon") return [valeurRayon(e)];
    if (phase === "cote") return [valeurR(coteExact(e))];
    if (phase === "perimetre") return [valeurR(perimetreExact(e))];
    if (phase === "aire") return [valeurR(aireExacte(e))];
  }
  return null;
}

/** Complexe attendu des écrans `somme` et `sansA`. */
function cibleComplexe(e: ExercicePolygones, phase: PhasePolygones): PointEntier | null {
  if (e.variante !== "somme-nulle") return null;
  if (phase === "somme") return sommeSommets(e);
  if (phase === "sansA") return sommeSansA(e);
  return null;
}

function angleAttendu(e: ExercicePolygones): number {
  return (2 * Math.PI) / e.n;
}

/** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être vérifiée. */
export function messageSaisieNonDecomptee(e: ExercicePolygones, phase: PhasePolygones, valeurs: string[]): string | null {
  if (phase === "formule" || phase === "identite" || phase === "conclusion") return null;
  if (phase === "donnees") {
    const m = prevaliderSaisiesComplexes([valeurs[0] ?? ""]);
    if (m) return m;
    const theta = lireReel(valeurs[1]);
    if (theta === null) return MESSAGE_ILLISIBLE_REEL;
    const diag = diagnostiquerAngle(valeurs[1], angleAttendu(e), 1e-7);
    if (diag.degres) return MESSAGE_ANGLE_DEGRES;
    const ecart = Math.abs(ecartAngulaire(theta, angleAttendu(e)));
    if (ecart > 1e-7 && ecart < SEUIL_APPROCHE) return MESSAGE_ANGLE_APPROCHE;
    return null;
  }
  if (phase === "somme" || phase === "sansA") return prevaliderSaisiesComplexes([valeurs[0] ?? ""]);
  const cibles = ciblesReelles(e, phase) ?? [];
  const lus = cibles.map((_, i) => lireReel(valeurs[i]));
  if (lus.some((v) => v === null)) return MESSAGE_ILLISIBLE_REEL;
  if (lus.some((v, i) => approche(v as number, cibles[i]))) return MESSAGE_APPROCHE;
  return null;
}

export function verifierEcran(e: ExercicePolygones, phase: PhasePolygones, valeurs: string[]): boolean {
  return diagnosticEcran(e, phase, valeurs) === null;
}

/** Diagnostic d'un sommet saisi (k) : `null` si juste, sinon l'identifiant du piège reconnu. */
function diagnosticSommet(e: ExerciceSommets, k: number, re: number, im: number): string | null {
  const juste = valeurComplexe(sommetExact(e, k));
  if (egal(re, juste.re) && egal(im, juste.im)) return null;
  for (const p of piegesSommet(e, k)) {
    if (egal(re, p.re) && egal(im, p.im)) return p.id;
  }
  if (egal(re, juste.re)) return "imaginaire";
  if (egal(im, juste.im)) return "reelle";
  return "autre";
}

/**
 * Diagnostic d'une saisie lisible : `null` si elle est juste, sinon un identifiant de message
 * (traduit par `ui6e/formatPolygonesReguliers.ts::messageDiagnostic`) :
 * - choix fermé : l'identifiant de l'option choisie ;
 * - `donnees` : « ac:inverse », « ac:somme », « ac:a », « ac:autre », « angle:tour »,
 *   « angle:moitie », « angle:sens », « angle:autre » (premier champ faux) ;
 * - sommets : « Zk:piège » (premier sommet faux) ;
 * - mesures : « carre », « somme », « oubli2 », « angleDouble », « cercle », « demi », « r »,
 *   « sinPiSurN », « autre » ;
 * - `somme` / `sansA` : « zero », « c », « na », « oubliA », « nMoins1c », « plusA », « autre ».
 */
export function diagnosticEcran(e: ExercicePolygones, phase: PhasePolygones, valeurs: string[]): string | null {
  if (phase === "formule" || phase === "identite" || phase === "conclusion") {
    return valeurs[0] === ID_JUSTE ? null : (valeurs[0] ?? "autre");
  }
  if (phase === "donnees" && e.variante === "sommets") {
    const v = evaluerValeurComplexe(valeurs[0] ?? "");
    const ca = vecteurCA(e);
    const est = (p: { x: number; y: number }) => v !== null && egal(v.re, p.x) && egal(v.im, p.y);
    if (!est(ca)) {
      if (est({ x: -ca.x, y: -ca.y })) return "ac:inverse";
      if (!centreEnO(e) && est({ x: e.a.x + e.c.x, y: e.a.y + e.c.y })) return "ac:somme";
      if (!centreEnO(e) && est(e.a)) return "ac:a";
      return "ac:autre";
    }
    const theta = lireReel(valeurs[1]);
    if (theta === null) return "angle:autre";
    const cible = angleAttendu(e);
    if (Math.abs(ecartAngulaire(theta, cible)) <= 1e-7) return null;
    if (Math.abs(ecartAngulaire(theta, 0)) <= 1e-7) return "angle:tour";
    if (Math.abs(ecartAngulaire(theta, -cible)) <= 1e-7) return "angle:sens";
    if (Math.abs(ecartAngulaire(theta, cible / 2)) <= 1e-7) return "angle:moitie";
    return "angle:autre";
  }
  if (e.variante === "sommets" && (phase === "sommet1" || phase === "autresSommets")) {
    const ks = phase === "sommet1" ? [1] : sommetsAutres(e);
    for (let i = 0; i < ks.length; i++) {
      const re = lireReel(valeurs[2 * i]) ?? Number.NaN;
      const im = lireReel(valeurs[2 * i + 1]) ?? Number.NaN;
      const d = diagnosticSommet(e, ks[i], re, im);
      if (d !== null) return `Z${ks[i]}:${d}`;
    }
    return null;
  }
  if (e.variante === "mesures") {
    const v = lireReel(valeurs[0]);
    const cible = (ciblesReelles(e, phase) ?? [Number.NaN])[0];
    if (v === null) return "autre";
    if (egal(v, cible)) return null;
    const r = valeurRayon(e);
    const R = rayonCarre(e);
    const n = e.n;
    switch (phase) {
      case "rayon":
        if (egal(v, R)) return "carre";
        if (egal(v, Math.abs(e.a.x) + Math.abs(e.a.y))) return "somme";
        return "autre";
      case "cote":
        if (egal(v, r * Math.sin(Math.PI / n))) return "oubli2";
        if (egal(v, 2 * r * Math.sin((2 * Math.PI) / n))) return "angleDouble";
        if (egal(v, 2 * R * Math.sin(Math.PI / n))) return "r";
        return "autre";
      case "perimetre":
        if (egal(v, 2 * Math.PI * r)) return "cercle";
        return "autre";
      case "aire":
        if (egal(v, Math.PI * R)) return "cercle";
        if (egal(v, n * R * Math.sin((2 * Math.PI) / n))) return "demi";
        if (egal(v, (n / 2) * r * Math.sin((2 * Math.PI) / n))) return "r";
        if (egal(v, (n / 2) * R * Math.sin(Math.PI / n))) return "sinPiSurN";
        return "autre";
      default:
        return "autre";
    }
  }
  const cible = cibleComplexe(e, phase);
  if (cible && e.variante === "somme-nulle") {
    const v = evaluerValeurComplexe(valeurs[0] ?? "");
    const est = (p: { x: number; y: number }) => v !== null && egal(v.re, p.x) && egal(v.im, p.y);
    if (est(cible)) return null;
    const n = e.n;
    if (phase === "somme") {
      if (est({ x: 0, y: 0 })) return "zero";
      if (est(e.c)) return "c";
      if (est({ x: n * e.a.x, y: n * e.a.y })) return "na";
      return "autre";
    }
    if (est(sommeSommets(e))) return "oubliA";
    if (est({ x: (n - 1) * e.c.x, y: (n - 1) * e.c.y })) return "nMoins1c";
    if (est({ x: n * e.c.x + e.a.x, y: n * e.c.y + e.a.y })) return "plusA";
    return "autre";
  }
  return "autre";
}
