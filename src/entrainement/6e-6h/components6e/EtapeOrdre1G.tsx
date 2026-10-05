import { useState } from "react";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatLimitesExponentielles";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (ordre1Suffit: boolean) => void;
}

/** Écran "gOrdre1" (`6gen6`, famille G, instance unique) — QCM booléen "un développement à
 * l'ordre 1 suffit-il à conclure ?" (Oui/Non), voir la note de conception dans
 * `core6e/limitesExponentielles.types.ts`. `App6gen6.tsx` doit le rendre avec `key={phase}`. */
export function EtapeOrdre1G({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

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
      <div className="options-grid-compact">
        <button type="button" className={`btn ${choix === true ? "toggle-active" : ""} ${montrerErreurs && choix === true ? "is-erronee" : ""}`} onClick={() => setChoix(true)}>
          Oui
        </button>
        <button type="button" className={`btn ${choix === false ? "toggle-active" : ""} ${montrerErreurs && choix === false ? "is-erronee" : ""}`} onClick={() => setChoix(false)}>
          Non
        </button>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
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
