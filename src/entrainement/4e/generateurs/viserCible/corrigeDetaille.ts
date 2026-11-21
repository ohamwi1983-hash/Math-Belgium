import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceViserCible } from "../../core/viserCible.types";
import { coefficientK, composanteConnue, conditionInverse, critere, fraction, solutionM, valeurFraction, vecteurAC, verdictDirect, verdictInverse } from "../../moteur/modeleViserCible";
import { construireFigureViserCible } from "../../ui/figureViserCible";
import {
  AC,
  CONTEXTES,
  U,
  acLatex,
  conditionIsoleeLatex,
  conditionReduiteLatex,
  conditionSubstitueeLatex,
  fractionLatex,
  kLatex,
  libelleConclusionDirecte,
  libelleConclusionInverse,
  nombreLatex,
  resultatTestFragments,
  variablesEnLatex,
} from "../../ui/formatViserCible";
import { COURS_COLINEARITE, COURS_MILIEU, lignesComposantes, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen89 « Viser une cible : trajectoires rectilignes » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/sessionViserCible.ts::ecransDe`) :
 * a) le vecteur à comparer, b) les composantes de AC, c) le critère de colinéarité (et k) ou la
 * condition en m, d) la conclusion (sens direct) ou la valeur de m, e) le sens par le signe de k.
 * Partagé par l'adaptateur papier et l'appli ; trajectoire prolongée en figure sous la conclusion.
 */

type E = ExerciceViserCible;

function np(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

function figure(e: E): string {
  return construireFigureViserCible(e, { theme: "papier", corrige: true });
}

function etapesCommunes(e: E): EtapeCorrection[] {
  return [
    utilise("a", [
      texte("La trajectoire est la demi-droite d'origine A dirigée par "),
      latex(U),
      texte(" : un point M est atteint si, et seulement si, "),
      latex(`\\vec{AM}=k\\cdot ${U}`),
      texte(" avec "),
      latex("k>0"),
      texte(` ${COURS_MILIEU}. On compare donc à `),
      latex(U),
      texte(" le vecteur qui va du départ A à la cible C."),
    ]),
    calcul("a", [
      ligne(`\\vec{AM}=k\\cdot ${U}`, [texte("M sur la trajectoire, "), latex("k>0")]),
      ligne(`${AC}=k\\cdot ${U}`, "la cible C est touchée si un tel k > 0 existe"),
    ]),
    resultat("a", [texte("Vecteur à comparer : "), latex(AC), texte(" (pas "), latex("\\vec{CA}"), texte(", qui décrit le trajet à l'envers).")]),
    utilise("b", [texte("Composantes d'un vecteur : extrémité moins origine, "), latex("\\vec{AC}\\begin{pmatrix} x_C-x_A \\\\ y_C-y_A \\end{pmatrix}"), texte(".")]),
    calcul("b", lignesComposantes("AC", e.A, e.C)),
    resultat("b", [latex(acLatex(e))]),
  ];
}

const UTILISE_CRITERE: FragmentConsigne[] = [
  texte("Critère du cours : "),
  latex(U),
  texte(" et "),
  latex(AC),
  texte(" sont colinéaires si, et seulement si, "),
  latex("{x_u\\cdot y_{AC}-y_u\\cdot x_{AC}=0}"),
  texte(` ${COURS_COLINEARITE}.`),
];

/** k tel que AC = k·u, calculé sur une composante (non nulle) de u, contrôlé sur l'autre. */
function lignesK(e: E, cle: "x" | "y"): LigneCalcul[] {
  const ac = vecteurAC(e);
  const k = coefficientK(e)!;
  const autre = cle === "x" ? "y" : "x";
  const [cac, cu, aac, au] = cle === "x" ? [ac.x, e.u.x, ac.y, e.u.y] : [ac.y, e.u.y, ac.x, e.u.x];
  return [
    ligne(`${nombreLatex(cac)}=k\\cdot ${np(cu)}`, [texte(`composantes en ${cle} : `), latex(`${cle}_{AC}=k\\cdot ${cle}_u`)]),
    ligne(`k=\\dfrac{${nombreLatex(cac)}}{${nombreLatex(cu)}}`, `on divise par ${nombreLatex(cu).replace("-", "−")}`),
    ligne(`=${fractionLatex(k)}`, "fraction simplifiée"),
    ligne(`k\\cdot ${autre}_u=${fractionLatex(k)}\\cdot ${np(au)}`, `contrôle sur les composantes en ${autre}`),
    ligne(`=${nombreLatex(aac)}`, `c'est bien ${autre}_AC`.replace(`${autre}_AC`, `la composante en ${autre} de AC`)),
  ];
}

