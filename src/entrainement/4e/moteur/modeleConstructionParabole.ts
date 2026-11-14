/**
 * Couche B — modèle de `gen53` : écrans, tracés de l'élève, ce qui est déjà construit et
 * vérification de chaque écran. Chaque écran vérifie des GESTES (où le compas est piqué, avec quelle
 * ouverture, jusqu'où l'équerre a glissé), jamais un nombre lu sur une grille.
 *
 * Méthode du cercle (8 écrans) : axe, sommet, report de l'ouverture depuis K, parallèle à
 * l'équerre, cercle de centre F, deux couples « en enchaînement », tracé.
 * Méthode de la médiatrice (7 écrans) : axe, sommet, perpendiculaire en H₁, médiatrice de [FH₁],
 * deux points « en enchaînement » (H₂, H₃), tracé.
 *
 * Après chaque écran clos, la suite repart des valeurs CORRECTES (ouverture de repli si l'élève a
 * épuisé ses tentatives) : une erreur ne se propage jamais à l'écran suivant.
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import {
  ECART_OUVERTURES,
  MARGE_COUPE,
  OUVERTURE_MAX,
  PIED_K,
  TOLERANCE_OUVERTURE,
  TOLERANCE_POSITION,
  distance,
  foyer,
  pointDeH,
  pointH,
  pointsOuverture,
  sommet,
  type NomPoint,
} from "./geometrieConstructionParabole";

export type EcranConstructionParabole =
  | { type: "axe" }
  | { type: "sommet" }
  | { type: "report" }
  | { type: "parallele" }
  | { type: "cercleF" }
  | { type: "coupleRapide"; numero: 2 | 3 }
  | { type: "perpendiculaireH" }
  | { type: "mediatriceH" }
  | { type: "pointRapide"; indice: 1 | 2 }
  | { type: "trace" };

export function ecransConstructionParabole(e: ExerciceConstructionParabole): EcranConstructionParabole[] {
  if (e.methode === "cercle") {
    return [
      { type: "axe" },
      { type: "sommet" },
      { type: "report" },
      { type: "parallele" },
      { type: "cercleF" },
      { type: "coupleRapide", numero: 2 },
      { type: "coupleRapide", numero: 3 },
      { type: "trace" },
    ];
  }
  return [
    { type: "axe" },
    { type: "sommet" },
    { type: "perpendiculaireH" },
    { type: "mediatriceH" },
    { type: "pointRapide", indice: 1 },
    { type: "pointRapide", indice: 2 },
    { type: "trace" },
  ];
}

/** Un tracé de l'élève : un cercle (compas) ou une droite tracée le long de l'équerre. Pour une
 * droite, `reference` est la droite sur laquelle l'équerre glisse ; la droite tracée lui est
 * perpendiculaire, au point d'abscisse locale `position` (référence d) ou d'ordonnée locale
 * `position` (référence axe). */
export type TraceConstruction =
  | { type: "cercle"; centre: NomPoint; rayon: number }
  | { type: "droite"; reference: "d" | "axe"; position: number };

export type OutilConstruction = "compas" | "equerre";

/** Ce qui est déjà construit (valeurs exactes retenues), mis à jour à la clôture de chaque écran. */
export interface AcquisConstruction {
  axe: boolean;
  sommet: boolean;
  /** Méthode du cercle : ouvertures des couples terminés. */
  ouvertures: number[];
  /** Méthode du cercle : ouverture reportée depuis K pour le couple en cours (écrans guidés). */
  ouvertureEnCours: number | null;
  /** Méthode du cercle : la parallèle du couple en cours est tracée. */
  paralleleEnCours: boolean;
  /** Méthode de la médiatrice : nombre de points H traités (perpendiculaire + médiatrice). */
  pointsH: number;
  /** Méthode de la médiatrice : la perpendiculaire en H₁ est tracée (écran guidé). */
  perpendiculaireEnCours: boolean;
}

export const ACQUIS_INITIAL: AcquisConstruction = {
  axe: false,
  sommet: false,
  ouvertures: [],
  ouvertureEnCours: null,
  paralleleEnCours: false,
  pointsH: 0,
  perpendiculaireEnCours: false,
};

export function coordonneesPoint(e: ExerciceConstructionParabole, nom: NomPoint): Point {
  switch (nom) {
    case "F":
      return foyer(e);
    case "K":
      return PIED_K;
    case "S":
      return sommet(e);
    case "H1":
      return pointH(e, 0);
    case "H2":
      return pointH(e, 1);
    case "H3":
      return pointH(e, 2);
  }
}

export const NOMS_H: NomPoint[] = ["H1", "H2", "H3"];

