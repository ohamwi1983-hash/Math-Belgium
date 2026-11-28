import type { Condition127, Exercice127, Famille127, Nature127, Phase127 } from "../core6e/natureLieu";
import { OPTIONS_127, elements127, phases127, sommetsOctogone } from "../core6e/natureLieu";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { D, P } from "./outilsLieuxLotH1";
import { ILLISIBLE, apercuDroite, apercuNombre, apercuPoint, apercuPoints, coordL, equationCours, figureAuto, l, membreL, nb, pointsL, t } from "./outilsLieuxLotH1";

/**
 * Couche C — textes de `6gen127` « Quelle est la nature du lieu ? » : condition (en formule ou en
 * mots), options de nature propres à la FAMILLE (ordre fixe), champs des éléments caractéristiques
 * selon la nature, aides à deux niveaux (natures et seuils du cours, puis question posée sur
 * l'instance — jamais la nature), réponses, figures (configuration à l'écran sans le lieu ; lieu tracé
 * dans le corrigé).
 */

type E = Exercice127;
type Ph = Phase127;

export const NOM_NATURE: Record<Nature127, string> = {
  vide: "le lieu est vide",
  point: "un point",
  droite: "une droite",
  droitesSecantes: "deux droites sécantes",
  droitesParalleles: "deux droites parallèles",
  cercle: "un cercle",
  bande: "une bande (région entre deux droites parallèles, bords compris)",
  losange: "un losange (ses côtés seulement)",
  carrePlein: "un carré plein (intérieur et bords)",
  octogone: "un octogone (ses côtés seulement)",
  demiDroites: "quatre demi-droites",
};
export const nomCourt = (n: Nature127) => NOM_NATURE[n].split(" (")[0]!;
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const kL = (kn: number, kd: number) => (kd === 1 ? nb(kn) : `\\dfrac{${kn}}{${kd}}`);
const abs = (v: string, c: number) => `|${v}${c === 0 ? "" : c > 0 ? `-${nb(c)}` : `+${nb(-c)}`}|`;
const absLin = (variable: string, a: number, b: number) => `|${a === 1 ? "" : nb(a)}${variable}${b === 0 ? "" : b > 0 ? `-${nb(b)}` : `+${nb(-b)}`}|`;
export const droiteNommee = (nom: string, d: D) => `${nom}\\equiv ${equationCours(d)}`;
const pt = (nom: string, p: P) => `${nom}${coordL(p)}`;

/** Condition en prose + formules (énoncé écran ET papier). */
export function situation127(e: E): Frag[] {
  const c = e.condition;
  const debut: Frag[] = [t("On cherche le lieu des points "), l("P(x\\,;y)"), t(" du plan ")];
  switch (c.type) {
    case "sommeCarres":
      return [...debut, t("tels que "), l(`PA^2+PB^2=${nb(c.k)}`), t(", avec "), l(pt("A", c.A)), t(" et "), l(pt("B", c.B)), t(".")];
    case "differenceCarres":
      return [...debut, t("tels que "), l(`PA^2-PB^2=${nb(c.k)}`), t(", avec "), l(pt("A", c.A)), t(" et "), l(pt("B", c.B)), t(".")];
    case "rapport":
      return [...debut, t("tels que "), l(`\\dfrac{PA}{PB}=${kL(c.kn, c.kd)}`), t(", avec "), l(pt("A", c.A)), t(" et "), l(pt("B", c.B)), t(".")];
    case "absSomme":
      return [...debut, t("tels que "), l(`${abs("x", c.p)}+${abs("y", c.q)}=${nb(c.k)}`), t(".")];
    case "absDifference":
      return c.k === 0 ? [...debut, t("tels que "), l(`${abs("x", c.p)}=${abs("y", c.q)}`), t(".")] : [...debut, t("tels que "), l(`${abs("x", c.p)}-${abs("y", c.q)}=${nb(c.k)}`), t(".")];
    case "absUne":
      return [...debut, t("tels que "), l(`${absLin(c.variable, c.a, c.b)}${c.inegalite ? "\\leq" : "="}${nb(c.k)}`), t(".")];
    case "distanceDroite":
      return [...debut, t(c.inegalite ? `situés à une distance inférieure ou égale à ${c.k} de la droite ` : `situés à la distance ${c.k} de la droite `), l(droiteNommee("d", c.d)), t(".")];
    case "equidistantSecantes":
      return [...debut, t("situés à égale distance des droites "), l(droiteNommee("d_1", c.d1)), t(" et "), l(droiteNommee("d_2", c.d2)), t(".")];
    case "equidistantParalleles":
      return [...debut, t("situés à égale distance des droites "), l(`d_1\\equiv ${membreL(c.d1)}=0`), t(" et "), l(`d_2\\equiv ${membreL(c.d2)}=0`), t(".")];
    case "sommeParalleles":
      return [...debut, t("dont la somme des distances aux droites "), l(`d_1\\equiv ${c.variable}=${nb(c.u)}`), t(" et "), l(`d_2\\equiv ${c.variable}=${nb(c.v)}`), t(` vaut ${c.k}.`)];
    case "carreSomme":
    case "carreCarres":
      return [
        ...debut,
        t(c.type === "carreSomme" ? "dont la somme des distances aux quatre droites qui portent les côtés du carré " : "dont la somme des carrés des distances aux quatre droites qui portent les côtés du carré "),
        l(`[${nb(c.O.x - c.c)}\\,;${nb(c.O.x + c.c)}]\\times[${nb(c.O.y - c.c)}\\,;${nb(c.O.y + c.c)}]`),
        t(" (de centre "),
        l(pt("\\Omega", c.O)),
        t(`, de côté ${2 * c.c}, côtés parallèles aux axes) vaut ${c.k}.`),
      ];
  }
}

