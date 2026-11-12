import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, FragmentConsigne, OptionChoix, TableauAffichage } from "../ui6e/formatIndependanceBayes";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { TableAffichage } from "./EtapeChampsIndependanceBayes";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  tableauDonnees: TableauAffichage | null;
  consigneEcran: FragmentConsigne[];
  options: OptionChoix[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choixId: string) => void;
  diagnostiquer: (choixId: string) => StatutVerification;
  validation?: ValidationEtapeProps | null;
}

/** Écran à CHOIX FERMÉ de `6gen32` (« incompatibles, indépendants, ou ni l'un ni l'autre ? ») — même
 * patron que `EtapeChoixProbabilitesEnsembles.tsx` (6gen30), avec la table de données de la famille B.
 * Boutons `.btn.toggle-active` (jamais `.btn-primary`, réservé à « Valider »). UNE seule tentative
 * (`tentativesMaxCourant`, `moteur6e/sessionIndependanceBayes.ts`). */
export function EtapeChoixIndependanceBayes({ consigneGenerale, blocDonnees, tableauDonnees, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation }: Props) {
  const [choixId, setChoixId] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs && choixId !== null ? diagnostiquer(choixId) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <>
            {blocDonnees.length > 0 && (
              <div className="equation-box">
                <div className="equation-box-donnees">
                  {blocDonnees.map((frag, i) => (
                    <Katex key={i} expression={frag} block />
                  ))}
                </div>
              </div>
            )}
            {tableauDonnees && <TableAffichage tableau={tableauDonnees} />}
          </>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className="options-grid-compact">
        {options.map((option) => (
          <button key={option.id} type="button" disabled={!!validation} className={`btn ${choixId === option.id ? "toggle-active" : ""} ${montrerErreurs && choixId === option.id ? "is-erronee" : ""}`} onClick={() => setChoixId(option.id)}>
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
          {montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
