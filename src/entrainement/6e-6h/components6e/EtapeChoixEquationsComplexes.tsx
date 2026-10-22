import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatEquationsComplexes";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Option {
  id: string;
  latex: string;
}

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  options: Option[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE "choix parmi options rendues en LaTeX" pour `6gen36` — aAvecEcran1 ("poser le
 * système"), bEcran1 ("poser l'équation développée"), eEcran1 ("poser l'équation en u") : un CHOIX
 * véritable présenté à l'élève ⟹ boutons `.btn.toggle-active`, JAMAIS `.btn-primary` (convention
 * CLAUDE.md), mirroir `EtapeChoixAffixesRacines.tsx` (6gen35). `App6gen36.tsx` doit le rendre avec
 * `key={phase}`.
 */
export function EtapeChoixEquationsComplexes({ consigneGenerale, blocDonnees, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {options.map((o) => (
          <button key={o.id} type="button" className={`btn ${choix === o.id ? "toggle-active" : ""} ${montrerErreurs && choix === o.id ? "is-erronee" : ""}`} onClick={() => setChoix(o.id)}>
            <Katex expression={o.latex} />
          </button>
        ))}
      </div>
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
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
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
