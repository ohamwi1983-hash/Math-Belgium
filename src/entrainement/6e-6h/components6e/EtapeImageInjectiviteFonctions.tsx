import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import { verifierImage } from "../moteur6e/verificationInjectiviteFonctions";
import {
  CONSIGNE_ECRAN_IMAGE,
  CONSIGNE_GENERALE,
  TEXTE_AIDE_IMAGE_NIVEAU1,
  aideImageNiveau2,
  formatFLatexAffichage,
  lignesEtatActuelApresReciproque,
} from "../ui6e/formatInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  /** Intervalle de travail CONFIRMÉ à l'écran précédent (le domaine entier si `injective`, une des
   * 2 moitiés sinon) — affiché dans le bloc "état actuel", jamais recalculé ici. */
  intervalleConfirme: EnsembleReelGuide;
  /** Branche mémorisée par la Couche B (écran "injective") — pour reformer la réciproque
   * CONFIRMÉE à l'écran précédent dans le bloc "état actuel" (voir
   * `ui6e/formatInjectiviteFonctions.ts::lignesEtatActuelApresReciproque`), jamais recalculée
   * depuis la saisie brute de l'élève. */
  coteChoisi: CoteBranche;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran 4 — image de f sur l'intervalle retenu à l'écran précédent, un seul
 * `EnsembleReelGuideBuilder`. `App6gen1.tsx` rend ce composant avec `key={phase}`. */
export function EtapeImageInjectiviteFonctions({ exercice, intervalleConfirme, coteChoisi, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
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
  const lignesEtatActuel = lignesEtatActuelApresReciproque(exercice, intervalleConfirme, coteChoisi);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFLatexAffichage(exercice)} />
      </div>
      {lignesEtatActuel.map((ligne) => (
        <EtatActuelPanel key={ligne.label} label={ligne.label} latex={ligne.latex} />
      ))}
      <p className="prompt-text">{CONSIGNE_ECRAN_IMAGE}</p>

      <EnsembleReelGuideBuilder onChange={setImage} label="\text{Im}(f)=" erronee={montrerErreurs && !correct} />

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={image === null} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && !correct && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

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
