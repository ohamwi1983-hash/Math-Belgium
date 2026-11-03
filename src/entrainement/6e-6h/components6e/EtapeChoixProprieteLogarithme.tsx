import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { Caracteristique } from "../core6e/decompositionLogarithme";
import type { FragmentConsigne } from "../ui6e/formatProprietesLogarithme";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: FragmentConsigne[];
  expressionLatex: string;
  etatActuel: string[] | null;
  consigneEcran: FragmentConsigne[];
  options: readonly { id: Caracteristique; label: string }[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: Caracteristique) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « quelle propriété appliquer ? » de `6gen13` (audit 6e ch.3, décision K1) — précède chaque
 * transformation d'argument : l'élève reconnaît lui-même la couche la plus extérieure. Choix fermé
 * ⟹ boutons `.btn.toggle-active` (jamais `.btn-primary`, réservé à « Valider ») et UNE SEULE
 * tentative (voir `tentativesMaxEcran`) : seul le choix soumis et refusé passe en rouge.
 */
export function EtapeChoixProprieteLogarithme({
  consigneGenerale,
  expressionLatex,
  etatActuel,
  consigneEcran,
  options,
  aideNiveau1,
  aideNiveau2,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [choix, setChoix] = useState<Caracteristique | null>(null);
  const [choixSoumis, setChoixSoumis] = useState<Caracteristique | null>(null);
  // Une seule tentative : un refus clôt aussitôt l'écran (réponse révélée) — c'est `validation`
  // qui le dit, `tentativesUtilisees` n'étant pas encore appliqué à l'état affiché à ce moment-là.
  const refuse = validation?.revele === true;

  function valider() {
    if (choix === null) return;
    setChoixSoumis(choix);
    onValider(choix);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={expressionLatex} />
          </div>
        }
      />
      {etatActuel && (
        <div className="etat-actuel-box">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      )}
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`btn ${choix === option.id ? "toggle-active" : ""} ${refuse && choixSoumis === option.id ? "is-erronee" : ""}`}
            disabled={!!validation}
            onClick={() => setChoix(option.id)}
          >
            {option.label}
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
