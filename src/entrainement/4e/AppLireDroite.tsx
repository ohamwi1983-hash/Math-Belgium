import type { ExerciceLireDroite } from "./core/lireDroite.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLireDroite } from "./generateurs/lireDroite";
import { correctionDetailleeLireDroite } from "./generateurs/lireDroite/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, equationNommee } from "./ui/formatLireDroite";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen132 — « Lire une droite : associer droites et équations » (4e, chapitre 7, § 1 à § 3, processus 1
 * CONNAÎTRE). Quatre droites tracées et quatre équations de formes variées (implicite, explicite en y,
 * explicite en x, paramétrique) : un écran par droite (choix fermé, UNE tentative ; un choix faux est
 * expliqué) ; puis la pente et l'ordonnée à l'origine d'une droite lues en escalier ; puis l'écriture
 * impossible pour une droite verticale ou horizontale. Coquille commune
 * `components/AppTransfertSecondDegre.tsx` (`?code=`, puces, aides, corrigé de l'étape).
 */
export function AppLireDroite() {
  return (
    <AppTransfertSecondDegre<ExerciceLireDroite>
      titre="Lire une droite : associer droites et équations"
      sousTitre="Chapitre 7 — Géométrie analytique plane"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceLireDroite}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <ul style={{ margin: "8px 0 0", paddingLeft: "1.2em", display: "grid", gap: 4 }}>
          {e.equations.map((_, i) => (
            <li key={i} style={{ overflowX: "auto" }}>
              <RenduFragments fragments={equationNommee(e, i)} />
            </li>
          ))}
        </ul>
      )}
      correction={correctionDetailleeLireDroite}
      idDebug="__debuggen132"
    />
  );
}
