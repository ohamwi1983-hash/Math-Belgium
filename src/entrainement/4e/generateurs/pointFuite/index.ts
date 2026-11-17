import {
  HAUTEUR_GRILLE,
  LARGEUR_GRILLE,
  type AffirmationFuite,
  type DroiteSupport,
  type EtapeConstructionFuite,
  type ExercicePointFuite,
  type PointNommeFuite,
  type Pt,
  type SegmentFuite,
  type VariantePointFuite,
} from "../../core/pointFuite.types";
import { angleEntre, dansCadre, distance, estNoeud, intersectionDroites, milieu, sur } from "./geometrieFuite";

/**
 * Générateur de gen105 — « Perspective centrale : point de fuite » (4e, chapitre 8). Tout le hasard
 * passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine,
 * et le QR code d'une feuille rouvre le MÊME exercice.
 *
 * Le dessin est la vitre de Dürer, quadrillée (unités du quadrillage) : ligne d'horizon y = h,
 * point de fuite F = (f ; h). Les points DONNÉS sont sur des nœuds (lisibles sur papier) ; les points
 * à construire sont des intersections de droites. Conventions du cours respectées : seules les
 * fuyantes convergent ; les verticales et les horizontales parallèles à la vitre restent parallèles
 * (tous les objets « de face » sont dessinés avec des côtés horizontaux et verticaux).
 *
 * Tirage : la variante, puis la scène par rejet (cadre, lisibilité : points nommés à au moins
 * 0,8 carreau les uns des autres, droites qui se coupent sous un angle franc, segments assez longs
 * pour être prolongés), puis les trois affirmations (une vraie, deux fausses, ordre mélangé).
 */

const PRIME = "′";

function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}

function entre(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

const seg = (a: Pt, b: Pt, style: SegmentFuite["style"]): SegmentFuite => ({ a, b, style });
const pt = (nom: string, p: Pt, role: PointNommeFuite["role"]): PointNommeFuite => ({ nom, p, role });

const HORIZ_A: Pt = { x: 0, y: 0 };
const HORIZ_B: Pt = { x: 1, y: 0 };
const VERT_B: Pt = { x: 0, y: 1 };

function horizontale(p: Pt, nom: string): DroiteSupport {
  return { a: p, b: { x: p.x + 1, y: p.y }, nature: "horizontale", description: `l'horizontale qui passe par ${nom}` };
}

function verticale(p: Pt, nom: string): DroiteSupport {
  return { a: p, b: { x: p.x, y: p.y + 1 }, nature: "verticale", description: `la verticale qui passe par ${nom}` };
}

function horizonSupport(h: number): DroiteSupport {
  return { a: { x: 0, y: h }, b: { x: 1, y: h }, nature: "horizon", description: "la ligne d'horizon" };
}

/** Points nommés assez éloignés les uns des autres pour que les étiquettes restent lisibles. */
function espaces(points: Pt[], minimum = 0.8): boolean {
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) if (distance(points[i]!, points[j]!) < minimum) return false;
  return true;
}

/** Une affirmation vraie et deux fausses, dans un ordre mélangé. */
function tirerAffirmations(vraies: AffirmationFuite[], fausses: AffirmationFuite[]): AffirmationFuite[] {
  return melanger([choisir(vraies), ...melanger(fausses).slice(0, 2)]);
}

const V = (texte: string, explication: string): AffirmationFuite => ({ texte, vraie: true, explication });
const X = (texte: string, explication: string): AffirmationFuite => ({ texte, vraie: false, explication });

// =================================================================================================
// Boîte : point de fuite à partir de deux arêtes fuyantes, puis un sommet de la face arrière
// =================================================================================================

type Coin = "A" | "B" | "C" | "D";
type Face = "haut" | "bas" | "gauche" | "droite";
const COINS: Coin[] = ["A", "B", "C", "D"];
const FACES_FUYANTE: Record<Coin, [Face, Face]> = { A: ["bas", "gauche"], B: ["bas", "droite"], C: ["haut", "droite"], D: ["haut", "gauche"] };
const ARETES_ARRIERE: [Coin, Coin, Face][] = [
  ["A", "B", "bas"],
  ["B", "C", "droite"],
  ["C", "D", "haut"],
  ["D", "A", "gauche"],
];
const VOISINS: Record<Coin, { coin: Coin; nature: "horizontale" | "verticale" }[]> = {
  A: [
    { coin: "B", nature: "horizontale" },
    { coin: "D", nature: "verticale" },
  ],
  B: [
    { coin: "A", nature: "horizontale" },
    { coin: "C", nature: "verticale" },
  ],
  C: [
    { coin: "D", nature: "horizontale" },
    { coin: "B", nature: "verticale" },
  ],
  D: [
    { coin: "C", nature: "horizontale" },
    { coin: "A", nature: "verticale" },
  ],
};

