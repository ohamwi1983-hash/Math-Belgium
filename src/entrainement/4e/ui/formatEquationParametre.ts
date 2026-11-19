import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceEquationParametre } from "../core/equationParametre.types";
import { deltaDe, racineDouble, valeur } from "../generateurs/equationParametre";
import { ensembleRelation, nombreLatex, type Poly2 } from "../moteur/algebreTransfertSecondDegre";
import type { EcranTSD, Fragments } from "./ecransTransfertSecondDegre";
import { figureTrinomeSvg } from "./figuresTransfertSecondDegre";
import { lineaire, polynome } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen115 (« Équation à paramètre m »). Source unique pour l'écran, les aides,
 * le papier et le corrigé. Écrans : 1. Δ(m) (expression en m, toute forme équivalente acceptée) ;
 * 2. Δ(m) = 0 : m₁ < m₂ et la racine double de (E) pour chacune ; 3. signe de Δ(m) : l'ensemble des
 * m tels que Δ(m) > 0 (puis la parabole de Δ(m)) ; 4. discussion (choix fermé, une tentative).
 */

type E = ExerciceEquationParametre;
type Affine = [number, number];

export const CONSIGNE_GENERALE = "m est un nombre réel quelconque. Discute, selon les valeurs de m, le nombre de solutions de l'équation (E), d'inconnue x.";

/** Coefficient affine en m en LaTeX : « 2m+1 », « m », « -3 ». */
export function affineLatex([k, c]: Affine): string {
  return lineaire(k, c, "m");
}

/** Terme « coefficient × partie » d'une somme : « mx^2 », « (2m+1)x », « 8 », « -x ». */
function terme([k, c]: Affine, partie: string): string | null {
  if (k === 0 && c === 0) return null;
  if (k === 0) return partie === "" ? String(c) : c === 1 ? partie : c === -1 ? `-${partie}` : `${c}${partie}`;
  if (c === 0) return `${k === 1 ? "" : k === -1 ? "-" : k}m${partie}`;
  if (partie === "") return lineaire(k, c, "m");
  // −(m + 4)x plutôt que (−m − 4)x
  return k < 0 && c < 0 ? `-(${lineaire(-k, -c, "m")})${partie}` : `(${lineaire(k, c, "m")})${partie}`;
}

/** Coefficient entre parenthèses seulement s'il le faut : « m », « 9 », « (2m+1) », « (-3) ». */
export function entreParentheses(aff: Affine): string {
  const s = affineLatex(aff);
  return /^\d+$|^m$/.test(s) ? s : `(${s})`;
}

export function equationLatex(e: E): string {
  const termes = [terme(e.a, "x^2"), terme(e.b, "x"), terme(e.c, "")].filter((t): t is string => t !== null);
  let s = "";
  for (const t of termes) s += s === "" ? t : t.startsWith("-") ? t : `+${t}`;
  return `${s}=0`;
}

export function deltaLatex(e: E): string {
  return polynome(e.delta, "m");
}

/** Ensemble des m tels que Δ(m) > 0. */
export function ensembleDeltaPositif(e: E) {
  return ensembleRelation(e.delta, ">");
}

export function figureDelta(e: E): string {
  return figureTrinomeSvg(e.delta, [e.m1, e.m2], "Δ(m)");
}

const n = nombreLatex;

/** Zones de la discussion (LaTeX) : où Δ > 0, où Δ < 0. */
export function zones(e: E): { positif: Fragments; negatif: Fragments } {
  const ext: Fragments = [latex(`{m<${n(e.m1)}}`), texte(" ou "), latex(`{m>${n(e.m2)}}`)];
  const int: Fragments = [latex(`{${n(e.m1)}<m<${n(e.m2)}}`)];
  return e.delta[0] > 0 ? { positif: ext, negatif: int } : { positif: int, negatif: ext };
}

/** Fragments « m = m₁ ou m = m₂ ». */
export function valeursDouble(e: E): Fragments {
  return [latex(`{m=${n(e.m1)}}`), texte(" ou "), latex(`{m=${n(e.m2)}}`)];
}

/** Solution de (E) pour m = 0 en `a-egal-m` (équation du premier degré b(0)x + c(0) = 0). */
export function solutionPremierDegre(e: E): number {
  return -e.c[1] / e.b[1];
}