/** Points où la pointe du compas peut se piquer à cet écran (ceux qui sont déjà construits). */
export function pointsPiquables(e: ExerciceConstructionParabole, acquis: AcquisConstruction): NomPoint[] {
  const noms: NomPoint[] = ["F"];
  if (acquis.axe) noms.push("K");
  if (acquis.sommet) noms.push("S");
  if (e.methode === "mediatrice") noms.push(...NOMS_H.slice(0, e.abscissesH.length));
  return noms;
}

export function outilsEcran(ecran: EcranConstructionParabole): OutilConstruction[] {
  switch (ecran.type) {
    case "axe":
    case "parallele":
    case "perpendiculaireH":
      return ["equerre"];
    case "sommet":
    case "report":
    case "cercleF":
    case "mediatriceH":
      return ["compas"];
    case "coupleRapide":
    case "pointRapide":
      return ["compas", "equerre"];
    case "trace":
      return [];
  }
}

/** Droite le long de laquelle glisse l'équerre à cet écran. */
export function referenceEquerre(ecran: EcranConstructionParabole): "d" | "axe" {
  return ecran.type === "parallele" || ecran.type === "coupleRapide" ? "axe" : "d";
}

/** Indice (0, 1, 2) du point H traité par un écran de la méthode médiatrice. */
export function indiceHEcran(ecran: EcranConstructionParabole): number {
  return ecran.type === "pointRapide" ? ecran.indice : 0;
}

export type DiagnosticConstruction =
  | "equerre-absente"
  | "equerre-decalee"
  | "compas-centres"
  | "compas-ouvertures-differentes"
  | "compas-trop-petit"
  | "compas-trop-grand"
  | "report-centre-F"
  | "report-centre-S"
  | "report-centre-autre"
  | "report-trop-petit"
  | "report-deja-utilise"
  | "parallele-mauvais-cote"
  | "parallele-decalee"
  | "cercleF-absent"
  | "cercleF-ouverture"
  | "perpendiculaire-decalee"
  | "trace-incomplet"
  | "trace-ordre";

export interface VerificationEcran {
  correct: boolean;
  diagnostic: DiagnosticConstruction | null;
  /** Ouverture retenue (méthode du cercle : report, couple en enchaînement). */
  ouverture?: number;
}

const OK = (ouverture?: number): VerificationEcran => ({ correct: true, diagnostic: null, ouverture });
const KO = (diagnostic: DiagnosticConstruction): VerificationEcran => ({ correct: false, diagnostic });

function droites(traces: TraceConstruction[], reference: "d" | "axe") {
  return traces.filter((t): t is Extract<TraceConstruction, { type: "droite" }> => t.type === "droite" && t.reference === reference);
}

function cercles(traces: TraceConstruction[]) {
  return traces.filter((t): t is Extract<TraceConstruction, { type: "cercle" }> => t.type === "cercle");
}

/** Une droite de l'équerre tracée à la position attendue (à la tolérance près). */
function verifierEquerre(traces: TraceConstruction[], reference: "d" | "axe", attendue: number, diagnosticDecale: DiagnosticConstruction): VerificationEcran {
  const candidates = droites(traces, reference);
  if (candidates.length === 0) return KO("equerre-absente");
  return candidates.some((t) => Math.abs(t.position - attendue) <= TOLERANCE_POSITION) ? OK() : KO(diagnosticDecale);
}

/** Médiatrice au compas : un cercle de centre A et un cercle de centre B, de même ouverture,
 * strictement plus grande que la moitié de AB. */
function verifierMediatrice(e: ExerciceConstructionParabole, traces: TraceConstruction[], a: NomPoint, b: NomPoint): VerificationEcran {
  const liste = cercles(traces);
  const autourA = liste.filter((c) => c.centre === a);
  const autourB = liste.filter((c) => c.centre === b);
  if (autourA.length === 0 || autourB.length === 0) return KO("compas-centres");
  const demi = distance(coordonneesPoint(e, a), coordonneesPoint(e, b)) / 2;
  const paires = autourA.flatMap((ca) => autourB.map((cb) => [ca.rayon, cb.rayon] as const));
  const memes = paires.filter(([r1, r2]) => Math.abs(r1 - r2) <= TOLERANCE_OUVERTURE);
  if (memes.length === 0) return KO("compas-ouvertures-differentes");
  if (memes.some(([r1, r2]) => Math.min(r1, r2) > demi + MARGE_COUPE && Math.max(r1, r2) <= OUVERTURE_MAX)) return OK();
  return memes.some(([r1, r2]) => Math.min(r1, r2) > demi + MARGE_COUPE) ? KO("compas-trop-grand") : KO("compas-trop-petit");
}

