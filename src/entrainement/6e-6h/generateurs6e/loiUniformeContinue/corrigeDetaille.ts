import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice115 } from "../../core6e/loiUniformeContinue";
import { densite115, esperance115, intersection, longueur, phases115, proba115, probaInv115, variance115 } from "../../core6e/loiUniformeContinue";
import { evenement115, evenementInv115, reponse115, sigmaArrondi, varianceLatex } from "../../ui6e/formatLoiUniformeContinue";
import { dl, fr, q, ql, qdl } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen115`, une lettre par écran : densité 1/(b − a),
 * probabilité par la longueur (intersection avec [a ; b] quand l'intervalle déborde), E, V, σ ;
 * variante inverse : (b − a)² = 12 V, système a + b = 2E et b − a = L, puis P(X ≤ c). Même source que
 * l'écran (`reponse115`).
 */

type E = Exercice115;
const t = tx;
const l = lx;

export function correctionDetaillee115(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const L = longueur(e);
  const { a, b } = e;
  phases115(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    switch (ph) {
      case "densite":
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : densité constante "), l("f(x)=\\dfrac{1}{b-a}"), t(" sur "), l("[a\\,;b]"), t(".")]),
          calcul(sq, [ligne(`f(x)=\\dfrac{1}{${b}-${a}}`), ligne(`=${ql(densite115(e))}`)]),
          resultat(sq, fr(reponse115(e, ph))),
          verification(sq, [t("L'aire du rectangle sous la densité vaut "), l(`${L}\\times ${ql(densite115(e))}=1`), t(".")]),
          piege(sq, [t("Prendre "), l(`b-a=${L}`), t(" comme densité : c'est son inverse qui fait valoir 1 à l'aire.")]),
        );
        break;
      case "proba": {
        const { type, c, d } = e.evenement!;
        const [c2, d2] = intersection(e);
        const lignes: LigneCalcul[] = [];
        if (type !== "entre") lignes.push(ligne(`${evenement115(e)}=P(${c2}\\leq X\\leq ${d2})`, type === "deborde" ? `X ne prend aucune valeur hors de [${a} ; ${b}]` : "X reste dans l'intervalle"));
        lignes.push(ligne(`${type === "entre" ? evenement115(e) : ""}=\\dfrac{${d2}-${c2}}{${b}-${a}}`, "longueur sur longueur"), ligne(`=\\dfrac{${d2 - c2}}{${L}}`));
        if (ql(proba115(e)) !== `\\dfrac{${d2 - c2}}{${L}}`) lignes.push(ligne(`=${ql(proba115(e))}`, "on simplifie"));
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("P(c\\leq X\\leq d)=\\dfrac{d-c}{b-a}"), t(" pour "), l("[c\\,;d]"), t(" contenu dans "), l("[a\\,;b]"), t(".")]),
          calcul(sq, lignes),
          resultat(sq, fr(reponse115(e, ph))),
          piege(sq, type === "deborde" ? [t("Calculer "), l(`\\dfrac{${d}-${c}}{${L}}`), t(" avec l'intervalle tel quel : la partie hors de "), l(`[${a}\\,;${b}]`), t(" a une probabilité nulle.")] : [t("Diviser par b au lieu de "), l("b-a"), t(" : la longueur totale est "), l(`${b}-${a}=${L}`), t(".")]),
        );
        break;
      }
      case "esperance":
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("E(X)=\\dfrac{a+b}{2}"), t(", le milieu de l'intervalle.")]),
          calcul(sq, [ligne(`E(X)=\\dfrac{${a}+${b}}{2}`), ligne(`=\\dfrac{${a + b}}{2}`), ligne(`=${dl(esperance115(e))}`)]),
          resultat(sq, fr(reponse115(e, ph))),
          piege(sq, [t("Prendre "), l(`\\dfrac{${b}}{2}`), t(" ou "), l(`\\dfrac{b-a}{2}`), t(" : l'intervalle ne commence pas en 0.")]),
        );
        break;
      case "dispersion": {
        const V = variance115(e);
        const Vl = varianceLatex(e);
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("V(X)=\\dfrac{(b-a)^2}{12}"), t(" et "), l("\\sigma(X)=\\sqrt{V(X)}"), t(".")]),
          calcul(sq, [
            ligne(`V(X)=\\dfrac{(${b}-${a})^2}{12}`),
            ligne(`=\\dfrac{${L}^2}{12}`),
            ligne(`=\\dfrac{${L * L}}{12}`),
            ligne(`=${ql(V)}`),
            ...(Vl !== ql(V) ? [ligne(`=${Vl}`, "valeur décimale")] : []),
          ]),
          calcul(sq, [ligne(`\\sigma(X)=\\sqrt{${Vl}}`), ligne(`\\approx ${dl(sigmaArrondi(e))}`, "arrondi au centième")], [t("Écart-type :")]),
          resultat(sq, fr(reponse115(e, ph))),
          piege(sq, [t("Oublier le carré : "), l(`\\dfrac{${L}}{12}`), t(" n'est pas la variance.")]),
        );
        break;
      }
      case "longueur": {
        const V = variance115(e);
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("V(X)=\\dfrac{(b-a)^2}{12}"), t(", et "), l("b-a>0"), t(".")]),
          calcul(sq, [ligne(`\\dfrac{(b-a)^2}{12}=${varianceLatex(e)}`), ligne(`(b-a)^2=12\\times ${varianceLatex(e)}`, "on multiplie par 12"), ligne(`(b-a)^2=${L * L}`), ligne(`b-a=${L}`, "racine positive")]),
          resultat(sq, fr(reponse115(e, ph))),
          verification(sq, [l(`\\dfrac{${L}^2}{12}=${qdl(V)}`), t(" : on retrouve la variance.")]),
          piege(sq, [t("Oublier la racine carrée : "), l(`${L * L}`), t(" est "), l("(b-a)^2"), t(", pas la longueur.")]),
        );
        break;
      }
      case "bornes": {
        const E2 = 2 * esperance115(e);
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("E(X)=\\dfrac{a+b}{2}"), t(" ; avec "), l(`b-a=${L}`), t(", on obtient un système.")]),
          calcul(sq, [
            ligne(`\\dfrac{a+b}{2}=${dl(esperance115(e))}`),
            ligne(`a+b=${dl(E2)}`, "on multiplie par 2"),
            ligne(`2b=${dl(E2)}+${L}`, `on ajoute b − a = ${L}`),
            ligne(`b=${b}`),
            ligne(`a=${dl(E2)}-${b}=${a}`, "a = (a + b) − b"),
          ]),
          resultat(sq, fr(reponse115(e, ph))),
          verification(sq, [l(`\\dfrac{${a}+${b}}{2}=${dl(esperance115(e))}`), t(" et "), l(`\\dfrac{(${b}-${a})^2}{12}=${varianceLatex(e)}`), t(".")]),
          piege(sq, [t("Placer a et b à une longueur entière de l'espérance : l'espérance est au milieu, à une demi-longueur de chaque borne.")]),
        );
        break;
      }
      case "probaInv": {
        const P = probaInv115(e);
        out.push(
          utilise(sq, [t("Loi uniforme (cours, point 5) : "), l("P(X\\leq c)=P(a\\leq X\\leq c)=\\dfrac{c-a}{b-a}"), t(".")]),
          calcul(sq, [
            ligne(`${evenementInv115(e)}=\\dfrac{${e.cInv}-${a}}{${L}}`),
            ligne(`=\\dfrac{${e.cInv! - a}}{${L}}`),
            ...(ql(P) !== `\\dfrac{${e.cInv! - a}}{${L}}` ? [ligne(`=${ql(P)}`, "on simplifie")] : []),
          ]),
          resultat(sq, fr(reponse115(e, ph))),
          piege(sq, [t("Calculer "), l(`\\dfrac{${e.cInv}}{${L}}`), t(" : l'intervalle commence en "), l(`a=${a}`), t(", pas en 0.")]),
        );
        break;
      }
    }
  });
  return out;
}

export { q };
