import type { ExerciceLoiBinomiale } from "./core6e/loiBinomiale.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./generateurs6e/loiBinomiale";
import { loiBinomialeExacte, pDiagramme } from "./generateurs6e/loiBinomiale/familleB";
import type { PhaseLoiBinomiale } from "./moteur6e/typesLoiBinomiale";
import { DEFINITION_6GEN50, attentesLoiBinomiale } from "./moteur6e/verificationLoiBinomiale";
import { versNombre } from "./moteur6e/saisieCombinatoire";
import { FORMAT_6GEN50 } from "./ui6e/formatLoiBinomiale";
import { AppCombinatoire } from "./components6e/AppCombinatoire";
import type { ConfigAppCombinatoire } from "./components6e/AppCombinatoire";
import { DiagrammeBarres } from "./components6e/DiagrammeBarres";

/**
 * `6gen50` — Loi binomiale (6e ch. 8, § 2, processus 2 APPLIQUER). Socle commun du ch. 7
 * (`AppCombinatoire`, audit du ch. 8, lot B). Écran « diagramme » : trois diagrammes en barres côte à
 * côte (le juste, son miroir, 𝓑(n ; 0,5)), dans un ordre tiré au hasard.
 */
function Diagrammes({ e }: { e: ExerciceLoiBinomiale & { famille: "B" } }) {
  const lois = e.ordreDiagrammes.map((quoi) => loiBinomialeExacte(e.n, pDiagramme(e, quoi)).map(versNombre));
  const maximum = Math.max(...lois.flat());
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 8, margin: "8px 0" }}>
      {lois.map((loi, i) => (
        <DiagrammeBarres key={i} titre={`Diagramme ${i + 1}`} probabilites={loi} maximum={maximum} />
      ))}
    </div>
  );
}

const CONFIG: ConfigAppCombinatoire<ExerciceLoiBinomiale, PhaseLoiBinomiale> = {
  id: "6gen50",
  titre: "Loi binomiale",
  sousTitre: "Chapitre 8 — Variables aléatoires",
  catalogue: CATALOGUE_VARIANTES,
  genererLibre: genererExerciceLoiBinomiale,
  genererVariante: construireAvecVarianteId,
  definition: DEFINITION_6GEN50,
  attentes: attentesLoiBinomiale,
  format: FORMAT_6GEN50,
  complement: (e, p) => (e.famille === "B" && p === "bDiagramme" ? <Diagrammes e={e} /> : null),
};

export function App6gen50() {
  return <AppCombinatoire config={CONFIG} />;
}
