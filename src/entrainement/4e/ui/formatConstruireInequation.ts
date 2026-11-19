import { latex, texte } from "../../export/corrigeTableau";
import type { ExerciceConstruireInequation } from "../core/construireInequation.types";
import { ensembleDonne, symbolePour, trinome } from "../generateurs/construireInequation";
import { ensembleLatex, nombreLatex, symboleLatex } from "../moteur/algebreTransfertSecondDegre";
import type { EcranTSD, Fragments } from "./ecransTransfertSecondDegre";
import { polynome } from "./corrigeChapitre3";

/**
 * Textes et écrans de gen120 (« Construire une inéquation ou une équation à partir de sa
 * solution »). Source unique pour l'écran, les aides, le papier et le corrigé.
 */

type E = ExerciceConstruireInequation;

export const CONSIGNE_GENERALE = "On connaît l'ensemble des solutions : retrouve une (in)équation du second degré qui l'a pour solution.";

/** `x-3`, `x+\dfrac{1}{2}`, `x`. */
export function facteur(r: number): string {
  if (Math.abs(r) < 1e-12) return "x";
  return r > 0 ? `x-${nombreLatex(r)}` : `x+${nombreLatex(-r)}`;
}

/** Forme factorisée k(x − r₁)(x − r₂) en LaTeX (k = 1 : sans coefficient). */
export function formeFactorisee(e: E, k: number): string {
  const p = k === 1 ? "" : k === -1 ? "-" : String(k);
  const f1 = facteur(e.r1);
  const f2 = facteur(e.r2);
  return `${p}${f1 === "x" ? "x" : `(${f1})`}${f2 === "x" ? "x" : `(${f2})`}`;
}

/** Une (in)équation juste avec le coefficient de tête k. */
export function relationExemple(e: E, k: number): string {
  return `${polynome(trinome(e, k))}${symboleLatex(symbolePour(e, k))}0`;
}

export function ensembleTexteLatex(e: E): string {
  return `{S=${ensembleLatex(ensembleDonne(e))}}`;
}

export function aLatex(k: number): string {
  return `a=${nombreLatex(k)}`;
}

export function libelleRelation(e: E): string {
  return e.variante === "equation" ? "équation" : "inéquation";
}

