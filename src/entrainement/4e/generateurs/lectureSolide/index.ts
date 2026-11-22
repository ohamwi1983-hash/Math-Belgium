import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  AreteLue,
  ExerciceLectureSolide,
  FaceLue,
  GenreSolideLecture,
  LongueurLue,
  PaireLue,
  PlanLu,
  PointNommeLecture,
  PositionDeuxDroites,
  VarianteLectureSolide,
} from "../../core/lectureSolide.types";
import { normeCarree3D, pointAppartientAuPlan, produitScalaire3D, produitVectoriel3D, sontParalleles3D, soustraire3D } from "../solide3D/geometrieEspace";
import { calculerAretesAvecVisibilite } from "../../ui/solide3DSketch";
import { projeterPoint3D } from "../../ui/projectionCavaliere";
import { intersectionPixels } from "../../ui/figurePercee";
import { choisir, entier, melanger } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen133 « Lire un solide en perspective : vocabulaire et positions » (4e, ch. 8,
 * § 1 à § 4, Connaître). Tout le hasard passe par `Math.random` (`genererAvecCode` : le QR code
 * rouvre le MÊME exercice).
 *
 * Solides (dimensions réelles entières, en cm, dessinées à l'échelle en cavalière 45° / 0,5) :
 * cube et pavé ABCD-EFGH (face avant ABFE), prisme droit couché ABC-DEF (triangles avant et arrière,
 * fuyantes [AD], [BE], [CF]), tétraèdre ABCD « coin de cube » (face avant ABC, fuyante [AD]).
 * - « dessin » : a) faces en vraie grandeur / déformées, b) arêtes cachées (énoncé tout en traits
 *   pleins), c) vraie longueur d'une arête dont on donne la longueur dessinée — une fuyante deux fois
 *   sur trois, sinon une arête de face (horizontale ou verticale), tirage AVANT tout le reste ;
 * - « appartenance » : trois plans (une face, un plan diagonal ou par un milieu, un plan par un
 *   milieu) ; cocher les points nommés du plan autres que ceux qui le nomment (1 à 3, jamais aucun) ;
 * - « positions » : quatre paires de droites, chaque position au moins une fois (la position doublée
 *   tirée AVANT la boucle de rejet), toujours au moins une paire gauche qui se croise sur le dessin.
 */

export const CATALOGUE_VARIANTES: { id: VarianteLectureSolide; label: string }[] = [
  { id: "dessin", label: "Lire le dessin : faces, arêtes cachées, fuyantes" },
  { id: "appartenance", label: "Points d'un plan" },
  { id: "positions", label: "Positions de deux droites" },
];

const GENRES: GenreSolideLecture[] = ["cube", "pave", "prisme", "tetraedre"];
const EPS = 1e-6;

interface SolideConstruit {
  solide: Solide3D;
  dims: { l: number; p: number; h: number };
  roles: Record<string, string>;
}

function boite(id: string, label: string, l: number, p: number, h: number): SolideConstruit {
  return {
    solide: {
      id,
      label,
      sommets: {
        A: { x: 0, y: 0, z: 0 },
        B: { x: l, y: 0, z: 0 },
        C: { x: l, y: p, z: 0 },
        D: { x: 0, y: p, z: 0 },
        E: { x: 0, y: 0, z: h },
        F: { x: l, y: 0, z: h },
        G: { x: l, y: p, z: h },
        H: { x: 0, y: p, z: h },
      },
      faces: [
        ["A", "B", "F", "E"],
        ["D", "C", "G", "H"],
        ["A", "B", "C", "D"],
        ["E", "F", "G", "H"],
        ["A", "D", "H", "E"],
        ["B", "C", "G", "F"],
      ],
    },
    dims: { l, p, h },
    roles: { ABFE: "face avant", DCGH: "face arrière", ABCD: "face du dessous", EFGH: "face du dessus", ADHE: "face de gauche", BCGF: "face de droite" },
  };
}

