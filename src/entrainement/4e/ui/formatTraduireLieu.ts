import type { Droite, ExerciceTraduireLieu, LieuDeuxParalleles, LieuDistanceDroite, LieuMediatrice, LieuParabole, Pt } from "../core/traduireLieu.types";
import { verifierEquationXY } from "../moteur/equationXY";
import { mono, moinsH, q, somme } from "./corrigeChapitre3";
import type { ChampNombre, ChampPersonnalise, EcranTSD } from "./ecransTransfertSecondDegre";
import { AIDE_SAISIE_EQUATION, carreLatex, champCercle, champDroite, droiteNormale, droitePoints, milieu, reduireDroite } from "./geometrieLotG";
import { COULEURS, champPoints, colonne, fenetreAutour, figureRepere, lireDroite, l, nombreTexte, t, type Fr } from "./outilsAnalytiqueLotG";

/**
 * Textes, écrans et figures de gen131 « Traduire un lieu géométrique en équation » — SOURCE UNIQUE
 * (écran, aides, papier, corrigé). Notations du cours : point A(x ; y) écrit `A(1\,;\,2)`, droite
 * d ≡ ax + by + c = 0, vecteur normal en colonne, cercle (x − x₀)² + (y − y₀)² = r², parabole
 * (x − x_S)² = 2p(y − y_S) avec p SIGNÉ (§ 9). Jamais « déterminant », aucun radian.
 */

type E = ExerciceTraduireLieu;

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

export const coordL = (P: Pt) => `(${q(P.x)}\\,;\\,${q(P.y)})`;
export const pointL = (nom: string, P: Pt) => `${nom}${coordL(P)}`;
export const MXY = "M(x\\,;\\,y)";

/** « ax+by+c » (coefficients éventuellement fractionnaires). */
export function membre(d: Droite): string {
  return somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);
}

/** « ax+by+c=0 ». */
export function implicite(d: Droite): string {
  return `${membre(d)}=0`;
}

/** Équation d'une droite telle qu'on l'écrit au résultat : « y=5 », « x=-2 », sinon la forme
 * implicite à coefficients entiers premiers entre eux. */
export function equationDroite(d0: Droite): string {
  const d = reduireDroite(d0);
  if (d.a === 0) return `y=${q(-d.c / d.b)}`;
  if (d.b === 0) return `x=${q(-d.c / d.a)}`;
  return implicite(d);
}

/** Droite d donnée dans l'énoncé de « distance-droite ». */
export function droiteDonneeL(e: LieuDistanceDroite): string {
  if (e.type === "horizontale") return `y=${q(e.A.y)}`;
  if (e.type === "verticale") return `x=${q(e.A.x)}`;
  return implicite(e.d);
}

export const d1De = (e: LieuDeuxParalleles): Droite => ({ a: e.a, b: e.b, c: e.c1 });
/** d₂ telle qu'elle est écrite (multipliée par k). */
export const d2Ecrite = (e: LieuDeuxParalleles): Droite => ({ a: e.k * e.a, b: e.k * e.b, c: e.k * e.c2 });
export const d2Ramenee = (e: LieuDeuxParalleles): Droite => ({ a: e.a, b: e.b, c: e.c2 });
export const lieuParalleles = (e: LieuDeuxParalleles): Droite => ({ a: e.a, b: e.b, c: (e.c1 + e.c2) / 2 });

/** Les deux droites du lieu « à la distance r de d » : la première du côté où pointe n. */
export function droitesDistance(e: LieuDistanceDroite): [Droite, Droite] {
  const nn = e.n.x * e.n.x + e.n.y * e.n.y;
  const delta = e.r * Math.sqrt(nn);
  return [
    { a: e.d.a, b: e.d.b, c: e.d.c - delta },
    { a: e.d.a, b: e.d.b, c: e.d.c + delta },
  ];
}

/** Points B = A + (r/‖n‖)·n et B′ = A − (r/‖n‖)·n. */
export function pointsDistance(e: LieuDistanceDroite): [Pt, Pt] {
  const f = e.r / Math.hypot(e.n.x, e.n.y);
  return [
    { x: e.A.x + f * e.n.x, y: e.A.y + f * e.n.y },
    { x: e.A.x - f * e.n.x, y: e.A.y - f * e.n.y },
  ];
}

/** Médiatrice brute « gauche − droite » de MA² = MB² : 2(x_B − x_A)x + 2(y_B − y_A)y + (x_A² + y_A² − x_B² − y_B²) = 0. */
export function mediatriceBrute(e: LieuMediatrice): Droite {
  const { A, B } = e;
  return { a: 2 * (B.x - A.x), b: 2 * (B.y - A.y), c: A.x * A.x + A.y * A.y - B.x * B.x - B.y * B.y };
}
export const mediatrice = (e: LieuMediatrice): Droite => reduireDroite(mediatriceBrute(e));

/** Parabole : p signé et sommet S. */
export function parametresParabole(e: LieuParabole): { p: number; S: Pt } {
  if (e.axe === "vertical") return { p: e.F.y - e.k, S: { x: e.F.x, y: (e.F.y + e.k) / 2 } };
  return { p: e.F.x - e.k, S: { x: (e.F.x + e.k) / 2, y: e.F.y } };
}

/** « 8(y-1) », « -4y », « 2(y+3) ». */
function produitP(coef: number, v: number, variable: "x" | "y"): string {
  if (v === 0) return mono(coef, variable);
  return `${coef === 1 ? "" : coef === -1 ? "-" : q(coef)}(${moinsH(v, variable)})`;
}

