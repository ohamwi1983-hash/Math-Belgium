import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { lettreEtape } from "../../../export/corrigeTableau";
import { centL, decompositionJours, decimalL, egalOuApprox, montantL, nL, pourcentFixeL, pourcentL } from "../finance/commun";
import type { ExerciceInteretSimple, PhaseInteretSimple } from "./index";
import { dureeAnnees, interet, interetDepuisDonnee, interetDonne, phasesInteretSimple, tauxDecimal, tauxRetrouve, valeurAcquise, valeurDonnee } from "./index";
import { capitalAttendu, formuleJusteL, moisAttendus, reponse, tL } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen24` (étape 11 du cours), une lettre par écran :
 * jours comptés mois par mois, durée en années, I = C₀·i·t, Cₜ = C₀ + I, formule transformée et
 * calcul de la grandeur retrouvée. Mêmes fonctions que l'écran (`format.ts`).
 */

type E = ExerciceInteretSimple;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

/** Jours comptés : premier mois, mois entiers (sur une ligne), dernier mois, total. */
function lignesJours(e: E, d: ReturnType<typeof decompositionJours>) {
  if (d.length === 1) return [ligne(`${d[0]!.detail.replace("−", "-")}`, `${d[0]!.mois} : du ${e.debut!.jour} au ${e.fin!.jour}`)];
  const premier = d[0]!;
  const dernier = d[d.length - 1]!;
  const milieu = d.slice(1, -1);
  const out = [ligne(`${premier.jours}`, `${premier.mois} : ${premier.detail} jours restants`)];
  const sm = milieu.reduce((s, m) => s + m.jours, 0);
  if (milieu.length === 1) out.push(ligne(`${sm}`, `${milieu[0]!.mois} (mois entier)`));
  else if (milieu.length > 1) out.push(ligne(`${milieu.map((m) => m.jours).join("+")}=${sm}`, `mois entiers, de ${milieu[0]!.mois} à ${milieu[milieu.length - 1]!.mois}`));
  out.push(ligne(`${dernier.jours}`, `${dernier.mois} : jusqu'au ${e.fin!.jour === 1 ? "1er" : e.fin!.jour}`));
  out.push(ligne(`${[premier.jours, ...(milieu.length ? [sm] : []), dernier.jours].join("+")}=${e.nb}`, "total"));
  return out;
}

