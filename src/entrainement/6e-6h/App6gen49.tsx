import type { ExerciceVariablesDiscretesEsperance } from "./core6e/variablesDiscretesEsperance.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVariablesDiscretesEsperance } from "./generateurs6e/variablesDiscretesEsperance";
import type { PhaseVariablesDiscretesEsperance } from "./moteur6e/typesVariablesDiscretesEsperance";
import { DEFINITION_6GEN49, attentesVariablesDiscretesEsperance } from "./moteur6e/verificationVariablesDiscretesEsperance";
import { FORMAT_6GEN49 } from "./ui6e/formatVariablesDiscretesEsperance";
import { decimalLatex } from "./ui6e/fragmentsCombinatoire";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import { phasesPourExercice } from "./moteur6e/typesVariablesDiscretesEsperance";
import { correctionDetailleeVariablesDiscretes } from "./generateurs6e/variablesDiscretesEsperance/corrigeDetaille";
import { corrigeDeLEcran } from "./ui6e/corrigeCombinatoire";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { TableauLoi } from "./components6e/TableauLoi";

/**
 * `6gen49` — Variables aléatoires discrètes et espérance (6e ch. 8, § 1, processus 2 APPLIQUER).
 * Socle commun du ch. 7 (`AppCombinatoire`, audit du ch. 8, lot B) : `?code=`, illisible gratuit,
 * choix fermés seuls sur leur écran à une tentative, aides à deux niveaux, explication après échec,
 * corrigé consultable après chaque réponse. Famille A : la loi est un vrai tableau, visible à chaque
 * écran (audit, G20 : le tableau KaTeX centré était rogné).
 */
const CONFIG: ConfigAppCombinatoire<ExerciceVariablesDiscretesEsperance, PhaseVariablesDiscretesEsperance> = {
  id: "6gen49",
  titre: "Variables aléatoires discrètes et espérance",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceVariablesDiscretesEsperance,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN49,
  attentes: attentesVariablesDiscretesEsperance,
  format: FORMAT_6GEN49,
  complement: (e) =>
    e.famille === "A" ? <TableauLoi valeurs={e.xs.map(String)} probabilites={e.poids.map((p) => decimalLatex(p / 20))} description={`Loi de X : ${e.xs.length} valeurs`} /> : null,
  // Corrigé « comme au tableau » de l'écran (lot E) : même source que le papier, une lettre par écran.
  corrigeDetaille: (e, p) => <CorrigeDetailleEcran etapes={corrigeDeLEcran(correctionDetailleeVariablesDiscretes(e), phasesPourExercice(e), p)} />,
};

export function App6gen49() {
  return <AppCombinatoire config={CONFIG} />;
}
