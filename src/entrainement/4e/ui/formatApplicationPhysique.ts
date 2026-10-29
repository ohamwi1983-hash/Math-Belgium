/**
 * Présentation pure — "Applications physiques (résultante de vecteurs)" (chapitre "Calcul
 * vectoriel", huitième générateur).
 */
import type { ContexteApplicationPhysique, ExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import type { Composantes, Point } from "../core/vecteur.types";
import type { EtatSessionApplicationPhysique } from "../moteur/typesApplicationPhysique";
import type { FragmentConsigne } from "./formatEquationDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { nombreFr, nombreFrLatex } from "./nombreFr";
import { calculerViewBoxVecteurs } from "./vecteurGraph";

export type { FragmentConsigne };

/** Même patron que les autres modules `format*.ts` du chapitre 6 — dupliqué plutôt que partagé
 * (trop petit pour l'extraction, voir CLAUDE.md). */
function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export interface VecteursSchemaApplicationPhysique {
  /** v1, en direction plein Nord depuis l'origine. */
  v1: Composantes;
  /** v2, depuis la même origine que v1 (règle du parallélogramme). */
  v2: Composantes;
  /** Résultante (v1+v2), diagonale du parallélogramme issue de l'origine. */
  resultante: Composantes;
}

/** Géométrie du schéma affiché — v1 pointe plein Nord (angle 90° au sens mathématique standard,
 * x=cos, y=sin) ; v2 fait l'angle donné par l'énoncé avec v1, du côté (Est/Ouest) tiré à la
 * génération — vers l'Est = rotation horaire (angle décroissant), vers l'Ouest = antihoraire
 * (angle croissant). Purement illustratif, jamais utilisé pour la vérification (numérique,
 * comparée à `exercice.triangle`). */
export function calculerVecteursSchema(exercice: ExerciceApplicationPhysique): VecteursSchemaApplicationPhysique {
  const ANGLE_V1 = 90;
  const signe = exercice.coteDeviation === "est" ? -1 : 1;
  const angleV2 = ANGLE_V1 + signe * exercice.angleEntreVecteurs;
  const radV1 = (ANGLE_V1 * Math.PI) / 180;
  const radV2 = (angleV2 * Math.PI) / 180;

  const v1: Composantes = { x: exercice.v1 * Math.cos(radV1), y: exercice.v1 * Math.sin(radV1) };
  const v2: Composantes = { x: exercice.v2 * Math.cos(radV2), y: exercice.v2 * Math.sin(radV2) };
  return { v1, v2, resultante: { x: v1.x + v2.x, y: v1.y + v2.y } };
}

/** Largeur (px) du graphe par défaut, pour convertir en unités du schéma les tailles des
 * étiquettes (fixes en pixels) quand la largeur réelle n'est pas fournie (croquis imprimé de
 * l'export, 260 px de large) — l'écran passe la largeur réelle de son `VecteurGraph`. */
const LARGEUR_REFERENCE_PX = 260;
/** Encombrement en pixels autour de son ancrage d'une étiquette vectorielle `LabelVecteurFleche`
 * (lettre 22 px + indice + flèche au-dessus, mesuré ≈ 20 × 33 px) : ancrage = ligne de base. */
const ETIQUETTE_VECTEUR_PX = { gauche: 12, droite: 12, bas: 10, haut: 24 };
/** Demi-encombrement du « θ » (police 18 px, mesuré ≈ 11 × 18 px). */
const THETA_PX = { demiLargeur: 7, demiHauteur: 9 };
/** Rose des vents : longueur d'une branche, distance des lettres (14 px) au centre, demi-encombrement. */
const ROSE_PX = { branche: 11, lettres: 25, demiLargeur: 31, demiHauteur: 33 };
/** Jeu minimal (px) entre une étiquette et un trait, et entre deux étiquettes (plus large : deux
 * étiquettes accolées se liraient comme une seule, « F_R θ »). */
const JEU_PX = 3;
const JEU_ETIQUETTES_PX = 8;

export interface ArcAngleSchema {
  /** Points de l'arc (ou du petit carré d'angle droit), dans l'ordre, à relier en polyligne. */
  points: Point[];
  /** Position (centre) du « θ ». */
  label: Point;
}

export interface RoseDesVentsSchema {
  centre: Point;
  /** Extrémités des 4 branches (N, E, S, O). */
  branches: { N: Point; E: Point; S: Point; O: Point };
  /** Positions (centres) des 4 lettres. */
  lettres: { N: Point; E: Point; S: Point; O: Point };
}

export interface GeometrieSchemaApplicationPhysique extends VecteursSchemaApplicationPhysique {
  /** Quatrième sommet du parallélogramme (extrémité de la résultante, v1 + v2). */
  sommetOppose: Point;
  /** Côtés en pointillés : parallèle à v2 depuis l'extrémité de v1, parallèle à v1 depuis
   * l'extrémité de v2. */
  cotesPointilles: [[Point, Point], [Point, Point]];
  arc: ArcAngleSchema;
  /** Ancrages (ligne de base) des étiquettes vectorielles. */
  etiquettes: { v1: Point; v2: Point; resultante: Point };
  rose: RoseDesVentsSchema;
  /** Coins de la zone à afficher (figure, étiquettes, rose et marge), résultante comprise même
   * quand elle est masquée : la fenêtre ne bouge pas quand elle apparaît. */
  coins: [Point, Point];
}

interface Boite {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

type Segment = [Point, Point];

function boitesSeChevauchent(a: Boite, b: Boite): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** Le segment traverse-t-il la boîte ? (découpage de Liang-Barsky). */
function segmentCroiseBoite([a, b]: Segment, boite: Boite): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - boite.x0, boite.x1 - a.x, a.y - boite.y0, boite.y1 - a.y];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const t = q[i] / p[i];
    if (p[i] < 0) {
      if (t > t1) return false;
      t0 = Math.max(t0, t);
    } else {
      if (t < t0) return false;
      t1 = Math.min(t1, t);
    }
  }
  return true;
}