const AFFIRMATIONS_BOITE = {
  vraies: [
    V("Sur le dessin, les arêtes verticales [AD] et [A′D′] restent parallèles.", "Les arêtes verticales sont parallèles à la vitre : elles restent verticales, donc parallèles, sur le dessin."),
    V("Dans la réalité, la face arrière A′B′C′D′ a les mêmes dimensions que la face avant ABCD.", "Les faces avant et arrière d'un pavé sont identiques : la face arrière paraît plus petite seulement parce qu'elle est plus loin."),
    V("Les droites (AA′) et (BB′) sont parallèles dans la réalité, mais elles se coupent sur le dessin.", "Ce sont deux fuyantes : parallèles dans la réalité, elles convergent vers le point de fuite F sur le dessin."),
    V("Sur le dessin, l'arête [A′B′] est parallèle à l'arête [AB].", "[AB] et [A′B′] sont parallèles à la vitre : elles n'ont pas de point de fuite et restent parallèles (horizontales) sur le dessin."),
  ],
  fausses: [
    X("Sur le dessin, les droites (AB) et (A′B′) se coupent au point de fuite.", "(AB) et (A′B′) sont parallèles à la vitre : elles n'ont pas de point de fuite, elles restent horizontales sur le dessin."),
    X("Dans la réalité, l'arête [A′B′] est plus courte que l'arête [AB].", "Les faces avant et arrière d'un pavé sont identiques : [A′B′] paraît plus courte parce qu'elle est plus loin. La perspective centrale ne conserve pas les longueurs."),
    X("Comme en perspective cavalière, deux arêtes parallèles de la boîte restent toujours parallèles sur le dessin.", "C'est vrai en perspective cavalière, pas ici : les arêtes fuyantes, parallèles dans la réalité, convergent vers le point de fuite."),
    X("Les arêtes verticales de la boîte convergent elles aussi vers le point de fuite.", "Les verticales sont parallèles à la vitre : elles restent verticales et parallèles sur le dessin."),
  ],
};