export function construireSolide(genre: GenreSolideLecture): SolideConstruit {
  if (genre === "cube") {
    const a = choisir([3, 4, 5, 6]);
    return boite("cube", "Cube ABCDEFGH", a, a, a);
  }
  if (genre === "pave") {
    for (;;) {
      const l = entier(5, 8);
      const p = entier(3, 6);
      const h = entier(3, 6);
      if (l !== p && p !== h && l !== h) return boite("pave", "Pavé droit ABCDEFGH", l, p, h);
    }
  }
  if (genre === "prisme") {
    const l = choisir([4, 6, 8]);
    const p = entier(4, 7);
    const h = entier(3, 5);
    const c = choisir([0, l / 2]);
    return {
      solide: {
        id: "prisme",
        label: "Prisme droit ABCDEF",
        sommets: { A: { x: 0, y: 0, z: 0 }, B: { x: l, y: 0, z: 0 }, C: { x: c, y: 0, z: h }, D: { x: 0, y: p, z: 0 }, E: { x: l, y: p, z: 0 }, F: { x: c, y: p, z: h } },
        faces: [
          ["A", "B", "C"],
          ["D", "E", "F"],
          ["A", "B", "E", "D"],
          ["B", "C", "F", "E"],
          ["C", "A", "D", "F"],
        ],
      },
      dims: { l, p, h },
      roles: { ABC: "face avant", DEF: "face arrière", ABED: "face du dessous", BCFE: "face de droite", CADF: c === 0 ? "face de gauche" : "face de gauche, inclinée" },
    };
  }
  const l = entier(4, 6);
  const p = entier(4, 6);
  const h = entier(3, 6);
  return {
    solide: {
      id: "tetraedre",
      label: "Tétraèdre ABCD",
      sommets: { A: { x: 0, y: 0, z: 0 }, B: { x: l, y: 0, z: 0 }, C: { x: 0, y: 0, z: h }, D: { x: 0, y: p, z: 0 } },
      faces: [
        ["A", "B", "C"],
        ["A", "B", "D"],
        ["A", "C", "D"],
        ["B", "C", "D"],
      ],
    },
    dims: { l, p, h },
    roles: { ABC: "face avant", ABD: "face du dessous", ACD: "face de gauche", BCD: "face oblique, à l'arrière" },
  };
}

export const nomFace = (s: string[]) => s.join("");

function facesLues(c: SolideConstruit): FaceLue[] {
  return melanger(
    c.solide.faces.map((face) => {
      const ys = face.map((n) => c.solide.sommets[n]!.y);
      return { sommets: face, vraieGrandeur: ys.every((y) => Math.abs(y - ys[0]!) < EPS), role: c.roles[nomFace(face)] ?? "face" };
    }),
  );
}

function aretesLues(s: Solide3D): AreteLue[] {
  return calculerAretesAvecVisibilite(s)
    .map((a) => ({ sommets: [...a.sommets].sort() as [string, string], cachee: !a.visible }))
    .sort((a, b) => (a.sommets.join("") < b.sommets.join("") ? -1 : 1));
}

function longueurLue(c: SolideConstruit, fuyante: boolean): LongueurLue {
  const s = c.solide;
  const aretes = calculerAretesAvecVisibilite(s).map((a) => a.sommets);
  const candidates = aretes.filter(([a, b]) => {
    const d = soustraire3D(s.sommets[b]!, s.sommets[a]!);
    const nonNuls = [d.x, d.y, d.z].filter((v) => Math.abs(v) > EPS).length;
    if (nonNuls !== 1) return false;
    return fuyante ? Math.abs(d.y) > EPS : Math.abs(d.y) < EPS;
  });
  const arete = choisir(candidates);
  const [a, b] = arete;
  const vraie = Math.sqrt(normeCarree3D(soustraire3D(s.sommets[b]!, s.sommets[a]!)));
  const dessinee = fuyante ? vraie / 2 : vraie;
  const valeurs = [...new Set([dessinee * 2, dessinee, dessinee / 2])].sort((x, y) => x - y);
  const options: (number | null)[] = [...valeurs, null];
  return { arete: [a, b], fuyante, dessinee, vraie, options, bonne: options.indexOf(vraie) };
}

