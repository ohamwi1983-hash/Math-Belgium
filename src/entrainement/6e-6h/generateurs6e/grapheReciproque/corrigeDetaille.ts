import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { CandidatReciproque, ExerciceGrapheReciproque } from "../../core6e/grapheReciproque.types";
import { domaineF, domaineReciproque, imageF, imageReciproque, intervalleL, LETTRES_GRAPHES, noeudTangente, penteFL, penteRecL, pointA, transformer } from "../../moteur6e/modeleGrapheReciproque";
import { lx, tx } from "../../ui6e/ecransExp.types";
import type { Frag } from "../../ui6e/ecransExp.types";
import { figureCorrige } from "../../ui6e/figureGrapheReciproque";
import { reponse } from "../../ui6e/formatGrapheReciproque";

/**
 * Corrigé détaillé « comme au tableau » de `6gen154`, une lettre par écran : a) A lu sur la grille,
 * coordonnées échangées ; b) domaine et image de f lus (extrémités, crochets), puis échangés ;
 * c) chaque graphe candidat testé sur A′ (le bon passe par A′, chaque distracteur par un autre
 * point), figure f / f⁻¹ / y = x annotée ; d) pente lue Δy/Δx entre deux nœuds de la tangente, puis
 * son inverse, vérification m·m′ = 1. Même source que l'écran (modèle, textes, figures).
 */

const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;
const pt = ([x, y]: [number, number]) => `(${x}\\,;\\,${y})`;
const nb = (v: number): string => (v < 0 ? `−${-v}` : `${v}`);

const NOM_TRANSFO: Record<CandidatReciproque, string> = {
  reciproque: "symétrie par rapport à y = x",
  antidiagonale: "symétrie par rapport à y = −x",
  axeX: "symétrie par rapport à l'axe des abscisses",
  axeY: "symétrie par rapport à l'axe des ordonnées",
};

export function correctionDetailleeGrapheReciproque(e: ExerciceGrapheReciproque): EtapeCorrection[] {
  const A = pointA(e);
  const Ap = transformer("reciproque", A);
  const N = noeudTangente(e);
  const dx = N[0] - A[0];
  const dy = N[1] - A[1];
  const lignesC: LigneCalcul[] = e.candidats.map((c, i) => {
    const image = transformer(c, A);
    return c === "reciproque"
      ? ligne(`A'=${pt(Ap)}\\in\\mathcal{G}_{${LETTRES_GRAPHES[i]}}`, `graphe ${LETTRES_GRAPHES[i]} : ${NOM_TRANSFO[c]}`)
      : ligne(`${pt(image)}\\neq ${pt(Ap)}`, `graphe ${LETTRES_GRAPHES[i]} : ${NOM_TRANSFO[c]} ; il passe par (${nb(image[0])} ; ${nb(image[1])}) et non par A′`);
  });
  return [
    utilise("a", fr([t("Si "), l("(a\\,;\\,b)"), t(" est sur la courbe de "), l("f"), t(", alors "), l("(b\\,;\\,a)"), t(" est sur celle de "), l("f^{-1}"), t(" : symétrie par rapport à "), l("y=x"), t(" (cours, § 1).")])),
    calcul("a", [ligne(`A=${pt(A)}`, "lu sur la grille"), ligne(`f(${A[0]})=${A[1]}`, "A est sur la courbe de f"), ligne(`f^{-1}(${A[1]})=${A[0]}`, "on échange abscisse et ordonnée")]),
    resultat("a", fr(reponse(e, "point"))),
    piege("a", fr([t("Garder les coordonnées de "), l("A"), t(", ou changer leurs signes (symétrie par rapport à "), l("y=-x"), t(").")])),
    utilise("b", fr([t("Domaine de "), l("f"), t(" : abscisses de la courbe ; image : ordonnées. La réciproque les échange (cours, § 1). Point plein : borne comprise ; rond vide : exclue.")])),
    calcul("b", [
      ligne(`\\mathrm{dom}\\,f=${intervalleL(domaineF(e))}`, "de l'extrémité gauche à l'extrémité droite"),
      ligne(`\\mathrm{im}\\,f=${intervalleL(imageF(e))}`, e.variante === "croissante" ? "f croissante : de f(gauche) à f(droite)" : "f décroissante : de f(droite) à f(gauche)"),
      ligne(`\\mathrm{dom}\\,f^{-1}=\\mathrm{im}\\,f=${intervalleL(domaineReciproque(e))}`, "on échange"),
      ligne(`\\mathrm{im}\\,f^{-1}=\\mathrm{dom}\\,f=${intervalleL(imageReciproque(e))}`, "on échange"),
    ]),
    resultat("b", fr(reponse(e, "ensembles"))),
    piege("b", fr([t("Recopier le domaine de "), l("f"), t(" pour "), l("f^{-1}"), t(", ou perdre un rond vide (borne exclue) en échangeant les axes.")])),
    utilise("c", fr([t("Le graphe de "), l("f^{-1}"), t(" est le symétrique de celui de "), l("f"), t(" par rapport à "), l("y=x"), t(" : il passe par "), l(`A'=${pt(Ap)}`), t(". On teste chaque graphe.")])),
    calcul("c", lignesC),
    { ...resultat("c", fr(reponse(e, "graphe"))), figureHtml: figureCorrige(e) },
    utilise("d", fr([t("Pente d'une droite par deux nœuds : "), l("m=\\dfrac{\\Delta y}{\\Delta x}"), t(" ; la symétrie par rapport à "), l("y=x"), t(" échange "), l("\\Delta x"), t(" et "), l("\\Delta y"), t(", donc "), l("(f^{-1})'(b)=\\dfrac{1}{f'(a)}"), t(" (cours, § 1).")])),
    calcul("d", [
      ligne(`\\Delta x=${N[0]}-${A[0] < 0 ? `(${A[0]})` : A[0]}=${dx}`, `de A au nœud (${nb(N[0])} ; ${nb(N[1])}) de la tangente`),
      ligne(`\\Delta y=${N[1]}-${A[1] < 0 ? `(${A[1]})` : A[1]}=${dy}`),
      ligne(`m_{f}=\\dfrac{${dy}}{${dx}}`, "pente lue"),
      ...(`\\dfrac{${dy}}{${dx}}` !== penteFL(e) ? [ligne(`=${penteFL(e)}`)] : []),
      ligne(`m_{f^{-1}}=\\dfrac{1}{m_{f}}`, "pentes inverses"),
      ligne(`=${penteRecL(e)}`),
    ]),
    resultat("d", fr(reponse(e, "pente"))),
    verification("d", fr([t("Produit des deux pentes :")]), [ligne(`${penteFL(e)}\\cdot ${penteRecL(e).startsWith("-") ? `\\left(${penteRecL(e)}\\right)` : penteRecL(e)}=1`)]),
    piege("d", fr([t("Lire "), l("\\dfrac{\\Delta x}{\\Delta y}"), t(" pour la pente de "), l("f"), t(", ou donner "), l("-\\dfrac{1}{m_{f}}"), t(" (pente d'une perpendiculaire) pour "), l("f^{-1}"), t(".")])),
  ];
}