function genererBoite(): ExercicePointFuite {
  for (let essai = 0; essai < 20000; essai++) {
    const h = choisir([5, 6, 7]);
    const largeur = entre(2, 4);
    const hauteur = entre(2, 3);
    const ya = choisir([1, 2]);
    const yc = ya + hauteur;
    if (Math.abs(yc - h) < 1) continue;
    const xa = entre(1, LARGEUR_GRILLE - 1 - largeur);
    const xb = xa + largeur;
    const F: Pt = { x: entre(1, LARGEUR_GRILLE - 1), y: h };
    if (F.x >= xa && F.x <= xb && h >= ya && h <= yc) continue;
    const t = choisir([1 / 4, 1 / 3, 1 / 2]);
    const avant: Record<Coin, Pt> = { A: { x: xa, y: ya }, B: { x: xb, y: ya }, C: { x: xb, y: yc }, D: { x: xa, y: yc } };
    const arriere = Object.fromEntries(COINS.map((c) => [c, sur(avant[c], F, t)])) as Record<Coin, Pt>;
    const faces: Record<Face, boolean> = { haut: yc < h, bas: ya > h, droite: xb < F.x, gauche: xa > F.x };
    const visibleFuyante = (c: Coin) => FACES_FUYANTE[c].some((fa) => faces[fa]);
    const candidats = COINS.filter((c) => visibleFuyante(c) && estNoeud(arriere[c]));
    if (candidats.length < 2) continue;
    const paire = melanger(candidats).slice(0, 2) as [Coin, Coin];
    paire.sort((a, b) => COINS.indexOf(a) - COINS.indexOf(b));
    const restants = COINS.filter((c) => !paire.includes(c));
    const cible = choisir(restants);
    const dernier = restants.find((c) => c !== cible)!;
    const voisin = choisir(VOISINS[cible].filter((v) => paire.includes(v.coin)));
    const [p0, p1] = paire;
    if (paire.some((c) => distance(avant[c], arriere[c]) < 1.2 || distance(arriere[c], F) < 1.2)) continue;
    if (angleEntre(avant[p0], arriere[p0], avant[p1], arriere[p1]) < 12) continue;
    if (!dansCadre(F, 0.7) || COINS.some((c) => !dansCadre(arriere[c], 0.5))) continue;
    if (!espaces([...COINS.map((c) => avant[c]), ...COINS.map((c) => arriere[c]), F])) continue;
    const dirVoisin = voisin.nature === "horizontale" ? HORIZ_B : VERT_B;
    if (angleEntre(avant[cible], F, HORIZ_A, dirVoisin) < 15) continue;
    if (distance(arriere[cible], F) < 1) continue;

    const nomP = (c: Coin) => `${c}${PRIME}`;
    const visibleArete = (fa: Face) => faces[fa];
    const base = {
      points: [...COINS.map((c) => pt(c, avant[c], "donne")), ...paire.map((c) => pt(nomP(c), arriere[c], "donne"))],
      segments: [
        seg(avant.A, avant.B, "trait"),
        seg(avant.B, avant.C, "trait"),
        seg(avant.C, avant.D, "trait"),
        seg(avant.D, avant.A, "trait"),
        ...paire.map((c) => seg(avant[c], arriere[c], visibleFuyante(c) ? "trait" : "cache")),
      ],
    };
    const fuyanteNom = (c: Coin) => `(${c}${nomP(c)})`;
    const etape1: EtapeConstructionFuite = {
      cible: "F",
      position: F,
      surHorizon: true,
      supports: [
        { a: avant[p0], b: arriere[p0], nature: "fuyante", description: `la droite ${fuyanteNom(p0)}` },
        { a: avant[p1], b: arriere[p1], nature: "fuyante", description: `la droite ${fuyanteNom(p1)}` },
      ],
      consigne: "Place le point de fuite F de la boîte.",
      aides: [
        `Les arêtes [${p0}${nomP(p0)}] et [${p1}${nomP(p1)}] sont parallèles dans la réalité et s'éloignent de la vitre : ce sont des fuyantes. Sur le dessin, les fuyantes convergent vers le point de fuite, sur la ligne d'horizon.`,
        `Prolonge les droites ${fuyanteNom(p0)} et ${fuyanteNom(p1)} : F est leur point de rencontre.`,
      ],
      justification: `Les arêtes [${p0}${nomP(p0)}] et [${p1}${nomP(p1)}] sont parallèles dans la réalité et s'éloignent de la vitre : ce sont des fuyantes. Prolongées, elles se coupent au point de fuite F, qui est sur la ligne d'horizon.`,
      ajout: { points: [pt("F", F, "fuite")], segments: paire.map((c) => seg(arriere[c], F, "aide")) },
    };
    const nomV = nomP(voisin.coin);
    const voisinDernier = VOISINS[dernier].find((v) => v.coin === cible) ?? VOISINS[dernier][0]!;
    const phraseDernier = `Le dernier sommet ${nomP(dernier)} est sur la fuyante (${dernier}F) et sur ${voisinDernier.nature === "horizontale" ? "l'horizontale" : "la verticale"} qui passe par ${nomP(voisinDernier.coin)}.`;
    const etape2: EtapeConstructionFuite = {
      cible: nomP(cible),
      position: arriere[cible],
      surHorizon: false,
      supports: [
        { a: avant[cible], b: F, nature: "fuyante", description: `la fuyante (${cible}F)` },
        voisin.nature === "horizontale" ? horizontale(arriere[voisin.coin], nomV) : verticale(arriere[voisin.coin], nomV),
      ],
      consigne: `Place le sommet ${nomP(cible)} de la face arrière de la boîte.`,
      aides: [
        `L'arête [${cible}${nomP(cible)}] est elle aussi une fuyante : ${nomP(cible)} est sur la droite qui joint ${cible} au point de fuite F.`,
        `La face arrière est parallèle à la vitre : son arête [${nomP(cible)}${nomV}] reste ${voisin.nature === "horizontale" ? "horizontale" : "verticale"} sur le dessin. ${nomP(cible)} est donc sur la fuyante (${cible}F) et sur ${voisin.nature === "horizontale" ? "l'horizontale" : "la verticale"} qui passe par ${nomV}.`,
      ],
      justification: `${nomP(cible)} est sur la fuyante (${cible}F), puisque [${cible}${nomP(cible)}] est parallèle aux autres arêtes fuyantes. L'arête [${nomP(cible)}${nomV}] de la face arrière est parallèle à la vitre, donc ${voisin.nature === "horizontale" ? "horizontale" : "verticale"} sur le dessin : ${nomP(cible)} est sur ${voisin.nature === "horizontale" ? "l'horizontale" : "la verticale"} qui passe par ${nomV}. ${phraseDernier}`,
      ajout: {
        points: [pt(nomP(cible), arriere[cible], "construit"), pt(nomP(dernier), arriere[dernier], "construit")],
        segments: [
          ...ARETES_ARRIERE.map(([c1, c2, fa]) => seg(arriere[c1], arriere[c2], visibleArete(fa) ? "trait" : "cache")),
          ...[cible, dernier].map((c) => seg(avant[c], arriere[c], visibleFuyante(c) ? "trait" : "cache")),
          ...[cible, dernier].map((c) => seg(arriere[c], F, "aide")),
        ],
      },
    };
    return {
      variante: "boite",
      horizon: h,
      contexte: `Une boîte (un pavé droit) est dessinée en perspective centrale. Sa face avant ABCD est parallèle à la vitre ; [${p0}${nomP(p0)}] et [${p1}${nomP(p1)}] sont deux de ses arêtes fuyantes. La ligne d'horizon est tracée en pointillé.`,
      consigneConstruction: `Construis le point de fuite F de la boîte, puis le sommet ${nomP(cible)} de sa face arrière ; complète ensuite la boîte.`,
      base,
      etapes: [etape1, etape2],
      affirmations: tirerAffirmations(AFFIRMATIONS_BOITE.vraies, AFFIRMATIONS_BOITE.fausses),
    };
  }
  throw new Error("gen105 : aucune boîte trouvée");
}

