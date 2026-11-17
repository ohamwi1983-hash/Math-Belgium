import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { Boite3D, CadrageScene, ObstacleOmbreSoleil, Piquet } from "../../core/ombreSoleil.types";
import type {
  CandidatLampe,
  EcranChoixLampe,
  ErreurOmbreLampe,
  ExerciceOmbreLampe,
  ExerciceOmbreLampeCube,
  ExerciceOmbreLampeLampe,
  ExerciceOmbreLampeMur,
  ExerciceOmbreLampePoteau,
  Mur,
  SommetBoite,
  VarianteOmbreLampe,
} from "../../core/ombreLampe.types";
import { additionner3D, distance3D, multiplierScalaire3D, soustraire3D } from "../solide3D/geometrieEspace";
import { distancePixel, ecartAngulaireEcran, echellePixel, projeter2D } from "../ombreSoleil/ombreGeometrie";
import {
  angleSol,
  testeurDessin,
  directionSolDepuisImage,
  distancePixelSegment,
  enveloppe2D,
  imageSurSol,
  intersectionImages,
  murDepuisImage,
  ombreParLampe,
  parametreSurImage,
  solDepuisImage,
} from "./geometrieLampe";

/**
 * Couche A — gen106 « Ombre à la lampe : projection centrale » (4e, chapitre 8). Prolongement de
 * gen41 (`generateurs/ombreSoleil/`) dont il reprend les leçons d'audit d'emblée :
 * - chaque candidat incarne une ERREUR précise (`ErreurOmbreLampe`) : rayons tracés parallèles comme
 *   au soleil, ombre qui ne part pas du pied de l'objet, pied de la lampe oublié (trace tracée depuis
 *   la lampe dessinée), trace de mauvaise longueur, point sur le rayon sans être sur la trace… ;
 * - le RANG de la bonne réponse (par distance au pied concerné, ou de gauche à droite au pied du
 *   mur) est tiré uniformément : « le 2e point le plus proche » ne désigne jamais la réponse ;
 * - candidats deux à deux à ≥ 24 px, à ≥ 16 px des autres points dessinés, tous dans le cadre ;
 * - scènes cohérentes : aucun objet dans un autre, lampadaire et poteaux jamais superposés sur le
 *   dessin, ombres hors de l'emprise du pavé et visibles, lampe toujours plus haute que les objets.
 * Les tirages qui ne respectent pas ces contraintes sont rejetés et refaits.
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomReel(min: number, max: number, pas = 0.05): number {
  return min + pas * randomInt(0, Math.round((max - min) / pas));
}

function choisir<T>(tableau: readonly T[]): T {
  return tableau[randomInt(0, tableau.length - 1)];
}

function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const MAX_TENTATIVES = 20000;
const SEPARATION_CANDIDATS_PX = 24;
const SEPARATION_AUTRES_PX = 16;
const SEPARATION_APERCUS_PX = 20;
const LONGUEUR_APERCU_PX = 72;
const MARGE_SOL = 1.2;

export function sommetPoteau(p: Piquet): Point3D {
  return { x: p.base.x, y: p.base.y, z: p.hauteur };
}

function sol(x: number, y: number): Point3D {
  return { x, y, z: 0 };
}

function longueurSol(v: Point3D): number {
  return Math.hypot(v.x, v.y);
}

function normaliserSol(v: Point3D): Point3D {
  const l = longueurSol(v) || 1;
  return { x: v.x / l, y: v.y / l, z: 0 };
}

// --- Candidats ------------------------------------------------------------------------------------

interface CandidatBrut {
  position: Point3D;
  erreur: ErreurOmbreLampe;
}

/**
 * Tire 3 distracteurs valides en ÉQUILIBRANT DEUX rangs de la bonne réponse, visés AVANT la boucle de
 * rejet de la scène (sinon les scènes les plus faciles à réussir imposeraient leurs rangs) :
 * - son rang selon `cle` (distance au pied concerné, abscisse au pied du mur…) ;
 * - son rang par distance au centre des 4 candidats — sans lui, la bonne réponse, à l'intersection de
 *   deux droites qui portent chacune des leurres, était presque toujours « celle du milieu ».
 * Les deux rangs sont liés par la géométrie (extrême selon `cle` ⇒ loin du centre…) : chaque écran a
 * donc sa liste de couples RÉALISABLES (mesurés), formée de deux « permutations » (un couple par
 * ligne et par colonne) pour que CHAQUE rang, pris seul, soit uniforme sur 1..4 (`COUPLES_PAR_ECRAN`).
 * Rang `-1` : rang libre. Un `pool` donné par une fonction (leurres aux longueurs tirées au hasard)
 * est retiré jusqu'à 6 fois avec les MÊMES rangs visés. `null` si aucun trio ne convient.
 */
type Couple = [number, number];

const permutations = (...lignes: string[]): Couple[] => lignes.flatMap((l) => l.split(" ").map((c) => [Number(c[0]), Number(c[1])] as Couple));

/** Couples (rang selon `cle`, rang par distance au centre) visés, par variante et par écran — mesurés
 * sur 6 × 4 000 essais par couple (rapport de gen106). Clés : distance au pied du poteau (poteau),
 * au pied du sommet (cube), au milieu des deux pieds puis au pied de la lampe (lampe), abscisse puis
 * hauteur sur le dessin (mur). `poteau`, écran 1 (demi-droites) : seul le rang par rapport au centre. */
const COUPLES_PAR_ECRAN: Record<VarianteOmbreLampe, [Couple[], Couple[]]> = {
  poteau: [[[-1, 0], [-1, 1], [-1, 2], [-1, 3]], permutations("00 11 22 33", "01 10 23 32")],
  cube: [permutations("02 11 20 33", "03 10 21 32"), permutations("02 11 20 33", "03 10 21 32")],
  mur: [permutations("02 10 21 33", "03 11 20 32"), permutations("03 10 21 32", "03 11 20 32")],
  lampe: [permutations("00 11 22 33", "01 10 23 32"), permutations("02 10 21 33", "03 11 20 32")],
};

