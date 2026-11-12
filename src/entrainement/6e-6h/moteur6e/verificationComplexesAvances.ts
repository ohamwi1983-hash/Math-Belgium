import type { AffixeSimple, ExerciceComplexesA, ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesBIntersection, ExerciceComplexesBSimple, ExerciceComplexesC, ExerciceComplexesD, ExerciceComplexesDCoef, ExerciceComplexesDModules, ExerciceComplexesDRatio, ExerciceComplexesDReelles, ExerciceComplexesE, NatureLieu } from "../core6e/complexesAvances.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerAngle, diagnostiquerEnsembleValeurs, diagnostiquerValeur, evaluerExpressionExponentielle, separerEquationTexte } from "./equivalenceExponentielle";
import { diagnostiquerComplexe } from "./verificationComplexes";
import type { Complexe } from "./verificationComplexes";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurComplexeAvecVariable } from "./expressionComplexeAvecVariable";
import type { PhaseComplexesAvances } from "./typesComplexesAvances";

/**
 * Couche B (6e) — vérification propre à `6gen42` (dispatch par famille/écran). N'importe JAMAIS rien
 * de `src/generateurs6e/` (règle non négociable, CLAUDE.md).
 *
 * Refonte de l'audit 6e ch. 5 (lot E) :
 * - **Équations en 2 variables** (familles B et D) : acceptées à tout multiple non nul près
 *   (gauche−droite = λ·référence, λ constant sur tous les points de test) — membres inversés,
 *   « y = mx + p », équation simplifiée par un facteur (D_coef : par q). À défaut, comparaison des
 *   ENSEMBLES DE SOLUTIONS (formes avec racines, ex. √(x²+y²) = √k ou |z−p₁| = k|z−p₂| écrit avec
 *   des racines) : la saisie doit s'annuler sur des points du lieu et garder un rapport de signe
 *   constant avec la référence hors du lieu (un facteur parasite qui s'annule — équation élevée au
 *   carré qui ajoute des demi-droites — change ce signe et est refusé).
 * - **Droite (écran « lieu »)** : tout couple de points DISTINCTS de la droite est accepté.
 * - **Angles** : comparés à 2π près (`diagnostiquerAngle`), y compris le −0 de `Math.atan2`.
 * - **Famille C** : les écrans 1 et 2 vérifient deux développements DIFFÉRENTS (sans remplacer zz̄
 *   par 1), échantillonnés hors du cercle unité ; l'écran 3 a un verdict qui dépend de l'exercice
 *   (vraie transformation ou contre-exemple).
 * - **Affixes** : `evaluerValeurComplexe` (√ accepté, « − » typographique, virgule décimale).
 */

const TOLERANCE = 0.01;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerQcm(valeurs: string[], attendu = "correct"): StatutVerification {
  return valeurs[0] === attendu ? "correct" : "not_equivalent";
}

/** α/β tapés en lettres grecques → identifiants ASCII du parseur. */
function normaliserEquation(texte: string): string {
  return texte.replace(/α/g, " alpha ").replace(/β/g, " beta ");
}

// ============================================================================
// Équations en 2 variables : multiple non nul, puis ensemble de solutions.
// ============================================================================

interface Point2 {
  u: number;
  v: number;
}

type ResultatEvaluation = { ok: true; valeurs: number[] } | { ok: false; statut: StatutVerification };

/** Évalue gauche−droite de l'équation saisie aux points donnés. `parse_error` si la saisie n'est
 * pas une égalité lisible ; une inégalité est une réponse fausse. */
function evaluerDifference(texte: string, nomU: string, nomV: string, points: Point2[]): ResultatEvaluation {
  const separe = separerEquationTexte(normaliserEquation(texte));
  if (separe === null) return { ok: false, statut: "parse_error" };
  if (separe.gauche.trim() === "" || separe.droite.trim() === "") return { ok: false, statut: "parse_error" };
  const valeurs: number[] = [];
  for (const p of points) {
    try {
      const g = evaluerExpressionExponentielle(separe.gauche, { [nomU]: p.u, [nomV]: p.v });
      const d = evaluerExpressionExponentielle(separe.droite, { [nomU]: p.u, [nomV]: p.v });
      valeurs.push(g - d);
    } catch {
      return { ok: false, statut: "parse_error" };
    }
  }
  if (separe.symbole !== "=") return { ok: false, statut: "not_equivalent" };
  return { ok: true, valeurs };
}

