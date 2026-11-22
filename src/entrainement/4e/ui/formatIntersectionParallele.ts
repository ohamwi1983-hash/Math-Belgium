import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceIntersectionParallele } from "../core/intersectionParallele.types";
import type { CibleToucher, EcranEspace } from "../components/AppEspaceLotH";
import { additionner3D, multiplierScalaire3D, soustraire3D } from "../generateurs/solide3D/geometrieEspace";
import { calculerAretesAvecVisibilite } from "./solide3DSketch";
import type { Point2D } from "./projectionCavaliere";
import {
  COULEUR_ACCENT,
  COULEUR_CONSTRUCTION,
  COULEUR_DROITE,
  COULEUR_PLAN_1,
  COULEUR_PLAN_2,
  HAUTEUR_FIGURE,
  LARGEUR_FIGURE,
  cadreEspace,
  croisementsDessin,
  figureEspaceSvg,
  type AnneauEspace,
  type MarqueEspace,
  type ModeFigureEspace,
  type OptionsFigureEspace,
  type PolygoneEspace,
  type SegmentEspace,
} from "./figureEspaceLotH";

/**
 * Textes, écrans et figures de gen134 « Intersection de deux plans par parallélisme » — UNE source
 * pour l'appli, l'adaptateur papier et le corrigé. Noms de points, droites, plans et faces en texte,
 * comme dans le cours (« (PQR) », « la face EFGH », « [RS] »).
 */

type E = ExerciceIntersectionParallele;
type F = FragmentConsigne[];
const T = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });

export const nomSolideIP = (e: E) => (e.genre === "cube" ? "le cube ABCDEFGH" : "le pavé droit ABCDEFGH");
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const face = (noms: string[]) => noms.join("");
export const droite = (d: [string, string]) => `(${d.join("")})`;
export const plan = (p: readonly string[]) => `(${p.join("")})`;
export const seg = (d: [string, string]) => `[${d.join("")}]`;

export function position(e: E, nom: string): Point3D {
  if (nom === "S" && e.faces) return e.faces.S;
  if (nom === "K" && e.direction) return e.direction.K;
  if (nom === "K′" && e.direction) return e.direction.K2;
  return e.solide.sommets[nom] ?? e.points.find((p) => p.nom === nom)!.position;
}

function phrasePoints(e: E): string {
  if (e.variante === "faces-paralleles") {
    const [p, q, r] = e.points;
    return `P est un point de ${seg(p!.arete)}, Q un point de ${seg(q!.arete)} et R un point de ${seg(r!.arete)}.`;
  }
  const milieux = e.points.filter((_, i) => i % 2 === 0);
  if (milieux.length === 0) return "";
  const morceaux = e.points.map((p, i) => (i === 0 ? `${p.nom} est le milieu de ${seg(p.arete)}` : `${p.nom} celui de ${seg(p.arete)}`));
  return `${morceaux.join(", ")}.`;
}

export function enonceTexteIP(e: E): string {
  const debut = `On considère ${nomSolideIP(e)}.`;
  if (e.variante === "faces-paralleles") return `${debut} ${phrasePoints(e)} Le plan (PQR) coupe la face ${face(e.face0)} suivant le segment [PQ].`;
  const d = e.direction!;
  return `${debut} ${phrasePoints(e)} On étudie les plans ${plan(d.plans[0])} et ${plan(d.plans[1])}, dessinés en couleur.`.replace("  ", " ");
}

export function consigneGlobaleIP(e: E): string {
  if (e.variante === "faces-paralleles") return `Construis le segment suivant lequel le plan (PQR) coupe la face ${face(e.face1)}.`;
  const d = e.direction!;
  return `Détermine la droite d'intersection des plans ${plan(d.plans[0])} et ${plan(d.plans[1])}.`;
}

// --- Cibles de l'écran « toucher » ----------------------------------------------------------------

interface Candidat {
  pixel: Point2D;
  juste: boolean;
  message: F;
}

