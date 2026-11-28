import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import type { Point3D } from "../core/geometrieEspace.types";
import { distance3D, EPSILON_3D, normalePlan, normeCarree3D, pointAppartientAuPlan, produitScalaire3D, produitVectoriel3D, soustraire3D } from "../moteur/geometrieEspace";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 8 de 4e (« Géométrie dans
 * l'espace »), moitié 1 (gen39, gen40, gen41, gen100, gen101, gen102) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ». Sans
 * `docx` (importées par les applis ET les adaptateurs).
 *
 * Ce chapitre n'a aucun calcul numérique : une étape de raisonnement a pour « Calcul » la suite des
 * propriétés appliquées, UNE par ligne, chacune avec sa relation (∈, ∉, ∥, ⊂, ∩, =) et la propriété
 * nommée à droite (« sommet de la face ABFE », « ABGH est un rectangle », « droite des milieux »,
 * « intersection de deux plans »…). Les raisons sont DÉDUITES de la géométrie de l'instance (faces,
 * milieux, parallélogrammes), jamais écrites en dur. Notations du cours : droite (AB), plan (ABC),
 * segment [AB], ∥, ∩ ; noms construits I₁, A′ écrits I_1, A' en KaTeX.
 */

type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `content/chapters/4e/geometrie-dans-espace.ts`). */
export const COURS_PLAN = "(cours, point 2)";
export const COURS_DEUX_DROITES = "(cours, point 3)";
export const COURS_DROITE_PLAN = "(cours, point 4)";
export const COURS_DEUX_PLANS = "(cours, point 5)";
export const COURS_TROIS_PLANS = "(cours, point 6)";
export const COURS_PARALLELISME = "(cours, point 7)";
export const COURS_PERCEE = "(cours, point 8)";
export const COURS_SECTION = "(cours, point 9)";
export const COURS_OMBRE = "(cours, point 12)";

// --- Notations ---------------------------------------------------------------------------------

const INDICES: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

/** Nom de point en KaTeX : « I₁ » → « I_1 », « A′ » → « A' », « α » → « \alpha ». */
export function nomTex(nom: string): string {
  let r = nom.replace(/′/g, "'").replace(/α/g, "\\alpha ").replace(/π/g, "\\pi ");
  r = r.replace(/([₀-₉]+)/g, (m) => `_{${[...m].map((c) => INDICES[c]).join("")}}`);
  return r.trim();
}

/** Droite « (AB) ». */
export function droiteTex(a: string, b: string): string {
  return `(${nomTex(a)}${nomTex(b)})`;
}

/** Plan « (ABC) » (ou « (ABFE) » pour une face). */
export function planTex(noms: readonly string[]): string {
  return `(${noms.map(nomTex).join("")})`;
}

/** Segment « [AB] ». */
export function segmentTex(a: string, b: string): string {
  return `[${nomTex(a)}${nomTex(b)}]`;
}

