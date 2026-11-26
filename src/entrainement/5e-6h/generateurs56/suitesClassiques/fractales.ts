import type { AideEcran, DefinitionEcrans, Frag, ModeEcran, OptionEcran } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import { choisir, lireNombre56, proche, statutNombre56 } from "../../commun56/lecture56";
import { adaptateurEcrans56 } from "../../commun56/adaptateurEcrans56";

/**
 * 56gen8, famille « fractales » AJOUTÉE EN FIN de catalogue (5e (6h), étape 10 : flocon de von Koch,
 * triangle de Sierpinski). Variantes `koch` (nombre de côtés et périmètre à l'étape n, limite du
 * périmètre, limite de l'aire = somme infinie : 8/5 de l'aire de départ) et `sierpinski` (nombre de
 * triangles, aire et périmètre à l'étape n, limites). Nombres choisis pour des résultats entiers ;
 * aucun verdict tiré (les limites sont la propriété à reconnaître, choix fermé à une tentative).
 */

export type PhaseFractale = "nombre" | "perimetre" | "aire" | "limitePerimetre" | "aireLimite" | "limites";

export interface ExerciceKoch {
  famille56: "koch";
  c: number;
  n: number;
  ordre: number[];
}
export interface ExerciceSierpinski {
  famille56: "sierpinski";
  c: number;
  A0: number;
  n: number;
  ordre: number[];
}
export type ExerciceFractale = ExerciceKoch | ExerciceSierpinski;

export const CATALOGUE_FRACTALES = [
  { id: "koch", label: "Fractales : flocon de von Koch (côtés, périmètre, aire limite)" },
  { id: "sierpinski", label: "Fractales : triangle de Sierpinski (triangles, aire, périmètre, limites)" },
];

export function estFractale(x: unknown): x is ExerciceFractale {
  const f = !!x && (x as ExerciceFractale).famille56;
  return f === "koch" || f === "sierpinski";
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export function genererKoch(): ExerciceKoch {
  const [c, n] = choisir<[number, number]>([[9, 2], [27, 2], [27, 3], [81, 3], [81, 4], [9, 1], [27, 1]]);
  return { famille56: "koch", c, n, ordre: melange(4) };
}
export function genererSierpinski(): ExerciceSierpinski {
  const [c, A0, n] = choisir<[number, number, number]>([[8, 64, 2], [8, 64, 3], [16, 256, 2], [16, 256, 3], [8, 64, 4], [16, 256, 4]]);
  return { famille56: "sierpinski", c, A0, n, ordre: melange(4) };
}
export const genererFractale = (): ExerciceFractale => (Math.random() < 0.5 ? genererKoch() : genererSierpinski());
export const varianteFractale = (id: string): ExerciceFractale => (id === "koch" ? genererKoch() : genererSierpinski());

// --- valeurs -------------------------------------------------------------------------------------
const cotesKoch = (e: ExerciceKoch) => 3 * Math.pow(4, e.n);
const perimKoch = (e: ExerciceKoch) => (3 * e.c * Math.pow(4, e.n)) / Math.pow(3, e.n);
const trianglesS = (e: ExerciceSierpinski) => Math.pow(3, e.n);
const aireS = (e: ExerciceSierpinski) => (e.A0 * Math.pow(3, e.n)) / Math.pow(4, e.n);
const perimS = (e: ExerciceSierpinski) => (3 * e.c * Math.pow(3, e.n)) / Math.pow(2, e.n);
const t = tx;
const l = lx;
const ent = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? `${Math.round(x)}`.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : `${x}`.replace(".", "{,}"));

