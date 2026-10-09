import { useState } from "react";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatAffixesRacines";
import { BoutonAide } from "./BoutonAide";

interface Option {
  id: string;
  latex: string;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  options: Option[];
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
 * Écran GÉNÉRIQUE "choix parmi options rendues en LaTeX" pour `6gen35` — bEcran1 ("poser la
 * relation") et cEcran1 ("poser le système") : un CHOIX véritable présenté à l'élève ⟹ boutons
 * `.btn.toggle-active`, JAMAIS `.btn-primary` (convention CLAUDE.md), mirroir
 * `EtapeStatutGEquationsExpLog.tsx` (6gen14) étendu pour rendre chaque option en KaTeX plutôt qu'en
 * texte brut (les options sont des formules). `App6gen35.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeChoixAffixesRacines({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
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
        {options.map((o) => (
          <button key={o.id} type="button" className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choix === o.id ? "is-erronee" : ""}`} onClick={() => setChoix(o.id)}>
            <Katex expression={o.latex} />
          </button>
        ))}
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
