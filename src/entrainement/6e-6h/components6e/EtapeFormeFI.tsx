import { useState } from "react";
import type { CategorieFI } from "../core6e/limitesExponentielles.types";
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
  onValider: (reponse: CategorieFI) => void;
}

const OPTIONS: { id: CategorieFI; label: string }[] = [
  { id: "zero_sur_zero", label: "0/0" },
  { id: "infini_sur_infini", label: "∞/∞" },
  { id: "pas_une_fi", label: "Pas une FI" },
];

/** Écran de diagnostic AVANT toute dérivation, partagé par les familles L'Hôpital (H/I/J/K,
 * `6gen6`) — classer la forme (0/0, ∞/∞, ou aucune FI) avant d'appliquer la règle, pour éviter le
 * piège classique "appliquer L'Hôpital sans vérifier la forme". `App6gen6.tsx` doit le rendre avec
 * `key={phase}`. */
export function EtapeFormeFI({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<CategorieFI | null>(null);
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
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choix === o.id ? "is-erronee" : ""}`}
            onClick={() => setChoix(o.id)}
          >
            {o.label}
          </button>
        ))}
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
