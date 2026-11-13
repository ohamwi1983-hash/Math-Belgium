import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceCasAmbigu } from "../core/casAmbigu.types";
import { resoudreSSA, type ComparaisonSinusSSA, type ResolutionSSA } from "../moteur/modeleCasAmbigu";
import { REPONSE_ARC_SANS_CANDIDAT } from "../moteur/verificationCasAmbigu";
import { nombreFrLatex } from "./nombreFr";

/**
 * Textes de gen74 (écran ET papier : une seule source). Formules toujours en LaTeX (notation du
 * cours : `\hat{A}`, côtés a, b, c), virgule décimale, aucune notation clavier. Les valeurs viennent
 * toutes de `resoudreSSA` (module pur) ; l'arrondi n'est qu'un choix d'affichage (au millième pour
 * sin B̂, au dixième de degré pour les angles, au centième pour les longueurs — précision du cours).
 */

export const TITRES_ECRANS = ["Le sinus de B̂", "Combien de candidats ?", "Tester les candidats", "Nombre de triangles", "Le côté c"];

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

function arrondi(x: number, decimales: number): number {
  const f = 10 ** decimales;
  const r = Math.round(x * f) / f;
  return r === 0 ? 0 : r;
}

function estExact(x: number, decimales: number): boolean {
  return Math.abs(arrondi(x, decimales) - x) < 1e-9;
}

/** « = 0,8 » si l'écriture est exacte, sinon « \approx 0,731 ». */
export function egalOuEnviron(x: number, decimales: number, suffixe = ""): string {
  return `${estExact(x, decimales) ? "=" : "\\approx"} ${nombreFrLatex(arrondi(x, decimales))}${suffixe}`;
}

export function sinusLatex(x: number): string {
  return nombreFrLatex(arrondi(x, 3));
}

export function angleLatex(x: number): string {
  return `${nombreFrLatex(arrondi(x, 1))}^\\circ`;
}

export function uniteLatex(e: ExerciceCasAmbigu): string {
  return `\\text{ ${e.unite}}`;
}

export function longueurLatex(e: ExerciceCasAmbigu, x: number): string {
  return `${nombreFrLatex(arrondi(x, 2))}${uniteLatex(e)}`;
}

/** Donnée de l'énoncé (exacte : entier ou une décimale). */
function donneeLatex(e: ExerciceCasAmbigu, x: number): string {
  return `${nombreFrLatex(x)}${uniteLatex(e)}`;
}

