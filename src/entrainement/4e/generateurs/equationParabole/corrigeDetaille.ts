import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationParabole } from "../../core/equationParabole.types";
import { moinsH, q, qp } from "../../ui/corrigeChapitre3";
import { COURS_PARABOLE, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { directriceEquationParabole } from "../../ui/equationParaboleGraph";
import { formatAideEquationNiveau2Latex, formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "../../ui/formatEquationParabole";
import { construireSvgParabole } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen51 « Équation d'une parabole depuis un graphe » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (sommet et foyer → équation) ;
 * partagé par l'adaptateur papier et l'appli (`AppEquationParabole.tsx`). Lectures : une ligne par
 * chose lue, la justification dit où ; S = milieu de F et de son projeté K sur d. Équation : p signé
 * par la chaîne de l'écran (`formatAideEquationNiveau2Latex`), puis S et p remplacés dans la forme
 * réduite du cours (§ 9) ; vérification : la directrice retrouvée y = y_S − p/2.
 */

type E = ExerciceEquationParabole;

function nb(v: number): string {
  return String(v).replace(/^-/, "−");
}

export function correctionDetailleeEquationParabole(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesEquationParabole(e));
}

function etapesEquationParabole(e: E): EtapeCorrection[] {
  const { sommet: S, foyer: F, p } = e;
  const vertical = e.variante === "vertical";
  const d = directriceEquationParabole(e);
  const [u, w] = vertical ? (["x", "y"] as const) : (["y", "x"] as const);
  const uS = vertical ? S.x : S.y;
  const wS = vertical ? S.y : S.x;
  const figure = construireSvgParabole(e, true);

  const lecture = vertical
    ? [
        ligne(`x_F=${q(F.x)}`, "croix du foyer F, lue sur l'axe horizontal"),
        ligne(`y_F=${q(F.y)}`, "croix du foyer F, lue sur l'axe vertical"),
        ligne(`y_K=${q(d)}`, `directrice horizontale d ≡ y = ${nb(d)} : K, pied de l'axe sur d, a pour ordonnée ${nb(d)}`),
        ligne(`x_S=x_F=${q(F.x)}`, "S est sur l'axe, la verticale passant par F"),
        ligne(`y_S=\\dfrac{y_F+y_K}{2}=\\dfrac{${q(F.y)}+${qp(d)}}{2}`, "S est le milieu de [KF], à mi-chemin entre F et d"),
        ligne(`=${q(S.y)}`),
      ]
    : [
        ligne(`x_F=${q(F.x)}`, "croix du foyer F, lue sur l'axe horizontal"),
        ligne(`y_F=${q(F.y)}`, "croix du foyer F, lue sur l'axe vertical"),
        ligne(`x_K=${q(d)}`, `directrice verticale d ≡ x = ${nb(d)} : K, pied de l'axe sur d, a pour abscisse ${nb(d)}`),
        ligne(`y_S=y_F=${q(F.y)}`, "S est sur l'axe, l'horizontale passant par F"),
        ligne(`x_S=\\dfrac{x_F+x_K}{2}=\\dfrac{${q(F.x)}+${qp(d)}}{2}`, "S est le milieu de [KF], à mi-chemin entre F et d"),
        ligne(`=${q(S.x)}`),
      ];

  const forme = vertical ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)";
  const groupe = (c: number) => (c === 0 ? w : `(${moinsH(c, w)})`);
  const lignesEquation = [
    ...lignesDepuisChaine(formatAideEquationNiveau2Latex(e).replace(/\s+/g, ""), [
      "formule du cours : p est signé",
      "coordonnées de F et de S remplacées",
    ]),
    ligne(`(${u}-${qp(uS)})^2=2\\cdot ${qp(p)}\\cdot(${w}-${qp(wS)})`, [texte("forme réduite "), latex(forme), texte(" : S et p remplacés")]),
    ligne(`${uS === 0 ? `${u}^2` : `(${moinsH(uS, u)})^2`}=${q(2 * p)}${groupe(wS)}`, [latex(`2\\cdot ${qp(p)}=${q(2 * p)}`), ...(uS < 0 || wS < 0 ? [texte(", signes simplifiés")] : uS === 0 || wS === 0 ? [texte(", on retire le 0")] : [])]),
  ];

  return [
    utilise("a", [
      texte(`La directrice d est ${vertical ? "horizontale" : "verticale"} : l'axe de la parabole, perpendiculaire à d passant par F, est ${vertical ? "vertical" : "horizontal"}. Il coupe d en K, et le sommet S est le milieu de [KF], à mi-chemin entre le foyer et la directrice ${COURS_PARABOLE}.`),
    ]),
    calcul("a", lecture),
    { ...resultat("a", [texte("Sommet "), latex(`S${formatSommetLatex(S)}`), texte(" et foyer "), latex(`F${formatFoyerLatex(F)}`), texte(" (axe en pointillés, K sur d).")]), figureHtml: figure },
    piege("a", [texte("Le sommet n'est ni le foyer ni un point de la directrice : il est au milieu, sur l'axe. La parabole s'ouvre du côté du foyer.")]),

    utilise("b", [
      texte(`Axe ${vertical ? "vertical" : "horizontal"} : `),
      latex(forme),
      texte(", avec "),
      latex(vertical ? "p=2(y_F-y_S)" : "p=2(x_F-x_S)"),
      texte(`, signé : positif si le foyer est ${vertical ? "au-dessus du" : "à droite du"} sommet ${COURS_PARABOLE}.`),
    ]),
    calcul("b", lignesEquation),
    resultat("b", [texte("La parabole a pour équation "), latex(formatEquationAttendueLatex(e)), texte(".")]),
    verification("b", [texte("La directrice est à "), latex("\\dfrac{p}{2}"), texte(" du sommet, du côté opposé au foyer : ")], [
      ligne(`${w}_S-\\dfrac{p}{2}=${q(wS)}-${qp(p / 2)}`, [latex(`\\dfrac{p}{2}=\\dfrac{${q(p)}}{2}=${q(p / 2)}`)]),
      ligne(`=${q(wS - p / 2)}`, `c'est bien la directrice lue, d ≡ ${w} = ${nb(d)}`),
    ]),
    piege(
      "b",
      p < 0
        ? [texte(`La parabole s'ouvre vers ${vertical ? "le bas" : "la gauche"} (le foyer est ${vertical ? "sous le" : "à gauche du"} sommet) : p est négatif, `), latex(`p=${q(p)}`), texte(", et le coefficient est "), latex(`2p=${q(2 * p)}`), texte(".")]
        : [texte("Le coefficient de l'équation est "), latex("2p"), texte(", pas p : ici "), latex(`2p=${q(2 * p)}`), texte(".")],
    ),
  ];
}