/** Droite tracée à l'écran 3 : par R parallèle à (PQ), ou par K parallèle à l'axe. */
export function droiteEcran3(e: E): { a: Point3D; b: Point3D } {
  if (e.variante === "faces-paralleles") {
    const R = position(e, "R");
    return { a: R, b: additionner3D(R, soustraire3D(position(e, "Q"), position(e, "P"))) };
  }
  return { a: e.direction!.K, b: e.direction!.K2 };
}

function segmentsDessines(e: E): { a: Point3D; b: Point3D; nom: string }[] {
  const s = e.solide;
  const segs = calculerAretesAvecVisibilite(s).map((x) => ({ a: s.sommets[x.sommets[0]]!, b: s.sommets[x.sommets[1]]!, nom: `[${x.sommets.join("")}]` }));
  if (e.variante === "faces-paralleles") {
    const [P, Q, R] = ["P", "Q", "R"].map((n) => position(e, n)) as [Point3D, Point3D, Point3D];
    segs.push({ a: Q, b: R, nom: "[QR]" }, { a: P, b: R, nom: "[PR]" });
  } else {
    for (const sec of e.direction!.sections)
      for (let i = 0; i < 4; i++) {
        const a = sec[i]!;
        const b = sec[(i + 1) % 4]!;
        if (calculerAretesAvecVisibilite(s).some((x) => (x.sommets[0] === a && x.sommets[1] === b) || (x.sommets[0] === b && x.sommets[1] === a))) continue;
        segs.push({ a: position(e, a), b: position(e, b), nom: `[${a}${b}]` });
      }
  }
  return segs;
}

function surSegment3D(p: Point3D, a: Point3D, b: Point3D): boolean {
  const ab = soustraire3D(b, a);
  const ap = soustraire3D(p, a);
  const l2 = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;
  const t = (ap.x * ab.x + ap.y * ab.y + ap.z * ab.z) / l2;
  if (t < -1e-4 || t > 1 + 1e-4) return false;
  const proj = additionner3D(a, multiplierScalaire3D(ab, t));
  return Math.hypot(proj.x - p.x, proj.y - p.y, proj.z - p.z) < 1e-4;
}

const dansCadre = (p: Point2D) => p.x > 12 && p.x < LARGEUR_FIGURE - 12 && p.y > 22 && p.y < HAUTEUR_FIGURE - 10;

/**
 * Points numérotés de l'écran 3 : le bon point et des leurres — croisements du DESSIN entre la droite
 * tracée et des arêtes (ou côtés des plans) qui ne sont pas dans la même face (droites gauches), points
 * de la droite hors de la face (au-delà de son bord, ou encore à l'intérieur du solide). Au moins
 * 26 px entre deux points ; numérotés de gauche à droite. `null` : un faux croisement à moins de 14 px
 * du bon point (figure ambiguë, le générateur la rejette).
 */
