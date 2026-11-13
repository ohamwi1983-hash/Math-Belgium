import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { ExerciceValeurExacte, FonctionTrig, QuadrantStrict, TermeTrig } from "../core/valeurExacte.types";
import { denominateurCommun, exactLatex, exactLatexFacteur, type NombreExact } from "../moteur/corpsValeurExacte";
import {
  angleAssocie,
  angleReduit,
  groupesAdditifs,
  necessiteReduction,
  quadrantDe,
  signeDe,
  valeurExpression,
  valeurFonction,
  valeurGroupe,
  valeurRemarquable,
} from "../moteur/modeleValeurExacte";
import type { EcranValeurExacte } from "../moteur/sessionValeurExacte";
import type { StatutAngle, StatutExact } from "../moteur/verificationValeurExacte";

/**
 * Textes de gen76 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; signe moins typographique (KaTeX) ; vocabulaire des angles associés de gen17
 * (supplémentaire, anti-supplémentaire, opposé) et des étapes de gen14/gen15 (ramener dans
 * [0° ; 360°[, quadrant, signe, angle du premier quadrant, valeur remarquable).
 */

export const CONSIGNE_GENERALE = "Calcule la valeur exacte de l'expression ci-dessous, sans calculatrice.";
export const CONSIGNE_PAPIER = "Calcule, sans calculatrice, la valeur exacte de :";
export const INTERVALLE_TOUR = "[0^\\circ \\,;\\, 360^\\circ\\mathclose{[}";

export function angleLatex(a: number): string {
  return `${a}^\\circ`;
}

/** « \cos 135^\circ », « \cos(-120^\circ) » — sans le carré. */
export function fonctionAngleLatex(fonction: FonctionTrig, angle: number): string {
  return angle < 0 ? `\\${fonction}(${angleLatex(angle)})` : `\\${fonction} ${angleLatex(angle)}`;
}

/** Le terme tel qu'il est écrit dans l'expression : « \cos^2 135^\circ ». */
export function termeLatex(t: TermeTrig): string {
  if (!t.carre) return fonctionAngleLatex(t.fonction, t.angle);
  return t.angle < 0 ? `\\${t.fonction}^2(${angleLatex(t.angle)})` : `\\${t.fonction}^2 ${angleLatex(t.angle)}`;
}

const OPERATEUR_LATEX = { "+": " + ", "-": " - ", "*": " \\cdot " } as const;

function assembler(e: ExerciceValeurExacte, morceau: (i: number) => string): string {
  return e.termes.map((_, i) => (i === 0 ? morceau(0) : `${OPERATEUR_LATEX[e.operateurs[i - 1]!]}${morceau(i)}`)).join("");
}

export function expressionLatex(e: ExerciceValeurExacte): string {
  return assembler(e, (i) => termeLatex(e.termes[i]!));
}

/** Le terme est-il facteur d'un produit ? */
function dansUnProduit(e: ExerciceValeurExacte, i: number): boolean {
  return e.operateurs[i - 1] === "*" || e.operateurs[i] === "*";
}

/** L'expression où chaque terme est remplacé par sa valeur exacte (avec les parenthèses utiles). */
export function substitutionLatex(e: ExerciceValeurExacte): string {
  return assembler(e, (i) => {
    const t = e.termes[i]!;
    const v = valeurFonction(t);
    if (t.carre) return `\\left(${exactLatex(v)}\\right)^2`;
    return i === 0 && !dansUnProduit(e, i) ? exactLatex(v) : exactLatexFacteur(v);
  });
}

/** Produits et carrés effectués : une valeur par groupe additif. */
export function groupesLatex(e: ExerciceValeurExacte): string {
  return groupesAdditifs(e)
    .map((g, k) => {
      const v = valeurGroupe(e, g.indices);
      if (k === 0) return exactLatex(v);
      return `${g.signe === 1 ? " + " : " - "}${exactLatexFacteur(v)}`;
    })
    .join("");
}

