import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import { verifierImage } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_IMAGE, CONSIGNE_GENERALE, TEXTE_AIDE_IMAGE_NIVEAU1, aideImageNiveau2, formatFLatexAffichage } from "../ui6e/formatInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  estPremierEcran: boolean;
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

/** Écran 4 — image de f sur l'intervalle retenu à l'écran précédent, un seul
 * `EnsembleReelGuideBuilder`. `App6gen1.tsx` rend ce composant avec `key={phase}`. */
export function EtapeImageInjectiviteFonctions({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [image, setImage] = useState<EnsembleReelGuide | null>(null);
  const [derniereReponse, setDerniereReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const correct = montrerErreurs ? verifierImage(exercice, derniereReponse as EnsembleReelGuide) : true;

  function valider() {
    if (image === null) return;
    setDerniereReponse(image);
    onValider(image);
  }

  const aide2 = aideImageNiveau2(exercice);

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFLatexAffichage(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_ECRAN_IMAGE}</p>

      <EnsembleReelGuideBuilder onChange={setImage} label="\text{Im}(f)=" erronee={montrerErreurs && !correct} />

      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={image === null} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && !correct && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_IMAGE_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              {aide2.latex && <Katex expression={aide2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
