import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, lettreEtape, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { centL, centT, COUL_FLECHE2, egalOuApprox, exposant,ligneTempsSvg, montantL, montantT, nL, nT, pourcentFixeL } from "../finance/commun";
import type { ExerciceInteretsComposes, PhaseInteretsComposes } from "./index";
import { facteur, interetMixte, phasesInteretsComposes, tauxDecimal, tauxRetrouve, totalMixte, valeurAcquise, valeurActuelle, valeurDonnee } from "./index";
import { cibleAnnees, fL, iL, montantAtteint, reponse } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen25` (étape 11 du cours), une lettre par écran ; ligne
 * du temps (capitaliser / actualiser) sous le résultat de la valeur acquise et de la valeur actuelle.
 * Mêmes fonctions que l'écran (`format.ts`).
 */

type E = ExerciceInteretsComposes;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const facteurT = (e: E) => nT(facteur(e), 6);

function ligneTemps(e: E, sens: "capitaliser" | "actualiser"): string {
  return ligneTempsSvg({
    n: e.n,
    unite: "années",
    versements: sens === "capitaliser" ? [{ k: 0, texte: montantT(e.C0) }] : [{ k: e.n, texte: montantT(e.cible) }],
    marques: sens === "capitaliser" ? [{ k: e.n, texte: `C${indice(e.n)} ≈ ${centT(valeurAcquise(e))}` }] : [{ k: 0, texte: `C₀ ≈ ${centT(valeurActuelle(e))}` }],
    fleches: [sens === "capitaliser" ? { de: 0, a: e.n, texte: `× ${facteurT(e)}${exposant(e.n)}` } : { de: e.n, a: 0, texte: `× ${facteurT(e)}${exposant(`-${e.n}`)}`, couleur: COUL_FLECHE2 }],
  });
}

function indice(n: number): string {
  const t2: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  return String(n)
    .split("")
    .map((c) => t2[c] ?? c)
    .join("");
}

function etape(e: E, p: PhaseInteretsComposes, l: string): EtapeCorrection[] {
  const fa = fL(e);
  const C = montantL(e.C0);
  const n = e.n;
  switch (p) {
    case "suite":
      return [
        utilise(l, [t("Chaque année, les intérêts s'ajoutent au capital et produisent à leur tour des intérêts.")]),
        calcul(l, [ligne(`C_{n+1}=C_n+C_n\\cdot ${iL(e)}`), ligne(`=C_n\\cdot ${fa}`, "mise en évidence de Cₙ")]),
        resultat(l, [...fr(reponse(e, "suite")), t(" : on multiplie chaque année par le même nombre.")]),
        piege(l, [t("Confondre avec l'intérêt simple, où l'on ajoute chaque année le même intérêt (suite arithmétique).")]),
      ];
    case "valeur":
    case "composes":
      return [
        utilise(l, [t("Intérêts composés : "), f("C_n=C_0\\,(1+i)^n"), t(", taux en écriture décimale.")]),
        calcul(l, [ligne(`C_{${n}}=C_0\\,(1+i)^{${n}}`), ligne(`=${C}\\cdot ${fa}^{${n}}`), ligne(`\\approx ${nL(valeurAcquise(e), 4, true)}`, "on n'arrondit qu'à la fin"), ligne(`\\approx ${centL(valeurAcquise(e))}`, "au centime")]),
        { ...resultat(l, fr(reponse(e, p))), ...(p === "valeur" ? { figureHtml: ligneTemps(e, "capitaliser") } : {}) },
        ...(p === "valeur" ? [piege(l, [t("Calculer "), f("C_0\\,(1+i\\cdot n)"), t(" : c'est la formule de l'intérêt simple.")])] : []),
      ];
    case "interets":
      return [
        utilise(l, [t("Les intérêts produits : valeur acquise moins capital placé.")]),
        calcul(l, [ligne(`I=C_{${n}}-C_0`), ligne(`\\approx ${centL(valeurAcquise(e))}-${C}`), ligne(`\\approx ${centL(valeurAcquise(e) - e.C0)}`)]),
        resultat(l, fr(reponse(e, "interets"))),
        verification(l, [t("Comparaison : à intérêt simple, le même placement n'aurait rapporté que "), f(`${C}\\cdot ${iL(e)}\\cdot ${n}${egalOuApprox(e.C0 * tauxDecimal(e) * n, 2)}${centL(e.C0 * tauxDecimal(e) * n)}`), t(" € ; les intérêts composés rapportent plus.")]),
      ];
    case "formule":
      if (e.variante === "taux")
        return [
          utilise(l, [t("On isole "), f("i"), t(" dans "), f("C_n=C_0\\,(1+i)^n"), t(".")]),
          calcul(l, [ligne("C_n=C_0\\,(1+i)^n"), ligne("(1+i)^n=\\dfrac{C_n}{C_0}", [t("on divise par "), f("C_0")]), ligne("1+i=\\sqrt[n]{\\dfrac{C_n}{C_0}}", "racine n-ième (nombres positifs)"), ligne("i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1")]),
          resultat(l, fr(reponse(e, "formule"))),
          piege(l, [t("Oublier de retirer 1 : la racine n-ième donne le facteur "), f("1+i"), t(".")]),
        ];
      return [
        utilise(l, [t("Le montant à placer aujourd'hui est la valeur actuelle de "), f("C_n"), t(" : on remonte le temps en divisant par "), f("(1+i)^n"), t(".")]),
        calcul(l, [ligne("C_n=C_0\\,(1+i)^n"), ligne("C_0=\\dfrac{C_n}{(1+i)^n}", [t("on divise par "), f("(1+i)^n")]), ligne("=C_n\\,(1+i)^{-n}")]),
        resultat(l, fr(reponse(e, "formule"))),
        piege(l, [t("Calculer "), f("C_n\\,(1-i)^n"), t(" : retirer le taux chaque année ne compense pas un ajout du même taux.")]),
      ];
    case "capital":
      return [
        utilise(l, [t("Valeur actuelle : "), f("C_0=C_n\\,(1+i)^{-n}"), t(".")]),
        calcul(l, [ligne(`C_0=${montantL(e.cible)}\\cdot ${fa}^{-${n}}`), ligne(`\\approx ${nL(valeurActuelle(e), 4, true)}`), ligne(`\\approx ${centL(valeurActuelle(e))}`, "au centime")]),
        { ...resultat(l, fr(reponse(e, "capital"))), figureHtml: ligneTemps(e, "actualiser") },
        verification(l, [t("Contrôle : "), f(`${centL(valeurActuelle(e))}\\cdot ${fa}^{${n}}\\approx ${montantL(e.cible)}`), t(".")]),
      ];
    case "taux": {
      const q = valeurDonnee(e) / e.C0;
      return [
        utilise(l, [t("On remplace dans "), f("i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1"), t(" (racine n-ième, ou puissance "), f("\\frac{1}{n}"), t(").")]),
        calcul(l, [ligne(`i=\\sqrt[${n}]{\\dfrac{${centL(valeurDonnee(e))}}{${C}}}-1`), ligne(`\\approx ${nL(Math.pow(q, 1 / n), 6, true)}-1`), ligne(`\\approx ${nL(tauxRetrouve(e) / 100, 6, true)}`), ligne(`\\approx ${pourcentFixeL(tauxRetrouve(e), 2)}`, "en %, au centième")]),
        resultat(l, [...fr(reponse(e, "taux")), t(" par an.")]),
        verification(l, [t("Contrôle : "), f(`${C}\\cdot ${nL(1 + tauxRetrouve(e) / 100, 4)}^{${n}}\\approx ${centL(e.C0 * Math.pow(1 + Math.round(tauxRetrouve(e) * 100) / 10000, n))}`), t(" € (proche de la somme remise, à l'arrondi du taux près).")]),
      ];
    }
    case "inequation":
      return [
        utilise(l, [t("Après n années, la valeur acquise est "), f("C_0\\,(1+i)^n"), t(e.variante === "doublement" ? " ; le capital a doublé quand elle atteint " : " ; elle doit atteindre au moins le montant visé."), ...(e.variante === "doublement" ? [f("2\\,C_0"), t(".")] : [])]),
        calcul(l, e.variante === "doublement" ? [ligne(`C_0\\cdot ${fa}^{\\,n}\\geq 2\\,C_0`), ligne(`${fa}^{\\,n}\\geq 2`, [t("on divise par "), f("C_0>0"), t(" : le capital de départ n'intervient pas")])] : [ligne(`${C}\\cdot ${fa}^{\\,n}\\geq ${montantL(e.cible)}`)]),
        resultat(l, fr(reponse(e, "inequation"))),
        piege(l, [t("Écrire "), f("C_0\\,(1+i\\cdot n)"), t(" : c'est la valeur acquise à intérêt simple.")]),
      ];
    case "annees": {
      const k = cibleAnnees(e);
      const dbl = e.variante === "doublement";
      const val = (m: number) => (dbl ? Math.pow(facteur(e), m) : valeurAcquise(e, m));
      const ex = (m: number) => (dbl ? `${fa}^{${m}}` : `${C}\\cdot ${fa}^{${m}}`);
      const seuil = dbl ? "2" : montantL(e.cible);
      const d = dbl ? 4 : 2;
      return [
        utilise(l, [t("L'inconnue est en exposant : on utilise la table de la calculatrice (menu Table, début 1, pas 1) et on cherche la première valeur qui convient.")]),
        calcul(l, [ligne(`${ex(k - 1)}\\approx ${nL(val(k - 1), d, true)}<${seuil}`, `pour n = ${k - 1} : pas encore`), ligne(`${ex(k)}\\approx ${nL(val(k), d, true)}\\geq ${seuil}`, `pour n = ${k} : c'est la première année qui convient`)]),
        resultat(l, [t(dbl ? `Le capital aura au moins doublé au bout de ${k} ans.` : `Le capital atteint au moins ${montantT(e.cible)} € au bout de ${k} ans.`)]),
        ...(dbl ? [verification(l, [t("Règle de 72 (estimation rapide) : "), f(`\\dfrac{72}{${nL(e.tauxPct, 4)}}\\approx ${nL(72 / e.tauxPct, 1)}`), t(" ans, du même ordre.")])] : []),
        piege(l, [t("Répondre la dernière année où le montant n'est pas encore atteint (une année trop tôt).")]),
      ];
    }
    case "montant": {
      const k = cibleAnnees(e);
      return [
        utilise(l, [t("On calcule la valeur acquise pour le nombre d'années trouvé.")]),
        calcul(l, [ligne(`C_{${k}}=${C}\\cdot ${fa}^{${k}}`), ligne(`\\approx ${centL(montantAtteint(e))}`)]),
        resultat(l, fr(reponse(e, "montant"))),
        verification(l, [t(`C'est un peu plus que les ${montantT(e.cible)} € visés, comme prévu.`)]),
      ];
    }
    case "simple":
      return [
        utilise(l, [t("Pour la fraction d'année, intérêt simple sur le capital atteint "), f(`C_{${n}}`), t(" : "), f("I=C_n\\cdot i\\cdot t"), t(", durée en années.")]),
        calcul(l, [ligne(`I=C_{${n}}\\cdot ${iL(e)}\\cdot\\dfrac{${e.mois}}{12}`), ligne(`\\approx ${centL(valeurAcquise(e))}\\cdot ${iL(e)}\\cdot\\dfrac{${e.mois}}{12}`), ligne(`\\approx ${centL(interetMixte(e))}`)]),
        resultat(l, fr(reponse(e, "simple"))),
        piege(l, [t("Calculer cet intérêt sur le capital de départ, ou avec une puissance fractionnaire : la convention de la banque est l'intérêt simple sur le capital atteint.")]),
      ];
    case "total":
      return [
        utilise(l, [t("Valeur acquise = capital atteint après les années entières + intérêt simple de la fraction d'année.")]),
        calcul(l, [ligne(`C=C_{${n}}+I`), ligne(`\\approx ${centL(valeurAcquise(e))}+${centL(interetMixte(e))}`), ligne(`\\approx ${centL(totalMixte(e))}`)]),
        resultat(l, [...fr(reponse(e, "total")), t(` (soit ${centT(totalMixte(e) - e.C0)} € d'intérêts en tout).`)]),
      ];
  }
}

export function correctionDetailleeInteretsComposes(e: E): EtapeCorrection[] {
  return phasesInteretsComposes(e).flatMap((p, k) => etape(e, p, lettreEtape(k)));
}
