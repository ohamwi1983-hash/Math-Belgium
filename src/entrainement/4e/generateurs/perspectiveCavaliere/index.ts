import type { Point3D } from "../../core/geometrieEspace.types";
import type {
  AreteCavaliere,
  CadreDessin,
  ExercicePerspectiveCavaliere,
  PointDessin,
  ReferenceSommet,
  SommetCavaliere,
  VariantePerspectiveCavaliere,
} from "../../core/perspectiveCavaliere.types";
import { produitScalaire3D, produitVectoriel3D, soustraire3D } from "../solide3D/geometrieEspace";

/**
 * Générateur de gen104 — « Dessiner en perspective cavalière » (4e, chapitre 8). Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre le MÊME exercice.
 *
 * Trois solides (variantes), dimensions réelles entières en cm, dessinés sur un quadrillage de 1 cm :
 * - pavé droit ABCDEFGH (cube une fois sur cinq) : face avant ABFE donnée ; l'élève place un
 *   premier sommet arrière, puis les trois autres ;
 * - prisme droit ABCDEF couché : face avant triangulaire ABC donnée (A et B en bas, C en haut) ;
 *   l'élève place un premier sommet arrière, puis les deux autres ;
 * - pyramide ABCDS à base rectangulaire, sommet S à la verticale du centre de la base : seule
 *   l'arête avant [AB] est donnée ; l'élève place C ou D (fuyante), l'autre est complété, puis S.
 * Écran 3 (toujours) : classer les arêtes en visibles / cachées.
 *
 * Convention (kicker de la section `cavaliere`) : fuyantes à 45°, réduites de moitié. Une fuyante de
 * profondeur réelle p se dessine donc avec un décalage de p·√2/4 en x et en y — jamais un nombre
 * entier de carreaux : les sommets arrière ne tombent PAS sur les nœuds du quadrillage (on ne triche
 * pas avec « un carreau en diagonale », qui ferait un coefficient de 0,71). Placement libre, avec
 * une tolérance et un aimant (`moteur/verificationPerspectiveCavaliere.ts`).
 *
 * Visibilité : une face est vue si sa normale extérieure fait un angle aigu avec la direction de
 * projection (√2/4 ; −1 ; √2/4) orientée vers l'observateur ; une arête est cachée si toutes ses
 * faces le sont. Ce que l'élève DÉCIDE à l'écran 3 — notamment, pour le prisme et la pyramide, si la
 * face de gauche est vue (une seule arête cachée) ou non (trois arêtes cachées autour de D) — est
 * tiré AVANT la boucle de rejet (moitié-moitié), jamais déduit des dimensions tirées. Les dimensions
 * gardent une marge (au moins 1 cm) avec les cas limites où une face serait vue « par la tranche ».
 */

const K = Math.SQRT2 / 4;
const DIRECTION_OBSERVATEUR: Point3D = { x: K, y: -1, z: K };

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export function dessinDe(p: Point3D): PointDessin {
  return { x: p.x + p.y * K, y: p.z + p.y * K };
}

/** Plus petit écart (cm) entre deux sommets sur le dessin : au moins 1 cm, pour que les sommets et
 * leurs étiquettes restent distincts (un solide petit et très profond rapprochait D de F). */
function ecartMin(espace: Record<string, Point3D>): number {
  const ps = Object.values(espace).map(dessinDe);
  let min = Infinity;
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) min = Math.min(min, Math.hypot(ps[i]!.x - ps[j]!.x, ps[i]!.y - ps[j]!.y));
  return min;
}

function centroide(points: Point3D[]): Point3D {
  const n = points.length;
  return {
    x: points.reduce((s, p) => s + p.x, 0) / n,
    y: points.reduce((s, p) => s + p.y, 0) / n,
    z: points.reduce((s, p) => s + p.z, 0) / n,
  };
}

/** Face vue par l'observateur (normale extérieure, orientée par le centre du solide). */
function faceVue(sommets: Record<string, Point3D>, face: string[]): boolean {
  const [p0, p1, p2] = face.map((n) => sommets[n]!) as [Point3D, Point3D, Point3D];
  let normale = produitVectoriel3D(soustraire3D(p1, p0), soustraire3D(p2, p0));
  const versExterieur = soustraire3D(centroide(face.map((n) => sommets[n]!)), centroide(Object.values(sommets)));
  if (produitScalaire3D(normale, versExterieur) < 0) normale = { x: -normale.x, y: -normale.y, z: -normale.z };
  return produitScalaire3D(normale, DIRECTION_OBSERVATEUR) > 1e-9;
}