function choisirDistracteurs(
  couple: Couple,
  pool: CandidatBrut[] | (() => CandidatBrut[]),
  vrai: Point3D,
  cle: (p: Point3D) => number,
  valide: (c: CandidatBrut) => boolean = () => true,
  prioritaire?: ErreurOmbreLampe,
  valideQuatuor?: (points: Point3D[]) => boolean,
): CandidatBrut[] | null {
  const [rangCle, rangCentre] = couple;
  const essais = typeof pool === "function" ? 6 : 1;
  for (let essai = 0; essai < essais; essai++) {
    const trio = trioAuxRangs(typeof pool === "function" ? pool() : pool, vrai, cle, valide, rangCle, rangCentre, prioritaire, valideQuatuor);
    if (trio) return trio;
  }
  return null;
}

function trioAuxRangs(
  pool: CandidatBrut[],
  vrai: Point3D,
  cle: (p: Point3D) => number,
  valide: (c: CandidatBrut) => boolean,
  rangCle: number,
  rangCentre: number,
  prioritaire?: ErreurOmbreLampe,
  valideQuatuor?: (points: Point3D[]) => boolean,
): CandidatBrut[] | null {
  const valides: CandidatBrut[] = [];
  for (const c of melanger(pool)) {
    if (!Number.isFinite(c.position.x + c.position.y + c.position.z) || !valide(c) || distance3D(c.position, vrai) <= 0.3) continue;
    if (valides.some((d) => distance3D(d.position, c.position) <= 0.3)) continue;
    valides.push(c);
  }
  if (valides.length < 3) return null;
  const trios: CandidatBrut[][] = [];
  for (let i = 0; i < valides.length; i++) for (let j = i + 1; j < valides.length; j++) for (let k = j + 1; k < valides.length; k++) trios.push([valides[i], valides[j], valides[k]]);
  // Le leurre `prioritaire` (piège central de l'écran) est préféré quand les rangs tirés le permettent.
  const ordonnes = melanger(trios).sort((a, b) => Number(b.some((c) => c.erreur === prioritaire)) - Number(a.some((c) => c.erreur === prioritaire)));
  const cVrai = cle(vrai);
  for (const trio of ordonnes) {
    if (rangCle >= 0 && trio.filter((c) => cle(c.position) < cVrai).length !== rangCle) continue;
    const images = [vrai, ...trio.map((c) => c.position)].map(projeter2D);
    const cx = images.reduce((s, p) => s + p.x, 0) / 4;
    const cy = images.reduce((s, p) => s + p.y, 0) / 4;
    const d = images.map((p) => Math.hypot(p.x - cx, p.y - cy));
    if (rangCentre >= 0 && d.slice(1).filter((x) => x < d[0]).length !== rangCentre) continue;
    if (valideQuatuor && !valideQuatuor([vrai, ...trio.map((c) => c.position)])) continue;
    return trio;
  }
  return null;
}

function versCandidats(vrai: Point3D, distracteurs: CandidatBrut[]): CandidatLampe[] {
  return [{ position: vrai, erreur: "aucune" as const }, ...distracteurs].map((c, i) => ({ id: `c${i}`, position: c.position, erreur: c.erreur }));
}

function distanceDessin(reference: Point3D): (p: Point3D) => number {
  const r = projeter2D(reference);
  return (p) => {
    const q = projeter2D(p);
    return Math.hypot(q.x - r.x, q.y - r.y);
  };
}

function candidatsLisibles(candidats: readonly CandidatLampe[], autres: readonly Point3D[], echelle: number): boolean {
  for (let i = 0; i < candidats.length; i++) {
    for (let j = i + 1; j < candidats.length; j++) {
      if (distancePixel(candidats[i].position, candidats[j].position, echelle) < SEPARATION_CANDIDATS_PX) return false;
    }
    if (autres.some((p) => distancePixel(candidats[i].position, p, echelle) < SEPARATION_AUTRES_PX)) return false;
  }
  return true;
}

// --- Cadrage ----------------------------------------------------------------------------------------

function construireCadrage(pointsSol: Point3D[], autres: Point3D[], yMaxSol?: number): CadrageScene {
  const xs = pointsSol.map((p) => p.x);
  const ys = pointsSol.map((p) => p.y);
  const xMin = Math.min(...xs) - MARGE_SOL;
  const xMax = Math.max(...xs) + MARGE_SOL;
  const yMin = Math.min(...ys) - MARGE_SOL;
  const yMax = yMaxSol ?? Math.max(...ys) + MARGE_SOL;
  const s: CadrageScene["sol"] = [sol(xMin, yMin), sol(xMax, yMin), sol(xMax, yMax), sol(xMin, yMax)];
  return { sol: s, points: [...s, ...autres] };
}

/** Points nommés de la scène deux à deux à `min` px au moins : leurs étiquettes ne se chevauchent pas. */
function pointsNommesSepares(points: readonly Point3D[], echelle: number, min = 26): boolean {
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) if (distancePixel(points[i], points[j], echelle) < min) return false;
  }
  return true;
}

/** Deux segments verticaux (pied, hauteur) ne se superposent pas sur le dessin : abscisses à plus de
 * 22 px, ou étendues verticales disjointes. */
function verticalesSeparees(a: Point3D, ha: number, b: Point3D, hb: number, echelle: number): boolean {
  const pa = projeter2D(a);
  const pb = projeter2D(b);
  if (Math.abs(pa.x - pb.x) * echelle >= 22) return true;
  return pa.y + ha + 0.3 < pb.y || pb.y + hb + 0.3 < pa.y;
}

/** Poteau tiré au hasard : pied entier à `separation` au moins des points `eviter`, hauteur entière
 * telle que l'ombre ait une longueur raisonnable (rapport hauteur / (H − hauteur) entre 0,33 et 1,6). */
