import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { AideAvecLatex, ArbreAffichage, FragmentConsigne, OptionChoix, TableauEffectifsAffichage } from "../ui6e/formatArbreTableauEffectifs";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { ArbreEffectifs, TableauEffectifs } from "./FiguresArbreTableauEffectifs";

interface Props {
  consigneGenerale: FragmentConsigne[];
  arbre: ArbreAffichage | null;
  tableau: TableauEffectifsAffichage | null;
  consigneEcran: FragmentConsigne[];
  options: OptionChoix[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choixId: string) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran « indépendance » de `6gen74` : choix fermé à deux issues, UN SEUL essai
 * (`sessionArbreTableauEffectifs.ts::tentativesMaxCourant`) — la validation suit directement le
 * premier choix validé. Boutons `.btn.toggle-active` (jamais `.btn-primary`, réservé à « Valider »),
 * même patron que `EtapeChoixProbabilitesProblemes.tsx`. */
export function EtapeChoixArbreTableauEffectifs({ consigneGenerale, arbre, tableau, consigneEcran, options, aideNiveau1, aideNiveau2, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [choixId, setChoixId] = useState<string | null>(null);
  const gele = !!validation;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          arbre || tableau ? (
            <>
              {arbre && <ArbreEffectifs arbre={arbre} />}
              {tableau && <TableauEffectifs tableau={tableau} />}
            </>
          ) : null
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {options.map((option) => (
          <button key={option.id} type="button" disabled={gele} className={`btn ${choixId === option.id ? "toggle-active" : ""}`} onClick={() => setChoixId(option.id)}>
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
          <button type="button" className="btn btn-primary" disabled={choixId === null} onClick={() => choixId !== null && onValider(choixId)}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
