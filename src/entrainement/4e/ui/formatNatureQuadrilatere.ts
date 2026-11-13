import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceNatureQuadrilatere, NatureQuadrilatere } from "../core/natureQuadrilatere.types";
import type { Composantes, Point } from "../core/vecteur.types";
import {
  angleDroitEnB,
  cotesConsecutifsEgaux,
  critereABBC,
  estParallelogramme,
  natureDe,
  normeCarree,
  vecAB,
  vecBC,
  vecCD,
  vecDC,
} from "../moteur/modeleNatureQuadrilatere";
import { formatLongueurIrreductibleLatex } from "./formatNormeDistance";

/**
 * Textes de gen84 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; notation du chapitre : `\vec{AB}`, composantes en colonne, points `A(x\,;\,y)`, norme
 * `\|\vec{AB}\|`. Les aides ne donnent jamais le résultat : il reste toujours un calcul à faire.
 */

export const TITRES_ECRANS_PARALLELOGRAMME = ["Parallélogramme ?", "Deux côtés consécutifs", "Un angle droit ?", "Nature de ABCD"];
export const TITRES_ECRANS_QUATRIEME = ["Le point D", "Deux côtés consécutifs", "Un angle droit ?", "Nature de ABCD"];

export function titresEcrans(e: ExerciceNatureQuadrilatere): string[] {
  return e.variante === "quatrieme" ? TITRES_ECRANS_QUATRIEME : TITRES_ECRANS_PARALLELOGRAMME;
}

// ---------------------------------------------------------------------------------------------
// Briques LaTeX
// ---------------------------------------------------------------------------------------------

export function nombreLatex(n: number): string {
  const arrondi = Math.round(n * 1e9) / 1e9;
  return String(arrondi === 0 ? 0 : arrondi).replace(".", "{,}");
}

