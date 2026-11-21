import type { ExerciceTrajectoires } from "./core/trajectoiresRencontre.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTrajectoires } from "./generateurs/trajectoiresRencontre";
import { correctionDetailleeTrajectoires } from "./generateurs/trajectoiresRencontre/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments } from "./ui/formatTrajectoires";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen97 — « Trajectoires et rencontre » (4e, chapitre 7, § 5, processus 3 TRANSFÉRER). Deux mobiles
 * en mouvement rectiligne (forme paramétrique) : nature des trajectoires (choix, une tentative),
 * instants t₁ et t₂ au point commun (deux inconnues : le piège central est le paramètre unique),
 * point K, verdict (collision / croisement sans rencontre / parallèles, une tentative), instant ou
 * écart de temps. Cinq puces FIXES : des trajectoires parallèles (deux écrans) ne se lisent pas dans
 * le nombre de puces. Coquille commune `components/AppTransfertSecondDegre.tsx`.
 */
export function AppTrajectoiresRencontre() {
  return (
    <AppTransfertSecondDegre<ExerciceTrajectoires>
      titre="Trajectoires et rencontre"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceTrajectoires}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      correction={correctionDetailleeTrajectoires}
      nombrePuces={() => 5}
      idDebug="__debuggen97"
    />
  );
}
