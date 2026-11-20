import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import { piTexte, val } from "../moteur5e/trigExact";
import { decalage, expressionLatex, periode, type SinusoideExacte } from "../moteur5e/sinusoideExacte";
import { NOMS, type ExerciceAssocierCourbes } from "../moteur5e/modeleAssocierCourbes";
import { egauxModulo } from "../moteur5e/saisieTrig";

/**
 * Textes de 5gen53 « Associer formules et courbes » (écran ET papier). Lecture du cours (§ 5) : ligne
 * moyenne y = b, amplitude |A| (signe de A : la courbe monte ou descend après Φ), période T = 2π/ω
 * (distance entre deux maximums), décalage horizontal Φ = −φ/ω.
 */

type Fragments = FragmentConsigne[];
type E = ExerciceAssocierCourbes;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["Courbe 1", "Courbe 2", "Courbe 3", "Courbe 4"];

export const CONSIGNE_GENERALE = "Associe chaque courbe à son expression.";

export function expressionNommee(e: E, i: number): string {
  return expressionLatex(e.expressions[i]!, `${NOMS[i]}(x)`);
}

export function enonceExercice(): Fragments {
  return [t("Voici quatre expressions et leurs quatre courbes, dans le désordre :")];
}

/** Les quatre expressions, une formule par expression. */
export function listeExpressions(e: E): Fragments {
  return e.expressions.flatMap((_, i) => (i === 0 ? [l(expressionNommee(e, i))] : [t(" ; "), l(expressionNommee(e, i))]));
}

export function consignePapier(): Fragments {
  return [t("Associe chaque courbe à son expression ; justifie chaque choix par une lecture du graphique (ligne moyenne, amplitude, période, décalage horizontal).")];
}

export function consignesEcrans(): Fragments[] {
  return [0, 1, 2, 3].map((k) => [t(`Quelle expression a pour graphique la courbe ${k + 1} ?`)]);
}

export function reponseEcran(e: E, k: number): Fragments {
  return souderPonctuation([t(`La courbe ${k + 1} est celle de `), l(expressionNommee(e, e.ordre[k]!)), t(".")]);
}

export function reponseBreveFragments(e: E): Fragments {
  return souderPonctuation(e.ordre.flatMap((i, k) => [t(`${k ? " ; " : ""}courbe ${k + 1} : `), l(`${NOMS[i]}`)]));
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

export function aidesEcran(e: E): Fragments[] {
  const n1: Fragments = [
    t("Lis sur la courbe : la ligne moyenne "),
    l("y = b"),
    t(", l'amplitude (écart entre la ligne moyenne et un maximum), la période "),
    l("T = \\dfrac{2\\pi}{\\omega}"),
    t(" (distance entre deux maximums), puis l'abscisse "),
    l("\\Phi = -\\dfrac{\\varphi}{\\omega}"),
    t(" où la courbe croise sa ligne moyenne en montant si "),
    l("A > 0"),
    t(", en descendant si "),
    l("A < 0"),
    t("."),
  ];
  let n2: Fragments;
  switch (e.variante) {
    case "dephasage":
      n2 = [t("Les quatre expressions ne diffèrent que par "), l("\\varphi"), t(" : calcule "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" pour chacune et compare avec l'endroit où la courbe croise sa ligne moyenne (attention, ce n'est pas "), l("\\varphi"), t(").")];
      break;
    case "amplitude":
      n2 = [t("Les quatre expressions ne diffèrent que par "), l("A"), t(" : lis le maximum (donc "), l("|A|"), t("), puis regarde si la courbe monte ou descend juste après "), l("x = \\Phi"), t(" (signe de "), l("A"), t(").")];
      break;
    case "pulsation":
      n2 = [t("Les expressions diffèrent par "), l("\\omega"), t(" (et une par le signe) : mesure la période sur la courbe, puis compare-la à "), l("\\dfrac{2\\pi}{\\omega}"), t(" — ce n'est pas "), l("\\omega"), t(".")];
      break;
    default:
      n2 = [t("Chaque expression change un seul paramètre : compare la courbe à chacune, paramètre par paramètre ("), l("b"), t(", puis "), l("A"), t(" et son signe, puis "), l("T"), t(").")];
  }
  return [n1, souderPonctuation(n2)];
}

// ---------------------------------------------------------------------------------------------
// Explication d'un choix faux (texte, Unicode) et lecture d'une courbe (corrigé)
// ---------------------------------------------------------------------------------------------

function nombre(v: number): string {
  return v < 0 ? `−${-v}` : String(v);
}

/** « f donnerait une ligne moyenne y = 1 (au lieu de y = −1) ; … » — les différences avec la courbe. */
export function explicationChoix(e: E, k: number, choisi: number): string {
  const vraie = e.expressions[e.ordre[k]!]!;
  const s = e.expressions[choisi]!;
  const d: string[] = [];
  if (s.b !== vraie.b) d.push(`une ligne moyenne y = ${nombre(s.b)} (celle de la courbe est y = ${nombre(vraie.b)})`);
  if (Math.abs(s.A) !== Math.abs(vraie.A)) d.push(`une amplitude ${Math.abs(s.A)} (celle de la courbe est ${Math.abs(vraie.A)})`);
  const Ts = periode(s);
  const Tv = periode(vraie);
  if (val(Ts) !== val(Tv)) d.push(`une période ${piTexte(Ts)} (celle de la courbe est ${piTexte(Tv)})`);
  else {
    const Ps = val(decalage(s)) * Math.PI;
    const Pv = val(decalage(vraie)) * Math.PI;
    const T = val(Tv) * Math.PI;
    const memeSens = (s.A > 0) === (vraie.A > 0);
    if (memeSens && !egauxModulo(Ps, Pv, T)) d.push(`un décalage Φ = ${piTexte(decalage(s))} (la courbe croise sa ligne moyenne en ${piTexte(decalage(vraie))})`);
    if (!memeSens) d.push(`une courbe qui ${s.A > 0 ? "monte" : "descend"} après Φ, alors que celle-ci ${vraie.A > 0 ? "monte" : "descend"}`);
  }
  return d.length ? `L'expression ${NOMS[choisi]} donnerait ${d.join(" et ")}.` : `Compare la courbe à l'expression ${NOMS[choisi]} paramètre par paramètre.`;
}

export interface LectureCourbe {
  max: number;
  min: number;
}

export function lecture(s: SinusoideExacte): LectureCourbe {
  return { max: s.b + Math.abs(s.A), min: s.b - Math.abs(s.A) };
}

