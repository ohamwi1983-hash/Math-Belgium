import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTauxInstantane } from "../../core5e/tauxInstantane";
import { contexte, deriveeCoefs, tauxInstantane, tauxMoyen, valeur } from "../../core5e/tauxInstantane";
import { decL, net, polyDL } from "../../ui5e/ecrituresApplicationsDerivees";
import { F, interpretations, modeleL, reponse, substitutionL, uniteTaux, V } from "../../ui5e/formatTauxInstantane";

/**
 * Corrigé détaillé « comme au tableau » de `5gen70`, une lettre par écran : a) taux moyen
 * (f(b) − f(a))/(b − a), chaque valeur calculée sur sa ligne ; b) f′ terme à terme ; c) f′(a)
 * substitué ; d) unité = unité de f par unité de la variable ; e) interprétation (signe, instant,
 * vitesse) et comparaison au taux moyen.
 */

type E = ExerciceTauxInstantane;
const t = texte;
const f = latex;

function etapeA(e: E): EtapeCorrection[] {
  const n = F(e);
  const fb = valeur(e, e.b);
  const fa = valeur(e, e.a);
  const L: LigneCalcul[] = [
    ligne(`${n}(${e.b})=${substitutionL(e.coefs, e.b)}`, "on remplace"),
    ligne(`=${decL(fb)}`),
    ligne(`${n}(${e.a})=${substitutionL(e.coefs, e.a)}`, "on remplace"),
    ligne(`=${decL(fa)}`),
  ];
  const moinsFa = fa < 0 ? `(${decL(fa)})` : decL(fa);
  if (e.b - e.a === 1) {
    L.push(ligne(`\\dfrac{${n}(${e.b})-${n}(${e.a})}{${e.b}-${e.a}}=${decL(fb)}-${moinsFa}`, "variation de la grandeur, divisée par 1"));
    L.push(ligne(`=${decL(tauxMoyen(e))}`));
  } else {
    L.push(ligne(`\\dfrac{${n}(${e.b})-${n}(${e.a})}{${e.b}-${e.a}}=\\dfrac{${decL(fb)}-${moinsFa}}{${e.b - e.a}}`, "variation de la grandeur sur variation de la variable"));
    L.push(ligne(`=\\dfrac{${decL(net(fb - fa))}}{${e.b - e.a}}`));
    L.push(ligne(`=${decL(tauxMoyen(e))}`));
  }
  return [
    utilise("a", [t("Le taux de variation moyen entre a et b est "), f(`\\dfrac{${n}(b)-${n}(a)}{b-a}`), t(" : la pente de la sécante (cours, § 3).")]),
    calcul("a", L),
    resultat("a", reponse(e, "moyen")),
    piege("a", [t("Oublier de diviser par "), f(`${e.b}-${e.a}`), t(", ou soustraire dans le mauvais ordre.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const n = F(e);
  const v = V(e);
  const deg = e.coefs.length - 1;
  const termes = e.coefs
    .slice(0, -1)
    .map((c, i) => ({ c: net(c), p: deg - i }))
    .filter((x) => x.c !== 0)
    .map((x, k) => {
      const abs = Math.abs(x.c);
      const signe = x.c < 0 ? "-" : k === 0 ? "" : "+";
      if (x.p === 1) return `${signe}${decL(abs)}`;
      const coef = abs === 1 ? "" : `${decL(abs)}\\cdot `;
      return `${signe}${coef}${x.p}${x.p - 1 === 1 ? v : `${v}^${x.p - 1}`}`;
    })
    .join("");
  return [
    utilise("b", [t("On dérive terme à terme : "), f(`(k\\,${v}^n)'=k\\,n\\,${v}^{n-1}`), t(", la dérivée d'une constante est nulle (cours, § 3).")]),
    calcul("b", [ligne(modeleL(e)), ligne(`${n}'(${v})=${termes}`, "terme à terme"), ligne(`=${polyDL(deriveeCoefs(e), v)}`)]),
    resultat("b", reponse(e, "derivee")),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const n = F(e);
  return [
    utilise("c", [t("Le taux de variation instantané en a est le nombre dérivé "), f(`${n}'(a)`), t(" : la pente de la tangente (cours, § 3).")]),
    calcul("c", [ligne(`${n}'(${e.a})=${substitutionL(deriveeCoefs(e), e.a)}`, "on remplace"), ligne(`=${decL(tauxInstantane(e))}`)]),
    resultat("c", reponse(e, "instantane")),
    piege("c", [t("Remplacer dans "), f(`${n}(${V(e)})`), t(" au lieu de "), f(`${n}'(${V(e)})`), t(" : on obtiendrait la valeur de la grandeur, pas sa vitesse de variation.")]),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const c = contexte(e);
  const n = F(e);
  return [
    utilise("d", [t(`Un taux de variation est un quotient : une variation de ${n} (en ${c.uniteF}) divisée par une variation de ${V(e)} (en ${c.uniteX}).`)]),
    calcul("d", [ligne(`${n}'(${e.a})=${decL(tauxInstantane(e))}`, `en ${c.uniteF} par ${c.uniteX}`)]),
    resultat("d", [t(uniteTaux(e))]),
  ];
}

function etapeE(e: E): EtapeCorrection[] {
  const n = F(e);
  const v = tauxInstantane(e);
  const m = tauxMoyen(e);
  return [
    utilise("e", [t("Le signe de "), f(`${n}'(a)`), t(" dit si la grandeur augmente (positif) ou diminue (négatif) à l'instant a ; sa valeur absolue est la vitesse de cette variation.")]),
    calcul("e", [ligne(`${n}'(${e.a})=${decL(v)}${v > 0 ? ">0" : "<0"}`, v > 0 ? "positif : la grandeur augmente" : "négatif : la grandeur diminue")]),
    resultat("e", [t(interpretations(e)[0]!)]),
    verification("e", [t("Le taux moyen sur "), f(`[${e.a}\\,;${e.b}]`), t(" vaut "), f(decL(m)), t(m === v ? " : " : ", différent de "), f(`${n}'(${e.a})=${decL(v)}`), t(" : le premier résume tout l'intervalle, le second ne décrit que l'instant "), f(`${V(e)}=${e.a}`), t(".")]),
    piege("e", [t("Confondre le taux instantané avec le taux moyen, ou avec la valeur "), f(`${n}(${e.a})`), t(" de la grandeur.")]),
  ];
}

export function correctionDetailleeTauxInstantane(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e), ...etapeE(e)];
}