function aretesDepuisFaces(sommets: Record<string, Point3D>, faces: string[][]): AreteCavaliere[] {
  const parCle = new Map<string, AreteCavaliere>();
  for (const face of faces) {
    const vue = faceVue(sommets, face);
    face.forEach((n, i) => {
      const [a, b] = [n, face[(i + 1) % face.length]!].sort() as [string, string];
      const cle = `${a}-${b}`;
      const existante = parCle.get(cle);
      if (existante) existante.cachee = existante.cachee && !vue;
      else parCle.set(cle, { cle, a, b, cachee: !vue });
    });
  }
  return [...parCle.values()].sort((u, v) => u.cle.localeCompare(v.cle));
}

interface Description {
  espace: Record<string, Point3D>;
  faces: string[][];
  donnes: string[];
  references: Record<string, ReferenceSommet>;
  premier: string;
  suivants: string[];
  completes: string[];
  gaucheVue: boolean;
}

function cadres(sommets: SommetCavaliere[], fuyante: PointDessin): { cadreEcran: CadreDessin; cadrePapier: CadreDessin } {
  const dessins = sommets.map((s) => s.dessin);
  // Papier : le solide, un carreau de marge, et 3 cm à droite de B (mesure de la fuyante du corrigé).
  // Écran : place pour une fuyante NON réduite (piège reconnu), et pour un mauvais sens (à gauche, en bas).
  const pieges = sommets.flatMap((s) => {
    if (s.reference?.type !== "fuyante") return [];
    const o = sommets.find((t) => t.nom === (s.reference as { depuis: string }).depuis)!.dessin;
    return [{ x: o.x + 2 * fuyante.x, y: o.y + 2 * fuyante.y }];
  });
  const maxX = (ps: PointDessin[]) => Math.max(...ps.map((p) => p.x));
  const maxY = (ps: PointDessin[]) => Math.max(...ps.map((p) => p.y));
  return {
    cadreEcran: { xMin: -1, yMin: -1, xMax: Math.ceil(maxX([...dessins, ...pieges]) + 0.5), yMax: Math.ceil(maxY([...dessins, ...pieges]) + 0.5) },
    cadrePapier: { xMin: -1, yMin: -1, xMax: Math.max(Math.ceil(maxX(dessins) + 0.3) + 1, Math.ceil(sommets.find((s) => s.nom === "B")!.dessin.x) + 3), yMax: Math.ceil(maxY(dessins) + 0.3) + 1 },
  };
}

function assembler(
  variante: VariantePerspectiveCavaliere,
  dims: { longueur: number; hauteur: number; profondeur: number; cube: boolean; abscisseSommet: number | null },
  d: Description,
): ExercicePerspectiveCavaliere {
  const sommets: SommetCavaliere[] = Object.entries(d.espace).map(([nom, espace]) => ({
    nom,
    espace,
    dessin: dessinDe(espace),
    donne: d.donnes.includes(nom),
    reference: d.references[nom] ?? null,
  }));
  const fuyante = { x: dims.profondeur * K, y: dims.profondeur * K };
  const pyramide = variante === "pyramide";
  const base = ["A", "B", "C", "D"].map((n) => sommets.find((s) => s.nom === n)!.dessin);
  const centreBase = pyramide ? { x: (base[0]!.x + base[2]!.x) / 2, y: (base[0]!.y + base[2]!.y) / 2 } : null;
  return {
    variante,
    ...dims,
    sommets,
    aretes: aretesDepuisFaces(d.espace, d.faces),
    gaucheVue: d.gaucheVue,
    premier: d.premier,
    suivants: d.suivants,
    completes: d.completes,
    fuyante,
    centreBase,
    ...cadres(sommets, fuyante),
  };
}

function genererPave(): ExercicePerspectiveCavaliere {
  const cube = Math.random() < 0.2;
  let L: number;
  let H: number;
  let P: number;
  let espace: Record<string, Point3D>;
  do {
    if (cube) {
      L = H = P = entier(3, 5);
    } else {
      do {
        L = entier(3, 7);
        H = entier(2, 5);
        P = entier(2, 6);
      } while (L === H && H === P);
    }
    espace = {
      A: { x: 0, y: 0, z: 0 },
      B: { x: L, y: 0, z: 0 },
      C: { x: L, y: P, z: 0 },
      D: { x: 0, y: P, z: 0 },
      E: { x: 0, y: 0, z: H },
      F: { x: L, y: 0, z: H },
      G: { x: L, y: P, z: H },
      H: { x: 0, y: P, z: H },
    };
  } while (ecartMin(espace) < 1);
  const arriere = ["C", "D", "G", "H"];
  const premier = choisir(arriere);
  return assembler(
    "pave",
    { longueur: L, hauteur: H, profondeur: P, cube, abscisseSommet: null },
    {
      espace,
      faces: [
        ["A", "B", "C", "D"],
        ["E", "F", "G", "H"],
        ["A", "B", "F", "E"],
        ["D", "C", "G", "H"],
        ["A", "D", "H", "E"],
        ["B", "C", "G", "F"],
      ],
      donnes: ["A", "B", "F", "E"],
      references: { C: { type: "fuyante", depuis: "B" }, D: { type: "fuyante", depuis: "A" }, G: { type: "fuyante", depuis: "F" }, H: { type: "fuyante", depuis: "E" } },
      premier,
      suivants: arriere.filter((n) => n !== premier),
      completes: [],
      gaucheVue: false,
    },
  );
}

