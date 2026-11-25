import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  CasTroisPointsAlignes,
  DroiteNommee2,
  ExerciceTroisPointsAlignes,
  OptionDemonstration,
  PointAreteNomme,
  PointIntersectionNomme,
} from "../../core/demontrerParallelisme.types";
import { cadreAlignes } from "../../ui/figureTroisPointsAlignes";

/**
 * Variante « trois points alignés » de gen103 (manuel, ex. 11 « Démontrer ») — ajoutée EN FIN de
 * catalogue : les `?code=` des deux variantes historiques ne changent pas.
 *
 * Solide : une « pyramide SABC » de base ABC (`pyramideSABC`, faces au format du socle `Solide3D`),
 * dessinée comme la figure du manuel (seule l'arête [AC] est cachée).
 * M, N, P sur les arêtes [SA], [SB], [SC] : SM = a·SA, SN = b·SB, SP = c·SC, a, b, c tirés dans
 * [0,2 ; 0,8] (jamais montrés). Dans le plan (SAB), (MN) coupe (AB) au point A + λ(B − A) avec
 * λ = b(1 − a)/(b − a) (et de même sur les deux autres faces) : le point existe dès que a ≠ b.
 *
 * Ordre du tirage : le CAS (général / toit, une fois sur trois) puis, dans le cas toit, le côté
 * parallèle (un des trois, à parts égales) sont tirés EN PREMIER, avant la boucle de rejet. Le cas
 * toit n'est pas un verdict : l'énoncé dit quel côté de MNP est parallèle à la base (profil : cas
 * particulier, voir `profil.ts`).
 *
 * Rejet : rapports écartés d'au moins 0,12 (0,15 pour le côté non parallèle du cas toit : aucun côté
 * « presque parallèle » qui enverrait un point hors du cadre), cadre de la figure au plus 1,75 fois
 * celui du solide, points construits à 40 px au moins l'un de l'autre et à 22 px au moins des
 * sommets et de M, N, P (étiquettes lisibles).
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

/** Pyramide SABC dessinée comme la figure du manuel : A à gauche, B devant, C à droite au fond, S
 * au-dessus du centre de la base ; seule l'arête [AC] est cachée. Le tétraèdre du socle
 * (`GABARITS_SOLIDE3D.tetraedre`) n'a pas été repris : en perspective cavalière, ses arêtes [DB] et
 * [DC] se dessinent presque l'une sur l'autre, et N, P s'y confondaient (relu sur planche). Faces
 * au format du socle : visibilité des arêtes et rendu inchangés. */
export function pyramideSABC(): Solide3D {
  return {
    id: "pyramideSABC",
    label: "Pyramide SABC",
    sommets: {
      A: { x: 0, y: 2, z: 0 },
      B: { x: 3, y: 0, z: 0 },
      C: { x: 6, y: 3, z: 0 },
      S: { x: 3, y: 1.7, z: 5 },
    },
    faces: [
      ["A", "B", "C"],
      ["A", "B", "S"],
      ["B", "C", "S"],
      ["C", "A", "S"],
    ],
  };
}

/** Les trois côtés : côté de MNP, côté de la base, nom du point d'intersection. */
const COTES: { haut: DroiteNommee2; base: DroiteNommee2; nom: string }[] = [
  { haut: ["M", "N"], base: ["A", "B"], nom: "I" },
  { haut: ["N", "P"], base: ["B", "C"], nom: "J" },
  { haut: ["M", "P"], base: ["A", "C"], nom: "K" },
];

const lerp = (p: Point3D, q: Point3D, t: number): Point3D => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t });

const RAPPORT_MIN = 0.2;
const RAPPORT_MAX = 0.8;
const ECART_MIN = 0.12;
const ECART_MIN_TOIT = 0.15;
const CADRE_MAX = 1.75;
const ECART_PX_POINTS = 40;
const ECART_PX_ETIQUETTES = 22;

function rapport(): number {
  return RAPPORT_MIN + Math.random() * (RAPPORT_MAX - RAPPORT_MIN);
}

