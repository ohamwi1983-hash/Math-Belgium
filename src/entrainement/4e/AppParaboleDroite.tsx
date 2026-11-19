import type { ExerciceParaboleDroite } from "./core/paraboleDroite.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceParaboleDroite } from "./generateurs/paraboleDroite";
import { correctionDetailleeParaboleDroite } from "./generateurs/paraboleDroite/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, fLatex, gLatex } from "./ui/formatParaboleDroite";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen118 — « Parabole et droite : intersection et position » (4e, chapitre 2, § 2, processus 2
 * APPLIQUER). Écrans : f(x) = g(x) ramené à 0, résolution (« aucune » possible), ordonnées des points
 * communs (si il y en a), inéquation f(x) ◇ g(x) par le signe de f − g, puis la figure.
 * Coquille commune : `components/AppTransfertSecondDegre.tsx`.
 */

export function AppParaboleDroite() {
  return (
    <AppTransfertSecondDegre<ExerciceParaboleDroite>
      titre="Parabole et droite : intersection et position"
      sousTitre="Chapitre 2 — Équations et inéquations du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceParaboleDroite}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", fontWeight: 600, lineHeight: 2 }}>
          <Katex expression={`f(x)=${fLatex(e)}`} />
          <br />
          <Katex expression={`g(x)=${gLatex(e)}`} />
        </p>
      )}
      correction={correctionDetailleeParaboleDroite}
    />
  );
}