/** gauche−droite = λ·référence pour un même λ≠0 (moindres carrés, tolérance mise à l'échelle). */
function estMultipleNonNul(diffs: number[], refs: number[], tolerance: number = TOLERANCE): boolean {
  if (diffs.some((d) => !Number.isFinite(d))) return false;
  let produit = 0;
  let carre = 0;
  for (let i = 0; i < refs.length; i++) {
    produit += diffs[i] * refs[i];
    carre += refs[i] * refs[i];
  }
  if (carre === 0) return false;
  const lambda = produit / carre;
  if (Math.abs(lambda) < 1e-6) return false;
  const tol = tolerance * Math.max(1, Math.abs(lambda));
  return diffs.every((d, i) => Math.abs(d - lambda * refs[i]) <= tol);
}

function grille(us: number[], vs: number[]): Point2[] {
  return us.flatMap((u) => vs.map((v) => ({ u, v })));
}

/** Équation en (u,v) acceptée à tout multiple non nul près (familles D : (x,m), (α,β)). */
function diagnostiquerEquationProportionnelle2Var(texte: string, nomU: string, nomV: string, reference: (u: number, v: number) => number, us: number[], vs: number[]): StatutVerification {
  const points = grille(us, vs);
  const r = evaluerDifference(texte, nomU, nomV, points);
  if (!r.ok) return r.statut;
  const refs = points.map((p) => reference(p.u, p.v));
  return estMultipleNonNul(r.valeurs, refs) ? "correct" : "not_equivalent";
}

/** Géométrie d'un lieu du plan, pour l'échantillonnage « sur le lieu / hors du lieu ». */
export type GeometrieLieu = { type: "droite"; x0: number; y0: number; dx: number; dy: number } | { type: "cercle"; cx: number; cy: number; r: number } | { type: "rayons"; x0: number; y0: number; angles: number[] };

function distanceAuLieu(g: GeometrieLieu, x: number, y: number): number {
  if (g.type === "droite") {
    const n = Math.hypot(g.dx, g.dy);
    return Math.abs((x - g.x0) * g.dy - (y - g.y0) * g.dx) / n;
  }
  if (g.type === "cercle") return Math.abs(Math.hypot(x - g.cx, y - g.cy) - g.r);
  let d = Infinity;
  for (const a of g.angles) {
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const t = (x - g.x0) * ux + (y - g.y0) * uy;
    d = Math.min(d, t <= 0 ? Math.hypot(x - g.x0, y - g.y0) : Math.abs((x - g.x0) * uy - (y - g.y0) * ux));
  }
  return d;
}

function pointsSurLieu(g: GeometrieLieu): Point2[] {
  if (g.type === "droite") {
    const n = Math.hypot(g.dx, g.dy);
    return [-2.1, -0.7, 0.9, 2.6].map((t) => ({ u: g.x0 + (t * g.dx) / n, v: g.y0 + (t * g.dy) / n }));
  }
  if (g.type === "cercle") return [0.3, 1.9, 3.4, 5.1].map((phi) => ({ u: g.cx + g.r * Math.cos(phi), v: g.cy + g.r * Math.sin(phi) }));
  return g.angles.flatMap((a) => [0.6, 1.7, 3.2].map((t) => ({ u: g.x0 + t * Math.cos(a), v: g.y0 + t * Math.sin(a) })));
}

const GRILLE_X = [-4.3, -2.6, -1.1, 0.4, 1.8, 3.3, 4.6];
const GRILLE_Y = [-3.9, -2.2, -0.8, 0.7, 2.4, 3.8];

/** Hors du lieu : une grille, plus — pour des demi-droites — des points des demi-droites « pièges »
 * (opposées, symétriques) où s'annule une équation élevée au carré (ex. 4x² = 4(x²+y²), soit y = 0,
 * pour la seule demi-droite θ = 0). */