function tirerPoteau(id: string, eviter: Point3D[], separation: number, hauteurLampe: number, plage = 6): Piquet | null {
  for (let t = 0; t < 60; t++) {
    const base = sol(randomInt(-plage, plage), randomInt(-plage, plage));
    if (!eviter.every((p) => longueurSol(soustraire3D(p, base)) >= separation)) continue;
    // Pas trop loin du lampadaire (eviter[0]) : la scène reste compacte, donc grande à l'écran.
    if (longueurSol(soustraire3D(eviter[0], base)) > 6.5) continue;
    const hauteur = randomInt(2, hauteurLampe - 2);
    const rapport = hauteur / (hauteurLampe - hauteur);
    if (rapport < 0.33 || rapport > 1.6) continue;
    return { id, base, hauteur };
  }
  return null;
}

// ============================================================================================
// Variante `poteau` — demi-droite de l'ombre, puis ombre du sommet
// ============================================================================================

/** Extrémité d'une demi-droite du sol issue de `origine`, de longueur `longueurUnites` (unités
 * projetées) sur le dessin. */
function extremiteApercu(origine: Point3D, direction: Point3D, longueurUnites: number): Point3D {
  const p = projeter2D(direction);
  const l = Math.hypot(p.x, p.y) || 1;
  return additionner3D(origine, multiplierScalaire3D(direction, longueurUnites / l));
}

function construirePoteau(couples: Couple[]): ExerciceOmbreLampePoteau | null {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const H = randomInt(5, 8);
    const piedLampe = sol(randomInt(-4, 4), randomInt(-4, 4));
    const lampe = { ...piedLampe, z: H };
    const exemple = tirerPoteau("E", [piedLampe], 3, H);
    if (!exemple) continue;
    const poteau = tirerPoteau("A", [piedLampe, exemple.base], 3, H);
    if (!poteau) continue;
    const ombreExemple = ombreParLampe(lampe, sommetPoteau(exemple));
    const ombre = ombreParLampe(lampe, sommetPoteau(poteau));
    const lE = longueurSol(soustraire3D(ombreExemple, exemple.base));
    const lA = longueurSol(soustraire3D(ombre, poteau.base));
    if (lE < 1.5 || lE > 7 || lA < 1.5 || lA > 7) continue;
    const uE = soustraire3D(exemple.base, piedLampe);
    const uA = soustraire3D(poteau.base, piedLampe);
    // Ombres franchement non parallèles (dans l'espace ET sur le dessin) : sinon le leurre « comme
    // au soleil » se confondrait avec la bonne demi-droite.
    const aSol = angleSol(uE, uA);
    const aDessin = ecartAngulaireEcran(uE, uA);
    if (aSol < 30 || aSol > 150 || aDessin < 28 || aDessin > 152) continue;

    // Écran 1 — demi-droites candidates issues du pied de A.
    const directionVraie = normaliserSol(uA);
    const poolDirections: CandidatBrut[] = [
      { position: normaliserSol(uE), erreur: "paralleleExemple" },
      { position: normaliserSol(multiplierScalaire3D(uA, -1)), erreur: "versLampe" },
      { position: normaliserSol(directionSolDepuisImage({ x: projeter2D(poteau.base).x - projeter2D(lampe).x, y: projeter2D(poteau.base).y - projeter2D(lampe).y })), erreur: "depuisLampe" },
      { position: normaliserSol(soustraire3D(poteau.base, exemple.base)), erreur: "depuisPiedExemple" },
      { position: normaliserSol(soustraire3D(exemple.base, poteau.base)), erreur: "versAutrePoteau" },
      { position: normaliserSol(directionSolDepuisImage({ x: 0, y: -1 })), erreur: "verticaleDessin" },
    ];
    // Sélection sur les extrémités des demi-droites ramenées à une même longueur À L'ÉCRAN (les
    // aperçus finaux en sont un agrandissement) : rang de la bonne demi-droite par rapport au centre
    // des 4 extrémités tiré au hasard (sinon elle était presque toujours « celle du milieu »), et
    // demi-droites deux à deux écartées de 22° au moins sur le dessin.
    const surCercle = (u: Point3D) => additionner3D(poteau.base, multiplierScalaire3D(u, 1 / (Math.hypot(projeter2D(u).x, projeter2D(u).y) || 1)));
    const versDirection = new Map<Point3D, Point3D>();
    const poolCercle = poolDirections.map((d) => {
      const p = surCercle(d.position);
      versDirection.set(p, d.position);
      return { position: p, erreur: d.erreur };
    });
    const vraieCercle = surCercle(directionVraie);
    versDirection.set(vraieCercle, directionVraie);
    const ecartes = (pts: Point3D[]) => pts.every((a, i) => pts.every((b, j) => j <= i || ecartAngulaireEcran(soustraire3D(a, poteau.base), soustraire3D(b, poteau.base)) >= 22));
    const trioDirections = choisirDistracteurs(couples[0], poolCercle, vraieCercle, (p) => projeter2D(p).x, () => true, "paralleleExemple", ecartes);
    if (!trioDirections) continue;
    const directions: CandidatBrut[] = [{ position: directionVraie, erreur: "aucune" }, ...trioDirections.map((d) => ({ position: versDirection.get(d.position)!, erreur: d.erreur }))];

    // Écran 2 — points candidats pour A′.
    const sommet = sommetPoteau(poteau);
    const trace = soustraire3D(ombre, poteau.base);
    const tSol = H / (H - poteau.hauteur);
    const surRayon = (f: number) => imageSurSol(additionner3D(lampe, multiplierScalaire3D(soustraire3D(sommet, lampe), 1 + (tSol - 1) * f)));
    const directionRayonE = soustraire3D(ombreExemple, sommetPoteau(exemple));
    const pool = (): CandidatBrut[] => [
      { position: additionner3D(poteau.base, multiplierScalaire3D(trace, randomReel(0.45, 0.6))), erreur: "traceTropCourte" },
      { position: additionner3D(poteau.base, multiplierScalaire3D(trace, randomReel(1.4, 1.65))), erreur: "traceTropLongue" },
      { position: surRayon(randomReel(0.35, 0.6)), erreur: "surRayonSansTrace" },
      { position: surRayon(randomReel(1.4, 1.7)), erreur: "surRayonSansTrace" },
      { position: additionner3D(sommet, multiplierScalaire3D(directionRayonE, poteau.hauteur / exemple.hauteur)), erreur: "rayonParallele" },
      { position: additionner3D(poteau.base, multiplierScalaire3D(trace, -randomReel(0.6, 0.85))), erreur: "ombreCoteLampe" },
    ];
    const distracteurs = choisirDistracteurs(couples[1], pool, ombre, distanceDessin(poteau.base), () => true, "rayonParallele");
    if (!distracteurs) continue;
    const candidats = versCandidats(ombre, distracteurs);

    // Cadrage : les demi-droites ont ~72 px à l'écran, ce qui dépend de l'échelle finale.
    const pointsSol = [piedLampe, exemple.base, ombreExemple, poteau.base, ombre, ...candidats.map((c) => c.position)];
    const autres = [lampe, sommetPoteau(exemple), sommet];
    let cadrage = construireCadrage(pointsSol, autres);
    let echelle = echellePixel(cadrage.points);
    let extremites: Point3D[] = [];
    for (let i = 0; i < 3; i++) {
      extremites = directions.map((d) => extremiteApercu(poteau.base, d.position, LONGUEUR_APERCU_PX / echelle));
      cadrage = construireCadrage([...pointsSol, ...extremites], autres);
      echelle = echellePixel(cadrage.points);
    }
    const dessines = [piedLampe, exemple.base, ombreExemple, poteau.base, lampe, sommetPoteau(exemple), sommet];
    if (!candidatsLisibles(candidats, dessines, echelle)) continue;
    const apercus = directions.map((d, i) => ({ id: `d${i}`, position: extremites[i], erreur: d.erreur }));
    if (!candidatsLisibles(apercus.map((a) => ({ ...a })), dessines, echelle * (SEPARATION_APERCUS_PX / SEPARATION_CANDIDATS_PX))) continue;
    if (!verticalesSeparees(piedLampe, H, exemple.base, exemple.hauteur, echelle)) continue;
    if (!verticalesSeparees(piedLampe, H, poteau.base, poteau.hauteur, echelle)) continue;
    if (!verticalesSeparees(exemple.base, exemple.hauteur, poteau.base, poteau.hauteur, echelle)) continue;
    if (!pointsNommesSepares([lampe, piedLampe, sommetPoteau(exemple), ombreExemple, sommet, exemple.base, poteau.base], echelle)) continue;
    // Le rayon pointillé de l'exemple se distingue du mât : E′ est loin du mât sur le dessin.
    if (distancePixelSegment(ombreExemple, piedLampe, lampe, echelle) < 30) continue;
    // L'ombre de E ne frôle ni le pied de A ni le lampadaire, et celle de A ne frôle pas le pied de E.
    if (distancePixelSegment(poteau.base, exemple.base, ombreExemple, echelle) < 14) continue;
    if (distancePixelSegment(exemple.base, poteau.base, ombre, echelle) < 14) continue;
    if (distancePixelSegment(piedLampe, exemple.base, ombreExemple, echelle) < 14) continue;
    // Les demi-droites (aperçus) ne passent pas sur le pied de la lampe ni sur l'exemple.
    if (apercus.some((a) => [piedLampe, exemple.base, ombreExemple].some((p) => distancePixelSegment(p, poteau.base, a.position, echelle) < 12))) continue;

    const ecran1: EcranChoixLampe = { type: "direction", origine: poteau.base, candidats: apercus.map((a, i) => ({ id: `d${i}`, position: a.position, erreur: directions[i].erreur })) };
    const ecran2: EcranChoixLampe = { type: "point", candidats };
    return { variante: "poteau", lampe, piedLampe, exemple, ombreExemple, poteau, ombre, ecrans: [ecran1, ecran2], cadrage };
  }
  return null;
}