/** Liste « A, B et C » (texte). */
export function listeEt(noms: readonly string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

/** Fragments d'une phrase où chaque `$…$` est une formule KaTeX — groupée `{…}` (insécable) : sinon
 * « b = (DM) » pouvait passer à la ligne après « = » en fin de ligne dans un texte rédigé. */
export function phrase(s: string): Fragments {
  const out: Fragments = [];
  s.split(/(\$[^$]+\$)/).forEach((m) => {
    if (m === "") return;
    if (m.startsWith("$") && m.endsWith("$")) out.push(latex(`{${m.slice(1, -1)}}`));
    else out.push(texte(m));
  });
  return out;
}

// --- Figure : sommets, faces, points définis ---------------------------------------------------

export interface PointDefini {
  nom: string;
  position: Point3D;
  /** Milieu d'un segment (arête ou diagonale). */
  milieuDe?: [string, string];
  /** Centre d'une face (noms de ses sommets, dans l'ordre). */
  centreDe?: string[];
  /** Point d'un segment (tiers…). */
  surSegment?: [string, string];
}

export interface FigureEspace {
  sommets: Record<string, Point3D>;
  faces: string[][];
  points: PointDefini[];
}

export function position(f: FigureEspace, nom: string): Point3D {
  const p = f.sommets[nom] ?? f.points.find((x) => x.nom === nom)?.position;
  if (!p) throw new Error(`corrigeEspace1 : point inconnu ${nom}`);
  return p;
}

function plan3(f: FigureEspace, plan: readonly string[]): [Point3D, Point3D, Point3D] {
  return [position(f, plan[0]!), position(f, plan[1]!), position(f, plan[2]!)];
}

export function dansPlan(f: FigureEspace, nom: string, plan: readonly string[]): boolean {
  return pointAppartientAuPlan(position(f, nom), plan3(f, plan));
}

export function memesPoints(f: FigureEspace, a: string, b: string): boolean {
  return distance3D(position(f, a), position(f, b)) < EPSILON_3D;
}

/** Les points a, b, c sont alignés. */
export function alignes(f: FigureEspace, a: string, b: string, c: string): boolean {
  const u = soustraire3D(position(f, b), position(f, a));
  const v = soustraire3D(position(f, c), position(f, a));
  return normeCarree3D(produitVectoriel3D(u, v)) < EPSILON_3D;
}

function direction(f: FigureEspace, d: readonly [string, string]): Point3D {
  return soustraire3D(position(f, d[1]), position(f, d[0]));
}

/** Deux droites de même direction (parallèles ou confondues). */
export function memeDirection(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): boolean {
  return normeCarree3D(produitVectoriel3D(direction(f, a), direction(f, b))) < EPSILON_3D;
}

export function memeDroite(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): boolean {
  return memeDirection(f, a, b) && (memesPoints(f, a[0], b[0]) || alignes(f, a[0], a[1], b[0]));
}

/** Plan de la face `face` égal au plan `plan` (3 points). */
function facePortePlan(f: FigureEspace, face: readonly string[], plan: readonly string[]): boolean {
  return face.every((n) => dansPlan(f, n, plan));
}

/** Face du solide dont le PLAN est `plan`, ou `null`. */
export function faceDuPlan(f: FigureEspace, plan: readonly string[]): string[] | null {
  return f.faces.find((face) => face.length >= 3 && facePortePlan(f, face, plan)) ?? null;
}

/** Face du solide qui contient tous ces points (dans son plan), ou `null`. */
export function faceContenant(f: FigureEspace, noms: readonly string[]): string[] | null {
  return f.faces.find((face) => face.length >= 3 && noms.every((n) => dansPlan(f, n, face))) ?? null;
}

/** Sommets du solide situés dans le plan, dans l'ordre du tour (nom usuel « ABGH »). */
export function sommetsDuPlan(f: FigureEspace, plan: readonly string[]): string[] {
  const noms = Object.keys(f.sommets).filter((n) => dansPlan(f, n, plan));
  if (noms.length < 3) return noms;
  const pts = noms.map((n) => f.sommets[n]!);
  const c = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length, z: pts.reduce((s, p) => s + p.z, 0) / pts.length };
  const n = normalePlan(...plan3(f, plan));
  const u = soustraire3D(pts[0]!, c);
  const v = produitVectoriel3D(n, u);
  const angle = (p: Point3D) => {
    const w = soustraire3D(p, c);
    return Math.atan2(produitScalaire3D(w, v), produitScalaire3D(w, u));
  };
  const tri = noms.map((nom, i) => ({ nom, a: angle(pts[i]!) })).sort((x, y) => x.a - y.a).map((x) => x.nom);
  // Commence par la plus petite lettre, sens où la suivante est la plus petite.
  const debut = tri.indexOf([...tri].sort()[0]!);
  const tourne = [...tri.slice(debut), ...tri.slice(0, debut)];
  const inverse = [tourne[0]!, ...tourne.slice(1).reverse()];
  return tourne[1]! < inverse[1]! ? tourne : inverse;
}

export function nomFace(face: readonly string[]): string {
  return face.join("");
}

// --- Raisons : point dans un plan / hors d'un plan --------------------------------------------

function definition(f: FigureEspace, nom: string): PointDefini | undefined {
  return f.points.find((p) => p.nom === nom);
}

/**
 * Pourquoi le point `nom` est dans le plan `plan` (le point DOIT y être) — justification courte de
 * la ligne « nom ∈ plan ». Ordre : point du nom du plan, sommet d'une face portée par le plan,
 * milieu / point d'un segment dont les extrémités sont dans le plan, centre de face, sommet d'un
 * plan diagonal (parallèle à une droite du plan menée par un de ses points), puis le plan coloré.
 */