function pointsHorsLieu(g: GeometrieLieu): Point2[] {
  const pieges: Point2[] =
    g.type === "rayons"
      ? g.angles.flatMap((a) => [a + Math.PI, -a, Math.PI - a].flatMap((b) => [0.8, 2.3].map((t) => ({ u: g.x0 + t * Math.cos(b), v: g.y0 + t * Math.sin(b) }))))
      : [];
  return [...grille(GRILLE_X, GRILLE_Y), ...pieges].filter((p) => distanceAuLieu(g, p.u, p.v) > 0.25);
}

function mediane(valeurs: number[]): number {
  const tri = [...valeurs].sort((a, b) => a - b);
  return tri[Math.floor(tri.length / 2)] ?? 0;
}

/**
 * Équation en (x,y) d'un lieu : correcte si gauche−droite est un multiple non nul de la référence,
 * OU si elle a le même ensemble de solutions (s'annule sur le lieu, et garde hors du lieu un rapport
 * de signe constant avec la référence). Exporté pour les scripts de vérification.
 */
export function diagnostiquerEquationLieu(texte: string, reference: (x: number, y: number) => number, geometrie: GeometrieLieu): StatutVerification {
  const sur = pointsSurLieu(geometrie);
  const hors = pointsHorsLieu(geometrie);
  const tous = [...hors, ...sur];
  const r = evaluerDifference(texte, "x", "y", tous);
  if (!r.ok) return r.statut;
  const refs = tous.map((p) => reference(p.u, p.v));
  if (estMultipleNonNul(r.valeurs, refs)) return "correct";

  const fHors = r.valeurs.slice(0, hors.length);
  const fSur = r.valeurs.slice(hors.length);
  if (fHors.some((f) => !Number.isFinite(f)) || fSur.some((f) => !Number.isFinite(f))) return "not_equivalent";
  const rapports = fHors.map((f, i) => f / refs[i]);
  if (rapports.some((q) => !Number.isFinite(q) || Math.abs(q) < 1e-6)) return "not_equivalent";
  const signe = Math.sign(rapports[0]);
  if (rapports.some((q) => Math.sign(q) !== signe)) return "not_equivalent";
  const echelle = mediane(fHors.map((f) => Math.abs(f)));
  const tolSur = Math.max(TOLERANCE, TOLERANCE * echelle);
  return fSur.every((f) => Math.abs(f) <= tolSur) ? "correct" : "not_equivalent";
}

// ============================================================================
// Affixes.
// ============================================================================

function lireComplexe(texte: string): Complexe | null {
  if (texte.trim() === "") return null;
  return evaluerValeurComplexe(texte);
}

