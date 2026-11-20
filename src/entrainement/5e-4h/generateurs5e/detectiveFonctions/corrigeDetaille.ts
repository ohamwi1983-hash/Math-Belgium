import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveFonctions } from "../../core5e/detectiveFonctions.types";
import { copie } from "../../moteur5e/modeleDetectiveFonctions";
import { reponse } from "../../ui5e/formatDetectiveFonctions";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";

/**
 * Corrigé détaillé « comme au tableau » de `5gen58`, une lettre par écran : a) le contrôle de la
 * ligne fausse (la ligne refaite, ou une valeur que la copie garde à tort) ; b) la règle juste du
 * cours ; c) la résolution reprise à partir de la ligne fausse, une transformation par ligne, avec
 * une vérification quand elle est parlante. Contenu tiré du modèle (`copie`), même source que
 * l'écran.
 */

const fr = (x: unknown) => x as FragmentConsigne[];

export function correctionDetailleeDetectiveFonctions(e: ExerciceDetectiveFonctions): EtapeCorrection[] {
  const c = copie(e);
  const verif = c.corrigeC.verification;
  return [
    utilise("a", fr(c.corrigeA.utilise)),
    calcul("a", c.corrigeA.lignes),
    resultat("a", fr(reponse(e, "ligne"))),
    piege("a", [texte("Signaler une ligne qui découle correctement de l'erreur : sa règle est juste, seul son point de départ est faux.")]),
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