/** Équation de la parabole du cours, avec p substitué. */
export function equationParabole(e: LieuParabole, p = parametresParabole(e).p, S = parametresParabole(e).S): string {
  if (e.axe === "vertical") return `${carreLatex(S.x, "x")}=${produitP(2 * p, S.y, "y")}`;
  return `${carreLatex(S.y, "y")}=${produitP(2 * p, S.x, "x")}`;
}

export function fonctionParabole(e: LieuParabole, p: number, S: Pt) {
  return e.axe === "vertical" ? (x: number, y: number) => (x - S.x) ** 2 - 2 * p * (y - S.y) : (x: number, y: number) => (y - S.y) ** 2 - 2 * p * (x - S.x);
}

export const directriceL = (e: LieuParabole) => (e.axe === "vertical" ? `y=${q(e.k)}` : `x=${q(e.k)}`);

export function cercleL(C: Pt, r: number): string {
  return `${carreLatex(C.x, "x")}+${carreLatex(C.y, "y")}=${q(r * r)}`;
}

/** « (x-1)^2+(y-2)^2 » : MA² développé dans le repère. */
export const carreDistance = (P: Pt) => `${carreLatex(P.x, "x")}+${carreLatex(P.y, "y")}`;

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

/** Description du lieu (la donnée propre à l'instance : la LIGNE d'un regroupement). */
export function description(e: E): Fr {
  switch (e.variante) {
    case "mediatrice":
      return [t("équidistants des points "), l(pointL("A", e.A)), t(" et "), l(pointL("B", e.B))];
    case "distance-droite":
      return [t(`situés à la distance ${e.r} de la droite `), l(`d\\equiv ${droiteDonneeL(e)}`)];
    case "deux-paralleles":
      return [t("équidistants des droites parallèles "), l(`d_1\\equiv ${implicite(d1De(e))}`), t(" et "), l(`d_2\\equiv ${implicite(d2Ecrite(e))}`)];
    case "parabole":
      return [t("équidistants du point "), l(pointL("F", e.F)), t(" et de la droite "), l(`d\\equiv ${directriceL(e)}`)];
    case "cercle":
      return [t(`situés à la distance ${e.r} du point `), l(pointL("C", e.C))];
  }
}

export function enonceFragments(e: E): Fr {
  return [t("On considère le lieu des points "), l(MXY), t(" "), ...description(e), t(".")];
}

export const CONSIGNE_PAPIER = "Reconnais ce lieu et détermine son équation (ou ses équations).";
export const CONSIGNE_GENERALE = "Un lieu est décrit par une phrase : reconnais-le, puis traduis la phrase en équation.";

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function natureTexte(e: E): string {
  switch (e.variante) {
    case "mediatrice":
      return "la médiatrice de [AB]";
    case "distance-droite":
      return "la réunion de deux droites parallèles à d, une de chaque côté";
    case "deux-paralleles":
      return "la droite parallèle à d₁ et à d₂, à mi-chemin entre elles";
    case "parabole":
      return "la parabole de foyer F et de directrice d";
    case "cercle":
      return "le cercle de centre C et de rayon " + e.r;
  }
}

/** Équation(s) finale(s), en LaTeX. */
export function equationsFinales(e: E): string[] {
  switch (e.variante) {
    case "mediatrice":
      return [equationDroite(mediatrice(e))];
    case "distance-droite":
      return droitesDistance(e).map(equationDroite);
    case "deux-paralleles":
      return [equationDroite(lieuParalleles(e))];
    case "parabole":
      return [equationParabole(e)];
    case "cercle":
      return [cercleL(e.C, e.r)];
  }
}

export function reponseBreveFragments(e: E): Fr {
  const eqs = equationsFinales(e);
  const sortie: Fr = [t(`${natureTexte(e).replace(/^./, (c) => c.toUpperCase())} : `)];
  eqs.forEach((x, i) => {
    if (i > 0) sortie.push(t(" et "));
    sortie.push(l(x));
  });
  return sortie;
}

// ---------------------------------------------------------------------------------------------
// Figures (corrigé et écran une fois la réponse donnée) — quadrillage d'une unité, aucun `id`
// ---------------------------------------------------------------------------------------------