function milieu(p: Point3D, q: Point3D): Point3D {
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, z: (p.z + q.z) / 2 };
}

const NOMS_POINTS = ["I", "J", "K", "L"];

function tirerMilieux(s: Solide3D, n: number): PointNommeLecture[] {
  const aretes = melanger(calculerAretesAvecVisibilite(s).map((a) => a.sommets));
  return aretes.slice(0, n).map(([a, b], i) => ({ nom: NOMS_POINTS[i]!, position: milieu(s.sommets[a]!, s.sommets[b]!), milieuDe: [a, b] }));
}

function positionDe(s: Solide3D, points: PointNommeLecture[], nom: string): Point3D {
  return s.sommets[nom] ?? points.find((p) => p.nom === nom)!.position;
}

function alignes(a: Point3D, b: Point3D, c: Point3D): boolean {
  return normeCarree3D(produitVectoriel3D(soustraire3D(b, a), soustraire3D(c, a))) < EPS;
}

/** Parallélisme lisible par un élève : deux droites parallèles à une même arête du solide, ou
 * côtés opposés d'un parallélogramme de points nommés (vecteurs égaux ou opposés). `null` sinon (une
 * droite des milieux, par exemple, demanderait une justification de plus). */
function parallelismeEvident(s: Solide3D, r: Point3D, x: Point3D, p: Point3D, q: Point3D, noms: [string, string, string, string]): string | null {
  const u = soustraire3D(x, r);
  const v = soustraire3D(q, p);
  if (!sontParalleles3D(u, v)) return null;
  const [nr, nx, np, nq] = noms;
  const arete = calculerAretesAvecVisibilite(s)
    .map((a) => a.sommets)
    .find(([a, b]) => sontParalleles3D(soustraire3D(s.sommets[b]!, s.sommets[a]!), u));
  if (arete) {
    const nomA = arete.join("");
    const estA = (m: string, n: string) => m + n === nomA || n + m === nomA;
    if (estA(np, nq)) return `(${nr}${nx}) est parallèle à l'arête (${np}${nq})`;
    if (estA(nr, nx)) return `(${np}${nq}) est parallèle à l'arête (${nr}${nx})`;
    return `(${nr}${nx}) et (${np}${nq}) sont parallèles à l'arête (${nomA})`;
  }
  if (normeCarree3D(soustraire3D(u, v)) < EPS) return `${nr}${nx}${nq}${np} est un parallélogramme : (${nr}${nx}) est parallèle à (${np}${nq})`;
  if (normeCarree3D(soustraire3D(u, multiplierOppose(v))) < EPS) return `${nr}${nx}${np}${nq} est un parallélogramme : (${nr}${nx}) est parallèle à (${np}${nq})`;
  return null;
}

// --- Appartenance ----------------------------------------------------------------------------------

function nomsTous(s: Solide3D, points: PointNommeLecture[]): string[] {
  return [...Object.keys(s.sommets).sort(), ...points.map((p) => p.nom)];
}

