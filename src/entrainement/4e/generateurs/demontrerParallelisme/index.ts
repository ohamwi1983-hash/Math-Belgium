import type { NomSolide3D, PlanSolide3D, Point3D } from "../../core/geometrieEspace.types";
import type { MilieuNomme } from "../../core/positionsPlans.types";
import type {
  CandidatParallelisme,
  DroiteNommee2,
  ExerciceDemontrerParallelisme,
  ExerciceDeuxPlansParalleles,
  ExerciceDroitePlanParallele,
  OptionDemonstration,
  RaisonParallele,
  TypeRaisonParallele,
  VarianteDemontrerParallelisme,
} from "../../core/demontrerParallelisme.types";
import { EPSILON_3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { aretesSolide, dansPlan, donneesSolide, droiteDansPlan, droitesParalleles, memeDroite, memePlan, plansParalleles, relationDroitePlan, type DonneesSolide, type PlanGeo, type PointDispo } from "../positionsPlans/geometriePlans";
import { choisirPlan, droitesNommees, type DroiteNommee } from "../positionsPlans";
import { faitsSolide, memesDroitesQueFait, plansNommage, tirerTriangle, trianglesNommage, type FaitParallele, type Triangle } from "./geometrieParallelisme";

/**
 * Générateur de gen103 — « Démontrer un parallélisme » (4e, chapitre 8, section `parallelisme`).
 * Tout le hasard passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace
 * par une graine, et le QR code d'une feuille rouvre le MÊME exercice. L'énumération géométrique
 * (`geometrieParallelisme.ts`, `positionsPlans/geometriePlans.ts`) est déterministe et mise en cache.
 *
 * Ordre du tirage : ce qui fixe la justification attendue (type de raison : côtés opposés d'un
 * parallélogramme, droite des milieux, milieux de deux côtés opposés ; rôle de la droite des milieux)
 * est tiré EN PREMIER, à parts égales, avant toute boucle de rejet ; le solide est gardé pendant le
 * rejet (on n'en change qu'après 150 essais infructueux).
 *
 * Leçons de l'audit de gen39/40/41 et de gen100/101, appliquées d'emblée :
 * - la droite témoin ne se devine pas par les lettres : les leurres « dans le plan, non parallèles »
 *   portent eux aussi des lettres du nom du plan, et la droite témoin n'utilise pas toujours deux
 *   lettres de ce nom (mesuré, voir le rapport) ;
 * - tout ce qui est proposé est VRAI sauf le point que l'élève doit vérifier (une droite hors du plan
 *   est vraiment parallèle à (T), un leurre de justification est un fait vrai mais insuffisant) ;
 * - l'ordre des options est mélangé ; UNE tentative par choix fermé ;
 * - tout milieu nommé sert à nommer un plan ou la droite de l'énoncé : aucune lettre « en trop » qui
 *   désignerait la réponse.
 */

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function tirerPondere<T>(options: [T, number][]): T {
  const total = options.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [v, p] of options) {
    r -= p;
    if (r <= 0) return v;
  }
  return options[options.length - 1]![0];
}

const TOUS: NomSolide3D[] = ["cube", "parallelepipede", "prisme", "tetraedre", "pyramideCarree"];
/** Solides qui ont un parallélogramme de 4 sommets (le tétraèdre n'en a aucun). */
const AVEC_QUADRILATERE: NomSolide3D[] = ["cube", "parallelepipede", "prisme", "pyramideCarree"];
const LETTRES = ["I", "J", "K"];

// --- Noms ------------------------------------------------------------------------------------------

interface Nommage {
  nomDe: (p: PointDispo) => string;
  milieux: MilieuNomme[];
  nommes: { nom: string; position: Point3D }[];
}

/** Lettres I, J, K attribuées aux milieux à nommer, dans un ordre tiré au hasard (aucune lettre ne
 * désigne systématiquement la droite de l'énoncé ou la réponse). */
function nommer(d: DonneesSolide, milieux: PointDispo[]): Nommage {
  const uniques = milieux.filter((m, i) => milieux.findIndex((x) => x.cle === m.cle) === i);
  const lettres = melanger(LETTRES).slice(0, uniques.length).sort();
  const ordre = melanger(uniques);
  const noms = new Map(ordre.map((m, i) => [m.cle, lettres[i]!]));
  const liste: MilieuNomme[] = ordre
    .map((m) => ({ nom: noms.get(m.cle)!, position: m.position, milieuDe: m.milieuDe! }))
    .sort((a, b) => a.nom.localeCompare(b.nom));
  return {
    nomDe: (p) => p.sommet ?? noms.get(p.cle)!,
    milieux: liste,
    nommes: [...Object.entries(d.solide.sommets).map(([nom, position]) => ({ nom, position })), ...liste.map((m) => ({ nom: m.nom, position: m.position }))],
  };
}