export function figureLieu(e: E): string {
  switch (e.variante) {
    case "mediatrice": {
      const I = milieu(e.A, e.B);
      return figureRepere({
        fenetre: fenetreAutour([e.A, e.B], 2, 8),
        unite: 20,
        droites: [{ d: mediatrice(e), couleur: COULEURS.accent }],
        segments: [{ A: e.A, B: e.B, couleur: COULEURS.gris, pointille: true }],
        points: [
          { P: e.A, label: "A", position: "so" },
          { P: e.B, label: "B", position: "ne" },
          { P: I, label: "I", position: "se", couleur: COULEURS.vert },
        ],
      });
    }
    case "distance-droite": {
      const [B, Bp] = pointsDistance(e);
      const [g1, g2] = droitesDistance(e);
      // Fenêtre : B, B′ et un morceau de chaque droite de part et d'autre (les parallèles traversent la figure).
      const nn = Math.hypot(e.n.x, e.n.y);
      const u = { x: -e.n.y / nn, y: e.n.x / nn };
      const ext = Math.max(4, 0.6 * e.r);
      const fen = fenetreAutour([e.A, B, Bp].flatMap((P) => [P, { x: P.x + ext * u.x, y: P.y + ext * u.y }, { x: P.x - ext * u.x, y: P.y - ext * u.y }]), 1, 8);
      return figureRepere({
        fenetre: fen,
        // Repère d'au plus ≈ 300 px de côté : la figure tient dans la colonne du corrigé.
        unite: Math.min(20, Math.floor(300 / Math.max(fen.xMax - fen.xMin, fen.yMax - fen.yMin))),
        droites: [
          { d: e.d, couleur: COULEURS.gris, label: "d" },
          { d: g1, couleur: COULEURS.accent },
          { d: g2, couleur: COULEURS.accent },
        ],
        segments: [{ A: Bp, B, couleur: COULEURS.vert, pointille: true }],
        points: [
          { P: e.A, label: "A", position: "ne" },
          { P: B, label: "B", position: "ne", couleur: COULEURS.vert },
          { P: Bp, label: "B′", position: "so", couleur: COULEURS.vert },
        ],
      });
    }
    case "deux-paralleles": {
      const d1 = d1De(e);
      const d2 = d2Ramenee(e);
      const pts: Pt[] = [];
      for (const d of [d1, d2]) pts.push(d.b !== 0 ? { x: 0, y: -d.c / d.b } : { x: -d.c / d.a, y: 0 });
      return figureRepere({
        fenetre: fenetreAutour(pts, 2, 8),
        unite: 20,
        droites: [
          { d: d1, couleur: COULEURS.gris, label: "d₁" },
          { d: d2, couleur: COULEURS.gris, label: "d₂" },
          { d: lieuParalleles(e), couleur: COULEURS.accent },
        ],
      });
    }
    case "parabole": {
      const { p, S } = parametresParabole(e);
      const H: Pt = e.axe === "vertical" ? { x: e.F.x, y: e.k } : { x: e.k, y: e.F.y };
      const fen = fenetreAutour([e.F, H, e.axe === "vertical" ? { x: S.x + Math.abs(p) + 1, y: e.F.y } : { x: e.F.x, y: S.y + Math.abs(p) + 1 }, e.axe === "vertical" ? { x: S.x - Math.abs(p) - 1, y: e.F.y } : { x: e.F.x, y: S.y - Math.abs(p) - 1 }], 1, 8);
      const points: Pt[] = [];
      for (let s = -14; s <= 14; s += 0.05) {
        const u = s;
        const v = (u * u) / (2 * p);
        points.push(e.axe === "vertical" ? { x: S.x + u, y: S.y + v } : { x: S.x + v, y: S.y + u });
      }
      return figureRepere({
        fenetre: fen,
        unite: 20,
        droites: [{ d: e.axe === "vertical" ? { a: 0, b: 1, c: -e.k } : { a: 1, b: 0, c: -e.k }, couleur: COULEURS.gris, label: "d", pointille: true }],
        courbes: [{ points, couleur: COULEURS.accent }],
        points: [
          { P: e.F, label: "F", position: e.axe === "vertical" ? "e" : "n", couleur: COULEURS.vert },
          { P: S, label: "S", position: e.axe === "vertical" ? (p > 0 ? "s" : "n") : p > 0 ? "o" : "e" },
        ],
      });
    }
    case "cercle":
      return figureRepere({
        fenetre: fenetreAutour([
          { x: e.C.x - e.r, y: e.C.y - e.r },
          { x: e.C.x + e.r, y: e.C.y + e.r },
        ]),
        unite: 20,
        cercles: [{ centre: e.C, rayon: e.r, couleur: COULEURS.accent }],
        segments: [{ A: e.C, B: { x: e.C.x + e.r, y: e.C.y }, couleur: COULEURS.vert }],
        points: [{ P: e.C, label: "C", position: "no" }],
      });
  }
}

// ---------------------------------------------------------------------------------------------
// Champ « deux équations de droites » (lieu à la distance r d'une droite)
// ---------------------------------------------------------------------------------------------

const memeDroite = (u: Droite, v: Droite) => Math.abs(u.a * v.b - v.a * u.b) < 1e-7 && Math.abs(u.a * v.c - v.a * u.c) < 1e-7 && Math.abs(u.b * v.c - v.b * u.c) < 1e-7;

/** Saisie « éq1 ; éq2 » (« et », « ou », retour à la ligne acceptés) → droites, `null` si un morceau est illisible. */
export function lireDroites(saisie: string): Droite[] | null {
  const morceaux = saisie
    .split(/;|\n|\bet\b|\bou\b/i)
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  if (morceaux.length === 0) return null;
  const droites: Droite[] = [];
  for (const m of morceaux) {
    const d = lireDroite(m);
    if (!d) return null;
    if (!droites.some((x) => memeDroite(x, d))) droites.push(d);
  }
  return droites;
}

