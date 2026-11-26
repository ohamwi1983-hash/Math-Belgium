import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lettreEtape, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { centL, COUL_FLECHE2, decimalL, egalOuApprox,exposant, ligneTempsSvg, montantL, nL, nT, pourcentFixeL, pourcentL } from "../finance/commun";
import type { ExerciceTauxEquivalents, Periode, PhaseTauxEquivalents } from "./index";
import { annuelDe, depreciationAnnuelle, periodiqueDe, phasesTauxEquivalents, tauxMoyen, tauxNet, valeurDepreciee } from "./index";
import { interetBrut, interetNet, NOM_PERIODE, reponse } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen26` (étape 12 du cours), une lettre par écran ; ligne
 * du temps d'une année découpée en périodes sous la relation des taux équivalents.
 */

type E = ExerciceTauxEquivalents;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const iP = (k: Periode) => `i_{${NOM_PERIODE[k].indice}}`;
const IA = "i_{\\text{an}}";

function ligneAnnee(k: Periode, facteurT: string, versAnnuel: boolean): string {
  const mois = NOM_PERIODE[k].mois;
  return ligneTempsSvg({
    n: k,
    unite: "mois",
    etiquette: (j) => String(j * mois),
    fleches: [
      { de: 0, a: 1, texte: versAnnuel ? `× ${facteurT}` : "× (1 + i)" },
      { de: 0, a: k, texte: versAnnuel ? `× ${facteurT}${exposant(k)} = × (1 + i annuel)` : `× ${facteurT} sur un an`, couleur: COUL_FLECHE2 },
    ],
  });
}

function lignesAnnuel(k: Periode, taux: number, nom = IA) {
  const F = Math.pow(1 + taux / 100, k);
  return [
    ligne(`1+${nom}=(1+${iP(k)})^{${k}}=${decimalL(1 + taux / 100)}^{${k}}`),
    ligne(`\\approx ${nL(F, 6, true)}`),
    ligne(`${nom}\\approx ${nL(F - 1, 6, true)}\\approx ${pourcentFixeL(annuelDe(k, taux), 2)}`, "en %, au centième"),
  ];
}

function etape(e: E, p: PhaseTauxEquivalents, l: string): EtapeCorrection[] {
  switch (p) {
    case "relation": {
      if (e.variante === "depreciation")
        return [
          utilise(l, [t("Perdre "), f("d"), t(" % de sa valeur, c'est la multiplier par "), f("1-d"), t(" (écriture décimale) ; sur un an, douze fois de suite.")]),
          calcul(l, [ligne(`V_{12}=V_0\\,(1-d_{\\text{mens}})^{12}`), ligne(`V_{12}=V_0\\,(1-d_{\\text{an}})`), ligne(`1-d_{\\text{an}}=(1-d_{\\text{mens}})^{12}`, "même valeur au bout d'un an")]),
          resultat(l, fr(reponse(e, "relation"))),
          piege(l, [t("Additionner les baisses ("), f("12\\,d"), t(") : chaque baisse porte sur une valeur déjà diminuée.")]),
        ];
      if (e.variante === "longuePeriode") {
        const P2 = decimalL(e.taux / 100);
        return [
          utilise(l, [t(`Une évolution annuelle de taux t multiplie la grandeur par ${e.baisse ? "1 − t" : "1 + t"} chaque année ; sur ${e.duree} ans, les facteurs se multiplient.`)]),
          calcul(l, [ligne(e.baisse ? `G_0\\,(1-t)^{${e.duree}}=G_0\\,(1-${P2})` : `G_0\\,(1+t)^{${e.duree}}=G_0\\,(1+${P2})`, [t("G₀ : valeur de départ")])]),
          resultat(l, fr(reponse(e, "relation"))),
          piege(l, [t("Diviser l'évolution totale par le nombre d'années : les évolutions annuelles se composent, elles ne s'additionnent pas.")]),
        ];
      }
      const versAnnuel = e.variante === "versAnnuel";
      return [
        utilise(l, [t("Deux taux sont équivalents s'ils donnent la même valeur acquise au bout d'un an ; une année compte "), t(`${e.k} ${e.k === 2 ? "semestres" : e.k === 4 ? "trimestres" : "mois"}.`)]),
        calcul(l, [ligne(`C_0\\,(1+${iP(e.k)})^{${e.k}}=C_0\\,(1+${IA})`), ligne(`(1+${iP(e.k)})^{${e.k}}=1+${IA}`, [t("on simplifie par "), f("C_0")])]),
        { ...resultat(l, fr(reponse(e, "relation"))), figureHtml: ligneAnnee(e.k, nT(1 + e.taux / 100, 6), versAnnuel) },
        piege(l, versAnnuel ? [t("Multiplier le taux périodique par "), f(`${e.k}`), t(" : les intérêts sont composés, il faut une puissance.")] : [t("Diviser le taux annuel par "), f(`${e.k}`), t(" : on obtient un taux un peu trop grand.")]),
      ];
    }
    case "taux":
      if (e.variante === "versAnnuel")
        return [utilise(l, [t("On élève le facteur périodique à la puissance "), f(`${e.k}`), t(", puis on retire 1.")]), calcul(l, lignesAnnuel(e.k, e.taux)), resultat(l, [t("Taux annuel équivalent (taux réel) : "), ...fr(reponse(e, "taux")), t(".")])];
      if (e.variante === "depuisAnnuel") {
        const r = Math.pow(1 + e.taux / 100, 1 / e.k);
        return [
          utilise(l, [t("On isole le taux périodique par la racine "), f(`${e.k}`), t("-ième.")]),
          calcul(l, [ligne(`1+${iP(e.k)}=\\sqrt[${e.k}]{1+${IA}}=\\sqrt[${e.k}]{${decimalL(1 + e.taux / 100)}}`), ligne(`\\approx ${nL(r, 7, true)}`), ligne(`${iP(e.k)}\\approx ${nL(r - 1, 7, true)}\\approx ${pourcentFixeL(periodiqueDe(e.k, e.taux), 3)}`, "en %, au millième")]),
          resultat(l, [t(`Taux ${NOM_PERIODE[e.k].adj} équivalent : `), ...fr(reponse(e, "taux")), t(".")]),
          verification(l, [t("Contrôle : "), f(`${nL(1 + periodiqueDe(e.k, e.taux) / 100, 7, true)}^{${e.k}}\\approx ${decimalL(1 + e.taux / 100)}`), t(" ; ce taux est un peu plus petit que "),f(`\\dfrac{${nL(e.taux, 4)}}{${e.k}}\\approx ${nL(e.taux / e.k, 4)}`), t(".")]),
        ];
      }
      if (e.variante === "depreciation") {
        const g = Math.pow(1 - e.taux / 100, 12);
        return [
          utilise(l, [t("On calcule la part de valeur qui reste au bout d'un an, puis ce qui est perdu.")]),
          calcul(l, [ligne(`1-d_{\\text{an}}=${decimalL(1 - e.taux / 100)}^{12}`), ligne(`\\approx ${nL(g, 6, true)}`), ligne(`d_{\\text{an}}\\approx 1-${nL(g, 6, true)}\\approx ${nL(1 - g, 6, true)}\\approx ${pourcentFixeL(depreciationAnnuelle(e), 2)}`, "en %, au centième")]),
          resultat(l, [t("Dépréciation annuelle : "), ...fr(reponse(e, "taux")), t(".")]),
        ];
      }
      {
        const N = e.duree;
        const F = e.baisse ? Math.pow(1 - e.taux / 100, 1 / N) : Math.pow(1 + e.taux / 100, 1 / N);
        return [
          utilise(l, [t("On isole le facteur annuel par la racine "), f(`${N}`), t("-ième.")]),
          calcul(l, [
            ligne(e.baisse ? `1-t=\\sqrt[${N}]{${decimalL(1 - e.taux / 100)}}` : `1+t=\\sqrt[${N}]{${decimalL(1 + e.taux / 100)}}`),
            ligne(`\\approx ${nL(F, 6, true)}`),
            ligne(`t\\approx ${nL(Math.abs(F - 1), 6, true)}\\approx ${pourcentFixeL(tauxMoyen(e), 2)}`, "en %, au centième"),
          ]),
          resultat(l, [t(`${e.baisse ? "Baisse" : "Hausse"} annuelle moyenne : `), ...fr(reponse(e, "taux")), t(".")]),
          verification(l, [t("C'est moins que "), f(`\\dfrac{${nL(e.taux, 4)}}{${N}}\\approx ${nL(e.taux / N, 2)}`), t(e.baisse ? " : en baisse aussi, les pourcentages se composent." : " : les hausses successives se composent.")]),
        ];
      }
    case "tauxA":
    case "tauxB": {
      const [k, tx2] = p === "tauxA" ? [e.k, e.taux] : [e.kB, e.tauxB];
      return [
        utilise(l, [t(`Offre ${p === "tauxA" ? "A" : "B"} : taux ${NOM_PERIODE[k].adj}, ${k} périodes par an ; `), f(`(1+${iP(k)})^{${k}}=1+${IA}`), t(".")]),
        calcul(l, lignesAnnuel(k, tx2)),
        resultat(l, fr(reponse(e, p))),
      ];
    }
    case "choix": {
      const aA = annuelDe(e.k, e.taux);
      const aB = annuelDe(e.kB, e.tauxB);
      return [
        utilise(l, [t(e.emprunt ? "Pour un emprunt, l'offre la plus avantageuse a le taux annuel équivalent le plus bas." : "Pour un placement, l'offre la plus avantageuse a le taux annuel équivalent le plus élevé.")]),
        calcul(l, [ligne(`${pourcentFixeL(aA, 2)}${aA > aB ? ">" : "<"}${pourcentFixeL(aB, 2)}`, "taux annuels équivalents de A et de B")]),
        resultat(l, fr(reponse(e, "choix"))),
        piege(l, [t("Comparer directement les taux donnés : ils ne portent pas sur la même période.")]),
      ];
    }
    case "brut":
      return [
        utilise(l, [t("Sur un an, l'intérêt brut vaut "), f("C_0\\cdot i"), t(".")]),
        calcul(l, [ligne(`I_{\\text{brut}}=${montantL(e.C0)}\\cdot ${decimalL(e.taux / 100)}${egalOuApprox(interetBrut(e), 2)}${centL(interetBrut(e))}`)]),
        resultat(l, fr(reponse(e, "brut"))),
      ];
    case "net":
      return [
        utilise(l, [t(`Le précompte retient ${nT(e.precompte, 2)} % des intérêts : il en reste ${nT(100 - e.precompte, 2)} %.`)]),
        calcul(l, [ligne(`I_{\\text{net}}=${montantL(e.C0)}\\cdot ${decimalL(e.taux / 100)}\\cdot ${decimalL(1 - e.precompte / 100)}`, "intérêt brut × part gardée"), ligne(`${egalOuApprox(interetNet(e), 2)}${centL(interetNet(e))}`)]),
        resultat(l, fr(reponse(e, "net"))),
      ];
    case "tauxNet":
      return [
        utilise(l, [t("Le taux net est ce que le placement rapporte réellement : le taux brut multiplié par la part gardée (ou l'intérêt net divisé par le capital).")]),
        calcul(l, [ligne(`i_{\\text{net}}=${pourcentL(e.taux)}\\cdot ${decimalL(1 - e.precompte / 100)}`), ligne(`=${pourcentL(tauxNet(e))}`)]),
        resultat(l, [t("Taux annuel net : "), ...fr(reponse(e, "tauxNet")), t(".")]),
        verification(l, [t("Contrôle : "), f(`\\dfrac{${centL(interetNet(e))}}{${montantL(e.C0)}}\\approx ${nL(interetNet(e) / e.C0, 6)}`), t(".")]),
        piege(l, [t("Retirer le précompte au taux (en points) : le précompte est un pourcentage des intérêts.")]),
      ];
    case "valeur":
      return [
        utilise(l, [t("Chaque mois, la valeur est multipliée par "), f("1-d_{\\text{mens}}"), t(" : suite géométrique "), f("V_n=V_0\\,(1-d)^n"), t(".")]),
        calcul(l, [ligne(`V_{${e.duree}}=${montantL(e.C0)}\\cdot ${decimalL(1 - e.taux / 100)}^{${e.duree}}`), ligne(`\\approx ${centL(valeurDepreciee(e))}`)]),
        resultat(l, fr(reponse(e, "valeur"))),
      ];
  }
}

export function correctionDetailleeTauxEquivalents(e: E): EtapeCorrection[] {
  return phasesTauxEquivalents(e).flatMap((p, k) => etape(e, p, lettreEtape(k)));
}
