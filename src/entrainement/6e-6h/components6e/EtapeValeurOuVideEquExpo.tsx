import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseValeurOuVide } from "../moteur6e/verificationEquationsExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsExponentielles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseValeurOuVide) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "existe/n'existe pas" (famille B, écran 2) — même patron que 5gen4/6gen3
 * (`EtapeAppliquerArcFonctionsCyclometriques.tsx`) : le toggle gate le champ numérique, jamais une
 * variante de "faux" en cas de "n'existe pas". `App6gen9.tsx` doit le rendre avec `key={phase}`. */
export function EtapeValeurOuVideEquExpo({ consigneEcran, enonceLatex, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = existe === true ? texte.trim() !== "" : existe === false;

  function valider() {
    if (!complet) return;
    onValider({ existe: existe as boolean, texte: existe ? texte : null });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={enonceLatex} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneEcran}</p>

      <div className="options-grid-compact">
        <button type="button" className={`btn ${existe === true ? "toggle-active" : ""} ${montrerErreurs && existe === true ? "is-erronee" : ""}`} onClick={() => setExiste(true)}>
          Il existe une solution
        </button>
        <button type="button" className={`btn ${existe === false ? "toggle-active" : ""} ${montrerErreurs && existe === false ? "is-erronee" : ""}`} onClick={() => setExiste(false)}>
          ∅ — Aucune solution
        </button>
      </div>

      {existe === true && (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field contenu-conditionnel">
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
          </div>
        </>
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

    </div>
  );
}