export function candidatsEcran3(e: E): Candidat[] | null {
  const cadre = cadreEspace(e.solide, e.points.map((p) => p.position));
  const { a, b } = droiteEcran3(e);
  const pa = cadre.pixel(a);
  const pb = cadre.pixel(b);
  const juste3D = e.variante === "faces-paralleles" ? e.faces!.S : e.direction!.K2;
  const juste = cadre.pixel(juste3D);
  const depart = pa;
  const faceCible = face(e.face1);
  const dir = soustraire3D(b, a);
  const point3DEn = (px: Point2D): Point3D => {
    const lx = pb.x - pa.x;
    const ly = pb.y - pa.y;
    const t = ((px.x - pa.x) * lx + (px.y - pa.y) * ly) / (lx * lx + ly * ly);
    return additionner3D(a, multiplierScalaire3D(dir, t));
  };
  const leurres: Candidat[] = [];
  const segs = segmentsDessines(e);
  const croisements = croisementsDessin(pa, pb, segs.map((s) => ({ a: cadre.pixel(s.a), b: cadre.pixel(s.b), nom: s.nom })));
  for (const c of croisements) {
    const s = segs.find((x) => x.nom === c.nom)!;
    const vrai = surSegment3D(point3DEn(c.pixel), s.a, s.b);
    if (vrai) continue;
    if (Math.hypot(c.pixel.x - juste.x, c.pixel.y - juste.y) < 14) return null;
    leurres.push({
      pixel: c.pixel,
      juste: false,
      message: [T(`Ici, la droite tracée ne fait que croiser ${c.nom} sur le dessin : elles ne sont pas dans une même face, elles ne se coupent pas vraiment.`)],
    });
  }
  // Points de la droite hors de la face cible.
  if (e.variante === "faces-paralleles") {
    const R = a;
    const S = juste3D;
    for (const k of [0.5, 1.35, -0.35, 1.7, -0.7]) {
      const p = additionner3D(R, multiplierScalaire3D(soustraire3D(S, R), k));
      leurres.push({
        pixel: cadre.pixel(p),
        juste: false,
        message:
          k > 0 && k < 1
            ? [T(`Ce point est à l'intérieur de la face ${faceCible} : la parallèle continue jusqu'à une arête de la face.`)]
            : [T(`Ce point est sur la parallèle, mais hors de la face ${faceCible} : l'intersection s'arrête au bord de la face, sur une de ses arêtes.`)],
      });
    }
  } else {
    for (const k of [0.5, 1.45, 0.25, 1.8]) {
      leurres.push({
        pixel: cadre.pixel(additionner3D(a, multiplierScalaire3D(dir, k))),
        juste: false,
        message:
          k < 1
            ? [T(`Ce point est encore à l'intérieur du solide : la droite d'intersection le traverse jusqu'à la face ${faceCible}.`)]
            : [T(`Ce point est au-delà de la face ${faceCible} : K′ est sur cette face, et KK′ a la longueur de l'arête ${droite(e.direction!.direction)}.`)],
      });
    }
  }
  const retenus: Candidat[] = [{ pixel: juste, juste: true, message: [] }];
  const loinDe = (p: Point2D) => retenus.every((x) => Math.hypot(x.pixel.x - p.x, x.pixel.y - p.y) >= 26) && Math.hypot(depart.x - p.x, depart.y - p.y) >= 26;
  for (const l of leurres) {
    if (retenus.length >= 5) break;
    if (dansCadre(l.pixel) && loinDe(l.pixel)) retenus.push(l);
  }
  if (retenus.length < 4) return null;
  return retenus.sort((x, y) => x.pixel.x - y.pixel.x || x.pixel.y - y.pixel.y);
}

export function ciblesEcran3(e: E): CibleToucher[] {
  return (candidatsEcran3(e) ?? []).map((c, i) => ({ numero: i + 1, pixel: c.pixel, juste: c.juste, message: c.message }));
}

// --- Écrans ---------------------------------------------------------------------------------------

function ordonner<X>(options: X[], ordre: number[]): { options: X[]; bonne: number } {
  return { options: ordre.map((i) => options[i]!), bonne: ordre.indexOf(0) };
}

export interface OptionChoix {
  texte: string;
  explication: string | null;
}

