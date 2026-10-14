import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import { CONSIGNE_GENERALE, formatEquationOriginaleLatex, texteAideCENiveau1, texteAideCENiveau2 } from "../ui6e/formatEquationsCyclometriques";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { Katex } from "../components/Katex";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationsCyclometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 — condition d'existence (CE), commune aux 4 variantes de `6gen3` (REFONTE). Construction
 * guidée via `EnsembleReelGuideBuilder` (module partagé avec 6gen1, réutilisé TEL QUEL). */
export function EtapeCEEquationsCyclometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [ce, setCe] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (ce === null) return;
    onValider(ce);
  }

  const aide2 = texteAideCENiveau2(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationOriginaleLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">Établis la condition d'existence (CE) de x∈[intervalle] pour cette équation.</p>
      <EnsembleReelGuideBuilder onChange={setCe} label="x\in" erronee={montrerErreurs} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={ce === null} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideCENiveau1(exercice)}</p>
          {niveauAide >= 2 && aide2 && (
            <>
              <p>{aide2.texte}</p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
    </div>
  );
}
