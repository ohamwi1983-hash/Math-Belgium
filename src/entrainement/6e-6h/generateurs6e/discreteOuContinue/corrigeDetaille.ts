import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { lettreEtape, piege, resultat, utilise } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice114 } from "../../core6e/discreteOuContinue";
import { PHASES_114, situation114 } from "../../core6e/discreteOuContinue";
import { nomNature, reponse114 } from "../../ui6e/formatDiscreteOuContinue";
import { fr } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen114`, une lettre par écran (décisions : « Ce qu'on
 * utilise » puis « Résultat », et le piège propre à la situation) : critère discrète / continue du
 * cours (§ 4), ensemble des valeurs, outil de calcul (somme ou intégrale, P(X = c)). Même source que
 * l'écran (`reponse114`).
 */

type E = Exercice114;
const t = tx;
const l = lx;

function piegeNature(e: E): EtapeCorrection["fragments"] {
  switch (e.situation) {
    case "taille":
      return [t("Croire qu'une taille est toujours continue : ici, elle est arrondie au centimètre, donc ses valeurs sont isolées.")];
    case "appels":
    case "voitures":
    case "premier6":
      return [t("Croire qu'une variable sans valeur maximale est continue : on peut encore énumérer ses valeurs une à une, elle est discrète.")];
    default:
      return e.nature === "discrete"
        ? [t("Confondre « beaucoup de valeurs » et « continue » : ce qui compte, c'est qu'on puisse énumérer les valeurs une à une.")]
        : [t("Penser aux valeurs arrondies qu'on lit sur un appareil : la grandeur exacte peut prendre toutes les valeurs de l'intervalle.")];
  }
}

export function correctionDetaillee114(e: E): EtapeCorrection[] {
  const s = situation114(e);
  const out: EtapeCorrection[] = [];
  PHASES_114.forEach((ph, i) => {
    const sq = lettreEtape(i);
    if (ph === "nature")
      out.push(
        utilise(sq, [t("Discrète ou continue (cours, point 4) : une variable discrète prend des valeurs qu'on peut énumérer une à une (en nombre fini ou non) ; une variable continue prend toutes les valeurs réelles d'un intervalle.")]),
        resultat(sq, fr(reponse114(e, ph))),
        piege(sq, piegeNature(e)),
      );
    else if (ph === "valeurs")
      out.push(
        utilise(sq, [t(e.nature === "discrete" ? "Variable discrète : on écrit l'ensemble de ses valeurs isolées, toutes les valeurs possibles." : "Variable continue : ses valeurs forment un intervalle, de la plus petite à la plus grande valeur possible.")]),
        resultat(sq, [t("Valeurs possibles : "), l(s.valeurs[0])]),
        piege(sq, e.nature === "discrete" ? [t("Écrire l'intervalle "), l(s.valeurs[1]), t(" : il contiendrait des valeurs non entières, impossibles ici.")] : [t("Ne garder que quelques valeurs ("), l(s.valeurs[1]), t(") : toutes les valeurs intermédiaires sont possibles.")]),
      );
    else
      out.push(
        utilise(sq, [t("Tableau du cours (point 4) : en discret, la loi de probabilité donne "), l("P(X=k)"), t(" et on additionne ; en continu, la densité donne la probabilité d'un intervalle par une intégrale, et "), l("P(X=c)=0"), t(".")]),
        resultat(sq, [t(`X est ${nomNature(e.nature)} : `), ...fr(reponse114(e, ph)).map((f, k) => (k === 0 && f.type === "texte" ? { ...f, valeur: f.valeur.charAt(0).toLowerCase() + f.valeur.slice(1) } : f))]),
        piege(sq, e.nature === "discrete" ? [t("Écrire "), l("P(X=c)=0"), t(" : c'est vrai en continu seulement ; ici, chaque valeur a sa probabilité.")] : [t("Additionner des "), l("P(X=k)"), t(" : chacune vaut 0 en continu, il faut une aire sous la densité.")]),
      );
  });
  return out;
}