// =================================================================================================
// Carrelage : point de fuite des diagonales, puis le 2e rang
// =================================================================================================

const LETTRES = ["A", "B", "C", "D", "E"];

const AFFIRMATIONS_CARRELAGE = {
  vraies: [
    V("Sur le dessin, les carreaux du 1er rang sont des trapèzes, alors que ce sont des carrés dans la réalité.", "Leurs côtés avant et arrière, parallèles à la vitre, restent horizontaux ; leurs deux autres côtés sont des fuyantes, qui se rapprochent vers F : chaque carreau est dessiné comme un trapèze."),
    V("Les lignes des rangs de carreaux restent horizontales et parallèles sur le dessin.", "Elles sont parallèles à la vitre : elles n'ont pas de point de fuite."),
    V("Les diagonales parallèles des carreaux ont leur propre point de fuite, sur la ligne d'horizon.", "Chaque direction horizontale a son point de fuite sur la ligne d'horizon : les diagonales ont le leur, V, différent de F."),
    V("Sur le dessin, le 2e rang est moins profond que le 1er, alors qu'ils ont la même profondeur dans la réalité.", "Les carreaux sont identiques, mais le 2e rang est plus loin : il paraît moins profond. Les longueurs ne sont pas conservées."),
  ],
  fausses: [
    X("Dans la réalité, les rangs de carreaux sont de moins en moins profonds en s'éloignant.", "Tous les rangs ont la même profondeur dans la réalité : ils paraissent moins profonds parce qu'ils sont plus loin."),
    X("Les lignes des rangs de carreaux convergent vers le point de fuite F.", "Elles sont parallèles à la vitre : elles restent horizontales sur le dessin. Seules les fuyantes convergent."),
    X("Les diagonales des carreaux convergent vers le même point de fuite F que les côtés qui s'éloignent.", "Les diagonales n'ont pas la direction de ces côtés : leur point de fuite V est un autre point de la ligne d'horizon."),
    X("Pour dessiner le 2e rang, il suffit de reporter sur les fuyantes la profondeur du 1er rang mesurée sur le dessin.", "Les longueurs ne sont pas conservées : le 2e rang est dessiné moins profond que le 1er. On le construit avec la diagonale."),
  ],
};

