import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatInequationsLogarithmiques";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  /** `null` sur le premier écran de chaque famille (rien à rappeler) — voir
   * `ui6e/formatInequationsLogarithmiques.ts::etatActuel`. */
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/**
 * Écran GÉNÉRIQUE "construis l'ensemble-solution" (`6gen15`) — réutilisé par tous les écrans dont
 * la réponse est un `EnsembleReelGuide` (CE, résolution finale, intervalle en y...) — même
 * composant partagé `EnsembleReelGuideBuilder` que 6gen1/6gen3/6gen7/6gen10. `App6gen15.tsx` doit
 * le rendre avec `key={phase}`.
 */
export function EtapeIntervalleIneqLog({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (reponse === null) return;
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>

      <EnsembleReelGuideBuilder onChange={setReponse} label="S =" />

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