/** Une étape « produits et carrés effectués » n'apporte quelque chose que s'il y en a. */
export function aDesProduitsOuCarres(e: ExerciceValeurExacte): boolean {
  return e.operateurs.includes("*") || e.termes.some((t) => t.carre);
}

export function resultatLatex(e: ExerciceValeurExacte): string {
  return exactLatex(valeurExpression(e));
}

export function valeurLatex(v: NombreExact): string {
  return exactLatex(v);
}

// ---------------------------------------------------------------------------------------------
// Vocabulaire du cercle (gen14, gen15, gen17)
// ---------------------------------------------------------------------------------------------

export function libelleQuadrantStrict(q: QuadrantStrict): string {
  return `quadrant ${q}`;
}

/** Angle tel qu'on le raisonne : l'angle réduit (ou l'angle donné s'il est déjà dans [0° ; 360°[). */
export function angleTravail(t: TermeTrig): number {
  return angleReduit(t.angle);
}

/** « 240° est l'anti-supplémentaire de 60° » — relation entre l'angle réduit et l'angle associé. */
export function relationFragments(t: TermeTrig): FragmentConsigne[] {
  const th = angleTravail(t);
  const a = angleAssocie(t);
  switch (quadrantDe(t)) {
    case "I":
      return [latex(angleLatex(th)), texte(" est déjà dans le premier quadrant : c'est lui-même l'angle associé.")];
    case "II":
      return [latex(angleLatex(th)), texte(" est le supplémentaire de "), latex(angleLatex(a)), texte(" : "), latex(`180^\\circ - ${angleLatex(th)} = ${angleLatex(a)}`), texte(".")];
    case "III":
      return [latex(angleLatex(th)), texte(" est l'anti-supplémentaire de "), latex(angleLatex(a)), texte(" : "), latex(`${angleLatex(th)} - 180^\\circ = ${angleLatex(a)}`), texte(".")];
    case "IV":
      return [
        latex(angleLatex(th)),
        texte(" donne le même point que "),
        latex(angleLatex(-a)),
        texte(", l'opposé de "),
        latex(angleLatex(a)),
        texte(" : "),
        latex(`360^\\circ - ${angleLatex(th)} = ${angleLatex(a)}`),
        texte("."),
      ];
  }
}

function signeMot(s: 1 | -1): string {
  return s === 1 ? "positif" : "négatif";
}

/** Calcul de réduction sans le résultat : « 750^\circ - 2 \times 360^\circ ». */
export function calculReductionLatex(t: TermeTrig): string {
  const tours = (t.angle - angleReduit(t.angle)) / 360;
  const n = Math.abs(tours);
  const fois = n === 1 ? "360^\\circ" : `${n} \\times 360^\\circ`;
  return `${angleLatex(t.angle)} ${tours > 0 ? "-" : "+"} ${fois}`;
}

// ---------------------------------------------------------------------------------------------
// Écrans : titres, consignes
// ---------------------------------------------------------------------------------------------

function nomTerme(terme: number): string {
  return `Terme ${terme + 1}`;
}

export function titreEcran(_e: ExerciceValeurExacte, ecran: EcranValeurExacte): string {
  if (ecran.type === "final") return "Valeur de l'expression";
  const nom = nomTerme(ecran.terme);
  if (ecran.type === "reduction") return `${nom} — angle ramené dans [0° ; 360°[`;
  if (ecran.type === "placement") return `${nom} — quadrant et signe`;
  return `${nom} — angle associé et valeur exacte`;
}

/** En-tête « Terme 2 : cos 240° » de chaque écran d'un terme. */
export function enTeteTerme(e: ExerciceValeurExacte, terme: number): FragmentConsigne[] {
  const t = e.termes[terme]!;
  const fragments: FragmentConsigne[] = [texte(`${nomTerme(terme)} : `), latex(termeLatex(t))];
  if (t.carre) fragments.push(texte(", c'est-à-dire le carré de "), latex(fonctionAngleLatex(t.fonction, t.angle)));
  return fragments;
}