function nomPlanTriangle(t: Triangle, nomDe: (p: PointDispo) => string, d: DonneesSolide): PlanSolide3D {
  const lettres = t.map(nomDe);
  const sommets = lettres.filter((l) => d.solide.sommets[l]).sort();
  const autres = lettres.filter((l) => !d.solide.sommets[l]).sort();
  return [...sommets, ...autres] as PlanSolide3D;
}

const milieuxDe = (pts: PointDispo[]) => pts.filter((p) => p.milieuDe);

export function libelle(d: DroiteNommee2): string {
  return `(${d[0]}${d[1]})`;
}

/** Noms écrits partout dans l'ordre alphabétique — droites « (AD) », segments « [AD] », triangles
 * « DEF » — comme les droites des leurres (`droitesNommees`) : l'ordre des lettres ne distingue
 * jamais la bonne réponse. */
function trie(d: DroiteNommee2): DroiteNommee2 {
  return [...d].sort() as DroiteNommee2;
}

function seg(a: string, b: string): string {
  return `[${[a, b].sort().join("")}]`;
}

function nomTriangle(figure: string[]): string {
  return [...figure].sort().join("");
}

// --- Textes des raisons et des justifications --------------------------------------------------------

/** Phrase de la raison valable, conclue par « donc (L) ∥ (M) » — UNE source pour l'option valable,
 * l'explication et le corrigé. */
export function texteRaison(r: RaisonParallele): string {
  const conclusion = `donc ${libelle(r.droite1)} ∥ ${libelle(r.droite2)}`;
  const fig = r.figure.join("");
  if (r.type === "quad") return `${fig} est un ${r.nature}, ${conclusion}.`;
  if (r.type === "milieux") {
    const [x, y, z] = r.figure as [string, string, string];
    return `Dans le triangle ${nomTriangle(r.figure)}, ${r.milieux![0]} et ${r.milieux![1]} sont les milieux de ${seg(x, y)} et ${seg(x, z)}, ${conclusion}.`;
  }
  const [c1, c2] = r.cotes!;
  return `${r.milieux![0]} et ${r.milieux![1]} sont les milieux des côtés opposés ${seg(c1[0], c1[1])} et ${seg(c2[0], c2[1])} du ${r.nature} ${fig}, ${conclusion}.`;
}

export interface Contexte {
  d: DonneesSolide;
  pos: (nom: string) => Point3D;
}

function faceNom(face: string[]): string {
  return face.join("");
}

function plansFace(d: DonneesSolide): { nom: string; trois: [Point3D, Point3D, Point3D] }[] {
  return d.solide.faces.map((f, i) => ({ nom: faceNom(f), trois: d.faces[i]! }));
}

/** Parallélogrammes de 4 sommets du solide (faces, plans diagonaux) : nom et nature. */
function quadrilateres(d: DonneesSolide): { figure: string[]; nature: string }[] {
  const vus = new Set<string>();
  const liste: { figure: string[]; nature: string }[] = [];
  for (const f of faitsSolide(d)) {
    if (f.type !== "quad" || vus.has(f.figure.join(""))) continue;
    vus.add(f.figure.join(""));
    liste.push({ figure: f.figure, nature: f.nature! });
  }
  return liste;
}

/**
 * Options de justification du parallélisme (L) ∥ (M), toutes conclues par « donc (L) ∥ (M) » :
 * - la raison valable ;
 * - un leurre VRAI mais insuffisant, avec les mêmes mots que la raison (côtés opposés d'un
 *   quadrilatère quelconque, segments de même longueur, « un point de » au lieu de « le milieu de ») ;
 * - un leurre « bonne propriété, mauvaise figure » : un vrai rectangle du solide qui ne contient
 *   qu'une des deux droites, ou un seul milieu au lieu de deux ;
 * - un leurre générique vrai mais insuffisant (deux faces parallèles, une face parallèle aux deux
 *   droites, aucun point commun, impression du dessin).
 * Un élève qui ne retient que les mots-clés (« rectangle », « milieu ») ne peut donc pas trancher sans
 * regarder la figure.
 */