export function raisonDansPlan(f: FigureEspace, nom: string, plan: readonly string[], dejaConnus: readonly string[] = []): Fragments {
  if (plan.includes(nom)) return [texte("point qui nomme le plan")];
  const def = definition(f, nom);
  const face = faceDuPlan(f, plan);
  if (f.sommets[nom] && face) return [texte(`sommet de la face ${nomFace(face)}`)];
  if (def?.milieuDe) {
    const [u, v] = def.milieuDe;
    if (dansPlan(f, u, plan) && dansPlan(f, v, plan)) return phrase(`milieu de $${segmentTex(u, v)}$, dont les extrémités sont dans le plan`);
  }
  if (def?.surSegment) {
    const [u, v] = def.surSegment;
    if (dansPlan(f, u, plan) && dansPlan(f, v, plan)) return phrase(`point de $${segmentTex(u, v)}$, dont les extrémités sont dans le plan`);
  }
  if (def?.centreDe) {
    if (facePortePlan(f, def.centreDe, plan)) return [texte(`centre de la face ${nomFace(def.centreDe)}`)];
    const c = def.centreDe;
    for (const [x, z] of c.length === 4 ? ([[c[0], c[2]], [c[1], c[3]]] as [string, string][]) : []) {
      if (dansPlan(f, x, plan) && dansPlan(f, z, plan)) return phrase(`centre de ${nomFace(c)}, milieu de la diagonale $${segmentTex(x, z)}$`);
    }
  }
  if (face) return [texte(`point de la face ${nomFace(face)}`)];
  // Plan diagonal : (U nom) parallèle à une droite (S T) du plan, U point du plan.
  const connus = [...new Set([...plan, ...dejaConnus])];
  for (const u of connus) {
    if (memesPoints(f, u, nom)) continue;
    for (let i = 0; i < connus.length; i++) {
      for (let j = i + 1; j < connus.length; j++) {
        const s = connus[i]!;
        const t = connus[j]!;
        if (memesPoints(f, s, t)) continue;
        if (!memeDirection(f, [u, nom], [s, t]) || memeDroite(f, [u, nom], [s, t])) continue;
        const r = raisonParalleleDirecte(f, [u, nom], [s, t]);
        if (r) return phrase(`$${droiteTex(u, nom)}\\parallel${droiteTex(s, t)}$ (${r}), et $${nomTex(u)}$ est dans le plan`);
      }
    }
  }
  // Même chose avec une droite intermédiaire (c) : (U nom) ∥ (c) ∥ (S T).
  for (const u of connus) {
    if (memesPoints(f, u, nom)) continue;
    for (let i = 0; i < connus.length; i++) {
      for (let j = i + 1; j < connus.length; j++) {
        const s = connus[i]!;
        const t = connus[j]!;
        if (memesPoints(f, s, t) || !memeDirection(f, [u, nom], [s, t]) || memeDroite(f, [u, nom], [s, t])) continue;
        for (const c of droitesFigure(f)) {
          if (memeDroite(f, c, [u, nom]) || memeDroite(f, c, [s, t])) continue;
          const r1 = raisonParalleleDirecte(f, [u, nom], c);
          const r2 = r1 ? raisonParalleleDirecte(f, c, [s, t]) : null;
          if (r1 && r2) return phrase(`$${droiteTex(u, nom)}\\parallel${droiteTex(c[0], c[1])}$ (${r1}) et $${droiteTex(c[0], c[1])}\\parallel${droiteTex(s, t)}$ (${r2}), $${nomTex(u)}$ dans le plan`);
        }
      }
    }
  }
  for (let i = 0; i < connus.length; i++) {
    for (let j = i + 1; j < connus.length; j++) {
      if (!memesPoints(f, connus[i]!, connus[j]!) && alignes(f, connus[i]!, connus[j]!, nom)) return phrase(`point de la droite $${droiteTex(connus[i]!, connus[j]!)}$ du plan`);
    }
  }
  const sommets = sommetsDuPlan(f, plan);
  return [texte(sommets.length >= 3 ? `sommet du plan ${sommets.join("")}` : "point du plan")];
}

/** Pourquoi le point `nom` n'est PAS dans le plan `plan`. */
export function raisonHorsPlan(f: FigureEspace, nom: string, plan: readonly string[]): Fragments {
  const def = definition(f, nom);
  const face = faceDuPlan(f, plan);
  if (def?.milieuDe || def?.surSegment) {
    const [u, v] = (def.milieuDe ?? def.surSegment)!;
    const du = dansPlan(f, u, plan);
    const dv = dansPlan(f, v, plan);
    const quoi = def.milieuDe ? "milieu" : "point";
    if (du !== dv) return phrase(`${quoi} de $${segmentTex(u, v)}$ : $${nomTex(du ? u : v)}$ est dans le plan, $${nomTex(du ? v : u)}$ non`);
    if (!du && !dv) return phrase(`${quoi} de $${segmentTex(u, v)}$, hors du plan comme $${nomTex(u)}$ et $${nomTex(v)}$`);
  }
  if (def?.centreDe) return [texte(`centre de la face ${nomFace(def.centreDe)}, qui ne porte pas le plan`)];
  if (face) return [texte(`hors de la face ${nomFace(face)}`)];
  // Une face qui contient le point coupe le plan suivant une droite (XY) qui ne passe pas par lui.
  const nommes = [...Object.keys(f.sommets), ...f.points.map((p) => p.nom)];
  for (const x of f.faces) {
    if (x.length < 3 || !dansPlan(f, nom, x) || facePortePlan(f, x, plan)) continue;
    const communs = nommes.filter((n) => dansPlan(f, n, x) && dansPlan(f, n, plan));
    for (let i = 0; i < communs.length; i++) {
      for (let j = i + 1; j < communs.length; j++) {
        const [u, v] = [communs[i]!, communs[j]!];
        if (!memesPoints(f, u, v) && !alignes(f, u, v, nom)) return phrase(`le plan coupe la face ${nomFace(x)} suivant $${droiteTex(u, v)}$, qui ne passe pas par $${nomTex(nom)}$`);
      }
    }
  }
  const sommets = sommetsDuPlan(f, plan);
  if (sommets.length < 3) return [texte("hors du plan")];
  return [texte(f.sommets[nom] ? `pas un sommet du plan ${sommets.join("")}` : `hors du plan ${sommets.join("")}`)];
}

