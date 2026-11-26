import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lettreEtape, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { auCentime, centL, centT, COUL_FLECHE2, decimalL, egalOuApprox, exposant, ligneTempsSvg, montantL, montantT, nL, pourcentFixeL, pourcentL } from "../finance/commun";
import type { ExerciceCredit, PhaseCredit } from "./index";
import { amortissementConstant, capitalEmpruntable, iMensuel, interetRang, mensualiteExacte, mensualiteRang, phasesCredit, restantDuDonne, totalInterets } from "./index";
import { coutCredit, coutCreditExact, lignesAttendues, mensualiteBanque, reponse } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen28` (étape 14 du cours), une lettre par écran ; ligne du
 * temps des mensualités (valeur actuelle = montant emprunté) sous la mensualité ou le montant empruntable.
 */

type E = ExerciceCredit;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const IM = "i_{\\text{mens}}";
const nL4 = (x: number) => nL(x, 4);

function figure(e: E): string {
  const m = e.variante === "montantEmprunte" ? montantT(e.m) : `m ≈ ${centT(mensualiteExacte(e))}`;
  return ligneTempsSvg({
    n: e.n,
    unite: "mois",
    versements: [1, 2, 3, e.n - 1, e.n].map((k) => ({ k, texte: k === 1 ? m : e.variante === "montantEmprunte" ? montantT(e.m) : "m" })),
    marques: [{ k: 0, texte: e.variante === "montantEmprunte" ? `C ≈ ${centT(capitalEmpruntable(e))}` : `C = ${montantT(e.C)}` }],
    fleches: [{ de: e.n, a: 0, texte: `× (1 + i)${exposant(`-${e.n}`)}`, couleur: COUL_FLECHE2 }],
  });
}

function etape(e: E, p: PhaseCredit, l: string): EtapeCorrection[] {
  const i = iMensuel(e);
  switch (p) {
    case "tauxMensuel": {
      const r = 1 + i;
      return [
        utilise(l, [t("Le taux mensuel équivalent au TAEG vérifie "), f(`(1+${IM})^{12}=1+\\text{TAEG}`), t(".")]),
        calcul(l, [ligne(`1+${IM}=\\sqrt[12]{${decimalL(1 + e.taeg / 100)}}\\approx ${nL(r, 7, true)}`), ligne(`${IM}\\approx ${nL(i, 7, true)}\\approx ${pourcentFixeL(100 * i, 3)}`, "en %, au millième")]),
        resultat(l, fr(reponse(e, "tauxMensuel"))),
        piege(l, [t("Diviser le TAEG par 12 : on obtient un taux mensuel un peu trop grand.")]),
      ];
    }
    case "mensualite":
      return [
        utilise(l, [t("Le montant emprunté est la valeur actuelle des mensualités : "), f("C=m\\,\\dfrac{1-(1+i)^{-n}}{i}"), t(", d'où "), f("m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}"), t(" (taux mensuel gardé en mémoire).")]),
        calcul(l, [ligne(`m=\\dfrac{${montantL(e.C)}\\cdot ${IM}}{1-(1+${IM})^{-${e.n}}}`), ligne(`\\approx ${nL(mensualiteExacte(e), 4, true)}`), ligne(`\\approx ${centL(mensualiteExacte(e))}`, "au centime")]),
        { ...resultat(l, [t("Mensualité : "), ...fr(reponse(e, "mensualite")), t(".")]), figureHtml: figure(e) },
      ];
    case "capital":
      return [
        utilise(l, [t("Le montant empruntable est la valeur actuelle des mensualités : "), f("C=m\\,\\dfrac{1-(1+i)^{-n}}{i}"), t(".")]),
        calcul(l, [ligne(`C=${montantL(e.m)}\\cdot\\dfrac{1-(1+${IM})^{-${e.n}}}{${IM}}`), ligne(`\\approx ${nL(capitalEmpruntable(e), 4, true)}`), ligne(`\\approx ${centL(capitalEmpruntable(e))}`, "au centime")]),
        { ...resultat(l, [t("Montant empruntable : "), ...fr(reponse(e, "capital")), t(".")]), figureHtml: figure(e) },
        piege(l, [t("Multiplier la mensualité par le nombre de mois : c'est le total payé, intérêts compris.")]),
      ];
    case "cout":
      if (e.variante === "montantEmprunte")
        return [
          utilise(l, [t("Coût du crédit = total payé − montant emprunté.")]),
          calcul(l, [ligne(`${e.n}\\cdot ${montantL(e.m)}-C\\approx ${montantL(e.n * e.m)}-${centL(capitalEmpruntable(e))}`), ligne(`\\approx ${centL(coutCredit(e))}`)]),
          resultat(l, [t("Coût du crédit : "), ...fr(reponse(e, "cout")), t(".")]),
        ];
      return [
        utilise(l, [t("Coût du crédit = total des mensualités − montant emprunté, avec la mensualité arrondie au centime (celle que l'on paie vraiment).")]),
        calcul(l, [ligne(`${e.n}\\cdot ${centL(mensualiteBanque(e))}-${montantL(e.C)}`), ligne(`${egalOuApprox(coutCredit(e), 2)}${centL(coutCredit(e))}`)]),
        resultat(l, [t("Coût du crédit : "), ...fr(reponse(e, "cout")), t(".")]),
        verification(l, [t("Avec la mensualité non arrondie, on trouverait "), f(`${e.n}\\cdot ${nL(mensualiteExacte(e), 4, true)}-${montantL(e.C)}\\approx ${centL(coutCreditExact(e))}`), t(" € : l'écart vient de l'arrondi de la mensualité.")]),
        piege(l, [t("Donner le total payé comme coût : le coût est seulement ce qu'on paie en plus du montant emprunté.")]),
      ];
    case "ligne1":
    case "ligne2": {
      const [l1, l2] = lignesAttendues(e);
      const ln = p === "ligne1" ? l1 : l2;
      const crd = p === "ligne1" ? restantDuDonne(e) : l1.restant;
      const per = p === "ligne1" ? e.k : e.k + 1;
      return [
        utilise(l, [t(`Période ${per} : intérêts = capital restant dû au début × taux mensuel ; amortissement = mensualité − intérêts ; capital restant dû = ancien − amortissement.`)]),
        calcul(l, [
          ligne(`I=${centL(crd)}\\cdot ${nL(i, 7, true)}\\approx ${centL(ln.interet)}`, "intérêts"),
          ligne(`A\\approx ${centL(e.m)}-${centL(ln.interet)}=${centL(e.m - auCentime(ln.interet))}`, "amortissement"),
          ligne(`R\\approx ${centL(crd)}-${centL(ln.amortissement)}\\approx ${centL(ln.restant)}`, "capital restant dû"),
        ]),
        resultat(l, fr(reponse(e, p))),
        ...(p === "ligne1" ? [piege(l, [t("Calculer les intérêts avec le TAEG (taux annuel) au lieu du taux mensuel équivalent.")])] : [verification(l, [t("L'amortissement augmente d'une ligne à l'autre et les intérêts diminuent : le capital restant dû baisse.")])]),
      ];
    }
    case "amortissement":
      return [
        utilise(l, [t("Amortissement constant : le capital est remboursé en parts égales.")]),
        calcul(l, [ligne(`A=\\dfrac{${montantL(e.C)}}{${e.n}}=${nL4(amortissementConstant(e))}`)]),
        resultat(l, fr(reponse(e, "amortissement"))),
      ];
    case "interet1":
      return [
        utilise(l, [t("Le premier mois, tout le capital est encore dû.")]),
        calcul(l, [ligne(`I_1=${montantL(e.C)}\\cdot ${decimalL(e.r / 100)}=${nL4(interetRang(e, 1))}`)]),
        resultat(l, fr(reponse(e, "interet1"))),
        piege(l, [t("Calculer l'intérêt sur l'amortissement au lieu du capital restant dû.")]),
      ];
    case "nature": {
      const raison = (e.r / 100) * amortissementConstant(e);
      return [
        utilise(l, [t("Le capital restant dû diminue chaque mois de "), f(montantL(amortissementConstant(e))), t(" € : c'est une suite arithmétique ; l'intérêt en est "), f(pourcentL(e.r)), t(".")]),
        calcul(l, [ligne(`I_{k+1}-I_k=-${decimalL(e.r / 100)}\\cdot ${montantL(amortissementConstant(e))}=-${nL(raison, 4)}`)]),
        resultat(l, fr(reponse(e, "nature"))),
        verification(l, [t("La suite des mensualités (amortissement + intérêt) est aussi arithmétique, de même raison.")]),
      ];
    }
    case "mensualiteK": {
      const raison = (e.r / 100) * amortissementConstant(e);
      return [
        utilise(l, [t("Terme général d'une suite arithmétique : "), f("I_k=I_1+(k-1)\\,r"), t(" ; mensualité = amortissement + intérêt.")]),
        calcul(l, [ligne(`I_{${e.rang}}=${nL4(interetRang(e, 1))}+${e.rang - 1}\\cdot(-${nL(raison, 4)})${egalOuApprox(interetRang(e, e.rang), 4)}${nL4(interetRang(e, e.rang))}`), ligne(`m_{${e.rang}}=${nL4(amortissementConstant(e))}+${nL4(interetRang(e, e.rang))}${egalOuApprox(mensualiteRang(e, e.rang), 4)}${nL4(mensualiteRang(e, e.rang))}`)]),
        resultat(l, fr(reponse(e, "mensualiteK"))),
      ];
    }
    case "totalInterets":
      return [
        utilise(l, [t("Somme des termes d'une suite arithmétique : "), f("S_n=\\dfrac{n\\,(I_1+I_n)}{2}"), t(".")]),
        calcul(l, [ligne(`I_{${e.n}}=${nL4(interetRang(e, 1))}+${e.n - 1}\\cdot(-${nL((e.r / 100) * amortissementConstant(e), 4)})${egalOuApprox(interetRang(e, e.n), 4)}${nL4(interetRang(e, e.n))}`), ligne(`S_{${e.n}}=\\dfrac{${e.n}\\cdot(${nL4(interetRang(e, 1))}+${nL4(interetRang(e, e.n))})}{2}${egalOuApprox(totalInterets(e), 2)}${centL(totalInterets(e))}`)]),
        resultat(l, [t("Total des intérêts : "), ...fr(reponse(e, "totalInterets")), t(".")]),
      ];
  }
}

export function correctionDetailleeCredit(e: E): EtapeCorrection[] {
  return phasesCredit(e).flatMap((p, k) => etape(e, p, lettreEtape(k)));
}