/** Facteur d'un produit ou terme soustrait : négatif entre parenthèses. */
function facteur(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

export function pointLatex(nom: string, p: Point): string {
  return `${nom}(${nombreLatex(p.x)}\\,;\\,${nombreLatex(p.y)})`;
}

export function colonneLatex(v: Composantes): string {
  return `\\begin{pmatrix} ${nombreLatex(v.x)} \\\\ ${nombreLatex(v.y)} \\end{pmatrix}`;
}

export function vecLatex(nom: string): string {
  return `\\vec{${nom}}`;
}

export function normeLatex(nom: string): string {
  return `\\|\\vec{${nom}}\\|`;
}

/** √(carré) simplifiée (entier si carré parfait, sinon m√k). */
export function racineLatex(carre: number): string {
  return formatLongueurIrreductibleLatex(carre);
}

/** `\vec{AB} = (x_B − x_A ; y_B − y_A)` substitué, non calculé. */
export function composantesSubstitueesLatex(origine: Point, extremite: Point): string {
  return `\\begin{pmatrix} ${nombreLatex(extremite.x)} - ${facteur(origine.x)} \\\\ ${nombreLatex(extremite.y)} - ${facteur(origine.y)} \\end{pmatrix}`;
}

export function normeSubstitueeLatex(v: Composantes): string {
  return `\\sqrt{${facteur(v.x)}^2 + ${facteur(v.y)}^2}`;
}

export function critereSubstitueLatex(u: Composantes, v: Composantes): string {
  return `${facteur(u.x)} \\cdot ${facteur(v.x)} + ${facteur(u.y)} \\cdot ${facteur(v.y)}`;
}

export const LATEX_CRITERE_AB_BC = "x_{AB} \\cdot x_{BC} + y_{AB} \\cdot y_{BC}";

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function consigneGenerale(e: ExerciceNatureQuadrilatere): string {
  switch (e.variante) {
    case "nature":
      return "Dans un repère orthonormé, on donne les points A, B, C et D. Quelle est la nature du quadrilatère ABCD ?";
    case "quatrieme":
      return "Dans un repère orthonormé, on donne les points A, B et C. Trouve le point D pour que ABCD soit un parallélogramme, puis détermine la nature exacte de ce parallélogramme.";
    case "montrer":
      return `Dans un repère orthonormé, on donne les points A, B, C et D. Montre que ABCD est un ${e.affirmation === "losange" ? "losange" : "rectangle"}, puis précise s'il s'agit même d'un carré.`;
  }
}

/** Liste des points donnés (D absent pour la variante « quatrième sommet »). */
export function donneesFragments(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  const points: [string, Point][] = [
    ["A", e.A],
    ["B", e.B],
    ["C", e.C],
  ];
  if (e.variante !== "quatrieme") points.push(["D", e.D]);
  return points.flatMap(([nom, p], i) => [...(i > 0 ? [texte(i === points.length - 1 ? " et " : " ; ")] : []), latex(pointLatex(nom, p))]).concat([texte(".")]);
}

export const CONSIGNE_PAPIER_NATURE = "Détermine la nature du quadrilatère ABCD (quadrilatère quelconque, parallélogramme, losange, rectangle ou carré). Justifie par des calculs vectoriels.";

export function consignesPapier(e: ExerciceNatureQuadrilatere): FragmentConsigne[][] {
  switch (e.variante) {
    case "nature":
      return [[texte(CONSIGNE_PAPIER_NATURE)]];
    case "quatrieme":
      return [
        [texte("Détermine les coordonnées du point D pour que ABCD soit un parallélogramme.")],
        [texte("Détermine la nature exacte du parallélogramme ABCD (parallélogramme, losange, rectangle ou carré). Justifie par des calculs vectoriels.")],
      ];
    case "montrer": {
      const nom = e.affirmation === "losange" ? "losange" : "rectangle";
      return [[texte(`Montre par des calculs vectoriels que ABCD est un ${nom}.`)], [texte("ABCD est-il même un carré ? Justifie.")]];
    }
  }
}

export function consignesEcrans(e: ExerciceNatureQuadrilatere): FragmentConsigne[][] {
  const ecran1: FragmentConsigne[] =
    e.variante === "quatrieme"
      ? [texte("Calcule les composantes de "), latex(vecLatex("AB")), texte(", puis les coordonnées du point D pour que ABCD soit un parallélogramme.")]
      : [texte("Parallélogramme ? Calcule les composantes de "), latex(vecLatex("AB")), texte(" et de "), latex(vecLatex("DC")), texte(".")];
  const conclusion =
    e.variante === "quatrieme"
      ? "Conclus : quelle est la nature exacte du parallélogramme ABCD ? Choisis la réponse la plus précise."
      : e.variante === "montrer"
        ? `Conclus : ABCD est-il bien un ${e.affirmation === "losange" ? "losange" : "rectangle"} ? Choisis sa nature exacte, la plus précise.`
        : "Conclus : quelle est la nature du quadrilatère ABCD ? Choisis la réponse la plus précise.";
  return [
    ecran1,
    [
      texte("Calcule les composantes de "),
      latex(vecLatex("BC")),
      texte(", puis les longueurs de deux côtés consécutifs : "),
      latex(normeLatex("AB")),
      texte(" et "),
      latex(normeLatex("BC")),
      texte("."),
    ],
    [texte("Calcule le critère d'orthogonalité des vecteurs "), latex(vecLatex("AB")), texte(" et "), latex(vecLatex("BC")), texte(".")],
    [texte(conclusion)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Natures
// ---------------------------------------------------------------------------------------------

export const OPTIONS_NATURE: { valeur: NatureQuadrilatere; libelle: string }[] = [
  { valeur: "quelconque", libelle: "Quadrilatère quelconque" },
  { valeur: "parallelogramme", libelle: "Parallélogramme" },
  { valeur: "losange", libelle: "Losange" },
  { valeur: "rectangle", libelle: "Rectangle" },
  { valeur: "carre", libelle: "Carré" },
];

export function libelleNature(n: NatureQuadrilatere): string {
  return OPTIONS_NATURE.find((o) => o.valeur === n)!.libelle;
}

/** « ABCD est un losange. » — phrase de conclusion. */
export function phraseNature(n: NatureQuadrilatere): string {
  switch (n) {
    case "quelconque":
      return "ABCD n'est pas un parallélogramme : c'est un quadrilatère quelconque (ni parallélogramme, ni losange, ni rectangle, ni carré).";
    case "parallelogramme":
      return "ABCD est un parallélogramme, ni losange ni rectangle.";
    case "losange":
      return "ABCD est un losange (pas un carré : il n'a pas d'angle droit).";
    case "rectangle":
      return "ABCD est un rectangle (pas un carré : ses côtés consécutifs n'ont pas la même longueur).";
    case "carre":
      return "ABCD est un carré : c'est à la fois un losange et un rectangle.";
  }
}

/** Message affiché quand la conclusion choisie est fausse (choix fermé, une seule tentative). */
export function messageVerdict(e: ExerciceNatureQuadrilatere, choix: NatureQuadrilatere): string {
  const attendu = natureDe(e);
  if (attendu === "quelconque") {
    if (choix === "rectangle" || choix === "carre") return "ABCD n'est pas un parallélogramme (AB et DC sont différents) : un angle droit en B ne suffit pas à en faire un rectangle.";
    if (choix === "losange") return "ABCD n'est pas un parallélogramme (AB et DC sont différents) : deux côtés consécutifs égaux ne suffisent pas à en faire un losange.";
    return "Pour un parallélogramme, il faut que AB et DC soient égaux, composante par composante : ce n'est pas le cas ici.";
  }
  if (choix === "quelconque") return "AB et DC sont égaux : ABCD est au moins un parallélogramme.";
  if (attendu === "carre") return "Deux côtés consécutifs égaux ET un angle droit : c'est un carré, la réponse la plus précise.";
  if (choix === "carre") return attendu === "losange" ? "Un losange n'est pas forcément un carré : il lui faut aussi un angle droit, et le critère ne vaut pas 0." : "Un rectangle n'est un carré que si deux côtés consécutifs ont la même longueur : ce n'est pas le cas ici.";
  if (attendu === "losange") return "Les côtés consécutifs AB et BC ont la même longueur : c'est un losange.";
  if (attendu === "rectangle") return "Le critère d'orthogonalité de AB et BC vaut 0 : il y a un angle droit en B, c'est un rectangle.";
  return "Ni côtés consécutifs égaux, ni angle droit : c'est un parallélogramme, sans plus.";
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran, après un échec) et récapitulatif de l'écran de conclusion
// ---------------------------------------------------------------------------------------------

export function reponseEcran1Latex(e: ExerciceNatureQuadrilatere): string {
  if (e.variante === "quatrieme") return `${vecLatex("AB")} = ${colonneLatex(vecAB(e))} \\quad ${pointLatex("D", e.D)}`;
  return `${vecLatex("AB")} = ${colonneLatex(vecAB(e))} \\quad ${vecLatex("DC")} = ${colonneLatex(vecDC(e))}`;
}

export function reponseEcran2Latex(e: ExerciceNatureQuadrilatere): string {
  return `${vecLatex("BC")} = ${colonneLatex(vecBC(e))} \\quad ${normeLatex("AB")} = ${racineLatex(normeCarree(vecAB(e)))} \\quad ${normeLatex("BC")} = ${racineLatex(normeCarree(vecBC(e)))}`;
}

export function reponseEcran3Latex(e: ExerciceNatureQuadrilatere): string {
  return `${critereSubstitueLatex(vecAB(e), vecBC(e))} = ${nombreLatex(critereABBC(e))}`;
}

/** Lignes du récapitulatif (valeurs seules, sans verdict) montrées sur l'écran de conclusion. */
export function recapitulatifLatex(e: ExerciceNatureQuadrilatere): string[] {
  const ligne1 = e.variante === "quatrieme" ? `${pointLatex("D", e.D)}` : `${vecLatex("AB")} = ${colonneLatex(vecAB(e))} \\text{ et } ${vecLatex("DC")} = ${colonneLatex(vecDC(e))}`;
  return [
    ligne1,
    `${normeLatex("AB")} = ${racineLatex(normeCarree(vecAB(e)))} \\text{ et } ${normeLatex("BC")} = ${racineLatex(normeCarree(vecBC(e)))}`,
    `${LATEX_CRITERE_AB_BC} = ${nombreLatex(critereABBC(e))}`,
  ];
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux par écran ; jamais le résultat)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: ExerciceNatureQuadrilatere, ecran: number): FragmentConsigne[][] {
  const ab = vecAB(e);
  switch (ecran) {
    case 0:
      if (e.variante === "quatrieme") {
        return [
          [
            texte("ABCD est un parallélogramme quand on parcourt A → B dans le même sens que D → C : "),
            latex(`${vecLatex("AB")} = ${vecLatex("DC")}`),
            texte(". Les composantes d'un vecteur se calculent ainsi : "),
            latex(`${vecLatex("AB")} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}`),
          ],
          [
            texte("D'abord "),
            latex(`${vecLatex("AB")} = ${composantesSubstitueesLatex(e.A, e.B)}`),
            texte(". Ensuite, l'égalité "),
            latex(`${vecLatex("DC")} = ${vecLatex("AB")}`),
            texte(" s'écrit, composante par composante : "),
            latex(`${nombreLatex(e.C.x)} - x_D = x_{AB} \\quad\\text{et}\\quad ${nombreLatex(e.C.y)} - y_D = y_{AB}`),
          ],
        ];
      }
      return [
        [
          texte("ABCD est un parallélogramme si et seulement si "),
          latex(`${vecLatex("AB")} = ${vecLatex("DC")}`),
          texte(" (attention à l'ordre : D vers C, pas C vers D). Les composantes d'un vecteur se calculent ainsi : "),
          latex(`${vecLatex("AB")} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}`),
        ],
        [
          texte("Remplace par les coordonnées (l'origine du vecteur est soustraite) : "),
          latex(`${vecLatex("AB")} = ${composantesSubstitueesLatex(e.A, e.B)} \\quad ${vecLatex("DC")} = ${composantesSubstitueesLatex(e.D, e.C)}`),
        ],
      ];
    case 1:
      return [
        [
          texte("Un parallélogramme est un losange quand deux côtés CONSÉCUTIFS (qui partent du même sommet) ont la même longueur. La norme d'un vecteur se calcule ainsi : "),
          latex("\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}"),
        ],
        [
          texte("Remplace par les valeurs : "),
          latex(`${vecLatex("BC")} = ${composantesSubstitueesLatex(e.B, e.C)} \\quad ${normeLatex("AB")} = ${normeSubstitueeLatex(ab)}`),
          texte(" ; calcule de même la norme de "),
          latex(vecLatex("BC")),
          texte(". Simplifie la racine si c'est possible."),
        ],
      ];
    case 2:
      return [
        [
          texte("Un parallélogramme est un rectangle quand il a un angle droit, par exemple en B. Deux vecteurs sont orthogonaux si, et seulement si, ce critère vaut 0 : "),
          latex("x_u \\cdot x_v + y_u \\cdot y_v"),
        ],
        [texte("Avec les composantes de "), latex(vecLatex("AB")), texte(" et de "), latex(vecLatex("BC")), texte(" : "), latex(critereSubstitueLatex(ab, vecBC(e)))],
      ];
    default:
      return [
        [
          texte(
            "Un losange est un parallélogramme qui a deux côtés consécutifs de même longueur ; un rectangle, un parallélogramme qui a un angle droit ; un carré est à la fois un losange et un rectangle. Choisis la nature la plus précise.",
          ),
        ],
        [
          texte(
            "Procède dans l'ordre. D'abord : AB et DC sont-ils égaux ? Sinon, ABCD n'est pas un parallélogramme, et les deux autres résultats ne prouvent rien. Si oui, regarde les longueurs de AB et BC, puis le critère.",
          ),
        ],
      ];
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé : calculs détaillés (une seule source avec l'écran)
// ---------------------------------------------------------------------------------------------

export function calculVecteurLatex(nom: string, origine: Point, extremite: Point): string {
  const v = { x: extremite.x - origine.x, y: extremite.y - origine.y };
  return `${vecLatex(nom)} = ${composantesSubstitueesLatex(origine, extremite)} = ${colonneLatex(v)}`;
}

export function calculNormeLatex(nom: string, v: Composantes): string {
  const c = normeCarree(v);
  const simplifiee = racineLatex(c);
  const etapes = [`${normeLatex(nom)} = ${normeSubstitueeLatex(v)}`, `\\sqrt{${c}}`];
  if (simplifiee !== `\\sqrt{${c}}`) etapes.push(simplifiee);
  return etapes.join(" = ");
}

export function calculCritereLatex(e: ExerciceNatureQuadrilatere): string {
  const ab = vecAB(e);
  const bc = vecBC(e);
  const second = ab.y * bc.y;
  const produits = `${nombreLatex(ab.x * bc.x)} ${second < 0 ? "-" : "+"} ${nombreLatex(Math.abs(second))}`;
  return `${LATEX_CRITERE_AB_BC} = ${critereSubstitueLatex(ab, bc)} = ${produits} = ${nombreLatex(critereABBC(e))}`;
}

export function calculQuatriemeSommetLatex(e: ExerciceNatureQuadrilatere): string {
  const ab = vecAB(e);
  return `x_D = x_C - x_{AB} = ${nombreLatex(e.C.x)} - ${facteur(ab.x)} = ${nombreLatex(e.D.x)} \\quad y_D = y_C - y_{AB} = ${nombreLatex(e.C.y)} - ${facteur(ab.y)} = ${nombreLatex(e.D.y)}`;
}

export function conclusionParallelogramme(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  if (estParallelogramme(e)) return [latex(`${vecLatex("AB")} = ${vecLatex("DC")}`), texte(" : ABCD est un parallélogramme.")];
  return [latex(`${vecLatex("AB")} \\neq ${vecLatex("DC")}`), texte(" : ABCD n'est pas un parallélogramme.")];
}

export function conclusionCotes(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  const egal = cotesConsecutifsEgaux(e);
  const base: FragmentConsigne[] = egal
    ? [latex(`${normeLatex("AB")} = ${normeLatex("BC")}`), texte(" : deux côtés consécutifs de même longueur")]
    : [latex(`${normeLatex("AB")} \\neq ${normeLatex("BC")}`), texte(" : deux côtés consécutifs de longueurs différentes")];
  if (!estParallelogramme(e)) return [...base, texte(egal ? " — mais ABCD n'étant pas un parallélogramme, ce n'est pas un losange." : ".")];
  return [...base, texte(egal ? " : le parallélogramme ABCD est un losange." : " : ce n'est pas un losange.")];
}

export function conclusionAngle(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  const droit = angleDroitEnB(e);
  const base: FragmentConsigne[] = droit
    ? [latex(`${vecLatex("AB")} \\perp ${vecLatex("BC")}`), texte(" : angle droit en B")]
    : [texte("Le critère n'est pas nul : pas d'angle droit en B")];
  if (!estParallelogramme(e)) return [...base, texte(droit ? " — mais ABCD n'étant pas un parallélogramme, ce n'est pas un rectangle." : ".")];
  return [...base, texte(droit ? " : le parallélogramme ABCD est un rectangle." : " : ce n'est pas un rectangle.")];
}

/** Ligne « Piège » ciblée sur l'instance. */
export function piegeFragments(e: ExerciceNatureQuadrilatere): { sousQuestion: string; fragments: FragmentConsigne[] } {
  const n = natureDe(e);
  if (e.variante === "quatrieme") {
    const ab = vecAB(e);
    const faux = { x: e.C.x + ab.x, y: e.C.y + ab.y };
    return {
      sousQuestion: "a",
      fragments: [
        texte("Ordre des sommets : écrire "),
        latex(`${vecLatex("AB")} = ${vecLatex("CD")}`),
        texte(" donnerait "),
        latex(pointLatex("D", faux)),
        texte(", et c'est ABDC, pas ABCD, qui serait un parallélogramme."),
      ],
    };
  }
  if (n === "quelconque") {
    if (angleDroitEnB(e)) return { sousQuestion: "d", fragments: [texte("Le critère est nul (angle droit en B), mais ABCD n'est pas un parallélogramme : conclure « rectangle » sans avoir montré le parallélogramme est faux.")] };
    if (cotesConsecutifsEgaux(e)) return { sousQuestion: "d", fragments: [texte("AB et BC ont la même longueur, mais ABCD n'est pas un parallélogramme : ce n'est pas un losange.")] };
    const cd = vecCD(e);
    return {
      sousQuestion: "a",
      fragments: [
        texte("Comparer "),
        latex(vecLatex("AB")),
        texte(" à "),
        latex(vecLatex("DC")),
        texte(", jamais à "),
        latex(`${vecLatex("CD")} = ${colonneLatex(cd)}`),
        texte(" (sens contraire) ; et des composantes « presque » égales ne suffisent pas : l'égalité doit être exacte."),
      ],
    };
  }
  switch (n) {
    case "parallelogramme":
      return {
        sousQuestion: "b",
        fragments: [texte("Pour le losange, comparer deux côtés OPPOSÉS (AB et DC) ne prouve rien : ils ont toujours la même longueur dans un parallélogramme. Il faut deux côtés consécutifs, AB et BC.")],
      };
    case "losange":
      return { sousQuestion: "d", fragments: [texte("Un losange n'est pas forcément un carré : ici le critère vaut "), latex(nombreLatex(critereABBC(e))), texte(", il n'y a pas d'angle droit.")] };
    case "rectangle":
      return { sousQuestion: "d", fragments: [texte("Un rectangle n'est un carré que si deux côtés consécutifs ont la même longueur : ici "), latex(`${normeLatex("AB")} \\neq ${normeLatex("BC")}`), texte(".")] };
    default:
      return { sousQuestion: "d", fragments: [texte("Un carré est à la fois un losange et un rectangle : il faut les DEUX tests (côtés consécutifs égaux et angle droit), après avoir montré le parallélogramme.")] };
  }
}