function lignesCritere(e: E): LigneCalcul[] {
  const ac = vecteurAC(e);
  const c = critere(e);
  return [
    ligne(`x_u\\cdot y_{AC}-y_u\\cdot x_{AC}=${np(e.u.x)}\\cdot ${np(ac.y)}-${np(e.u.y)}\\cdot ${np(ac.x)}`, "critère de colinéarité"),
    ligne(`=${nombreLatex(e.u.x * ac.y)}-${np(e.u.y * ac.x)}`, "on calcule les produits"),
    ligne(`=${nombreLatex(c)}`, c === 0 ? "nul : u et AC sont colinéaires" : "non nul : u et AC ne sont pas colinéaires"),
  ];
}

function correctionDirecte(e: E): EtapeCorrection[] {
  const c = critere(e);
  const v = verdictDirect(e);
  const etapes: EtapeCorrection[] = [...etapesCommunes(e), utilise("c", [...UTILISE_CRITERE, texte(" S'ils sont colinéaires, k s'obtient sur une composante et se contrôle sur l'autre.")])];
  etapes.push(calcul("c", lignesCritere(e), [], "Critère"));
  if (c === 0) etapes.push(calcul("c", lignesK(e, "x"), [], "Coefficient k"));
  etapes.push(resultat("c", resultatTestFragments(e)));
  const conclusion: LigneCalcul[] = [ligne(`x_u\\cdot y_{AC}-y_u\\cdot x_{AC}=${nombreLatex(c)}`, c === 0 ? "étape c : C est sur la droite du lancer" : "étape c : C n'est pas sur la droite du lancer")];
  if (c !== 0) conclusion[0] = ligne(`${nombreLatex(c)}\\neq 0`, "étape c : critère non nul, C n'est pas sur la droite du lancer");
  else conclusion.push(ligne(`k=${kLatex(e)}${v === "touche" ? ">0" : "<0"}`, v === "touche" ? "même sens : C est devant A" : "sens contraires : C est derrière A"));
  etapes.push(
    utilise("d", [texte("C est touchée si, et seulement si, le critère est nul ET "), latex("k>0"), texte(" (même sens que "), latex(U), texte(").")]),
    calcul("d", conclusion),
    { ...resultat("d", [texte(libelleConclusionDirecte(e, v))]), figureHtml: figure(e) },
  );
  etapes.push(piegeDirect(e));
  return etapes;
}

function piegeDirect(e: E): EtapeCorrection {
  const v = verdictDirect(e);
  const ctx = CONTEXTES[e.situation];
  if (v === "derriere") {
    return piege("d", [texte("Le critère nul ne suffit pas : il dit seulement que C est sur la DROITE du lancer. Le signe de k tranche : ici "), latex(`k = ${kLatex(e)} < 0`), texte(`, ${ctx.mobile} part à l'opposé ${ctx.deCible}.`)]);
  }
  if (v === "cote") {
    const ac = vecteurAC(e);
    const devant = ac.x * e.u.x + ac.y * e.u.y > 0;
    return piege(
      "c",
      devant
        ? [texte("Sur la figure, C semble presque sur la trajectoire : l'œil ne suffit pas. Le critère vaut "), latex(nombreLatex(critere(e))), texte(", pas 0 : la trajectoire passe à moins d'une unité de C, sans l'atteindre.")]
        : [texte("Sur la figure, C semble sur la droite du lancer, derrière A : on croirait à « bonne droite, mauvais sens ». Le critère vaut "), latex(nombreLatex(critere(e))), texte(", pas 0 : C n'est même pas sur cette droite, il en est à moins d'une unité.")],
    );
  }
  const kCA = fraction(-coefficientK(e)!.num, coefficientK(e)!.den);
  return piege("a", [texte("Comparer "), latex("\\vec{CA}"), texte(" au lieu de "), latex(AC), texte(" donnerait "), latex(`k = ${fractionLatex(kCA)} < 0`), texte(" et ferait conclure à tort au « mauvais sens » : le vecteur part toujours du départ A.")]);
}