function etendue(points: Point3D[]): { l: number; h: number } {
  const k = 0.5 * Math.SQRT1_2;
  const xs = points.map((p) => p.x + p.y * k);
  const ys = points.map((p) => p.z + p.y * k);
  return { l: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

interface Geometrie {
  solide: Solide3D;
  points: [PointAreteNomme, PointAreteNomme, PointAreteNomme];
  construits: PointIntersectionNomme[];
}

/** Géométrie de l'instance, ou `null` si elle est rejetée (cadre, écarts). `parallele` : indice du
 * côté parallèle (cas toit), sinon `null`. */
function geometrie(solide: Solide3D, r: Record<string, number>, parallele: number | null): Geometrie | null {
  const S = solide.sommets.S!;
  const pt = (nom: string, sommet: string): PointAreteNomme => ({ nom, position: lerp(S, solide.sommets[sommet]!, r[sommet]!), arete: ["S", sommet] });
  const points: [PointAreteNomme, PointAreteNomme, PointAreteNomme] = [pt("M", "A"), pt("N", "B"), pt("P", "C")];
  const construits: PointIntersectionNomme[] = [];
  COTES.forEach((c, i) => {
    if (i === parallele) return;
    const [x, y] = c.base;
    const a = r[x]!;
    const b = r[y]!;
    const lambda = (b * (1 - a)) / (b - a);
    construits.push({ nom: c.nom, droiteHaut: c.haut, droiteBase: c.base, position: lerp(solide.sommets[x]!, solide.sommets[y]!, lambda) });
  });
  const base = etendue(Object.values(solide.sommets));
  const tout = etendue([...Object.values(solide.sommets), ...construits.map((x) => x.position)]);
  if (Math.max(tout.l / base.l, tout.h / base.h) > CADRE_MAX) return null;
  const cadre = cadreAlignes(solide, construits.map((x) => x.position));
  const px = construits.map((x) => cadre.pixel(x.position));
  for (let i = 0; i < px.length; i++)
    for (let j = i + 1; j < px.length; j++) if (Math.hypot(px[i]!.x - px[j]!.x, px[i]!.y - px[j]!.y) < ECART_PX_POINTS) return null;
  const reperes = [...Object.values(solide.sommets), ...points.map((p) => p.position)].map(cadre.pixel);
  for (const q of px) for (const s of reperes) if (Math.hypot(q.x - s.x, q.y - s.y) < ECART_PX_ETIQUETTES) return null;
  return { solide, points, construits };
}

// --- Options des écrans ---------------------------------------------------------------------------

const d = (x: DroiteNommee2) => `(${x[0]}${x[1]})`;

/** « I, J et K » / « I et J ». */
function listeNoms(noms: string[]): string {
  return noms.length <= 1 ? noms.join("") : `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

function nomDroiteFinale(construits: PointIntersectionNomme[]): string {
  return `(${construits.map((x) => x.nom).join("")})`;
}

function optionsMethode(cas: CasTroisPointsAlignes, construits: PointIntersectionNomme[], paralleles: [DroiteNommee2, DroiteNommee2] | null): OptionDemonstration[] {
  const noms = listeNoms(construits.map((x) => x.nom));
  if (cas === "general") {
    const valable: OptionDemonstration = {
      texte: `Montrer que ${noms} sont trois points communs à deux plans sécants : ils sont alors sur la droite d'intersection de ces deux plans.`,
      valide: true,
      defaut: "",
    };
    const leurres: OptionDemonstration[] = [
      {
        texte: `Montrer que ${noms} appartiennent tous les trois à un même plan.`,
        valide: false,
        defaut: "Trois points d'un même plan ne sont pas forcément alignés : un plan contient des triangles. Il faut deux plans sécants, dont la droite commune porte les trois points.",
      },
      {
        texte: `Montrer que ${noms} sont sur les droites (AB), (BC) et (AC), les trois côtés du triangle ABC.`,
        valide: false,
        defaut: "Trois points pris sur les trois côtés (prolongés) d'un triangle ne sont pas forcément alignés : cela les place seulement dans le plan (ABC).",
      },
      {
        texte: `Vérifier à la règle, sur la figure, que ${noms} sont alignés.`,
        valide: false,
        defaut: "Une vérification sur le dessin n'est jamais une preuve : une figure en perspective peut tromper.",
      },
      {
        texte: "Montrer que les plans (MNP) et (ABC) sont parallèles.",
        valide: false,
        defaut: "Ces plans ne sont pas parallèles : I est un point commun. Et deux plans parallèles n'ont aucun point commun : ils ne pourraient pas porter tous les deux I, J et K.",
      },
    ];
    return melanger([valable, ...melanger(leurres).slice(0, 3)]);
  }
  const [h, b] = paralleles!;
  const D = nomDroiteFinale(construits);
  const valable: OptionDemonstration = {
    texte: `Montrer que ${D} est la droite d'intersection des plans (MNP) et (ABC), puis utiliser le théorème du toit avec ${d(h)} ∥ ${d(b)}.`,
    valide: true,
    defaut: "",
  };
  const leurres: OptionDemonstration[] = [
    {
      texte: "Utiliser la droite des milieux dans le triangle ABC.",
      valide: false,
      defaut: `${noms} ne sont pas les milieux de deux côtés du triangle ABC : ces points sont même en dehors du triangle.`,
    },
    {
      texte: `Montrer que ${D} est parallèle au plan (MNP).`,
      valide: false,
      defaut: `${D} est une droite du plan (MNP), pas une droite parallèle à ce plan ; et une droite parallèle à un plan n'est pas parallèle à toutes les droites de ce plan.`,
    },
    {
      texte: `Vérifier sur la figure que ${D} et ${d(b)} ne se coupent pas.`,
      valide: false,
      defaut: "Une impression sur le dessin n'est jamais une preuve, et la figure est limitée : deux droites peuvent se couper en dehors du cadre.",
    },
    {
      texte: `Montrer que ${D} et ${d(b)} sont deux droites d'un même plan, le plan (ABC).`,
      valide: false,
      defaut: "Deux droites d'un même plan sont parallèles ou sécantes : être dans un même plan ne suffit pas.",
    },
  ];
  return melanger([valable, ...melanger(leurres).slice(0, 3)]);
}