/** Justifie, de proche en proche, chaque point du plan à partir des trois qui le nomment. */
function raisonsPlan(s: Solide3D, points: PointNommeLecture[], noms: string[], autres: string[], face: string | null): Record<string, string> | null {
  const pos = (n: string) => positionDe(s, points, n);
  const raisons: Record<string, string> = {};
  if (face) {
    for (const x of autres) {
      const m = points.find((p) => p.nom === x);
      raisons[x] = m ? `${x} est le milieu de [${m.milieuDe.join("")}], une arête de la face ${face}` : `${x} est un sommet de la face ${face}`;
    }
    return raisons;
  }
  const connus = [...noms];
  let restants = [...autres];
  let progres = true;
  while (restants.length > 0 && progres) {
    progres = false;
    for (const x of [...restants]) {
      const m = points.find((p) => p.nom === x);
      let raison: string | null = null;
      if (m && connus.includes(m.milieuDe[0]) && connus.includes(m.milieuDe[1])) raison = `${x} est le milieu de [${m.milieuDe.join("")}], et ${m.milieuDe[0]}, ${m.milieuDe[1]} sont dans le plan`;
      if (!raison) {
        for (let i = 0; i < connus.length && !raison; i++)
          for (let j = i + 1; j < connus.length && !raison; j++) if (alignes(pos(connus[i]!), pos(connus[j]!), pos(x))) raison = `${x} est sur la droite (${connus[i]}${connus[j]}), qui est dans le plan`;
      }
      if (!raison) {
        for (const r of connus) {
          for (let i = 0; i < connus.length && !raison; i++)
            for (let j = i + 1; j < connus.length && !raison; j++) {
              const p = connus[i]!;
              const q = connus[j]!;
              if (r === p || r === q) continue;
              const justification = parallelismeEvident(s, pos(r), pos(x), pos(p), pos(q), [r, x, p, q]);
              if (justification) raison = `${justification} : ${x} est sur la parallèle à (${p}${q}) menée par ${r}, qui est dans le plan`;
            }
          if (raison) break;
        }
      }
      if (raison) {
        raisons[x] = raison;
        connus.push(x);
        restants = restants.filter((y) => y !== x);
        progres = true;
      }
    }
  }
  return restants.length === 0 ? raisons : null;
}

function plansCandidats(s: Solide3D, points: PointNommeLecture[]): PlanLu[] {
  const tous = nomsTous(s, points);
  const pos = (n: string) => positionDe(s, points, n);
  const vus = new Set<string>();
  const res: PlanLu[] = [];
  for (let i = 0; i < tous.length; i++)
    for (let j = i + 1; j < tous.length; j++)
      for (let k = j + 1; k < tous.length; k++) {
        const noms = [tous[i]!, tous[j]!, tous[k]!];
        if (alignes(pos(noms[0]!), pos(noms[1]!), pos(noms[2]!))) continue;
        const plan = noms.map(pos) as [Point3D, Point3D, Point3D];
        const dans = tous.filter((n) => pointAppartientAuPlan(pos(n), plan));
        const autres = dans.filter((n) => !noms.includes(n));
        if (autres.length < 1 || autres.length > 3) continue;
        const faceSolide = s.faces.find((f) => f.every((n) => pointAppartientAuPlan(s.sommets[n]!, plan)));
        const face = faceSolide ? nomFace(faceSolide) : null;
        const type: PlanLu["type"] = face ? "face" : noms.some((n) => !s.sommets[n]) ? "milieu" : "diagonal";
        const cle = `${dans.join("")}|${noms.join("")}`;
        if (vus.has(cle)) continue;
        vus.add(cle);
        const raisons = raisonsPlan(s, points, noms, autres, face);
        if (!raisons) continue;
        const ordre = melanger(noms) as [string, string, string];
        res.push({ noms: ordre, type, candidats: tous.filter((n) => !noms.includes(n)), dans: autres, raisons, face });
      }
  return res;
}

function tirerPlans(s: Solide3D, points: PointNommeLecture[]): PlanLu[] | null {
  const tous = plansCandidats(s, points);
  const deType = (t: PlanLu["type"]) => tous.filter((p) => p.type === t);
  const faces = deType("face");
  const milieux = deType("milieu");
  const diagonaux = deType("diagonal");
  if (faces.length === 0 || milieux.length === 0) return null;
  const choisis: PlanLu[] = [choisir(faces)];
  const memePlan = (a: PlanLu, b: PlanLu) => [...a.dans, ...a.noms].sort().join("") === [...b.dans, ...b.noms].sort().join("");
  const second = (diagonaux.length > 0 ? diagonaux : milieux).filter((p) => !choisis.some((c) => memePlan(c, p)));
  if (second.length === 0) return null;
  choisis.push(choisir(second));
  const troisieme = milieux.filter((p) => !choisis.some((c) => memePlan(c, p)));
  if (troisieme.length === 0) return null;
  choisis.push(choisir(troisieme));
  return choisis;
}

// --- Positions de deux droites --------------------------------------------------------------------

interface DroiteNommee {
  noms: [string, string];
}

