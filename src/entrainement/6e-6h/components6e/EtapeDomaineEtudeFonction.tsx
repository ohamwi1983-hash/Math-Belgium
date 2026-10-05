import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE, consigneDomaine } from "../ui6e/formatEtudeFonctionExponentielle";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  enonceLatex: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran 1/6, "domaine" — construction guidée via `EnsembleReelGuideBuilder` (module partagé avec
 * 6gen1/6gen3/6gen7). `App6gen11.tsx` doit le rendre avec `key={indexExercice}` (le domaine est
 * TOUJOURS le premier écran, jamais rejoué dans la même clé qu'un autre écran). Aucune prop
 * `etatActuel` ici — c'est TOUJOURS le premier écran de la séquence (`ui6e/
 * formatEtudeFonctionExponentielle.ts::etatActuel` renvoie `null` pour la phase "domaine"), rien à
 * rappeler ; les 5 autres écrans de ce générateur reçoivent bien ce bloc. */
export function EtapeDomaineEtudeFonction({ enonceLatex, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <p className="prompt-text">{consigneDomaine()}</p>
      <EnsembleReelGuideBuilder onChange={setReponse} label="domf =" />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse !== null && onValider(reponse)}>
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
