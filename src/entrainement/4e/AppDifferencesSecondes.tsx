import type { ExerciceDifferences } from "./core/differencesSecondes.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDifferences } from "./generateurs/differencesSecondes";
import { correctionDetailleeDifferences } from "./generateurs/differencesSecondes/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments, tableauPourEcran, tableauSvg } from "./ui/formatDifferencesSecondes";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen124 — « Premier ou second degré ? Différences secondes » (4e, chapitre 1, § 1, processus 2
 * APPLIQUER). Différences premières, différences secondes (champs, 3 tentatives), verdict (choix,
 * une tentative), puis a, b, c ou m, p. Quatre puces toujours (`nombrePuces`) : « ni l'un ni
 * l'autre » n'a que trois écrans, la quatrième puce passe « sans objet » à la fin. Coquille commune :
 * `components/AppTransfertSecondDegre.tsx`.
 */

export function AppDifferencesSecondes() {
  return (
    <AppTransfertSecondDegre<ExerciceDifferences>
      titre="Premier ou second degré ? Différences secondes"
      sousTitre="Chapitre 1 — La fonction du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceDifferences}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      nombrePuces={() => 4}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceFragments()} />
          </p>
          <div className="tableau-differences-ecran" style={{ margin: "8px auto", maxWidth: 380 }} dangerouslySetInnerHTML={{ __html: tableauPourEcran(tableauSvg(e, 0)) }} />
        </>
      )}
      correction={correctionDetailleeDifferences}
    />
  );
}
