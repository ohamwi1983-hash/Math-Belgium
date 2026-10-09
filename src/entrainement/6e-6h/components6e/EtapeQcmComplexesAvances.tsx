import { useState } from "react";
import { Katex } from "../components/Katex";
import type { AideAvecLatex, OptionQcm } from "../ui6e/formatComplexesAvances";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  options: OptionQcm[];
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
 * Écran GÉNÉRIQUE "choix parmi N options" pour `6gen42` — mirroir
 * `EtapeChoixCongruenceFormeTrigonometrique.tsx` (6gen37), généralisé à un nombre d'options
 * variable. Réutilisé par les 3 écrans QCM de la famille A (`aEcran1/2/3`) et l'écran 3 de la
 * famille E (`eEcran3`) — jamais pour la famille C écran 3, qui a 2 groupes de choix indépendants
 * sur le même écran (`EtapeConclusionC.tsx`). Boutons `.btn.toggle-active`, JAMAIS `.btn-primary`
 * (réservé à "Valider", convention CLAUDE.md). `App6gen42.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeQcmComplexesAvances({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
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
        {options.map((option) => (
          <button key={option.id} type="button" className={`btn ${choix === option.id ? "toggle-active" : ""} ${montrerErreurs && choix === option.id ? "is-erronee" : ""}`} onClick={() => setChoix(option.id)}>
            {option.label}
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
