import type { ExerciceEquationParametre } from "./core/equationParametre.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationParametre } from "./generateurs/equationParametre";
import { correctionDetailleeEquationParametre } from "./generateurs/equationParametre/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, equationLatex } from "./ui/formatEquationParametre";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { Katex } from "./components/Katex";

/**
 * gen115 — « Équation à paramètre m » (4e, chapitre 2, § 1, processus 3 TRANSFÉRER). Quatre écrans :
 * Δ(m) (toute forme équivalente acceptée), Δ(m) = 0 et la racine double pour chaque valeur, signe de
 * Δ(m) (ensemble des m tels que Δ(m) > 0, puis la parabole de Δ(m)), discussion (choix fermé, une
 * tentative ; en « a = m », le cas m = 0 du premier degré). Coquille : `AppTransfertSecondDegre`.
 */

export function AppEquationParametre() {
  return (
    <AppTransfertSecondDegre<ExerciceEquationParametre>
      titre="Équation à paramètre m"
      sousTitre="Chapitre 2 — Équations et inéquations du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceEquationParametre}
      construireAvecVariante={construireAvecVariante}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e) => (
        <p style={{ margin: "8px 0 0", fontWeight: 600 }}>
          <Katex expression={`(E)\\ :\\ ${equationLatex(e)}`} />
        </p>
      )}
      correction={correctionDetailleeEquationParametre}
    />
  );
}