export function consigneEcran(e: ExerciceValeurExacte, ecran: EcranValeurExacte): FragmentConsigne[] {
  if (ecran.type === "final") return [texte("Calcule la valeur exacte de l'expression à l'aide des valeurs trouvées.")];
  const t = e.termes[ecran.terme]!;
  const ft = fonctionAngleLatex(t.fonction, angleTravail(t));
  if (ecran.type === "reduction") {
    return [texte("Ramène l'angle "), latex(angleLatex(t.angle)), texte(" dans "), latex(INTERVALLE_TOUR), texte(" : quel angle donne le même point du cercle trigonométrique ?")];
  }
  if (ecran.type === "placement") {
    return [texte("Dans quel quadrant se trouve l'angle "), latex(angleLatex(angleTravail(t))), texte(" ? Quel est le signe de "), latex(ft), texte(" ?")];
  }
  return [texte("Quel est l'angle associé du premier quadrant ? Donne ensuite la valeur exacte de "), latex(ft), texte(", avec son signe.")];
}

/** Rappel « cos 750° = cos 30° » affiché sur les écrans qui suivent une réduction. */
export function rappelReduction(t: TermeTrig): FragmentConsigne[] | null {
  if (!necessiteReduction(t)) return null;
  return [latex(`${fonctionAngleLatex(t.fonction, t.angle)} = ${fonctionAngleLatex(t.fonction, angleTravail(t))}`), texte(" (même point du cercle).")];
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul ou un choix à faire)
// ---------------------------------------------------------------------------------------------

export function aidesReduction(t: TermeTrig): FragmentConsigne[][] {
  return [
    [
      texte("Deux angles qui diffèrent d'un nombre entier de tours donnent le même point du cercle. Ajoute ou retire 360° autant de fois que nécessaire, avec k entier : "),
      latex(`${angleLatex(t.angle)} + k \\cdot 360^\\circ`),
    ],
    [texte("Ici, le calcul à faire est : "), latex(`${calculReductionLatex(t)}`)],
  ];
}

export function aidesPlacement(): FragmentConsigne[][] {
  return [
    [
      texte(
        "Repère entre quels multiples de 90° tombe l'angle : entre 0° et 90°, quadrant I ; entre 90° et 180°, quadrant II ; entre 180° et 270°, quadrant III ; entre 270° et 360°, quadrant IV.",
      ),
    ],
    [
      texte("Sur le cercle trigonométrique, le cosinus est l'abscisse du point et le sinus son ordonnée ; la tangente a le signe du quotient : "),
      latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"),
      texte(". Le sinus est positif dans les quadrants I et II, le cosinus dans les quadrants I et IV, la tangente dans les quadrants I et III."),
    ],
  ];
}

function formuleAngleAssocie(t: TermeTrig): string {
  const th = angleLatex(angleTravail(t));
  switch (quadrantDe(t)) {
    case "I":
      return `\\alpha = ${th}`;
    case "II":
      return `\\alpha = 180^\\circ - ${th}`;
    case "III":
      return `\\alpha = ${th} - 180^\\circ`;
    case "IV":
      return `\\alpha = 360^\\circ - ${th}`;
  }
}

const NOM_RELATION: Record<QuadrantStrict, string> = {
  I: "est déjà dans le premier quadrant : l'angle associé α est l'angle lui-même",
  II: "est dans le quadrant II : c'est le supplémentaire de l'angle associé α du premier quadrant, qui vaut",
  III: "est dans le quadrant III : c'est l'anti-supplémentaire de l'angle associé α du premier quadrant, qui vaut",
  IV: "est dans le quadrant IV : il donne le même point que −α, l'opposé de l'angle associé α du premier quadrant, qui vaut",
};

