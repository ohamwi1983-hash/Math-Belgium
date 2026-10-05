import { useState } from "react";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatInequationsExponentielles";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Option {
  id: string;
  label: string;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  /** `null` — jamais rendu — sur le premier écran de chaque famille (rien à rappeler). */
  etatActuel: string[] | null;
  optionGauche: Option;
  optionDroite: Option;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
}

/**
 * Écran GÉNÉRIQUE à 2 boutons (`6gen10`) — réutilisé par bReconnaitre (∅/existe), cfReconnaitre
 * et ckConclure (ℝ/pas toujours vraie), dConstantSigne (positif/négatif) : 4 écrans de pure
 * RECONNAISSANCE catégorielle, jamais un `EnsembleReelGuide` à construire (voir
 * `core6e/inequationsExponentielles.types.ts` pour la décision de représentation). Labels
 * PARAMÉTRÉS par l'appelant (`optionGauche`/`optionDroite`) — chaque famille pose une question
 * différente, jamais le même texte de bouton. `App6gen10.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeChoixDeuxIneqExpo({ consigneEcran, enonceLatex, etatActuel, optionGauche, optionDroite, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
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

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn ${choix === optionGauche.id ? "toggle-active" : ""} ${montrerErreurs && choix === optionGauche.id ? "is-erronee" : ""}`}
          onClick={() => setChoix(optionGauche.id)}
        >
          {optionGauche.label}
        </button>
        <button
          type="button"
          className={`btn ${choix === optionDroite.id ? "toggle-active" : ""} ${montrerErreurs && choix === optionDroite.id ? "is-erronee" : ""}`}
          onClick={() => setChoix(optionDroite.id)}
        >
          {optionDroite.label}
        </button>
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
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
