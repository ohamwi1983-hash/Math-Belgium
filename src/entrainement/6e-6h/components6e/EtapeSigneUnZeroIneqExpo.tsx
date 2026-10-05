import { useState } from "react";
import type { DirectionSigne } from "../core6e/inequationsExponentielles.types";
import { Katex } from "../components/Katex";
import type { ReponseSigneUnZero } from "../moteur6e/verificationInequationsExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatInequationsExponentielles";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  /** `null` — jamais rendu — sur le premier écran de chaque famille (rien à rappeler). */
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSigneUnZero) => void;
}

/**
 * Écran GÉNÉRIQUE "zéro + direction du signe" (famille D, sous-type variable, écrans 1 et 2) —
 * un champ numérique (le zéro) + un choix binaire (le sens du changement de signe, lu de gauche à
 * droite). `App6gen10.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeSigneUnZeroIneqExpo({ consigneEcran, enonceLatex, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [zeroTexte, setZeroTexte] = useState("");
  const [sens, setSens] = useState<DirectionSigne | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = zeroTexte.trim() !== "" && sens !== null;

  function valider() {
    if (!complet) return;
    onValider({ zeroTexte, sens: sens as DirectionSigne });
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

      <div className="field">
        <label className="field-label field-label-minuscule">Zéro du facteur, x =</label>
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={zeroTexte} placeholder="ex : -2" onChange={(e) => setZeroTexte(e.target.value)} />
      </div>

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn ${sens === "negatif_puis_positif" ? "toggle-active" : ""} ${montrerErreurs && sens === "negatif_puis_positif" ? "is-erronee" : ""}`}
          onClick={() => setSens("negatif_puis_positif")}
        >
          Négatif avant, positif après
        </button>
        <button
          type="button"
          className={`btn ${sens === "positif_puis_negatif" ? "toggle-active" : ""} ${montrerErreurs && sens === "positif_puis_negatif" ? "is-erronee" : ""}`}
          onClick={() => setSens("positif_puis_negatif")}
        >
          Positif avant, négatif après
        </button>
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
