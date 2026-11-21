import type { ExerciceDetectiveAnalytique } from "./core/detectiveAnalytique.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveAnalytique } from "./generateurs/detectiveAnalytique";
import { correctionDetailleeDetectiveAnalytique } from "./generateurs/detectiveAnalytique/corrigeDetaille";
import { copieEleve } from "./moteur/modeleDetectiveAnalytique";
import { CONSIGNE_GENERALE, ecrans, recit } from "./ui/formatDetectiveAnalytique";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve } from "./components/EtapesDetectiveErreurs";

/**
 * gen99 — « Détective d'erreurs : géométrie analytique » (4e, chapitre 7, § 11 « Révision »,
 * processus 3 TRANSFÉRER), même mécanique que gen127 / gen121 / gen112 : la copie numérotée d'un
 * élève fictif contient UNE ligne fausse. Écran 1 : la ligne (choix, une tentative) ; écran 2 :
 * l'erreur (quatre descriptions, une tentative) ; écran 3 : le résultat corrigé (champs libres,
 * 3 tentatives, le résultat de la copie reçoit un message ciblé). Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (`?code=`, aides à deux niveaux, corrigé de l'étape).
 */
export function AppDetectiveAnalytique() {
  return (
    <AppTransfertSecondDegre<ExerciceDetectiveAnalytique>
      titre="Détective d'erreurs : géométrie analytique"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceDetectiveAnalytique}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={recit(e)} />
          </p>
          <CopieEleve lignes={copieEleve(e)} ligneSignalee={null} />
        </>
      )}
      correction={correctionDetailleeDetectiveAnalytique}
      idDebug="__debuggen99"
    />
  );
}