/** Ligne « nom ∈ plan » ou « nom ∉ plan », justifiée. */
export function lignePointPlan(f: FigureEspace, nom: string, plan: readonly string[], planAffiche: string = planTex(plan)): LigneCalcul {
  return dansPlan(f, nom, plan) ? ligne(`${nomTex(nom)}\\in${planAffiche}`, raisonDansPlan(f, nom, plan)) : ligne(`${nomTex(nom)}\\notin${planAffiche}`, raisonHorsPlan(f, nom, plan));
}

/** Pourquoi le point `nom` est sur la droite (d₀d₁) (il DOIT y être). */
export function raisonSurDroite(f: FigureEspace, nom: string, d: readonly [string, string]): Fragments {
  if (d.includes(nom)) return [texte("point qui nomme la droite")];
  const def = definition(f, nom);
  const seg = def?.milieuDe ?? def?.surSegment;
  if (seg) {
    const quoi = def?.milieuDe ? "milieu" : "point";
    if (seg.every((x) => d.includes(x))) return phrase(`${quoi} de $${segmentTex(seg[0], seg[1])}$`);
    if (seg.every((x) => memesPoints(f, x, d[0]) || memesPoints(f, x, d[1]) || alignes(f, d[0], d[1], x))) return phrase(`${quoi} de $${segmentTex(seg[0], seg[1])}$, porté par la droite`);
  }
  if (def?.centreDe && def.centreDe.length === 4) {
    const c = def.centreDe;
    for (const [x, z] of [[c[0]!, c[2]!], [c[1]!, c[3]!]] as [string, string][]) {
      if ((memesPoints(f, x, d[0]) || alignes(f, d[0], d[1], x)) && (memesPoints(f, z, d[0]) || alignes(f, d[0], d[1], z))) return phrase(`centre de la face ${nomFace(c)}, milieu de sa diagonale $${segmentTex(x, z)}$`);
    }
  }
  if (def?.centreDe && def.centreDe.length === 4) {
    const c = def.centreDe;
    const m0 = segmentsMilieu(f, d[0])[0];
    const m1 = segmentsMilieu(f, d[1])[0];
    const cote = (m: [string, string] | undefined) => m && m.every((x) => c.includes(x)) && Math.abs(c.indexOf(m[0]) - c.indexOf(m[1])) % 2 === 1;
    if (cote(m0) && cote(m1) && !m0!.some((x) => m1!.includes(x))) return [texte(`centre de la face ${nomFace(c)}, sur la droite qui joint les milieux de deux côtés opposés`)];
  }
  if (f.sommets[d[0]] && f.sommets[d[1]] && def?.centreDe) return [texte(`centre de la face ${nomFace(def.centreDe)}, aligné avec ${d[0]} et ${d[1]}`)];
  return [texte(`aligné avec ${d[0]} et ${d[1]}`)];
}

/** Pourquoi le point `nom` n'est PAS sur la droite (d₀d₁) : une face qui contient la droite mais pas
 * le point, sinon un plan nommé par la droite et un sommet. */
