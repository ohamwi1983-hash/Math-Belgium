import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceBicarree } from "../../core/bicarree.types";
import { solutionsX, tGardees, trinomeT } from "./index";
import { equationLatex, equationTLatex, poseLatex, solutionLatex, uLatex } from "../../ui/formatBicarree";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";
import { polynome, somme } from "../../ui/corrigeChapitre3";
import { COURS_RESOUDRE, lignesDelta, lignesRacines } from "../../ui/corrigeTransfertSecondDegre";

/**
 * Corrigé détaillé « comme au tableau » de gen116 — règle `.claude/rules/feuilles-evaluations.md`.
 * a) changement d'inconnue, b) résolution en t (Δ), c) tri des t (x² ≥ 0), d) retour à x
 * (x² = a ⟺ x = ±√a). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceBicarree;
const n = nombreLatex;

function racineX(v: number): string {
  const r = Math.sqrt(v);
  return Number.isInteger(r) ? String(r) : `\\sqrt{${v}}`;
}

export function correctionDetailleeBicarree(e: E): EtapeCorrection[] {
  const p = trinomeT(e);
  const sortie: EtapeCorrection[] = [];
  const k = e.k;
  const moinsK = k === 0 ? "" : k > 0 ? `-${k}` : `+${-k}`;

  // a) changement d'inconnue
  const lignesA: LigneCalcul[] = [ligne(equationLatex(e), "équation de départ"), ligne(poseLatex(e), k === 0 ? "nouvelle inconnue, t ≥ 0" : "nouvelle inconnue")];
  if (k === 0) lignesA.push(ligne("x^4=(x^2)^2", "on reconnaît un carré"), ligne("=t^2"));
  lignesA.push(ligne(equationTLatex(e), k === 0 ? "on remplace x⁴ par t² et x² par t" : `on remplace chaque (${uLatex(e).replace("^2", "²").replace("-", " − ").replace("+", " + ")}) par t`));
  sortie.push(
    utilise("a", [texte("Changement d'inconnue : une expression qui revient au carré et au premier degré devient une inconnue t, et l'équation devient du second degré "), texte(`${COURS_RESOUDRE}.`)]),
    calcul("a", lignesA),
    resultat("a", [latex(equationTLatex(e))]),
  );

  // b) résoudre en t
  sortie.push(
    utilise("b", [texte("Équation du second degré en t : discriminant "), latex("\\Delta=b^2-4ac"), texte(` ${COURS_RESOUDRE}.`)]),
    calcul("b", [...lignesDelta(p), ...lignesRacines(p, "t")]),
    resultat("b", [latex(`t_1=${n(e.t1)}`), texte(" et "), latex(`t_2=${n(e.t2)}`)]),
  );

  // c) tri
  const lignesC: LigneCalcul[] = [e.t1, e.t2].map((t) => {
    const v = t - k;
    return ligne(k === 0 ? `x^2=${n(t)}${v > 0 ? ">" : "<"}0` : `x^2=${n(t)}${moinsK}=${n(v)}${v > 0 ? ">" : "<"}0`, v > 0 ? `t = ${String(t).replace("-", "−")} est gardé` : `un carré n'est jamais négatif : t = ${String(t).replace("-", "−")} est rejeté`);
  });
  const g = tGardees(e);
  sortie.push(
    utilise("c", [texte("Un carré n'est jamais négatif : "), latex(k === 0 ? "t=x^2\\geq 0" : `x^2=t${moinsK}\\geq 0`), texte(".")]),
    calcul("c", lignesC),
    resultat("c", g.length === 0 ? [texte("Aucune valeur de t n'est gardée.")] : g.length === 1 ? [texte("On garde "), latex(`t=${n(g[0]!)}`), texte(".")] : [texte("On garde "), latex(`t=${n(e.t1)}`), texte(" et "), latex(`t=${n(e.t2)}`), texte(".")]),
    piege("c", [texte("Une valeur de t négative n'est pas une solution « négative » de (E) : elle ne donne aucune solution du tout.")]),
  );

  // d) revenir à x
  const lignesD: LigneCalcul[] = g.length
    ? g.flatMap((t) => {
        const v = t - k;
        const l = [ligne(`x^2=${n(v)}`, k === 0 ? `t = ${String(t).replace("-", "−")}` : `t = ${String(t).replace("-", "−")}, donc x² = t ${k > 0 ? "−" : "+"} ${Math.abs(k)}`), ligne(`x=-\\sqrt{${n(v)}}\\text{ ou }x=\\sqrt{${n(v)}}`, "deux solutions opposées")];
        if (Number.isInteger(Math.sqrt(v))) l.push(ligne(`x=-${racineX(v)}\\text{ ou }x=${racineX(v)}`, `√${v} = ${Math.sqrt(v)}`));
        return l;
      })
    : [ligne("S=\\varnothing", "aucune valeur de t gardée")];
  const xs = solutionsX(e);
  const tv = xs.length ? Math.round(xs[xs.length - 1]! ** 2) + k : 0;
  sortie.push(
    utilise("d", [texte("Si "), latex("x^2=a"), texte(" avec a > 0, alors "), latex("x=\\sqrt{a}"), texte(" ou "), latex("x=-\\sqrt{a}"), texte(".")]),
    calcul("d", lignesD),
    resultat("d", [latex(solutionLatex(e))]),
    ...(xs.length
      ? [verification("d", [texte("On remplace x dans (E) : ")], [ligne(`${k === 0 ? polynome([p[0], 0, p[1], 0, p[2]], `(${n(xs[xs.length - 1]!)})`) : polynome([p[0], p[1], p[2]], `((${n(xs[xs.length - 1]!)})^2${k > 0 ? `+${k}` : k})`)}=${somme([[p[0] * tv * tv, ""], [p[1] * tv, ""], [p[2], ""]])}`, `pour x = ${n(xs[xs.length - 1]!).replace(/\\sqrt\{(\d+)\}/, "√$1")}, ${k === 0 ? "x² vaut t" : "la parenthèse vaut t"}`), ligne("=0")])]
      : []),
  );
  return sortie;
}