export function optionsEcran1(e: E): OptionChoix[] {
  if (e.variante === "faces-paralleles") {
    const f = e.faces!;
    const F1 = face(e.face1);
    return [
      { texte: "R", explication: null },
      { texte: "P", explication: `P est dans le plan (PQR), mais pas dans la face ${F1} : il est sur la face ${face(e.face0)}.` },
      { texte: "Q", explication: `Q est dans le plan (PQR), mais pas dans la face ${F1} : il est sur la face ${face(e.face0)}.` },
      { texte: f.sommetLeurre, explication: `${f.sommetLeurre} est un sommet de la face ${F1}, mais il n'est pas dans le plan (PQR).` },
    ];
  }
  const d = e.direction!;
  const [t1, t2] = d.traces0;
  const [c1, c2] = d.cotesAxe;
  return [
    { texte: `Le point K où se coupent ${droite(t1)} et ${droite(t2)}`, explication: null },
    {
      texte: `Le point où se coupent ${droite(d.croisement.d1)} et ${droite(d.croisement.d2)}`,
      explication: d.croisement.dessin
        ? `${droite(d.croisement.d1)} et ${droite(d.croisement.d2)} se croisent seulement sur le dessin : elles ne sont pas dans une même face, elles sont gauches.`
        : `${droite(d.croisement.d1)} et ${droite(d.croisement.d2)} ne sont pas dans une même face : elles sont gauches et ne se coupent pas.`,
    },
    { texte: `Le point ${d.pointSeul}`, explication: `${d.pointSeul} nomme le plan ${plan(d.plans[0])}, mais il n'est pas dans le plan ${plan(d.plans[1])}.` },
    { texte: `Le point où se coupent ${droite(c1)} et ${droite(c2)}`, explication: `${droite(c1)} et ${droite(c2)} sont parallèles : elles ne se coupent pas.` },
  ];
}

export function optionsEcran2(e: E): OptionChoix[] {
  if (e.variante === "faces-paralleles") {
    const f = e.faces!;
    const F1 = face(e.face1);
    const L = f.pointLeurre;
    return [
      { texte: "La parallèle à (PQ) menée par R", explication: null },
      { texte: `La droite (R${L})`, explication: `(R${L}) est bien dans le plan (PQR), mais elle traverse le solide : ${L} n'est pas dans la face ${F1}.` },
      { texte: `La parallèle à ${droite(f.areteLeurre)} menée par R`, explication: `Cette droite n'est pas dans le plan (PQR) : (PQ) n'est pas parallèle à ${droite(f.areteLeurre)}. La propriété 1 donne une parallèle à (PQ).` },
      { texte: `La parallèle à (PQ) menée par ${f.sommetLeurre}`, explication: `${f.sommetLeurre} n'est pas dans le plan (PQR) : la parallèle doit passer par un point commun au plan et à la face, R.` },
    ];
  }
  const d = e.direction!;
  const [t1, t2] = d.traces0;
  return [
    { texte: `Parallèle à ${droite(d.direction)}`, explication: null },
    { texte: `Parallèle à ${droite(t1)}`, explication: `${droite(t1)} n'est que dans le plan ${plan(d.plans[0])} : sa direction ne convient pas pour l'autre plan.` },
    { texte: `Parallèle à ${droite(t2)}`, explication: `${droite(t2)} n'est que dans le plan ${plan(d.plans[1])} : sa direction ne convient pas pour l'autre plan.` },
    { texte: `Parallèle à ${droite(d.directionLeurre)}`, explication: `${droite(d.directionLeurre)} n'est dans aucun des deux plans.` },
  ];
}

export function consignesEcrans(e: E): string[] {
  if (e.variante === "faces-paralleles") {
    const F1 = face(e.face1);
    return [
      `Par quel point connu passe l'intersection du plan (PQR) avec la face ${F1} ?`,
      `Quelle droite trace-t-on dans la face ${F1} ?`,
      `La parallèle est tracée en bleu. Touche le point S où elle rencontre une arête de la face ${F1}.`,
    ];
  }
  const d = e.direction!;
  return [
    `Quel point est commun aux plans ${plan(d.plans[0])} et ${plan(d.plans[1])} ?`,
    "Quelle est la direction de leur droite d'intersection ?",
    `La parallèle à ${droite(d.direction)} menée par K est tracée en bleu. Touche le point K′ où elle traverse la face ${face(e.face1)}.`,
  ];
}

/** Consignes des étapes sur papier (titres « Étape n » du corrigé) : sans figure animée. */
export function consignesEtapesPapier(e: E): string[] {
  const F1 = face(e.face1);
  if (e.variante === "faces-paralleles")
    return [
      `Par quel point connu passe l'intersection du plan (PQR) avec la face ${F1} ?`,
      `Quelle droite trace-t-on dans la face ${F1} ? Justifie.`,
      `Place le point S où cette droite rencontre une arête de la face ${F1}, puis trace l'intersection.`,
    ];
  return ["Construis un point K commun aux deux plans.", "Détermine la direction de leur droite d'intersection. Justifie.", `Trace la droite d'intersection : place le point K′ où elle traverse la face ${F1}.`];
}