/** Nombre au format de l'écran (virgule décimale) pour les textes SVG. */
export function nombreTexteFr(x: number, decimales: number): string {
  return String(arrondi(x, decimales)).replace(".", ",");
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export const A_CHAPEAU = "\\hat{A}";
export const B_CHAPEAU = "\\hat{B}";

export const CONSIGNE_GENERALE: FragmentConsigne[] = [
  texte("Dans un triangle ABC, on connaît deux côtés et l'angle "),
  latex(A_CHAPEAU),
  texte(", opposé à l'un d'eux (chaque côté minuscule est opposé au sommet de même lettre). Le sommet B est à placer sur la demi-droite [Ax) de la figure. Combien de triangles ABC conviennent ?"),
];

export function donneesFragments(e: ExerciceCasAmbigu): FragmentConsigne[] {
  return [
    latex(`${A_CHAPEAU} = ${e.angleA}^\\circ`),
    texte(" ; "),
    latex(`b = AC = ${donneeLatex(e, e.b)}`),
    texte(" ; "),
    latex(`a = BC = ${donneeLatex(e, e.a)}`),
    texte("."),
  ];
}

/** Questions de l'énoncé PAPIER : deux vraies questions, imprimées pour toutes les issues (rien ne
 * trahit le nombre de triangles). */
export function questionsPapier(): FragmentConsigne[][] {
  return [
    [texte("Combien de triangles ABC correspondent à ces données ? Justifie par la loi des sinus.")],
    [
      texte("Pour chaque triangle obtenu, calcule la longueur "),
      latex("c = AB"),
      texte(" (au centième). S'il n'y en a aucun, calcule la plus petite longueur de BC qui en donnerait un (au centième)."),
    ],
  ];
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans (aussi titres « Étape n » du corrigé papier)
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceCasAmbigu): FragmentConsigne[][] {
  const r = resoudreSSA(e);
  return [
    [texte("Calcule "), latex(`\\sin ${B_CHAPEAU}`), texte(" par la loi des sinus (au millième, sans arrondir "), latex(`\\sin ${A_CHAPEAU}`), texte(" en cours de calcul).")],
    [texte("Compare "), latex(`\\sin ${B_CHAPEAU}`), texte(" à 1 : que peux-tu en conclure pour l'angle "), latex(B_CHAPEAU), texte(" ?")],
    consigneCandidats(r),
    [texte("Combien de triangles ABC correspondent aux données ?")],
    consigneCote(r),
  ];
}

function consigneCandidats(r: ResolutionSSA): FragmentConsigne[] {
  if (r.candidats.length === 0) {
    return [
      latex(`\\sin ${B_CHAPEAU} > 1`),
      texte(" : aucun angle n'a ce sinus, il n'y a donc aucun candidat à tester. Sur la figure, que fait l'arc de cercle de centre C et de rayon a ?"),
    ];
  }
  if (r.candidats.length === 1) {
    return [texte("Un seul angle candidat : donne "), latex(B_CHAPEAU), texte(", puis teste-le en calculant "), latex(`${A_CHAPEAU} + ${B_CHAPEAU}`), texte(" (au dixième de degré).")];
  }
  return [
    texte("Calcule les deux angles candidats "),
    latex(`${B_CHAPEAU}_1`),
    texte(" (aigu) et "),
    latex(`${B_CHAPEAU}_2`),
    texte(" (obtus), puis teste chacun en calculant "),
    latex(`${A_CHAPEAU} + ${B_CHAPEAU}`),
    texte(" (au dixième de degré)."),
  ];
}

function consigneCote(r: ResolutionSSA): FragmentConsigne[] {
  if (r.nombreTriangles === 0) return [texte("Aucun triangle ne convient. Quelle est la plus petite longueur de BC pour laquelle un triangle existerait ? (au centième)")];
  if (r.nombreTriangles === 1) return [texte("Calcule le côté "), latex("c = AB"), texte(" du triangle (au centième).")];
  return [texte("Calcule le côté "), latex("c = AB"), texte(" de chacun des deux triangles (au centième).")];
}

// ---------------------------------------------------------------------------------------------
// Champs et choix
// ---------------------------------------------------------------------------------------------

export interface LibelleChamp {
  /** Libellé avant le champ (fragments). */
  libelle: FragmentConsigne[];
  /** Unité affichée après le champ (« ° », « cm »…), ou rien. */
  suffixe: string;
}

export function libellesChamps(e: ExerciceCasAmbigu, ecran: number): LibelleChamp[] {
  const r = resoudreSSA(e);
  if (ecran === 0) return [{ libelle: [latex(`\\sin ${B_CHAPEAU} =`)], suffixe: "" }];
  if (ecran === 2) {
    const indice = (rang: number) => (r.candidats.length === 2 ? `_${rang}` : "");
    return r.candidats.flatMap((c) => [
      { libelle: [latex(`${B_CHAPEAU}${indice(c.rang)} =`)], suffixe: "°" },
      { libelle: [latex(`${A_CHAPEAU} + ${B_CHAPEAU}${indice(c.rang)} =`)], suffixe: "°" },
    ]);
  }
  if (ecran === 4) {
    if (r.nombreTriangles === 0) return [{ libelle: [texte("Plus petite longueur : "), latex("BC =")], suffixe: e.unite }];
    if (r.nombreTriangles === 2) {
      return r.triangles.map((t) => ({ libelle: [texte(`Triangle AB${t.rang === 1 ? "₁" : "₂"}C : `), latex(`c_${t.rang} = AB_${t.rang} =`)], suffixe: e.unite }));
    }
    const libelle = r.comparaison === "egal" ? "Triangle ABC, rectangle en B : " : "Triangle ABC (avec l'angle aigu) : ";
    return [{ libelle: [texte(libelle), latex("c = AB =")], suffixe: e.unite }];
  }
  return [];
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

export const OPTIONS_COMPARAISON: OptionChoix[] = [
  { id: "superieur", fragments: [latex(`\\sin ${B_CHAPEAU} > 1`), texte(" : aucun angle n'a ce sinus")] },
  { id: "egal", fragments: [latex(`\\sin ${B_CHAPEAU} = 1`), texte(" : un seul angle candidat, "), latex(`${B_CHAPEAU} = 90^\\circ`)] },
  { id: "inferieur", fragments: [latex(`\\sin ${B_CHAPEAU} < 1`), texte(" : deux angles candidats, "), latex(`${B_CHAPEAU}_1`), texte(" et "), latex(`${B_CHAPEAU}_2 = 180^\\circ - ${B_CHAPEAU}_1`)] },
];

export const OPTIONS_ARC: OptionChoix[] = [
  { id: REPONSE_ARC_SANS_CANDIDAT, fragments: [texte("Il n'atteint pas la demi-droite [Ax) : a est plus court que la distance de C à cette demi-droite.")] },
  { id: "un-point", fragments: [texte("Il touche la demi-droite [Ax) en un seul point.")] },
  { id: "deux-points", fragments: [texte("Il coupe la demi-droite [Ax) en deux points.")] },
];

export const OPTIONS_NOMBRE: OptionChoix[] = [
  { id: "0", fragments: [texte("Aucun triangle")] },
  { id: "1", fragments: [texte("Un seul triangle")] },
  { id: "2", fragments: [texte("Deux triangles")] },
];

export function optionComparaison(c: ComparaisonSinusSSA): OptionChoix {
  return OPTIONS_COMPARAISON.find((o) => o.id === c)!;
}

export function optionNombre(n: number): OptionChoix {
  return OPTIONS_NOMBRE.find((o) => o.id === String(n))!;
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues (écran, historique, corrigé)
// ---------------------------------------------------------------------------------------------

export function sinusBLatex(e: ExerciceCasAmbigu): string {
  return `\\sin ${B_CHAPEAU} = \\dfrac{b \\cdot \\sin ${A_CHAPEAU}}{a} = \\dfrac{${nombreFrLatex(e.b)} \\cdot \\sin ${e.angleA}^\\circ}{${nombreFrLatex(e.a)}}`;
}

/** Réponses attendues des champs d'un écran, une chaîne LaTeX par champ. */
export function reponsesChampsLatex(e: ExerciceCasAmbigu, ecran: number): string[] {
  const r = resoudreSSA(e);
  if (ecran === 0) return [`\\sin ${B_CHAPEAU} ${egalOuEnviron(r.sinB, 3)}`];
  if (ecran === 2) {
    const indice = (rang: number) => (r.candidats.length === 2 ? `_${rang}` : "");
    return r.candidats.flatMap((c) => [
      `${B_CHAPEAU}${indice(c.rang)} ${egalOuEnviron(c.angleB, 1, "^\\circ")}`,
      `${A_CHAPEAU} + ${B_CHAPEAU}${indice(c.rang)} ${egalOuEnviron(c.somme, 1, "^\\circ")}`,
    ]);
  }
  if (ecran === 4) {
    if (r.nombreTriangles === 0) return [`BC = h ${egalOuEnviron(r.hauteur, 2, uniteLatex(e))}`];
    if (r.nombreTriangles === 2) return r.triangles.map((t) => `c_${t.rang} = AB_${t.rang} ${egalOuEnviron(t.c, 2, uniteLatex(e))}`);
    return [`c = AB ${egalOuEnviron(r.triangles[0]!.c, 2, uniteLatex(e))}`];
  }
  return [];
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul ou une comparaison à faire)
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: ExerciceCasAmbigu, ecran: number): FragmentConsigne[][] {
  const r = resoudreSSA(e);
  switch (ecran) {
    case 0:
      return [
        [texte("La loi des sinus relie chaque côté au sinus de l'angle qui lui fait face : "), latex(`\\dfrac{a}{\\sin ${A_CHAPEAU}} = \\dfrac{b}{\\sin ${B_CHAPEAU}}`)],
        [texte("On isole le sinus cherché et on remplace (calculatrice en degrés) : "), latex(sinusBLatex(e))],
      ];
    case 1:
      return [
        [texte("Le sinus d'un angle ne dépasse jamais 1 : "), latex("-1 \\le \\sin x \\le 1")],
        [texte("Entre 0° et 180°, deux angles supplémentaires ont le même sinus (section 4, angles associés) : "), latex("\\sin(180^\\circ - x) = \\sin x")],
      ];
    case 2:
      if (r.candidats.length === 0) {
        return [
          [texte("La distance de C à la demi-droite [Ax) est la hauteur h issue de C, dans le triangle rectangle qu'elle forme avec la demi-droite : "), latex(`h = b \\cdot \\sin ${A_CHAPEAU}`)],
          [texte("L'arc de rayon a n'atteint la demi-droite que si a est au moins égal à h. Ici : "), latex(`h = ${nombreFrLatex(e.b)} \\cdot \\sin ${e.angleA}^\\circ`)],
        ];
      }
      if (r.candidats.length === 1) {
        return [
          [texte("Sur le cercle trigonométrique, le sinus vaut 1 en un seul point : tout en haut du cercle.")],
          [texte("Ajoute ensuite l'angle donné : "), latex(`${A_CHAPEAU} + ${B_CHAPEAU} = ${e.angleA}^\\circ + ${B_CHAPEAU}`)],
        ];
      }
      return [
        [texte("Le premier candidat s'obtient avec la touche sin⁻¹ de la calculatrice ; le second est son supplémentaire : "), latex(`${B_CHAPEAU}_1 = \\sin^{-1}(\\ldots) \\qquad ${B_CHAPEAU}_2 = 180^\\circ - ${B_CHAPEAU}_1`)],
        [texte("Avec la valeur trouvée à l'étape 1 (garde-la entière en mémoire) : "), latex(`${B_CHAPEAU}_1 = \\sin^{-1}(${sinusLatex(r.sinB)}\\ldots)`), texte(" ; puis ajoute "), latex(`${A_CHAPEAU} = ${e.angleA}^\\circ`), texte(" à chaque candidat.")],
      ];
    case 3:
      if (r.candidats.length === 0) {
        return [
          [texte("Reprends le verdict de l'étape 2 : un sinus ne dépasse jamais 1.")],
          [texte("Pour placer B, l'arc de centre C et de rayon a doit rencontrer la demi-droite [Ax).")],
        ];
      }
      return [
        [texte("Un candidat donne un triangle seulement s'il laisse de la place au troisième angle : "), latex(`${A_CHAPEAU} + ${B_CHAPEAU} < 180^\\circ`)],
        [texte("Reprends les sommes calculées à l'étape précédente et compare chacune à 180°.")],
      ];
    default:
      if (r.nombreTriangles === 0) {
        return [
          [texte("L'arc de rayon a touche la demi-droite en un seul point quand a est égal à la distance de C à cette demi-droite.")],
          [texte("Cette distance est la hauteur issue de C : "), latex(`h = b \\cdot \\sin ${A_CHAPEAU} = ${nombreFrLatex(e.b)} \\cdot \\sin ${e.angleA}^\\circ`)],
        ];
      }
      return [
        [texte("Dans chaque triangle, le troisième angle complète la somme à 180° : "), latex(`\\hat{C} = 180^\\circ - ${A_CHAPEAU} - ${B_CHAPEAU}`)],
        [texte("Puis la loi des sinus, avec a et "), latex(A_CHAPEAU), texte(" connus : "), latex(`c = \\dfrac{a \\cdot \\sin \\hat{C}}{\\sin ${A_CHAPEAU}} = \\dfrac{${nombreFrLatex(e.a)} \\cdot \\sin \\hat{C}}{\\sin ${e.angleA}^\\circ}`)],
      ];
  }
}

/** Message affiché quand un choix fermé est faux (l'écran se clôt). */
export const MESSAGES_REVELE: Record<number, string> = {
  1: "Ce n'était pas la bonne conclusion.",
  2: "Ce n'était pas la bonne réponse.",
  3: "Ce n'était pas le bon nombre de triangles.",
};
