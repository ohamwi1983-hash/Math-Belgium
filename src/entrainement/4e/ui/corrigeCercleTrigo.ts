import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { calculerAnglePremierQuadrant, calculerQuadrant } from "../generateurs/cercleTrigonometrique/quadrantCalculs";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import { finaliserCorrige as finaliserSecondDegre } from "./corrigeSecondDegre1";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 5 de 4e (« Cercle
 * trigonométrique & triangles quelconques »), moitié 1 : gen14 (placement et lecture), gen15
 * (valeurs remarquables), gen16 (l'un sans l'autre), gen17 (angles associés), gen18 (quel angle ?),
 * gen76 (valeur exacte), gen78 (équations à transformer), gen79 (rotations en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ».
 *
 * Angles en DEGRÉS (le radian n'est pas enseigné en 4e : `deg`, `lignesReduction`). Une transformation par ligne, égalités toujours VRAIES (réduction :
 * une chaîne qui s'arrête à l'angle brut, puis une seconde qui retire / ajoute les tours), « − »
 * typographique (LaTeX « - »), virgule décimale `{,}`, valeurs remarquables exactes (`\dfrac`, √
 * simplifiées). Aucune dépendance à `docx` (importé par les générateurs interactifs).
 */

export type Fragments = FragmentConsigne[];
export type FonctionTrigo = "sin" | "cos" | "tan";

/** Renvois au cours (sections numérotées de `cercle-trigonometrique-triangles.ts`). */
export const COURS_CERCLE = "(cours, point 1)";
export const COURS_IDENTITE = "(cours, point 2)";
export const COURS_REMARQUABLES = "(cours, point 3)";
export const COURS_ASSOCIES = "(cours, point 4)";
export const COURS_EQUATIONS = "(cours, point 5)";

/** Formules des justifications et des résultats rédigés groupées `{…}` (insécables), comme au ch. 2. */
export const finaliserCorrige = finaliserSecondDegre;

// ---------------------------------------------------------------------------------------------
// Nombres et angles
// ---------------------------------------------------------------------------------------------

function propre(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

/** Nombre en LaTeX : virgule décimale, au plus `decimales` décimales. */
export function nombreLatex(v: number, decimales = 4): string {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return String(r === 0 ? 0 : r).replace(".", "{,}");
}

/** Angle en degrés : « 240^\circ », « -120^\circ », « 23{,}6^\circ ». */
export function deg(a: number, decimales = 4): string {
  return `${nombreLatex(a, decimales)}^\\circ`;
}

/** Angle en degrés dans une justification : « 240° », « −120° ». */
export function degTexte(a: number): string {
  return `${String(propre(a)).replace(".", ",").replace("-", "−")}°`;
}

/** Fraction ou entier exact en LaTeX (`\dfrac`). */
function fracLatex(n: number, d: number): string {
  const g = pgcd(n, d);
  const [p, q] = [n / g, d / g];
  if (q === 1) return `${p}`;
  return `${p < 0 ? "-" : ""}\\dfrac{${Math.abs(p)}}{${q}}`;
}

export function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** `\frac` → `\dfrac` (formules d'une table de l'écran recopiées dans le corrigé). */
export function dfrac(l: string): string {
  return l.replace(/\\frac/g, "\\dfrac");
}

// ---------------------------------------------------------------------------------------------
// Réduction d'un angle (même point du cercle)
// ---------------------------------------------------------------------------------------------

/** Nombre de tours à AJOUTER pour ramener `angle` dans [0° ; 360°[ (ou ]−180° ; 180°]). */
export function toursAjoutes(angle: number, intervalle: "0-360" | "-180-180" = "0-360"): number {
  if (intervalle === "0-360") return -Math.floor(angle / 360);
  return -Math.ceil((angle - 180) / 360);
}

export function angleReduit(angle: number, intervalle: "0-360" | "-180-180" = "0-360"): number {
  return propre(angle + 360 * toursAjoutes(angle, intervalle));
}

/**
 * Réduction ligne à ligne : « −480° + 2 × 360° = −480° + 720° », « = 240° » (un seul tour : une ligne
 * « −120° + 360° = 240° »), puis l'encadrement qui vérifie l'intervalle. Vide si l'angle y est déjà.
 */
export function lignesReduction(angle: number, intervalle: "0-360" | "-180-180" = "0-360"): LigneCalcul[] {
  const k = toursAjoutes(angle, intervalle);
  if (k === 0) return [];
  const r = angleReduit(angle, intervalle);
  const n = Math.abs(k);
  const op = k > 0 ? "+" : "-";
  const verbe = k > 0 ? "on ajoute" : "on retire";
  const lignes: LigneCalcul[] =
    n === 1
      ? [ligne(`${deg(angle)}${op}360^\\circ=${deg(r)}`, `${verbe} un tour : même point du cercle`)]
      : [ligne(`${deg(angle)}${op}${n}\\times 360^\\circ=${deg(angle)}${op}${deg(360 * n)}`, `${verbe} ${n} tours : même point du cercle`), ligne(`=${deg(r)}`)];
  lignes.push(intervalle === "0-360" ? ligne(`0^\\circ\\leq ${deg(r)}<360^\\circ`, "l'angle est bien dans [0° ; 360°[") : ligne(`-180^\\circ<${deg(r)}\\leq 180^\\circ`, "l'angle est bien dans ]−180° ; 180°]"));
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// Quadrant, angle du premier quadrant, signes, axes
// ---------------------------------------------------------------------------------------------

export function quadrantDe(angleReduitDeg: number): Quadrant {
  return calculerQuadrant(angleReduitDeg);
}

export function estSurUnAxe(q: Quadrant): boolean {
  return q === "axeOx" || q === "axeOy";
}

const BORNES: Record<"I" | "II" | "III" | "IV", [number, number]> = { I: [0, 90], II: [90, 180], III: [180, 270], IV: [270, 360] };

/** « 180° < 240° < 270° » (quadrant III), ou « 180° = 2 × 90° » (sur un axe). */
export function ligneQuadrant(r: number): LigneCalcul {
  const q = quadrantDe(r);
  if (q === "axeOx" || q === "axeOy") {
    const k = r / 90;
    const ou = { 0: "à droite", 90: "en haut", 180: "à gauche", 270: "en bas" }[r] ?? "";
    return ligne(k === 0 ? "0^\\circ=0\\times 90^\\circ" : k === 1 ? "90^\\circ=1\\times 90^\\circ" : `${deg(r)}=${k}\\times 90^\\circ`, `multiple de 90° : sur l'axe ${q === "axeOx" ? "Ox" : "Oy"}, ${ou}`);
  }
  const [a, b] = BORNES[q];
  return ligne(`${deg(a)}<${deg(r)}<${deg(b)}`, `entre ${a}° et ${b}° : quadrant ${q}`);
}

export function anglePremierQuadrant(r: number): number {
  return calculerAnglePremierQuadrant(r, quadrantDe(r));
}

/** Calcul de l'angle du premier quadrant (angle de référence) : une ligne. */
export function lignesAnglePremierQuadrant(r: number): LigneCalcul[] {
  const q = quadrantDe(r);
  const a = anglePremierQuadrant(r);
  switch (q) {
    case "I":
      return [ligne(`0^\\circ<${deg(r)}<90^\\circ`, "déjà dans le premier quadrant : c'est lui-même")];
    case "II":
      return [ligne(`180^\\circ-${deg(r)}=${deg(a)}`, "quadrant II : 180° − θ")];
    case "III":
      return [ligne(`${deg(r)}-180^\\circ=${deg(a)}`, "quadrant III : θ − 180°")];
    case "IV":
      return [ligne(`360^\\circ-${deg(r)}=${deg(a)}`, "quadrant IV : 360° − θ")];
    default:
      return [ligne(`${deg(r)}=${r / 90}\\times 90^\\circ`, "sur un axe")];
  }
}

/** Retour à θ depuis l'angle du premier quadrant (vérification d'un calcul d'angle de référence). */
export function ligneRetourDepuisReference(r: number): LigneCalcul | null {
  const q = quadrantDe(r);
  const a = anglePremierQuadrant(r);
  if (q === "II") return ligne(`180^\\circ-${deg(a)}=${deg(r)}`);
  if (q === "III") return ligne(`180^\\circ+${deg(a)}=${deg(r)}`);
  if (q === "IV") return ligne(`360^\\circ-${deg(a)}=${deg(r)}`);
  return null;
}

/** Signe de sin, cos ou tan en l'angle réduit `r` (0 sur un axe, `null` : tan non définie). */
export function signeDe(f: FonctionTrigo, r: number): 1 | -1 | 0 | null {
  const q = quadrantDe(r);
  if (q === "axeOx") return f === "cos" ? (r === 0 ? 1 : -1) : 0;
  if (q === "axeOy") return f === "sin" ? (r === 90 ? 1 : -1) : f === "cos" ? 0 : null;
  if (f === "sin") return q === "I" || q === "II" ? 1 : -1;
  if (f === "cos") return q === "I" || q === "IV" ? 1 : -1;
  return q === "I" || q === "III" ? 1 : -1;
}

export function fonctionLatex(f: FonctionTrigo, r: number, decimales = 4): string {
  return r < 0 ? `\\${f}(${deg(r, decimales)})` : `\\${f} ${deg(r, decimales)}`;
}

const POSITION_SIN: Record<string, string> = { "1": "M au-dessus de l'axe Ox : ordonnée positive", "-1": "M sous l'axe Ox : ordonnée négative" };
const POSITION_COS: Record<string, string> = { "1": "M à droite de l'axe Oy : abscisse positive", "-1": "M à gauche de l'axe Oy : abscisse négative" };

/** Les trois signes, une ligne chacun (angle réduit hors axe). */
export function lignesSignes(r: number): LigneCalcul[] {
  const s = signeDe("sin", r) as 1 | -1;
  const c = signeDe("cos", r) as 1 | -1;
  const rel = (v: number) => (v > 0 ? ">0" : "<0");
  return [
    ligne(`${fonctionLatex("sin", r)}${rel(s)}`, POSITION_SIN[String(s)]),
    ligne(`${fonctionLatex("cos", r)}${rel(c)}`, POSITION_COS[String(c)]),
    ligne(`${fonctionLatex("tan", r)}${rel(s * c)}`, s === c ? "quotient de deux nombres de même signe" : "quotient de deux nombres de signes contraires"),
  ];
}

/** Valeurs exactes sur un axe : coordonnées de M, puis cos, sin, tan (ou tan non définie). */
export function lignesValeursAxe(r: number): LigneCalcul[] {
  const c = signeDe("cos", r) as number;
  const s = signeDe("sin", r) as number;
  const lignes: LigneCalcul[] = [
    ligne(`${fonctionLatex("cos", r)}=${c}`, "abscisse de M"),
    ligne(`${fonctionLatex("sin", r)}=${s}`, "ordonnée de M"),
  ];
  if (c === 0) {
    lignes.push(ligne(`${fonctionLatex("tan", r)}=\\dfrac{${fonctionLatex("sin", r)}}{${fonctionLatex("cos", r)}}`, [texte("dénominateur nul : "), latex(fonctionLatex("tan", r)), texte(" n'existe pas")]));
  } else {
    lignes.push(ligne(`${fonctionLatex("tan", r)}=\\dfrac{${fonctionLatex("sin", r)}}{${fonctionLatex("cos", r)}}`, "définition de la tangente"), ligne(`=\\dfrac{0}{${c}}`), ligne("=0"));
  }
  return lignes;
}

/** « Ce qu'on utilise » des valeurs sur un axe. */
export function utiliseAxe(): Fragments {
  return [
    texte(`Sur un axe, M(θ) est l'un des points (1 ; 0), (0 ; 1), (−1 ; 0) ou (0 ; −1) : cos θ est son abscisse, sin θ son ordonnée, puis `),
    latex("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"),
    texte(` ${COURS_CERCLE}.`),
  ];
}

// ---------------------------------------------------------------------------------------------
// Valeurs remarquables et angles associés
// ---------------------------------------------------------------------------------------------

const VALEURS: Record<FonctionTrigo, Record<number, string | null>> = {
  sin: { 0: "0", 30: "\\dfrac{1}{2}", 45: "\\dfrac{\\sqrt{2}}{2}", 60: "\\dfrac{\\sqrt{3}}{2}", 90: "1" },
  cos: { 0: "1", 30: "\\dfrac{\\sqrt{3}}{2}", 45: "\\dfrac{\\sqrt{2}}{2}", 60: "\\dfrac{1}{2}", 90: "0" },
  tan: { 0: "0", 30: "\\dfrac{\\sqrt{3}}{3}", 45: "1", 60: "\\sqrt{3}", 90: null },
};

/** Valeur remarquable (positive) en l'angle du premier quadrant `ref` ; `null` : tan 90°. */
export function valeurRemarquableLatex(f: FonctionTrigo, ref: number): string | null {
  return VALEURS[f][ref] ?? null;
}

/** Valeur exacte signée de f(r) (r réduit, angle de référence remarquable). */
export function valeurExacteLatex(f: FonctionTrigo, r: number): string | null {
  const s = signeDe(f, r);
  if (s === null) return null;
  if (s === 0) return "0";
  const v = valeurRemarquableLatex(f, anglePremierQuadrant(r));
  return v === null ? null : s === -1 ? `-${v}` : v;
}

const NOM_FONCTION: Record<FonctionTrigo, string> = { sin: "sinus", cos: "cosinus", tan: "tangente" };

/** f(θ) = ± f(réf) = valeur : signe donné par le quadrant, valeur absolue par la table. */
export function lignesValeurAssociee(f: FonctionTrigo, r: number): LigneCalcul[] {
  const q = quadrantDe(r);
  const ref = anglePremierQuadrant(r);
  const v = valeurExacteLatex(f, r) ?? "";
  if (q === "I") return [ligne(`${fonctionLatex(f, r)}=${v}`, "valeur remarquable")];
  const s = signeDe(f, r);
  const nom = NOM_FONCTION[f];
  const fem = f === "tan";
  const genre = (positif: boolean) => (positif ? (fem ? "positive" : "positif") : fem ? "négative" : "négatif");
  return [
    ligne(`${fonctionLatex(f, r)}=${s === -1 ? "-" : ""}${fonctionLatex(f, ref)}`, `quadrant ${q} : ${fem ? "la" : "le"} ${nom} y est ${genre(s === 1)}`),
    ligne(`=${v}`, "valeur remarquable"),
  ];
}

/** Nom de la relation entre θ (réduit) et son angle du premier quadrant. */
export function relationAssociee(q: Quadrant): string {
  return q === "II" ? "supplémentaire" : q === "III" ? "anti-supplémentaire" : q === "IV" ? "opposé" : "";
}

/** Préfixes des deux candidats en fonction de α₀ (même construction que gen18 et gen78). */
export function prefixesCandidats(f: FonctionTrigo, positif: boolean): [string, string] {
  switch (f) {
    case "sin":
      return positif ? ["", "180^\\circ-"] : ["180^\\circ+", "360^\\circ-"];
    case "cos":
      return positif ? ["", "360^\\circ-"] : ["180^\\circ-", "180^\\circ+"];
    case "tan":
      return positif ? ["", "180^\\circ+"] : ["180^\\circ-", "360^\\circ-"];
  }
}

/** Quadrants des deux candidats (texte d'une justification). */
export function quadrantsCandidats(f: FonctionTrigo, positif: boolean): [string, string] {
  const t: Record<FonctionTrigo, [[string, string], [string, string]]> = {
    sin: [["quadrant I", "quadrant II"], ["quadrant III", "quadrant IV"]],
    cos: [["quadrant I", "quadrant IV"], ["quadrant II", "quadrant III"]],
    tan: [["quadrant I", "quadrant III"], ["quadrant II", "quadrant IV"]],
  };
  return t[f][positif ? 0 : 1];
}

/** Valeur d'un candidat (degrés) à partir de α₀, ramenée dans [0° ; 360°[. */
export function valeurCandidat(prefixe: string, ref: number): number {
  const v = prefixe === "" ? ref : prefixe.startsWith("180^\\circ+") ? 180 + ref : prefixe.startsWith("180") ? 180 - ref : 360 - ref;
  return propre(((v % 360) + 360) % 360);
}

/** Valeur brute d'un candidat (avant de retirer un tour éventuel : 360° − 0° = 360°). */
export function valeurCandidatBrute(prefixe: string, ref: number): number {
  return prefixe === "" ? ref : prefixe.startsWith("180^\\circ+") ? 180 + ref : prefixe.startsWith("180") ? 180 - ref : 360 - ref;
}

/** Ligne « |k| = … » quand k est négatif (on cherche l'angle de référence sur la valeur absolue). */
export function ligneValeurAbsolue(kLatex: string, absLatex: string): LigneCalcul | null {
  return kLatex.startsWith("-") ? ligne(`\\left|${kLatex}\\right|=${absLatex}`, "on cherche l'angle du premier quadrant sur la valeur absolue") : null;
}

/** Fraction exacte p/q en LaTeX (signe devant). */
export function fractionLatex(n: number, d: number): string {
  return fracLatex(n, d);
}

/** Étapes groupées par lettre : utilitaire des collecteurs / appli (lettres présentes, dans l'ordre). */
export function lettresDuCorrige(etapes: EtapeCorrection[]): string[] {
  return [...new Set(etapes.map((e) => e.sousQuestion).filter((l): l is string => !!l))];
}

function normaliser(l: string): string {
  return l.replace(/\\dfrac|\\tfrac/g, "\\frac").replace(/\\left|\\right/g, "").replace(/\s+/g, "");
}

/** Ajoute « = finale » (forme de l'écran) sauf si la dernière ligne y arrive déjà. */
export function avecFinale(lignes: LigneCalcul[], finale: string, justification?: string | Fragments): LigneCalcul[] {
  const der = lignes[lignes.length - 1];
  if (der) {
    const i = der.latex.lastIndexOf("=");
    if (i >= 0 && normaliser(der.latex.slice(i + 1)) === normaliser(finale)) return lignes;
  }
  return [...lignes, ligne(`=${finale}`, justification)];
}

/** Les deux candidats α₁, α₂ (ou la solution unique), une ligne chacun. */
export function lignesCandidats(f: "sin" | "cos" | "tan", ref: number, positif: boolean, nom = "\\alpha"): LigneCalcul[] {
  const pref = prefixesCandidats(f, positif);
  const quad = quadrantsCandidats(f, positif);
  const vals = pref.map((p) => valeurCandidatBrute(p, ref));
  const norm = vals.map((v) => ((v % 360) + 360) % 360);
  if (norm[0] === norm[1]) {
    return [ligne(`${nom}=${deg(norm[0]!)}`, `les deux candidats ${vals[0]}° et ${pref[1]!.replace("^\\circ", "°").replace("-", " − ").replace("+", " + ")}${ref}° = ${vals[1]}° donnent le même point du cercle : une seule solution`)];
  }
  return pref.map((p, i) =>
    p === ""
      ? ligne(`${nom}_${i + 1}=${deg(ref)}`, ref === 0 || ref === 90 ? "point sur un axe" : "l'angle de référence lui-même (quadrant I)")
      : ligne(`${nom}_${i + 1}=${p}${deg(ref)}=${deg(vals[i]!)}`, ref === 0 || ref === 90 ? "point sur un axe" : quad[i]!),
  );
}