/** Méthode du cercle : le report de l'ouverture depuis K (cercle de centre K). */
function verifierReport(e: ExerciceConstructionParabole, traces: TraceConstruction[], ouverturesPrecedentes: number[]): VerificationEcran {
  const liste = cercles(traces);
  const autourK = liste.filter((c) => c.centre === "K");
  if (autourK.length === 0) {
    if (liste.some((c) => c.centre === "F")) return KO("report-centre-F");
    if (liste.some((c) => c.centre === "S")) return KO("report-centre-S");
    return KO("report-centre-autre");
  }
  const r = autourK[autourK.length - 1]!.rayon;
  if (r <= e.h / 2 + MARGE_COUPE) return KO("report-trop-petit");
  if (ouverturesPrecedentes.some((u) => Math.abs(u - r) < ECART_OUVERTURES)) return KO("report-deja-utilise");
  return OK(r);
}

function verifierParallele(traces: TraceConstruction[], r: number): VerificationEcran {
  const candidates = droites(traces, "axe");
  if (candidates.length === 0) return KO("equerre-absente");
  if (candidates.some((t) => Math.abs(t.position - r) <= TOLERANCE_POSITION)) return OK();
  if (candidates.some((t) => Math.abs(t.position + r) <= TOLERANCE_POSITION)) return KO("parallele-mauvais-cote");
  return KO("parallele-decalee");
}

function verifierCercleF(traces: TraceConstruction[], r: number): VerificationEcran {
  const autourF = cercles(traces).filter((c) => c.centre === "F");
  if (autourF.length === 0) return KO("cercleF-absent");
  return autourF.some((c) => Math.abs(c.rayon - r) <= TOLERANCE_OUVERTURE) ? OK() : KO("cercleF-ouverture");
}

export function verifierEcran(
  e: ExerciceConstructionParabole,
  ecran: EcranConstructionParabole,
  acquis: AcquisConstruction,
  traces: TraceConstruction[],
): VerificationEcran {
  switch (ecran.type) {
    case "axe":
      return verifierEquerre(traces, "d", 0, "equerre-decalee");
    case "sommet":
      return verifierMediatrice(e, traces, "K", "F");
    case "report":
      return verifierReport(e, traces, acquis.ouvertures);
    case "parallele":
      return verifierParallele(traces, acquis.ouvertureEnCours ?? 0);
    case "cercleF":
      return verifierCercleF(traces, acquis.ouvertureEnCours ?? 0);
    case "coupleRapide": {
      const report = verifierReport(e, traces, acquis.ouvertures);
      if (!report.correct) return report;
      const r = report.ouverture!;
      const parallele = verifierParallele(traces, r);
      if (!parallele.correct) return parallele;
      const cercle = verifierCercleF(traces, r);
      return cercle.correct ? OK(r) : cercle;
    }
    case "perpendiculaireH":
      return verifierEquerre(traces, "d", pointH(e, 0).x, "perpendiculaire-decalee");
    case "mediatriceH":
      return verifierMediatrice(e, traces, "F", "H1");
    case "pointRapide": {
      const perpendiculaire = verifierEquerre(traces, "d", pointH(e, ecran.indice).x, "perpendiculaire-decalee");
      if (!perpendiculaire.correct) return perpendiculaire;
      return verifierMediatrice(e, traces, "F", NOMS_H[ecran.indice]!);
    }
    case "trace":
      return KO("trace-incomplet");
  }
}

/** Ouvertures de repli (méthode du cercle), quand l'élève a épuisé ses tentatives : la première qui
 * n'est pas trop proche d'une ouverture déjà utilisée. */
const OUVERTURES_REPLI = [1.6, 2.6, 4];

export function ouvertureRepli(ouverturesPrecedentes: number[]): number {
  return OUVERTURES_REPLI.find((r) => ouverturesPrecedentes.every((u) => Math.abs(u - r) >= ECART_OUVERTURES)) ?? 5;
}

/** Ouverture « raisonnable » pour une médiatrice entre A et B (tracés attendus, figure papier). */
export function ouvertureMediatrice(e: ExerciceConstructionParabole, a: NomPoint, b: NomPoint): number {
  return Math.round(distance(coordonneesPoint(e, a), coordonneesPoint(e, b)) * 0.75 * 10) / 10 + 0.1;
}

