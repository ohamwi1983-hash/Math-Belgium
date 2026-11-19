import type { ExerciceConstruireInequation } from "./core/construireInequation.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceConstruireInequation } from "./generateurs/construireInequation";
import { correctionDetailleeConstruireInequation } from "./generateurs/construireInequation/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, ensembleTexteLatex } from "./ui/formatConstruireInequation";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen120 — « Construire une inéquation ou une équation à partir de sa solution » (4e, chapitre 2,
 * § 1 et § 2, processus 3 TRANSFÉRER). L'ensemble-solution S est donné. Écran 1 : une (in)équation
 * du second degré de solution S — TOUTE réponse juste est acceptée (on compare son ensemble-solution
 * à S) ; écran 2 : la même avec un coefficient de x² imposé ; écran 3 : la parabole de racines
 * données qui passe par un point → a, b, c. Coquille commune : `components/AppTransfertSecondDegre.tsx`.
 */

export function AppConstruireInequation() {
  return (
    <AppTransfertSecondDegre<ExerciceConstruireInequation>
      titre="Construire une inéquation à partir de sa solution"
      sousTitre="Chapitre 2 — Équations et inéquations du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceConstruireInequation}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", fontWeight: 600 }}>
          Ensemble des solutions : <Katex expression={ensembleTexteLatex(e)} />
        </p>
      )}
      correction={correctionDetailleeConstruireInequation}
    />
  );
}
