import type { ExerciceAssocierParaboles } from "./core/associerParaboles.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAssocierParaboles } from "./generateurs/associerParaboles";
import { correctionDetailleeAssocierParaboles } from "./generateurs/associerParaboles/corrigeDetaille";
import { equationNommee } from "./moteur/modeleAssocierParaboles";
import { CONSIGNE_GENERALE, ecrans } from "./ui/formatAssocierParaboles";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen128 — « Associer paraboles et équations » (4e, chapitre 1, § 2, processus 2 APPLIQUER). Quatre
 * équations (canonique, factorisée ou développée) et leurs quatre paraboles dans le désordre ; un
 * écran par courbe (choix fermé, UNE tentative ; un choix faux est expliqué : ce que donnerait
 * l'équation choisie). Les équations d'une variante ne diffèrent que par le paramètre piège (signes
 * du sommet, a / −a / 1/a, signes des zéros, écritures mêlées). Même quadrillage et même échelle pour
 * les quatre courbes, sommets, zéros et ordonnées à l'origine sur les lignes. Coquille commune :
 * `components/AppTransfertSecondDegre.tsx` (`?code=`, puces, aides, corrigé de l'étape).
 */

export function AppAssocierParaboles() {
  return (
    <AppTransfertSecondDegre<ExerciceAssocierParaboles>
      titre="Associer paraboles et équations"
      sousTitre="Chapitre 1 — La fonction du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceAssocierParaboles}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <ul style={{ margin: "8px 0 0", paddingLeft: "1.2em", display: "grid", gap: 4 }}>
          {e.paraboles.map((_, i) => (
            <li key={i} style={{ overflowX: "auto" }}>
              <Katex expression={equationNommee(e, i)} />
            </li>
          ))}
        </ul>
      )}
      correction={correctionDetailleeAssocierParaboles}
      idDebug="__debuggen128"
    />
  );
}