export function justificationsPour(ctx: Contexte, r: RaisonParallele): OptionDemonstration[] {
  const L = libelle(r.droite1);
  const M = libelle(r.droite2);
  const donc = `donc ${L} ∥ ${M}`;
  const valable: OptionDemonstration = { texte: texteRaison(r), valide: true, defaut: "" };
  const fig = r.figure.join("");
  const pts = (dr: DroiteNommee2) => [ctx.pos(dr[0]), ctx.pos(dr[1])] as const;
  const [l1, l2] = pts(r.droite1);
  const [m1, m2] = pts(r.droite2);

  let insuffisant: OptionDemonstration;
  if (r.type === "quad") {
    insuffisant =
      Math.random() < 0.5
        ? {
            texte: `${seg(r.droite1[0], r.droite1[1])} et ${seg(r.droite2[0], r.droite2[1])} sont deux côtés opposés du quadrilatère ${fig}, ${donc}.`,
            valide: false,
            defaut: `Les côtés opposés d'un quadrilatère quelconque ne sont pas forcément parallèles : il faut savoir que ${fig} est un ${r.nature}.`,
          }
        : {
            texte: `${seg(r.droite1[0], r.droite1[1])} et ${seg(r.droite2[0], r.droite2[1])} ont la même longueur, ${donc}.`,
            valide: false,
            defaut: "Deux segments de même longueur ne sont pas forcément parallèles : la longueur ne dit rien de la direction.",
          };
  } else if (r.type === "milieux") {
    const [x, y, z] = r.figure as [string, string, string];
    insuffisant = {
      texte: `Dans le triangle ${nomTriangle(r.figure)}, ${r.milieux![0]} est un point de ${seg(x, y)} et ${r.milieux![1]} un point de ${seg(x, z)}, ${donc}.`,
      valide: false,
      defaut: "Deux points quelconques des côtés ne suffisent pas : la droite des milieux demande que ce soient les MILIEUX des deux côtés.",
    };
  } else {
    const [c1, c2] = r.cotes!;
    insuffisant = {
      texte: `${r.milieux![0]} est un point de ${seg(c1[0], c1[1])} et ${r.milieux![1]} un point de ${seg(c2[0], c2[1])}, deux côtés opposés du ${r.nature} ${fig}, ${donc}.`,
      valide: false,
      defaut: "Deux points quelconques de deux côtés opposés ne suffisent pas : il faut que ce soient leurs MILIEUX.",
    };
  }

  // Bonne propriété, mauvaise figure.
  let mauvaiseFigure: OptionDemonstration | null = null;
  if (r.type === "milieux") {
    const [x, y, z] = r.figure as [string, string, string];
    // Fausse donnée : même phrase, mais un autre triangle dont le second côté n'est pas celui que
    // coupe le milieu (l'élève doit relire la définition des points).
    const sommets = ctx.d.solide.sommets;
    const aretes = new Set(aretesSolide(ctx.d.solide).map((a) => a.join("")));
    const estArete = (a: string, b: string) => aretes.has([a, b].sort().join(""));
    const autresZ = Object.keys(sommets).filter((w) => w !== x && w !== y && w !== z && estArete(x, w));
    if (autresZ.length > 0 && Math.random() < 0.5) {
      const w = choisir(autresZ);
      const triangle = nomTriangle([x, y, w]);
      mauvaiseFigure = {
        texte: `Dans le triangle ${triangle}, ${r.milieux![0]} et ${r.milieux![1]} sont les milieux de ${seg(x, y)} et ${seg(x, w)}, ${donc}.`,
        valide: false,
        defaut: `${r.milieux![1]} n'est pas le milieu de ${seg(x, w)} : c'est le milieu de ${seg(x, z)}. Il faut utiliser le triangle ${nomTriangle(r.figure)}.`,
      };
    } else {
      mauvaiseFigure = {
        texte: `Dans le triangle ${nomTriangle(r.figure)}, ${r.milieux![0]} est le milieu de ${seg(x, y)}, ${donc}.`,
        valide: false,
        defaut: "Un seul milieu ne suffit pas : la droite des milieux joint les milieux de DEUX côtés du triangle.",
      };
    }
  } else {
    const plan = (figure: string[]) => figure.slice(0, 3).map((n) => ctx.d.solide.sommets[n]!) as [Point3D, Point3D, Point3D];
    const autres = quadrilateres(ctx.d).filter((q) => {
      if (q.figure.join("") === fig) return false;
      const avecL = droiteDansPlan(l1, l2, plan(q.figure));
      const avecM = droiteDansPlan(m1, m2, plan(q.figure));
      return avecL !== avecM;
    });
    if (autres.length > 0) {
      const q = choisir(autres);
      const absent = droiteDansPlan(l1, l2, plan(q.figure)) ? M : L;
      mauvaiseFigure = {
        texte: `${q.figure.join("")} est un ${q.nature}, ${donc}.`,
        valide: false,
        defaut: `${q.figure.join("")} est bien un ${q.nature}, mais ${absent} n'est pas dans son plan : ses côtés ne disent rien de ${absent}.`,
      };
    }
  }

  const faces = plansFace(ctx.d);
  const forts: OptionDemonstration[] = [];
  const fl = faces.find((f) => droiteDansPlan(l1, l2, f.trois));
  const fm = fl ? faces.find((f) => f !== fl && droiteDansPlan(m1, m2, f.trois) && plansPar(f.trois, fl.trois) && !droiteDansPlan(m1, m2, fl.trois)) : undefined;
  if (fl && fm) {
    forts.push({
      texte: `${L} est dans la face ${fl.nom} et ${M} dans la face ${fm.nom}, deux faces parallèles, ${donc}.`,
      valide: false,
      defaut: "Deux droites situées dans deux plans parallèles peuvent être gauches : cela ne prouve pas qu'elles sont parallèles.",
    });
  }
  const fp = faces.find((f) => relationDroitePlan(l1, l2, f.trois) === "parallele" && relationDroitePlan(m1, m2, f.trois) === "parallele");
  if (fp) {
    forts.push({
      texte: `${L} et ${M} sont toutes les deux parallèles à la face ${fp.nom}, ${donc}.`,
      valide: false,
      defaut: "Deux droites parallèles à un même plan peuvent être sécantes ou gauches : cela ne prouve pas qu'elles sont parallèles.",
    });
  }
  const generiques: OptionDemonstration[] = [
    {
      texte: `${L} et ${M} n'ont aucun point commun, ${donc}.`,
      valide: false,
      defaut: "Deux droites sans point commun peuvent être gauches : il faut en plus qu'elles soient dans un même plan.",
    },
    {
      texte: `Sur le dessin, ${L} et ${M} semblent parallèles, ${donc}.`,
      valide: false,
      defaut: "Une impression sur le dessin n'est jamais une preuve : il faut une raison géométrique.",
    },
  ];
  const reserve = [...melanger(forts), ...melanger(generiques)];
  const choisies = [insuffisant, ...(mauvaiseFigure ? [mauvaiseFigure] : []), ...reserve].slice(0, 3);
  return melanger([valable, ...choisies]);
}

