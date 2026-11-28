import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceInteretsComposes } from "../../core6e/interetsComposes";
import { capital, capitalLimite, tauxDecimal, tauxEquivalent } from "../../core6e/interetsComposes";
import { egalApprox, milliersL, nbL } from "../../ui6e/nombresExpoLotG";
import { capitalSubstL, limiteExacteL, nomFrequence, reponse, rL } from "../../ui6e/formatInteretsComposes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen151` (intérêts composés et nombre e), partagé par
 * l'appli et le papier — une lettre par écran : a trois capitaux, b limite K₀·e^{rt}, c taux annuel
 * équivalent. Les valeurs approchées sont calculées depuis les expressions exactes (pas d'arrondi
 * intermédiaire).
 */

type E = ExerciceInteretsComposes;
const t = texte;
const f = latex;
const COURS = "(cours, point 2)";

function etapeCapitaux(e: E): EtapeCorrection[] {
  const sq = "a";
  const lignes: LigneCalcul[] = [];
  for (const n of e.frequences) {
    lignes.push(ligne(`K_{${n}}=${capitalSubstL(e, n)}`, `versement ${nomFrequence(n)} : ${n} × ${e.t} = ${n * e.t} versement${n * e.t > 1 ? "s" : ""}`));
    lignes.push(ligne(egalApprox(capital(e, n), 2)));
  }
  return [
    utilise(sq, [t("À chaque versement, le capital est multiplié par "), f("1+\\dfrac{r}{n}"), t(" ; en "), f("t"), t(" ans, il y a "), f("n\\cdot t"), t(" versements, avec "), f(`r=${rL(e)}`), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "capitaux")),
    verification(sq, [t("Plus les versements sont fréquents, plus le capital est grand — mais il augmente de moins en moins.")]),
    piege(sq, [t("Appliquer le taux annuel "), f("r"), t(" à chaque versement au lieu de "), f("\\dfrac{r}{n}"), t(", ou oublier le facteur "), f("t"), t(" dans l'exposant.")]),
  ];
}

function etapeLimite(e: E): EtapeCorrection[] {
  const sq = "b";
  const r = tauxDecimal(e);
  const rt = r * e.t;
  return [
    utilise(sq, [t("Définition du nombre e "), t(COURS), t(" : "), f("\\lim\\limits_{m\\to+\\infty}\\left(1+\\dfrac{1}{m}\\right)^{m}=e"), t(", avec "), f("m=\\dfrac{n}{r}"), t(", qui tend vers l'infini avec "), f("n"), t(".")]),
    calcul(sq, [
      ligne(`\\left(1+\\dfrac{r}{n}\\right)^{n\\,t}=\\left[\\left(1+\\dfrac{1}{m}\\right)^{m}\\right]^{r\\,t}`, [f("\\dfrac{r}{n}=\\dfrac{1}{m}"), t(" et "), f("n\\,t=m\\cdot r\\,t")]),
      ligne(`K_{\\infty}=K_0\\,e^{r\\,t}`, [t("quand "), f("n\\to+\\infty"), t(", le crochet tend vers e")]),
      ligne(`=${limiteExacteL(e)}`, [f(`r\\,t=${rL(e)}\\cdot ${e.t}=${nbL(rt, 3)}`)]),
      ligne(`\\approx ${milliersL(capitalLimite(e), 2, true)}`, [t("touche "), f("e^{x}")]),
    ]),
    resultat(sq, reponse(e, "limite")),
    verification(sq, [t("La limite dépasse de peu le capital à versement quotidien :")], [ligne(`K_{365}\\approx ${milliersL(capital(e, 365), 2, true)}<${milliersL(capitalLimite(e), 2, true)}`)]),
    piege(sq, [t("Croire que le capital augmente sans limite quand les versements sont plus fréquents, ou écrire "), f("K_0\\,e^{r}"), t(" en oubliant la durée.")]),
  ];
}

function etapeTaux(e: E): EtapeCorrection[] {
  const sq = "c";
  const r = tauxDecimal(e);
  const facteur = Math.exp(r);
  return [
    utilise(sq, [t("En capitalisation continue, le capital est multiplié par "), f("e^{r}"), t(" en un an ; un taux annuel simple "), f("i"), t(" le multiplie par "), f("1+i"), t(".")]),
    calcul(sq, [
      ligne(`1+i=e^{${rL(e)}}`, "même facteur en un an"),
      ligne(`i=e^{${rL(e)}}-1`),
      ligne(`\\approx ${nbL(facteur - 1, 6, true)}`, [t("touche "), f("e^{x}")]),
      ligne(`100\\cdot i\\approx ${nbL(tauxEquivalent(e), 2, true)}`, "en %"),
    ]),
    resultat(sq, reponse(e, "taux")),
    verification(sq, [t("Le taux équivalent dépasse un peu le taux nominal "), f(`${nbL(e.tauxPourcent, 1)}\\,\\%`), t(" : les intérêts versés en continu rapportent à leur tour.")]),
    piege(sq, [t("Oublier de retirer 1 (donner le facteur "), f("e^{r}"), t(" comme taux).")]),
  ];
}

export function correctionDetailleeInteretsComposes(e: E): EtapeCorrection[] {
  return [...etapeCapitaux(e), ...etapeLimite(e), ...etapeTaux(e)];
}