/** Premier candidat dont la boîte (agrandie du jeu) ne touche ni un trait ni une étiquette déjà
 * placée — le premier de la liste à défaut (jamais atteint sur les tirages réels, voir les tests
 * Playwright de la décision F3). */
function premierCandidatLibre(candidats: Point[], boiteDe: (p: Point) => Boite, traits: Segment[], occupees: Boite[], s: number): Point {
  const gonfler = (b: Boite, jeuPx: number): Boite => ({ x0: b.x0 - jeuPx * s, x1: b.x1 + jeuPx * s, y0: b.y0 - jeuPx * s, y1: b.y1 + jeuPx * s });
  for (const candidat of candidats) {
    const b = boiteDe(candidat);
    const pourTraits = gonfler(b, JEU_PX);
    const pourEtiquettes = gonfler(b, JEU_ETIQUETTES_PX);
    if (traits.some((t) => segmentCroiseBoite(t, pourTraits))) continue;
    if (occupees.some((o) => boitesSeChevauchent(o, pourEtiquettes))) continue;
    return candidat;
  }
  return candidats[0];
}

/** Candidats d'ancrage le long d'un vecteur : à chaque décalage (du plus proche au plus lointain),
 * chaque fraction de sa longueur, de chaque côté autorisé (`normales`, vecteurs unitaires). */
function candidatsLeLong(depart: Point, vecteur: Composantes, fractions: number[], normales: Composantes[], s: number): Point[] {
  const candidats: Point[] = [];
  for (let decalagePx = 4; decalagePx <= 90; decalagePx += 3) {
    for (const f of fractions) {
      for (const n of normales) {
        candidats.push({ x: depart.x + vecteur.x * f + n.x * decalagePx * s, y: depart.y + vecteur.y * f + n.y * decalagePx * s });
      }
    }
  }
  return candidats;
}