export function raisonHorsDroite(f: FigureEspace, nom: string, d: readonly [string, string]): Fragments {
  const face = f.faces.find((x) => x.length >= 3 && dansPlan(f, d[0], x) && dansPlan(f, d[1], x) && !dansPlan(f, nom, x));
  if (face) return phrase(`la face ${nomFace(face)} contient $${droiteTex(d[0], d[1])}$ mais pas $${nomTex(nom)}$`);
  // Une face contient le point et UN seul point P de la droite : la droite ne la rencontre qu'en P.
  for (const x of f.faces) {
    if (x.length < 3 || !dansPlan(f, nom, x)) continue;
    const dedans = d.filter((n) => dansPlan(f, n, x));
    if (dedans.length === 1 && !memesPoints(f, dedans[0]!, nom)) return phrase(`$${droiteTex(d[0], d[1])}$ ne rencontre la face ${nomFace(x)} qu'en $${nomTex(dedans[0]!)}$`);
  }
  // Sommet d'une face dont (d) est une diagonale.
  const faceDiag = f.faces.find((x) => x.length === 4 && x.includes(nom) && d.every((n) => x.includes(n)) && x.indexOf(d[0]) % 2 === x.indexOf(d[1]) % 2);
  if (faceDiag) return phrase(`sommet de la face ${nomFace(faceDiag)}, hors de sa diagonale $${segmentTex(d[0], d[1])}$`);
  const def = definition(f, nom);
  if (def?.milieuDe) return phrase(`milieu de $${segmentTex(...def.milieuDe)}$, qui ne porte pas $${droiteTex(d[0], d[1])}$`);
  return [texte(`hors de la droite (${d[0]}${d[1]})`)];
}

// --- Raisons : droites parallèles --------------------------------------------------------------

function vecteursEgaux(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): boolean {
  return distance3D(direction(f, a), direction(f, b)) < EPSILON_3D;
}

function angleDroit(f: FigureEspace, sommet: string, p: string, q: string): boolean {
  return Math.abs(produitScalaire3D(soustraire3D(position(f, p), position(f, sommet)), soustraire3D(position(f, q), position(f, sommet)))) < EPSILON_3D;
}

/** Nom d'un quadrilatère PQRS (cycle) : face du solide si c'en est une (« la face ABFE »), sinon
 * « ABGH est un rectangle / parallélogramme ». Renvoie la raison complète. */
function raisonQuadrilatere(f: FigureEspace, cycle: [string, string, string, string]): string {
  const face = f.faces.find((x) => x.length === 4 && cycle.every((n) => x.includes(n)));
  if (face) return `côtés opposés de la face ${nomFace(face)}`;
  const nom = cycle.join("");
  return angleDroit(f, cycle[0], cycle[1], cycle[3]) ? `${nom} est un rectangle` : `${nom} est un parallélogramme`;
}

/** Segments dont le point est le milieu : son arête, ou les deux diagonales d'une face dont il est le
 * centre (quadrilatère). */
function segmentsMilieu(f: FigureEspace, nom: string): [string, string][] {
  const def = definition(f, nom);
  if (def?.milieuDe) return [def.milieuDe];
  const c = def?.centreDe;
  if (c && c.length === 4) return [[c[0]!, c[2]!], [c[1]!, c[3]!]];
  return [];
}

/** Deux SOMMETS portés par la droite (d), s'il y en a (ex. (JB) avec J milieu de [BE] → (BE)). */
function supportSommets(f: FigureEspace, d: readonly [string, string]): [string, string] | null {
  if (f.sommets[d[0]] && f.sommets[d[1]]) return [d[0], d[1]];
  const sur = Object.keys(f.sommets).filter((n) => memesPoints(f, n, d[0]) || memesPoints(f, n, d[1]) || alignes(f, d[0], d[1], n));
  return sur.length >= 2 ? [sur[0]!, sur[1]!] : null;
}

/** Raison DIRECTE du parallélisme de (a) et (b), dans une figure plane du cours (parallélogramme,
 * droite des milieux, milieux de deux côtés opposés), ou `null`. Une droite qui porte deux sommets
 * est lue par ces sommets ; le centre d'une face est le milieu de ses diagonales. */
