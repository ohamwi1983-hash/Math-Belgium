import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveExp } from "../../core6e/detectiveExponentielles.types";
import { copie } from "../../moteur6e/modeleDetectiveExponentielles";
import { reponse } from "../../ui6e/formatDetectiveExponentielles";
import type { Frag } from "../../ui6e/ecransExp.types";

/**
 * Corrigé détaillé « comme au tableau » de 6gen144, une lettre par écran : a) le contrôle de la
 * ligne fausse (contre-exemple numérique, valeur testée, règle face à la copie, « ≠ ») ; b) la
 * règle juste du cours face à la règle de la copie ; c) la résolution reprise à partir de la ligne
 * fausse, une transformation par ligne, avec une vérification quand elle est parlante. Contenu
 * tiré du modèle (`copie`), même source que l'écran.
 */

const frags = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];

export function correctionDetailleeDetectiveExp(e: ExerciceDetectiveExp): EtapeCorrection[] {
  const c = copie(e);
  const verif = c.corrigeC.verification;
  return [
    utilise("a", frags(c.corrigeA.utilise)),
    calcul("a", c.corrigeA.lignes),
    resultat("a", frags(reponse(e, "ligne"))),
    piege("a", [{ type: "texte", valeur: "Signaler une ligne qui découle correctement de l'erreur (sa valeur est étrange, mais sa règle est juste)." }]),
    utilise("b", frags(c.corrigeB.utilise)),
    calcul("b", c.corrigeB.lignes),
    resultat("b", frags(reponse(e, "erreur"))),
    utilise("c", frags(c.corrigeC.utilise)),
    calcul("c", c.corrigeC.lignes),
    resultat("c", frags(reponse(e, "correction"))),
    ...(verif ? [verification("c", frags(verif.utilise), verif.lignes)] : []),
    piege("c", frags(c.piege)),
  ];
}
