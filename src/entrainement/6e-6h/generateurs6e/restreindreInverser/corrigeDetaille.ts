import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExTrig, ExTrinome, ExerciceRestreindre } from "../../core6e/restreindreInverser";
import { bornesTrig, f, gY0 } from "../../core6e/restreindreInverser";
import { canoniqueL, gTrigL, gTrinomeL, reponse, secondMembre, trinomeL, x0L } from "../../ui6e/formatRestreindreInverser";
import { piL, q } from "../../ui6e/nombresCycloLotG";

/**
 * Corrigé détaillé « comme au tableau » de `6gen159` (restreindre pour inverser), partagé par l'appli
 * et le papier — une lettre par écran : a restriction, b domaine de g (trinôme) ou g(y₀) (angle de
 * l'intervalle, par une identité), c expression de g (on isole x, ou l'identité généralisée).
 */

type E = ExerciceRestreindre;
const t = texte;
const f_ = latex;
const ent = (x: number) => (x < 0 ? `-${-x}` : String(x));
const COURS1 = "(cours, § 1)";
const COURS2 = "(cours, § 2)";
const NOM = { sinus: "\\sin", cosinus: "\\cos", tangente: "\\tan" } as const;
const ARC = { sinus: "arcsin", cosinus: "arccos", tangente: "arctan" } as const;

function etapesTrinome(e: ExTrinome): EtapeCorrection[] {
  const xh = `x${e.h > 0 ? "-" : "+"}${Math.abs(e.h)}`;
  const droite = e.s > 0;
  const y0 = f(e, e.x0);
  const rad0 = e.a === 1 ? y0 - e.k : e.k - y0;
  return [
    utilise("a", [t("Une parabole est strictement monotone de chaque côté de son sommet " + COURS1 + " ; la forme canonique donne le sommet.")]),
    calcul("a", [
      ligne(`f(x)=${trinomeL(e)}`),
      ligne(`=${canoniqueL(e)}`, "forme canonique"),
      ligne(`x_S=${ent(e.h)}`, "abscisse du sommet"),
      ligne(`x_0=${ent(e.x0)}${droite ? ">" : "<"}${ent(e.h)}`, [f_("x_0"), t(` est à ${droite ? "droite" : "gauche"} du sommet`)]),
    ]),
    resultat("a", reponse(e, "intervalle")),
    piege("a", [t("Prendre l'intervalle de l'autre côté du sommet : il ne contient pas "), f_("x_0"), t(".")]),
    utilise("b", [t("Sur la restriction, f part du sommet et tend vers l'infini : son image est le domaine de g " + COURS1 + ".")]),
    calcul("b", [
      ligne(`f(${ent(e.h)})=${ent(e.k)}`, e.a > 0 ? "minimum de f" : "maximum de f"),
      ligne(`\\lim\\limits_{x\\to${droite ? "+" : "-"}\\infty}f(x)=${e.a > 0 ? "+" : "-"}\\infty`, e.a > 0 ? "parabole tournée vers le haut" : "parabole tournée vers le bas"),
    ]),
    resultat("b", reponse(e, "image")),
    utilise("c", [t("On pose "), f_("y=f(x)"), t(" et on isole "), f_("x"), t(" ; sur la restriction, "), f_(`${xh}${droite ? "\\geq" : "\\leq"} 0`), t(" fixe le signe de la racine. On échange enfin les noms des variables " + COURS1 + ".")]),
    calcul("c", [
      ligne(`y=${canoniqueL(e)}`),
      ligne(`(${xh})^{2}=${secondMembre(e)}`, e.a === 1 ? "on isole le carré" : "on isole le carré, on multiplie par −1"),
      ligne(`${xh}=${droite ? "" : "-"}\\sqrt{${secondMembre(e)}}`, [f_(`${xh}${droite ? "\\geq" : "\\leq"} 0`), t(" sur la restriction")]),
      ligne(`x=${e.h}${droite ? "+" : "-"}\\sqrt{${secondMembre(e)}}`),
      ligne(`g(x)=${gTrinomeL(e)}`, "on échange x et y"),
    ]),
    resultat("c", reponse(e, "expression")),
    verification("c", [f_(`f(${ent(e.x0)})=${ent(y0)}`), t(" et "), f_(`g(${ent(y0)})=${e.h}${droite ? "+" : "-"}\\sqrt{${rad0}}=${ent(e.x0)}`), t(" : on retrouve "), f_("x_0"), t(".")]),
    piege("c", [t("Garder les deux signes "), f_("\\pm"), t(" : g ne serait plus une fonction.")]),
  ];
}