export function raisonParalleleDirecte(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): string | null {
  if (!memeDirection(f, a, b) || memeDroite(f, a, b)) return null;
  const quadrilatere = (d: readonly [string, string], e: readonly [string, string]): string | null => {
    const sd = supportSommets(f, d);
    const se = supportSommets(f, e);
    if (!sd || !se) return null;
    const [p, q] = sd;
    const [r, s] = se;
    if (new Set([p, q, r, s]).size !== 4) return null;
    if (vecteursEgaux(f, [p, q], [r, s])) return raisonQuadrilatere(f, [p, q, s, r]);
    if (vecteursEgaux(f, [p, q], [s, r])) return raisonQuadrilatere(f, [p, q, r, s]);
    return null;
  };
  const milieux = (d: readonly [string, string], e: readonly [string, string]): string | null => {
    const [p, q] = d;
    for (const dp of segmentsMilieu(f, p)) {
      for (const dq of segmentsMilieu(f, q)) {
        // Droite des milieux : I milieu de [XY], J milieu de [XZ] → (IJ) ∥ (YZ).
        const commun = dp.find((x) => dq.includes(x));
        if (commun && new Set([...dp, ...dq]).size === 3) {
          const y = dp.find((x) => x !== commun)!;
          const z = dq.find((x) => x !== commun)!;
          if (memeDroite(f, [y, z], e) || memeDirection(f, [y, z], e)) {
            if (memeDroite(f, [y, z], e)) return `droite des milieux du triangle ${commun}${y}${z}`;
          }
        }
        // Milieux de deux côtés opposés d'un parallélogramme : (IJ) ∥ (XW) ∥ (YZ).
        const [x1, y1] = dp;
        for (const [x2, y2] of [dq, [dq[1], dq[0]] as [string, string]]) {
          if (new Set([x1, y1, x2, y2]).size === 4 && vecteursEgaux(f, [x1, y1], [x2, y2]) && (memeDroite(f, [x1, x2], e) || memeDroite(f, [y1, y2], e))) {
            const quad = raisonQuadrilatere(f, [x1, y1, y2, x2]);
            const nom = quad.startsWith("côtés") ? quad.replace("côtés opposés de ", "") : `${quad.endsWith("rectangle") ? "du rectangle" : "du parallélogramme"} ${x1}${y1}${y2}${x2}`;
            return `milieux de deux côtés opposés ${nom.startsWith("la face") ? `de ${nom}` : nom}`;
          }
        }
      }
    }
    return null;
  };
  const demi = (): string | null => {
    const [p, q] = a;
    const [r, s] = b;
    if (new Set([p, q, r, s]).size !== 4) return null;
    // Cycle PQRS (PQ = SR) ou PQSR (PQ = RS) : (a) et (b) côtés opposés, les deux autres côtés
    // doivent être des moitiés de deux côtés opposés d'une face.
    if (vecteursEgaux(f, [p, q], [s, r])) return demiCotesRaison(f, [p, q, r, s]);
    if (vecteursEgaux(f, [p, q], [r, s])) return demiCotesRaison(f, [p, q, s, r]);
    return null;
  };
  return quadrilatere(a, b) ?? milieux(a, b) ?? milieux(b, a) ?? demi();
}

/** Côté [xy] ramené à une ARÊTE de même vecteur : l'arête elle-même, ou le segment qui joint les
 * milieux de deux côtés opposés d'un parallélogramme (I, K milieux de [DH], [CG] → [DC]). */
function areteEquivalente(f: FigureEspace, x: string, y: string): { arete: [string, string]; texte: string } | null {
  if (f.sommets[x] && f.sommets[y]) return { arete: [x, y], texte: `[${x}${y}]` };
  const sx = definition(f, x)?.milieuDe;
  const sy = definition(f, y)?.milieuDe;
  if (!sx || !sy) return null;
  for (const [a1, b1] of [sx, [sx[1], sx[0]] as [string, string]]) {
    for (const [a2, b2] of [sy, [sy[1], sy[0]] as [string, string]]) {
      if (new Set([a1, b1, a2, b2]).size === 4 && vecteursEgaux(f, [a1, a2], [b1, b2]) && vecteursEgaux(f, [x, y], [a1, a2])) return { arete: [a1, a2], texte: `[${x}${y}] (milieux de [${sx.join("")}] et [${sy.join("")}])` };
    }
  }
  return null;
}

/** Parallélogramme PQRS dont les côtés [QR] et [SP] sont parallèles et de même longueur qu'une même
 * arête (ou que deux arêtes opposées d'une face). */
function cotesEgauxRaison(f: FigureEspace, cycle: [string, string, string, string]): string | null {
  const [p, q, r, s] = cycle;
  const u = areteEquivalente(f, q, r);
  const v = areteEquivalente(f, p, s);
  if (!u || !v) return null;
  const [e1, e2] = [u.arete, v.arete];
  const meme = (e1[0] === e2[0] && e1[1] === e2[1]) || (e1[0] === e2[1] && e1[1] === e2[0]);
  if (!meme && !vecteursEgaux(f, e1, e2) && !vecteursEgaux(f, e1, [e2[1], e2[0]])) return null;
  const ref = meme || u.texte === `[${e1.join("")}]` ? `[${e1.join("")}]` : v.texte === `[${e2.join("")}]` ? `[${e2.join("")}]` : `[${e1.join("")}]`;
  return `${cycle.join("")} est un parallélogramme : ${u.texte} et ${v.texte} sont parallèles à ${ref} et de même longueur`;
}

/** Parallélogramme PQRS ([PQ] et [RS] parallèles et de même longueur) dont les côtés [QR] et [SP]
 * sont des MOITIÉS de deux côtés opposés d'une face (un milieu et un sommet de son arête), ex. J
 * milieu de [BE], K milieu de [CF] → FJBK. */