function genererCarrelage(): ExercicePointFuite {
  for (let essai = 0; essai < 20000; essai++) {
    const h = choisir([6, 7]);
    const y0 = 1;
    const hp = h - y0;
    const n = choisir([3, 4]);
    const w = 2;
    const x0 = entre(1, LARGEUR_GRILLE - 1 - n * w);
    // F au-dessus du sol carrelé (vue de face, comme dans le cours) : jamais loin sur le côté.
    const F: Pt = { x: entre(Math.max(2, x0 + 1), Math.min(LARGEUR_GRILLE - 2, x0 + n * w - 1)), y: h };
    const k = choisir([2, 3]);
    const s1 = 1 - k / hp;
    const d = (w * s1) / (1 - s1);
    const sens = choisir([1, -1]);
    const Vp: Pt = { x: F.x + sens * d, y: h };
    if (!dansCadre(Vp, 0.8) || d < 1.5) continue;
    if (w * s1 < 1) continue;
    const P = Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + i * w, y: y0 }));
    const Q = P.map((p) => sur(p, F, k / hp));
    const s2 = d / (2 * w + d);
    const R = P.map((p) => sur(p, F, 1 - s2));
    const y2 = R[0]!.y;
    if (y2 - (y0 + k) < 0.7 || h - y2 < 0.7) continue;
    const j = sens === 1 ? entre(2, n) : entre(0, n - 2);
    const a = sens === 1 ? 0 : n;
    if (!espaces([...P, ...Q, F, Vp], 0.8)) continue;
    if (Math.abs(R[j]!.x - F.x) < 0.6 && Math.abs(F.y - R[j]!.y) < 1.2) continue;
    const nom = (i: number) => LETTRES[i]!;
    const nomQ = (i: number) => `${LETTRES[i]}${PRIME}`;
    const diag = (i: number) => `[${nom(i)}${nomQ(i + sens)}]`;
    const deuxDiag = `${diag(a)}, ${diag(a + sens)}`;
    const base = {
      points: [pt("F", F, "fuite"), ...P.map((p, i) => pt(nom(i), p, "donne")), ...Q.map((q, i) => pt(nomQ(i), q, "donne"))],
      segments: [seg(P[0]!, P[n]!, "trait"), seg(Q[0]!, Q[n]!, "trait"), ...P.map((p, i) => seg(p, Q[i]!, "trait")), ...Q.map((q) => seg(q, F, "fuyante"))],
    };
    const etape1: EtapeConstructionFuite = {
      cible: "V",
      position: Vp,
      surHorizon: true,
      supports: [{ a: P[a]!, b: Q[a + sens]!, nature: "diagonale", description: `la diagonale ${diag(a)} prolongée` }, horizonSupport(h)],
      consigne: `Les diagonales ${deuxDiag}… des carreaux du 1er rang sont parallèles dans la réalité. Place leur point de fuite V.`,
      aides: [
        "Des droites horizontales et parallèles dans la réalité ont un même point de fuite, sur la ligne d'horizon. Les diagonales n'ont pas la direction des fuyantes : leur point de fuite n'est pas F.",
        `Prolonge la diagonale ${diag(a)} jusqu'à la ligne d'horizon.`,
      ],
      justification: `Les diagonales ${deuxDiag}… sont horizontales et parallèles dans la réalité : elles convergent vers un même point de fuite V, sur la ligne d'horizon. On prolonge ${diag(a)} jusqu'à la ligne d'horizon : c'est V (les autres diagonales, prolongées, y passent aussi).`,
      ajout: { points: [pt("V", Vp, "fuite")], segments: [seg(P[a]!, Vp, "aide"), seg(P[a + sens]!, Vp, "aide")] },
    };
    const depart = j - 2 * sens;
    const etape2: EtapeConstructionFuite = {
      cible: "R",
      position: R[j]!,
      surHorizon: false,
      supports: [
        { a: P[j]!, b: F, nature: "fuyante", description: `la fuyante (${nom(j)}F)` },
        { a: P[depart]!, b: Vp, nature: "diagonale", description: `la droite (${nom(depart)}V), qui passe par ${nomQ(depart + sens)}` },
      ],
      consigne: `Place le point R où la ligne du 2e rang de carreaux coupe la fuyante (${nom(j)}F).`,
      aides: [
        "La diagonale d'un carreau du 1er rang, prolongée, est la diagonale d'un carreau du 2e rang : elle coupe les fuyantes aux coins des rangs suivants.",
        `Trace la droite (${nom(depart)}V) — elle passe par ${nomQ(depart + sens)} — : elle coupe la fuyante (${nom(j)}F) au coin du 2e rang.`,
      ],
      justification: `La diagonale ${diag(depart)}, prolongée, est aussi la diagonale du carreau voisin du 2e rang : elle passe par V et coupe la fuyante (${nom(j)}F) au coin R du 2e rang. La ligne du 2e rang est l'horizontale qui passe par R (elle est parallèle à la vitre).`,
      ajout: {
        points: [pt("R", R[j]!, "construit")],
        segments: [seg(R[0]!, R[n]!, "trait"), ...Q.map((q, i) => seg(q, R[i]!, "trait")), seg(P[depart]!, Vp, "aide")],
      },
    };
    return {
      variante: "carrelage",
      horizon: h,
      contexte: `Un sol couvert de carreaux carrés identiques est dessiné en perspective centrale. Le bord avant [${nom(0)}${nom(n)}] est parallèle à la vitre ; les côtés des carreaux qui s'éloignent sont des fuyantes qui convergent vers le point de fuite F, sur la ligne d'horizon (en pointillé). Le 1er rang de carreaux est dessiné : ses coins arrière sont ${nomQ(0)}, ${nomQ(1)}, …, ${nomQ(n)}.`,
      consigneConstruction: `Construis le point de fuite V des diagonales parallèles à ${diag(a)}, puis le point R où la ligne du 2e rang coupe la fuyante (${nom(j)}F) ; trace ensuite le 2e rang.`,
      base,
      etapes: [etape1, etape2],
      affirmations: tirerAffirmations(AFFIRMATIONS_CARRELAGE.vraies, AFFIRMATIONS_CARRELAGE.fausses),
    };
  }
  throw new Error("gen105 : aucun carrelage trouvé");
}

// =================================================================================================
// Poteaux : sommet du 2e poteau, puis pied du 3e (même écart, par le milieu du 2e)
// =================================================================================================