export const consigneGlobale127 = (): Frag[] => [t("Quelle est la nature de ce lieu ? Donne ses éléments caractéristiques (centre et rayon, sommets, équations des droites…), s'il y en a. Justifie.")];
export const consigneGenerale127 = (e: E): Frag[] => [...situation127(e), t(" "), ...consigneGlobale127()];

export const libelle127 = (_e: E, p: Ph) => (p === "nature" ? "Nature du lieu" : "Éléments caractéristiques");

/** Consigne de l'écran des éléments, propre à la nature (l'écran n'existe pas pour « vide »). */
const CONSIGNE_ELEMENTS: Record<Nature127, string> = {
  vide: "",
  point: "Donne les coordonnées de ce point.",
  droite: "Donne une équation de cette droite.",
  droitesSecantes: "Donne une équation de chacune des deux droites.",
  droitesParalleles: "Donne une équation de chacune des deux droites.",
  cercle: "Donne le centre et le rayon de ce cercle.",
  bande: "Donne une équation de chacune des deux droites qui bordent la bande.",
  losange: "Donne les quatre sommets du losange.",
  carrePlein: "Donne les quatre sommets du carré.",
  octogone: "Donne une équation de chacune des deux droites qui portent les côtés verticaux de l'octogone.",
  demiDroites: "Donne les origines des demi-droites.",
};

export function consigne127(e: E, p: Ph): Frag[] {
  return p === "nature" ? [t("Quelle est la nature du lieu ?")] : [t(CONSIGNE_ELEMENTS[e.nature])];
}

export type TypeChamp127 = "point" | "droite" | "deuxDroites" | "cercle" | "points";
export function typeChamp127(n: Nature127): TypeChamp127 {
  if (n === "point") return "point";
  if (n === "droite") return "droite";
  if (n === "cercle") return "cercle";
  if (n === "losange" || n === "carrePlein" || n === "demiDroites") return "points";
  return "deuxDroites";
}

export function champs127(e: E, _p: Ph): ChampEcran[] {
  switch (typeChamp127(e.nature)) {
    case "point":
      return [{ label: "Coordonnées du point", placeholder: "(… ; …)", apercuLatex: apercuPoint }];
    case "droite":
      return [{ label: "Équation de la droite", placeholder: "équation, avec « = »", apercuLatex: apercuDroite }];
    case "deuxDroites":
      return [
        { label: "Première droite", placeholder: "équation, avec « = »", apercuLatex: apercuDroite },
        { label: "Seconde droite", placeholder: "équation, avec « = »", apercuLatex: apercuDroite },
      ];
    case "cercle":
      return [
        { label: "Centre", placeholder: "(… ; …)", apercuLatex: apercuPoint },
        { label: "Rayon", placeholder: "nombre exact", apercuLatex: apercuNombre },
      ];
    case "points":
      return [{ label: e.nature === "demiDroites" ? "Origines" : "Sommets", placeholder: "(… ; …) ; (… ; …) ; …", apercuLatex: apercuPoints }];
  }
}

export function messageIllisible127(e: E, _p: Ph): string {
  switch (typeChamp127(e.nature)) {
    case "point":
      return ILLISIBLE.point;
    case "droite":
    case "deuxDroites":
      return ILLISIBLE.droite;
    case "cercle":
      return `${ILLISIBLE.point.split(" Cette")[0]} Le rayon s'écrit comme un nombre exact (5, 2√3…). Cette saisie ne compte pas comme une tentative.`;
    case "points":
      return ILLISIBLE.points;
  }
}