// ============================================================================================
// Variante `cube` — ombres de deux sommets du haut d'un cube ou d'un pavé
// ============================================================================================

const NOMS_BAS = ["A", "B", "C", "D"] as const;
const NOMS_HAUT = ["E", "F", "G", "H"] as const;

function solideBoite(boite: Boite3D, label: string): Solide3D {
  const { min, max } = boite;
  return {
    id: "cube",
    label,
    sommets: {
      A: { x: min.x, y: min.y, z: 0 },
      B: { x: max.x, y: min.y, z: 0 },
      C: { x: max.x, y: max.y, z: 0 },
      D: { x: min.x, y: max.y, z: 0 },
      E: { x: min.x, y: min.y, z: max.z },
      F: { x: max.x, y: min.y, z: max.z },
      G: { x: max.x, y: max.y, z: max.z },
      H: { x: min.x, y: max.y, z: max.z },
    },
    faces: [
      ["A", "B", "C", "D"],
      ["E", "F", "G", "H"],
      ["A", "B", "F", "E"],
      ["D", "C", "G", "H"],
      ["A", "D", "H", "E"],
      ["B", "C", "G", "F"],
    ],
  };
}

function horsEmprise(p: Point3D, b: Boite3D, marge: number): boolean {
  return p.x < b.min.x - marge || p.x > b.max.x + marge || p.y < b.min.y - marge || p.y > b.max.y + marge;
}

