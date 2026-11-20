import type { ExerciceLectureParabole } from "./core/lectureParabole.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureParabole } from "./generateurs/lectureParabole";
import { correctionDetailleeLectureParabole } from "./generateurs/lectureParabole/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments, figureEcran } from "./ui/formatLectureParabole";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen123 — « Lire une parabole sur un graphique » (4e, chapitre 1, § 1, processus 1 CONNAÎTRE).
 * Méthode du cours « trois lectures » : signes de a, b, c (choix, une tentative), sommet et axe,
 * zéros et ordonnée à l'origine (champs, 3 tentatives), image (choix). Figure = celle du papier
 * (quadrillage d'une unité, échelle unique, aucun point marqué). Coquille commune :
 * `components/AppTransfertSecondDegre.tsx` (`?code=`, puces, aides à 2 niveaux, corrigé de l'étape).
 */

export function AppLectureParabole() {
  return (
    <AppTransfertSecondDegre<ExerciceLectureParabole>
      titre="Lire une parabole sur un graphique"
      sousTitre="Chapitre 1 — La fonction du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceLectureParabole}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceFragments()} />
          </p>
          <div className="figure-lecture-parabole" style={{ margin: "8px auto", maxWidth: 380 }} dangerouslySetInnerHTML={{ __html: figureEcran(e) }} />
        </>
      )}
      correction={correctionDetailleeLectureParabole}
    />
  );
}