export function options127(e: E): OptionEcran[] {
  return OPTIONS_127[e.famille].map((n) => ({ id: n, fragments: [t(maj(NOM_NATURE[n]))] }));
}

export function reponseElements(e: E): Frag[] {
  const el = elements127(e);
  switch (typeChamp127(e.nature)) {
    case "point":
      return [l(coordL(el.point!))];
    case "droite":
      return [l(equationCours(el.droites![0]!))];
    case "deuxDroites":
      return [l(equationCours(el.droites![0]!)), t(" et "), l(equationCours(el.droites![1]!))];
    case "cercle":
      return [t("centre "), l(coordL(el.centre!)), t(", rayon "), l(nb(Math.sqrt(el.rayon2!)))];
    case "points":
      return [l(pointsL(el.sommets!))];
  }
}

export function reponse127(e: E, p: Ph): Frag[] {
  if (p === "nature") return [t(`${maj(NOM_NATURE[e.nature])}.`)];
  return reponseElements(e);
}

export function recap127(e: E, p: Ph): Frag[] {
  return p === "nature" ? [t(maj(nomCourt(e.nature)))] : reponseElements(e);
}

export function aide1_127(e: E, p: Ph): AideEcran {
  if (p === "elements") {
    switch (typeChamp127(e.nature)) {
      case "cercle":
        return { texte: [t(`Cours, point 4 : ramène l'équation à la forme `), l("(x-p)^2+(y-q)^2=r^2"), t(" (ou "), l("PM^2=\\ldots"), t(" pour un point M fixe).")] };
      case "points":
        return { texte: [t(`Cours, point 4 : `), ...(e.nature === "losange" ? [t("les sommets s'obtiennent en annulant tour à tour une seule valeur absolue.")] : e.nature === "demiDroites" ? [t("les demi-droites partent des points où la plus petite valeur absolue s'annule.")] : [t("les sommets du carré plein sont ceux du carré donné.")])] };
      case "point":
        return { texte: [t("Cours, point 4 : au seuil exact, le lieu se réduit au seul point où la somme est minimale (le milieu M de [AB], ou le centre Ω du carré).")] };
      default:
        if (e.nature === "octogone") return { texte: [t("Cours, point 4 : sur un côté vertical de l'octogone, "), l("|Y|\\leq c"), t(" et la somme des distances vaut "), l("2|X|+2c"), t(" (X, Y : coordonnées depuis le centre).")] };
        if (e.nature === "droite") return { texte: [t("Cours, point 4 : après développement, il reste une équation du premier degré en x et y : c'est l'équation de la droite.")] };
        return { texte: [t(`Cours, point 4 : une condition `), l("|A|=k"), t(" se sépare en "), l("A=k"), t(" ou "), l("A=-k"), t(" ; une égalité de distances à deux droites se traduit par une égalité de valeurs absolues.")] };
    }
  }
  switch (e.famille) {
    case "deuxPoints":
      return { texte: [t(`Cours, point 4 : `), l("PA^2+PB^2=k"), t(" se compare au seuil "), l("\\dfrac{AB^2}{2}"), t(" (théorème de la médiane) ; "), l("PA^2-PB^2=k"), t(" donne une droite perpendiculaire à (AB) ; "), l("\\dfrac{PA}{PB}=k"), t(" donne la médiatrice si k = 1, un cercle d'Apollonius sinon.")] };
    case "valeursAbsolues":
      return { texte: [t(`Cours, point 4 : une somme de valeurs absolues égale à k donne un losange (borné) ; une différence donne des demi-droites (non borné) ; `), l("|A|=k"), t(" donne deux droites parallèles, "), l("|A|\\leq k"), t(" une bande.")] };
    case "distancesDroites":
      return { texte: [t(`Cours, point 4 : à distance k d'une droite → deux parallèles (≤ k : une bande) ; équidistant de deux sécantes → leurs deux bissectrices ; de deux parallèles → la droite du milieu ; somme des distances à deux parallèles écartées de e : vide si k < e, la bande si k = e, deux droites si k > e.`)] };
    case "carre":
      return { texte: [t(`Cours, point 4 : pour le carré de demi-côté c, la somme des distances aux côtés a pour seuil 4c (carré plein ; au-delà, un octogone) ; la somme des carrés des distances a pour seuil `), l("4c^2"), t(" (un point ; au-delà, un cercle).")] };
  }
}