/** Ensemble de N affixes, ordre indifférent, compte exact. */
function diagnostiquerEnsembleComplexes(textes: string[], cibles: Complexe[], tolerance = 1e-6): StatutVerification {
  const valeurs: Complexe[] = [];
  for (const t of textes) {
    const v = lireComplexe(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  if (valeurs.length !== cibles.length) return "not_equivalent";
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

/** Deux points DISTINCTS quelconques de la droite (p1, p2) — décision D de l'audit. */
function diagnostiquerDeuxPointsDeLaDroite(textes: string[], p1: AffixeSimple, p2: AffixeSimple): StatutVerification {
  const m1 = lireComplexe(textes[0] ?? "");
  const m2 = lireComplexe(textes[1] ?? "");
  if (m1 === null || m2 === null) return "parse_error";
  const dx = p2.a - p1.a;
  const dy = p2.b - p1.b;
  const n = Math.hypot(dx, dy);
  const surDroite = (m: Complexe) => Math.abs((m.re - p1.a) * dy - (m.im - p1.b) * dx) / n <= 1e-6;
  const distincts = Math.hypot(m1.re - m2.re, m1.im - m2.im) > 1e-6;
  return surDroite(m1) && surDroite(m2) && distincts ? "correct" : "not_equivalent";
}

/** Ensemble d'angles (radians) comparés à 2π près, ordre indifférent, compte exact. */
function diagnostiquerEnsembleAngles(textes: string[], cibles: number[]): StatutVerification {
  for (const t of textes) if (diagnostiquerAngle(t, 0).statut === "parse_error") return "parse_error";
  if (textes.length !== cibles.length) return "not_equivalent";
  const restantes = [...cibles];
  for (const t of textes) {
    const index = restantes.findIndex((c) => diagnostiquerAngle(t, c).statut === "correct");
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

// ============================================================================
// Famille A — QCM.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}
export function diagnostiquerAEcran2(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}
export function diagnostiquerAEcran3(exercice: ExerciceComplexesA, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerQcm(valeurs);
}

// ============================================================================
// Famille B — sous-types simples.
// ============================================================================

/** Référence (gauche−droite) et géométrie du lieu « équation » de l'écran 1. Pour `argument`/
 * `argumentPi`, l'écran 1 demande l'équation « Im((z−a)e^{−iθ}) = 0 » : la droite support. */
export function referenceEquationB(exercice: ExerciceComplexesBSimple): { reference: (x: number, y: number) => number; geometrie: GeometrieLieu } {
  const { p1, p2 } = exercice;
  switch (exercice.sousType) {
    case "droite":
      return { reference: (x, y) => -(x - p1.a) * (y - p2.b) + (y - p1.b) * (x - p2.a), geometrie: { type: "droite", x0: p1.a, y0: p1.b, dx: p2.a - p1.a, dy: p2.b - p1.b } };
    case "thales": {
      const cx = (p1.a + p2.a) / 2;
      const cy = (p1.b + p2.b) / 2;
      return { reference: (x, y) => (x - p1.a) * (x - p2.a) + (y - p1.b) * (y - p2.b), geometrie: { type: "cercle", cx, cy, r: Math.hypot(p1.a - p2.a, p1.b - p2.b) / 2 } };
    }
    case "apollonius": {
      const k = exercice.k as number;
      const d = 1 - k * k;
      const cx = (p1.a - k * k * p2.a) / d;
      const cy = (p1.b - k * k * p2.b) / d;
      const r = (k * Math.hypot(p1.a - p2.a, p1.b - p2.b)) / Math.abs(d);
      return { reference: (x, y) => (x - p1.a) ** 2 + (y - p1.b) ** 2 - k * k * ((x - p2.a) ** 2 + (y - p2.b) ** 2), geometrie: { type: "cercle", cx, cy, r } };
    }
    case "demiDroites": {
      // (z−a)+conj(z−a) = c|z−a| ⟺ 2X = cR ; (z−a)−conj(z−a) = c·i·|z−a| ⟺ 2Y = cR (X = x−a₁…).
      const c = exercice.c as number;
      const resultat = exercice.resultat;
      const angles = resultat.nature === "demiDroite" ? resultat.angles.map((a) => a.numerique) : [];
      const imaginaire = exercice.forme === "imaginaire";
      return {
        reference: (x, y) => {
          const X = x - p1.a;
          const Y = y - p1.b;
          return 2 * (imaginaire ? Y : X) - c * Math.sqrt(X * X + Y * Y);
        },
        geometrie: { type: "rayons", x0: p1.a, y0: p1.b, angles },
      };
    }
    case "cercleO": {
      const k = exercice.k as number;
      return { reference: (x, y) => x * x + y * y - k, geometrie: { type: "cercle", cx: 0, cy: 0, r: Math.sqrt(k) } };
    }
    case "cercleA": {
      const k = exercice.k as number;
      return { reference: (x, y) => (x - p1.a) ** 2 + (y - p1.b) ** 2 - k * k, geometrie: { type: "cercle", cx: p1.a, cy: p1.b, r: k } };
    }
    case "argument":
    case "argumentPi": {
      const t = (exercice.theta as { numerique: number }).numerique;
      const c = Math.cos(t);
      const s = Math.sin(t);
      return { reference: (x, y) => (y - p1.b) * c - (x - p1.a) * s, geometrie: { type: "droite", x0: p1.a, y0: p1.b, dx: c, dy: s } };
    }
  }
}

export function diagnostiquerBEcran1(exercice: ExerciceComplexesBSimple, valeurs: string[]): StatutVerification {
  const { reference, geometrie } = referenceEquationB(exercice);
  return diagnostiquerEquationLieu(valeurs[0] ?? "", reference, geometrie);
}

/** Paramètres parsables dans la forme de la nature CHOISIE (pas forcément la bonne) — distingue un
 * `parse_error` d'un mauvais choix de nature. demiDroite : [origine, ...angles]. */
function parametresParsablesPourNature(nature: NatureLieu, params: string[]): boolean {
  if (nature === "droite") return lireComplexe(params[0] ?? "") !== null && lireComplexe(params[1] ?? "") !== null;
  if (nature === "cercle") return lireComplexe(params[0] ?? "") !== null && diagnostiquerValeur(params[1] ?? "", 0) !== "parse_error";
  if (nature === "demiDroite") return lireComplexe(params[0] ?? "") !== null && params.length > 1 && params.slice(1).every((p) => diagnostiquerAngle(p, 0).statut !== "parse_error");
  return false;
}

export function diagnostiquerBEcran2(exercice: ExerciceComplexesBSimple, valeurs: string[]): StatutVerification {
  const nature = valeurs[0] as NatureLieu;
  const poleAttendu = exercice.poleExclu;
  const params = poleAttendu !== null ? valeurs.slice(1, -1) : valeurs.slice(1);
  const poleTexte = poleAttendu !== null ? (valeurs[valeurs.length - 1] ?? "") : null;

  const statutParseParams: StatutVerification = parametresParsablesPourNature(nature, params) ? "correct" : "parse_error";
  const statutPole = poleAttendu !== null ? diagnostiquerComplexe(poleTexte ?? "", { re: poleAttendu.a, im: poleAttendu.b }) : "correct";

  if (statutParseParams === "parse_error" || statutPole === "parse_error") return "parse_error";
  const resultat = exercice.resultat;
  if (nature !== resultat.nature) return "not_equivalent";

  if (resultat.nature === "droite") return combinerStatuts(diagnostiquerDeuxPointsDeLaDroite(params, resultat.point1, resultat.point2), statutPole);
  if (resultat.nature === "cercle") {
    const statutCentre = diagnostiquerComplexe(params[0] ?? "", { re: resultat.centre.a, im: resultat.centre.b }, 1e-6);
    const statutRayon = diagnostiquerValeur(params[1] ?? "", resultat.rayon);
    return combinerStatuts(statutCentre, statutRayon, statutPole);
  }
  const statutOrigine = diagnostiquerComplexe(params[0] ?? "", { re: resultat.origine.a, im: resultat.origine.b }, 1e-6);
  const statutAngles = diagnostiquerEnsembleAngles(params.slice(1), resultat.angles.map((a) => a.numerique));
  return combinerStatuts(statutOrigine, statutAngles, statutPole);
}

// ============================================================================
// Famille B — sous-type "intersection".
// ============================================================================

export function referencesIntersection(exercice: ExerciceComplexesBIntersection): { droite: (x: number, y: number) => number; cercle: (x: number, y: number) => number; geometrieDroite: GeometrieLieu; geometrieCercle: GeometrieLieu } {
  const { q1, q2, kCercleO } = exercice;
  return {
    droite: (x, y) => -(x - q1.a) * (y - q2.b) + (y - q1.b) * (x - q2.a),
    cercle: (x, y) => x * x + y * y - kCercleO,
    geometrieDroite: { type: "droite", x0: q1.a, y0: q1.b, dx: q2.a - q1.a, dy: q2.b - q1.b },
    geometrieCercle: { type: "cercle", cx: 0, cy: 0, r: Math.sqrt(kCercleO) },
  };
}

export function diagnostiquerBInterEcran1(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const ref = referencesIntersection(exercice);
  return combinerStatuts(diagnostiquerEquationLieu(valeurs[0] ?? "", ref.droite, ref.geometrieDroite), diagnostiquerEquationLieu(valeurs[1] ?? "", ref.cercle, ref.geometrieCercle));
}

export function diagnostiquerBInterEcran2(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const statutPoints = diagnostiquerDeuxPointsDeLaDroite(valeurs.slice(0, 2), exercice.q1, exercice.q2);
  const statutCentre = diagnostiquerComplexe(valeurs[2] ?? "", { re: 0, im: 0 }, 1e-6);
  const statutRayon = diagnostiquerValeur(valeurs[3] ?? "", Math.sqrt(exercice.kCercleO));
  return combinerStatuts(statutPoints, statutCentre, statutRayon);
}

export function diagnostiquerBInterEcran3(exercice: ExerciceComplexesBIntersection, valeurs: string[]): StatutVerification {
  const cibles: Complexe[] = [
    { re: exercice.q1.a, im: exercice.q1.b },
    { re: exercice.q2.a, im: exercice.q2.b },
  ];
  return diagnostiquerEnsembleComplexes(valeurs, cibles);
}

export function diagnostiquerEcranB(exercice: ExerciceComplexesB, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "intersection") {
    if (phase === "bInterEcran1") return diagnostiquerBInterEcran1(exercice, valeurs);
    if (phase === "bInterEcran2") return diagnostiquerBInterEcran2(exercice, valeurs);
    return diagnostiquerBInterEcran3(exercice, valeurs);
  }
  if (phase === "bEcran1") return diagnostiquerBEcran1(exercice, valeurs);
  return diagnostiquerBEcran2(exercice, valeurs);
}

// ============================================================================
// Famille C — développements en z et z̄ (noté zb), échantillonnés HORS du cercle unité.
// ============================================================================

/** z̄ (z + macron combinant) → zb ; « zzb », « zbz » → produits explicites ; signes typographiques. */
function normaliserSaisieC(texte: string): string {
  return texte
    .replace(/z̄/g, " zb ")
    .replace(/z̄/g, " zb ")
    .replace(/[−–]/g, "-")
    .replace(/[·∙×]/g, "*")
    .replace(/²/g, "^2")
    .replace(/[a-zA-Z]+/g, (mot) => {
      if (!/^(zb|z)+$/.test(mot) || mot === "z" || mot === "zb") return mot;
      const parties: string[] = [];
      let reste = mot;
      while (reste.length > 0) {
        if (reste.startsWith("zb")) {
          parties.push("zb");
          reste = reste.slice(2);
        } else {
          parties.push("z");
          reste = reste.slice(1);
        }
      }
      return parties.join("*");
    });
}

const ECHANTILLONS_C: { r: number; phi: number }[] = [
  { r: 1, phi: 0.4 },
  { r: 0.6, phi: 1.1 },
  { r: 1.7, phi: 1.9 },
  { r: 1, phi: 2.6 },
  { r: 0.8, phi: -0.7 },
  { r: 1.4, phi: -1.6 },
  { r: 2.1, phi: -2.4 },
  { r: 0.5, phi: 3.0 },
];

function mul(a: Complexe, b: Complexe): Complexe {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}

/** Référence complexe de l'écran C1 (|z−p|² développé, zz̄ NON remplacé) ou C2 (|1−p̄z|² ou, pour
 * le contre-exemple, |1−pz|²). Exportée pour les scripts de vérification. */
export function referenceC(exercice: ExerciceComplexesC, phase: "cEcran1" | "cEcran2", z: Complexe, zb: Complexe): Complexe {
  const p: Complexe = { re: exercice.a, im: exercice.b };
  const pb: Complexe = { re: exercice.a, im: -exercice.b };
  const p2 = exercice.a * exercice.a + exercice.b * exercice.b;
  const zzb = mul(z, zb);
  if (phase === "cEcran1") {
    const t1 = mul(pb, z);
    const t2 = mul(p, zb);
    return { re: zzb.re - t1.re - t2.re + p2, im: zzb.im - t1.im - t2.im };
  }
  const t1 = exercice.conjugue ? mul(pb, z) : mul(p, z);
  const t2 = exercice.conjugue ? mul(p, zb) : mul(pb, zb);
  return { re: 1 - t1.re - t2.re + p2 * zzb.re, im: -t1.im - t2.im + p2 * zzb.im };
}

function diagnostiquerDeveloppementC(exercice: ExerciceComplexesC, phase: "cEcran1" | "cEcran2", texte: string): StatutVerification {
  const t = normaliserSaisieC(texte);
  for (const { r, phi } of ECHANTILLONS_C) {
    const z: Complexe = { re: r * Math.cos(phi), im: r * Math.sin(phi) };
    const zb: Complexe = { re: z.re, im: -z.im };
    const soumis = evaluerValeurComplexeAvecVariable(t, { z, zb });
    if (soumis === null) return "parse_error";
    if (!Number.isFinite(soumis.re) || !Number.isFinite(soumis.im)) return "not_equivalent";
    const attendu = referenceC(exercice, phase, z, zb);
    if (Math.abs(soumis.re - attendu.re) > TOLERANCE || Math.abs(soumis.im - attendu.im) > TOLERANCE) return "not_equivalent";
  }
  return "correct";
}

export function diagnostiquerCEcran1(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  return diagnostiquerDeveloppementC(exercice, "cEcran1", valeurs[0] ?? "");
}
export function diagnostiquerCEcran2(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  return diagnostiquerDeveloppementC(exercice, "cEcran2", valeurs[0] ?? "");
}
/** Écran 3 : id de l'option attendue selon l'exercice (`egaux` pour la vraie transformation,
 * `differents` pour le contre-exemple). */
export function idConclusionC(exercice: ExerciceComplexesC): string {
  return exercice.conjugue ? "egaux" : "differents";
}
export function diagnostiquerCEcran3(exercice: ExerciceComplexesC, valeurs: string[]): StatutVerification {
  return diagnostiquerQcm(valeurs, idConclusionC(exercice));
}

// ============================================================================
// Famille D — "ratio racine n-ième".
// ============================================================================

export function diagnostiquerDRatioEcran1(exercice: ExerciceComplexesDRatio, valeurs: string[]): StatutVerification {
  const { n, m } = exercice;
  const cibles: Complexe[] = [];
  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n;
    cibles.push({ re: m * Math.cos(angle), im: m * Math.sin(angle) });
  }
  return diagnostiquerEnsembleComplexes(valeurs, cibles, 1e-6);
}
export function diagnostiquerDRatioEcran2(exercice: ExerciceComplexesDRatio, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", exercice.c / (exercice.m - 1));
}

// ============================================================================
// Famille D — "solutions réelles imposées".
// ============================================================================

const POINTS_X = [-2.3, -0.6, 0.9, 1.7];
const POINTS_M = [1.3, -0.8, 2.6, -1.4, 0.4];

export function diagnostiquerDReellesEcran1(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  const A = exercice.x1 + exercice.x2;
  const P = exercice.x1 * exercice.x2;
  const statutReel = diagnostiquerEquationProportionnelle2Var(valeurs[0] ?? "", "x", "m", (x) => x * x - A * x + P, POINTS_X, POINTS_M);
  const statutImag = diagnostiquerEquationProportionnelle2Var(valeurs[1] ?? "", "x", "m", (x, m) => (exercice.m0 - m) * (x - exercice.k), POINTS_X, POINTS_M);
  return combinerStatuts(statutReel, statutImag);
}
export function diagnostiquerDReellesEcran2(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", exercice.m0);
}
export function diagnostiquerDReellesEcran3(exercice: ExerciceComplexesDReelles, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, [exercice.x1, exercice.x2]);
}

// ============================================================================
// Famille D — "coefficients depuis une racine donnée".
// ============================================================================

const POINTS_ALPHA = [-2.2, -0.5, 1.1, 2.7];
const POINTS_BETA = [1.6, -1.3, 0.4, -2.5];

export function diagnostiquerDCoefEcran1(exercice: ExerciceComplexesDCoef, valeurs: string[]): StatutVerification {
  const { p, q } = exercice;
  const statutReel = diagnostiquerEquationProportionnelle2Var(valeurs[0] ?? "", "alpha", "beta", (alpha, beta) => p * alpha + beta + (p * p - q * q), POINTS_ALPHA, POINTS_BETA);
  // Multiple non nul : « qα + 2pq = 0 » aussi bien que sa forme simplifiée par q, « α + 2p = 0 ».
  const statutImag = diagnostiquerEquationProportionnelle2Var(valeurs[1] ?? "", "alpha", "beta", (alpha) => q * alpha + 2 * p * q, POINTS_ALPHA, POINTS_BETA);
  return combinerStatuts(statutReel, statutImag);
}
export function diagnostiquerDCoefEcran2(exercice: ExerciceComplexesDCoef, valeurs: string[]): StatutVerification {
  const alpha = -2 * exercice.p;
  const beta = exercice.p * exercice.p + exercice.q * exercice.q;
  return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", alpha), diagnostiquerValeur(valeurs[1] ?? "", beta));
}

// ============================================================================
// Famille D — "modules simultanés".
// ============================================================================

/** |z| = 1 et |z| = |z−d| : d = 2p/r → (p ± qi)/r ; d = 2qi/r → (±p + qi)/r. */
export function solutionsDModules(exercice: ExerciceComplexesDModules): Complexe[] {
  const { p, q, r } = exercice;
  return exercice.dImaginaire
    ? [
        { re: p / r, im: q / r },
        { re: -p / r, im: q / r },
      ]
    : [
        { re: p / r, im: q / r },
        { re: p / r, im: -q / r },
      ];
}

export function diagnostiquerDModulesEcran1(exercice: ExerciceComplexesDModules, valeurs: string[]): StatutVerification {
  void exercice;
  return diagnostiquerValeur(valeurs[0] ?? "", 1);
}
export function diagnostiquerDModulesEcran2(exercice: ExerciceComplexesDModules, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleComplexes(valeurs, solutionsDModules(exercice));
}

export function diagnostiquerEcranD(exercice: ExerciceComplexesD, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  switch (exercice.sousType) {
    case "ratio":
      return phase === "dRatioEcran1" ? diagnostiquerDRatioEcran1(exercice, valeurs) : diagnostiquerDRatioEcran2(exercice, valeurs);
    case "reelles":
      if (phase === "dReellesEcran1") return diagnostiquerDReellesEcran1(exercice, valeurs);
      if (phase === "dReellesEcran2") return diagnostiquerDReellesEcran2(exercice, valeurs);
      return diagnostiquerDReellesEcran3(exercice, valeurs);
    case "coef":
      return phase === "dCoefEcran1" ? diagnostiquerDCoefEcran1(exercice, valeurs) : diagnostiquerDCoefEcran2(exercice, valeurs);
    case "modules":
      return phase === "dModulesEcran1" ? diagnostiquerDModulesEcran1(exercice, valeurs) : diagnostiquerDModulesEcran2(exercice, valeurs);
  }
}

// ============================================================================
// Famille E.
// ============================================================================

/** Rapport (z_D−z_C)/(z_B−z_A) — le « −0 » de la partie imaginaire est ramené à 0 (sinon
 * `Math.atan2` renvoie −π pour un rapport réel négatif). */
export function ratioE(exercice: ExerciceComplexesE): Complexe {
  const num: AffixeSimple = { a: exercice.zD.a - exercice.zC.a, b: exercice.zD.b - exercice.zC.b };
  const den: AffixeSimple = { a: exercice.zB.a - exercice.zA.a, b: exercice.zB.b - exercice.zA.b };
  const norme = den.a * den.a + den.b * den.b;
  const re = (num.a * den.a + num.b * den.b) / norme;
  const im = (num.b * den.a - num.a * den.b) / norme;
  return { re: re === 0 ? 0 : re, im: im === 0 ? 0 : im };
}

export function diagnostiquerEEcran1(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  return diagnostiquerComplexe(valeurs[0] ?? "", ratioE(exercice), 1e-6);
}
export function diagnostiquerEEcran2(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  const ratio = ratioE(exercice);
  return diagnostiquerAngle(valeurs[0] ?? "", Math.atan2(ratio.im, ratio.re)).statut;
}
export function diagnostiquerEEcran3(exercice: ExerciceComplexesE, valeurs: string[]): StatutVerification {
  return valeurs[0] === exercice.statut ? "correct" : "not_equivalent";
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances, valeurs: string[]): StatutVerification {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return diagnostiquerAEcran1(exercice, valeurs);
      if (phase === "aEcran2") return diagnostiquerAEcran2(exercice, valeurs);
      return diagnostiquerAEcran3(exercice, valeurs);
    case "B":
      return diagnostiquerEcranB(exercice, phase, valeurs);
    case "C":
      if (phase === "cEcran1") return diagnostiquerCEcran1(exercice, valeurs);
      if (phase === "cEcran2") return diagnostiquerCEcran2(exercice, valeurs);
      return diagnostiquerCEcran3(exercice, valeurs);
    case "D":
      return diagnostiquerEcranD(exercice, phase, valeurs);
    case "E":
      if (phase === "eEcran1") return diagnostiquerEEcran1(exercice, valeurs);
      if (phase === "eEcran2") return diagnostiquerEEcran2(exercice, valeurs);
      return diagnostiquerEEcran3(exercice, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