export function champDeuxDroites(o: { id: string; cibles: [Droite, Droite]; pieges: { droites: Droite[]; message: string }[]; messageSiFaux: string }): ChampPersonnalise {
  const memeEnsemble = (u: Droite[], v: Droite[]) => u.length === v.length && u.every((d) => v.some((w) => memeDroite(d, w)));
  const affichee = (s: string) => {
    const ds = lireDroites(s);
    return ds ? ds.map((d) => equationDroite(d)).join("\\ ;\\ ") : null;
  };
  return {
    type: "personnalise",
    id: o.id,
    libelle: [t("Les équations :")],
    aideSaisie: "Écris les deux équations séparées par « ; », par exemple y = 5 ; y = −1 (toute forme équivalente est acceptée).",
    apercuLatex: affichee,
    affichee,
    verifier: (saisie) => {
      if (!/=/.test(saisie)) {
        return /[xy]/.test(saisie) ? { etat: "forme", message: "Écris des équations complètes, avec le signe « = » (par exemple $y=5$ ; $y=-1$)." } : { etat: "parse_error" };
      }
      const ds = lireDroites(saisie);
      if (!ds) return { etat: "parse_error" };
      if (memeEnsemble(ds, o.cibles)) return { etat: "correct" };
      const p = o.pieges.find((x) => memeEnsemble(ds, x.droites));
      if (p) return { etat: "piege", message: p.message };
      if (ds.length === 1 && o.cibles.some((c) => memeDroite(c, ds[0]!))) {
        return { etat: "piege", message: "Ta droite est juste, mais il en manque une : les points à la distance r de d sont de part et d'autre de d, le lieu est la réunion de deux parallèles." };
      }
      if (ds.length === 2 && ds.filter((d) => o.cibles.some((c) => memeDroite(c, d))).length === 1) return { etat: "faux", message: "Une seule de tes deux droites est juste : vérifie l'autre." };
      if (ds.length > 2) return { etat: "faux", message: "Le lieu est formé de deux droites exactement : écris-en deux." };
      return { etat: "faux", message: o.messageSiFaux };
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Écrans
// ---------------------------------------------------------------------------------------------

/** Options de l'écran « nature » (indice 0 = la bonne) et explication de chaque option fausse. */
function optionsNature(e: E): { options: string[]; explications: string[] } {
  switch (e.variante) {
    case "mediatrice":
      return {
        options: ["La médiatrice de [AB]", "La droite (AB)", "Le cercle de diamètre [AB]", "La perpendiculaire à (AB) passant par A"],
        explications: [
          "",
          "La droite (AB) passe par A : or A n'est pas à égale distance de A et de B (MA = 0 mais MB = AB).",
          "Un cercle n'a pas une équation du premier degré : ici, les termes en x² et y² se sont éliminés, il reste une droite.",
          "Le point A n'est pas équidistant de A et de B : la droite cherchée passe par le milieu I de [AB], pas par A.",
        ],
      };
    case "distance-droite":
      return {
        options: ["Deux droites parallèles à d, une de chaque côté", "Une seule droite parallèle à d", "Un cercle de rayon " + e.r, "Une droite perpendiculaire à d"],
        explications: [
          "",
          "Une seule parallèle ne contient pas tous les points du lieu : on peut s'écarter de d d'un côté ou de l'autre.",
          "Un cercle rassemble les points à une distance donnée d'un point, pas d'une droite.",
          "Les points d'une perpendiculaire à d sont à toutes les distances de d (de 0 à l'infini).",
        ],
      };
    case "deux-paralleles":
      return {
        options: ["Une droite parallèle à d₁ et à d₂, à mi-chemin", "Deux droites parallèles à d₁ et à d₂", "Une droite perpendiculaire à d₁ et à d₂", "Un cercle"],
        explications: [
          "",
          "Les droites d₁ et d₂ ne sont pas des points du lieu ; entre elles, une seule parallèle est à égale distance des deux.",
          "Sur une perpendiculaire, seul le point situé au milieu est équidistant de d₁ et de d₂.",
          "Aucune distance n'est fixée ici : on compare deux distances à des droites parallèles, le lieu est une droite.",
        ],
      };
    case "parabole":
      return {
        options: ["Une parabole de foyer F et de directrice d", "Un cercle de centre F", "Une droite parallèle à d", "Deux droites parallèles à d"],
        explications: [
          "",
          "Un cercle de centre F fixe la distance à F ; ici, la distance à F doit être égale à la distance à d, qui change d'un point à l'autre.",
          "Seul le sommet est à mi-chemin entre F et d sur une parallèle à d : les autres points du lieu s'en écartent.",
          "Les points équidistants d'un point et d'une droite ne sont pas sur des droites : c'est la définition de la parabole (§ 9).",
        ],
      };
    case "cercle":
      return {
        options: [`Le cercle de centre C et de rayon ${e.r}`, `Le disque de centre C et de rayon ${e.r}`, "Deux droites parallèles", "Une parabole de foyer C"],
        explications: [
          "",
          "Le disque contient aussi les points intérieurs, à une distance de C plus petite que le rayon.",
          "Deux parallèles sont les points à une distance donnée d'une droite, pas d'un point.",
          "Une parabole demande un point ET une droite (le foyer et la directrice).",
        ],
      };
  }
}

const AIDE_NATURE_1: Fr = [t("Un lieu géométrique est l'ensemble de tous les points qui vérifient la propriété, et d'eux seuls : demande-toi où peuvent se trouver ces points, dans toutes les directions.")];

function aideNature2(e: E): Fr {
  switch (e.variante) {
    case "mediatrice":
      return [t("Le milieu I de [AB] est-il sur ta droite ? Et le vecteur "), l("\\vec{AB}"), t(" est-il normal à ta droite ? Compare avec les coefficients de x et de y.")];
    case "distance-droite":
      return [t(`Place-toi sur d et écarte-toi de ${e.r} perpendiculairement à d : combien de positions trouves-tu ? Fais-le en plusieurs points de d.`)];
    case "deux-paralleles":
      return [t("Sur une perpendiculaire commune à "), l("d_1"), t(" et "), l("d_2"), t(", combien de points sont à égale distance des deux droites ? Recommence plus loin.")];
    case "parabole":
      return [t("Le milieu S entre F et d est un point du lieu ; en s'éloignant de S, la distance à d grandit : le point doit aussi s'éloigner de F. Quelle courbe du cours est définie ainsi (§ 9) ?")];
    case "cercle":
      return [t(`Tous les points du lieu sont à la distance ${e.r} de C, ni plus près ni plus loin : quelle figure du cours (§ 8) ?`)];
  }
}

function ecranNature(e: E, titre = "La nature du lieu"): EcranTSD {
  const { options, explications } = optionsNature(e);
  const ordre = e.ordreNature;
  return {
    type: "choix",
    titre,
    consigne: [t("Quelle est la nature de ce lieu ?")],
    options: ordre.map((i) => [t(options[i]!)]),
    bonne: ordre.indexOf(0),
    aides: [AIDE_NATURE_1, aideNature2(e)],
    messageFaux: "Ce n'était pas la bonne nature (une seule tentative sur un choix fermé).",
    explications: ordre.map((i) => explications[i]!),
  };
}

// --- médiatrice ------------------------------------------------------------------------------

/** Les quatre traductions proposées de MA = MB (indice 0 = la bonne). */
export function traductions(e: LieuMediatrice): string[] {
  const { A, B } = e;
  const lin = (v: number, x: "x" | "y") => (v === 0 ? x : `(${moinsH(v, x)})`);
  return [
    `${carreDistance(A)}=${carreDistance(B)}`,
    `${lin(A.x, "x")}+${lin(A.y, "y")}=${lin(B.x, "x")}+${lin(B.y, "y")}`,
    `${carreLatex(A.x, "x")}+${carreLatex(B.x, "x")}=${carreLatex(A.y, "y")}+${carreLatex(B.y, "y")}`,
    `${carreLatex(-A.x, "x")}+${carreLatex(-A.y, "y")}=${carreLatex(-B.x, "x")}+${carreLatex(-B.y, "y")}`,
  ];
}

const EXPLICATIONS_TRADUCTION = [
  "",
  "Sans les carrés, ce n'est pas une distance : $MA=\\sqrt{(x-x_A)^2+(y-y_A)^2}$ (Pythagore). On élève MA = MB au carré pour faire disparaître les racines.",
  "Chaque distance réunit l'écart des abscisses et l'écart des ordonnées d'un même point : $MA^2=(x-x_A)^2+(y-y_A)^2$.",
  "Le carré de l'écart s'écrit avec une différence : $(x-x_A)^2$. Pour une abscisse 3, c'est $(x-3)^2$, pas $(x+3)^2$.",
];

function ecransMediatrice(e: LieuMediatrice): EcranTSD[] {
  const { A, B } = e;
  const opts = traductions(e);
  const brute = mediatriceBrute(e);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const cible = mediatrice(e);
  return [
    {
      type: "choix",
      titre: "Traduire MA = MB",
      consigne: [t("Le point "), l(MXY), t(" est équidistant de A et de B : "), l("MA=MB"), t(". Quelle équation traduit cette condition ?")],
      options: e.ordreTraduction.map((i) => [l(opts[i]!)]),
      bonne: e.ordreTraduction.indexOf(0),
      aides: [
        [t("Dans un repère orthonormé, la distance de M à A se calcule par Pythagore : "), l("MA=\\sqrt{(x-x_A)^2+(y-y_A)^2}"), t(". Deux distances positives sont égales exactement quand leurs carrés le sont.")],
        [t("Ici, "), l(pointL("A", A)), t(" : "), l(`MA^2=${carreDistance(A)}`), t(". Écris de même "), l("MB^2"), t(", puis l'égalité des deux carrés.")],
      ],
      messageFaux: "Ce n'était pas la bonne traduction (une seule tentative sur un choix fermé).",
      explications: e.ordreTraduction.map((i) => EXPLICATIONS_TRADUCTION[i]!),
    },
    {
      type: "champs",
      titre: "Développer et réduire",
      consigne: [t("Développe les deux membres de "), l(opts[0]!), t(" et réduis : écris l'équation du lieu.")],
      champs: [
        champDroite(
          "lieu",
          [t("Équation :")],
          cible,
          [
            { d: { a: dx, b: dy, c: brute.c }, message: "Tu as oublié le double produit : $(x-a)^2=x^2-2ax+a^2$." },
            { d: { a: brute.a, b: brute.b, c: -brute.c }, message: "Le terme constant a le mauvais signe : en passant tout dans le membre de gauche, les termes du membre de droite changent de signe." },
            { d: droitePoints(A, B), message: "C'est la droite (AB) : or A et B ne sont pas des points du lieu (MA = 0 mais MB ≠ 0 pour M = A)." },
            { d: droiteNormale(A, { x: dx, y: dy }), message: "Ta droite a la bonne direction mais passe par A : refais le développement des constantes." },
          ],
          "Développe chaque carré avec $(x-a)^2=x^2-2ax+a^2$ : les termes $x^2$ et $y^2$ disparaissent des deux côtés.",
        ),
      ],
      aides: [
        [t("Développe chaque carré : "), l("(x-a)^2=x^2-2ax+a^2"), t(". Les termes "), l("x^2"), t(" et "), l("y^2"), t(" apparaissent dans les deux membres : ils s'éliminent, il reste une équation du premier degré.")],
        [t("Ici, le membre de gauche devient "), l(somme([[1, "x^2"], [-2 * A.x, "x"], [A.x * A.x, ""], [1, "y^2"], [-2 * A.y, "y"], [A.y * A.y, ""]])), t(". Développe le membre de droite, retire "), l("x^2"), t(" et "), l("y^2"), t(", puis passe tout à gauche.")],
      ],
      reponse: [l(equationDroite(cible))],
    },
    { ...ecranNature(e), figureApres: figureLieu(e) },
  ];
}

// --- distance à une droite -------------------------------------------------------------------

function ecransDistance(e: LieuDistanceDroite): EcranTSD[] {
  const [g1, g2] = droitesDistance(e);
  const n = e.n;
  const norme = Math.hypot(n.x, n.y);
  const ecranEquations = (aide2: Fr): EcranTSD => {
    const pieges: { droites: Droite[]; message: string }[] = [];
    if (e.type === "oblique") {
      pieges.push({ droites: [{ ...e.d, c: e.d.c - e.r }, { ...e.d, c: e.d.c + e.r }], message: `Tu as changé le terme constant de ${e.r} : l'écart entre deux parallèles n'est pas l'écart de leurs termes constants (il faut diviser par la norme du vecteur normal). Passe par les points B et B′.` });
    } else {
      const k = e.type === "horizontale" ? e.A.y : e.A.x;
      const v = e.type === "horizontale";
      pieges.push({ droites: [v ? { a: 0, b: 1, c: -e.r } : { a: 1, b: 0, c: -e.r }, v ? { a: 0, b: 1, c: e.r } : { a: 1, b: 0, c: e.r }], message: `Ces droites sont à la distance ${e.r} de l'axe, pas de d : pars de $${v ? "y" : "x"}=${q(k)}$.` });
      pieges.push({ droites: [v ? { a: 1, b: 0, c: -(k + e.r) } : { a: 0, b: 1, c: -(k + e.r) }, v ? { a: 1, b: 0, c: -(k - e.r) } : { a: 0, b: 1, c: -(k - e.r) }], message: `Les droites du lieu sont parallèles à d, donc ${v ? "horizontales" : "verticales"}.` });
    }
    return {
      type: "champs",
      titre: "Les deux équations",
      consigne: [t("Écris les équations des deux droites qui forment le lieu (sépare-les par « ; »).")],
      champs: [champDeuxDroites({ id: "lieu", cibles: [g1, g2], pieges, messageSiFaux: "Les deux droites du lieu sont parallèles à d et passent à la distance r de d, une de chaque côté." })],
      aides: [
        e.type === "oblique"
          ? [t("Les droites du lieu sont parallèles à d : elles ont le même vecteur normal "), l(`\\vec{n}${colonne(n.x, n.y)}`), t(", donc une équation "), l(`${membre({ a: n.x, b: n.y, c: 0 })}+c=0`), t(". Chacune passe par l'un des points B et B′.")]
          : [t("La distance d'un point M à une droite "), l(e.type === "horizontale" ? "y=k" : "x=k"), t(" est "), l(e.type === "horizontale" ? "|y_M-k|" : "|x_M-k|"), t(" (cours, § 6) : écris que cette distance vaut "), l(String(e.r)), t(".")],
        aide2,
      ],
      reponse: [l(equationDroite(g1)), t(" et "), l(equationDroite(g2))],
      figureApres: figureLieu(e),
    };
  };
  if (e.type !== "oblique") {
    const v = e.type === "horizontale";
    const k = v ? e.A.y : e.A.x;
    return [ecranNature(e), ecranEquations([t("Ici, "), l(v ? `|y-${k < 0 ? `(${q(k)})` : q(k)}|=${e.r}` : `|x-${k < 0 ? `(${q(k)})` : q(k)}|=${e.r}`), t(" : l'écart vaut "), l(String(e.r)), t(" ou "), l(String(-e.r)), t(". Résous les deux cas.")])];
  }
  const [B, Bp] = pointsDistance(e);
  const f = e.r / norme;
  const ecranPoints: EcranTSD = {
    type: "champs",
    titre: "Deux points du lieu",
    consigne: [
      t("Le point "),
      l(pointL("A", e.A)),
      t(" est sur d, et "),
      l(`\\vec{n}${colonne(n.x, n.y)}`),
      t(` est un vecteur normal à d. Donne les deux points B et B′ situés à la distance ${e.r} de A sur la perpendiculaire à d (un de chaque côté).`),
    ],
    champs: [
      champPoints({
        id: "BB",
        libelle: [t("B et B′ :")],
        cibles: [B, Bp],
        pieges: [
          ...(f !== 1
            ? [
                {
                  points: [
                    { x: e.A.x + n.x, y: e.A.y + n.y },
                    { x: e.A.x - n.x, y: e.A.y - n.y },
                  ],
                  message: `En ajoutant $\\vec{n}$, on s'écarte de sa norme, 5, pas de ${e.r} : multiplie d'abord $\\vec{n}$ par $\\dfrac{${e.r}}{5}$.`,
                },
              ]
            : []),
          {
            points: [
              { x: e.A.x + e.r * n.x, y: e.A.y + e.r * n.y },
              { x: e.A.x - e.r * n.x, y: e.A.y - e.r * n.y },
            ],
            message: `Le vecteur $${e.r}\\vec{n}$ a pour norme $${e.r}\\cdot 5$, pas ${e.r} : il faut diviser par la norme de $\\vec{n}$.`,
          },
        ],
        messageSiFaux: "Pars de A et avance le long du vecteur normal d'une longueur égale à la distance demandée, dans un sens puis dans l'autre.",
      }),
    ],
    aides: [
      [t("Un vecteur de même direction que "), l("\\vec{n}"), t(" et de norme r est "), l("\\dfrac{r}{\\|\\vec{n}\\|}\\,\\vec{n}"), t(" : on l'ajoute à A, puis on le retire.")],
      [t("Ici, "), l(`\\|\\vec{n}\\|=\\sqrt{${n.x}^2+${n.y < 0 ? `(${n.y})` : n.y}^2}=5`), t(" ; calcule "), l(`\\dfrac{${e.r}}{5}\\,\\vec{n}`), t(", puis "), l("A+\\dfrac{r}{5}\\,\\vec{n}"), t(" et "), l("A-\\dfrac{r}{5}\\,\\vec{n}"), t(".")],
    ],
    reponse: [l(pointL("B", B)), t(" et "), l(pointL("B'", Bp))],
  };
  return [ecranNature(e), ecranPoints, ecranEquations([t("Ici, la parallèle par "), l(pointL("B", B)), t(" a pour équation "), l(`${membre({ a: n.x, b: n.y, c: 0 })}+c=0`), t(" : remplace x et y par les coordonnées de B pour trouver c, puis fais de même avec B′.")])];
}

// --- deux parallèles -------------------------------------------------------------------------

function ecransParalleles(e: LieuDeuxParalleles): EcranTSD[] {
  const cible = lieuParalleles(e);
  const pieges: { d: Droite; message: string }[] = [
    { d: { a: e.a, b: e.b, c: e.c1 + e.c2 }, message: "Tu as additionné les termes constants sans diviser par 2 : la parallèle médiane a pour terme constant leur moyenne." },
    { d: d1De(e), message: "C'est la droite $d_1$ elle-même : le lieu est entre $d_1$ et $d_2$." },
    { d: d2Ramenee(e), message: "C'est la droite $d_2$ elle-même : le lieu est entre $d_1$ et $d_2$." },
  ];
  if (e.k !== 1) {
    pieges.push({ d: { a: e.a, b: e.b, c: (e.c1 + e.k * e.c2) / 2 }, message: `Avant de faire la moyenne des termes constants, écris $d_2$ avec les mêmes coefficients de x et de y que $d_1$ : divise son équation par ${nombreTexte(e.k)}.` });
    const a = (1 + e.k) * e.a;
    const b = (1 + e.k) * e.b;
    if (a !== 0 || b !== 0) pieges.push({ d: { a: a / 2, b: b / 2, c: (e.c1 + e.k * e.c2) / 2 }, message: `Tu as fait la moyenne des deux équations telles qu'elles sont écrites : ramène d'abord $d_2$ aux mêmes coefficients que $d_1$ (divise par ${nombreTexte(e.k)}).` });
  }
  const d2 = d2Ecrite(e);
  return [
    ecranNature(e),
    {
      type: "champs",
      titre: "La parallèle médiane",
      consigne: [t("Écris une équation de la droite qui forme le lieu.")],
      champs: [champDroite("lieu", [t("Équation :")], cible, pieges, "La parallèle médiane a le même vecteur normal que $d_1$ et $d_2$, et pour terme constant la moyenne des leurs (une fois les deux équations écrites avec les mêmes coefficients de x et de y).")],
      aides: [
        [t("Deux parallèles écrites avec les mêmes coefficients, "), l("ax+by+c_1=0"), t(" et "), l("ax+by+c_2=0"), t(", ont pour parallèle médiane "), l("ax+by+\\dfrac{c_1+c_2}{2}=0"), t(".")],
        e.k !== 1
          ? [t("Ici, "), l(`d_2\\equiv ${implicite(d2)}`), t(` n'a pas les mêmes coefficients que `), l("d_1"), t(` : divise-la d'abord par ${nombreTexte(e.k)}, puis fais la moyenne des termes constants.`)]
          : [t("Ici, les deux équations ont déjà les mêmes coefficients de x et de y : fais la moyenne de "), l(q(e.c1)), t(" et de "), l(q(e.c2)), t(".")],
      ],
      reponse: [l(equationDroite(cible))],
      figureApres: figureLieu(e),
    },
  ];
}

// --- parabole --------------------------------------------------------------------------------

function ecransParabole(e: LieuParabole): EcranTSD[] {
  const { p, S } = parametresParabole(e);
  const vert = e.axe === "vertical";
  const champsSP: ChampNombre[] = [
    {
      type: "nombre",
      id: "xS",
      libelle: [l("x_S=")],
      cible: S.x,
      pieges: vert ? [] : [{ valeur: e.F.x, message: "C'est l'abscisse du foyer : le sommet est à mi-chemin entre F et la directrice." }, { valeur: e.k, message: "C'est l'abscisse de la directrice : le sommet est à mi-chemin entre F et la directrice." }].filter((x) => x.valeur !== S.x),
      messageSiFaux: "Le sommet est le milieu de F et du point de d le plus proche de F.",
    },
    {
      type: "nombre",
      id: "yS",
      libelle: [l("y_S=")],
      cible: S.y,
      pieges: vert ? [{ valeur: e.F.y, message: "C'est l'ordonnée du foyer : le sommet est à mi-chemin entre F et la directrice." }, { valeur: e.k, message: "C'est l'ordonnée de la directrice : le sommet est à mi-chemin entre F et la directrice." }].filter((x) => x.valeur !== S.y) : [],
      messageSiFaux: "Le sommet est le milieu de F et du point de d le plus proche de F.",
    },
    {
      type: "nombre",
      id: "p",
      libelle: [l("p=")],
      cible: p,
      pieges: [
        { valeur: -p, message: `p est signé : il a le signe de ${vert ? "$y_F-y_S$" : "$x_F-x_S$"} (le foyer est ${vert ? (p > 0 ? "au-dessus" : "en dessous") : p > 0 ? "à droite" : "à gauche"} du sommet).` },
        { valeur: p / 2, message: "C'est la distance du sommet au foyer, $\\dfrac{p}{2}$ : p est la distance du foyer à la directrice (avec son signe)." },
        { valeur: 2 * p, message: "Trop grand : p est la distance (signée) du foyer à la directrice, soit deux fois la distance du sommet au foyer." },
      ],
      messageSiFaux: vert ? "Le paramètre se calcule avec son signe : $p=2(y_F-y_S)$." : "Le paramètre se calcule avec son signe : $p=2(x_F-x_S)$.",
    },
  ];
  const fCible = fonctionParabole(e, p, S);
  const champEq: ChampPersonnalise = {
    type: "personnalise",
    id: "parabole",
    libelle: [t("Équation :")],
    apercu: true,
    aideSaisie: AIDE_SAISIE_EQUATION,
    verifier: (s) =>
      verifierEquationXY(
        s,
        fCible,
        [
          { f: fonctionParabole(e, p / 2, S), message: "Au second membre, c'est 2p : $(x-x_S)^2=2p(y-y_S)$." },
          { f: fonctionParabole(e, -p, S), message: "Attention au signe de p : la parabole s'ouvre du côté du foyer." },
          { f: fonctionParabole(e, p, e.F), message: "Le carré et la parenthèse portent sur le sommet S, pas sur le foyer F." },
        ],
        "La parabole de sommet S et de paramètre p a pour équation " + (vert ? "$(x-x_S)^2=2p(y-y_S)$." : "$(y-y_S)^2=2p(x-x_S)$."),
      ),
  };
  return [
    ecranNature(e),
    {
      type: "champs",
      titre: "Sommet et paramètre",
      consigne: [t("Donne les coordonnées du sommet S et le paramètre p (signé) de cette parabole.")],
      champs: champsSP,
      aides: [
        [t("Le sommet S est à mi-chemin entre le foyer F et la directrice d, sur la perpendiculaire à d menée par F ; "), l(vert ? "p=2(y_F-y_S)" : "p=2(x_F-x_S)"), t(", avec son signe (cours, § 9).")],
        [t("Ici, la perpendiculaire à d par F coupe d en "), l(pointL("H", vert ? { x: e.F.x, y: e.k } : { x: e.k, y: e.F.y })), t(" : S est le milieu de [FH].")],
      ],
      reponse: [l(pointL("S", S)), t(" et "), l(`p=${q(p)}`)],
    },
    {
      type: "champs",
      titre: "L'équation",
      consigne: [t("Écris une équation de la parabole.")],
      champs: [champEq],
      aides: [
        [t(vert ? "Axe vertical (directrice horizontale) : " : "Axe horizontal (directrice verticale) : "), l(vert ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)"), t(" (cours, § 9).")],
        [t("Ici, "), l(pointL("S", S)), t(" et "), l(`p=${q(p)}`), t(" : remplace dans la forme du cours.")],
      ],
      reponse: [l(equationParabole(e))],
      figureApres: figureLieu(e),
    },
  ];
}

// --- cercle ----------------------------------------------------------------------------------

function ecransCercle(e: Extract<E, { variante: "cercle" }>): EcranTSD[] {
  const r2 = e.r * e.r;
  return [
    ecranNature(e),
    {
      type: "champs",
      titre: "L'équation",
      consigne: [t("Écris une équation de ce cercle (non développée ou développée).")],
      champs: [
        champCercle(
          "cercle",
          e.C,
          r2,
          [
            { centre: e.C, r2: e.r, message: "Au second membre, c'est $r^2$, pas r : $(x-x_C)^2+(y-y_C)^2=r^2$." },
            { centre: { x: -e.C.x, y: -e.C.y }, r2, message: "Attention aux signes : pour le centre $(x_C\\,;\\,y_C)$, on écrit $(x-x_C)^2$ ; pour $x_C=-2$, c'est $(x+2)^2$." },
            { centre: e.C, r2: 4 * r2, message: "Tu as pris le diamètre : au second membre, c'est le carré du rayon." },
          ],
          "Le cercle de centre $(x_C\\,;\\,y_C)$ et de rayon r a pour équation $(x-x_C)^2+(y-y_C)^2=r^2$.",
        ),
      ],
      aides: [
        [t("M est sur le lieu exactement quand "), l(`MC=${e.r}`), t(", c'est-à-dire "), l(`MC^2=${e.r}^2`), t(" ; par Pythagore, "), l("MC^2=(x-x_C)^2+(y-y_C)^2"), t(" (cours, § 8).")],
        [t("Ici, "), l(pointL("C", e.C)), t(" : remplace "), l("x_C"), t(" et "), l("y_C"), t(", et n'oublie pas d'élever le rayon au carré.")],
      ],
      reponse: [l(cercleL(e.C, e.r))],
      figureApres: figureLieu(e),
    },
  ];
}

export function ecrans(e: E): EcranTSD[] {
  switch (e.variante) {
    case "mediatrice":
      return ecransMediatrice(e);
    case "distance-droite":
      return ecransDistance(e);
    case "deux-paralleles":
      return ecransParalleles(e);
    case "parabole":
      return ecransParabole(e);
    case "cercle":
      return ecransCercle(e);
  }
}