/** Ce que l'écran construit quand il se clôt (valeur de l'élève si correcte, repli sinon). */
export function appliquerEcran(
  e: ExerciceConstructionParabole,
  ecran: EcranConstructionParabole,
  acquis: AcquisConstruction,
  verification: VerificationEcran,
): AcquisConstruction {
  switch (ecran.type) {
    case "axe":
      return { ...acquis, axe: true };
    case "sommet":
      return { ...acquis, sommet: true };
    case "report":
      return { ...acquis, ouvertureEnCours: verification.correct ? verification.ouverture! : ouvertureRepli(acquis.ouvertures) };
    case "parallele":
      return { ...acquis, paralleleEnCours: true };
    case "cercleF":
      return { ...acquis, ouvertures: [...acquis.ouvertures, acquis.ouvertureEnCours ?? ouvertureRepli(acquis.ouvertures)], ouvertureEnCours: null, paralleleEnCours: false };
    case "coupleRapide": {
      const r = verification.correct ? verification.ouverture! : ouvertureRepli(acquis.ouvertures);
      return { ...acquis, ouvertures: [...acquis.ouvertures, r] };
    }
    case "perpendiculaireH":
      return { ...acquis, perpendiculaireEnCours: true };
    case "mediatriceH":
    case "pointRapide":
      void e;
      return { ...acquis, pointsH: acquis.pointsH + 1, perpendiculaireEnCours: false };
    case "trace":
      return acquis;
  }
}

/** Tracés de la construction attendue d'un écran (affichés quand la réponse est révélée), à partir
 * de l'acquis APRÈS clôture. */
export function tracesAttendues(e: ExerciceConstructionParabole, ecran: EcranConstructionParabole, apres: AcquisConstruction): TraceConstruction[] {
  const derniereOuverture = apres.ouvertures[apres.ouvertures.length - 1] ?? 0;
  switch (ecran.type) {
    case "axe":
      return [{ type: "droite", reference: "d", position: 0 }];
    case "sommet": {
      const r = ouvertureMediatrice(e, "K", "F");
      return [
        { type: "cercle", centre: "K", rayon: r },
        { type: "cercle", centre: "F", rayon: r },
      ];
    }
    case "report":
      return [{ type: "cercle", centre: "K", rayon: apres.ouvertureEnCours ?? 0 }];
    case "parallele":
      return [{ type: "droite", reference: "axe", position: apres.ouvertureEnCours ?? 0 }];
    case "cercleF":
      return [{ type: "cercle", centre: "F", rayon: derniereOuverture }];
    case "coupleRapide":
      return [
        { type: "cercle", centre: "K", rayon: derniereOuverture },
        { type: "droite", reference: "axe", position: derniereOuverture },
        { type: "cercle", centre: "F", rayon: derniereOuverture },
      ];
    case "perpendiculaireH":
      return [{ type: "droite", reference: "d", position: pointH(e, 0).x }];
    case "mediatriceH":
    case "pointRapide": {
      const i = indiceHEcran(ecran);
      const r = ouvertureMediatrice(e, "F", NOMS_H[i]!);
      return [
        ...(ecran.type === "pointRapide" ? [{ type: "droite" as const, reference: "d" as const, position: pointH(e, i).x }] : []),
        { type: "cercle", centre: "F", rayon: r },
        { type: "cercle", centre: NOMS_H[i]!, rayon: r },
      ];
    }
    case "trace":
      return [];
  }
}

/** Points de la parabole déjà construits (hors sommet), avec leur origine. */
export interface PointConstruit {
  point: Point;
  /** Méthode médiatrice : point obtenu par symétrie d'axe (et non par la médiatrice). */
  parSymetrie: boolean;
}

export function pointsConstruits(e: ExerciceConstructionParabole, acquis: AcquisConstruction): PointConstruit[] {
  if (e.methode === "cercle") {
    return acquis.ouvertures.flatMap((r) => pointsOuverture(e, r).map((point) => ({ point, parSymetrie: false })));
  }
  return e.abscissesH.slice(0, acquis.pointsH).flatMap((x) => {
    const p = pointDeH(e, x);
    return [
      { point: p, parSymetrie: false },
      { point: { x: -p.x, y: p.y }, parSymetrie: true },
    ];
  });
}

/** Points à relier au tracé, dans l'ordre le long de la courbe (abscisse locale croissante). */
export function pointsATracer(e: ExerciceConstructionParabole, acquis: AcquisConstruction): Point[] {
  return [sommet(e), ...pointsConstruits(e, acquis).map((p) => p.point)].sort((a, b) => a.x - b.x);
}

/** Un ordre de clic est correct s'il parcourt les points de proche en proche, d'une extrémité à
 * l'autre (dans un sens ou dans l'autre). */
export function ordreTraceCorrect(nombre: number, indices: number[]): boolean {
  if (indices.length !== nombre) return false;
  const croissant = indices.every((v, i) => v === i);
  const decroissant = indices.every((v, i) => v === nombre - 1 - i);
  return croissant || decroissant;
}
