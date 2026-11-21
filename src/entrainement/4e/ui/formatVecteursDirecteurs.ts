import type { EquationG, ExerciceVecteursDirecteurs, OptionVecteur, Pt } from "../core/vecteursDirecteurs.types";
import { colineaires, estNul, lireVecteurColonne } from "../moteur/vecteurColonneSaisi";
import type { ChampPersonnalise, EcranTSD } from "./ecransTransfertSecondDegre";
import { mono, q, somme } from "./corrigeChapitre3";
import { COULEURS, colonne, droitePointDirecteur, figureRepere, l, n, pointL, t, type Fr } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figures de gen129 « Vecteurs directeurs d'une droite » — SOURCE UNIQUE (écran,
 * aides, papier, corrigé). Notation du cours (§ 15) : vecteur en colonne, point A(x ; y), droite
 * d'équation y = mx + p de vecteur directeur (1 ; m).
 */

type E = ExerciceVecteursDirecteurs;

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

/** Nom du vecteur lu : « AB » ou « EF ». */
export const nomVecteur = (e: E) => `${e.noms[0]}${e.noms[1]}`;

/** « \vec{u_{2}}\begin{pmatrix}…\end{pmatrix} ». */
export function optionL(o: OptionVecteur, i: number): string {
  return `\\vec{u_{${i + 1}}}${colonne(o.v.x, o.v.y)}`;
}

/** Équation de g : « y=\dfrac{2}{3}x-1 », « y=-3 », « x=4 ». */
export function equationGL(g: EquationG): string {
  if (g.type === "horizontale") return `y=${n(g.k)}`;
  if (g.type === "verticale") return `x=${n(g.k)}`;
  return `y=${somme([
    [g.num / g.den, "x"],
    [g.p, ""],
  ])}`;
}

/** Coefficient m de g (affine). */
export const mG = (g: Extract<EquationG, { type: "affine" }>) => g.num / g.den;

/** Vecteur directeur « sans fraction » attendu pour g. */
export function directeurG(g: EquationG): Pt {
  if (g.type === "horizontale") return { x: 1, y: 0 };
  if (g.type === "verticale") return { x: 0, y: 1 };
  return { x: g.den, y: g.num };
}

/** Sens d'un déplacement sur le quadrillage : « 3 carreaux vers la droite ». */
function pas(v: number, positif: string, negatif: string): string {
  const k = Math.abs(v);
  return `${k} carreau${k > 1 ? "x" : ""} vers ${v > 0 ? positif : negatif}`;
}

export function deplacementTexte(u: Pt): string {
  const morceaux: string[] = [];
  if (u.x !== 0) morceaux.push(pas(u.x, "la droite", "la gauche"));
  if (u.y !== 0) morceaux.push(pas(u.y, "le haut", "le bas"));
  return morceaux.join(" et ");
}

// ---------------------------------------------------------------------------------------------
// Énoncé, consignes
// ---------------------------------------------------------------------------------------------

export function enonceFragments(e: E): Fr {
  if (e.variante === "parallele") return [t("Sur la figure, la droite d passe par le point C et elle est parallèle à la droite (EF). Les points C, E et F sont des nœuds du quadrillage.")];
  return [t("Sur la figure, la droite d passe par les points A et B, deux nœuds du quadrillage.")];
}

export const CONSIGNE_GENERALE = "Un vecteur directeur d'une droite donne sa direction : trouve-en à partir de la figure, puis à partir d'une équation.";

export const TITRES = ["Un vecteur directeur de d", "Reconnaître les vecteurs directeurs", "À partir d'une équation"];

export function consignesEcrans(e: E): Fr[] {
  const [a, b] = e.noms;
  return [
    [t(`Lis les coordonnées de ${a} et de ${b} sur le quadrillage, puis écris un vecteur directeur de la droite d.`)],
    [t("Coche tous les vecteurs directeurs de la droite d parmi les vecteurs proposés.")],
    [t("La droite g a pour équation "), l(equationGL(e.g)), t(". Écris un vecteur directeur de g.")],
  ];
}