const AFFIRMATIONS_POTEAUX = {
  vraies: [
    V("Les poteaux sont verticaux : sur le dessin, ils restent verticaux et parallèles.", "Les verticales sont parallèles à la vitre : elles n'ont pas de point de fuite."),
    V("Sur le dessin, les sommets des trois poteaux sont alignés avec le point de fuite F.", "Les sommets sont sur une droite parallèle à la ligne des pieds : c'est une fuyante, qui passe par F."),
    V("Sur le dessin, le milieu M du deuxième poteau est au milieu du segment [CD].", "Le poteau est parallèle à la vitre : son dessin est réduit dans la même proportion partout, le milieu reste au milieu."),
    V("Dans la réalité, les pieds A, C et E sont régulièrement espacés, même si les écarts dessinés diminuent.", "C'est la construction par le milieu M qui garantit le même écart réel ; sur le dessin, l'écart diminue avec la distance."),
  ],
  fausses: [
    X("Les poteaux, dessinés de plus en plus petits, convergent vers le point de fuite.", "Les poteaux sont verticaux, donc parallèles à la vitre : ils restent verticaux et parallèles sur le dessin."),
    X("Sur le dessin, les sommets des poteaux sont sur une droite horizontale.", "Les sommets sont sur une droite qui s'éloigne de la vitre : c'est une fuyante, qui passe par le point de fuite F."),
    X("Pour placer le troisième poteau, on reporte au compas l'écart dessiné entre les deux premiers pieds.", "Les longueurs ne sont pas conservées : l'écart dessiné diminue en s'éloignant. On construit le pied suivant avec le milieu du poteau."),
    X("Le milieu d'un poteau n'est pas au milieu de son dessin, comme pour un segment fuyant.", "Seuls les segments fuyants perdent leur milieu. Un poteau est parallèle à la vitre : son milieu reste au milieu sur le dessin."),
  ],
};

function genererPoteaux(): ExercicePointFuite {
  for (let essai = 0; essai < 20000; essai++) {
    const h = choisir([5, 6, 7]);
    const F: Pt = { x: entre(1, LARGEUR_GRILLE - 1), y: h };
    const ya = choisir([1, 2, 3]);
    const hauteur = entre(2, 5);
    const yb = ya + hauteur;
    if (Math.abs(yb - h) < 1 || ya > h - 2 || yb > HAUTEUR_GRILLE - 1) continue;
    const xa = entre(1, LARGEUR_GRILLE - 1);
    if (Math.abs(F.x - xa) < 4) continue;
    const A: Pt = { x: xa, y: ya };
    const B: Pt = { x: xa, y: yb };
    const t = choisir([1 / 4, 1 / 3, 2 / 5, 1 / 2, 3 / 5]);
    const C = sur(A, F, t);
    if (!estNoeud(C)) continue;
    const D = sur(B, F, t);
    const M = milieu(C, D);
    const E = intersectionDroites(B, M, A, F);
    if (!E) continue;
    const G = intersectionDroites(E, { x: E.x, y: E.y + 1 }, B, F);
    if (!G) continue;
    if (Math.abs(C.x - A.x) < 1.5 || Math.abs(E.x - C.x) < 1 || distance(E, F) < 1) continue;
    if (!dansCadre(E, 0.5) || !dansCadre(D, 0.5) || !dansCadre(G, 0.4) || !dansCadre(B, 0.5)) continue;
    if (!espaces([A, B, C, D, M, E, F], 0.8)) continue;
    if (angleEntre(B, M, A, F) < 10) continue;
    // (BM) ne doit pas sembler horizontale : on la confondrait avec une droite parallèle à la vitre.
    if (angleEntre(B, M, HORIZ_A, HORIZ_B) < 8) continue;
    const etape1: EtapeConstructionFuite = {
      cible: "D",
      position: D,
      surHorizon: false,
      supports: [{ a: B, b: F, nature: "fuyante", description: "la fuyante (BF)" }, verticale(C, "C")],
      consigne: "Place le sommet D du deuxième poteau.",
      aides: [
        "Les sommets des poteaux, tous à la même hauteur, sont sur une droite parallèle à la ligne des pieds : sur le dessin, c'est une fuyante, qui passe par le point de fuite F.",
        "D est sur la fuyante (BF) et sur la verticale qui passe par C : un poteau reste vertical sur le dessin.",
      ],
      justification: "Les sommets des poteaux sont sur une droite parallèle à (AC) dans la réalité : sur le dessin, c'est la fuyante (BF). Le poteau [CD] est vertical, donc parallèle à la vitre : il reste vertical. D est l'intersection de (BF) et de la verticale qui passe par C.",
      ajout: { points: [pt("D", D, "construit"), pt("M", M, "construit")], segments: [seg(C, D, "objet"), seg(B, F, "aide")] },
    };
    const etape2: EtapeConstructionFuite = {
      cible: "E",
      position: E,
      surHorizon: false,
      supports: [
        { a: B, b: M, nature: "droite", description: "la droite (BM)" },
        { a: A, b: F, nature: "fuyante", description: "la fuyante (AF)" },
      ],
      consigne: "M est le milieu du poteau [CD]. Place le pied E du troisième poteau : dans la réalité, il est à la même distance de C que C l'est de A.",
      aides: [
        "Sur le dessin, l'écart entre les poteaux diminue : on ne peut pas le reporter à la règle. Utilise le milieu M du deuxième poteau.",
        "Dans la réalité, la droite (BM) descend d'une demi-hauteur de poteau à chaque écart : elle touche le sol au pied du poteau suivant, sur la fuyante (AF).",
      ],
      justification: "Dans la réalité, la droite qui part du sommet B du premier poteau et passe par le milieu M du deuxième descend d'une demi-hauteur à chaque écart : elle atteint le sol un écart plus loin. Sur le dessin, M reste au milieu de [CD] (le poteau est parallèle à la vitre). E est donc l'intersection de (BM) et de la fuyante (AF) ; le troisième poteau est vertical, son sommet est sur (BF).",
      ajout: { points: [pt("E", E, "construit")], segments: [seg(E, G, "objet"), seg(B, E, "aide")] },
    };
    return {
      variante: "poteaux",
      horizon: h,
      contexte: "Une rangée de poteaux verticaux, tous de la même hauteur et régulièrement espacés, s'éloigne le long d'une route. Elle est dessinée en perspective centrale : le premier poteau est [AB], les pieds des poteaux sont sur la fuyante (AF), où F est le point de fuite sur la ligne d'horizon (en pointillé), et C est le pied du deuxième poteau.",
      consigneConstruction: "Construis le sommet D du deuxième poteau, puis, à l'aide du milieu M de [CD], le pied E du troisième poteau ; dessine ce troisième poteau.",
      base: {
        points: [pt("A", A, "donne"), pt("B", B, "donne"), pt("C", C, "donne"), pt("F", F, "fuite")],
        segments: [seg(A, B, "objet"), seg(A, F, "fuyante")],
      },
      etapes: [etape1, etape2],
      affirmations: tirerAffirmations(AFFIRMATIONS_POTEAUX.vraies, AFFIRMATIONS_POTEAUX.fausses),
    };
  }
  throw new Error("gen105 : aucune rangée de poteaux trouvée");
}

