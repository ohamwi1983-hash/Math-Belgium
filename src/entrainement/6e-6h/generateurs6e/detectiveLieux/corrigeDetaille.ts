import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDL } from "../../core6e/detectiveLieux";
import { copie } from "../../moteur6e/modeleDetectiveLieux";
import { reponse } from "../../ui6e/formatDetectiveLieux";

/**
 * Corrigé détaillé « comme au tableau » de `6gen131`, une lettre par écran : a) la ligne fausse refaite
 * correctement ; b) ce qui montre l'erreur (règle du cours, contrôle) ; c) la résolution reprise à partir
 * de la ligne fausse, avec une vérification. Contenu tiré du modèle (`copie`), même source que l'écran.
 */

const fr = (x: unknown) => x as FragmentConsigne[];

export function correctionDetailleeDL(e: ExerciceDL): EtapeCorrection[] {
  const c = copie(e);
  return [
    utilise("a", fr(c.corrigeA.utilise)),
    calcul("a", c.corrigeA.lignes),
    resultat("a", fr(reponse(e, "ligne"))),
    piege("a", [texte("Signaler une ligne qui découle correctement de l'erreur : son calcul est juste, seul son point de départ est faux.")]),
    utilise("b", fr(c.corrigeB.utilise)),
    ...(c.corrigeB.lignes.length ? [calcul("b", c.corrigeB.lignes)] : []),
    resultat("b", fr(reponse(e, "erreur"))),
    utilise("c", fr(c.corrigeC.utilise)),
    calcul("c", c.corrigeC.lignes),
    resultat("c", fr(reponse(e, "correction"))),
    ...(c.corrigeC.verification ? [verification("c", fr(c.corrigeC.verification))] : []),
    piege("c", c.piege.length ? fr(c.piege) : [texte("Recopier la conclusion de l'élève : elle découle de la ligne fausse.")]),
  ];
}