function optionsCommuns(construits: PointIntersectionNomme[]): OptionDemonstration[] {
  const noms = listeNoms(construits.map((x) => x.nom));
  const hauts = construits.map((x) => x.droiteHaut);
  const bases = construits.map((x) => x.droiteBase);
  const valable: OptionDemonstration = {
    texte: `${surDroitesTexte(construits, hauts, bases)} ; or ${listeNoms(hauts.map(d))} sont des droites du plan (MNP), et ${listeNoms(bases.map(d))} des droites du plan (ABC).`,
    valide: true,
    defaut: "",
  };
  // Mauvaise lecture : les côtés de MNP décalés d'un cran (I sur (NP) au lieu de (MN)…).
  const decales = hauts.map((_, i) => hauts[(i + 1) % hauts.length]!);
  const leurres: OptionDemonstration[] = [
    {
      texte: `${noms} sont sur les droites ${listeNoms(bases.map(d))}, donc dans le plan (ABC).`,
      valide: false,
      defaut: `C'est vrai, mais ce n'est que la moitié : il faut aussi montrer que ${noms} sont dans le plan (MNP), parce qu'ils sont sur ${listeNoms(hauts.map(d))}.`,
    },
    {
      texte: `${noms} sont sur les côtés du triangle ABC et sur les côtés du triangle MNP.`,
      valide: false,
      defaut: `${noms} sont sur les côtés prolongés, en dehors des deux triangles : ce sont les plans, illimités, qui les contiennent, parce qu'ils contiennent les droites ${listeNoms(hauts.map(d))} et ${listeNoms(bases.map(d))}.`,
    },
    {
      texte: `${listeNoms(construits.map((x) => `${x.nom} est dans le plan (S${x.droiteBase.join("")})`))}.`,
      valide: false,
      defaut: "C'est vrai, mais ce sont les plans des faces latérales, ni (MNP) ni (ABC) : cela ne montre pas que les points sont communs à ces deux plans.",
    },
    {
      texte: `${surDroitesTexte(construits, decales, bases)} ; or ${listeNoms(hauts.map(d))} sont des droites du plan (MNP), et ${listeNoms(bases.map(d))} des droites du plan (ABC).`,
      valide: false,
      defaut: `Ce ne sont pas les bonnes droites : relis l'énoncé, ${listeNoms(construits.map((x) => `${x.nom} est sur ${d(x.droiteHaut)}`))}.`,
    },
  ];
  return melanger([valable, ...melanger(leurres).slice(0, 3)]);
}

/** « I est sur (MN) et sur (AB), J sur (NP) et sur (BC), K sur (MP) et sur (AC) ». */
function surDroitesTexte(construits: PointIntersectionNomme[], hauts: DroiteNommee2[], bases: DroiteNommee2[]): string {
  const morceaux = construits.map((x, i) => (i === 0 ? `${x.nom} est sur ${d(hauts[i]!)} et sur ${d(bases[i]!)}` : `${x.nom} sur ${d(hauts[i]!)} et sur ${d(bases[i]!)}`));
  return morceaux.join(", ");
}

