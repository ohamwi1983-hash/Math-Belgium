import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDVA } from "../../core6e/detectiveVariablesAleatoires";
import { copie } from "../../moteur6e/modeleDetectiveVariablesAleatoires";
import { reponse } from "../../ui6e/formatDetectiveVariablesAleatoires";

/**
 * Corrigé détaillé « comme au tableau » de `6gen122`, une lettre par écran : a) le contrôle de la
 * ligne fausse (la ligne refaite, « et non … comme dans la copie ») ; b) la règle juste du cours,
 * illustrée sur un petit exemple ; c) la résolution reprise à partir de la ligne fausse, avec une
 * vérification. Contenu tiré du modèle (`copie`), même source que l'écran.
 */

const fr = (x: unknown) => x as FragmentConsigne[];

export function correctionDetailleeDVA(e: ExerciceDVA): EtapeCorrection[] {
  const c = copie(e);
  const verif = c.corrigeC.verification;
  return [
    utilise("a", fr(c.corrigeA.utilise)),
    calcul("a", c.corrigeA.lignes),
    resultat("a", fr(reponse(e, "ligne"))),
    piege("a", [texte("Signaler une ligne qui découle correctement de l'erreur : son calcul est juste, seul son point de départ est faux.")]),
    utilise("b", fr(c.corrigeB.utilise)),
    calcul("b", c.corrigeB.lignes),
    resultat("b", fr(reponse(e, "erreur"))),
    utilise("c", fr(c.corrigeC.utilise)),
    calcul("c", c.corrigeC.lignes),
    resultat("c", fr(reponse(e, "correction"))),
    ...(verif ? [verification("c", fr(verif.utilise), verif.lignes.length ? verif.lignes : undefined)] : []),
    piege("c", fr(c.piege)),
  ];
}