function demiCotesRaison(f: FigureEspace, cycle: [string, string, string, string]): string | null {
  const [p, q, r, s] = cycle;
  const moitie = (x: string, y: string): [string, string] | null => {
    for (const [m, v] of [
      [x, y],
      [y, x],
    ] as [string, string][]) {
      const seg = definition(f, m)?.milieuDe;
      if (seg && seg.includes(v) && f.sommets[v]) return seg;
    }
    return null;
  };
  const s1 = moitie(q, r);
  const s2 = moitie(s, p);
  if (!s1 || !s2 || s1.some((n) => s2.includes(n))) return cotesEgauxRaison(f, cycle);
  let quad: [string, string, string, string] | null = null;
  if (vecteursEgaux(f, s1, [s2[1], s2[0]])) quad = [s1[0], s1[1], s2[0], s2[1]];
  else if (vecteursEgaux(f, s1, s2)) quad = [s1[0], s1[1], s2[1], s2[0]];
  if (!quad) return null;
  const r0 = raisonQuadrilatere(f, quad);
  const ou = r0.startsWith("côtés opposés de ") ? `deux côtés opposés de ${r0.slice("côtés opposés de ".length)}` : `[${s1.join("")}] et [${s2.join("")}], côtés opposés du ${r0.endsWith("rectangle") ? "rectangle" : "parallélogramme"} ${quad.join("")}`;
  return `${cycle.join("")} est un parallélogramme : [${q}${r}] et [${s}${p}] sont les moitiés de ${ou}`;
}

/** Toutes les droites (paires de points nommés) de la figure. */
function droitesFigure(f: FigureEspace): [string, string][] {
  const noms = [...Object.keys(f.sommets), ...f.points.map((p) => p.nom)];
  const out: [string, string][] = [];
  for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++) if (!memesPoints(f, noms[i]!, noms[j]!)) out.push([noms[i]!, noms[j]!]);
  return out;
}

/** Nombre de parallélismes que la brique n'a pas su justifier par une figure plane (contrôle). */
export const STATS_ESPACE = { parallelesNonJustifies: 0, criteresIncomplets: 0 };

/**
 * Lignes qui prouvent (a) ∥ (b) : une raison directe, sinon une droite intermédiaire (c) avec
 * (a) ∥ (c) et (c) ∥ (b), puis « deux droites parallèles à une même troisième ».
 */
export function lignesParallele(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): LigneCalcul[] {
  const rel = (d: readonly [string, string], e: readonly [string, string]) => `${droiteTex(d[0], d[1])}\\parallel${droiteTex(e[0], e[1])}`;
  const direct = raisonParalleleDirecte(f, a, b);
  if (direct) return [ligne(rel(a, b), direct)];
  for (const c of droitesFigure(f)) {
    if (memeDroite(f, c, a) || memeDroite(f, c, b)) continue;
    const r1 = raisonParalleleDirecte(f, a, c);
    const r2 = r1 ? raisonParalleleDirecte(f, c, b) : null;
    if (r1 && r2) return [ligne(rel(a, c), r1), ligne(rel(c, b), r2), ligne(rel(a, b), "deux droites parallèles à une même troisième")];
  }
  STATS_ESPACE.parallelesNonJustifies++;
  return [ligne(rel(a, b), "même direction")];
}

/** (a) ∥ (b) se prouve-t-il par une figure plane du cours, directement ou par une droite
 * intermédiaire (comme `lignesParallele`, sans compter dans `STATS_ESPACE`) ? Sert aux générateurs
 * pour écarter au tirage un parallélisme que le corrigé ne saurait justifier (gen101). */
export function parallelismeJustifiable(f: FigureEspace, a: readonly [string, string], b: readonly [string, string]): boolean {
  if (raisonParalleleDirecte(f, a, b)) return true;
  return droitesFigure(f).some((c) => !memeDroite(f, c, a) && !memeDroite(f, c, b) && raisonParalleleDirecte(f, a, c) !== null && raisonParalleleDirecte(f, c, b) !== null);
}

// --- Points communs à deux plans, intersection, plans parallèles --------------------------------

export interface PointCommunCandidat {
  /** Nom à écrire (point nommé, ou M / N pour un point construit). */
  nom: string;
  /** Point construit comme intersection de deux droites nommées, sinon `null` (point nommé). */
  construction: { droite1: [string, string]; droite2: [string, string] } | null;
}

/** Lignes « (XY) ⊂ plan » : d'abord « X ∈ plan » (avec sa raison) pour chaque point qui ne nomme
 * pas le plan, puis l'inclusion (« deux de ses points sont dans le plan »). */
export function lignesDroiteDansPlan(f: FigureEspace, d: readonly [string, string], pl: readonly string[]): LigneCalcul[] {
  const hors = d.filter((n) => !pl.includes(n));
  return [
    ...hors.map((n) => ligne(`${nomTex(n)}\\in${planTex(pl)}`, raisonDansPlan(f, n, pl))),
    ligne(`${droiteTex(d[0], d[1])}\\subset${planTex(pl)}`, hors.length === 0 ? "deux points qui nomment le plan" : "deux de ses points sont dans le plan"),
  ];
}