export function aide2_127(e: E, p: Ph): AideEcran | null {
  const c = e.condition;
  if (p === "elements") return { texte: [t("Ici, reprends la condition et traduis-la en équation(s) avec x et y.")] };
  switch (c.type) {
    case "sommeCarres":
      return { texte: [t("Ici, calcule "), l("AB^2"), t(", puis compare k au seuil "), l("\\dfrac{AB^2}{2}"), t(" : plus grand, égal ou plus petit ?")] };
    case "differenceCarres":
    case "rapport":
      return { texte: [t("Ici, développe "), l("PA^2"), t(" et "), l("PB^2"), t(" : les termes "), l("x^2"), t(" et "), l("y^2"), t(" disparaissent-ils ?")] };
    case "absSomme":
    case "absDifference":
    case "absUne":
      return { texte: [t("Ici, est-ce une somme, une différence ou une seule valeur absolue ? Une égalité ou une inégalité ?")] };
    case "distanceDroite":
    case "equidistantSecantes":
    case "equidistantParalleles":
      return { texte: [t("Ici, les droites données sont-elles parallèles ou sécantes ? La condition est-elle une égalité ou une inégalité ?")] };
    case "sommeParalleles":
      return { texte: [t("Ici, quel est l'écart e entre les deux droites ? Compare k à e.")] };
    case "carreSomme":
    case "carreCarres":
      return { texte: [t(`Ici, le demi-côté vaut c = ${c.c} : calcule le seuil qui correspond à cette condition et compare-le à ${c.k}.`)] };
  }
}

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

/** Points d'une droite pour le cadrage : son point le plus proche de l'origine, et ±2 le long d'elle. */
function pointsCadreDroite(d: D): P[] {
  const n2 = d.a * d.a + d.b * d.b;
  const p0 = { x: (-d.c * d.a) / n2, y: (-d.c * d.b) / n2 };
  const n = Math.sqrt(n2);
  const u = { x: -d.b / n, y: d.a / n };
  return [p0, { x: p0.x + 2 * u.x, y: p0.y + 2 * u.y }, { x: p0.x - 2 * u.x, y: p0.y - 2 * u.y }];
}

function donneesFigure(c: Condition127): { points: { P: P; label?: string; couleur?: string }[]; droites: { d: D; label?: string; couleur?: string; pointille?: boolean; epaisseur?: number }[]; segments: { A: P; B: P; couleur?: string; pointille?: boolean; epaisseur?: number }[]; cadre: P[] } {
  const gris = "#6b7280";
  switch (c.type) {
    case "sommeCarres":
    case "differenceCarres":
    case "rapport":
      return { points: [{ P: c.A, label: "A" }, { P: c.B, label: "B" }], droites: [], segments: [], cadre: [c.A, c.B] };
    case "distanceDroite":
      return { points: [], droites: [{ d: c.d, label: "d", couleur: gris }], segments: [], cadre: [{ x: 0, y: 0 }, ...pointsCadreDroite(c.d)] };
    case "equidistantSecantes":
    case "equidistantParalleles":
      return { points: [], droites: [{ d: c.d1, label: "d₁", couleur: gris }, { d: c.d2, label: "d₂", couleur: gris }], segments: [], cadre: [{ x: 0, y: 0 }, ...pointsCadreDroite(c.d1), ...pointsCadreDroite(c.d2)] };
    case "sommeParalleles": {
      const L = (v: number): D => (c.variable === "x" ? { a: 1, b: 0, c: -v } : { a: 0, b: 1, c: -v });
      return { points: [], droites: [{ d: L(c.u), label: "d₁", couleur: gris }, { d: L(c.v), label: "d₂", couleur: gris }], segments: [], cadre: c.variable === "x" ? [{ x: c.u, y: 0 }, { x: c.v, y: 0 }] : [{ x: 0, y: c.u }, { x: 0, y: c.v }] };
    }
    case "carreSomme":
    case "carreCarres": {
      const s = [
        { x: c.O.x + c.c, y: c.O.y + c.c },
        { x: c.O.x - c.c, y: c.O.y + c.c },
        { x: c.O.x - c.c, y: c.O.y - c.c },
        { x: c.O.x + c.c, y: c.O.y - c.c },
      ];
      return { points: [{ P: c.O, label: "Ω" }], droites: [], segments: s.map((A, i) => ({ A, B: s[(i + 1) % 4]!, couleur: gris })), cadre: s };
    }
    default:
      return { points: [], droites: [], segments: [], cadre: [{ x: 0, y: 0 }] };
  }
}

