import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice134 } from "../../core6e/reduireConique";
import { phases134, polyDonne } from "../../core6e/reduireConique";
import { aEx, bEx, c2, cEx, equationReduiteL, exL, facteurL, penteAsymptote } from "../../core6e/coniquesLotH1";

/** Coefficient devant x (1 omis). */
const coefL = (m: number) => (Math.abs(m - 1) < 1e-12 ? "" : nb(m));
import { equationDonneeL, figureCorrige134, reponse134 } from "../../ui6e/formatReduireConique";
import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import { fr, l, nb, somme, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen134`, une lettre par écran : complétion des carrés une
 * transformation par ligne (regroupement, coefficient en évidence, carrés complétés, constantes
 * rassemblées), division par le second membre (ou carré isolé pour la parabole), lecture de la nature,
 * éléments calculés dans le repère translaté puis ramenés au repère initial (x = x′ + h, y = y′ + k).
 * Figure complète sous le dernier résultat. Même source que l'écran.
 */

type E = Exercice134;

/** « 3\left(x^2-4x\right) », « y^2+6y » (coefficient 1 sans parenthèses). */
function groupeL(A: number, D: number, v: string): string {
  const interieur = somme([[1, `${v}^2`], [D / A, v]]);
  return A === 1 ? interieur : `${nb(A)}\\left(${interieur}\\right)`;
}

/** Complétion des carrés jusqu'à la forme A(x − h)² + B(y − k)² = S (ou B(y − k)² = −D(x − h)). */
export function lignesCompletion(e: E): LigneCalcul[] {
  const C = e.C;
  const P = polyDonne(e);
  const A = P.x2 ?? 0;
  const B = P.y2 ?? 0;
  const D = P.x ?? 0;
  const Ee = P.y ?? 0;
  const F = P["1"] ?? 0;
  const out: LigneCalcul[] = [ligne(equationDonneeL(e), "équation donnée")];
  if (A !== 0 && B !== 0) {
    out.push(ligne(`${groupeL(A, D, "x")}${B > 0 ? "+" : "-"}${groupeL(Math.abs(B), Math.sign(B) * Ee, "y")}=${nb(-F)}`, "on regroupe, coefficient du carré en évidence"));
    const S = A * C.h * C.h + B * C.k * C.k - F;
    const terme = (coef: number, v: string, c: number) => `${coef === 1 ? "" : coef === -1 ? "-" : nb(coef)}${facteurL(v, c)}^2`;
    out.push(ligne(`${terme(A, "x", C.h)}${B > 0 ? "+" : ""}${terme(B, "y", C.k)}=${nb(-F)}${A * C.h * C.h >= 0 ? "+" : ""}${nb(A * C.h * C.h)}${B * C.k * C.k >= 0 ? "+" : ""}${nb(B * C.k * C.k)}`, "on complète les carrés"));
    out.push(ligne(`${terme(A, "x", C.h)}${B > 0 ? "+" : ""}${terme(B, "y", C.k)}=${nb(S)}`, S < 0 ? "second membre négatif" : "constantes rassemblées"));
    return out;
  }
  // Parabole : un seul carré.
  const carreX = A !== 0;
  const Q = carreX ? A : B;
  const L = carreX ? D : Ee;
  const v = carreX ? "x" : "y";
  const w = carreX ? "y" : "x";
  const c = carreX ? C.h : C.k;
  const autre = carreX ? C.k : C.h;
  const lin = carreX ? Ee : D;
  out.push(ligne(`${groupeL(Q, L, v)}=${somme([[-lin, w], [-F, ""]])}`, "on isole les termes du carré"));
  out.push(ligne(`${Q === 1 ? "" : nb(Q)}${facteurL(v, c)}^2=${somme([[-lin, w], [-F + Q * c * c, ""]])}`, "on complète le carré"));
  out.push(ligne(`${Q === 1 ? "" : nb(Q)}${facteurL(v, c)}^2=${nb(-lin)}${facteurL(w, autre)}`, `on met ${nb(-lin).replace("-", "−")} en évidence`));
  return out;
}

export function correctionDetaillee134(e: E): EtapeCorrection[] {
  const C = e.C;
  const out: EtapeCorrection[] = [];
  const phases = phases134(e);
  const P = polyDonne(e);
  const trans = `x=x'${C.h >= 0 ? "+" : ""}${nb(C.h)},\\ y=y'${C.k >= 0 ? "+" : ""}${nb(C.k)}`;
  phases.forEach((ph, i) => {
    const sq = lettreEtape(i);
    const fin = i === phases.length - 1;
    const res = fin ? { ...resultat(sq, fr(reponse134(e, ph))), figureHtml: figureCorrigeLot(figureCorrige134(e)) } : resultat(sq, fr(reponse134(e, ph)));
    switch (ph) {
      case "centre":
        out.push(
          utilise(sq, [t("Réduction par translation (cours, § 2) : on complète les carrés, en ajoutant la même quantité aux deux membres.")]),
          calcul(sq, lignesCompletion(e)),
          res,
          piege(sq, [t("Oublier de mettre le coefficient du carré en évidence, ou se tromper de signe : "), l("(x+2)^2"), t(" donne h = −2.")]),
        );
        break;
      case "reduite": {
        const lignes: LigneCalcul[] = [];
        if (C.nature !== "parabole") {
          const A = P.x2 ?? 0;
          const B = P.y2 ?? 0;
          const S = A * C.h * C.h + B * C.k * C.k - (P["1"] ?? 0);
          lignes.push(ligne(`\\dfrac{${nb(A)}x'^2}{${nb(S)}}${B * S > 0 ? "+" : "-"}\\dfrac{${nb(Math.abs(B))}y'^2}{${nb(Math.abs(S))}}=1`, `on divise par ${nb(S).replace("-", "−")}, puis x − h = x′, y − k = y′`));
        } else {
          lignes.push(ligne(`${C.axe === "x" ? "y'^2" : "x'^2"}=${nb(2 * C.sens * C.p)}${C.axe === "x" ? "x'" : "y'"}`, e.m === 1 ? "x − h = x′, y − k = y′" : `on divise par ${e.m}, puis x − h = x′, y − k = y′`));
        }
        lignes.push(ligne(equationReduiteL(C, true), "forme réduite"));
        out.push(utilise(sq, [t("Changement de repère (cours, § 2) : origine en Ω, "), l(`x'=${facteurL("x", C.h).replace(/^\(|\)$/g, "")}`), t(" et "), l(`y'=${facteurL("y", C.k).replace(/^\(|\)$/g, "")}`), t(".")]), calcul(sq, lignes), res);
        if (C.nature === "hyperbole") out.push(piege(sq, [t("Diviser par un second membre négatif sans inverser les deux signes : l'axe focal serait faux.")]));
        break;
      }
      case "nature":
        out.push(utilise(sq, [t("Reconnaître une conique sur l'équation réduite (cours, § 1).")]), res);
        break;
      case "sommets":
        out.push(
          utilise(sq, [t("Sommets (cours, § 1) calculés dans le repère translaté, puis "), l(trans), t(".")]),
          calcul(sq, [ligne(`a=${exL(aEx(C))}${C.nature === "ellipse" ? `,\\ b=${exL(bEx(C))}` : ""}`), ligne(C.axe === "x" ? `(\\pm a\\,;0)${C.nature === "ellipse" ? "\\ \\text{et}\\ (0\\,;\\pm b)" : ""}` : `(0\\,;\\pm a)${C.nature === "ellipse" ? "\\ \\text{et}\\ (\\pm b\\,;0)" : ""}`, "dans le repère translaté")]),
          res,
        );
        break;
      case "foyers": {
        const ell = C.nature === "ellipse";
        out.push(
          utilise(sq, [t("Foyers (cours, § 1) : "), l(ell ? "c^2=a^2-b^2" : "c^2=a^2+b^2"), t(", sur l'axe focal, puis "), l(trans), t(".")]),
          calcul(sq, [ligne(`c^2=${nb(C.a2)}${ell ? "-" : "+"}${nb(C.b2)}=${nb(c2(C))}`), ligne(`c=${exL(cEx(C))}`)]),
          res,
        );
        break;
      }
      case "directrices": {
        const c = cEx(C);
        out.push(
          utilise(sq, [t("Directrices (cours, § 2) : perpendiculaires à l'axe focal, à la distance "), l("\\dfrac{a^2}{c}"), t(" du centre.")]),
          calcul(sq, [ligne(`\\dfrac{a^2}{c}=\\dfrac{${nb(C.a2)}}{${exL(c)}}=${nb(C.a2 / (c.q + c.r * Math.sqrt(c.n)))}`), ligne(`${C.axe === "x" ? "x'" : "y'"}=\\pm\\dfrac{a^2}{c}`, "dans le repère translaté")]),
          res,
          verification(sq, [t("Les directrices sont au-delà des sommets ("), l("\\dfrac{a^2}{c}>a"), t(" car c < a).")]),
        );
        break;
      }
      case "asymptotes":
        out.push(
          utilise(sq, [t("Asymptotes (cours, § 1) : "), l(C.axe === "x" ? "y'=\\pm\\dfrac{b}{a}x'" : "y'=\\pm\\dfrac{a}{b}x'"), t(" dans le repère translaté ; elles passent par Ω.")]),
          calcul(sq, [ligne(`y'=\\pm\\dfrac{${exL(C.axe === "x" ? bEx(C) : aEx(C))}}{${exL(C.axe === "x" ? aEx(C) : bEx(C))}}\\,x'=\\pm ${coefL(penteAsymptote(C))}x'`), ligne(`${facteurL("y", C.k)}=\\pm ${coefL(penteAsymptote(C))}${facteurL("x", C.h)}`, "on revient au repère initial")]),
          res,
          piege(sq, [t("Garder les asymptotes du repère translaté, qui passent par l'origine au lieu du centre Ω.")]),
        );
        break;
      case "parametre":
        out.push(
          utilise(sq, [t("Parabole (cours, § 1) : dans "), l("y'^2=2p\\,x'"), t(", le coefficient vaut 2p ; p est la distance du foyer à la directrice.")]),
          calcul(sq, [ligne(`2p=${nb(2 * C.p)}\\ \\Rightarrow\\ p=${nb(C.p)}`, "coefficient en valeur absolue")]),
          res,
          piege(sq, [t("Répondre 2p (le coefficient) ou p/2 (la distance du sommet au foyer).")]),
        );
        break;
      case "foyer":
        out.push(
          utilise(sq, [t("Foyer (cours, § 1) : à la distance "), l("\\dfrac{p}{2}"), t(" du sommet Ω, du côté de l'ouverture, puis "), l(trans), t(".")]),
          calcul(sq, [ligne(`\\dfrac{p}{2}=${nb(C.p / 2)}`)]),
          res,
        );
        break;
      case "directrice":
        out.push(utilise(sq, [t("Directrice (cours, § 1) : perpendiculaire à l'axe focal, à la distance "), l("\\dfrac{p}{2}"), t(" du sommet, du côté opposé au foyer.")]), res, verification(sq, [t("Le sommet Ω est le milieu du segment qui joint le foyer à la directrice.")]));
        break;
    }
  });
  return out;
}