/** Lignes qui prouvent que `c` est commun aux plans `p` et `q` (point nommé : il est dans chacun ;
 * point construit : intersection d'une droite de chaque plan, toutes deux dans une même face). */
export function lignesPointCommun(f: FigureEspace, c: PointCommunCandidat, p: readonly string[], q: readonly string[]): LigneCalcul[] {
  const P = planTex(p);
  const Q = planTex(q);
  if (!c.construction) return [ligne(`${nomTex(c.nom)}\\in${P}`, raisonDansPlan(f, c.nom, p)), ligne(`${nomTex(c.nom)}\\in${Q}`, raisonDansPlan(f, c.nom, q))];
  const { droite1, droite2 } = c.construction;
  const dans = (d: [string, string], pl: readonly string[]) => dansPlan(f, d[0], pl) && dansPlan(f, d[1], pl);
  const [dp, dq] = dans(droite1, p) && dans(droite2, q) ? [droite1, droite2] : [droite2, droite1];
  const face = faceContenant(f, [...droite1, ...droite2]);
  return [
    ...lignesDroiteDansPlan(f, dp, p),
    ...lignesDroiteDansPlan(f, dq, q),
    ligne(`${nomTex(c.nom)}=${droiteTex(...dp)}\\cap${droiteTex(...dq)}`, face ? `deux droites non parallèles de la face ${nomFace(face)}` : "deux droites coplanaires non parallèles"),
  ];
}

/**
 * Lignes qui prouvent (p) ∥ (q) par le critère du cours : deux droites SÉCANTES de (p), chacune
 * parallèle à une droite de (q). `paires` : les deux parallélismes à utiliser (sinon cherchés parmi les
 * droites nommées des deux plans).
 */
export function lignesPlansParalleles(f: FigureEspace, p: readonly string[], q: readonly string[], paires?: [[string, string], [string, string]][]): LigneCalcul[] {
  let choix = paires;
  if (!choix) {
    const dp = droitesFigure(f).filter((d) => dansPlan(f, d[0], p) && dansPlan(f, d[1], p));
    const dq = droitesFigure(f).filter((d) => dansPlan(f, d[0], q) && dansPlan(f, d[1], q));
    const par: [[string, string], [string, string]][] = [];
    for (const l of dp) {
      const m = dq.find((x) => raisonParalleleDirecte(f, l, x)) ?? dq.find((x) => memeDirection(f, l, x) && !memeDroite(f, l, x) && droitesFigure(f).some((c) => !memeDroite(f, c, l) && !memeDroite(f, c, x) && raisonParalleleDirecte(f, l, c) && raisonParalleleDirecte(f, c, x)));
      if (m) par.push([l, m]);
    }
    let secours: [[string, string], [string, string]][] | undefined;
    for (let i = 0; i < par.length && !choix; i++) {
      for (let j = i + 1; j < par.length; j++) {
        const [l1] = par[i]!;
        const [l2] = par[j]!;
        if (memeDirection(f, l1, l2)) continue;
        if (l1.some((n) => l2.includes(n))) {
          choix = [par[i]!, par[j]!];
          break;
        }
        secours ??= [par[i]!, par[j]!];
      }
    }
    choix ??= secours;
    if (!choix) {
      // Une seule direction trouvée parmi les droites nommées : on la donne, puis le parallélisme
      // des plans (contrôle du collecteur : `STATS_ESPACE.criteresIncomplets`).
      STATS_ESPACE.criteresIncomplets++;
      const une = par[0];
      return [...(une ? lignesParallele(f, une[0], une[1]) : []), ligne(`${planTex(p)}\\parallel${planTex(q)}`, "plans distincts sans aucun point commun")];
    }
  }
  if (!choix) return [];
  const [[l1, m1], [l2, m2]] = choix as [[[string, string], [string, string]], [[string, string], [string, string]]];
  const commun = l1.find((n) => l2.includes(n));
  return [
    ...lignesParallele(f, l1, m1),
    ...lignesParallele(f, l2, m2),
    commun
      ? ligne(`${droiteTex(...l1)}\\cap${droiteTex(...l2)}=\\{${nomTex(commun)}\\}`, phrase(`deux droites sécantes du plan $${planTex(p)}$`))
      : ligne(`${droiteTex(...l1)}\\nparallel${droiteTex(...l2)}`, phrase(`deux droites sécantes du plan $${planTex(p)}$`)),
    ligne(`${planTex(p)}\\parallel${planTex(q)}`, "deux droites sécantes de l'un parallèles à deux droites de l'autre"),
  ];
}