function construireCube(couples: Couple[]): ExerciceOmbreLampeCube | null {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const estCube = Math.random() < 0.4;
    const c = estCube ? randomReel(1.5, 2.5, 0.5) : randomReel(1.5, 3, 0.5);
    const dx = estCube ? c / 2 : randomReel(0.75, 1.5, 0.25);
    const dy = estCube ? c / 2 : randomReel(0.75, 1.5, 0.25);
    if (!estCube && Math.abs(2 * dx - c) < 1e-9 && Math.abs(2 * dy - c) < 1e-9) continue;
    const centre = sol(randomInt(-2, 2), randomInt(-2, 2));
    const boite: Boite3D = { min: { x: centre.x - dx, y: centre.y - dy, z: 0 }, max: { x: centre.x + dx, y: centre.y + dy, z: c } };
    // Lampe assez haute pour que les ombres restent courtes (H/(H − c) ≤ 1,8 environ).
    const H = Math.ceil(2 * Math.max(c + 2.5, 2.25 * c)) / 2 + randomReel(0, 2, 0.5);
    // Lampadaire à 2 à 4 unités du bord du pavé, à sa gauche ou à sa droite (de 60° vers l'avant à 30°
    // vers l'arrière) : derrière le pavé, son mât serait caché, et devant, l'ombre le serait.
    const decalage = (randomReel(-60, 30, 5) * Math.PI) / 180;
    const angle = Math.random() < 0.5 ? decalage : Math.PI - decalage;
    const rayon = Math.max(dx, dy) + randomReel(2, 4, 0.5);
    const piedLampe = sol(Math.round(2 * (centre.x + rayon * Math.cos(angle))) / 2, Math.round(2 * (centre.y + rayon * Math.sin(angle))) / 2);
    if (!horsEmprise(piedLampe, boite, 1.5)) continue;
    const lampe = { ...piedLampe, z: H };
    const solide = solideBoite(boite, estCube ? "Cube" : "Pavé");
    const obstacle: ObstacleOmbreSoleil = { type: "caisse", solide, boites: [boite] };
    const sommetsBoite = Object.values(solide.sommets);
    const dansPave = testeurDessin(sommetsBoite);

    const hauts: SommetBoite[] = NOMS_HAUT.map((id, i) => ({ id, sommet: solide.sommets[id], idPied: NOMS_BAS[i], ombre: ombreParLampe(lampe, solide.sommets[id]) }));
    if (hauts.some((s) => longueurSol(soustraire3D(s.ombre, piedLampe)) > 11)) continue;
    const base = NOMS_BAS.map((n) => solide.sommets[n]);
    const contour = enveloppe2D([...base, ...hauts.map((s) => s.ombre)]);
    // Sommets dont l'ombre est un coin du contour, hors de l'emprise et VISIBLE (hors du dessin du pavé).
    const utiles = hauts.filter((s) => contour.includes(s.ombre) && horsEmprise(s.ombre, boite, 0.4) && !dansPave(s.ombre, 0.25));
    if (utiles.length < 2) continue;
    // Le lampadaire ne traverse pas le dessin du pavé.
    let lampadaireCache = false;
    for (let k = 0; k <= 10; k++) {
      if (dansPave({ ...piedLampe, z: (H * k) / 10 }, 0.25)) lampadaireCache = true;
    }
    if (lampadaireCache) continue;

    const valide = (c: CandidatBrut) => horsEmprise(c.position, boite, 0.2) && !dansPave(c.position, 0.25);
    // Échelle majorée (sans les candidats) : les 4 candidats d'un écran doivent déjà y être bien séparés.
    const echelleMax = echellePixel([piedLampe, lampe, ...sommetsBoite, ...hauts.map((h) => h.ombre)]);
    const separes = (pts: Point3D[]) => pts.every((a, i) => pts.every((b, j) => j <= i || distancePixel(a, b, echelleMax * 0.8) >= SEPARATION_CANDIDATS_PX));

    /** Les deux écrans pour l'ordre (s1, s2), ou `null`. */
    const construireEcrans = (s1: SommetBoite, s2: SommetBoite): EcranChoixLampe[] | null => {
      const ecrans: EcranChoixLampe[] = [];
      for (const [index, s] of ([s1, s2] as const).entries()) {
        const pied = solide.sommets[s.idPied];
        const trace = soustraire3D(s.ombre, pied);
        const tSol = H / (H - c);
        const surRayon = (f: number) => imageSurSol(additionner3D(lampe, multiplierScalaire3D(soustraire3D(s.sommet, lampe), 1 + (tSol - 1) * f)));
        const fixes: CandidatBrut[] = [];
        for (const autrePied of NOMS_BAS.filter((n) => n !== s.idPied)) {
          const b = solide.sommets[autrePied];
          const q = intersectionImages(lampe, s.sommet, piedLampe, b);
          if (!q) continue;
          const g = solDepuisImage(q);
          const v = soustraire3D(b, piedLampe);
          const param = ((g.x - piedLampe.x) * v.x + (g.y - piedLampe.y) * v.y) / (v.x * v.x + v.y * v.y);
          if (param > 1.15) fixes.push({ position: g, erreur: "mauvaisPied" });
        }
        if (index === 1) {
          // « Comme au soleil » : rayon issu de ce sommet parallèle au rayon du premier sommet.
          fixes.push({ position: additionner3D(s.sommet, soustraire3D(s1.ombre, s1.sommet)), erreur: "rayonParallele" });
        }
        // Les leurres « de longueur » sont retirés au hasard à chaque essai (mêmes rangs visés).
        const pool = (): CandidatBrut[] => [
          ...fixes,
          { position: additionner3D(pied, multiplierScalaire3D(trace, randomReel(0.45, 0.65))), erreur: "traceTropCourte" },
          { position: additionner3D(pied, multiplierScalaire3D(trace, randomReel(1.4, 1.65))), erreur: "traceTropLongue" },
          { position: surRayon(randomReel(0.35, 0.6)), erreur: "surRayonSansTrace" },
          { position: surRayon(randomReel(1.4, 1.7)), erreur: "surRayonSansTrace" },
          { position: additionner3D(pied, multiplierScalaire3D(trace, -randomReel(0.6, 0.85))), erreur: "ombreCoteLampe" },
        ];
        const distracteurs = choisirDistracteurs(couples[index], pool, s.ombre, distanceDessin(pied), valide, index === 1 ? "rayonParallele" : "mauvaisPied", separes);
        if (!distracteurs) return null;
        ecrans.push({ type: "point", candidats: versCandidats(s.ombre, distracteurs) });
      }
      return ecrans;
    };

    // Tous les ordres de deux sommets utiles sont essayés (rangs visés inchangés).
    const paires: [SommetBoite, SommetBoite][] = [];
    for (const a of utiles) for (const b of utiles) if (a !== b) paires.push([a, b]);
    let trouve: { projetes: [SommetBoite, SommetBoite]; ecrans: EcranChoixLampe[] } | null = null;
    for (const [a, b] of melanger(paires)) {
      const ecrans = construireEcrans(a, b);
      if (ecrans) {
        trouve = { projetes: [a, b], ecrans };
        break;
      }
    }
    if (!trouve) continue;
    const { projetes, ecrans } = trouve;
    const [s1, s2] = projetes;
    const autres = hauts.filter((s) => s !== s1 && s !== s2);

    const tousCandidats = ecrans.flatMap((e) => e.candidats.map((c) => c.position));
    const cadrage = construireCadrage([piedLampe, ...base, ...hauts.map((s) => s.ombre), ...tousCandidats], [lampe, ...hauts.map((s) => s.sommet)]);
    const echelle = echellePixel(cadrage.points);
    if (!candidatsLisibles(ecrans[0].candidats, [piedLampe], echelle)) continue;
    if (!candidatsLisibles(ecrans[1].candidats, [piedLampe, s1.ombre], echelle)) continue;
    if (sommetsBoite.some((p) => distancePixel(p, piedLampe, echelle) < 26 || distancePixel(p, lampe, echelle) < 26)) continue;
    // Le lampadaire est loin des candidats et des ombres.
    if ([...tousCandidats, ...hauts.map((s) => s.ombre)].some((p) => distancePixelSegment(p, piedLampe, lampe, echelle) < 14)) continue;

    return { variante: "cube", lampe, piedLampe, boite: obstacle, estCube, projetes, autres, contour, ecrans: [ecrans[0], ecrans[1]], cadrage };
  }
  return null;
}

