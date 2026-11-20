import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveCyclo } from "../../core6e/detectiveCyclometriques.types";
import { copie } from "../../moteur6e/modeleDetectiveCyclometriques";
import { reponse } from "../../ui6e/formatDetectiveCyclometriques";
import type { Frag } from "../../ui6e/ecransExp.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen152`, une lettre par écran : a) le contrôle de la
 * ligne fausse (contre-exemple, valeur testée, « ≠ ») ; b) la règle juste du cours face à celle de la
 * copie ; c) la résolution reprise à partir de la ligne fausse, une transformation par ligne, avec une
 * vérification quand elle est parlante. Contenu tiré du modèle (`copie`), même source que l'écran.
 */

const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];

export function correctionDetailleeDetectiveCyclo(e: ExerciceDetectiveCyclo): EtapeCorrection[] {
  const c = copie(e);
  const verif = c.corrigeC.verification;
  return [
    utilise("a", fr(c.corrigeA.utilise)),
    calcul("a", c.corrigeA.lignes),
    resultat("a", fr(reponse(e, "ligne"))),
    piege("a", [{ type: "texte", valeur: "Signaler une ligne qui découle correctement de l'erreur (sa valeur est étrange, mais sa règle est juste)." }]),
    utilise("b", fr(c.corrigeB.utilise)),
    calcul("b", c.corrigeB.lignes),
    resultat("b", fr(reponse(e, "erreur"))),
    utilise("c", fr(c.corrigeC.utilise)),
    calcul("c", c.corrigeC.lignes),
    resultat("c", fr(reponse(e, "correction"))),
    ...(verif ? [verification("c", fr(verif.utilise), verif.lignes)] : []),
    piege("c", fr(c.piege)),
  ];
}