function correctionInverse(e: E): EtapeCorrection[] {
  const { alpha, beta } = conditionInverse(e);
  const m = solutionM(e);
  const possible = verdictInverse(e) === "possible";
  const ctx = CONTEXTES[e.situation];
  const cleK = e.inconnue === "x" ? "y" : "x";
  const c = composanteConnue(e);
  const k = coefficientK(e)!;
  const lignesM: LigneCalcul[] = [ligne(conditionReduiteLatex(e).replace(/ /g, ""), "condition de l'étape c")];
  if (beta !== 0) lignesM.push(ligne(conditionIsoleeLatex(e).replace(/ /g, ""), beta > 0 ? `on retire ${nombreLatex(beta)} aux deux membres` : `on ajoute ${nombreLatex(-beta)} aux deux membres`));
  if (alpha !== 1) lignesM.push(ligne(`m=\\dfrac{${nombreLatex(-beta)}}{${nombreLatex(alpha)}}`, `on divise par ${nombreLatex(alpha).replace("-", "−")}`), ligne(`=${nombreLatex(m)}`));
  const etapes: EtapeCorrection[] = [
    ...etapesCommunes(e),
    utilise("c", [...UTILISE_CRITERE, texte(" Avec la composante inconnue m, le critère nul est une équation d'inconnue m.")]),
    calcul("c", [
      ligne("x_u\\cdot y_{AC}-y_u\\cdot x_{AC}=0", "u et AC colinéaires"),
      ligne(conditionSubstitueeLatex(e).replace(/ /g, ""), e.inconnue === "x" ? [latex("x_u=m"), texte(", composantes de l'étape b")] : [latex("y_u=m"), texte(", composantes de l'étape b")]),
      ligne(conditionReduiteLatex(e).replace(/ /g, ""), "on calcule et on réduit"),
    ]),
    resultat("c", [latex(conditionSubstitueeLatex(e))]),
    utilise("d", variablesEnLatex([texte("Équation du premier degré d'inconnue m : on isole m.")])),
    calcul("d", lignesM),
    resultat("d", [latex(`m = ${nombreLatex(m)}`), texte(" : "), latex(`\\vec{u}\\begin{pmatrix} ${nombreLatex(e.u.x)} \\\\ ${nombreLatex(e.u.y)} \\end{pmatrix}`), texte(", colinéaire à "), latex(acLatex(e)), texte(".")]),
    verification("d", [texte("Avec cette valeur, le critère est bien nul : ")], lignesCritere(e)),
    utilise("e", [texte("Le signe de k donne le sens : "), latex("k>0"), texte(", "), latex(AC), texte(" et "), latex(U), texte(" ont le même sens (C devant A) ; "), latex("k<0"), texte(", sens contraires (C derrière A).")]),
    calcul("e", [
      ...lignesK(e, cleK).slice(0, 3),
      ligne(`${fractionLatex(k)}${valeurFraction(k) > 0 ? ">0" : "<0"}`, valeurFraction(k) > 0 ? "même sens : C est devant A" : "sens contraires : C est derrière A"),
    ]),
  ];
  if (possible) {
    etapes.push(
      { ...resultat("e", [latex("k > 0"), texte(" : C est devant A, dans le sens de "), latex(U), texte(". "), ...libelleConclusionInverse(e, "possible"), texte(" Il faut "), latex(`m = ${nombreLatex(m)}`), texte(".")]), figureHtml: figure(e) },
      piege("e", [texte("Trouver m ne suffit pas : il faut encore vérifier le sens. Avec une composante imposée de signe contraire, la même équation aurait donné une direction qui part à l'opposé de C.")]),
    );
  } else {
    etapes.push(
      {
        ...resultat("e", [
          latex("k < 0"),
          texte(" : avec "),
          latex(`m = ${nombreLatex(m)}`),
          texte(`, ${ctx.mobile} part sur la droite (AC), mais à l'opposé ${ctx.deCible}. C'est la seule valeur qui rend `),
          latex(U),
          texte(" colinéaire à "),
          latex(AC),
          texte(" : aucune valeur de "),
          latex("m"),
          texte(" ne convient (il faudrait que la composante imposée, "),
          latex(nombreLatex(c)),
          texte(", change de signe)."),
        ]),
        figureHtml: figure(e),
      },
      piege("e", [texte("Répondre "), latex(`m = ${nombreLatex(m)}`), texte(" sans vérifier le sens : "), latex(U), texte(" et "), latex(AC), texte(" sont bien colinéaires, mais de sens contraires.")]),
    );
  }
  return etapes;
}

function corrigeBrutViserCible(e: E): EtapeCorrection[] {
  return (e.sens === "directe" ? correctionDirecte(e) : correctionInverse(e)).map((etape) => ({ ...etape, fragments: variablesEnLatex(etape.fragments) }));
}

export function correctionDetailleeViserCible(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutViserCible(e));
}