/** Figure de l'écran : la configuration seule (rien pour les valeurs absolues : le centre trahirait les éléments). */
export function figure127(e: E): string | null {
  const c = e.condition;
  if (c.type === "absSomme" || c.type === "absDifference" || c.type === "absUne") return null;
  const f = donneesFigure(c);
  return figureAuto({ points: f.points, droites: f.droites, segments: f.segments }, f.cadre, 2);
}

/** Figure du corrigé : configuration + lieu (rien de plus si le lieu est vide). */
export function figureCorrige127(e: E): string {
  const c = e.condition;
  const f = donneesFigure(c);
  const el = elements127(e);
  const ac = "#c2410c";
  const points = [...f.points];
  const droites = [...f.droites];
  const segments = [...f.segments];
  const cercles: { centre: P; rayon: number; couleur?: string }[] = [];
  const cadre = [...f.cadre];
  if (el.point) {
    points.push({ P: el.point, label: c.type === "sommeCarres" ? "M" : undefined, couleur: ac });
    cadre.push(el.point);
  }
  if (el.centre) {
    const r = Math.sqrt(el.rayon2!);
    cercles.push({ centre: el.centre, rayon: r, couleur: ac });
    points.push({ P: el.centre, couleur: ac });
    cadre.push({ x: el.centre.x - r, y: el.centre.y - r }, { x: el.centre.x + r, y: el.centre.y + r });
  }
  if (e.nature === "losange" || e.nature === "carrePlein") {
    const s = el.sommets!;
    s.forEach((A, i) => segments.push({ A, B: s[(i + 1) % 4]!, couleur: ac, epaisseur: 2.4 }));
    cadre.push(...s);
    if (e.nature === "carrePlein") {
      // Hachures (intérieur compris) : segments de pente 1 coupés au carré.
      const xs = s.map((q) => q.x);
      const ys = s.map((q) => q.y);
      const xm = Math.min(...xs);
      const xM = Math.max(...xs);
      const ym = Math.min(...ys);
      const cote = xM - xm;
      for (let k = -3; k <= 3; k++) {
        const d = (k * cote) / 4;
        const x0 = Math.max(xm, xm + d);
        const x1 = Math.min(xM, xm + d + cote);
        if (x1 - x0 > 1e-9) segments.push({ A: { x: x0, y: x0 - xm + ym - d }, B: { x: x1, y: x1 - xm + ym - d }, couleur: "#f0b48f", epaisseur: 1 });
      }
    }
  }
  if (e.nature === "octogone" && c.type === "carreSomme") {
    const s = sommetsOctogone(c.O, c.c, c.k);
    s.forEach((A, i) => segments.push({ A, B: s[(i + 1) % 8]!, couleur: ac, epaisseur: 2.4 }));
    cadre.push(...s);
  }
  if (e.nature === "demiDroites" && c.type === "absDifference") {
    const L = 12;
    for (const o of el.sommets!) {
      const versDehors = c.k > 0 ? Math.sign(o.x - c.p) : Math.sign(o.y - c.q);
      for (const sgn of [1, -1]) {
        const B = c.k > 0 ? { x: o.x + versDehors * L, y: o.y + sgn * L } : { x: o.x + sgn * L, y: o.y + versDehors * L };
        segments.push({ A: o, B, couleur: ac, epaisseur: 2.4 });
      }
      points.push({ P: o, couleur: ac });
    }
    cadre.push(...el.sommets!.map((o) => ({ x: o.x + (c.k > 0 ? Math.sign(o.x - c.p) * 3 : 3), y: o.y + (c.k > 0 ? 3 : Math.sign(o.y - c.q) * 3) })), { x: c.p, y: c.q });
  }
  if (el.droites) {
    for (const d of el.droites) droites.push({ d, couleur: ac, epaisseur: 2.4 });
    if (e.nature === "bande") {
      // Bande : hachures entre les deux droites (segments parallèles aux bords, en pointillé clair).
      const [d1, d2] = el.droites as [D, D];
      const f = d1.a !== 0 ? d1.a / d2.a : d1.b / d2.b;
      for (let k = 1; k <= 3; k++) {
        const sx = k / 4;
        droites.push({ d: { a: d1.a, b: d1.b, c: d1.c * (1 - sx) + d2.c * f * sx }, couleur: "#f0b48f", pointille: true, epaisseur: 1.2 });
      }
    }
    for (const d of el.droites) cadre.push(...pointsCadreDroite(d));
    if (c.type === "absDifference") cadre.push({ x: c.p - 3, y: c.q - 3 }, { x: c.p + 3, y: c.q + 3 });
  }
  return figureAuto({ points, droites, segments, cercles }, cadre, 2);
}

export { phases127 };
export const familleLibelle = (f: Famille127) => f;