function disposerSchema(exercice: ExerciceApplicationPhysique, s: number): Omit<GeometrieSchemaApplicationPhysique, keyof VecteursSchemaApplicationPhysique> {
  const { v1, v2, resultante } = calculerVecteursSchema(exercice);
  const origine = { x: 0, y: 0 };
  const sommetOppose = { x: resultante.x, y: resultante.y };
  const cotesPointilles: [[Point, Point], [Point, Point]] = [
    [{ x: v1.x, y: v1.y }, sommetOppose],
    [{ x: v2.x, y: v2.y }, sommetOppose],
  ];
  // +1 : v2 du côté Est (x > 0), -1 : côté Ouest. v1 est vertical, la figure entière est du côté
  // de v2 : l'autre côté est libre (étiquette de v1 et rose des vents).
  const signe = exercice.coteDeviation === "est" ? 1 : -1;
  const boiteVecteur = (p: Point): Boite => ({
    x0: p.x - ETIQUETTE_VECTEUR_PX.gauche * s,
    x1: p.x + ETIQUETTE_VECTEUR_PX.droite * s,
    y0: p.y - ETIQUETTE_VECTEUR_PX.bas * s,
    y1: p.y + ETIQUETTE_VECTEUR_PX.haut * s,
  });
  const boiteTheta = (p: Point): Boite => ({
    x0: p.x - THETA_PX.demiLargeur * s,
    x1: p.x + THETA_PX.demiLargeur * s,
    y0: p.y - THETA_PX.demiHauteur * s,
    y1: p.y + THETA_PX.demiHauteur * s,
  });

  // Arc θ entre les directions de v1 (90°) et de v2, centré sur l'origine commune — jamais plus
  // long que le plus court des deux vecteurs (vent faible : v2 ne fait parfois qu'une douzaine de px).
  const longueurMin = Math.min(Math.hypot(v1.x, v1.y), Math.hypot(v2.x, v2.y));
  const rayon = Math.min(Math.max(0.3 * longueurMin, 16 * s), 30 * s, 0.7 * longueurMin);
  const theta = (exercice.angleEntreVecteurs * Math.PI) / 180;
  const angleV1 = Math.PI / 2;
  const angleV2 = angleV1 - signe * theta;
  let pointsArc: Point[];
  if (exercice.angleEntreVecteurs === 90) {
    const cote = rayon * 0.7;
    const u1 = { x: Math.cos(angleV1), y: Math.sin(angleV1) };
    const u2 = { x: Math.cos(angleV2), y: Math.sin(angleV2) };
    pointsArc = [
      { x: u1.x * cote, y: u1.y * cote },
      { x: (u1.x + u2.x) * cote, y: (u1.y + u2.y) * cote },
      { x: u2.x * cote, y: u2.y * cote },
    ];
  } else {
    const etapes = 24;
    pointsArc = Array.from({ length: etapes + 1 }, (_, i) => {
      const angle = angleV1 + ((angleV2 - angleV1) * i) / etapes;
      return { x: rayon * Math.cos(angle), y: rayon * Math.sin(angle) };
    });
  }
  const traits: Segment[] = [
    [origine, v1],
    [origine, v2],
    [origine, resultante],
    ...cotesPointilles,
    ...pointsArc.slice(1).map((p, i): Segment => [pointsArc[i], p]),
  ];

  // Étiquette de v1 : du côté libre, à l'opposé de v2.
  const etiquetteV1 = premierCandidatLibre(
    candidatsLeLong(origine, v1, [0.5, 0.4, 0.6, 0.3, 0.7], [{ x: -signe, y: 0 }], s),
    boiteVecteur,
    traits,
    [],
    s,
  );
  const occupees = [boiteVecteur(etiquetteV1)];

  // Étiquette de v2 : à l'extérieur du parallélogramme (normale opposée à son centre).
  const longueurV2 = Math.hypot(v2.x, v2.y) || 1;
  let normaleV2 = { x: -v2.y / longueurV2, y: v2.x / longueurV2 };
  if (normaleV2.x * (sommetOppose.x / 2 - v2.x / 2) + normaleV2.y * (sommetOppose.y / 2 - v2.y / 2) > 0) {
    normaleV2 = { x: -normaleV2.x, y: -normaleV2.y };
  }
  const etiquetteV2 = premierCandidatLibre(candidatsLeLong(origine, v2, [0.5, 0.6, 0.4, 0.7, 0.3], [normaleV2], s), boiteVecteur, traits, occupees, s);
  occupees.push(boiteVecteur(etiquetteV2));

  // « θ » à l'intérieur de l'angle, dans le plus large des deux secteurs que la résultante y
  // découpe (sur la bissectrice, il tomberait sur elle dès que ‖v1‖ = ‖v2‖), au-delà de l'arc.
  const deviation = Math.atan2(exercice.v2 * Math.sin(theta), exercice.v1 + exercice.v2 * Math.cos(theta));
  const angleR = angleV1 - signe * deviation;
  const milieuV1R = (angleV1 + angleR) / 2;
  const milieuRV2 = (angleR + angleV2) / 2;
  const directions = deviation > theta - deviation ? [milieuV1R, milieuRV2, (angleV1 + angleV2) / 2] : [milieuRV2, milieuV1R, (angleV1 + angleV2) / 2];
  const candidatsTheta: Point[] = [];
  for (let distancePx = 0; distancePx <= 140; distancePx += 3) {
    const d = rayon + (THETA_PX.demiHauteur + JEU_PX + distancePx) * s;
    for (const a of directions) candidatsTheta.push({ x: d * Math.cos(a), y: d * Math.sin(a) });
  }
  const labelTheta = premierCandidatLibre(candidatsTheta, boiteTheta, traits, occupees, s);
  occupees.push(boiteTheta(labelTheta));

  // Rose des vents du côté libre, en haut de la figure, au-delà de l'étiquette de v1.
  const ys = [0, v1.y, v2.y, sommetOppose.y];
  const yHaut = Math.max(...ys);
  const boiteV1 = occupees[0];
  const debordementLibre = Math.max(0, signe > 0 ? -boiteV1.x0 : boiteV1.x1);
  const centreRose = { x: -signe * (debordementLibre + (ROSE_PX.demiLargeur + 2 * JEU_PX) * s), y: yHaut - ROSE_PX.demiHauteur * s };
  const b = ROSE_PX.branche * s;
  const l = ROSE_PX.lettres * s;
  const rose: RoseDesVentsSchema = {
    centre: centreRose,
    branches: {
      N: { x: centreRose.x, y: centreRose.y + b },
      E: { x: centreRose.x + b, y: centreRose.y },
      S: { x: centreRose.x, y: centreRose.y - b },
      O: { x: centreRose.x - b, y: centreRose.y },
    },
    lettres: {
      N: { x: centreRose.x, y: centreRose.y + l },
      E: { x: centreRose.x + l, y: centreRose.y },
      S: { x: centreRose.x, y: centreRose.y - l },
      O: { x: centreRose.x - l, y: centreRose.y },
    },
  };
  const boiteRose: Boite = {
    x0: centreRose.x - ROSE_PX.demiLargeur * s,
    x1: centreRose.x + ROSE_PX.demiLargeur * s,
    y0: centreRose.y - ROSE_PX.demiHauteur * s,
    y1: centreRose.y + ROSE_PX.demiHauteur * s,
  };
  occupees.push(boiteRose);

  // Résultante (affichée seulement une fois l'écran « direction » validé) : placée maintenant,
  // pour que la fenêtre ne bouge pas à son apparition.
  const longueurR = Math.hypot(resultante.x, resultante.y) || 1;
  const normaleR = { x: -resultante.y / longueurR, y: resultante.x / longueurR };
  const versV2 = normaleR.x * v2.x + normaleR.y * v2.y > 0 ? normaleR : { x: -normaleR.x, y: -normaleR.y };
  const etiquetteR = premierCandidatLibre(
    candidatsLeLong(origine, resultante, [0.55, 0.45, 0.65, 0.35, 0.75], [versV2, { x: -versV2.x, y: -versV2.y }], s),
    boiteVecteur,
    traits,
    occupees,
    s,
  );
  occupees.push(boiteVecteur(etiquetteR));

  const xs = [0, v1.x, v2.x, sommetOppose.x, ...occupees.flatMap((o) => [o.x0, o.x1])];
  const tousY = [...ys, ...occupees.flatMap((o) => [o.y0, o.y1])];
  const marge = 8 * s;
  const coins: [Point, Point] = [
    { x: Math.min(...xs) - marge, y: Math.min(...tousY) - marge },
    { x: Math.max(...xs) + marge, y: Math.max(...tousY) + marge },
  ];

  return {
    sommetOppose,
    cotesPointilles,
    arc: { points: pointsArc, label: labelTheta },
    etiquettes: { v1: etiquetteV1, v2: etiquetteV2, resultante: etiquetteR },
    rose,
    coins,
  };
}