// ============================================================================================
// Variante `mur` — l'ombre court sur le sol jusqu'au pied d'un mur, puis monte sur le mur
// ============================================================================================

function construireMur(couples: Couple[]): ExerciceOmbreLampeMur | null {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const yMur = randomInt(2, 5);
    const xMin = randomInt(-7, -3);
    const xMax = xMin + randomInt(7, 11);
    const hauteurMur = randomReel(3, 5, 0.5);
    const mur: Mur = { y: yMur, xMin, xMax, hauteur: hauteurMur };
    // Construction à rebours : le point M du pied du mur et la hauteur de l'ombre sur le mur, puis la
    // lampe devant le mur, puis le poteau sur [L₀M], à la hauteur où il coupe le rayon (LA′).
    const piedMur = sol(randomReel(xMin + 1, xMax - 1, 0.5), yMur);
    const zM = randomReel(1, hauteurMur - 0.75, 0.25);
    const H = randomInt(5, 8);
    if (zM > H - 1.5) continue;
    // La trace L₀M est franchement oblique : sinon « droit vers le mur » se confondrait avec M.
    const ecartX = choisir([-1, 1]) * randomInt(2, 5);
    const piedLampe = sol(Math.round(piedMur.x) + ecartX, yMur - randomInt(6, 9));
    if (piedLampe.x < xMin - 1 || piedLampe.x > xMax + 1) continue;
    const lampe = { ...piedLampe, z: H };
    const s = randomReel(0.35, 0.75, 0.05);
    const hauteur = H - s * (H - zM);
    if (hauteur < 1.5 || hauteur > H - 1.5) continue;
    const base = additionner3D(piedLampe, multiplierScalaire3D(soustraire3D(piedMur, piedLampe), s));
    if (longueurSol(soustraire3D(base, piedLampe)) < 2.5) continue;
    if (yMur - base.y < 1.5) continue;
    const poteau: Piquet = { id: "A", base, hauteur };
    if (longueurSol(soustraire3D(piedMur, base)) < 1.2) continue;
    const ombre: Point3D = { x: piedMur.x, y: yMur, z: zM };
    const sommet = sommetPoteau(poteau);
    const coinG = sol(xMin, yMur);
    const coinD = sol(xMax, yMur);
    const surMur = (p: Point3D) => p.x > xMin + 0.3 && p.x < xMax - 0.3 && p.z > 0.3 && p.z < hauteurMur - 0.3;

    // Écran 1 — candidats sur le pied du mur.
    const pool1: CandidatBrut[] = [{ position: sol(base.x, yMur), erreur: "perpendiculaire" }, { position: sol(2 * base.x - piedMur.x, yMur), erreur: "coteOppose" }];
    const qLampe = intersectionImages(lampe, base, coinG, coinD);
    if (qLampe && parametreSurImage(solDepuisImage(qLampe), lampe, base) > 0) pool1.push({ position: { ...solDepuisImage(qLampe), y: yMur }, erreur: "depuisLampeMur" });
    const qSommet = intersectionImages(piedLampe, sommet, coinG, coinD);
    if (qSommet && parametreSurImage(solDepuisImage(qSommet), piedLampe, sommet) > 0) pool1.push({ position: { ...solDepuisImage(qSommet), y: yMur }, erreur: "traceParSommet" });
    const qRayon = intersectionImages(lampe, sommet, coinG, coinD);
    if (qRayon && parametreSurImage(solDepuisImage(qRayon), lampe, sommet) > 1) pool1.push({ position: { ...solDepuisImage(qRayon), y: yMur }, erreur: "rayonAuPiedMur" });
    // Trace tracée « à l'œil » depuis le pied de A, trop ou pas assez inclinée : sans elle, presque
    // tous les leurres tombaient du côté de la lampe, et « le point le plus éloigné de la lampe »
    // désignait souvent M.
    const ecartM = piedMur.x - base.x;
    const fabriquePool1 = (): CandidatBrut[] => [
      ...pool1,
      { position: sol(piedMur.x + ecartM * randomReel(0.7, 1.1), yMur), erreur: "traceTropOblique" },
      { position: sol(piedMur.x + ecartM * randomReel(1.5, 2), yMur), erreur: "traceTropOblique" },
    ];
    const dansLargeur = (c: CandidatBrut) => c.position.x > xMin + 0.3 && c.position.x < xMax - 0.3;
    const distracteurs1 = choisirDistracteurs(couples[0], fabriquePool1, piedMur, (p) => projeter2D(p).x, dansLargeur, "perpendiculaire");
    if (!distracteurs1) continue;

    // Écran 2 — candidats sur le mur.
    const tA = parametreSurImage(ombre, lampe, sommet);
    const surRayon = (f: number) => {
      const t = 1 + (tA - 1) * f;
      const L = projeter2D(lampe);
      const S = projeter2D(sommet);
      return murDepuisImage({ x: L.x + t * (S.x - L.x), y: L.y + t * (S.y - L.y) }, yMur);
    };
    const fixes2: CandidatBrut[] = [{ position: { x: base.x, y: yMur, z: hauteur }, erreur: "derriereMemeHauteur" }];
    if (Math.abs(hauteur - zM) >= 0.6 && hauteur < hauteurMur - 0.3) fixes2.push({ position: { ...ombre, z: hauteur }, erreur: "hauteurPoteau" });
    const pool2 = (): CandidatBrut[] => [
      ...fixes2,
      { position: { ...ombre, z: zM * randomReel(0.45, 0.65) }, erreur: "tropBas" },
      { position: { ...ombre, z: zM * randomReel(0.2, 0.35) }, erreur: "tropBas" },
      { position: { ...ombre, z: Math.min(hauteurMur - 0.35, zM * randomReel(1.45, 1.8)) }, erreur: "tropHaut" },
      { position: surRayon(randomReel(0.3, 0.6)), erreur: "surRayonHorsVerticale" },
      { position: surRayon(randomReel(1.4, 1.8)), erreur: "surRayonHorsVerticale" },
      { position: surRayon(randomReel(2, 2.6)), erreur: "surRayonHorsVerticale" },
    ];
    const distracteurs2 = choisirDistracteurs(couples[1], pool2, ombre, (p) => projeter2D(p).y, (c) => surMur(c.position) && Math.abs(c.position.z - zM) > 0.4);
    if (!distracteurs2) continue;
    const candidats1 = versCandidats(piedMur, distracteurs1);
    const candidats2 = versCandidats(ombre, distracteurs2);

    const tous = [...candidats1, ...candidats2].map((c) => c.position);
    const hautMur = [{ ...coinG, z: hauteurMur }, { ...coinD, z: hauteurMur }];
    const cadrage = construireCadrage([piedLampe, base, coinG, coinD, ...candidats1.map((c) => c.position)], [lampe, sommet, ...hautMur, ...tous], yMur);
    const echelle = echellePixel(cadrage.points);
    const dessines = [piedLampe, base, lampe, sommet];
    if (!candidatsLisibles(candidats1, dessines, echelle)) continue;
    if (!candidatsLisibles(candidats2, [...dessines, piedMur], echelle)) continue;
    if (!verticalesSeparees(piedLampe, H, base, hauteur, echelle)) continue;
    if (!pointsNommesSepares([lampe, piedLampe, sommet, base, piedMur, ombre], echelle)) continue;
    // Le poteau ne cache pas les candidats du mur, ni le lampadaire.
    if (candidats2.some((c) => distancePixelSegment(c.position, base, sommet, echelle) < 14 || distancePixelSegment(c.position, piedLampe, lampe, echelle) < 14)) continue;
    if (candidats1.some((c) => distancePixelSegment(c.position, base, sommet, echelle) < 14 || distancePixelSegment(c.position, piedLampe, lampe, echelle) < 14)) continue;

    return {
      variante: "mur",
      lampe,
      piedLampe,
      poteau,
      mur,
      piedMur,
      ombre,
      ecrans: [
        { type: "point", candidats: candidats1 },
        { type: "point", candidats: candidats2 },
      ],
      cadrage,
    };
  }
  return null;
}