function classer(a: Point3D, b: Point3D, c: Point3D, d: Point3D): PositionDeuxDroites | "confondues" {
  const u = soustraire3D(b, a);
  const v = soustraire3D(d, c);
  if (sontParalleles3D(u, v)) return alignes(a, b, c) ? "confondues" : "paralleles";
  const mixte = produitScalaire3D(produitVectoriel3D(u, v), soustraire3D(c, a));
  return Math.abs(mixte) < EPS ? "secantes" : "gauches";
}

function croisentSurLeDessin(a: Point3D, b: Point3D, c: Point3D, d: Point3D): boolean {
  const [pa, pb, pc, pd] = [a, b, c, d].map(projeterPoint3D) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
  const i = intersectionPixels(pa, pb, pc, pd);
  if (!i) return false;
  const dans = (p: { x: number; y: number }, q: { x: number; y: number }) => {
    const lx = q.x - p.x;
    const ly = q.y - p.y;
    const u = ((i.x - p.x) * lx + (i.y - p.y) * ly) / (lx * lx + ly * ly || 1);
    return u > 0.08 && u < 0.92;
  };
  return dans(pa, pb) && dans(pc, pd);
}

function raisonPaire(s: Solide3D, points: PointNommeLecture[], d1: [string, string], d2: [string, string], position: PositionDeuxDroites): string | null {
  const pos = (n: string) => positionDe(s, points, n);
  const [x, y] = d1;
  const [z, w] = d2;
  if (position === "gauches") return `aucun plan ne contient les quatre points ${x}, ${y}, ${z} et ${w}`;
  if (position === "secantes") {
    const noms = alignes(pos(x), pos(y), pos(z)) ? [x, y, w] : [x, y, z];
    const plan = noms.map(pos) as [Point3D, Point3D, Point3D];
    const face = s.faces.find((f) => f.every((n) => pointAppartientAuPlan(s.sommets[n]!, plan)));
    return `${x}, ${y}, ${z} et ${w} sont dans ${face ? `la face ${nomFace(face)}` : `le plan (${noms.join("")})`}, et les droites ne sont pas parallèles`;
  }
  const u = soustraire3D(pos(y), pos(x));
  const aretes = calculerAretesAvecVisibilite(s).map((a) => a.sommets);
  const estArete = (p: string, q: string) => aretes.some(([a, b]) => (a === p && b === q) || (a === q && b === p));
  if (estArete(z, w)) return `(${x}${y}) est parallèle à l'arête (${z}${w})`;
  if (estArete(x, y)) return `(${z}${w}) est parallèle à l'arête (${x}${y})`;
  const temoin = aretes.find(([a, b]) => sontParalleles3D(soustraire3D(s.sommets[b]!, s.sommets[a]!), u));
  if (temoin) return `(${x}${y}) et (${z}${w}) sont toutes deux parallèles à l'arête (${temoin.join("")})`;
  const v = soustraire3D(pos(w), pos(z));
  if (normeCarree3D(soustraire3D(u, v)) < EPS) return `${x}${y}${w}${z} est un parallélogramme : ses côtés opposés (${x}${y}) et (${z}${w}) sont parallèles`;
  if (normeCarree3D(soustraire3D(u, multiplierOppose(v))) < EPS) return `${x}${y}${z}${w} est un parallélogramme : ses côtés opposés (${x}${y}) et (${z}${w}) sont parallèles`;
  return null;
}

function multiplierOppose(v: Point3D): Point3D {
  return { x: -v.x, y: -v.y, z: -v.z };
}

function dansUneFace(s: Solide3D, points: Point3D[]): boolean {
  return s.faces.some((f) => {
    const plan = f.slice(0, 3).map((n) => s.sommets[n]!) as [Point3D, Point3D, Point3D];
    return points.every((p) => pointAppartientAuPlan(p, plan));
  });
}

