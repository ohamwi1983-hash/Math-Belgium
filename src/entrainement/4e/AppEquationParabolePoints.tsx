import type { ExerciceEquationParabolePoints } from "./core/equationParabolePoints.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationParabolePoints } from "./generateurs/equationParabolePoints";
import { correctionDetailleeEquationParabole } from "./generateurs/equationParabolePoints/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, enonceFragments, figure } from "./ui/formatEquationParabolePoints";
import { figurePourEcran } from "./ui/figureParaboleGrille";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { RenduFragments } from "./components/RenduFragments";

/**
 * gen125 — « Retrouver l'équation d'une parabole » (4e, chapitre 1, § 2, processus 2 APPLIQUER).
 * Forme de départ (choix, une tentative), coefficient a par le point P — ou a et b par un système
 * (trois points) —, puis l'équation développée (toute écriture équivalente acceptée). Variante
 * graphique : figure du papier (quadrillage d'une unité, échelle unique, P marqué). Coquille commune :
 * `components/AppTransfertSecondDegre.tsx`.
 */

export function AppEquationParabolePoints() {
  return (
    <AppTransfertSecondDegre<ExerciceEquationParabolePoints>
      titre="Retrouver l'équation d'une parabole"
      sousTitre="Chapitre 1 — La fonction du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceEquationParabolePoints}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceFragments(e)} />
          </p>
          {e.variante === "graphique" && <div className="figure-equation-parabole" style={{ margin: "8px auto", maxWidth: 380 }} dangerouslySetInnerHTML={{ __html: figurePourEcran(figure(e)) }} />}
        </>
      )}
      correction={correctionDetailleeEquationParabole}
    />
  );
}