export function ecrans(e: E): EcranTSD[] {
  const S = ensembleDonne(e);
  const sorte = e.variante === "equation" ? "equation" : "inequation";
  const nom = libelleRelation(e);
  const forme = e.variante === "equation" ? "ax^2+bx+c=0" : "ax^2+bx+c\\lozenge 0";
  const aidesSigne: Fragments[] =
    e.variante === "equation"
      ? [
          [texte("Les solutions d'une équation du second degré sont les racines du trinôme : il s'écrit "), latex("{a(x-x_1)(x-x_2)}"), texte(".")],
          [texte("Avec a = 1, développe le produit ; avec une fraction parmi les racines, choisis a pour supprimer le dénominateur.")],
        ]
      : [
          [texte("Les bornes finies de S sont les racines du trinôme : il s'écrit "), latex("{a(x-x_1)(x-x_2)}"), texte(".")],
          [texte("Avec a > 0, le trinôme est négatif entre ses racines et positif à l'extérieur. Bornes incluses : symbole large.")],
        ];
  const b3 = -e.a3 * (e.r1 + e.r2);
  const c3 = e.a3 * e.r1 * e.r2;
  const k1 = e.den;
  return [
    {
      type: "champs",
      titre: `Une ${nom}`,
      consigne: [texte(`Écris une ${nom} du second degré, de la forme `), latex(forme), texte(", dont l'ensemble des solutions est "), latex(`${ensembleTexteLatex(e)}\\text{.}`)],
      champs: [{ type: "relation", id: "rel1", libelle: [texte(`Ton ${nom} :`)], variable: "x", ensemble: S, sorte, messageSiFaux: "Pars des racines, puis choisis le symbole." }],
      aides: aidesSigne,
      reponse: [texte("Par exemple "), latex(relationExemple(e, k1)), texte(` (toute ${nom} de même solution est juste).`)],
    },
    {
      type: "champs",
      titre: "Avec a imposé",
      consigne: [texte(`Écris maintenant une ${nom} de même solution `), latex(`${ensembleTexteLatex(e)}\\text{,}`), texte(" de la forme "), latex(forme), texte(" avec "), latex(`${aLatex(e.aImpose)}\\text{.}`)],
      champs: [{ type: "relation", id: "rel2", libelle: [texte(`Ton ${nom} :`)], variable: "x", ensemble: S, sorte, coefA: e.aImpose, messageSiFaux: "Multiplie le trinôme par la bonne constante et vérifie le symbole." }],
      aides: [
        [texte("Le trinôme s'écrit "), latex(`${nombreLatex(e.aImpose)}(x-x_1)(x-x_2)`), texte(" : développe-le.")],
        e.variante === "equation"
          ? [texte("Multiplier les deux membres d'une équation par un nombre non nul ne change pas ses solutions.")]
          : [texte("Multiplier les deux membres d'une inéquation par un nombre négatif change le sens du symbole.")],
      ],
      reponse: [latex(relationExemple(e, e.aImpose))],
    },
    {
      type: "champs",
      titre: "Un point de la parabole",
      consigne: [
        texte("La parabole d'équation "),
        latex("y=ax^2+bx+c"),
        texte(" coupe l'axe des x en "),
        latex(`x=${nombreLatex(e.r1)}`),
        texte(" et en "),
        latex(`x=${nombreLatex(e.r2)}\\text{,}`),
        texte(" et elle passe par le point "),
        latex(`P(${nombreLatex(e.x0)}\\,;${nombreLatex(e.y0)})\\text{.}`),
        texte(" Détermine a, b et c."),
      ],
      champs: [
        {
          type: "nombre",
          id: "a",
          libelle: [latex("a=")],
          cible: e.a3,
          pieges: [
            { valeur: -e.a3, message: "Attention au signe : calcule chaque facteur $(x_0-x_1)$ et $(x_0-x_2)$ avec ses parenthèses." },
            ...(Math.abs((e.x0 + e.r1) * (e.x0 + e.r2)) > 1e-9 ? [{ valeur: e.y0 / ((e.x0 + e.r1) * (e.x0 + e.r2)), message: "Le facteur s'écrit $(x-x_1)$ : remplace x par $x_0$ et soustrais la racine." }] : []),
          ].filter((p) => Math.abs(p.valeur - e.a3) > 1e-9),
          messageSiFaux: "Remplace x et y par les coordonnées de P dans $y=a(x-x_1)(x-x_2)$.",
        },
        { type: "nombre", id: "b", libelle: [latex("b=")], cible: b3, pieges: Math.abs(b3) > 1e-9 ? [{ valeur: -b3, message: "Développe : $a(x-x_1)(x-x_2)=ax^2-a(x_1+x_2)x+ax_1x_2$ ; attention au signe de b." }] : [], messageSiFaux: "Développe $a(x-x_1)(x-x_2)$ avec la valeur de a trouvée." },
        { type: "nombre", id: "c", libelle: [latex("c=")], cible: c3, pieges: [], messageSiFaux: "c est le terme constant : $a\\cdot x_1\\cdot x_2$." },
      ],
      aides: [
        [texte("Écris "), latex("{y=a(x-x_1)(x-x_2)}"), texte(" et remplace x et y par les coordonnées de P : il reste une équation en a.")],
        [texte("Puis développe "), latex(`a${formeFactorisee(e, 1)}`), texte(" avec la valeur de a trouvée, pour lire b et c.")],
      ],
      reponse: [latex(`a=${nombreLatex(e.a3)}`), texte(", "), latex(`b=${nombreLatex(b3)}`), texte(", "), latex(`c=${nombreLatex(c3)}`)],
    },
  ];
}

/** Exemples de réponses justes (tests). */
export function exemplesRelation(e: E): Record<string, string> {
  const s = (k: number) => {
    const sy = symbolePour(e, k);
    const t = sy === "≤" ? "<=" : sy === "≥" ? ">=" : sy;
    const r = (v: number) => (Number.isInteger(v) ? `(${v})` : `(${Math.round(v * e.den)}/${e.den})`);
    return `${k}(x-${r(e.r1)})(x-${r(e.r2)})${t}0`;
  };
  return { rel1: s(1), rel2: s(e.aImpose) };
}
