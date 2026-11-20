import type { ExerciceTroisEcritures } from "./core/troisEcritures.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTroisEcritures } from "./generateurs/troisEcritures";
import { correctionDetailleeTroisEcritures } from "./generateurs/troisEcritures/corrigeDetaille";
import { consigneGlobale, ecrans, ecritureDonnee } from "./ui/formatTroisEcritures";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen126 — « Trois écritures d'une parabole » (4e, chapitre 1 « La fonction du second degré », § 2,
 * processus 2 APPLIQUER). La fonction est donnée sous une écriture (canonique, développée ou
 * factorisée) ; trois écrans de champs (3 tentatives, une saisie illisible ne compte pas) font passer
 * aux autres. Toute écriture juste est acceptée, mais la FORME demandée est contrôlée : une écriture
 * juste dans une autre forme reçoit un message sans perte de tentative. Coquille commune :
 * `components/AppTransfertSecondDegre.tsx` (puces, aides à deux niveaux, corrigé de l'étape,
 * `SelecteurVarianteDev`, `?code=` avec les MÊMES fonctions que l'adaptateur).
 */

export function AppTroisEcritures() {
  return (
    <AppTransfertSecondDegre<ExerciceTroisEcritures>
      titre="Trois écritures d'une parabole"
      sousTitre="Chapitre 1 — La fonction du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceTroisEcritures}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={consigneGlobale}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", fontWeight: 600, overflowX: "auto" }}>
          <Katex expression={`f(x)=${ecritureDonnee(e)}`} />
        </p>
      )}
      correction={correctionDetailleeTroisEcritures}
      idDebug="__debuggen126"
    />
  );
}