function etape(e: E, p: PhaseInteretSimple, l: string): EtapeCorrection[] {
  const i = decimalL(tauxDecimal(e));
  switch (p) {
    case "jours": {
      const d = decompositionJours(e.debut!, e.fin!);
      return [
        utilise(l, [t("On compte les jours exacts, mois par mois : le jour du dépôt n'est pas compté, le jour du retrait l'est (année de 365 jours).")]),
        calcul(l, lignesJours(e, d)),
        resultat(l, [...fr(reponse(e, "jours")), t(", soit "), f(`t=${tL(e)}`), t(" an.")]),
        piege(l, [t("Compter à la fois le jour du dépôt et celui du retrait, ou des mois de 30 jours.")]),
      ];
    }
    case "duree":
      return [
        utilise(l, [t("Dans "), f("I=C_0\\cdot i\\cdot t"), t(", la durée "), f("t"), t(` s'exprime en années : ${e.unite === "mois" ? "un mois est un douzième d'année" : "il y a 24 quinzaines dans une année"}.`)]),
        calcul(l, [ligne(`t=${tL(e)}${Number.isInteger(dureeAnnees(e) * 1000) ? `=${nL(dureeAnnees(e), 3)}` : `\\approx ${nL(dureeAnnees(e), 4, true)}`}`, `${e.nb} ${e.unite}`)]),
        resultat(l, fr(reponse(e, "duree"))),
      ];
    case "interet":
      if (e.variante === "taux" || e.variante === "duree")
        return [
          utilise(l, [t("L'intérêt est ce que le placement a rapporté : la valeur acquise moins le capital placé.")]),
          calcul(l, [ligne(`I=C_t-C_0`), ligne(`=${montantL(valeurDonnee(e))}-${montantL(e.C0)}`), ligne(`=${centL(interetDepuisDonnee(e))}`)]),
          resultat(l, fr(reponse(e, "interet"))),
        ];
      return [
        utilise(l, [t("Intérêt simple : "), f("I=C_0\\cdot i\\cdot t"), t(", avec le taux en écriture décimale ("), f(`${pourcentL(e.tauxPct)}=${i}`), t(") et la durée en années.")]),
        calcul(l, [ligne("I=C_0\\cdot i\\cdot t"), ligne(`=${montantL(e.C0)}\\cdot ${i}\\cdot ${tL(e)}`), ligne(`\\approx ${nL(interet(e), 4, true)}`, "on n'arrondit qu'à la fin"), ligne(`\\approx ${centL(interet(e))}`, "au centime")]),
        resultat(l, fr(reponse(e, "interet"))),
        piege(l, [t("Garder le taux en % (multiplier par "), f(`${nL(e.tauxPct, 4)}`), t(` au lieu de ${nL(tauxDecimal(e), 6).replace("{,}", ",")}) ou la durée en ${e.unite}.`)]),
      ];
    case "valeur":
      return [
        utilise(l, [t("La valeur acquise est le capital augmenté de l'intérêt : "), f("C_t=C_0+I=C_0\\,(1+i\\cdot t)"), t(".")]),
        calcul(l, [ligne("C_t=C_0\\,(1+i\\cdot t)"), ligne(`=${montantL(e.C0)}\\cdot\\left(1+${i}\\cdot ${tL(e)}\\right)`), ligne(`\\approx ${centL(valeurAcquise(e))}`)]),
        resultat(l, fr(reponse(e, "valeur"))),
        verification(l, [t("Contrôle par l'intérêt : "), f(`C_0+I\\approx ${montantL(e.C0)}+${centL(interet(e))}=${centL(e.C0 + interet(e))}`), t(".")]),
      ];
    case "formule": {
      const depart = e.variante === "capital" && e.donnee === "valeur" ? "C_t=C_0\\,(1+i\\cdot t)" : "I=C_0\\cdot i\\cdot t";
      const diviseur = e.variante === "capital" ? (e.donnee === "valeur" ? "1+i\\cdot t" : "i\\cdot t") : e.variante === "taux" ? "C_0\\cdot t" : "C_0\\cdot i";
      return [
        utilise(l, [t("On part de "), f(depart), t(" et on isole la grandeur cherchée.")]),
        calcul(l, [ligne(depart), ligne(formuleJusteL(e), [t("on divise les deux membres par "), f(diviseur)])]),
        resultat(l, fr(reponse(e, "formule"))),
        ...(e.variante === "capital" && e.donnee === "valeur" ? [piege(l, [t("Calculer "), f("C_t\\,(1-i\\cdot t)"), t(" : l'intérêt a été calculé sur "), f("C_0"), t(", pas sur "), f("C_t"), t(".")])] : []),
      ];
    }
    case "capital": {
      const lignes =
        e.donnee === "interet"
          ? [ligne(`C_0=\\dfrac{I}{i\\cdot t}`), ligne(`=\\dfrac{${montantL(interetDonne(e))}}{${i}\\cdot ${tL(e)}}`), ligne(`=${montantL(capitalAttendu(e))}`)]
          : [ligne(`C_0=\\dfrac{C_t}{1+i\\cdot t}`), ligne(`=\\dfrac{${montantL(valeurDonnee(e))}}{1+${i}\\cdot ${tL(e)}}`), ligne(`=${montantL(capitalAttendu(e))}`)];
      return [
        utilise(l, [t("On remplace dans la formule transformée (taux en écriture décimale, durée en années).")]),
        calcul(l, lignes),
        resultat(l, fr(reponse(e, "capital"))),
        verification(l, [t("Contrôle : ")], [ligne(`${montantL(capitalAttendu(e))}\\cdot ${i}\\cdot ${tL(e)}=${centL(interet(e))}`, e.donnee === "interet" ? "on retrouve l'intérêt" : "l'intérêt, et le capital plus l'intérêt redonne la somme remise")]),
        ...(e.donnee === "interet" ? [piege(l, [t("Multiplier l'intérêt par "), f("i\\cdot t"), t(" au lieu de le diviser, ou laisser la durée en mois.")])] : []),
      ];
    }
    case "taux":
      return [
        utilise(l, [t("On remplace dans "), f("i=\\dfrac{I}{C_0\\cdot t}"), t(" (durée en années) ; le résultat est en écriture décimale.")]),
        calcul(l, [ligne(`i=\\dfrac{${montantL(interetDepuisDonnee(e))}}{${montantL(e.C0)}\\cdot ${tL(e)}}`), ligne(`\\approx ${nL(tauxRetrouve(e) / 100, 6, true)}`), ligne(`\\approx ${pourcentFixeL(tauxRetrouve(e), 2)}`, "en %, au centième")]),
        resultat(l, [...fr(reponse(e, "taux")), t(" par an.")]),
        piege(l, [t("Oublier de diviser par la durée "), f("t"), t(" : "), f("\\dfrac{I}{C_0}"), t(" est le taux sur toute la durée du placement, pas le taux annuel.")]),
      ];
    case "dureeMois": {
      const tA = interetDepuisDonnee(e) / (e.C0 * tauxDecimal(e));
      return [
        utilise(l, [t("On remplace dans "), f("t=\\dfrac{I}{C_0\\cdot i}"), t(" : la durée obtenue est en années ; on la convertit en mois (× 12).")]),
        calcul(l, [
          ligne(`t=\\dfrac{${montantL(interetDepuisDonnee(e))}}{${montantL(e.C0)}\\cdot ${i}}`),
          ligne(`${egalOuApprox(tA, 4)}${nL(tA, 4)}`, "an"),
          ligne(`t\\cdot 12${egalOuApprox(tA * 12, 4)}${nL(tA * 12, 4)}`, "mois"),
        ]),
        resultat(l, [t(`L'argent a été placé pendant ${moisAttendus(e)} mois.`)]),
        piege(l, [t("Donner la durée en années (le résultat de la formule) au lieu de la convertir en mois.")]),
      ];
    }
  }
}

export function correctionDetailleeInteretSimple(e: E): EtapeCorrection[] {
  return phasesInteretSimple(e).flatMap((p, k) => etape(e, p, lettreEtape(k)));
}