// ============================================================================================
// Variante `lampe` — retrouver le pied de la lampe, puis la lampe
// ============================================================================================

function construireLampe(couples: Couple[]): ExerciceOmbreLampeLampe | null {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const H = randomInt(5, 8);
    const piedLampe = sol(randomInt(-4, 4), randomInt(-4, 4));
    const lampe = { ...piedLampe, z: H };
    const a = tirerPoteau("A", [piedLampe], 3, H);
    if (!a) continue;
    const b = tirerPoteau("B", [piedLampe, a.base], 3, H);
    if (!b) continue;
    const sa = sommetPoteau(a);
    const sb = sommetPoteau(b);
    const oa = ombreParLampe(lampe, sa);
    const ob = ombreParLampe(lampe, sb);
    const la = longueurSol(soustraire3D(oa, a.base));
    const lb = longueurSol(soustraire3D(ob, b.base));
    if (la < 1.5 || la > 7 || lb < 1.5 || lb > 7) continue;
    const ua = soustraire3D(a.base, piedLampe);
    const ub = soustraire3D(b.base, piedLampe);
    const angle = angleSol(ua, ub);
    if (angle < 40 || angle > 140) continue;
    const angleTraces = ecartAngulaireEcran(ua, ub);
    if (angleTraces < 30 || angleTraces > 150) continue;
    if (ecartAngulaireEcran(soustraire3D(sa, oa), soustraire3D(sb, ob)) < 20) continue;

    // Écran 1 — pied de la lampe.
    const surTrace = (p: Piquet, f: number) => additionner3D(p.base, multiplierScalaire3D(soustraire3D(piedLampe, p.base), f));
    const pool1: CandidatBrut[] = [{ position: imageSurSol(lampe), erreur: "imageLampe" }];
    const q1 = intersectionImages(oa, sa, ob, b.base);
    if (q1) pool1.push({ position: solDepuisImage(q1), erreur: "rayonPourTrace" });
    const q2 = intersectionImages(oa, a.base, ob, sb);
    if (q2) pool1.push({ position: solDepuisImage(q2), erreur: "rayonPourTrace" });
    // Ombres échangées : prolongements des droites qui joignent A′ au pied de B et B′ au pied de A.
    const q3 = intersectionImages(oa, b.base, ob, a.base);
    if (q3) pool1.push({ position: solDepuisImage(q3), erreur: "ombresEchangees" });
    const fabriquePool1 = (): CandidatBrut[] => [
      ...pool1,
      { position: surTrace(a, randomReel(0.4, 0.65)), erreur: "surUneTraceSeulement" },
      { position: surTrace(a, randomReel(1.4, 1.7)), erreur: "surUneTraceSeulement" },
      { position: surTrace(b, randomReel(0.4, 0.65)), erreur: "surUneTraceSeulement" },
      { position: surTrace(b, randomReel(1.4, 1.7)), erreur: "surUneTraceSeulement" },
    ];
    const milieuPieds = multiplierScalaire3D(additionner3D(a.base, b.base), 0.5);
    const distracteurs1 = choisirDistracteurs(couples[0], fabriquePool1, piedLampe, distanceDessin(milieuPieds), (c) => distanceDessin(piedLampe)(c.position) < 9, "imageLampe");
    if (!distracteurs1) continue;

    // Écran 2 — la lampe.
    const surRayon = (o: Point3D, f: number) => additionner3D(o, multiplierScalaire3D(soustraire3D(lampe, o), f));
    const pool2: CandidatBrut[] = [];
    // Rayons échangés (A′ avec le sommet de B, B′ avec le sommet de A) : point du dessin placé à la
    // hauteur de la lampe pour le cadrage (seule son image compte).
    const q4 = intersectionImages(oa, sb, ob, sa);
    if (q4) {
      const y = (q4.y - H) / (Math.cos(Math.PI / 4) * 0.5);
      pool2.push({ position: { x: q4.x - (q4.y - H), y, z: H }, erreur: "ombresEchangees" });
    }
    const fabriquePool2 = (): CandidatBrut[] => [
      ...pool2,
      { position: { ...piedLampe, z: H * randomReel(0.5, 0.7) }, erreur: "verticaleTropBas" },
      { position: { ...piedLampe, z: H * randomReel(1.3, 1.5) }, erreur: "verticaleTropHaut" },
      { position: surRayon(oa, randomReel(0.62, 0.8)), erreur: "surUnRayonSeulement" },
      { position: surRayon(oa, randomReel(1.18, 1.35)), erreur: "surUnRayonSeulement" },
      { position: surRayon(ob, randomReel(0.62, 0.8)), erreur: "surUnRayonSeulement" },
      { position: surRayon(ob, randomReel(1.18, 1.35)), erreur: "surUnRayonSeulement" },
    ];
    // Un candidat « sur un rayon » doit rester au-dessus du sommet de son poteau.
    const distracteurs2 = choisirDistracteurs(couples[1], fabriquePool2, lampe, distanceDessin(piedLampe), (c) => c.position.z > Math.max(a.hauteur, b.hauteur) * 0.6 && distanceDessin(lampe)(c.position) < H);
    if (!distracteurs2) continue;
    const candidats1 = versCandidats(piedLampe, distracteurs1);
    const candidats2 = versCandidats(lampe, distracteurs2);

    // Le leurre « image de la lampe » est un point du sol lointain dessiné là où serait la lampe : il
    // entre dans le cadre par son image, pas dans le rectangle du sol.
    const auSol = candidats1.filter((c) => c.erreur !== "imageLampe").map((c) => c.position);
    const cadrage = construireCadrage([a.base, b.base, oa, ob, piedLampe, ...auSol], [sa, sb, lampe, ...candidats1.map((c) => c.position), ...candidats2.map((c) => c.position)]);
    const echelle = echellePixel(cadrage.points);
    const dessines = [a.base, b.base, oa, ob, sa, sb];
    if (!candidatsLisibles(candidats1, dessines, echelle)) continue;
    if (!candidatsLisibles(candidats2, [...dessines, piedLampe], echelle)) continue;
    if (!verticalesSeparees(a.base, a.hauteur, b.base, b.hauteur, echelle)) continue;
    if (!pointsNommesSepares([sa, sb, oa, ob, a.base, b.base], echelle)) continue;
    if (!pointsNommesSepares([piedLampe, lampe, sa, sb, oa, ob, a.base, b.base], echelle, 22)) continue;
    // Les candidats ne tombent ni sur un poteau ni sur une ombre tracée.
    const segments: [Point3D, Point3D][] = [
      [a.base, sa],
      [b.base, sb],
      [a.base, oa],
      [b.base, ob],
    ];
    if ([...candidats1, ...candidats2].some((c) => segments.some(([p, q]) => distancePixelSegment(c.position, p, q, echelle) < 12))) continue;
    if (distancePixelSegment(b.base, a.base, oa, echelle) < 14 || distancePixelSegment(a.base, b.base, ob, echelle) < 14) continue;

    return {
      variante: "lampe",
      lampe,
      piedLampe,
      poteaux: [a, b],
      ombres: [oa, ob],
      ecrans: [
        { type: "point", candidats: candidats1 },
        { type: "point", candidats: candidats2 },
      ],
      cadrage,
    };
  }
  return null;
}