function discussion(e: E, sorte: "juste" | "inverse" | "double-faux" | "nombres" | "oubli-zero"): Fragments {
  const z = zones(e);
  const positif = sorte === "inverse" ? z.negatif : z.positif;
  const negatif = sorte === "inverse" ? z.positif : z.negatif;
  const deux = sorte === "nombres" ? "une solution" : "deux solutions";
  const double = sorte === "double-faux" ? "aucune solution" : sorte === "nombres" ? "deux solutions" : "une racine double";
  const out: Fragments = [...positif, texte(` : ${deux}`)];
  if (e.variante === "a-egal-m" && sorte !== "oubli-zero") out.push(texte(" (sauf "), latex("m=0"), texte(" : une seule, (E) est du premier degré)"));
  out.push(texte(" ; "), ...valeursDouble(e), texte(` : ${double} ; `), ...negatif, texte(" : aucune solution."));
  return out;
}

/** Discussion juste (réponse, papier, corrigé). */
export function discussionJuste(e: E): Fragments {
  return discussion(e, "juste");
}

function melangeStable<T>(t: T[], e: E): T[] {
  let g = (Math.abs(e.delta[0] * 97 + e.delta[1] * 31 + e.delta[2] * 7 + e.m1 * 3) + 11) >>> 0;
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    g = (g * 1103515245 + 12345) % 2147483648;
    const j = Math.floor((g / 2147483648) * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}

export function ecrans(e: E): EcranTSD[] {
  const [b1, b0] = e.b;
  const signeFaux: Poly2 = (() => {
    const d = deltaDe(e.a, e.b, e.c);
    const b2: Poly2 = [b1 * b1, 2 * b1 * b0, b0 * b0];
    return [2 * b2[0] - d[0], 2 * b2[1] - d[1], 2 * b2[2] - d[2]];
  })();
  const sansDouble: Poly2 = [e.delta[0], e.delta[1] - 2 * b1 * b0, e.delta[2]];
  const piegesDelta = [
    { poly: signeFaux, message: "Attention au signe : c'est $b^2-4ac$, avec le produit $4ac$ soustrait en entier." },
    { poly: sansDouble, message: "Le carré d'une somme a un double produit : $(u+v)^2=u^2+2uv+v^2$." },
  ].filter((p) => p.poly.some((c, i) => Math.abs(c - e.delta[i]!) > 1e-9));
  const x1 = racineDouble(e, e.m1);
  const x2 = racineDouble(e, e.m2);
  const sortes = (e.variante === "a-egal-m" ? ["juste", "inverse", "double-faux", "oubli-zero"] : ["juste", "inverse", "double-faux", "nombres"]) as Parameters<typeof discussion>[1][];
  const ordre = melangeStable(sortes, e);
  const fig = figureDelta(e);
  return [
    {
      type: "champs",
      titre: "Le discriminant Δ(m)",
      consigne: [texte("Calcule le discriminant de (E) en fonction de m : "), latex("\\Delta(m)=b^2-4ac"), texte(", où a, b et c dépendent de m.")],
      champs: [{ type: "expression", id: "delta", libelle: [latex("\\Delta(m)=")], variable: "m", cible: e.delta, pieges: piegesDelta, messageSiFaux: "Remplace a, b et c par leurs expressions en m, avec des parenthèses, puis développe." }],
      aides: [
        [texte("Les coefficients de (E) sont : "), latex(`a=${affineLatex(e.a)}`), texte(", "), latex(`b=${affineLatex(e.b)}`), texte(", "), latex(`c=${affineLatex(e.c)}`), texte(".")],
        [texte("Développe chaque morceau avant de réduire : "), latex(`\\Delta(m)=${entreParentheses(e.b)}^2-4\\cdot ${entreParentheses(e.a)}\\cdot ${entreParentheses(e.c)}`)],
      ],
      reponse: [latex(`\\Delta(m)=${deltaLatex(e)}`)],
    },
    {
      type: "champs",
      titre: "Racine double",
      consigne: [texte("Résous "), latex("\\Delta(m)=0"), texte(" (avec "), latex("m_1<m_2"), texte("), puis donne la racine double de (E) pour chacune de ces valeurs.")],
      champs: [
        { type: "nombre", id: "m1", libelle: [latex("m_1=")], cible: e.m1, pieges: [{ valeur: e.m2, message: "C'est l'autre valeur : $m_1$ est la plus petite." }], messageSiFaux: "Résous l'équation du second degré $\\Delta(m)=0$, d'inconnue m." },
        { type: "nombre", id: "x1", libelle: [texte("pour "), latex("m_1"), texte(", racine double "), latex("x=")], cible: x1, pieges: x1 !== 0 ? [{ valeur: -x1, message: "La racine double vaut $-\\dfrac{b}{2a}$ : attention au signe." }] : [], messageSiFaux: "Remplace m par $m_1$ dans a et b, puis calcule $-\\dfrac{b}{2a}$." },
        { type: "nombre", id: "m2", libelle: [latex("m_2=")], cible: e.m2, pieges: [{ valeur: e.m1, message: "C'est l'autre valeur : $m_2$ est la plus grande." }], messageSiFaux: "Résous l'équation du second degré $\\Delta(m)=0$, d'inconnue m." },
        { type: "nombre", id: "x2", libelle: [texte("pour "), latex("m_2"), texte(", racine double "), latex("x=")], cible: x2, pieges: x2 !== 0 ? [{ valeur: -x2, message: "La racine double vaut $-\\dfrac{b}{2a}$ : attention au signe." }] : [], messageSiFaux: "Remplace m par $m_2$ dans a et b, puis calcule $-\\dfrac{b}{2a}$." },
      ],
      aides: [
        [texte("Δ(m) = 0 est une équation du second degré d'inconnue m : résous-la comme d'habitude.")],
        [texte("Quand Δ = 0, la racine double de (E) est : "), latex("x=-\\dfrac{b}{2a}"), texte(", avec a et b calculés pour la valeur de m.")],
      ],
      reponse: [latex(`m_1=${n(e.m1)}`), texte(" (racine double "), latex(`x=${n(x1)}`), texte(") et "), latex(`m_2=${n(e.m2)}`), texte(" (racine double "), latex(`x=${n(x2)}`), texte(")")],
    },
    {
      type: "champs",
      titre: "Le signe de Δ(m)",
      consigne: [texte("Pour quelles valeurs de m a-t-on "), latex("\\Delta(m)>0"), texte(" ?")],
      champs: [{ type: "ensemble", id: "pos", libelle: [texte("Ensemble des m tels que "), latex("\\Delta(m)>0"), texte(" :")], variable: "m", cible: ensembleDeltaPositif(e), pieges: [], messageSiFaux: "Δ(m) est un trinôme en m : il a le signe de son coefficient de m² à l'extérieur de ses racines." }],
      aides: [
        [texte("Δ(m) est un trinôme en m, de racines "), latex("m_1"), texte(" et "), latex("m_2"), texte(" : il a le signe de son coefficient de "), latex("m^2"), texte(" à l'extérieur des racines.")],
        [texte("Le coefficient de "), latex("m^2"), texte(" dans Δ(m) vaut "), latex(n(e.delta[0])), texte(e.delta[0] > 0 ? ", il est positif." : ", il est négatif.")],
      ],
      reponse: [latex(`m\\in ${ensembleLatexM(e)}`)],
      figureApres: fig,
    },
    {
      type: "choix",
      titre: "La discussion",
      consigne: [texte("Quelle est la discussion correcte du nombre de solutions de (E) ?")],
      options: ordre.map((s) => discussion(e, s)),
      bonne: ordre.indexOf("juste"),
      aides: [
        [texte("Δ > 0 : deux solutions ; Δ = 0 : une racine double ; Δ < 0 : aucune solution. Lis le signe de Δ(m) sur la parabole.")],
        ...(e.variante === "a-egal-m" ? [[texte("Pour "), latex("m=0"), texte(", le coefficient de "), latex("x^2"), texte(" est nul : (E) n'est plus du second degré.")]] : []),
      ],
      messageFaux: "Ce n'est pas la bonne discussion : relie chaque zone de m au signe de Δ(m) (parabole ci-dessous).",
      figure: fig,
    },
  ];
}

export function ensembleLatexM(e: E): string {
  const z = e.delta[0] > 0;
  return z
    ? `\\mathopen{]}-\\infty\\,;${n(e.m1)}\\mathclose{[}\\cup\\mathopen{]}${n(e.m2)}\\,;+\\infty\\mathclose{[}`
    : `\\mathopen{]}${n(e.m1)}\\,;${n(e.m2)}\\mathclose{[}`;
}

export { valeur };
