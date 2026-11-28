import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePL } from "../../core6e/poissonInverse";
import { auMoins, cumul, lambdaAjuste, lambdaBase, lambdaFinal, modes, p0, probaFinale, seuil, terme } from "../../core6e/poissonInverse";
import { evenementL, reponse } from "../../ui6e/formatPoissonInverse";
import { nL, p4L } from "../../ui6e/textesLoisLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen121`, partagé par l'appli et le papier — une lettre par
 * écran : λ par le logarithme ou par la récurrence, λ ajusté par proportionnalité, E = V = λ et
 * σ = √λ, valeur la plus probable par les rapports λ/k, seuil d'alerte par le tableau des P(X ≥ k)
 * successives, probabilité finale avec la formule du cours. Valeurs arrondies au dix-millième.
 */

type E = ExercicePL;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const r4 = (x: number) => p4L(Math.round(x * 1e4) / 1e4);

function lignesProba(e: E): LigneCalcul[] {
  const lam = nL(lambdaFinal(e));
  const L = lambdaFinal(e);
  const d = e.d;
  if (e.variante === "mode") {
    const k = modes(L)[0]!;
    return [ligne(`P(X=${k})=e^{-${lam}}\\,\\dfrac{${lam}^{${k}}}{${k}!}`), ligne(`\\approx ${r4(terme(L, k))}`, "arrondi au dix-millième")];
  }
  if (e.variante === "seuil") {
    const k = seuil(L, d.a100! / 100);
    return [ligne(`${evenementL(e)}=1-P(X\\le ${k - 1})`, "contraire"), ligne(`=1-${r4(cumul(L, k - 1))}`, "loi de Poisson cumulée"), ligne(`\\approx ${r4(auMoins(L, k))}`)];
  }
  const Y = e.variante === "lambdaZero" ? "Y" : "X";
  if (d.q === 1) return [ligne(`${evenementL(e)}=P(${Y}=0)+P(${Y}=1)`, "deux cas"), ligne(`=e^{-${lam}}(1+${lam})`), ligne(`\\approx ${r4(probaFinale(e))}`, "arrondi au dix-millième")];
  return [ligne(`${evenementL(e)}=e^{-${lam}}\\,\\dfrac{${lam}^{${d.j}}}{${d.j}!}`), ligne(`\\approx ${r4(probaFinale(e))}`, "arrondi au dix-millième")];
}

