import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationParaboleDeveloppee } from "../../core/equationParaboleDeveloppee.types";
import { moinsH, q, qp, sansDoublons, somme } from "../../ui/corrigeChapitre3";
import { COURS_PARABOLE, lignesCompleterCarre, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { formatCompletionLatex, formatDirectriceLatex, formatEquationDeveloppeeLatex, formatFoyerLatex, formatRegroupementLatex, formatSommetLatex } from "../../ui/formatEquationParaboleDeveloppee";

/**
 * Corrigé détaillé « comme au tableau » de gen52 « Sommet, foyer, p et directrice d'une parabole
 * depuis l'équation développée » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par
 * ÉCRAN (regroupement → complétion → caractéristiques) ; partagé par l'adaptateur papier et l'appli
 * (`AppEquationParaboleDeveloppee.tsx`). Méthode du cours (§ 9, exemple « équation développée →
 * S, F, p, directrice ») : isoler le carré, compléter le carré, mettre 2p en évidence, lire S et p,
 * puis F à p/2 du sommet sur l'axe et la directrice à p/2 de l'autre côté.
 */

type E = ExerciceEquationParaboleDeveloppee;

export function correctionDetailleeEquationParaboleDeveloppee(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesEquationParaboleDeveloppee(e));
}

function etapesEquationParaboleDeveloppee(e: E): EtapeCorrection[] {
  const { a, bCarre, bAutre, c, p, sommet, foyer, directrice } = e;
  const vertical = e.variante === "vertical";
  const [u, w] = vertical ? (["x", "y"] as const) : (["y", "x"] as const);
  const sC = vertical ? sommet.x : sommet.y;
  const sA = vertical ? sommet.y : sommet.x;
  const wF = vertical ? foyer.y : foyer.x;
  const second = somme([
    [-bAutre, w],
    [c, ""],
  ]);
  const carreU = sC === 0 ? `${u}^2` : `(${moinsH(sC, u)})^2`;
  const groupeW = sA === 0 ? w : `(${moinsH(sA, w)})`;

  // a) Regroupement
  const lignesA: LigneCalcul[] = [
    ligne(formatEquationDeveloppeeLatex(e).replace(/\s+/g, ""), "l'équation donnée"),
    ligne(`${somme([[a, `${u}^2`], [bCarre, u]])}=${second}`, `le terme en ${w} et la constante changent de membre, donc de signe`),
  ];
  if (a !== 1 && bCarre !== 0) lignesA.push(ligne(`${a}(${somme([[1, `${u}^2`], [bCarre / a, u]])})=${second}`, `on met ${a} en évidence`));

  // b) Complétion du carré, puis 2p mis en évidence
  const constante = c + a * sC * sC;
  const lignesB: LigneCalcul[] = [];
  if (sC !== 0) {
    lignesB.push(...lignesCompleterCarre(bCarre / a, u));
    if (a !== 1) {
      lignesB.push(ligne(`${a}[${carreU}-${q(sC * sC)}]=${second}`, "on remplace dans la parenthèse"));
      lignesB.push(ligne(`${a}${carreU}-${q(a * sC * sC)}=${second}`, `on distribue ${a}`));
    } else {
      lignesB.push(ligne(`${carreU}-${q(sC * sC)}=${second}`, "on remplace dans l'équation"));
    }
    lignesB.push(ligne(`${a === 1 ? "" : a}${carreU}=${somme([[-bAutre, w], [constante, ""]])}`, "la constante passe dans le second membre"));
  } else {
    lignesB.push(ligne(`${a === 1 ? "" : a}${u}^2=${second}`, `pas de terme en ${u} : le carré est déjà complet`));
  }
  if (a !== 1) lignesB.push(ligne(`${carreU}=${somme([[-bAutre / a, w], [constante / a, ""]])}`, `on divise les deux membres par ${a}`));
  const factorisee = `${carreU}=${q(2 * p)}${groupeW}`;
  if (lignesB[lignesB.length - 1]!.latex !== factorisee) lignesB.push(ligne(factorisee, `on met ${q(2 * p)} en évidence (coefficient de ${w})`));

  // c) Caractéristiques
  const demi = p / 2;
  const lignesC: LigneCalcul[] = [
    ligne(`${u}_S=${q(sC)}`, [latex(carreU), texte(" : on lit "), latex(`(${u}-${u}_S)^2`)]),
    ligne(`${w}_S=${q(sA)}`, [latex(groupeW), texte(" : on lit "), latex(`(${w}-${w}_S)`)]),
    ligne(`2p=${q(2 * p)}`, sA === 0 ? `coefficient de ${w}` : "coefficient devant la parenthèse"),
    ligne(`p=${q(p)}`, "on divise par 2"),
    ligne(`${u}_F=${q(sC)}`, `F est sur l'axe ${u} = ${String(sC).replace("-", "−")}, comme S`),
    ligne(`${w}_F=${q(sA)}${demi < 0 ? `-${q(-demi)}` : `+${q(demi)}`}`, [texte("F est à "), latex("\\dfrac{p}{2}"), texte(" du sommet le long de l'axe : "), latex(`${w}_F=${w}_S+\\dfrac{p}{2}`)]),
    ligne(`=${q(wF)}`),
    ligne(`${w}=${q(sA)}${demi < 0 ? `+${q(-demi)}` : `-${q(demi)}`}`, [texte("directrice d, perpendiculaire à l'axe, de l'autre côté du sommet : "), latex(`${w}=${w}_S-\\dfrac{p}{2}`)]),
    ligne(`=${q(directrice)}`),
  ];

  const forme = vertical ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)";
  return [
    utilise("a", [texte(`Seul ${u} est au carré : l'axe de la parabole est ${vertical ? "vertical" : "horizontal"}. On garde les termes en ${u} dans le premier membre, tout le reste passe dans le second ${COURS_PARABOLE}.`)]),
    calcul("a", sansDoublons(lignesA)),
    resultat("a", [texte("Termes en "), latex(u), texte(" isolés : "), latex(formatRegroupementLatex(e)), texte(".")]),
    piege("a", [texte("Un terme qui change de membre change de signe ; le terme en "), latex(w), texte(" reste du premier degré, il ne se met jamais au carré.")]),

    utilise("b", [
      texte("Compléter le carré : "),
      latex(`${u}^2+b${u}=\\left(${u}+\\dfrac{b}{2}\\right)^2-\\left(\\dfrac{b}{2}\\right)^2`),
      texte(", puis mettre en évidence le coefficient de "),
      latex(w),
      texte(" pour obtenir la forme réduite "),
      latex(forme),
      texte(` ${COURS_PARABOLE}.`),
    ]),
    calcul("b", sansDoublons(lignesB)),
    resultat("b", [texte("Forme réduite : "), latex(formatCompletionLatex(e)), texte(".")]),
    piege(
      "b",
      a !== 1 && sC !== 0
        ? [texte(`La parenthèse est multipliée par ${a} : le carré retranché l'est aussi, `), latex(`${a}\\cdot ${q(sC * sC)}=${q(a * sC * sC)}`), texte(".")]
        : sC === 0
          ? [texte("Il faut factoriser tout le second membre par le coefficient de "), latex(w), texte(` (ici ${q(2 * p).replace("-", "−")}) pour faire apparaître `), latex(`(${w}-${w}_S)`), texte(".")]
          : [texte("Le carré ajouté pour compléter doit être retranché aussitôt, sinon l'équation change.")],
    ),

    utilise("c", [
      texte("Par comparaison avec "),
      latex(forme),
      texte(" : le sommet S et p (signé). Le foyer est sur l'axe, à "),
      latex("\\dfrac{p}{2}"),
      texte(" du sommet ; la directrice, perpendiculaire à l'axe, est à "),
      latex("\\dfrac{p}{2}"),
      texte(` de l'autre côté ${COURS_PARABOLE}.`),
    ]),
    calcul("c", lignesC),
    resultat("c", [latex(`S${formatSommetLatex(sommet)}`), texte(", "), latex(`p=${q(p)}`), texte(", foyer "), latex(`F${formatFoyerLatex(foyer)}`), texte(", directrice "), latex(`d\\equiv ${formatDirectriceLatex(e)}`), texte(".")]),
    verification("c", [texte("S est le milieu de F et de la directrice : ")], [ligne(`\\dfrac{${q(wF)}+${qp(directrice)}}{2}=${q(sA)}`, [texte("on retrouve "), latex(`${w}_S`)])]),
    piege(
      "c",
      p < 0
        ? [texte(`p est négatif : le foyer est du côté des ${w} décroissants (`), latex(`${w}_F=${q(wF)}`), texte(") et la directrice de l'autre côté du sommet.")]
        : [texte("Le coefficient de la forme réduite est "), latex("2p"), texte(" : "), latex(`2p=${q(2 * p)}`), texte(" donne "), latex(`p=${q(p)}`), texte(", et non "), latex(`p=${q(2 * p)}`), texte(".")],
    ),
  ];
}