/** Les trois VRAIES questions du papier (d, puis le choix parmi cinq vecteurs, puis g). */
export function questionsPapier(e: E): Fr[] {
  const liste: Fr = [];
  e.options.forEach((o, i) => {
    if (i > 0) liste.push(t(i === e.options.length - 1 ? " et " : ", "));
    liste.push(l(optionL(o, i)));
  });
  return [
    [t("Donne un vecteur directeur de la droite d.")],
    [t("Parmi les vecteurs "), ...liste, t(", lesquels sont des vecteurs directeurs de d ?")],
    [t("Donne un vecteur directeur de la droite g d'équation "), l(equationGL(e.g)), t(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function reponseA(e: E): Fr {
  return [l(`\\vec{${nomVecteur(e)}}${colonne(e.u.x, e.u.y)}`), t(", ou tout autre multiple non nul")];
}

export function indicesJustes(e: E): number[] {
  return e.options.map((o, i) => (o.juste ? i : -1)).filter((i) => i >= 0);
}

export function reponseB(e: E): Fr {
  const justes = indicesJustes(e);
  const sortie: Fr = [];
  justes.forEach((i, k) => {
    if (k > 0) sortie.push(t(k === justes.length - 1 ? " et " : ", "));
    sortie.push(l(`\\vec{u_{${i + 1}}}`));
  });
  return sortie;
}

export function reponseC(e: E): Fr {
  const g = e.g;
  const v = directeurG(g);
  if (g.type !== "affine") return [l(colonne(v.x, v.y)), t(", ou tout autre multiple non nul")];
  if (g.den === 1) return [l(colonne(1, g.num)), t(", ou tout autre multiple non nul")];
  return [l(colonne(1, mG(g))), t(" ou, sans fraction, "), l(colonne(v.x, v.y))];
}

// ---------------------------------------------------------------------------------------------
// Figures (quadrillage d'une unité, fenêtre [−6 ; 6], aucun identifiant SVG)
// ---------------------------------------------------------------------------------------------

const FENETRE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

type Position = "no" | "ne" | "so" | "se" | "n" | "s" | "e" | "o";
const DIRECTION: Record<Position, Pt> = { no: { x: -1, y: 1 }, ne: { x: 1, y: 1 }, so: { x: -1, y: -1 }, se: { x: 1, y: -1 }, n: { x: 0, y: 1 }, s: { x: 0, y: -1 }, e: { x: 1, y: 0 }, o: { x: -1, y: 0 } };

/** Position du nom d'un point de la droite de direction u : hors de la droite, et du côté qui
 * s'éloigne des axes (le nom ne chevauche jamais une graduation). */
function candidatsCote(u: Pt): [Position, Position] {
  return u.y === 0 ? ["n", "s"] : u.x === 0 ? ["e", "o"] : u.x * u.y > 0 ? ["no", "se"] : ["ne", "so"];
}
function cote(u: Pt, P: Pt): Position {
  const candidats = candidatsCote(u);
  // Le nom s'écrit à environ 0,6 unité du point : on garde le côté le plus loin des axes.
  const score = (c: Position) => Math.min(Math.abs(P.x + 0.6 * DIRECTION[c].x), Math.abs(P.y + 0.6 * DIRECTION[c].y));
  return score(candidats[1]) > score(candidats[0]) ? candidats[1] : candidats[0];
}
/** Autre côté de la droite. */
function coteOppose(u: Pt, pos: Position): Position {
  const c = candidatsCote(u);
  return pos === c[0] ? c[1] : c[0];
}
/** Corrigé : étiquettes longues « A(−4 ; −1) » écrites vers le centre de la figure (jamais rognées
 * au bord), de part et d'autre de la droite si les deux points sont proches. */
function cotesCorrige(u: Pt, P1: Pt, P2: Pt): [Position, Position] {
  const versCentre = (P: Pt): Position => {
    const c = candidatsCote(u);
    if (u.y === 0) return cote(u, P);
    return DIRECTION[c[0]].x * Math.sign(P.x) <= 0 ? c[0] : c[1];
  };
  const a = versCentre(P1);
  let b = versCentre(P2);
  if (a === b && Math.hypot(P1.x - P2.x, P1.y - P2.y) < 4.5) b = coteOppose(u, a);
  return [a, b];
}

/** Nom « d » posé à côté de la droite, loin des points nommés, des axes et de l'autre droite
 * (l'étiquette automatique de `figureRepere`, près du bord, chevauchait un point ou une graduation). */
function avecNomDroite(svg: string, Pd: Pt, u: Pt, evites: Pt[], autre: { P: Pt } | null): string {
  const n = Math.hypot(u.x, u.y);
  const ux = u.x / n, uy = u.y / n;
  let meilleur: Pt | null = null;
  let scoreMax = -Infinity;
  const distDroite = (q: Pt, P: Pt) => Math.abs(ux * (q.y - P.y) - uy * (q.x - P.x));
  for (let s = -16; s <= 16; s += 0.25) {
    const q = { x: Pd.x + s * ux, y: Pd.y + s * uy };
    for (const signe of [1, -1]) {
      const l = { x: q.x - signe * 0.6 * uy, y: q.y + signe * 0.6 * ux };
      if (Math.abs(l.x) > 5.3 || Math.abs(l.y) > 5.3) continue;
      let sc = Math.min(Math.abs(l.x), Math.abs(l.y), ...evites.map((p) => Math.hypot(p.x - l.x, p.y - l.y)));
      if (autre) sc = Math.min(sc, distDroite(l, autre.P));
      if (sc > scoreMax) {
        scoreMax = sc;
        meilleur = l;
      }
    }
  }
  if (!meilleur) return svg;
  const X = 18 + (meilleur.x - FENETRE.xMin) * 20;
  const Y = 18 + (FENETRE.yMax - meilleur.y) * 20 + 4.5;
  const texte = `<text x="${Math.round(X * 10) / 10}" y="${Math.round(Y * 10) / 10}" font-size="14" font-style="italic" text-anchor="middle" fill="${COULEURS.accent}" font-family="serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">d</text>`;
  return svg.replace(/<\/svg>$/, `${texte}</svg>`);
}

/** Figure de l'énoncé : d (et (EF)), points nommés SANS coordonnées (on les lit). */
export function figureEnonce(e: E): string {
  if (e.variante === "parallele") {
    const svg = figureRepere({
      fenetre: FENETRE,
      unite: 20,
      droites: [
        { d: droitePointDirecteur(e.P1, e.u), couleur: COULEURS.gris, pointille: true, epaisseur: 1.5 },
        { d: droitePointDirecteur(e.C!, e.u), couleur: COULEURS.accent },
      ],
      points: [
        { P: e.P1, label: "E", position: cote(e.u, e.P1), couleur: COULEURS.bleu },
        { P: e.P2, label: "F", position: cote(e.u, e.P2), couleur: COULEURS.bleu },
        { P: e.C!, label: "C", position: cote(e.u, e.C!) },
      ],
    });
    return avecNomDroite(svg, e.C!, e.u, [e.P1, e.P2, e.C!], { P: e.P1 });
  }
  const svg = figureRepere({
    fenetre: FENETRE,
    unite: 20,
    droites: [{ d: droitePointDirecteur(e.P1, e.u), couleur: COULEURS.accent }],
    points: [
      { P: e.P1, label: "A", position: cote(e.u, e.P1) },
      { P: e.P2, label: "B", position: cote(e.u, e.P2) },
    ],
  });
  return avecNomDroite(svg, e.P1, e.u, [e.P1, e.P2], null);
}

/** Figure du corrigé : coordonnées lues, flèche de P1 vers P2 et ses deux déplacements. */
export function figureCorrige(e: E): string {
  const coin = { x: e.P2.x, y: e.P1.y };
  const droites = [{ d: droitePointDirecteur(e.P1, e.u), couleur: e.variante === "parallele" ? COULEURS.gris : COULEURS.accent, pointille: e.variante === "parallele", epaisseur: e.variante === "parallele" ? 1.5 : 2 }];
  if (e.variante === "parallele") droites.push({ d: droitePointDirecteur(e.C!, e.u), couleur: COULEURS.accent, pointille: false, epaisseur: 2 });
  const etiquetteXY = (nom: string, p: Pt) => `${nom}(${p.x < 0 ? "−" : ""}${Math.abs(p.x)} ; ${p.y < 0 ? "−" : ""}${Math.abs(p.y)})`;
  const svg = figureRepere({
    fenetre: FENETRE,
    unite: 20,
    droites,
    segments: [
      ...(e.u.x !== 0 && e.u.y !== 0
        ? [
            { A: e.P1, B: coin, couleur: COULEURS.vert, pointille: true, epaisseur: 1.4 },
            { A: coin, B: e.P2, couleur: COULEURS.vert, pointille: true, epaisseur: 1.4 },
          ]
        : []),
      { A: e.P1, B: e.P2, couleur: COULEURS.bleu, fleche: true, epaisseur: 2.4 },
    ],
    points: [
      { P: e.P1, label: etiquetteXY(e.noms[0], e.P1), position: cotesCorrige(e.u, e.P1, e.P2)[0], couleur: COULEURS.bleu },
      { P: e.P2, label: etiquetteXY(e.noms[1], e.P2), position: cotesCorrige(e.u, e.P1, e.P2)[1], couleur: COULEURS.bleu },
      ...(e.C ? [{ P: e.C, label: "C", position: cote(e.u, e.C) }] : []),
    ],
  });
  return e.C ? avecNomDroite(svg, e.C, e.u, [e.P1, e.P2, e.C], { P: e.P1 }) : avecNomDroite(svg, e.P1, e.u, [e.P1, e.P2], null);
}

// ---------------------------------------------------------------------------------------------
// Champs « vecteur en colonne »
// ---------------------------------------------------------------------------------------------

interface PiegeVecteur {
  v: Pt;
  message: string;
  /** Égalité exacte (coordonnées d'un point recopiées), sinon colinéarité (tout multiple). */
  exact?: boolean;
}

const AIDE_SAISIE_VECTEUR = "Une composante par case : entier, fraction (2/3) ou décimal à virgule.";

export function champVecteur(o: { id: string; libelle: Fr; direction: Pt; pieges: PiegeVecteur[]; messageSiFaux: string }): ChampPersonnalise {
  // Un piège colinéaire à la direction serait une bonne réponse : il est écarté.
  const pieges = o.pieges.filter((p) => !estNul(p.v) && !colineaires(p.v, o.direction));
  return {
    type: "personnalise",
    id: o.id,
    libelle: o.libelle,
    vecteurColonne: true,
    aideSaisie: AIDE_SAISIE_VECTEUR,
    affichee: (saisie) => {
      const v = lireVecteurColonne(saisie);
      return v ? colonne(v.x, v.y) : null;
    },
    verifier: (saisie) => {
      const v = lireVecteurColonne(saisie);
      if (!v) return { etat: "parse_error" };
      if (estNul(v)) return { etat: "piege", message: "Le vecteur nul n'a pas de direction : il n'est jamais un vecteur directeur." };
      if (colineaires(v, o.direction)) return { etat: "correct" };
      for (const p of pieges) {
        const touche = p.exact ? Math.abs(p.v.x - v.x) < 1e-9 && Math.abs(p.v.y - v.y) < 1e-9 : colineaires(v, p.v);
        if (touche) return { etat: "piege", message: p.message };
      }
      return { etat: "faux", message: o.messageSiFaux };
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

function ecranA(e: E): EcranTSD {
  const [a, b] = e.noms;
  const u = e.u;
  const pieges: PiegeVecteur[] = [
    { v: { x: u.y, y: u.x }, message: "Composantes échangées : la première composante est l'écart des abscisses (x), la seconde celui des ordonnées (y)." },
    { v: { x: -u.y, y: u.x }, message: "Ce vecteur est perpendiculaire à d : il ne donne pas sa direction." },
    { v: { x: u.x, y: -u.y }, message: "Une seule composante a changé de signe : calcule les deux écarts « arrivée moins départ » dans le même sens." },
    { v: e.P1, message: `Ce sont les coordonnées du point ${a}, pas les composantes d'un vecteur : calcule « arrivée moins départ ».`, exact: true },
    { v: e.P2, message: `Ce sont les coordonnées du point ${b}, pas les composantes d'un vecteur : calcule « arrivée moins départ ».`, exact: true },
    ...(e.C ? [{ v: e.C, message: "Ce sont les coordonnées du point C, pas les composantes d'un vecteur.", exact: true }] : []),
  ];
  const aide1: Fr =
    e.variante === "parallele"
      ? [t("Deux droites parallèles ont les mêmes vecteurs directeurs : un vecteur défini par deux points de (EF) convient pour d. Ses composantes : arrivée moins départ, "), l(`\\vec{EF}${colonne("x_F-x_E", "y_F-y_E")}`), t(".")]
      : [t("Un vecteur défini par deux points distincts de d est un vecteur directeur de d. Ses composantes : arrivée moins départ, "), l(`\\vec{AB}${colonne("x_B-x_A", "y_B-y_A")}`), t(".")];
  const aide2: Fr =
    e.variante === "horizontale-verticale"
      ? [t(`Ici, ${a} et ${b} ont la même ${u.y === 0 ? "ordonnée" : "abscisse"} : `), l(u.y === 0 ? "y_B-y_A=0" : "x_B-x_A=0"), t(`. Compte les carreaux de ${a} à ${b} pour l'autre composante.`)]
      : [t("Ici, on lit "), l(pointL(a, e.P1)), t(` ; lis les coordonnées de ${b}, puis calcule les deux écarts `), l(`x_${b}-x_${a}`), t(" et "), l(`y_${b}-y_${a}`), t(".")];
  return {
    type: "champs",
    titre: TITRES[0]!,
    consigne: consignesEcrans(e)[0]!,
    champs: [champVecteur({ id: "u", libelle: [t("Un vecteur directeur de d :")], direction: u, pieges, messageSiFaux: `Ce vecteur n'a pas la direction de d. Lis ${a} et ${b} sur le quadrillage, puis calcule « arrivée moins départ ».` })],
    aides: [aide1, aide2],
    reponse: reponseA(e),
    figure: figureEnonce(e),
    figureApres: figureCorrige(e),
  };
}

function ecranB(e: E): EcranTSD {
  const nom = nomVecteur(e);
  const premier = e.options[0]!.v;
  return {
    type: "cases",
    titre: TITRES[1]!,
    consigne: consignesEcrans(e)[1]!,
    options: e.options.map((o, i) => [l(optionL(o, i))]),
    bonnes: indicesJustes(e),
    aides: [
      [t("Un vecteur non nul est directeur de d s'il est colinéaire à "), l(`\\vec{${nom}}`), t(". Critère de colinéarité de deux vecteurs : "), l("x_u\\cdot y_v-y_u\\cdot x_v=0"), t(".")],
      [t("Ici, "), l(`\\vec{${nom}}${colonne(e.u.x, e.u.y)}`), t(". Pour "), l("\\vec{u_{1}}"), t(", calcule "), l(`${n(e.u.x)}\\cdot ${premier.y < 0 ? `(${n(premier.y)})` : n(premier.y)}-${e.u.y < 0 ? `(${n(e.u.y)})` : n(e.u.y)}\\cdot ${premier.x < 0 ? `(${n(premier.x)})` : n(premier.x)}`), t(", puis fais de même pour les autres.")],
    ],
    messageFaux: "Un vecteur directeur est colinéaire au vecteur de la figure : l'opposé et les multiples conviennent, mais pas les composantes échangées ni un vecteur perpendiculaire.",
    figure: figureEnonce(e),
  };
}

function ecranC(e: E): EcranTSD {
  const g = e.g;
  const cible = directeurG(g);
  if (g.type !== "affine") {
    const horizontale = g.type === "horizontale";
    return {
      type: "champs",
      titre: TITRES[2]!,
      consigne: consignesEcrans(e)[2]!,
      champs: [
        champVecteur({
          id: "g",
          libelle: [t("Un vecteur directeur de g :")],
          direction: cible,
          pieges: [
            { v: horizontale ? { x: 0, y: 1 } : { x: 1, y: 0 }, message: horizontale ? "Une droite d'équation y = k est horizontale : y ne change pas, la seconde composante est nulle." : "Une droite d'équation x = k est verticale : x ne change pas, la première composante est nulle." },
          ],
          messageSiFaux: horizontale ? "Sur une droite d'équation y = k, tous les points ont la même ordonnée." : "Sur une droite d'équation x = k, tous les points ont la même abscisse.",
        }),
      ],
      aides: [
        [t("Une droite d'équation "), l("y=k"), t(" est horizontale (parallèle à l'axe des x) ; une droite d'équation "), l("x=k"), t(" est verticale (parallèle à l'axe des y).")],
        [t("Ici, deux points de g : "), l(horizontale ? `(0\\,;${n(g.k)})` : `(${n(g.k)}\\,;0)`), t(" et "), l(horizontale ? `(1\\,;${n(g.k)})` : `(${n(g.k)}\\,;1)`), t(" : calcule le vecteur qui va de l'un à l'autre.")],
      ],
      reponse: reponseC(e),
    };
  }
  const m = mG(g);
  const xB = g.den;
  return {
    type: "champs",
    titre: TITRES[2]!,
    consigne: consignesEcrans(e)[2]!,
    champs: [
      champVecteur({
        id: "g",
        libelle: [t("Un vecteur directeur de g :")],
        direction: cible,
        pieges: [
          { v: { x: cible.y, y: cible.x }, message: "Composantes échangées : quand x augmente de 1, c'est y qui augmente de m ; m est la seconde composante." },
          { v: { x: 1, y: g.p }, message: "p est l'ordonnée à l'origine : il place la droite mais ne donne pas sa direction. Regarde le coefficient de x." },
          { v: { x: 1, y: -m }, message: "Attention au signe de m : c'est le coefficient de x, avec son signe." },
        ],
        messageSiFaux: "Pour y = mx + p, un vecteur directeur est (1 ; m) : repère le coefficient de x.",
      }),
    ],
    aides: [
      [t("Une droite d'équation "), l("y=mx+p"), t(" a pour vecteur directeur "), l(colonne(1, "m")), t(" : quand x augmente de 1, y augmente de m.")],
      [
        t("Ici, deux points de g : pour "),
        l("x=0"),
        t(", "),
        l(`y=${n(g.p)}`),
        t(" ; pour "),
        l(`x=${xB}`),
        t(", "),
        l(`y=${mono(m, "")}\\cdot ${xB}${g.p < 0 ? `-${q(-g.p)}` : `+${q(g.p)}`}`),
        t(". Calcule cette ordonnée, puis le vecteur entre les deux points."),
      ],
    ],
    reponse: reponseC(e),
  };
}

export function ecrans(e: E): EcranTSD[] {
  return [ecranA(e), ecranB(e), ecranC(e)];
}