// =================================================================================================
// Panneaux : un second panneau identique, plus loin, sur les mêmes fuyantes
// =================================================================================================

const AFFIRMATIONS_PANNEAUX = {
  vraies: [
    V("Sur le dessin, le côté [IJ] est parallèle au côté [AB].", "[AB] et [IJ] sont parallèles à la vitre : ils restent horizontaux, donc parallèles, sur le dessin."),
    V("Les côtés horizontaux des deux panneaux restent horizontaux sur le dessin.", "Ils sont parallèles à la vitre : ils n'ont pas de point de fuite."),
    V("Le second panneau est dessiné comme un rectangle plus petit, de même forme que le premier.", "Un panneau parallèle à la vitre garde sa forme sur le dessin ; seule sa taille diminue avec la distance."),
    V("Les droites (AI), (BJ), (CK) et (DL) passent toutes par le point de fuite F.", "Elles joignent les coins correspondants des deux panneaux : parallèles dans la réalité, ce sont des fuyantes."),
  ],
  fausses: [
    X("Sur le dessin, les droites (AB) et (IJ) se coupent au point de fuite.", "(AB) et (IJ) sont parallèles à la vitre : elles n'ont pas de point de fuite, elles restent horizontales."),
    X("Le second panneau est dessiné comme un trapèze, parce qu'il est plus loin.", "Il est parallèle à la vitre : il garde sa forme de rectangle sur le dessin, seule sa taille change."),
    X("Sur le dessin, la droite (DL) est horizontale.", "(DL) joint deux coins correspondants : c'est une fuyante, qui passe par le point de fuite F."),
    X("Sur le dessin, le second panneau a la même largeur que le premier, comme en perspective cavalière.", "En perspective cavalière, oui ; en perspective centrale, le panneau le plus loin est dessiné plus petit."),
  ],
};