export function aidesValeur(t: TermeTrig): FragmentConsigne[][] {
  const table = ([30, 45, 60] as const).map((r) => `${fonctionAngleLatex(t.fonction, r)} = ${exactLatex(valeurRemarquable(t.fonction, r))}`).join(" \\;;\\; ");
  return [
    [latex(angleLatex(angleTravail(t))), texte(` ${NOM_RELATION[quadrantDe(t)]} : `), latex(`${formuleAngleAssocie(t)}`)],
    [
      texte(`Valeurs remarquables du ${t.fonction === "sin" ? "sinus" : t.fonction === "cos" ? "cosinus" : "de la tangente"} dans le premier quadrant : `),
      latex(`${table}`),
      texte(`. Prends celle de l'angle associé, avec le signe trouvé à l'étape précédente (${signeMot(signeDe(t))}).`),
    ],
  ];
}

export function aidesFinal(e: ExerciceValeurExacte): FragmentConsigne[][] {
  const d = denominateurCommun(valeurExpression(e));
  const regles: FragmentConsigne[] = aDesProduitsOuCarres(e)
    ? [texte("Effectue d'abord les produits et les carrés (un carré est toujours positif, un produit de deux nombres de même signe aussi), puis les sommes. ")]
    : [texte("Additionne ou soustrais les valeurs. ")];
  return [
    [texte("Remplace chaque terme par sa valeur exacte : "), latex(`${expressionLatex(e)} = ${substitutionLatex(e)}`)],
    [
      ...regles,
      ...(groupesAdditifs(e).length === 1
        ? [texte("Multiplie les numérateurs entre eux et les dénominateurs entre eux, puis simplifie (rappel : "), latex("\\sqrt{a} \\cdot \\sqrt{a} = a"), texte(").")]
        : d > 1
          ? [texte("Réduis au même dénominateur, ici : "), latex(`${d}`)]
          : [texte("Le résultat n'a pas de dénominateur : regroupe les termes de même nature et vérifie les signes.")]),
    ],
  ];
}

// ---------------------------------------------------------------------------------------------
// Messages des statuts
// ---------------------------------------------------------------------------------------------

export const SANS_TENTATIVE = " Aucune tentative n'est comptée.";

export function messageStatutExact(s: StatutExact, fonction?: FonctionTrig): string {
  switch (s) {
    case "approchee":
      return "C'est une valeur approchée : on demande la valeur EXACTE, avec des fractions et des racines (par exemple rac(3)/2 ou (2+rac(6))/4)." + SANS_TENTATIVE;
    case "recopie":
      return "Remplace sin, cos et tan par leurs valeurs exactes : le champ attend un nombre, comme rac(3)/2." + SANS_TENTATIVE;
    case "parse_error":
      return "Écriture non reconnue : utilise des nombres, des fractions a/b, rac(…) pour une racine et des parenthèses." + SANS_TENTATIVE;
    case "signe":
      return "La valeur sans le signe est juste, mais le signe ne l'est pas : regarde le quadrant.";
    case "cofonction":
      return fonction === "cos" ? "C'est la valeur du sinus, pas du cosinus : ne confonds pas les deux." : "C'est la valeur du cosinus, pas du sinus : ne confonds pas les deux.";
    default:
      return "Valeur incorrecte.";
  }
}

export function messageStatutAngle(s: StatutAngle, ecran: "reduction" | "valeur"): string {
  switch (s) {
    case "parse_error":
      return "Écris un angle en degrés, par exemple 30." + SANS_TENTATIVE;
    case "hors-intervalle":
      return "C'est bien le même point du cercle, mais l'angle demandé est entre 0° et 360° (360° exclu).";
    case "non-transforme":
      return "C'est l'angle de départ : l'angle associé est son symétrique dans le premier quadrant, entre 0° et 90°.";
    default:
      return ecran === "reduction" ? "Angle incorrect." : "Angle associé incorrect.";
  }
}
