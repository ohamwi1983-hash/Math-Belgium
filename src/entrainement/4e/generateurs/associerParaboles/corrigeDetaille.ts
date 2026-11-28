import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceAssocierParaboles } from "../../core/associerParaboles.types";
import { NOMS, fenetre } from "../../moteur/modeleAssocierParaboles";
import { figureCourbe, lectures, reponseEcran } from "../../ui/formatAssocierParaboles";
import { nombreTexte, plusQ, q, qp } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen128 (partagé par l'appli et le papier) : une lettre par
 * courbe — sommet lu, écart vertical à m carreaux du sommet puis a, zéros lus (ou « aucun »),
 * ordonnée à l'origine calculée quand une équation est développée ; puis l'équation qui a ces
 * caractéristiques, contrôlée en deux points. Figure de la courbe avec le sommet et les zéros.
 */

type E = ExerciceAssocierParaboles;
const LETTRES = "abcd";

function etape(e: E, n: number): EtapeCorrection[] {
  const sq = LETTRES[n]!;
  const i = e.ordre[n]!;
  const p = e.paraboles[i]!;
  const nom = NOMS[i]!;
  const { m, yPas, zeros, c } = lectures(p);
  const lignes: LigneCalcul[] = [
    ligne(`x_S=${q(p.h)}`, "abscisse du sommet lue sur le quadrillage"),
    ligne(`y_S=${q(p.k)}`, "ordonnée du sommet lue"),
    ligne(`${q(yPas)}-${qp(p.k)}=${q(yPas - p.k)}`, `écart vertical lu entre le point d'abscisse ${nombreTexte(p.h + m)} (${m === 1 ? "un carreau" : `${m} carreaux`} à droite du sommet) et le sommet`),
    m === 1 ? ligne(`a=${q(p.a)}`, `la courbe ${p.a > 0 ? "monte" : "descend"} de ${nombreTexte(Math.abs(p.a))} pour un carreau`) : ligne(`a=\\dfrac{${q(yPas - p.k)}}{${m}^2}=${q(p.a)}`, [texte("l'écart vaut "), latex("a\\cdot m^2")]),
  ];
  if (zeros.length) for (const z of zeros) lignes.push(ligne(`${nom}(${q(z)})=0`, `la courbe coupe l'axe des x en x = ${nombreTexte(z)}`));
  else lignes.push(ligne(`y_S${p.k > 0 ? ">" : "<"}0`, `sommet ${p.k > 0 ? "au-dessus" : "en dessous"} de l'axe des x, parabole tournée vers le ${p.a > 0 ? "haut" : "bas"} : aucun zéro`));
  if (p.ecriture === "developpee" || e.variante === "troisEcritures") {
    const fen = fenetre(e);
    if (c >= fen.yMin && c <= fen.yMax) lignes.push(ligne(`${nom}(0)=${q(c)}`, `la courbe coupe l'axe des y en y = ${nombreTexte(c)} : l'ordonnée à l'origine`));
    else lignes.push(ligne(`${nom}(0)=${p.a === 1 ? "" : p.a === -1 ? "-" : q(p.a)}(0${plusQ(-p.h)})^2${plusQ(p.k)}`, "ordonnée à l'origine, avec le sommet et a lus"), ligne(`=${q(c)}`));
  }
  lignes.push(ligne(`${nom}(${q(p.h)})=${q(p.k)}`, `contrôle dans l'équation de ${nom} : le sommet lu est bien sur sa courbe`));
  return [
    utilise(sq, [
      texte("Lecture d'une parabole (cours, point 2) : la forme canonique "),
      latex("a(x-x_S)^2+y_S"),
      texte(" donne le sommet, la forme factorisée "),
      latex("a(x-x_1)(x-x_2)"),
      texte(" les zéros, la forme développée "),
      latex("ax^2+bx+c"),
      texte(" l'ordonnée à l'origine c ; le signe de a donne le sens, et à m carreaux du sommet la courbe s'écarte de "),
      latex("a\\cdot m^2"),
      texte("."),
    ]),
    calcul(sq, lignes),
    { ...resultat(sq, reponseEcran(e, n)), figureHtml: `<div style="max-width:8cm;margin:6px auto">${figureCourbe(e, n, true)}</div>` },
    piege(
      sq,
      e.variante === "signesSommet"
        ? [texte("Dans "), latex("(x+2)^2"), texte(", le sommet a pour abscisse "), latex("-2"), texte(" : le signe dans la parenthèse est l'opposé de "), latex("x_S"), texte(".")]
        : e.variante === "coefficientA"
          ? [texte("Ne confonds pas a et "), latex("\\dfrac{1}{a}"), texte(" : avec "), latex("|a|>1"), texte(" la parabole est plus resserrée que "), latex("y=x^2"), texte(", avec "), latex("|a|<1"), texte(" plus ouverte.")]
          : e.variante === "factorisee"
            ? [texte("Le facteur "), latex("(x+3)"), texte(" donne le zéro "), latex("-3"), texte(" ; un a négatif retourne la parabole sans changer ses zéros.")]
            : [texte("Chaque écriture montre une caractéristique différente : lis sur la courbe celle que l'équation montre.")],
    ),
  ];
}

export function correctionDetailleeAssocierParaboles(e: E): EtapeCorrection[] {
  return [0, 1, 2, 3].flatMap((n) => etape(e, n));
}