function unitesParPixel(coins: Point[], largeurPx: number): number {
  const viewBox = calculerViewBoxVecteurs(coins.map((point) => ({ point, label: "" })));
  return (viewBox.x[1] - viewBox.x[0]) / largeurPx;
}

/**
 * Schéma « règle du parallélogramme » (décision F3, aligné sur le cours, section application
 * physique) : v1 et v2 partent de la MÊME origine, l'angle θ de l'énoncé est marqué par un arc à
 * l'origine (petit carré si θ = 90°), le parallélogramme est esquissé en pointillés, et la
 * résultante est sa diagonale issue de l'origine. Une rose des vents est posée du côté libre de la
 * figure (côté opposé à v2 : v1 est vertical, la figure entière est du côté de v2).
 *
 * Les étiquettes ont une taille fixe en PIXELS, la figure une taille en unités de l'énoncé (un vent
 * de 20 km/h face à un avion à 300 km/h ne fait qu'une douzaine de pixels) : la disposition est donc
 * calculée à l'échelle réelle (unités par pixel, déduite de la fenêtre elle-même et de la largeur
 * `largeurPx` du graphe — deux passes
 * suffisent, la fenêtre ne grandissant qu'à peine avec les étiquettes) et chaque étiquette prend le
 * premier emplacement libre (aucun trait, aucune autre étiquette) parmi ses candidats préférés.
 */
