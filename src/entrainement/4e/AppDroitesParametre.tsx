import type { ExerciceDroitesParametre } from "./core/droitesParametre.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroitesParametre } from "./generateurs/droitesParametre";
import { correctionDetailleeDroitesParametre } from "./generateurs/droitesParametre/corrigeDetaille";
import { consigneGlobale, ecrans, enonceFragments } from "./ui/formatDroitesParametre";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen95 — « Droites dépendant d'un paramètre » (4e, chapitre 7 « Géométrie analytique plane », § 4,
 * processus 2 APPLIQUER). Famille dₘ ; question tirée : parallèle à d, perpendiculaire à d, passe par
 * P, horizontale, verticale. Écrans : condition (choix fermé, une tentative), équation en m (toute
 * équation équivalente), valeurs de m (liste, « aucune » possible ; une valeur qui annule les deux
 * coefficients est à rejeter). Le nombre de valeurs (0, 1, 2) est un verdict tiré à parts égales.
 * Coquille commune `components/AppTransfertSecondDegre.tsx`.
 */
export function AppDroitesParametre() {
  return (
    <AppTransfertSecondDegre<ExerciceDroitesParametre>
      titre="Droites dépendant d'un paramètre"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceDroitesParametre}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGlobale}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", overflowX: "auto" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      correction={correctionDetailleeDroitesParametre}
      idDebug="__debuggen95"
    />
  );
}