function plansPar(a: [Point3D, Point3D, Point3D], b: [Point3D, Point3D, Point3D]): boolean {
  const n1 = normale(a);
  const n2 = normale(b);
  const c = { x: n1.y * n2.z - n1.z * n2.y, y: n1.z * n2.x - n1.x * n2.z, z: n1.x * n2.y - n1.y * n2.x };
  return c.x * c.x + c.y * c.y + c.z * c.z < EPSILON_3D;
}

function normale([p, q, r]: [Point3D, Point3D, Point3D]): Point3D {
  const u = { x: q.x - p.x, y: q.y - p.y, z: q.z - p.z };
  const v = { x: r.x - p.x, y: r.y - p.y, z: r.z - p.z };
  return { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
}

export function raisonDepuisFait(f: FaitParallele, nomDe: (p: PointDispo) => string, inverse: boolean): RaisonParallele {
  const d1 = trie(f.d1.map(nomDe) as DroiteNommee2);
  const d2 = trie(f.d2.map(nomDe) as DroiteNommee2);
  // Milieux cités dans l'ordre alphabétique (« I et J sont les milieux de… »), leurs côtés suivent.
  let milieux = f.type === "quad" ? null : (f.d1.map(nomDe) as [string, string]);
  let figure = f.figure;
  let cotes = f.cotes;
  if (milieux && milieux[0] > milieux[1]) {
    milieux = [milieux[1], milieux[0]];
    if (f.type === "milieux") figure = [f.figure[0]!, f.figure[2]!, f.figure[1]!];
    else cotes = [f.cotes![1], f.cotes![0]];
  }
  return { type: f.type, droite1: inverse ? d2 : d1, droite2: inverse ? d1 : d2, figure, nature: f.nature, milieux, cotes };
}

// --- Critères (écran 1) ---------------------------------------------------------------------------

export const CRITERE_DROITE_PLAN = (T: string, P: string) => `Trouver une droite du plan ${P} qui est parallèle à ${T}.`;
export const CRITERE_DEUX_PLANS = (P: string, Q: string) => `Trouver deux droites sécantes du plan ${P} parallèles à deux droites du plan ${Q}.`;

function criteresDroitePlan(T: string, P: string, triangle: string): OptionDemonstration[] {
  const leurres: OptionDemonstration[] = [
    {
      texte: `Trouver une droite parallèle à ${T} qui passe par un point du plan ${P}.`,
      valide: false,
      defaut: "Une telle droite n'est pas forcément dans le plan : elle peut le percer. Le critère demande une droite DU plan.",
    },
    {
      texte: `Vérifier que ${T} ne rencontre pas le triangle ${triangle} sur le dessin.`,
      valide: false,
      defaut: "Le triangle n'est qu'un morceau du plan, qui est infini, et une impression sur le dessin n'est jamais une preuve.",
    },
    {
      texte: `Trouver deux droites sécantes du plan ${P} parallèles à ${T}.`,
      valide: false,
      defaut: `C'est impossible : deux droites parallèles à ${T} sont parallèles entre elles. Ce critère-là sert pour deux plans ; ici, une seule droite du plan suffit.`,
    },
    {
      texte: `Trouver deux points de ${T} qui appartiennent au plan ${P}.`,
      valide: false,
      defaut: "Ce serait prouver que la droite est incluse dans le plan, pas qu'elle lui est parallèle sans le toucher.",
    },
  ];
  return melanger([{ texte: CRITERE_DROITE_PLAN(T, P), valide: true, defaut: "" }, ...melanger(leurres).slice(0, 3)]);
}

function criteresDeuxPlans(P: string, Q: string, t1: string, t2: string): OptionDemonstration[] {
  const leurres: OptionDemonstration[] = [
    {
      texte: `Trouver une droite du plan ${P} parallèle à une droite du plan ${Q}.`,
      valide: false,
      defaut: "Une seule direction ne suffit pas : deux plans sécants contiennent aussi des droites parallèles (à leur droite d'intersection).",
    },
    {
      texte: `Trouver deux droites parallèles du plan ${P}, parallèles à deux droites du plan ${Q}.`,
      valide: false,
      defaut: "Deux droites parallèles entre elles ne donnent qu'une seule direction : le critère demande deux droites SÉCANTES.",
    },
    {
      texte: `Vérifier que les triangles ${t1} et ${t2} ne se touchent pas sur le dessin.`,
      valide: false,
      defaut: "Deux triangles sans point commun peuvent très bien appartenir à des plans sécants : un plan est infini, et le dessin peut tromper.",
    },
    {
      texte: `Trouver une droite du plan ${P} qui est parallèle au plan ${Q}.`,
      valide: false,
      defaut: "Une droite parallèle à l'autre plan ne suffit pas : deux plans sécants en contiennent aussi.",
    },
  ];
  return melanger([{ texte: CRITERE_DEUX_PLANS(P, Q), valide: true, defaut: "" }, ...melanger(leurres).slice(0, 3)]);
}

// ================================================================================================
// Variante « droite parallèle à un plan »
// ================================================================================================

const TYPES_RAISON: TypeRaisonParallele[] = ["quad", "milieux", "milieuxParallelogramme"];

/** Nombre de lettres de la droite témoin dans le nom du plan : 0, 1 ou 2 (au moins le nombre de ses
 * milieux, qui doivent être nommés par le plan). */
const POIDS_RECOUVREMENT: [number, number][] = [
  [0, 0.25],
  [1, 0.5],
  [2, 0.25],
];

function pointHors(nommes: { nom: string; position: Point3D }[], dr: DroiteNommee2, plan: [Point3D, Point3D, Point3D]): string {
  const nom = dr.find((n) => !dansPlan(nommes.find((x) => x.nom === n)!.position, plan));
  return nom ?? dr[0];
}

function genererDroitePlan(): ExerciceDroitePlanParallele {
  const type = choisir(TYPES_RAISON);
  const roleMilieu = Math.random() < 0.5;
  const solides = type === "milieux" ? TOUS : AVEC_QUADRILATERE;
  let solide = GABARITS_SOLIDE3D[choisir(solides)];
  const recouvrementVise = tirerPondere(POIDS_RECOUVREMENT);
  for (let tentative = 0; tentative < 3000; tentative++) {
    if (tentative > 0 && tentative % 150 === 0) solide = GABARITS_SOLIDE3D[choisir(solides)];
    const strict = tentative < 2400;
    const d = donneesSolide(solide);
    const faits = faitsSolide(d).filter((f) => f.type === type);
    if (faits.length === 0) continue;
    const f = choisir(faits);
    const inverse = type === "quad" ? Math.random() < 0.5 : !roleMilieu;
    const [T, W] = inverse ? [f.d2, f.d1] : [f.d1, f.d2];
    const plans = plansNommage(d).filter((p) => droiteDansPlan(W[0].position, W[1].position, p.trois) && !dansPlan(T[0].position, p.trois));
    if (plans.length === 0) continue;
    const pi = choisirPlan(plans);
    const milieuxW = milieuxDe(W);
    const recouvrement = Math.max(recouvrementVise, milieuxW.length);
    const triangles = trianglesNommage(d, pi).filter((t) => {
      if (!milieuxW.every((m) => t.some((p) => p.cle === m.cle))) return false;
      if (new Set([...milieuxDe(T), ...milieuxDe(t)].map((p) => p.cle)).size > 3) return false;
      return !strict || t.filter((p) => W.some((w) => w.cle === p.cle)).length === recouvrement;
    });
    if (triangles.length === 0) continue;
    const triangle = tirerTriangle(triangles);
    const nommage = nommer(d, [...milieuxDe(T), ...milieuxDe(triangle)]);
    const { nomDe, nommes } = nommage;
    const nomPi = nomPlanTriangle(triangle, nomDe, d);
    const raison = raisonDepuisFait(f, nomDe, inverse);
    const droite = raison.droite1;
    const temoin = raison.droite2;

    // Candidats : droites passant par deux points nommés.
    const lignes = droitesNommees(nommes, () => true);
    const tA = T[0].position;
    const tB = T[1].position;
    const horsPlan: DroiteNommee[] = [];
    const dansLePlan: DroiteNommee[] = [];
    for (const l of lignes) {
      if (memeDroite(l.a, l.b, tA, tB) || memeDroite(l.a, l.b, W[0].position, W[1].position)) continue;
      const inclus = droiteDansPlan(l.a, l.b, pi.trois);
      const par = droitesParalleles(l.a, l.b, tA, tB);
      if (inclus && par) continue; // autre droite témoin : jamais proposée (une seule bonne réponse)
      if (par) horsPlan.push(l);
      else if (inclus) dansLePlan.push(l);
    }
    // Le tétraèdre n'a aucune autre droite nommée parallèle à (T) : seuls des leurres « dans le
    // plan » y sont proposés (trois au moins). Ailleurs, le piège « parallèle mais hors du plan » est
    // toujours présent.
    if (horsPlan.length === 0 && solide.id !== "tetraedre") continue;
    if (dansLePlan.length < (horsPlan.length === 0 ? 3 : 2)) continue;
    const nbHors = horsPlan.length === 0 ? 0 : horsPlan.length >= 2 && Math.random() < 0.35 ? 2 : 1;
    const hors = melanger(horsPlan).slice(0, nbHors);
    const lettresPi = new Set(nomPi);
    const poidsN = (l: DroiteNommee) => (l.noms.some((n) => lettresPi.has(n)) ? 4 : 1);
    const nVoulus = Math.min(dansLePlan.length, 4 - nbHors);
    const dedans: DroiteNommee[] = [];
    let reste = [...dansLePlan];
    while (dedans.length < nVoulus) {
      const l = tirerPondere(reste.map((x) => [x, poidsN(x)] as [DroiteNommee, number]));
      dedans.push(l);
      reste = reste.filter((x) => x !== l);
    }
    const piPts = pi.trois;
    const nomP = `(${nomPi.join("")})`;
    const Tl = libelle(droite);
    const brut: { droite: DroiteNommee2; defaut: string | null }[] = [
      { droite: temoin, defaut: null },
      ...hors.map((l) => ({
        droite: l.noms,
        defaut: `${libelle(l.noms)} est bien parallèle à ${Tl}, mais elle n'est pas une droite du plan ${nomP} : ${pointHors(nommes, l.noms, piPts)} n'appartient pas à ce plan.`,
      })),
      ...dedans.map((l) => ({
        droite: l.noms,
        defaut: `${libelle(l.noms)} est bien une droite du plan ${nomP}, mais elle n'est pas parallèle à ${Tl} : ces deux droites sont gauches.`,
      })),
    ];
    const ordre = melanger(brut);
    const ctx: Contexte = { d, pos: (n) => nommes.find((x) => x.nom === n)!.position };
    return {
      variante: "droite-plan",
      solide,
      milieux: nommage.milieux,
      plans: [nomPi],
      droite,
      criteres: criteresDroitePlan(Tl, nomP, nomPi.join("")),
      candidats: ordre.map((c) => c.droite),
      temoin: ordre.findIndex((c) => c.defaut === null),
      defautsCandidats: ordre.map((c) => c.defaut),
      raison,
      justifications: justificationsPour(ctx, raison),
    };
  }
  throw new Error(`gen103 : aucune instance « droite-plan » (${type}) trouvée`);
}

// ================================================================================================
// Variante « deux plans parallèles »
// ================================================================================================

interface Oriente {
  f: FaitParallele;
  l: [PointDispo, PointDispo];
  m: [PointDispo, PointDispo];
  inverse: boolean;
}

function dansPlanGeo(pts: PointDispo[], p: PlanGeo): boolean {
  return pts.every((x) => dansPlan(x.position, p.trois));
}

function genererDeuxPlans(): ExerciceDeuxPlansParalleles {
  let solide = GABARITS_SOLIDE3D[choisir(TOUS)];
  const avecDoublon = Math.random() < 0.6;
  for (let tentative = 0; tentative < 3000; tentative++) {
    if (tentative > 0 && tentative % 150 === 0) solide = GABARITS_SOLIDE3D[choisir(TOUS)];
    const d = donneesSolide(solide);
    const plans = plansNommage(d);
    const p = choisirPlan(plans);
    const pool = plans.filter((x) => x !== p && plansParalleles(x, p) && !memePlan(x, p));
    if (pool.length === 0) continue;
    const q = choisirPlan(pool);
    const orientes: Oriente[] = [];
    for (const f of faitsSolide(d)) {
      if (dansPlanGeo(f.d1, p) && dansPlanGeo(f.d2, q)) orientes.push({ f, l: f.d1, m: f.d2, inverse: false });
      else if (dansPlanGeo(f.d2, p) && dansPlanGeo(f.d1, q)) orientes.push({ f, l: f.d2, m: f.d1, inverse: true });
    }
    if (orientes.length < 2) continue;
    const o1 = choisir(orientes);
    const secants = orientes.filter((o) => !droitesParalleles(o.l[0].position, o.l[1].position, o1.l[0].position, o1.l[1].position));
    if (secants.length === 0) continue;
    // De préférence deux droites de (P) sécantes en un point disponible (« sécantes en F »).
    const enUnPoint = secants.filter((o) => o.l.some((x) => o1.l.some((y) => y.cle === x.cle)));
    const o2 = enUnPoint.length > 0 && Math.random() < 0.75 ? choisir(enUnPoint) : choisir(secants);
    const milieuxUtiles = milieuxDe([...o1.l, ...o1.m, ...o2.l, ...o2.m]);

    // Noms des deux plans : tous les milieux des deux parallélismes attendus y figurent (au plus 3).
    const tp = trianglesNommage(d, p);
    const tq = trianglesNommage(d, q);
    if (tp.length === 0 || tq.length === 0) continue;
    let noms: [Triangle, Triangle] | null = null;
    for (let essai = 0; essai < 60 && !noms; essai++) {
      const a = tirerTriangle(tp);
      const b = tirerTriangle(tq);
      const mil = new Set(milieuxDe([...a, ...b]).map((x) => x.cle));
      if (mil.size > 3) continue;
      if (!milieuxUtiles.every((m) => mil.has(m.cle))) continue;
      noms = [a, b];
    }
    if (!noms) continue;
    const nommage = nommer(d, milieuxDe([...noms[0], ...noms[1]]));
    const { nomDe, nommes } = nommage;
    const nomsMilieux = new Set(nommage.milieux.map((m) => m.nom));
    const estNomme = (x: PointDispo) => !!x.sommet || nomsMilieux.has(nomDe(x) ?? "");
    const nomP = nomPlanTriangle(noms[0], nomDe, d);
    const nomQ = nomPlanTriangle(noms[1], nomDe, d);
    const P = `(${nomP.join("")})`;
    const Q = `(${nomQ.join("")})`;

    // Parallélismes valables justifiables, entre points nommés.
    const valables = orientes.filter((o) => [...o.l, ...o.m].every(estNomme));
    const lignes = droitesNommees(nommes, () => true);
    const lignesP = lignes.filter((l) => droiteDansPlan(l.a, l.b, p.trois));
    const lignesQ = lignes.filter((l) => droiteDansPlan(l.a, l.b, q.trois));
    const pos = (x: [PointDispo, PointDispo]) => [x[0].position, x[1].position] as [Point3D, Point3D];
    const justifiable = (l: DroiteNommee, m: DroiteNommee) => valables.some((o) => memesDroitesQueFait(o.f, [l.a, l.b], [m.a, m.b], memeDroite));
    const dir1 = pos(o1.l);
    const dir2 = pos(o2.l);
    const parallele = (a: [Point3D, Point3D], b: [Point3D, Point3D]) => droitesParalleles(a[0], a[1], b[0], b[1]);
    // Seuls sont proposés comme valables o1, o2 et, parfois, un « doublon » d'une de leurs deux
    // directions (piège des deux témoins parallèles) : jamais un parallélisme valable d'une troisième
    // direction (deux options quelconques suffiraient), ni un parallélisme valable non justifiable.
    const doublons = valables.filter((o) => o !== o1 && o !== o2 && (parallele(pos(o.l), dir1) || parallele(pos(o.l), dir2)) && !memeFait(o, o1) && !memeFait(o, o2));
    const doublon = avecDoublon && doublons.length > 0 ? choisir(doublons) : null;

    const vue = (pa: [Point3D, Point3D], pb: [Point3D, Point3D]) => ({ a: pa, b: pb });
    const choisis: { a: [Point3D, Point3D]; b: [Point3D, Point3D] }[] = [o1, o2, ...(doublon ? [doublon] : [])].map((o) => vue(pos(o.l), pos(o.m)));
    const dejaPris = (l: DroiteNommee, m: DroiteNommee) =>
      choisis.some((c) => (memeDroite(c.a[0], c.a[1], l.a, l.b) && memeDroite(c.b[0], c.b[1], m.a, m.b)) || (memeDroite(c.a[0], c.a[1], m.a, m.b) && memeDroite(c.b[0], c.b[1], l.a, l.b)));

    // Leurres.
    const horsP: CandidatBrut[] = [];
    const horsQ: CandidatBrut[] = [];
    const faux: CandidatBrut[] = [];
    for (const m of lignesQ) {
      for (const l of lignes) {
        if (droiteDansPlan(l.a, l.b, p.trois) || memeDroite(l.a, l.b, m.a, m.b) || !droitesParalleles(l.a, l.b, m.a, m.b)) continue;
        horsP.push({ gauche: l.noms, droite: m.noms, defaut: `${libelle(l.noms)} n'est pas une droite du plan ${P} : ${pointHors(nommes, l.noms, p.trois)} n'appartient pas à ce plan.` });
      }
    }
    for (const l of lignesP) {
      for (const m of lignes) {
        if (droiteDansPlan(m.a, m.b, q.trois) || memeDroite(l.a, l.b, m.a, m.b) || !droitesParalleles(l.a, l.b, m.a, m.b)) continue;
        horsQ.push({ gauche: l.noms, droite: m.noms, defaut: `${libelle(m.noms)} n'est pas une droite du plan ${Q} : ${pointHors(nommes, m.noms, q.trois)} n'appartient pas à ce plan.` });
      }
      for (const m of lignesQ) {
        if (droitesParalleles(l.a, l.b, m.a, m.b)) continue;
        faux.push({ gauche: l.noms, droite: m.noms, defaut: `${libelle(l.noms)} et ${libelle(m.noms)} ne sont pas parallèles : elles sont gauches (sans point commun, et dans aucun plan commun).`, ligneP: l });
      }
    }
    // Pas de parallélisme valable non justifiable ni de doublon parmi les leurres.
    const ok = (c: CandidatBrut) => {
      const l = lignes.find((x) => x.noms === c.gauche)!;
      const m = lignes.find((x) => x.noms === c.droite)!;
      return !dejaPris(l, m) && !(droiteDansPlan(l.a, l.b, p.trois) && droiteDansPlan(m.a, m.b, q.trois) && droitesParalleles(l.a, l.b, m.a, m.b) && !justifiable(l, m));
    };
    const fauxOk = faux.filter(ok);
    const horsOk = [...horsP, ...horsQ].filter(ok);
    if (fauxOk.length === 0) continue;
    // Un leurre « faux » réutilise, une fois sur deux, une droite témoin attendue avec une mauvaise
    // partenaire (les lettres communes ne trahissent donc pas la bonne paire).
    const memeTemoin = fauxOk.filter((c) => c.ligneP && (memeDroite(c.ligneP.a, c.ligneP.b, dir1[0], dir1[1]) || memeDroite(c.ligneP.a, c.ligneP.b, dir2[0], dir2[1])));
    const leurres: CandidatBrut[] = [];
    leurres.push(memeTemoin.length > 0 && Math.random() < 0.5 ? choisir(memeTemoin) : choisir(fauxOk));
    if (horsOk.length > 0) leurres.push(choisir(horsOk));
    const total = 5;
    const restants = melanger([...fauxOk, ...horsOk].filter((c) => !leurres.includes(c)));
    while (leurres.length + choisis.length < total && restants.length > 0) {
      const c = restants.shift()!;
      if (leurres.some((x) => memeCandidat(x, c, lignes))) continue;
      leurres.push(c);
    }
    if (leurres.length + choisis.length < 4) continue;

    const ctx: Contexte = { d, pos: (n) => nommes.find((x) => x.nom === n)!.position };
    const valablesCandidats: CandidatParallelisme[] = [o1, o2, ...(doublon ? [doublon] : [])].map((o) => {
      const raison = raisonDepuisFait(o.f, nomDe, o.inverse);
      return { gauche: raison.droite1, droite: raison.droite2, defaut: null, raison, justifications: justificationsPour(ctx, raison) };
    });
    const candidatsLeurres: CandidatParallelisme[] = leurres.map((c) => ({ gauche: c.gauche, droite: c.droite, defaut: c.defaut, raison: null, justifications: [] }));
    const tous = melanger([...valablesCandidats, ...candidatsLeurres]);
    const i1 = tous.indexOf(valablesCandidats[0]!);
    const i2 = tous.indexOf(valablesCandidats[1]!);
    return {
      variante: "deux-plans",
      solide,
      milieux: nommage.milieux,
      plans: [nomP, nomQ],
      criteres: criteresDeuxPlans(P, Q, nomP.join(""), nomQ.join("")),
      candidats: tous,
      paireAttendue: i1 < i2 ? [i1, i2] : [i2, i1],
    };
  }
  throw new Error("gen103 : aucune instance « deux-plans » trouvée");
}

interface CandidatBrut {
  gauche: DroiteNommee2;
  droite: DroiteNommee2;
  defaut: string;
  ligneP?: DroiteNommee;
}

function memeFait(a: Oriente, b: Oriente): boolean {
  return memeDroite(a.l[0].position, a.l[1].position, b.l[0].position, b.l[1].position) && memeDroite(a.m[0].position, a.m[1].position, b.m[0].position, b.m[1].position);
}

function memeCandidat(a: CandidatBrut, b: CandidatBrut, lignes: DroiteNommee[]): boolean {
  const g = (x: DroiteNommee2) => lignes.find((l) => l.noms === x)!;
  const [la, ma, lb, mb] = [g(a.gauche), g(a.droite), g(b.gauche), g(b.droite)];
  return memeDroite(la.a, la.b, lb.a, lb.b) && memeDroite(ma.a, ma.b, mb.a, mb.b);
}

// ================================================================================================
// Catalogue
// ================================================================================================

export const CATALOGUE_VARIANTES: { id: VarianteDemontrerParallelisme; label: string }[] = [
  { id: "droite-plan", label: "Droite parallèle à un plan" },
  { id: "deux-plans", label: "Deux plans parallèles" },
];

export function construireAvecVariante(id: string): ExerciceDemontrerParallelisme {
  return id === "deux-plans" ? genererDeuxPlans() : genererDroitePlan();
}

export function genererExerciceDemontrerParallelisme(): ExerciceDemontrerParallelisme {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
