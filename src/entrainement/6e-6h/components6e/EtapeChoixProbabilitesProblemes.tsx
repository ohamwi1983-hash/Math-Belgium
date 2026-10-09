import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, OptionChoix } from "../ui6e/formatProbabilitesProblemes";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
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
}

/** Écran GÉNÉRIQUE "choix parmi 2 options" pour `6gen33` — même patron que
 * `EtapeChoixProbabilitesEnsembles.tsx` (6gen30), copié plutôt qu'importé. SEUL écran de ce
 * générateur à l'utiliser : famille F écran 3, variante "verifierAffirmation" (vrai/faux). Choix
 * véritable présenté à l'élève ⟹ boutons `.btn.toggle-active`, JAMAIS `.btn-primary` (réservé à
 * "Valider", CLAUDE.md). `App6gen33.tsx` doit le rendre avec `key={phase}`. */
export function EtapeChoixProbabilitesProblemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, options, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [choixId, setChoixId] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs && choixId !== null ? diagnostiquer(choixId) : null;

  function valider() {
    if (choixId === null) return;
    onValider(choixId);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      {blocDonnees.length > 0 && (
        <div className="equation-box">
          <div className="equation-box-donnees">
            {blocDonnees.map((frag, i) => (
              <Katex key={i} expression={frag} block />
            ))}
          </div>
        </div>
      )}
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
          <button key={option.id} type="button" className={`btn ${choixId === option.id ? "toggle-active" : ""} ${montrerErreurs && choixId === option.id ? "is-erronee" : ""}`} onClick={() => setChoixId(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choixId === null} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
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