function tirerPaires(s: Solide3D, points: PointNommeLecture[]): PaireLue[] | null {
  const tous = nomsTous(s, points);
  const pos = (n: string) => positionDe(s, points, n);
  const droites: DroiteNommee[] = [];
  for (let i = 0; i < tous.length; i++) for (let j = i + 1; j < tous.length; j++) droites.push({ noms: [tous[i]!, tous[j]!] });
  // Position doublée tirée AVANT la boucle de rejet : fréquences des positions non biaisées.
  const double = choisir<PositionDeuxDroites>(["secantes", "paralleles", "gauches"]);
  const positions = melanger<PositionDeuxDroites>(["secantes", "paralleles", "gauches", double]);
  const prises = new Set<string>();
  const paires: PaireLue[] = [];
  let croisementVu = false;
  for (let n = 0; n < positions.length; n++) {
    const voulue = positions[n]!;
    const dernierGauche = voulue === "gauches" && !croisementVu && positions.slice(n + 1).every((p) => p !== "gauches");
    let trouvee: PaireLue | null = null;
    for (let essai = 0; essai < 400 && !trouvee; essai++) {
      const d1 = choisir(droites).noms;
      const d2 = choisir(droites).noms;
      if (new Set([...d1, ...d2]).size < 4) continue;
      const cle1 = d1.join("");
      const cle2 = d2.join("");
      if (prises.has(cle1) || prises.has(cle2)) continue;
      const [a, b, c, d] = [d1[0], d1[1], d2[0], d2[1]].map(pos) as [Point3D, Point3D, Point3D, Point3D];
      if (classer(a, b, c, d) !== voulue) continue;
      const croise = voulue === "gauches" && croisentSurLeDessin(a, b, c, d);
      // Pièges du cours : gauches qui se croisent sur le dessin (toujours au moins une fois),
      // parallèles le plus souvent dans deux faces différentes.
      if (dernierGauche && !croise) continue;
      if (voulue === "gauches" && !croise && essai < 200) continue;
      if (voulue === "paralleles" && dansUneFace(s, [a, b, c, d]) && essai < 150 && Math.random() < 0.6) continue;
      const raison = raisonPaire(s, points, d1, d2, voulue);
      if (!raison) continue;
      const [e1, e2] = Math.random() < 0.5 ? [d1, d2] : [d2, d1];
      trouvee = { d1: e1, d2: e2, position: voulue, croisementDessin: croise, raison: raisonPaire(s, points, e1, e2, voulue)! };
    }
    if (!trouvee) return null;
    croisementVu = croisementVu || trouvee.croisementDessin;
    prises.add(trouvee.d1.join(""));
    prises.add(trouvee.d2.join(""));
    paires.push(trouvee);
  }
  return croisementVu ? paires : null;
}

// --- Assemblage -----------------------------------------------------------------------------------

export function genererLectureSolide(variante: VarianteLectureSolide): ExerciceLectureSolide {
  // Verdict de l'écran c (fuyante ou arête de face) tiré AVANT tout le reste.
  const fuyante = Math.random() < 2 / 3;
  for (;;) {
    // « positions » : jamais le tétraèdre (trop peu de droites pour quatre paires variées).
    const genre = choisir(variante === "positions" ? GENRES.filter((g) => g !== "tetraedre") : GENRES);
    const c = construireSolide(genre);
    const base = {
      variante,
      genre,
      solide: c.solide,
      dims: c.dims,
      faces: facesLues(c),
      aretes: aretesLues(c.solide),
      longueur: longueurLue(c, fuyante),
    };
    if (variante === "dessin") return { ...base, points: [], plans: [], paires: [] };
    if (variante === "appartenance") {
      const points = tirerMilieux(c.solide, entier(2, 3));
      const plans = tirerPlans(c.solide, points);
      if (!plans) continue;
      return { ...base, points, plans, paires: [] };
    }
    const points = tirerMilieux(c.solide, choisir([0, 1, 2]));
    const paires = tirerPaires(c.solide, points);
    if (!paires) continue;
    return { ...base, points, plans: [], paires };
  }
}

export function construireAvecVariante(id: string): ExerciceLectureSolide {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererLectureSolide(v.id) : genererExerciceLectureSolide();
}

export function genererExerciceLectureSolide(): ExerciceLectureSolide {
  return genererLectureSolide(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