function genererPrisme(): ExercicePerspectiveCavaliere {
  // Face de gauche (CA) vue ou non : ce que l'élève décide à l'écran 3, tiré avant la boucle.
  const gaucheVue = Math.random() < 0.5;
  let L: number;
  let H: number;
  let c: number;
  let P: number;
  let espace: Record<string, Point3D>;
  do {
    L = entier(3, 7);
    H = entier(2, 5);
    c = entier(0, L);
    P = entier(2, 6);
    espace = {
      A: { x: 0, y: 0, z: 0 },
      B: { x: L, y: 0, z: 0 },
      C: { x: c, y: 0, z: H },
      D: { x: 0, y: P, z: 0 },
      E: { x: L, y: P, z: 0 },
      F: { x: c, y: P, z: H },
    };
  } while ((gaucheVue ? c < H + 1 : c > H - 1) || ecartMin(espace) < 1);
  const arriere = ["D", "E", "F"];
  const premier = choisir(arriere);
  return assembler(
    "prisme",
    { longueur: L, hauteur: H, profondeur: P, cube: false, abscisseSommet: c },
    {
      espace,
      faces: [
        ["A", "B", "C"],
        ["D", "E", "F"],
        ["A", "B", "E", "D"],
        ["B", "C", "F", "E"],
        ["C", "A", "D", "F"],
      ],
      donnes: ["A", "B", "C"],
      references: { D: { type: "fuyante", depuis: "A" }, E: { type: "fuyante", depuis: "B" }, F: { type: "fuyante", depuis: "C" } },
      premier,
      suivants: arriere.filter((n) => n !== premier),
      completes: [],
      gaucheVue,
    },
  );
}

function genererPyramide(): ExercicePerspectiveCavaliere {
  // Face de gauche (DAS) vue (pyramide basse : h < L/2) ou non : décidé à l'écran 3, tiré avant.
  const gaucheVue = Math.random() < 0.5;
  let L: number;
  let H: number;
  let P: number;
  let espace: Record<string, Point3D>;
  do {
    L = entier(4, 8);
    P = entier(2, 6);
    H = entier(2, 6);
    espace = {
      A: { x: 0, y: 0, z: 0 },
      B: { x: L, y: 0, z: 0 },
      C: { x: L, y: P, z: 0 },
      D: { x: 0, y: P, z: 0 },
      S: { x: L / 2, y: P / 2, z: H },
    };
    // Face arrière toujours cachée, avec de la marge (h > p/4 + 1) ; face de gauche loin du cas limite.
  } while (H < P / 4 + 1 || (gaucheVue ? H > L / 2 - 1 : H < L / 2 + 1) || ecartMin(espace) < 1);
  const premier = choisir(["C", "D"]);
  return assembler(
    "pyramide",
    { longueur: L, hauteur: H, profondeur: P, cube: false, abscisseSommet: null },
    {
      espace,
      faces: [
        ["A", "B", "C", "D"],
        ["A", "B", "S"],
        ["B", "C", "S"],
        ["C", "D", "S"],
        ["D", "A", "S"],
      ],
      donnes: ["A", "B"],
      references: { C: { type: "fuyante", depuis: "B" }, D: { type: "fuyante", depuis: "A" }, S: { type: "hauteur" } },
      premier,
      suivants: ["S"],
      completes: [premier === "C" ? "D" : "C"],
      gaucheVue,
    },
  );
}

const GENERATEURS: Record<VariantePerspectiveCavaliere, () => ExercicePerspectiveCavaliere> = {
  pave: genererPave,
  prisme: genererPrisme,
  pyramide: genererPyramide,
};

export const CATALOGUE_VARIANTES: { id: VariantePerspectiveCavaliere; label: string }[] = [
  { id: "pave", label: "Pavé droit (ou cube)" },
  { id: "prisme", label: "Prisme droit à base triangulaire" },
  { id: "pyramide", label: "Pyramide à base rectangulaire" },
];

export function construireAvecVariante(id: string): ExercicePerspectiveCavaliere {
  const variante = CATALOGUE_VARIANTES.find((v) => v.id === id)?.id ?? "pave";
  return GENERATEURS[variante]();
}

export function genererExercicePerspectiveCavaliere(): ExercicePerspectiveCavaliere {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