// --- figure : étapes 0, 1, 2 ---------------------------------------------------------------------
type Pt = [number, number];
function kochSegments(a: Pt, b: Pt, k: number): Pt[] {
  if (k === 0) return [a];
  const [dx, dy] = [(b[0] - a[0]) / 3, (b[1] - a[1]) / 3];
  const p1: Pt = [a[0] + dx, a[1] + dy];
  const p3: Pt = [a[0] + 2 * dx, a[1] + 2 * dy];
  const p2: Pt = [p1[0] + dx * 0.5 + dy * (Math.sqrt(3) / 2), p1[1] + dy * 0.5 - dx * (Math.sqrt(3) / 2)];
  return [...kochSegments(a, p1, k - 1), ...kochSegments(p1, p2, k - 1), ...kochSegments(p2, p3, k - 1), ...kochSegments(p3, b, k - 1)];
}
function triangleBase(ox: number, oy: number, s: number): [Pt, Pt, Pt] {
  return [[ox, oy + s * 0.866], [ox + s / 2, oy], [ox + s, oy + s * 0.866]];
}
function sierp(a: Pt, b: Pt, c: Pt, k: number): string {
  if (k === 0) return `<polygon points="${[a, b, c].map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1"/>`;
  const m = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  return sierp(a, m(a, b), m(a, c), k - 1) + sierp(m(a, b), b, m(b, c), k - 1) + sierp(m(a, c), m(b, c), c, k - 1);
}
export function figureFractale(e: ExerciceFractale): string {
  const s = 90;
  const parts: string[] = [];
  for (let k = 0; k <= 2; k++) {
    const ox = 10 + k * 115;
    const oy = e.famille56 === "koch" ? 32 : 14;
    const [A, B, C] = triangleBase(ox, oy, s);
    if (e.famille56 === "koch") {
      // Sens horaire à l'écran (y vers le bas) : A (bas gauche) → B (haut) → C (bas droit) → A, pointes vers l'extérieur.
      const pts = [...kochSegments(A, B, k), ...kochSegments(B, C, k), ...kochSegments(C, A, k)];
      parts.push(`<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
    } else parts.push(sierp(A, B, C, k));
    parts.push(`<text x="${ox + s / 2}" y="${e.famille56 === "koch" ? 150 : 112}" text-anchor="middle" font-size="12" fill="currentColor">étape ${k}</text>`);
  }
  const h = e.famille56 === "koch" ? 158 : 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 345 ${h}" width="345" height="${h}" role="img" aria-label="Étapes 0, 1 et 2 de la construction">${parts.join("")}</svg>`;
}

// --- textes --------------------------------------------------------------------------------------
function consigneGenerale(e: ExerciceFractale): Frag[] {
  if (e.famille56 === "koch")
    return [
      t("Flocon de von Koch. À l'étape 0, on a un triangle équilatéral de côté "),
      l(`${e.c}`),
      t(" cm, d'aire "),
      l("A_0"),
      t(". À chaque étape, on partage chaque côté en trois segments égaux et on remplace celui du milieu par deux segments de même longueur, qui forment une pointe vers l'extérieur."),
    ];
  return [
    t("Triangle de Sierpinski. À l'étape 0, on a un triangle équilatéral plein de côté "),
    l(`${e.c}`),
    t(" cm et d'aire "),
    l(`${e.A0}`),
    t(" cm². À chaque étape, dans chaque triangle plein, on joint les milieux des côtés et on retire le triangle du milieu."),
  ];
}
const consignePapier = (e: ExerciceFractale): Frag[] =>
  e.famille56 === "koch"
    ? [t(`Détermine le nombre de côtés et le périmètre du flocon à l'étape ${e.n}, puis le comportement du périmètre et la limite de l'aire (en fonction de `), l("A_0"), t(") quand le nombre d'étapes tend vers l'infini.")]
    : [t(`Détermine le nombre de triangles pleins, leur aire totale et la somme de leurs périmètres à l'étape ${e.n}, puis le comportement de l'aire et du périmètre quand le nombre d'étapes tend vers l'infini.`)];

export const phasesFractale = (e: ExerciceFractale): PhaseFractale[] => (e.famille56 === "koch" ? ["nombre", "perimetre", "limitePerimetre", "aireLimite"] : ["nombre", "aire", "perimetre", "limites"]);

function consigne(e: ExerciceFractale, p: PhaseFractale): Frag[] {
  if (p === "nombre") return e.famille56 === "koch" ? [t(`Combien le flocon a-t-il de côtés à l'étape ${e.n} ?`)] : [t(`Combien y a-t-il de triangles pleins à l'étape ${e.n} ?`)];
  if (p === "perimetre") return e.famille56 === "koch" ? [t(`Quel est le périmètre du flocon à l'étape ${e.n} ?`)] : [t(`Quelle est la somme des périmètres des triangles pleins à l'étape ${e.n} ?`)];
  if (p === "aire") return [t(`Quelle est l'aire totale des triangles pleins à l'étape ${e.n} ?`)];
  if (p === "limitePerimetre") return [t("Que fait le périmètre quand le nombre d'étapes tend vers l'infini ?")];
  if (p === "aireLimite") return [t("L'aire du flocon tend vers un nombre de fois "), l("A_0"), t(". Lequel ?")];
  return [t("Que font l'aire et le périmètre quand le nombre d'étapes tend vers l'infini ?")];
}

const OPT_PERIM = (e: ExerciceKoch): Frag[][] => [[t("Il tend vers "), l("+\\infty"), t(".")], [t("Il tend vers 0.")], [t("Il tend vers "), l(`4\\cdot ${e.c}=${4 * e.c}`), t(" cm.")], [t("Il reste égal à "), l(`${3 * e.c}`), t(" cm.")]];
const OPT_LIM: Frag[][] = [
  [t("L'aire tend vers 0 et le périmètre vers "), l("+\\infty"), t(".")],
  [t("L'aire et le périmètre tendent vers 0.")],
  [t("L'aire tend vers le quart de l'aire de départ et le périmètre vers "), l("+\\infty"), t(".")],
  [t("L'aire et le périmètre tendent vers "), l("+\\infty"), t(".")],
];
function options(e: ExerciceFractale): OptionEcran[] {
  const base = e.famille56 === "koch" ? OPT_PERIM(e) : OPT_LIM;
  return e.ordre.map((i) => ({ id: `o${i}`, fragments: base[i] }));
}

function mode(e: ExerciceFractale, p: PhaseFractale): ModeEcran {
  if (p === "limitePerimetre" || p === "limites") return { type: "choix", options: options(e) };
  const champs = {
    nombre: { label: e.famille56 === "koch" ? "nombre de côtés" : "nombre de triangles", labelLatex: e.famille56 === "koch" ? `N_{${e.n}}=` : `T_{${e.n}}=`, placeholder: "entier" },
    perimetre: { label: "périmètre", labelLatex: `P_{${e.n}}=`, placeholder: "nombre", unite: "cm" },
    aire: { label: "aire", labelLatex: `A_{${e.n}}=`, placeholder: "nombre", unite: "cm²" },
    aireLimite: { label: "facteur", labelLatex: "\\lim A_n=", placeholder: "nombre ou fraction", unite: "× A₀" },
  } as const;
  return { type: "champs", champs: [champs[p as keyof typeof champs]] };
}

function diagnostiquer(e: ExerciceFractale, p: PhaseFractale, v: string[]): StatutVerification[] {
  if (p === "limitePerimetre" || p === "limites") return [v[0] === "o0" ? "correct" : "not_equivalent"];
  if (e.famille56 === "koch") return [statutNombre56(v[0], p === "nombre" ? cotesKoch(e) : p === "perimetre" ? perimKoch(e) : 1.6)];
  return [statutNombre56(v[0], p === "nombre" ? trianglesS(e) : p === "aire" ? aireS(e) : perimS(e))];
}

function piegeFractale(e: ExerciceFractale, p: PhaseFractale, v: string[]): Frag[] | null {
  const x = p === "limitePerimetre" || p === "limites" ? null : lireNombre56(v[0]);
  if (e.famille56 === "koch") {
    if (p === "nombre" && x !== null && proche(x, 3 * 4 * e.n)) return [t("Le nombre de côtés est multiplié par 4 à chaque étape : c'est une suite géométrique, pas arithmétique.")];
    if (p === "perimetre" && x !== null && proche(x, 3 * e.c * Math.pow(4 / 3, e.n - 1))) return [t(`Compte bien les étapes : à l'étape ${e.n}, le périmètre a été multiplié ${e.n} fois par `), l("\\dfrac{4}{3}"), t(".")];
    if (p === "aireLimite" && x !== null && proche(x, 4 / 3)) return [t("Additionne toutes les pointes ajoutées, à toutes les étapes : c'est une somme infinie, pas la première pointe seule.")];
    if (p === "limitePerimetre" && v[0] !== "o0") return [t("Le périmètre est multiplié par "), l("\\dfrac{4}{3}>1"), t(" à chaque étape : suite géométrique de raison supérieure à 1.")];
    return null;
  }
  if (p === "nombre" && x !== null && proche(x, 4 * e.n)) return [t("Chaque triangle plein en donne trois : le nombre est multiplié par 3 à chaque étape.")];
  if (p === "aire" && x !== null && proche(x, e.A0 / Math.pow(4, e.n))) return [t("C'est l'aire d'un seul petit triangle ; il y en a "), l(`3^{${e.n}}`), t(".")];
  if (p === "limites" && v[0] !== "o0") return [t("L'aire est multipliée par "), l("\\dfrac{3}{4}<1"), t(" à chaque étape, le périmètre total par "), l("\\dfrac{3}{2}>1"), t(".")];
  return null;
}

function reponseAttendue(e: ExerciceFractale, p: PhaseFractale): Frag[] {
  if (p === "limitePerimetre" || p === "limites") return (e.famille56 === "koch" ? OPT_PERIM(e) : OPT_LIM)[0];
  if (e.famille56 === "koch") {
    if (p === "nombre") return [l(`N_{${e.n}}=3\\cdot 4^{${e.n}}=${ent(cotesKoch(e))}`)];
    if (p === "perimetre") return [l(`P_{${e.n}}=${ent(perimKoch(e))}`), t(" cm")];
    return [l("\\lim A_n=\\dfrac{8}{5}A_0")];
  }
  if (p === "nombre") return [l(`T_{${e.n}}=3^{${e.n}}=${ent(trianglesS(e))}`)];
  if (p === "aire") return [l(`A_{${e.n}}=${ent(aireS(e))}`), t(" cm²")];
  return [l(`P_{${e.n}}=${ent(perimS(e))}`), t(" cm")];
}

function aide1(e: ExerciceFractale, p: PhaseFractale): AideEcran {
  if (e.famille56 === "koch") {
    if (p === "nombre") return { texte: [t("Chaque côté est remplacé par 4 côtés : le nombre de côtés est une suite géométrique de raison 4.")] };
    if (p === "perimetre") return { texte: [t("Chaque côté est remplacé par 4 segments de longueur trois fois plus petite : le périmètre est multiplié par "), l("\\dfrac{4}{3}"), t(" à chaque étape.")] };
    if (p === "limitePerimetre") return { texte: [t("Une suite géométrique de raison q > 1 et de premier terme positif tend vers "), l("+\\infty"), t(".")] };
    return { texte: [t("À l'étape k, on ajoute une petite pointe sur chacun des côtés de l'étape précédente ; chaque pointe a une aire 9 fois plus petite que celles de l'étape d'avant.")] };
  }
  if (p === "nombre") return { texte: [t("Chaque triangle plein est remplacé par 3 triangles pleins.")] };
  if (p === "aire") return { texte: [t("On retire un quart de chaque triangle plein : l'aire est multipliée par "), l("\\dfrac{3}{4}"), t(" à chaque étape.")] };
  if (p === "perimetre") return { texte: [t("Trois fois plus de triangles, de côté deux fois plus petit : le périmètre total est multiplié par "), l("\\dfrac{3}{2}"), t(" à chaque étape.")] };
  return { texte: [t("Regarde la raison de chaque suite géométrique : plus petite ou plus grande que 1 ?")] };
}
function aide2(e: ExerciceFractale, p: PhaseFractale): AideEcran | null {
  if (e.famille56 === "koch") {
    if (p === "nombre") return { texte: [t("Étape 0 : 3 côtés ; étape 1 : 12 côtés.")], latex: `N_{${e.n}}=3\\cdot 4^{${e.n}}` };
    if (p === "perimetre") return { texte: [t("Périmètre de départ : "), l(`3\\cdot ${e.c}=${3 * e.c}`), t(" cm.")], latex: `P_{${e.n}}=${3 * e.c}\\cdot\\left(\\dfrac{4}{3}\\right)^{${e.n}}` };
    if (p === "limitePerimetre") return { texte: [t("Ici la raison vaut "), l("\\dfrac{4}{3}"), t(".")] };
    return { texte: [t("Aires ajoutées : "), l("\\dfrac{A_0}{3}"), t(" à l'étape 1, puis chaque fois "), l("\\dfrac{4}{9}"), t(" fois plus. Somme infinie géométrique :")], latex: "A_0+\\dfrac{A_0}{3}\\cdot\\dfrac{1}{1-\\frac{4}{9}}" };
  }
  if (p === "nombre") return { latex: `T_{${e.n}}=3^{${e.n}}`, texte: [t("Étape 0 : 1 triangle ; étape 1 : 3 triangles.")] };
  if (p === "aire") return { texte: [t("Aire de départ "), l(`${e.A0}`), t(" cm² :")], latex: `A_{${e.n}}=${e.A0}\\cdot\\left(\\dfrac{3}{4}\\right)^{${e.n}}` };
  if (p === "perimetre") return { texte: [t("Périmètre de départ "), l(`${3 * e.c}`), t(" cm :")], latex: `P_{${e.n}}=${3 * e.c}\\cdot\\left(\\dfrac{3}{2}\\right)^{${e.n}}` };
  return { texte: [t("Raisons : "), l("\\dfrac{3}{4}"), t(" pour l'aire, "), l("\\dfrac{3}{2}"), t(" pour le périmètre.")] };
}

function correction(e: ExerciceFractale): EtapeCorrection[] {
  if (e.famille56 === "koch")
    return [
      utilise("a", [t("Chaque côté devient 4 côtés trois fois plus courts : nombre de côtés et périmètre sont des suites géométriques (raisons 4 et "), l("\\dfrac{4}{3}"), t(").")]),
      calcul("a", [ligne(`N_0=3`), ligne(`N_{${e.n}}=3\\cdot 4^{${e.n}}=${ent(cotesKoch(e))}`)]),
      calcul("b", [ligne(`P_0=3\\cdot ${e.c}=${3 * e.c}`), ligne(`P_{${e.n}}=${3 * e.c}\\cdot\\left(\\dfrac{4}{3}\\right)^{${e.n}}=${ent(perimKoch(e))}`)]),
      resultat("c", [t("Raison "), l("\\dfrac{4}{3}>1"), t(" et "), l("P_0>0"), t(" : le périmètre tend vers "), l("+\\infty"), t(".")]),
      utilise("d", [t("À l'étape k, on ajoute "), l("3\\cdot 4^{k-1}"), t(" pointes d'aire "), l("\\dfrac{A_0}{9^{k}}"), t(", soit "), l("\\dfrac{A_0}{3}\\left(\\dfrac{4}{9}\\right)^{k-1}"), t(" : suite géométrique de raison "), l("\\dfrac{4}{9}"), t(".")]),
      calcul("d", [ligne("\\lim A_n=A_0+\\dfrac{\\frac{A_0}{3}}{1-\\frac{4}{9}}"), ligne("=A_0+\\dfrac{A_0}{3}\\cdot\\dfrac{9}{5}=A_0+\\dfrac{3}{5}A_0"), ligne("=\\dfrac{8}{5}A_0")]),
      resultat("d", [t("Le périmètre tend vers "), l("+\\infty"), t(" mais l'aire tend vers "), l("\\dfrac{8}{5}A_0"), t(" : une ligne de longueur infinie entoure une aire finie.")]),
      piege("d", [t("Croire que l'aire tend aussi vers l'infini parce que le périmètre le fait.")]),
    ];
  return [
    utilise("a", [t("Chaque triangle plein donne 3 triangles de côté moitié : nombre (raison 3), aire (raison "), l("\\dfrac{3}{4}"), t(") et périmètre total (raison "), l("\\dfrac{3}{2}"), t(") sont des suites géométriques.")]),
    calcul("a", [ligne(`T_{${e.n}}=3^{${e.n}}=${ent(trianglesS(e))}`)]),
    calcul("b", [ligne(`A_{${e.n}}=${e.A0}\\cdot\\left(\\dfrac{3}{4}\\right)^{${e.n}}=${ent(aireS(e))}`)]),
    calcul("c", [ligne(`P_0=3\\cdot ${e.c}=${3 * e.c}`), ligne(`P_{${e.n}}=${3 * e.c}\\cdot\\left(\\dfrac{3}{2}\\right)^{${e.n}}=${ent(perimS(e))}`)]),
    resultat("d", [t("Raison "), l("\\dfrac{3}{4}<1"), t(" : l'aire tend vers 0 ; raison "), l("\\dfrac{3}{2}>1"), t(" : le périmètre tend vers "), l("+\\infty"), t(".")]),
    piege("b", [t("Donner l'aire d'un seul petit triangle au lieu de l'aire totale.")]),
  ];
}

export const DEFINITION_FRACTALES: DefinitionEcrans<ExerciceFractale, PhaseFractale> = {
  phases: phasesFractale,
  estChoix: (_e, p) => p === "limitePerimetre" || p === "limites",
  mode,
  libelle: (e, p) => ({ nombre: e.famille56 === "koch" ? "Nombre de côtés" : "Nombre de triangles", perimetre: "Périmètre", aire: "Aire", limitePerimetre: "Limite du périmètre", aireLimite: "Aire limite", limites: "Limites" })[p],
  consigneGenerale,
  figure: (e) => figureFractale(e),
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege: piegeFractale,
  messageIllisible: () => "Écris un nombre (entier, décimal ou fraction comme 8/5). Cette saisie ne compte pas comme une tentative.",
  reponseAttendue,
  recap: (e, p) => reponseAttendue(e, p),
  aidesChoixDeuxNiveaux: true,
  piegeChoixRevele: true,
  bonneOption: () => "o0",
  correction,
};

export const adaptateurFractales = adaptateurEcrans56<ExerciceFractale, PhaseFractale>({
  def: DEFINITION_FRACTALES,
  titreDocument: "Fractales et suites — Évaluation",
  nomFichierBase: "fractales-suites",
  catalogue: CATALOGUE_FRACTALES,
  genererLibre: genererFractale,
  genererVariante: varianteFractale,
  figurePapier: figureFractale,
  consignePapier,
  reponseBreve: (e) =>
    e.famille56 === "koch"
      ? [...reponseAttendue(e, "nombre"), t(" ; "), ...reponseAttendue(e, "perimetre"), t(" ; périmètre → "), l("+\\infty"), t(" ; aire → "), l("\\dfrac{8}{5}A_0")]
      : [...reponseAttendue(e, "nombre"), t(" ; "), ...reponseAttendue(e, "aire"), t(" ; "), ...reponseAttendue(e, "perimetre"), t(" ; aire → 0, périmètre → "), l("+\\infty")],
  critere: (e, p) => {
    if (p === "limitePerimetre" || p === "limites") return { points: 1, critere: [t("Limite(s) justifiée(s) par la raison de la suite géométrique")] };
    if (p === "aireLimite") return { points: 1.5, critere: [t("Somme infinie des aires ajoutées : "), l("\\dfrac{8}{5}A_0")] };
    return { points: e.famille56 === "koch" ? 0.75 : 1, critere: [t(`${p === "nombre" ? "Nombre" : p === "aire" ? "Aire" : "Périmètre"} à l'étape ${e.n} : `), ...reponseAttendue(e, p)] };
  },
  erreursFrequentes: (e) =>
    e.famille56 === "koch"
      ? [{ description: [t("Aire limite infinie « comme le périmètre »")], cout: "0 pt sur l'aire limite" }, { description: [t("Nombre de côtés augmenté de 4 au lieu d'être multiplié par 4")], cout: "0 pt sur l'étape 1" }]
      : [{ description: [t("Aire d'un seul petit triangle au lieu de l'aire totale")], cout: "0 pt sur l'aire" }],
  criteres: () => ({ methode: 1, piege: 1, nombres: 0, sansCharge: true }),
  profil: (e) => ({ casParticulier: null, forme: e.famille56 }),
});
