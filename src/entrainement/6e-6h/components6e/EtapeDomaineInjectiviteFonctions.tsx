import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import { verifierDomaine } from "../moteur6e/verificationInjectiviteFonctions";
import { CONSIGNE_ECRAN_DOMAINE, CONSIGNE_GENERALE, aideDomaineNiveau2, formatFLatexAffichage, texteAideDomaineNiveau1 } from "../ui6e/formatInjectiviteFonctions";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran 1 — domaine de définition, un seul `EnsembleReelGuideBuilder` réutilisé tel quel.
 * `App6gen1.tsx` doit le rendre avec `key={phase}` (l'état local du builder ne doit jamais
 * survivre à un changement d'écran). */
export function EtapeDomaineInjectiviteFonctions({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [domaine, setDomaine] = useState<EnsembleReelGuide | null>(null);
  const [derniereReponse, setDerniereReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const correct = montrerErreurs ? verifierDomaine(exercice, derniereReponse as EnsembleReelGuide) : true;

  function valider() {
    if (domaine === null) return;
    setDerniereReponse(domaine);
    onValider(domaine);
  }

  const aide2 = aideDomaineNiveau2(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={formatFLatexAffichage(exercice)} />
      </div>
      <p className="prompt-text">{CONSIGNE_ECRAN_DOMAINE}</p>

      <EnsembleReelGuideBuilder onChange={setDomaine} label="domf =" erronee={montrerErreurs && !correct} />

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={domaine === null} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && !correct && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideDomaineNiveau1(exercice)}</p>
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