export function geometrieSchemaApplicationPhysique(
  exercice: ExerciceApplicationPhysique,
  largeurPx: number = LARGEUR_REFERENCE_PX,
): GeometrieSchemaApplicationPhysique {
  const vecteurs = calculerVecteursSchema(exercice);
  const sommets: Point[] = [{ x: 0, y: 0 }, vecteurs.v1, vecteurs.v2, vecteurs.resultante];
  let s = unitesParPixel(sommets, largeurPx);
  let disposition = disposerSchema(exercice, s);
  for (let passe = 0; passe < 2; passe++) {
    const sSuivant = unitesParPixel(disposition.coins, largeurPx);
    if (sSuivant <= s * 1.01) break;
    s = sSuivant;
    disposition = disposerSchema(exercice, s);
  }
  return { ...vecteurs, ...disposition };
}

/** Légende du schéma : valeur de θ, rappelée sous la figure (le « θ » de l'arc reste court pour
 * tenir entre les deux vecteurs même pour θ = 30°). */
export function legendeAngleSchemaApplicationPhysique(exercice: ExerciceApplicationPhysique): string {
  return `θ = ${exercice.angleEntreVecteurs}° : angle entre les deux ${libelleGrandeurApplicationPhysique(exercice.contexte)}, depuis leur origine commune`;
}

const LIBELLES_CONTEXTE: Record<ContexteApplicationPhysique, string> = {
  avion: "Un avion dans le vent",
  helicoptere: "Un hélicoptère dans le vent",
  forces: "Deux forces sur un objet",
};

export function libelleContexteApplicationPhysique(contexte: ContexteApplicationPhysique): string {
  return LIBELLES_CONTEXTE[contexte];
}

/** Texte narratif complet, valeurs déjà interpolées — un gabarit par contexte, jamais un même
 * texte générique pour les trois (vocabulaire "vitesse propre"/cap pour les véhicules, "force"/
 * orientée pour les forces). */
export function formatEnonceApplicationPhysique(exercice: ExerciceApplicationPhysique): string {
  const coteTexte = exercice.coteDeviation === "est" ? "l'Est" : "l'Ouest";
  if (exercice.contexte === "avion") {
    return `Un avion vole cap plein Nord à une vitesse propre de ${exercice.v1} km/h. Un vent souffle à ${exercice.v2} km/h, formant un angle de ${exercice.angleEntreVecteurs}° avec la trajectoire de l'avion, en direction de ${coteTexte}.`;
  }
  if (exercice.contexte === "helicoptere") {
    return `Un hélicoptère vole cap plein Nord à une vitesse propre de ${exercice.v1} km/h. Un vent souffle à ${exercice.v2} km/h, formant un angle de ${exercice.angleEntreVecteurs}° avec sa trajectoire, en direction de ${coteTexte}.`;
  }
  return `Deux forces s'exercent sur un même objet : la première, de ${exercice.v1} N, est orientée plein Nord ; la seconde, de ${exercice.v2} N, forme un angle de ${exercice.angleEntreVecteurs}° avec elle, en direction de ${coteTexte}.`;
}

/** 4 options fixes pour l'écran "interpretation" — toujours les mêmes, une seule est correcte
 * (`exercice.directionCorrecte`), jamais mélangées différemment d'un exercice à l'autre (l'ordre
 * de présentation n'a pas besoin d'être aléatoire ici, contrairement à un multi-select). */
export const OPTIONS_DIRECTION = ["Nord-Est", "Nord-Ouest", "Sud-Est", "Sud-Ouest"] as const;

export interface NotationVecteursApplicationPhysique {
  v1: string;
  v2: string;
  resultante: string;
  normeResultante: string;
}

/**
 * Notation vectorielle (LaTeX) adaptée au contexte narratif (`promptgen29modificationscompletes.md`,
 * point 2) — $\vec{v_1}$/$\vec{v_2}$/$\vec{v_R}$ pour "avion"/"helicoptere" (vitesses),
 * $\vec{F_1}$/$\vec{F_2}$/$\vec{F_R}$ pour "forces" — jamais un nom générique indépendant du
 * contexte, jamais une lettre nue sans flèche pour désigner un vecteur.
 */
export function notationVecteursApplicationPhysique(contexte: ContexteApplicationPhysique): NotationVecteursApplicationPhysique {
  const lettre = contexte === "forces" ? "F" : "v";
  return {
    v1: `\\vec{${lettre}_1}`,
    v2: `\\vec{${lettre}_2}`,
    resultante: `\\vec{${lettre}_R}`,
    normeResultante: `\\|\\vec{${lettre}_R}\\|`,
  };
}