export const TITRES_ECRANS_IP =(e: E) =>
  e.variante === "faces-paralleles" ? ["Un point connu dans la face", "La droite à tracer", "Le point d'arrivée"] : ["Un point commun", "La direction", "La droite d'intersection"];

function aides(e: E): F[][] {
  if (e.variante === "faces-paralleles") {
    const F1 = face(e.face1);
    return [
      [[T("L'intersection d'un plan et d'une face passe par les points qui sont à la fois dans le plan ET dans la face (cours, § 5).")], [T(`Parmi P, Q et R, lequel est sur une arête de la face ${F1} ?`)]],
      [[T("Propriété 1 (cours, § 5) : si un plan coupe deux plans parallèles, les deux droites d'intersection sont parallèles.")], [T(`Les faces ${face(e.face0)} et ${F1} sont parallèles, et (PQR) coupe la première suivant (PQ).`)]],
      [[T("Le côté cherché reste dans la face : il s'arrête là où la parallèle rencontre une arête de cette face.")], [T("Un croisement avec une arête d'une autre face, sur le dessin, n'est pas un vrai point d'intersection.")]],
    ];
  }
  const d = e.direction!;
  return [
    [[T("Un point commun à deux plans : la rencontre de deux droites, une de chaque plan, tracées dans une même face (cours, § 5).")], [T(`Cherche dans la face ${face(e.face0)} une droite de chaque plan.`)]],
    [[T("Théorème du toit (cours, § 8) : si deux plans sécants contiennent deux droites parallèles, leur droite d'intersection est parallèle à ces droites.")], [T(`Cherche dans chaque plan une droite parallèle à une arête : ${droite(d.cotesAxe[0])} et ${droite(d.cotesAxe[1])}.`)]],
    [[T("La droite d'intersection passe par K avec la direction trouvée : elle traverse le solide jusqu'à la face opposée.")], [T(`Dans la face ${face(e.face1)}, les côtés des deux plans se coupent en un second point commun.`)]],
  ];
}

export function ecransIP(e: E): EcranEspace[] {
  const titres = TITRES_ECRANS_IP(e);
  const consignes = consignesEcrans(e);
  const a = aides(e);
  const o1 = ordonner(optionsEcran1(e), e.ordre1);
  const o2 = ordonner(optionsEcran2(e), e.ordre2);
  return [
    { type: "choix", titre: titres[0]!, consigne: [T(consignes[0]!)], options: o1.options.map((o) => [T(o.texte)]), bonne: o1.bonne, explications: o1.options.map((o) => (o.explication ? [T(o.explication)] : null)), aides: a[0]! },
    { type: "choix", titre: titres[1]!, consigne: [T(consignes[1]!)], options: o2.options.map((o) => [T(o.texte)]), bonne: o2.bonne, explications: o2.options.map((o) => (o.explication ? [T(o.explication)] : null)), aides: a[1]! },
    { type: "toucher", titre: titres[2]!, consigne: [T(consignes[2]!)], cibles: ciblesEcran3(e), aides: a[2]! },
  ];
}

// --- Figures --------------------------------------------------------------------------------------

function baseFigure(e: E, mode: ModeFigureEspace): OptionsFigureEspace {
  return { mode, solide: e.solide, points: e.points.map((p) => ({ nom: p.nom, position: p.position })), ariaLabel: `${majuscule(nomSolideIP(e))} en perspective cavalière` };
}