function etapesTrig(e: ExTrig): EtapeCorrection[] {
  const [a, b] = bornesTrig(e);
  const fn = NOM[e.variante];
  const arc = ARC[e.variante];
  const P = (x: string) => `\\left(${x}\\right)`;
  const alpha = e.y0.principale;
  const alphaP = alpha.n < 0 ? P(piL(alpha)) : piL(alpha);
  // Écriture brute de g(y₀) et identité utilisée.
  let brut: string;
  let identite: string;
  switch (e.variante) {
    case "sinus":
      brut = `${piL(q(e.j + 1))}${(e.j + 1) % 2 === 0 ? "+" : "-"}${alphaP}`;
      identite = (e.j + 1) % 2 === 0 ? "\\sin(a+2k\\pi)=\\sin a" : "\\sin(\\pi-a)=\\sin a";
      break;
    case "cosinus":
      brut = e.j === -1 ? `-${alphaP}` : Math.abs(e.j) % 2 === 0 ? `${piL(q(e.j))}+${alphaP}` : `${piL(q(e.j + 1))}-${alphaP}`;
      identite = e.j === -1 ? "\\cos(-a)=\\cos a" : Math.abs(e.j) % 2 === 0 ? "\\cos(a+2\\pi)=\\cos a" : "\\cos(2\\pi-a)=\\cos a";
      break;
    case "tangente":
      brut = `${alphaP}${e.j > 0 ? "+" : "-"}${piL(q(Math.abs(e.j)))}`;
      identite = "\\tan(a+k\\pi)=\\tan a";
      break;
  }
  const lignesA =
    e.variante === "tangente"
      ? [ligne(`\\cos${P(piL(a))}=0`, "asymptote verticale"), ligne(`\\cos${P(piL(b))}=0`, "asymptote suivante"), ligne(`${piL(a)}<${x0L(e)}<${piL(b)}`, [f_("x_0"), t(" entre ces deux asymptotes")])]
      : [
          ligne(`${fn}${P(piL(a))}=${f(e, (a.n / a.d) * Math.PI) > 0 ? "1" : "-1"}`, f(e, (a.n / a.d) * Math.PI) > 0 ? "maximum" : "minimum"),
          ligne(`${fn}${P(piL(b))}=${f(e, (b.n / b.d) * Math.PI) > 0 ? "1" : "-1"}`, f(e, (b.n / b.d) * Math.PI) > 0 ? "maximum suivant" : "minimum suivant"),
          ligne(`${piL(a)}<${x0L(e)}<${piL(b)}`, [f_("x_0"), t(" entre ces deux extremums consécutifs")]),
        ];
  const gy = gY0(e);
  return [
    utilise("a", [
      t(
        e.variante === "tangente"
          ? "tan est strictement croissante entre deux asymptotes consécutives "
          : `${e.variante === "sinus" ? "sin" : "cos"} est strictement monotone entre deux extremums consécutifs `,
      ),
      t(COURS2 + "."),
    ]),
    calcul("a", lignesA),
    resultat("a", reponse(e, "intervalle")),
    piege("a", [t("Répondre la restriction principale du cours : elle ne contient pas "), f_("x_0"), t(".")]),
    utilise("b", [t(`${arc} donne l'angle principal ${COURS2} ; une identité donne l'angle de même ${e.variante === "tangente" ? "tangente" : e.variante === "sinus" ? "sinus" : "cosinus"} dans l'intervalle : `), f_(identite), t(".")]),
    calcul("b", [ligne(`\\${arc}${P(e.y0.l)}=${piL(alpha)}`, "angle principal"), ligne(`g${P(e.y0.l)}=${brut}`, [f_(identite)]), ligne(`=${piL(gy)}`)]),
    resultat("b", reponse(e, "valeur")),
    verification("b", [f_(`${fn}${P(piL(gy))}=${e.y0.l}`), t(" et "), f_(`${piL(gy)}\\in ${e.variante === "tangente" ? "\\left]" : "\\left["}${piL(a)}\\,;\\,${piL(b)}${e.variante === "tangente" ? "\\right[" : "\\right]"}`), t(".")]),
    piege("b", [t(`Répondre `), f_(`\\${arc}${P(e.y0.l)}`), t(" : cet angle n'est pas dans l'intervalle.")]),
    utilise("c", [t("Même raisonnement pour tout "), f_("x"), t(" du domaine de g ("), f_(e.variante === "tangente" ? "\\mathbb{R}" : "[-1\\,;\\,1]"), t(") : "), f_(`\\${arc} x`), t(" est l'angle principal, l'identité donne l'angle de l'intervalle.")]),
    calcul("c", [ligne(`${fn}${P(gTrigL(e))}=${fn}(\\${arc} x)`, [f_(identite)]), ligne("=x", `${fn.slice(1)}(${arc} x) = x`), ligne(`g(x)=${gTrigL(e)}`, "cette valeur est dans l'intervalle")]),
    resultat("c", reponse(e, "expression")),
    verification("c", [t("Avec la valeur de l'étape précédente, la formule redonne bien "), f_(`g${P(e.y0.l)}=${piL(gy)}`), t(".")]),
  ];
}

export function correctionDetailleeRestreindre(e: E): EtapeCorrection[] {
  return e.variante === "trinome" ? etapesTrinome(e) : etapesTrig(e);
}