/** Mot narratif pluriel ("forces"/"vitesses") — même mot pour "avion" et "helicoptere". */
export function libelleGrandeurApplicationPhysique(contexte: ContexteApplicationPhysique): string {
  return contexte === "forces" ? "forces" : "vitesses";
}

/**
 * Label d'un vecteur sur le graphe Mafs — `<Text>` ne peut PAS rendre du vrai KaTeX (voir
 * CLAUDE.md). Deux essais en caractères Unicode se sont succédé, chacun confirmé cassé dans
 * l'environnement réel de l'utilisateur malgré une vérification "correcte" dans le sandbox du
 * projet : (1) le caractère combinant U+20D7 (COMBINING RIGHT ARROW ABOVE) sur la lettre de base
 * — rendu en glyphe manquant ("tofu box") ; (2) le caractère autonome U+2192 (RIGHTWARDS ARROW) en
 * préfixe — rendu correctement comme flèche, mais avec un espacement du caractère bien plus large
 * que sa lettre suivante dans la police de repli réellement utilisée par le navigateur de
 * l'utilisateur (un glyphe Unicode "exotique" peut déclencher un repli de police entier, aux
 * métriques imprévisibles) — donnant une flèche visuellement DÉTACHÉE de la lettre. La lettre "R"
 * de la résultante, en texte plein plutôt qu'en indice (aucun Unicode subscript capital R
 * n'existe), ne se lisait de plus pas comme un indice.
 *
 * Ces deux essais dépendaient tous deux d'un glyphe de police pour un rendu correct — un point
 * faible structurel du texte SVG déjà démontré deux fois sur ce seul générateur. Corrigé en
 * abandonnant TOUT caractère Unicode spécial pour ce label : `labelsGrapheApplicationPhysique` ne
 * retourne plus qu'une paire `{base, indice}` (données pures, aucun rendu) ; `VecteurGraph.tsx`
 * (`LabelVecteurFleche`) dessine désormais la flèche comme une VRAIE FORME SVG (segment + triangle,
 * geometrie fixe en pixels, aucune dépendance de police) et l'indice comme un `<tspan>` à taille de
 * police réduite avec décalage vertical (`dy`) — un indice SVG authentique, valable pour n'importe
 * quelle lettre (y compris "R"), garanti par les primitives SVG de base (`text`/`tspan`/`dy`/
 * `font-size`), jamais par la disponibilité d'un glyphe Unicode particulier dans une police
 * quelconque. Toujours jamais `\vec{}` littéral (KaTeX), réservé aux consignes/aides/révélations.
 */
export interface LabelGrapheVecteur {
  base: string;
  indice: string;
}

export interface LabelsGrapheApplicationPhysique {
  v1: LabelGrapheVecteur;
  v2: LabelGrapheVecteur;
  resultante: LabelGrapheVecteur;
}

/** Labels du graphe (point 2) — mêmes lettres que `notationVecteursApplicationPhysique`, jamais
 * "V₁"/"V₂"/"R" sans flèche comme avant correction. Données pures (`{base, indice}`) — le rendu de
 * la flèche et de l'indice est entièrement à la charge de `VecteurGraph.tsx`/`LabelVecteurFleche`. */
export function labelsGrapheApplicationPhysique(contexte: ContexteApplicationPhysique): LabelsGrapheApplicationPhysique {
  const lettre = contexte === "forces" ? "F" : "v";
  return {
    v1: { base: lettre, indice: "1" },
    v2: { base: lettre, indice: "2" },
    resultante: { base: lettre, indice: "R" },
  };
}

/** Consigne de l'écran "modelisation" (point 3) — remplace l'ancienne question générique par une
 * question nommant explicitement les deux vecteurs composants, contexte-aware. */
export function segmentsConsigneConfiguration(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, v2 } = notationVecteursApplicationPhysique(exercice.contexte);
  const grandeur = libelleGrandeurApplicationPhysique(exercice.contexte);
  return [texte(`Quel type d'angle entre les ${grandeur} `), latex(v1), texte(" et "), latex(v2), texte(" ?")];
}

/** Tolérance réellement vérifiée = `TOLERANCE_ARRONDI = 0.5` pour la norme (`diagnostiquerCalculArrondi`,
 * `verificationApplicationPhysique.ts`) — soit un arrondi à l'unité ; pour la déviation, ±1° autour
 * de la valeur recalculée avec la norme arrondie (`deviationsAcceptables`, audit chapitre 6). */
