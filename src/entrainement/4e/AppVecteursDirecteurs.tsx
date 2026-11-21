import type { ExerciceVecteursDirecteurs } from "./core/vecteursDirecteurs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceVecteursDirecteurs } from "./generateurs/vecteursDirecteurs";
import { correctionDetailleeVecteursDirecteurs } from "./generateurs/vecteursDirecteurs/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments } from "./ui/formatVecteursDirecteurs";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen129 — « Vecteurs directeurs d'une droite » (4e, chapitre 6, § 15, processus 1 CONNAÎTRE).
 * (a) d tracée sur un quadrillage : écrire un vecteur directeur (tout multiple non nul accepté) ;
 * (b) cocher tous les vecteurs directeurs parmi cinq (choix multiple, une tentative) ; (c) un
 * vecteur directeur d'une autre droite g, lu sur son équation. Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (écran « cases » et champ « vecteur en colonne »).
 */
export function AppVecteursDirecteurs() {
  return (
    <AppTransfertSecondDegre<ExerciceVecteursDirecteurs>
      titre="Vecteurs directeurs d'une droite"
      sousTitre="Chapitre 6 — Calcul vectoriel"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceVecteursDirecteurs}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      correction={correctionDetailleeVecteursDirecteurs}
      idDebug="__debuggen129"
    />
  );
}