function optionsConclusion(cas: CasTroisPointsAlignes, construits: PointIntersectionNomme[], paralleles: [DroiteNommee2, DroiteNommee2] | null): OptionDemonstration[] {
  const noms = listeNoms(construits.map((x) => x.nom));
  if (cas === "general") {
    const valable: OptionDemonstration = {
      texte: `Ils sont distincts (M n'est pas dans le plan (ABC)) et ont des points communs : ils sont sécants suivant une droite, qui contient ${noms}. Les points ${noms} sont donc alignés.`,
      valide: true,
      defaut: "",
    };
    const leurres: OptionDemonstration[] = [
      {
        texte: `Ils ont trois points communs, ${noms} : ils sont donc confondus.`,
        valide: false,
        defaut: "M n'est pas dans le plan (ABC) : les deux plans sont distincts. Trois points communs ne rendent deux plans confondus que s'ils ne sont pas alignés.",
      },
      {
        texte: "Ils sont parallèles, car les triangles MNP et ABC n'ont aucun point commun.",
        valide: false,
        defaut: "Un plan est illimité : les triangles ne se touchent pas, mais les plans se coupent, puisque I est un point commun.",
      },
      {
        texte: `Ils sont sécants ; ${noms} sont dans le plan (MNP), donc ils sont alignés.`,
        valide: false,
        defaut: "Être dans un même plan ne suffit pas pour être alignés : c'est parce que les points sont dans les deux plans à la fois qu'ils sont sur leur droite commune.",
      },
      {
        texte: `Ils sont sécants en un seul point : ${noms} sont donc confondus.`,
        valide: false,
        defaut: "Deux plans sécants ont toute une droite en commun, jamais un seul point (cours, § 5).",
      },
    ];
    return melanger([valable, ...melanger(leurres).slice(0, 3)]);
  }
  const [h, b] = paralleles!;
  const D = nomDroiteFinale(construits);
  const valable: OptionDemonstration = {
    texte: `Les plans sécants (MNP) et (ABC) contiennent les droites parallèles ${d(h)} et ${d(b)} : leur droite d'intersection ${D} est parallèle à ${d(b)} (théorème du toit).`,
    valide: true,
    defaut: "",
  };
  const leurres: OptionDemonstration[] = [
    {
      texte: `${D} et ${d(b)} sont deux droites du plan (ABC), donc elles sont parallèles.`,
      valide: false,
      defaut: "Deux droites d'un même plan peuvent être sécantes : être dans un même plan ne suffit pas.",
    },
    {
      texte: `${D} et ${d(h)} sont deux droites du plan (MNP), et ${d(h)} ∥ ${d(b)}, donc ${D} ∥ ${d(b)}.`,
      valide: false,
      defaut: `${D} et ${d(h)} sont dans un même plan, mais elles pourraient être sécantes : c'est le théorème du toit qui donne la direction de la droite d'intersection.`,
    },
    {
      texte: `${D} et ${d(b)} n'ont aucun point commun sur la figure, donc elles sont parallèles.`,
      valide: false,
      defaut: "Une impression sur le dessin n'est jamais une preuve : deux droites peuvent se couper en dehors du cadre.",
    },
    {
      texte: `Les plans (MNP) et (ABC) sont parallèles, donc ${D} ∥ ${d(b)}.`,
      valide: false,
      defaut: `Les plans (MNP) et (ABC) ne sont pas parallèles : ${noms} sont des points communs.`,
    },
  ];
  return melanger([valable, ...melanger(leurres).slice(0, 3)]);
}

// --- Générateur ------------------------------------------------------------------------------------

export function genererAlignes(): ExerciceTroisPointsAlignes {
  const cas: CasTroisPointsAlignes = Math.random() < 1 / 3 ? "toit" : "general";
  const parallele = cas === "toit" ? choisir([0, 1, 2]) : null;
  const solide = pyramideSABC();
  for (let tentative = 0; tentative < 5000; tentative++) {
    const r: Record<string, number> = { A: rapport(), B: rapport(), C: rapport() };
    if (parallele !== null) {
      const [x, y] = COTES[parallele]!.base;
      r[y] = r[x]!;
      const autre = ["A", "B", "C"].find((s) => s !== x && s !== y)!;
      if (Math.abs(r[autre]! - r[x]!) < ECART_MIN_TOIT) continue;
    } else if (Math.abs(r.A! - r.B!) < ECART_MIN || Math.abs(r.B! - r.C!) < ECART_MIN || Math.abs(r.A! - r.C!) < ECART_MIN) continue;
    const g = geometrie(solide, r, parallele);
    if (!g) continue;
    const paralleles: [DroiteNommee2, DroiteNommee2] | null = parallele === null ? null : [COTES[parallele]!.haut, COTES[parallele]!.base];
    return {
      variante: "alignes",
      solide,
      cas,
      points: g.points,
      paralleles,
      construits: g.construits,
      methodes: optionsMethode(cas, g.construits, paralleles),
      communs: optionsCommuns(g.construits),
      conclusions: optionsConclusion(cas, g.construits, paralleles),
    };
  }
  throw new Error(`gen103 : aucune instance « alignes » (${cas}) trouvée`);
}
