import { useState } from "react";
import type { ExerciceAnalyseFonction } from "../core/analyseFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { MorceauFractionInput } from "./MorceauFractionInput";
import { construireMorceauFraction, etatMorceauFractionInitial } from "../ui/morceauFraction";
import { formatApercuSolution } from "../ui/apercuIntervalle";
import { calculerCourbeAxeSommet, calculerSketchAxeSommet, calculerSurlignageImf } from "../ui/sketchAxeSommet";
import { SketchAxeSommet } from "./SketchAxeSommet";
import { Katex } from "./Katex";
import { formatFonctionOrdreLatex } from "../ui/formatAnalyseFonction";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: Morceau) => void;
}

/**
 * Étape 4 : domf = ℝ est une information donnée (pas une question), seule imf est construite —
 * toujours un seul intervalle semi-infini, donc un unique MorceauFractionInput (jamais les 6
 * formes générales de l'exercice "tableau de signes", inutiles ici). `MorceauFractionInput` (pas
 * `MorceauIntervalleInput`) car y_S = a·x_S²+b·x_S+c n'est pas garanti entier (bug corrigé : la
 * borne de imf était rejetée silencieusement dans ~18% des exercices, `MorceauIntervalleInput` ne
 * parsant que des décimaux — voir `ui/morceauFraction.ts`). Bouton "Aide" (point 2,
 * prompt-4-modifications-analyse-fonction.md) : même croquis Ox/Oy que l'étape précédente, avec en
 * plus un surlignage vert sur Oy de y_S jusqu'à l'extrémité de l'axe dans la direction de imf.
 */
export function EtapeDomaineImage({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [morceau, setMorceau] = useState(etatMorceauFractionInitial());
  const reponse = construireMorceauFraction(morceau);
  const apercu = formatApercuSolution("intervalle", "", morceau, morceau, morceau);

  const { enonce } = exercice.exercice;
  const signeA = enonce.a > 0 ? "+" : "-";
  const geom = calculerSketchAxeSommet(exercice.xS, exercice.yS, enonce.c);
  const surlignage = calculerSurlignageImf(geom, signeA);
  const courbe = calculerCourbeAxeSommet(geom, signeA);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
      </div>
      <p className="prompt-text">domf = ℝ</p>
      <p className="prompt-text">Quel est l'ensemble-image (imf) de cette fonction ?</p>
      {aideActivee && <SketchAxeSommet geom={geom} courbe={courbe} signeA={signeA} surlignage={surlignage} />}
      <div className="field">
        <MorceauFractionInput etat={morceau} onChange={setMorceau} />
      </div>
      {apercu !== null && (
        <div className="apercu-box">
          <Katex expression={apercu} block />
        </div>
      )}
      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