const NOTE_PRECISION_ARRONDI_UNITE = " (arrondi à l'unité accepté si besoin)";

/** Consigne de l'écran "norme" (point 4.1). */
export function segmentsConsigneNorme(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { normeResultante } = notationVecteursApplicationPhysique(exercice.contexte);
  const grandeur = libelleGrandeurApplicationPhysique(exercice.contexte);
  return [texte(`Calcule la norme de la résultante des ${grandeur} `), latex(normeResultante), texte(`${NOTE_PRECISION_ARRONDI_UNITE}.`)];
}

/** Consigne de l'écran "deviation" (point 5.1). */
export function segmentsConsigneDeviation(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  return [
    texte("Quel est l'angle de déviation entre "),
    latex(v1),
    texte(" et "),
    latex(resultante),
    texte(`${NOTE_PRECISION_ARRONDI_UNITE} ?`),
  ];
}

/**
 * Aide niveau 1 de l'écran "norme" (point 4.3) — rappel de la MÉTHODE pertinente uniquement
 * (Pythagore pour angleDroit, formule de la résultante pour angleQuelconque, jamais les deux à la
 * fois), formule NON substituée. Audit chapitre 6, point 19 : même formule que le cours
 * (`R² = F₁² + F₂² + 2·F₁·F₂·cos θ`, θ = angle ENTRE les deux vecteurs, celui de l'énoncé) —
 * l'ancienne version `… − 2…cos(α)`, α = angle du triangle vectoriel, était juste mais n'était pas
 * celle du cours, et l'élève y injectait naturellement l'angle de l'énoncé avec le signe −.
 */
export function segmentsAideNormeNiveau1(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  if (exercice.variante === "angleDroit") {
    return [texte("Utilise le théorème de Pythagore : "), latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2`), texte(".")];
  }
  return [
    texte("Utilise la formule de la résultante (loi des cosinus) : "),
    latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 + 2\\|${v1}\\|\\|${v2}\\|\\cos\\theta`),
    texte(", où θ est l'angle entre "),
    latex(v1),
    texte(" et "),
    latex(v2),
    texte(" donné dans l'énoncé."),
  ];
}

/** Aide niveau 2 de l'écran "norme" (point 4.3) — formule SUBSTITUÉE avec les valeurs réelles de
 * l'instance (v1, v2 et θ, l'angle de l'énoncé — même formule que le cours, voir le niveau 1),
 * jamais calculée (le résultat final reste à trouver par l'élève). */