function genererPanneaux(): ExercicePointFuite {
  for (let essai = 0; essai < 20000; essai++) {
    const h = choisir([5, 6, 7]);
    const F: Pt = { x: entre(1, LARGEUR_GRILLE - 1), y: h };
    const largeur = entre(2, 4);
    const hauteur = entre(2, 4);
    const ya = choisir([1, 2, 3]);
    const yd = ya + hauteur;
    if (Math.abs(ya - h) < 1 || Math.abs(yd - h) < 1) continue;
    const xa = entre(1, LARGEUR_GRILLE - 1 - largeur);
    const A: Pt = { x: xa, y: ya };
    const B: Pt = { x: xa + largeur, y: ya };
    const C: Pt = { x: xa + largeur, y: yd };
    const D: Pt = { x: xa, y: yd };
    const t = choisir([1 / 4, 1 / 3, 2 / 5, 1 / 2, 3 / 5, 2 / 3]);
    const I = sur(A, F, t);
    if (!estNoeud(I)) continue;
    const J = sur(B, F, t);
    const K = sur(C, F, t);
    const L = sur(D, F, t);
    const ecartX = Math.max(I.x - C.x, A.x - J.x);
    const ecartY = Math.max(I.y - C.y, A.y - L.y);
    if (Math.max(ecartX, ecartY) < 0.6) continue;
    // F franchement à côté du panneau : aucune fuyante verticale, aucune fuyante qui traverse le panneau.
    if (F.x > xa - 1 && F.x < xa + largeur + 1) continue;
    if (J.x - I.x < 1.2 || L.y - I.y < 1.2) continue;
    if (angleEntre(B, F, HORIZ_A, HORIZ_B) < 12 || angleEntre(D, F, HORIZ_A, VERT_B) < 12) continue;
    if (![I, J, K, L].every((p) => dansCadre(p, 0.4)) || !dansCadre(F, 0.7)) continue;
    if (!espaces([A, B, C, D, I, J, K, L, F], 0.8)) continue;
    const etape1: EtapeConstructionFuite = {
      cible: "J",
      position: J,
      surHorizon: false,
      supports: [{ a: B, b: F, nature: "fuyante", description: "la fuyante (BF)" }, horizontale(I, "I")],
      consigne: "Place le coin J du second panneau (en bas à droite).",
      aides: [
        "Le second panneau est la copie du premier, plus loin : chacun de ses coins est sur la fuyante issue du coin correspondant du premier panneau.",
        "J est sur la fuyante (BF) et sur l'horizontale qui passe par I : le côté [IJ] est parallèle à la vitre.",
      ],
      justification: "Dans la réalité, [BJ] est parallèle à [AI] : J est sur la fuyante (BF). Le côté [IJ] est parallèle à la vitre, donc horizontal sur le dessin : J est sur l'horizontale qui passe par I.",
      ajout: { points: [pt("J", J, "construit")], segments: [seg(I, J, "trait"), seg(B, F, "aide")] },
    };
    const etape2: EtapeConstructionFuite = {
      cible: "L",
      position: L,
      surHorizon: false,
      supports: [{ a: D, b: F, nature: "fuyante", description: "la fuyante (DF)" }, verticale(I, "I")],
      consigne: "Place le coin L du second panneau (en haut à gauche).",
      aides: ["L est le coin qui correspond à D : il est sur une fuyante.", "L est sur la fuyante (DF) et sur la verticale qui passe par I : le côté [IL] reste vertical."],
      justification: "L est sur la fuyante (DF), et le côté [IL], vertical, reste vertical sur le dessin : L est sur la verticale qui passe par I. Le dernier coin K est sur la fuyante (CF), à la verticale de J.",
      ajout: {
        points: [pt("L", L, "construit"), pt("K", K, "construit")],
        segments: [seg(J, K, "trait"), seg(K, L, "trait"), seg(L, I, "trait"), seg(A, F, "aide"), seg(D, F, "aide"), seg(C, F, "aide")],
      },
    };
    return {
      variante: "panneaux",
      horizon: h,
      contexte: "Deux panneaux rectangulaires identiques, parallèles à la vitre, sont plantés l'un derrière l'autre. Ils sont dessinés en perspective centrale : le premier panneau est ABCD ; le second, IJKL, est plus loin ; son coin I, qui correspond à A, est sur la fuyante (AF). F est le point de fuite, sur la ligne d'horizon (en pointillé).",
      consigneConstruction: "Construis les coins J et L du second panneau IJKL, puis complète-le.",
      base: {
        points: [pt("A", A, "donne"), pt("B", B, "donne"), pt("C", C, "donne"), pt("D", D, "donne"), pt("I", I, "donne"), pt("F", F, "fuite")],
        segments: [seg(A, B, "trait"), seg(B, C, "trait"), seg(C, D, "trait"), seg(D, A, "trait")],
      },
      etapes: [etape1, etape2],
      affirmations: tirerAffirmations(AFFIRMATIONS_PANNEAUX.vraies, AFFIRMATIONS_PANNEAUX.fausses),
    };
  }
  throw new Error("gen105 : aucune paire de panneaux trouvée");
}

// --- Catalogue -----------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VariantePointFuite; label: string }[] = [
  { id: "boite", label: "Trouver le point de fuite d'une boîte" },
  { id: "carrelage", label: "Compléter un carrelage" },
  { id: "poteaux", label: "Rangée de poteaux" },
  { id: "panneaux", label: "Placer un objet sur les mêmes fuyantes" },
];

const GENERATEURS: Record<VariantePointFuite, () => ExercicePointFuite> = {
  boite: genererBoite,
  carrelage: genererCarrelage,
  poteaux: genererPoteaux,
  panneaux: genererPanneaux,
};

export function construireAvecVariante(id: string): ExercicePointFuite {
  const variante = CATALOGUE_VARIANTES.find((v) => v.id === id)?.id ?? "boite";
  return GENERATEURS[variante]();
}

export function genererExercicePointFuite(): ExercicePointFuite {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Exposé pour les tests : dimensions du quadrillage. */
export const DIMENSIONS_GRILLE = { largeur: LARGEUR_GRILLE, hauteur: HAUTEUR_GRILLE };
