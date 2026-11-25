import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveStat } from "../../core5e/detectiveStatistique";
import { copie } from "../../moteur5e/modeleDetectiveStatistique";
import { reponse } from "../../ui5e/formatDetectiveStatistique";

/**
 * Corrigé détaillé « comme au tableau » de `5gen81`, une lettre par écran : a) le contrôle de la ligne
 * fausse (la ligne refaite, « et non … comme dans la copie ») ; b) la règle juste du cours ; c) la
 * résolution reprise à partir de la ligne fausse (ou la conclusion corrigée). Contenu tiré du modèle
 * (`copie`), même source que l'écran.
 */

const fr = (x: unknown) => x as FragmentConsigne[];

export function correctionDetailleeDetectiveStatistique(e: ExerciceDetectiveStat): EtapeCorrection[] {
  const c = copie(e);
  const avecCalcul = (lettre: string, b: typeof c.corrigeA) => [utilise(lettre, fr(b.utilise)), ...(b.lignes.length ? [calcul(lettre, b.lignes)] : [])];
  return [
    ...avecCalcul("a", c.corrigeA),
    resultat("a", fr(reponse(e, "ligne"))),
    piege("a", [texte("Signaler une ligne qui découle correctement de l'erreur : son calcul est juste, seul son point de départ est faux.")]),
    ...avecCalcul("b", c.corrigeB),
    resultat("b", fr(reponse(e, "erreur"))),
    ...avecCalcul("c", c.corrigeC),
    resultat("c", fr(reponse(e, "correction"))),
    piege("c", [texte(c.valeur.genre === "choix" ? "Recopier la conclusion de l'élève en changeant seulement un nombre : c'est le raisonnement qui est faux." : "Corriger la seule ligne fausse sans reprendre la suite de la résolution, qui en découlait.")]),
  ];
}