export function correctionDetailleePL(e: E): EtapeCorrection[] {
  const d = e.d;
  const lb = lambdaBase(e);
  const L = lambdaFinal(e);
  const etapes: EtapeCorrection[] = [];
  const lettres = "abc";
  let i = 0;
  const next = () => lettres[i++]!;
  if (e.variante === "lambdaZero") {
    const a = next();
    etapes.push(
      utilise(a, [t("Loi de Poisson (cours, point 8) : "), f("P(X=0)=e^{-\\lambda}"), t(".")]),
      calcul(a, [ligne(`e^{-\\lambda}=${p4L(p0(e))}`, "donnée"), ligne(`-\\lambda=\\ln ${p4L(p0(e))}`, "logarithme népérien"), ligne(`\\lambda=-\\ln ${p4L(p0(e))}\\approx ${nL(Math.round(-Math.log(p0(e)) * 100) / 100, 2)}`), ligne(`\\lambda=${nL(lb)}`, "au centième")]),
      resultat(a, fr(reponse(e, "lambda"))),
    );
  }
  if (e.variante === "egalite") {
    const a = next();
    const c = d.c2! / 2;
    etapes.push(
      utilise(a, [t("Récurrence du cours (point 8) : "), f("P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}"), t(".")]),
      calcul(a, [ligne(`P(X=${d.k! + 1})=P(X=${d.k})\\times\\dfrac{\\lambda}{${d.k! + 1}}`, "récurrence"), ligne(`\\dfrac{\\lambda}{${d.k! + 1}}=${nL(c)}`, "relation observée"), ligne(`\\lambda=${nL(c)}\\times ${d.k! + 1}=${nL(lb)}`)]),
      resultat(a, fr(reponse(e, "lambda"))),
    );
    const b = next();
    etapes.push(
      utilise(b, [t("Pour une loi de Poisson, "), f("E(X)=V(X)=\\lambda"), t(" (cours, point 8) ; "), f("\\sigma=\\sqrt{V}"), t(".")]),
      calcul(b, [ligne(`E(X)=\\lambda=${nL(lb)}`), ligne(`\\sigma(X)=\\sqrt{${nL(lb)}}${Math.abs(Math.sqrt(lb) * 100 - Math.round(Math.sqrt(lb) * 100)) < 1e-9 ? "=" : "\\approx "}${nL(Math.round(Math.sqrt(lb) * 100) / 100, 2)}`)]),
      resultat(b, fr(reponse(e, "esperance"))),
    );
  }
  if (e.variante === "lambdaZero" || e.variante === "seuil") {
    const b = next();
    etapes.push(
      utilise(b, [f("\\lambda"), t(" est proportionnel à la durée (ou au nombre de pages) : on ajuste le taux connu à l'échelle de la question (cours, point 8).")]),
      calcul(b, [ligne(`\\lambda=${nL(lb)}\\times ${d.m}=${nL(lambdaAjuste(e))}`, `échelle multipliée par ${d.m}`)]),
      resultat(b, fr(reponse(e, "lambdaAjuste"))),
    );
  }
  if (e.variante === "mode") {
    const a = next();
    const m = modes(L);
    const k0 = Math.floor(L);
    etapes.push(
      utilise(a, [t("Récurrence : "), f("P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}"), t(" ; les probabilités augmentent tant que "), f("\\dfrac{\\lambda}{k}>1"), t(", c'est-à-dire "), f("k<\\lambda"), t(".")]),
      calcul(a, [
        ...(k0 >= 1 ? [ligne(`\\dfrac{\\lambda}{${k0}}=\\dfrac{${nL(L)}}{${k0}}${m.length === 2 ? "=1" : ">1"}`, m.length === 2 ? `P(X=${k0}) = P(X=${k0 - 1})` : `P(X=${k0}) > P(X=${k0 - 1})`)] : []),
        ligne(`\\dfrac{\\lambda}{${k0 + 1}}=\\dfrac{${nL(L)}}{${k0 + 1}}<1`, `P(X=${k0 + 1}) < P(X=${k0})`),
      ]),
      resultat(a, fr(reponse(e, "mode"))),
    );
  }
  if (e.variante === "seuil") {
    const c = next();
    const k = seuil(L, d.a100! / 100);
    const a = d.a100! / 100;
    etapes.push(
      utilise(c, [t("On cherche le plus petit "), f("k"), t(" tel que "), f(`P(X\\ge k)\\le ${nL(a)}`), t(", avec "), f("P(X\\ge k)=1-P(X\\le k-1)"), t(".")]),
      calcul(c, [ligne(`P(X\\ge ${k - 1})=1-P(X\\le ${k - 2})\\approx ${r4(auMoins(L, k - 1))}`, `plus grand que ${nL(a).replace("{,}", ",")}`), ligne(`P(X\\ge ${k})=1-P(X\\le ${k - 1})\\approx ${r4(auMoins(L, k))}`, `inférieur ou égal à ${nL(a).replace("{,}", ",")}`)]),
      resultat(c, fr(reponse(e, "seuil"))),
    );
  }
  const z = next();
  etapes.push(
    utilise(z, [t("Loi de Poisson : "), f("P(X=k)=e^{-\\lambda}\\dfrac{\\lambda^k}{k!}"), t(".")]),
    calcul(z, lignesProba(e)),
    resultat(z, fr(reponse(e, "proba"))),
    verification(z, [t("C'est bien une probabilité :")], [ligne(`0\\le ${r4(probaFinale(e))}\\le 1`)]),
    piege(
      z,
      e.variante === "lambdaZero" || e.variante === "seuil"
        ? [t("Garder le taux de départ "), f(`\\lambda=${nL(lb)}`), t(" sans l'ajuster à l'échelle de la question.")]
        : e.variante === "mode"
          ? [t("Pour "), f("\\lambda"), t(" entier, oublier qu'il y a deux valeurs les plus probables, "), f("\\lambda-1"), t(" et "), f("\\lambda"), t(".")]
          : [t("Prendre "), f("\\sigma=\\lambda"), t(" : c'est la variance qui vaut "), f("\\lambda"), t(".")],
    ),
  );
  return etapes;
}