export function formatAideNormeNiveau2Latex(exercice: ExerciceApplicationPhysique): string {
  const { resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  if (exercice.variante === "angleDroit") {
    return `\\|${resultante}\\|^2 = ${exercice.v1}^2 + ${exercice.v2}^2`;
  }
  return `\\|${resultante}\\|^2 = ${exercice.v1}^2 + ${exercice.v2}^2 + 2\\cdot ${exercice.v1}\\cdot ${exercice.v2}\\cdot\\cos(${exercice.angleEntreVecteurs}°)`;
}

/**
 * Aide niveau 1 de l'écran "deviation" (F2, option b) — même principe que l'aide "norme" : la
 * MÉTHODE du cours seulement, formule non substituée (tangente du rectangle pour angleDroit, loi
 * des sinus pour angleQuelconque, jamais les deux). Proposée sur TOUS les exercices, jamais
 * seulement sur ceux dont la déviation dépasse 90° : un bouton qui n'apparaîtrait que sur ces
 * exercices trahirait le piège avant même que l'élève demande de l'aide.
 */
export function segmentsAideDeviationNiveau1(exercice: ExerciceApplicationPhysique): FragmentConsigne[] {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(exercice.contexte);
  if (exercice.variante === "angleDroit") {
    return [
      texte("Le parallélogramme est un rectangle : dans le triangle rectangle formé par "),
      latex(v1),
      texte(" et le côté parallèle à "),
      latex(v2),
      texte(", "),
      latex(`\\tan(\\text{déviation}) = \\dfrac{\\|${v2}\\|}{\\|${v1}\\|}`),
      texte(" (côté opposé / côté adjacent)."),
    ];
  }
  return [
    texte("Utilise la loi des sinus : "),
    latex(`\\dfrac{\\sin(\\text{déviation})}{\\|${v2}\\|} = \\dfrac{\\sin\\theta}{\\|${resultante}\\|}`),
    texte(", où θ est l'angle de l'énoncé et "),
    latex(`\\|${resultante}\\|`),
    texte(" la norme trouvée à l'écran précédent."),
  ];
}

/** Aide niveau 2 de l'écran "deviation" — formule SUBSTITUÉE (norme de la résultante telle que le
 * récapitulatif l'affiche), jamais calculée : ni le sinus, ni l'angle ne sont donnés. */
export function formatAideDeviationNiveau2Latex(exercice: ExerciceApplicationPhysique): string {
  if (exercice.variante === "angleDroit") {
    return `\\tan(\\text{déviation}) = \\dfrac{${exercice.v2}}{${exercice.v1}}`;
  }
  const norme = nombreFrLatex(Math.round(exercice.triangle.a * 100) / 100);
  return `\\sin(\\text{déviation}) = \\dfrac{${exercice.v2}\\cdot\\sin(${exercice.angleEntreVecteurs}°)}{${norme}}`;
}

/**
 * Aide niveau 2, suite — le piège du cours (F2, option b) : l'arcsin de la calculatrice renvoie
 * toujours l'angle aigu, alors que la déviation dépasse 90° dès que la résultante penche vers
 * l'arrière (`v₁ + v₂·cos θ < 0`, `resultantePencheEnArriere`). Même texte pour tous les exercices
 * « angle quelconque », la somme est substituée mais jamais calculée : c'est à l'élève d'en trouver
 * le signe, et ce texte ne dit donc jamais si l'exercice courant est concerné. `null` pour
 * angleDroit (tangente d'un angle aigu, aucune ambiguïté).
 */
export function segmentsAideDeviationSens(exercice: ExerciceApplicationPhysique): FragmentConsigne[] | null {
  if (exercice.variante === "angleDroit") return null;
  const { v1, v2 } = notationVecteursApplicationPhysique(exercice.contexte);
  return [
    texte("Attention, la calculatrice (arcsin) donne toujours un angle aigu. Calcule "),
    latex(`\\|${v1}\\| + \\|${v2}\\|\\cos\\theta = ${exercice.v1} + ${exercice.v2}\\cdot\\cos(${exercice.angleEntreVecteurs}°)`),
    texte(" : s'il est négatif, la résultante penche vers l'arrière et la déviation vaut 180° moins l'angle de la calculatrice ; sinon, c'est l'angle de la calculatrice."),
  ];
}

const LIBELLES_VARIANTE: Record<VarianteApplicationPhysique, string> = {
  angleDroit: "Angle droit",
  angleQuelconque: "Angle quelconque",
};

export function libelleVarianteApplicationPhysique(variante: VarianteApplicationPhysique): string {
  return LIBELLES_VARIANTE[variante];
}

/** Arrondi 2 décimales, virgule décimale (audit chapitre 6, point 14) — même convention que la
 * réponse révélée (`AppApplicationPhysique.tsx`), jamais un décimal brut non arrondi. */
export function formatValeurApplicationPhysique(valeur: number): string {
  return nombreFr(Math.round(valeur * 100) / 100);
}

/**
 * Récapitulatif accumulé des écrans déjà clos pour l'exercice en cours (même principe que les 13
 * autres récapitulatifs du projet, ex. `recapitulatifCercleTrigonometrique.ts`) — dérivé uniquement
 * des champs `scoreXxxExercice`/`xxxReveleExercice` déjà trackés par le moteur (`!== null` ⟺
 * l'écran a eu lieu et est clos pour l'exercice courant), toujours la vraie valeur confirmée
 * (`exerciceCourant`), jamais la saisie brute de l'élève. Aucune entrée pour "interpretation" :
 * dernière étape, clôture toujours immédiatement l'exercice.
 */
export function calculerRecapitulatifApplicationPhysique(etat: EtatSessionApplicationPhysique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreModelisationExercice !== null) {
    entrees.push({
      libelle: "Configuration",
      estLatex: false,
      valeur: LIBELLES_VARIANTE[exercice.variante],
      revele: etat.modelisationReveleExercice,
    });
  }

  if (etat.scoreNormeExercice !== null) {
    entrees.push({
      libelle: "Norme de la résultante",
      estLatex: false,
      valeur: `${formatValeurApplicationPhysique(exercice.triangle.a)} ${exercice.unite}`,
      revele: etat.normeReveleExercice,
    });
  }

  if (etat.scoreDeviationExercice !== null) {
    entrees.push({
      libelle: "Angle de déviation",
      estLatex: false,
      valeur: `${formatValeurApplicationPhysique(exercice.triangle.C)}°`,
      revele: etat.deviationReveleExercice,
    });
  }

  return entrees;
}
