import type { ExerciceTraduireLieu } from "./core/traduireLieu.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTraduireLieu } from "./generateurs/traduireLieu";
import { correctionDetailleeTraduireLieu } from "./generateurs/traduireLieu/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments } from "./ui/formatTraduireLieu";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen131 — « Traduire un lieu géométrique en équation » (4e, chapitre 7, § 7, processus 2 APPLIQUER).
 * Variantes : médiatrice (MA² = MB², développer, nature), distance r d'une droite (nature, deux points
 * B et B′ pour une droite oblique, les deux parallèles), équidistant de deux parallèles (parallèle
 * médiane), équidistant d'un point et d'une droite (parabole : sommet, p signé, équation), distance r
 * d'un point (cercle). Choix fermés à UNE tentative, champs à 3 (illisible : aucune tentative), aides
 * à deux niveaux, corrigé de l'étape quand la réponse est révélée. Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (`?code=` : mêmes fonctions que l'adaptateur).
 */
export function AppTraduireLieu() {
  return (
    <AppTransfertSecondDegre<ExerciceTraduireLieu>
      titre="Traduire un lieu géométrique en équation"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceTraduireLieu}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "6px 0" }}>
          <RenduFragments fragments={enonceFragments(e)} />
        </p>
      )}
      correction={correctionDetailleeTraduireLieu}
      idDebug="__debuggen131"
    />
  );
}
