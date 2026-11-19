import type { ExerciceBicarree } from "./core/bicarree.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceBicarree } from "./generateurs/bicarree";
import { correctionDetailleeBicarree } from "./generateurs/bicarree/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, equationLatex } from "./ui/formatBicarree";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen116 — « Bicarrées et changement de variable » (4e, chapitre 2, § 1, processus 2 APPLIQUER).
 * Écrans : équation en t (t = x² ou t = x² + k), ses solutions, tri des t (choix fermé : un carré
 * n'est jamais négatif), solutions en x (« aucune » possible). Coquille : `AppTransfertSecondDegre`.
 */

export function AppBicarree() {
  return (
    <AppTransfertSecondDegre<ExerciceBicarree>
      titre="Bicarrées et changement de variable"
      sousTitre="Chapitre 2 — Équations et inéquations du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceBicarree}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", fontWeight: 600 }}>
          <Katex expression={`(E)\\ :\\ ${equationLatex(e)}`} />
        </p>
      )}
      correction={correctionDetailleeBicarree}
    />
  );
}