// --- Catalogue de variantes ---------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteOmbreLampe; label: string }[] = [
  { id: "poteau", label: "Ombre d'un poteau" },
  { id: "cube", label: "Ombre d'un cube ou d'un pavé" },
  { id: "mur", label: "Ombre sur le sol puis sur un mur" },
  { id: "lampe", label: "Retrouver la lampe" },
];

function construireAvecCouples(id: VarianteOmbreLampe, couples: Couple[]): ExerciceOmbreLampe | null {
  if (id === "poteau") return construirePoteau(couples);
  if (id === "cube") return construireCube(couples);
  if (id === "mur") return construireMur(couples);
  return construireLampe(couples);
}

export function construireAvecVariante(id: string): ExerciceOmbreLampe {
  const variante = (CATALOGUE_VARIANTES.find((v) => v.id === id) ?? CATALOGUE_VARIANTES[3]).id;
  const [c1, c2] = COUPLES_PAR_ECRAN[variante];
  const exercice = construireAvecCouples(variante, [choisir(c1), choisir(c2)]);
  if (exercice) return exercice;
  // Filet de sécurité (jamais observé sur les mesures) : rangs libres plutôt qu'une exception.
  const libre = construireAvecCouples(variante, [[-1, -1], [-1, -1]]);
  if (!libre) throw new Error(`gen106 : aucune instance valide pour la variante ${variante}`);
  return libre;
}

export function genererExerciceOmbreLampe(): ExerciceOmbreLampe {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
