import type { PointExtraSolide3D, SegmentExtraSolide3D } from "../components/Solide3DSketch";
import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type { CadrageScene, Piquet } from "../core/ombreSoleil.types";
import type { CandidatLampe, ErreurOmbreLampe, ExerciceOmbreLampe, ExerciceOmbreLampeCube } from "../core/ombreLampe.types";
import { additionner3D, multiplierScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { aretesObstacle, COULEURS_OMBRE, dessinDirection, dessinPoint, fusionner, libellePoint } from "./formatOmbreSoleil";
import type { ElementsCroquis, EtatCandidat } from "./formatOmbreSoleil";
import { projeterPoint3D } from "./projectionCavaliere";

/**
 * Présentation — gen106 « Ombre à la lampe : projection centrale ». Même mécanique d'écran que gen41
 * (`ui/formatOmbreSoleil.ts`, composant `ChoixCandidatsOmbre`) : la scène entière est dessinée en
 * points/segments annexes de `Solide3DSketch` (le solide passé ne sert qu'au cadrage, figé à la
 * génération) ; les 4 candidats sont dessinés en même temps, numérotés dans un ordre mélangé à
 * chaque écran. Couleurs : lampadaire violet, mur brun, objets gris foncé, données grises, réponses
 * trouvées en vert, aides en rose.
 */

export const COULEURS_LAMPE = {
  lampe: "#7048e8",
  mur: "#a0522d",
} as const;

export type { ElementsCroquis };

export function sommetPoteau(p: Piquet): Point3D {
  return { x: p.base.x, y: p.base.y, z: p.hauteur };
}



/** Solide transmis à `Solide3DSketch` : seulement les points du cadrage (aucune face). */
export function solidePourAffichage(e: ExerciceOmbreLampe): Solide3D {
  const sommets: Record<string, Point3D> = {};
  e.cadrage.points.forEach((p, i) => {
    sommets[`cadrage${i}`] = p;
  });
  return { id: "cube", label: "", sommets, faces: [] };
}

// --- Briques de la scène ----------------------------------------------------------------------------

function elementsSol(cadrage: CadrageScene): ElementsCroquis {
  const s = cadrage.sol;
  return { points: [], segments: s.map((a, i) => ({ a, b: s[(i + 1) % 4], couleur: COULEURS_OMBRE.sol })) };
}

function point(position: Point3D, label: string, couleur: string, extra: Partial<PointExtraSolide3D> = {}): PointExtraSolide3D {
  return { position, label, couleur, ...extra };
}

function segment(a: Point3D, b: Point3D, couleur: string, pointille = false): SegmentExtraSolide3D {
  return { a, b, couleur, pointille };
}

/** Le lampadaire : mât du pied L₀ à la lampe L. */
export function elementsLampadaire(lampe: Point3D, piedLampe: Point3D, couleur: string = COULEURS_LAMPE.lampe): ElementsCroquis {
  return {
    points: [point(lampe, "L", couleur), point(piedLampe, "L₀", couleur, { rayon: 4, decalageLabel: { x: -14, y: 6 } })],
    segments: [segment(piedLampe, lampe, couleur)],
  };
}

function elementsPoteau(p: Piquet, couleur: string = COULEURS_OMBRE.baton): ElementsCroquis {
  return { points: [point(sommetPoteau(p), p.id, couleur)], segments: [segment(p.base, sommetPoteau(p), couleur)] };
}

/** Ombre DONNÉE d'un poteau : segment au sol du pied à l'ombre, ombre nommée, et (si la lampe est
 * connue) le rayon en pointillé. */
function elementsOmbreDonnee(p: Piquet, ombre: Point3D, lampe: Point3D | null): ElementsCroquis {
  const c = COULEURS_OMBRE.exemple;
  return {
    points: [point(ombre, `${p.id}′`, c)],
    segments: [segment(p.base, ombre, c), ...(lampe ? [segment(lampe, ombre, c, true)] : [])],
  };
}

function elementsMur(e: Extract<ExerciceOmbreLampe, { variante: "mur" }>): ElementsCroquis {
  const { y, xMin, xMax, hauteur } = e.mur;
  const coins = [
    { x: xMin, y, z: 0 },
    { x: xMax, y, z: 0 },
    { x: xMax, y, z: hauteur },
    { x: xMin, y, z: hauteur },
  ];
  const c = COULEURS_LAMPE.mur;
  return { points: [], segments: coins.map((a, i) => segment(a, coins[(i + 1) % 4], c)) };
}

/** Sommets nommés du pavé (petits disques), étiquettes écartées du centre du dessin. */
function etiquettesBoite(e: ExerciceOmbreLampeCube): ElementsCroquis {
  const sommets = e.boite.solide.sommets;
  const images = Object.values(sommets).map(projeterPoint3D);
  const cx = images.reduce((s, p) => s + p.x, 0) / images.length;
  const cy = images.reduce((s, p) => s + p.y, 0) / images.length;
  return {
    points: Object.entries(sommets).map(([nom, p]) => {
      const q = projeterPoint3D(p);
      const l = Math.hypot(q.x - cx, q.y - cy) || 1;
      return point(p, nom, COULEURS_OMBRE.arete, { rayon: 2.5, decalageLabel: { x: ((q.x - cx) / l) * 13, y: (-(q.y - cy) / l) * 13 } });
    }),
    segments: [],
  };
}

function elementsBoite(e: ExerciceOmbreLampeCube): ElementsCroquis {
  return fusionner({ points: [], segments: aretesObstacle(e.boite) }, etiquettesBoite(e));
}

/** Ombre trouvée d'un point (vert) : point nommé et, éventuellement, rayon en pointillé. */
function elementsTrouve(position: Point3D, label: string, rayonDepuis: Point3D | null): ElementsCroquis {
  const c = COULEURS_OMBRE.correct;
  return { points: [point(position, label, c)], segments: rayonDepuis ? [segment(rayonDepuis, position, c, true)] : [] };
}

/** Fond de l'écran `ecran` (0 ou 1) : tout ce qui ne dépend pas des candidats. Sur l'écran 1, la
 * réponse de l'écran 0 est rappelée (en gris ou en vert). */
export function elementsScene(e: ExerciceOmbreLampe, ecran: 0 | 1 | null = null): ElementsCroquis {
  const fond = elementsSol(e.cadrage);
  if (e.variante === "poteau") {
    const base = fusionner(fond, elementsLampadaire(e.lampe, e.piedLampe), elementsPoteau(e.exemple, COULEURS_OMBRE.exemple), elementsOmbreDonnee(e.exemple, e.ombreExemple, e.lampe), elementsPoteau(e.poteau));
    if (ecran !== 1) return base;
    const vraie = e.ecrans[0].candidats.find((c) => c.erreur === "aucune")!;
    return fusionner(base, { points: [], segments: [segment(e.poteau.base, vraie.position, COULEURS_OMBRE.exemple, true)] });
  }
  if (e.variante === "cube") {
    const base = fusionner(fond, elementsBoite(e), elementsLampadaire(e.lampe, e.piedLampe));
    if (ecran !== 1) return base;
    const s = e.projetes[0];
    return fusionner(base, elementsTrouve(s.ombre, `${s.id}′`, e.lampe));
  }
  if (e.variante === "mur") {
    const base = fusionner(fond, elementsMur(e), elementsLampadaire(e.lampe, e.piedLampe), elementsPoteau(e.poteau));
    if (ecran !== 1) return base;
    return fusionner(base, elementsTrouve(e.piedMur, "M", null), { points: [], segments: [segment(e.poteau.base, e.piedMur, COULEURS_OMBRE.correct)] });
  }
  const [a, b] = e.poteaux;
  const base = fusionner(fond, elementsPoteau(a), elementsPoteau(b), elementsOmbreDonnee(a, e.ombres[0], null), elementsOmbreDonnee(b, e.ombres[1], null));
  if (ecran !== 1) return base;
  return fusionner(base, { points: [point(e.piedLampe, "L₀", COULEURS_OMBRE.correct, { decalageLabel: { x: -14, y: 6 } })], segments: [] });
}

// --- Candidats ----------------------------------------------------------------------------------------

export function dessinCandidat(e: ExerciceOmbreLampe, ecran: 0 | 1, c: CandidatLampe, numero: number, etat: EtatCandidat): ElementsCroquis {
  const ec = e.ecrans[ecran];
  if (ec.type === "direction") return dessinDirection(ec.origine!, { id: c.id, vecteur: c.position, extremiteApercu: c.position }, numero, etat);
  return dessinPoint(c.position, numero, etat);
}

export function libelleCandidat(e: ExerciceOmbreLampe, ecran: 0 | 1): (numero: number) => string {
  return e.ecrans[ecran].type === "direction" ? (n) => `Demi-droite ${n}` : libellePoint;
}

export function candidatCorrect(e: ExerciceOmbreLampe, ecran: 0 | 1): CandidatLampe {
  return e.ecrans[ecran].candidats.find((c) => c.erreur === "aucune")!;
}

// --- Prolongements (aides et corrigés) ----------------------------------------------------------------

/** Demi-droite du sol issue de `a`, passant par `b`, prolongée jusqu'au bord du sol dessiné. */
export function prolongementSol(a: Point3D, b: Point3D, cadrage: CadrageScene, couleur: string, pointille = true): SegmentExtraSolide3D {
  const xs = cadrage.sol.map((p) => p.x);
  const ys = cadrage.sol.map((p) => p.y);
  const [xMin, xMax, yMin, yMax] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const d = soustraire3D(b, a);
  let tMax = Infinity;
  if (d.x > 1e-9) tMax = Math.min(tMax, (xMax - a.x) / d.x);
  if (d.x < -1e-9) tMax = Math.min(tMax, (xMin - a.x) / d.x);
  if (d.y > 1e-9) tMax = Math.min(tMax, (yMax - a.y) / d.y);
  if (d.y < -1e-9) tMax = Math.min(tMax, (yMin - a.y) / d.y);
  if (!Number.isFinite(tMax) || tMax < 1) tMax = 1;
  return segment(a, additionner3D(a, multiplierScalaire3D(d, tMax)), couleur, pointille);
}

/** Droite de l'espace issue de `a`, passant par `b`, prolongée jusqu'au paramètre `t`. */
function prolongement(a: Point3D, b: Point3D, t: number, couleur: string): SegmentExtraSolide3D {
  return segment(a, additionner3D(a, multiplierScalaire3D(soustraire3D(b, a), t)), couleur, true);
}

// --- Textes --------------------------------------------------------------------------------------------

export function contexte(e: ExerciceOmbreLampe): string {
  if (e.variante === "poteau") {
    return "Un lampadaire éclaire deux poteaux verticaux : sa lampe L est au sommet du mât, dont le pied L₀ est sur le sol. L'ombre du poteau E est déjà tracée (rayon en pointillé, ombre au sol jusqu'à E′).";
  }
  if (e.variante === "cube") {
    return `Un lampadaire éclaire un ${e.estCube ? "cube" : "pavé"} ABCDEFGH posé sur le sol : sa lampe L est au sommet du mât, dont le pied L₀ est sur le sol.`;
  }
  if (e.variante === "mur") {
    return "Un lampadaire (lampe L au sommet du mât, pied L₀ sur le sol) éclaire le poteau vertical A. Derrière le poteau se dresse un mur vertical (en brun).";
  }
  return "Une même lampe éclaire les poteaux verticaux A et B, mais elle n'est pas dessinée. Les ombres des deux poteaux sont tracées sur le sol, de leur pied jusqu'à A′ et jusqu'à B′.";
}

export function titresEcrans(e: ExerciceOmbreLampe): [string, string] {
  if (e.variante === "poteau") return ["Demi-droite de l'ombre", "Ombre du sommet"];
  if (e.variante === "cube") return [`Ombre de ${e.projetes[0].id}`, `Ombre de ${e.projetes[1].id}`];
  if (e.variante === "mur") return ["Pied du mur", "Ombre sur le mur"];
  return ["Pied de la lampe", "La lampe"];
}

export function consigneEcran(e: ExerciceOmbreLampe, ecran: 0 | 1): string {
  if (e.variante === "poteau") {
    return ecran === 0
      ? "Choisis la demi-droite du sol, issue du pied de A, qui porte l'ombre du poteau A."
      : "La demi-droite de l'ombre est rappelée en gris pointillé. Choisis le point A′ où tombe l'ombre du sommet de A.";
  }
  if (e.variante === "cube") {
    const [s1, s2] = e.projetes;
    return ecran === 0 ? `Choisis le point ${s1.id}′ où tombe l'ombre du sommet ${s1.id}.` : `L'ombre ${s1.id}′ est trouvée (en vert). Choisis le point ${s2.id}′ où tombe l'ombre du sommet ${s2.id}.`;
  }
  if (e.variante === "mur") {
    return ecran === 0
      ? "Sur le sol, l'ombre du poteau A va jusqu'au pied du mur. Choisis le point M où elle l'atteint."
      : "Ensuite, l'ombre monte sur le mur. Choisis le point A′ où s'arrête l'ombre du sommet de A.";
  }
  return ecran === 0 ? "Choisis le point L₀ du sol situé juste sous la lampe (le pied de la lampe)." : "Le pied L₀ de la lampe est trouvé (en vert). Choisis le point L où se trouve la lampe.";
}

export interface AideOmbreLampe {
  texte: string;
  dessin?: ElementsCroquis;
}

/** Deux niveaux d'aide par écran : la méthode, puis UNE des deux droites de la construction dessinée
 * en rose — l'autre reste à tracer, l'aide ne donne jamais la réponse. */
export function aidesEcran(e: ExerciceOmbreLampe, ecran: 0 | 1): AideOmbreLampe[] {
  const rose = COULEURS_OMBRE.aide;
  if (e.variante === "poteau") {
    if (ecran === 0) {
      return [
        {
          texte:
            "Méthode : une lampe éclaire depuis un point, ses rayons ne sont pas parallèles. Le rayon qui passe par le sommet d'un poteau vertical reste dans le plan vertical qui contient le poteau et le mât de la lampe : sur le sol, l'ombre du poteau est sur la droite qui joint le pied L₀ de la lampe au pied du poteau, du côté opposé à la lampe.",
        },
        { texte: "Vérifie sur le poteau E : son ombre est portée par la droite qui part de L₀ et passe par le pied de E (tracée en rose). Fais de même pour le poteau A.", dessin: { points: [], segments: [prolongementSol(e.piedLampe, e.exemple.base, e.cadrage, rose)] } },
      ];
    }
    const sommet = sommetPoteau(e.poteau);
    return [
      { texte: "Méthode : l'ombre A′ du sommet est à l'intersection de deux droites : le rayon qui part de la lampe L et passe par le sommet de A, et la trace au sol qui part de L₀ et passe par le pied de A." },
      { texte: "Le rayon issu de L qui passe par le sommet de A est tracé en rose. Parmi les points qui sont sur lui, A′ est celui qui est aussi sur la trace au sol.", dessin: { points: [], segments: [prolongement(e.lampe, sommet, (1.4 * e.lampe.z) / (e.lampe.z - e.poteau.hauteur), rose)] } },
    ];
  }
  if (e.variante === "cube") {
    const s = e.projetes[ecran];
    const pied = e.boite.solide.sommets[s.idPied];
    return [
      { texte: `Méthode : l'ombre de ${s.id} est à l'intersection du rayon qui part de L et passe par ${s.id}, et de la trace au sol qui part de L₀ et passe par le pied de ${s.id} (le sommet ${s.idPied}, juste en dessous).` },
      { texte: `La trace au sol qui part de L₀ et passe par ${s.idPied} est tracée en rose. Sur elle, ${s.id}′ est le point qui est aussi sur le rayon issu de L qui passe par ${s.id}.`, dessin: { points: [], segments: [prolongementSol(e.piedLampe, pied, e.cadrage, rose)] } },
    ];
  }
  if (e.variante === "mur") {
    if (ecran === 0) {
      return [
        { texte: "Méthode : sur le sol, l'ombre du poteau part de son pied, sur la droite qui joint le pied L₀ de la lampe au pied du poteau, du côté opposé à la lampe. Elle s'arrête là où cette droite rencontre le pied du mur." },
        { texte: "Le début de cette droite, de L₀ jusqu'au pied de A, est tracé en rose : prolonge-le jusqu'au pied du mur.", dessin: { points: [], segments: [segment(e.piedLampe, e.poteau.base, rose, true)] } },
      ];
    }
    return [
      {
        texte:
          "Méthode : le mur est vertical, et le plan qui contient le poteau et la lampe aussi : ils se coupent suivant une droite verticale qui part de M. L'ombre du sommet de A est sur cette verticale, et sur le rayon qui part de L et passe par le sommet de A.",
      },
      { texte: "La verticale du mur qui part de M est tracée en rose. Sur elle, A′ est le point qui est aussi sur le rayon issu de L qui passe par le sommet de A.", dessin: { points: [], segments: [segment(e.piedMur, { ...e.piedMur, z: e.mur.hauteur }, rose, true)] } },
    ];
  }
  const [a] = e.poteaux;
  if (ecran === 0) {
    return [
      { texte: "Méthode : avec une lampe, la droite qui porte l'ombre d'un poteau vertical passe par le pied de la lampe. Prolonge chaque ombre au-delà du pied de son poteau : le pied L₀ de la lampe est le point où ces deux droites se coupent." },
      { texte: "L'ombre de A est prolongée en rose, au-delà du pied de A. Le pied de la lampe est sur cette droite : cherche où la coupe le prolongement de l'ombre de B.", dessin: { points: [], segments: [prolongementSol(e.ombres[0], a.base, e.cadrage, rose)] } },
    ];
  }
  return [
    { texte: "Méthode : chaque rayon part de la lampe, passe par le sommet d'un poteau et arrive à l'ombre de ce sommet. La lampe est donc sur la droite qui joint A′ au sommet de A, sur celle qui joint B′ au sommet de B, et à la verticale de L₀." },
    { texte: "Le rayon qui passe par A′ et par le sommet de A est prolongé en rose. La lampe est sur lui, à la verticale de L₀.", dessin: { points: [], segments: [prolongement(e.ombres[0], sommetPoteau(a), (1.4 * e.lampe.z) / a.hauteur, rose)] } },
  ];
}

const MESSAGES: Record<Exclude<ErreurOmbreLampe, "aucune">, string> = {
  paralleleExemple: "Cette demi-droite est parallèle à l'ombre de E : c'est ce qui se passerait au soleil. Avec une lampe, les ombres ne sont pas parallèles, leurs droites passent toutes par le pied L₀ de la lampe.",
  versLampe: "Cette demi-droite part vers la lampe : l'ombre est toujours du côté opposé à la lampe.",
  depuisLampe: "Cette demi-droite prolonge le trait qui part de la lampe L dessinée. La trace au sol part du pied L₀ de la lampe, pas de la lampe elle-même.",
  depuisPiedExemple: "Cette demi-droite part du pied de E : la trace au sol de l'ombre de A part du pied L₀ de la lampe.",
  versAutrePoteau: "Cette demi-droite va vers le poteau E : l'ombre de A ne dépend pas de E, elle est sur la droite qui joint L₀ au pied de A, du côté opposé à la lampe.",
  verticaleDessin: "Cette demi-droite descend tout droit sur le dessin : c'est la confusion avec la verticale. L'ombre au sol est sur la droite qui joint L₀ au pied de A.",
  traceTropCourte: "Ce point est sur la trace au sol, mais pas sur le rayon issu de L : cette ombre est trop courte.",
  traceTropLongue: "Ce point est sur la trace au sol, mais pas sur le rayon issu de L : cette ombre est trop longue.",
  surRayonSansTrace: "Sur le dessin, ce point est sur le rayon issu de L, mais il n'est pas sur la trace au sol qui part de L₀ : à cet endroit, le rayon n'a pas encore atteint le sol (ou l'a déjà traversé).",
  rayonParallele: "Ce point est obtenu avec un rayon parallèle à un autre rayon, comme au soleil. Les rayons d'une lampe ne sont pas parallèles : ils partent tous de L.",
  mauvaisPied: "Ce point est sur le rayon, mais sur une trace au sol qui passe par le pied d'un autre sommet. La trace part de L₀ et passe par le sommet situé juste en dessous.",
  ombreCoteLampe: "Ce point est du côté de la lampe : l'ombre est toujours du côté opposé à la lampe.",
  perpendiculaire: "Ce point est droit derrière le poteau : la trace au sol ne va pas droit vers le mur, elle prolonge la droite qui joint L₀ au pied du poteau.",
  traceParSommet: "Ce point prolonge, sur le dessin, la droite qui joint L₀ au sommet de A. La trace au sol joint L₀ au pied de A.",
  depuisLampeMur: "Ce point est sur le trait qui joint la lampe L dessinée au pied de A. La trace au sol part du pied L₀ de la lampe.",
  coteOppose: "Ce point est du mauvais côté : la trace au sol prolonge la droite qui joint L₀ au pied du poteau.",
  rayonAuPiedMur: "Ce point est là où, sur le dessin, le rayon issu de L atteint le pied du mur. Mais le rayon est en l'air : sur le sol, c'est la trace qui part de L₀ et passe par le pied de A qui mène au pied du mur.",
  traceTropOblique: "Ce point n'est pas sur la droite qui joint L₀ au pied de A : la trace au sol a été tracée trop inclinée. Prolonge exactement la droite qui part de L₀ et passe par le pied de A.",
  derriereMemeHauteur: "Ce point est juste derrière le poteau, à sa hauteur : l'ombre ne recopie pas le poteau sur le mur, elle suit la trace au sol jusqu'à M puis monte jusqu'au rayon issu de L.",
  ombresEchangees: "Ce point associe chaque ombre au mauvais poteau : l'ombre A′ va avec le poteau A, l'ombre B′ avec le poteau B.",
  tropBas: "Ce point est bien à la verticale de M, mais il n'est pas sur le rayon issu de L qui passe par le sommet de A : il est trop bas.",
  tropHaut: "Ce point est bien à la verticale de M, mais il n'est pas sur le rayon issu de L qui passe par le sommet de A : il est trop haut.",
  hauteurPoteau: "Ce point est à la hauteur du poteau : l'ombre ne garde pas la hauteur de l'objet, elle s'arrête sur le rayon issu de L.",
  surRayonHorsVerticale: "Sur le dessin, ce point est sur le rayon issu de L, mais il n'est pas à la verticale de M : sur le mur, l'ombre monte verticalement depuis M.",
  imageLampe: "Ce point du sol est à l'endroit du dessin où serait la lampe. Le pied de la lampe est sur le sol, là où se coupent les prolongements des deux ombres.",
  surUneTraceSeulement: "Ce point n'est que sur le prolongement d'une des deux ombres : le pied de la lampe est sur les deux.",
  rayonPourTrace: "Ce point utilise une droite qui passe par le sommet d'un poteau. Sur le sol, on prolonge les ombres, qui partent des pieds des poteaux.",
  verticaleTropBas: "Ce point est à la verticale de L₀, mais il n'est pas sur les rayons qui passent par les sommets des poteaux : il est trop bas.",
  verticaleTropHaut: "Ce point est à la verticale de L₀, mais il n'est pas sur les rayons qui passent par les sommets des poteaux : il est trop haut.",
  surUnRayonSeulement: "Ce point n'est que sur un des deux rayons, et il n'est pas à la verticale de L₀.",
};

export function messageErreur(erreur: ErreurOmbreLampe): string {
  return erreur === "aucune" ? "" : MESSAGES[erreur];
}

// --- Conclusion -----------------------------------------------------------------------------------

export function texteConclusion(e: ExerciceOmbreLampe): string {
  if (e.variante === "poteau") {
    return "L'ombre du poteau A va de son pied jusqu'à A′, sur la droite qui joint L₀ au pied de A ; A′ est sur le rayon issu de L. Les ombres de E et de A ne sont pas parallèles : leurs droites se coupent au pied L₀ de la lampe.";
  }
  if (e.variante === "cube") {
    return `L'ombre du ${e.estCube ? "cube" : "pavé"} est reconstituée : son contour relie la base aux ombres des sommets du haut. Les ombres des autres sommets s'obtiennent par le même procédé.`;
  }
  if (e.variante === "mur") {
    return "L'ombre du poteau A suit le sol jusqu'au pied M du mur, puis monte verticalement sur le mur jusqu'à A′, sur le rayon issu de L qui passe par le sommet de A.";
  }
  return "Les prolongements des deux ombres se coupent au pied L₀ de la lampe ; les rayons qui joignent A′ au sommet de A et B′ au sommet de B se coupent en L, à la verticale de L₀.";
}

/** Image finale (écran de conclusion et corrigé). */
export function elementsConclusion(e: ExerciceOmbreLampe): ElementsCroquis {
  const vert = COULEURS_OMBRE.correct;
  const violet = COULEURS_LAMPE.lampe;
  if (e.variante === "poteau") {
    return fusionner(
      elementsScene(e),
      { points: [], segments: [prolongementSol(e.piedLampe, e.exemple.base, e.cadrage, violet), prolongementSol(e.piedLampe, e.poteau.base, e.cadrage, violet)] },
      elementsTrouve(e.ombre, "A′", e.lampe),
      { points: [], segments: [segment(e.poteau.base, e.ombre, vert)] },
    );
  }
  if (e.variante === "cube") {
    const visibles = [...e.projetes, ...e.autres.filter((s) => e.contour.includes(s.ombre))];
    const contour = e.contour;
    return fusionner(
      elementsScene(e),
      ...e.projetes.map((s) => elementsTrouve(s.ombre, `${s.id}′`, e.lampe)),
      ...visibles.filter((s) => !e.projetes.includes(s)).map((s) => elementsTrouve(s.ombre, `${s.id}′`, null)),
      { points: [], segments: contour.map((a, i) => segment(a, contour[(i + 1) % contour.length], vert)) },
    );
  }
  if (e.variante === "mur") {
    return fusionner(
      elementsScene(e),
      elementsTrouve(e.piedMur, "M", null),
      elementsTrouve(e.ombre, "A′", e.lampe),
      { points: [], segments: [segment(e.poteau.base, e.piedMur, vert), segment(e.piedMur, e.ombre, vert), segment(e.piedLampe, e.poteau.base, violet, true)] },
    );
  }
  return fusionner(
    elementsScene(e),
    {
      points: [],
      segments: [
        segment(e.ombres[0], e.piedLampe, violet, true),
        segment(e.ombres[1], e.piedLampe, violet, true),
        segment(e.ombres[0], e.lampe, violet, true),
        segment(e.ombres[1], e.lampe, violet, true),
      ],
    },
    elementsLampadaire(e.lampe, e.piedLampe, vert),
  );
}


