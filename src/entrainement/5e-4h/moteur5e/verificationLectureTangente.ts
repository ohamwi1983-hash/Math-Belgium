import type { ExerciceLectureTangente } from "../core5e/lectureTangente";
import { aDe, echellesDifferentes, faDe, fpa, pQ } from "../core5e/lectureTangente";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { qVal } from "../ui5e/nombresTrigo";
import type { PhaseLectureTangente } from "../ui5e/formatLectureTangente";
import { droiteCandidat, phraseEchelle } from "../ui5e/formatLectureTangente";
import { egal, lireFonctionVar, lireNombre, statut, statutNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen73`. Saisie LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireNombre` (fractions, décimaux, préfixe « f(2) = » ignoré), équation
 * comparée en cinq points (préfixe « y = » ignoré). Choix fermés : une tentative.
 * Messages ciblés : abscisse lue au lieu de l'ordonnée, carreaux comptés sans l'échelle, f(a) donné
 * pour f′(a), Δx / Δy à l'envers, signe de la pente, équation sans le « − a », droite de bonne pente
 * qui ne passe pas par A (ou l'inverse), ordonnées comparées au lieu des pentes, graphique au mauvais
 * point de tangence / à la mauvaise pente / qui échange f(a) et f′(a).
 */

type E = ExerciceLectureTangente;
const POINTS_EQ = [-3.7, -1.3, 0.4, 2.1, 4.6];

export function diagnostiquer(e: E, p: PhaseLectureTangente, valeurs: string[]): StatutVerification[] {
  if (p === "valeur") return [statutNombre(valeurs[0] ?? "", faDe(e))];
  if (p === "pente") return [statutNombre(valeurs[0] ?? "", fpa(e))];
  if (p === "equation") {
    const h = lireFonctionVar(valeurs[0] ?? "", "x");
    if (!h) return ["parse_error"];
    const m = fpa(e);
    const pp = qVal(pQ(e));
    return [statut(POINTS_EQ.every((x) => egal(h(x), m * x + pp)))];
  }
  if (p === "comparer") return [statut(valeurs[0] === "o0")];
  return [statut(valeurs[0] === "g0")];
}

export function piege(e: E, p: PhaseLectureTangente, valeurs: string[]): Frag[] | null {
  const a = aDe(e);
  const fa = faDe(e);
  const m = fpa(e);
  if (p === "valeur") {
    const x = lireNombre(valeurs[0] ?? "");
    if (x === null) return null;
    if (e.variante === "inverse") {
      if (egal(x, m)) return [tx("C'est la pente de t, donc f′(a) : f(a) est l'ordonnée du point A, à calculer avec l'équation.")];
      if (egal(x, qVal(pQ(e)))) return [tx("C'est l'ordonnée à l'origine de t (en x = 0) : remplace x par "), lx(`${a}`), tx(".")];
      return null;
    }
    if (egal(x, a) && a !== fa) return [tx("C'est l'abscisse de A : f(a) est son ORDONNÉE (sa hauteur).")];
    if (echellesDifferentes(e) && egal(x, e.courbe.ja)) return [tx(`Tu as compté des carreaux : ${phraseEchelle(e)}`)];
    if (egal(x, -fa)) return [tx("Vérifie le signe : A est-il au-dessus ou en dessous de l'axe des abscisses ?")];
    return null;
  }
  if (p === "pente") {
    const x = lireNombre(valeurs[0] ?? "");
    if (x === null) return null;
    if (e.variante === "inverse") {
      if (egal(x, fa)) return [tx("C'est f(a) : f′(a) est la PENTE de la tangente, le coefficient de x.")];
      if (egal(x, qVal(pQ(e)))) return [tx("C'est l'ordonnée à l'origine de t : la pente est le coefficient de x.")];
      return null;
    }
    if (egal(x, fa) && !egal(fa, m)) return [tx("C'est f(a), l'ordonnée de A : f′(a) est la PENTE de la tangente.")];
    if (echellesDifferentes(e) && egal(x, e.courbe.dp / e.courbe.dq)) return [tx(`Tu as compté des carreaux : ${phraseEchelle(e)} Convertis Δx et Δy en unités.`)];
    if (egal(x, -m)) return [tx("Signe faux : la tangente monte-t-elle ou descend-elle de gauche à droite ?")];
    if (m !== 0 && egal(x, 1 / m)) return [tx("Le quotient est à l'envers : la pente vaut "), lx("\\dfrac{\\Delta y}{\\Delta x}"), tx(".")];
    return null;
  }
  if (p === "equation") {
    const h = lireFonctionVar(valeurs[0] ?? "", "x");
    if (!h) return null;
    const pp = qVal(pQ(e));
    if (POINTS_EQ.every((x) => egal(h(x), m * x + fa)) && !egal(pp, fa)) return [tx("La droite "), lx("y=f'(a)\\,x+f(a)"), tx(" ne passe pas par A : il manque le « − a » de "), lx("y=f'(a)\\,(x-a)+f(a)"), tx(".")];
    const pente = h(1) - h(0);
    const lineaire = POINTS_EQ.every((x) => egal(h(x), h(0) + pente * x));
    if (lineaire && egal(pente, m)) return [tx("Bonne pente, mais cette droite ne passe pas par "), lx(`A(${a}\\,;${fa})`), tx(".")];
    if (lineaire && egal(h(a), fa)) return [tx("Cette droite passe bien par A, mais sa pente n'est pas f′(a).")];
    return null;
  }
  if (p === "comparer") {
    if (valeurs[0] === "o1") return [tx("Tu as comparé les HAUTEURS des points (les valeurs de f). Le nombre dérivé se lit sur la pente de la tangente : la courbe monte-t-elle ou descend-elle, et à quelle vitesse ?")];
    return [tx("f′ est négatif là où la courbe descend, et le plus grand là où elle monte le plus raide.")];
  }
  const k = Number((valeurs[0] ?? "").slice(1));
  const type = e.types[k];
  if (!type || type === "bon") return null;
  const c = e.candidats[k]!;
  if (type === "signe") return [tx(`Sur ce graphique, la tangente ${droiteCandidat(c).m.n > 0 ? "monte" : "descend"} : sa pente a le signe opposé à f′(a).`)];
  if (type === "decale") return [tx("La droite tracée est bien t, mais elle touche la courbe en un autre point que celui d'abscisse "), lx(`${a}`), tx(".")];
  if (type === "ordonnee") return [tx("La pente est la bonne, mais la courbe ne passe pas par "), lx(`(${a}\\,;${fa})`), tx(".")];
  return [tx("Ce graphique échange f(a) et f′(a) : son point de tangence est à la hauteur f′(a) et sa tangente a pour pente f(a).")];
}

/** Explication d'un choix fermé faux (affichée avec la réponse). */
export function explicationChoix(e: E, p: PhaseLectureTangente): string {
  if (p === "comparer") return "Le signe et la grandeur de f′ se lisent sur la pente des tangentes, jamais sur la hauteur des points.";
  return `Il faut une tangente qui passe par (${aDe(e)} ; ${faDe(e)}) avec la pente f′(a).`.replace(/-/g, "−");
}
