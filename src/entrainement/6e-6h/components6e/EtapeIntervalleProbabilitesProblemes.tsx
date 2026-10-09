import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatProbabilitesProblemes";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (ensemble: EnsembleReelGuide) => void;
}

/** Écran "intervalle" pour `6gen33`, famille E sous-type "parametrique" écran 3 UNIQUEMENT — réponse
 * à un `EnsembleReelGuide`, construit via le composant partagé `EnsembleReelGuideBuilder`
 * (`core6e/ensembleReel.types.ts`+`moteur6e/verificationEnsembleReel.ts`, déjà partagés 5e/6e — voir
 * CLAUDE.md, "Transversal 3 chantiers"). Ne prend pas de `diagnostiquer` : contrairement aux écrans
 * "champs"/"choix", l'app affiche l'erreur générique standard (le statut détaillé de l'inéquation
 * n'apporte rien de plus qu'un "correct"/"incorrect" côté élève). `App6gen33.tsx` doit le rendre avec
 * `key={phase}`. */
export function EtapeIntervalleProbabilitesProblemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (reponse === null) return;
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      {blocDonnees.length > 0 && (
        <div className="equation-box">
          <div className="equation-box-donnees">
            {blocDonnees.map((frag, i) => (
              <Katex key={i} expression={frag} block />
            ))}
          </div>
        </div>
      )}
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