function plansDessines(e: E): { polygones: PolygoneEspace[]; segments: SegmentEspace[] } {
  if (e.variante === "faces-paralleles") {
    const [P, Q, R] = ["P", "Q", "R"].map((n) => position(e, n)) as [Point3D, Point3D, Point3D];
    return { polygones: [{ sommets: [P, Q, R], couleur: COULEUR_PLAN_1, opacite: 0.14 }], segments: [{ a: P, b: Q, couleur: COULEUR_ACCENT, epaisseur: 3.4 }] };
  }
  const d = e.direction!;
  return {
    polygones: [
      { sommets: d.sections[0].map((n) => position(e, n)), couleur: COULEUR_PLAN_1, opacite: 0.16 },
      { sommets: d.sections[1].map((n) => position(e, n)), couleur: COULEUR_PLAN_2, opacite: 0.16 },
    ],
    segments: [],
  };
}

/** Étape atteinte : 0 énoncé, 1 point trouvé, 2 droite tracée, 3 construction finale. */
export function figureIP(e: E, mode: ModeFigureEspace, etape: number, anneaux: AnneauEspace[] = []): string {
  const { polygones, segments } = plansDessines(e);
  const marques: MarqueEspace[] = [];
  const droites: SegmentEspace[] = [];
  const segs = [...segments];
  if (e.variante === "faces-paralleles") {
    if (etape >= 1) marques.push({ position: position(e, "R"), couleur: COULEUR_DROITE, anneau: true });
    if (etape >= 2 && etape < 3) {
      const { a, b } = droiteEcran3(e);
      droites.push({ a, b, couleur: COULEUR_CONSTRUCTION, epaisseur: 2 });
    }
    if (etape >= 3) {
      const { a, b } = droiteEcran3(e);
      droites.push({ a, b, couleur: COULEUR_CONSTRUCTION, epaisseur: 1.4 });
      segs.push({ a: position(e, "R"), b: e.faces!.S, couleur: COULEUR_DROITE, epaisseur: 4 });
      marques.push({ position: e.faces!.S, couleur: COULEUR_DROITE, label: "S" });
    }
  } else {
    const d = e.direction!;
    if (etape >= 1) {
      segs.push({ a: position(e, d.traces0[0][0]), b: position(e, d.traces0[0][1]), couleur: COULEUR_PLAN_1, epaisseur: 3.2 }, { a: position(e, d.traces0[1][0]), b: position(e, d.traces0[1][1]), couleur: COULEUR_PLAN_2, epaisseur: 3.2 });
      marques.push({ position: d.K, couleur: COULEUR_DROITE, label: "K" });
    }
    if (etape >= 2) droites.push({ a: d.K, b: d.K2, couleur: COULEUR_CONSTRUCTION, epaisseur: etape >= 3 ? 1.4 : 2 });
    if (etape >= 3) {
      segs.push({ a: d.K, b: d.K2, couleur: COULEUR_DROITE, epaisseur: 4 });
      marques.push({ position: d.K2, couleur: COULEUR_DROITE, label: "K′" });
    }
  }
  return figureEspaceSvg({ ...baseFigure(e, mode), polygones, segments: segs, droites, marques, anneaux });
}

export function figureEcranIP(e: E, ctx: { ecran: number; clos: boolean; anneaux: AnneauEspace[] }): string {
  const etape = ctx.ecran + (ctx.clos ? 1 : 0);
  // Une fois l'écran 3 clos, la construction finale seule (les points numérotés encombraient la figure).
  return figureIP(e, "ecran", etape, ctx.ecran === 2 && !ctx.clos ? ctx.anneaux : []);
}

export function legendeIP(e: E): { couleur: string; texte: string }[] {
  if (e.variante === "faces-paralleles") return [{ couleur: COULEUR_PLAN_1, texte: "plan (PQR)" }, { couleur: COULEUR_ACCENT, texte: "[PQ]" }];
  const d = e.direction!;
  return [
    { couleur: COULEUR_PLAN_1, texte: `plan ${plan(d.plans[0])}` },
    { couleur: COULEUR_PLAN_2, texte: `plan ${plan(d.plans[1])}` },
  ];
}
