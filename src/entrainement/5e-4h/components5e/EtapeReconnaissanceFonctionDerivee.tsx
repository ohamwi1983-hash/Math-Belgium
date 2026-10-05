import { useState } from "react";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, OPTIONS_RECONNAISSANCE, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceFonctionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: TypeDerivee) => void;
}

/** Écran "reconnaissance" — 4 boutons en grille 2 colonnes (`.options-grid`), choix booléen pur
 * (aucun champ libre, aucun statut à 3 valeurs nécessaire ici — même esprit que
 * `EtapeChoixSigne.tsx`, 5gen20). Correction câblée directement sur `exercice.typesAcceptes`
 * (jamais une seule valeur figée : l'item ambigu accepte 2 réponses). */
export function EtapeReconnaissanceFonctionDerivee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<TypeDerivee | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !exercice.typesAcceptes.includes(choix);
  const aide2 = texteAideNiveau2("reconnaissance", null);

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <p className="prompt-text">
        Objectif : calculer <Katex expression={questionFinale()} />.
      </p>
      <p className="prompt-text">{consigneEcran("reconnaissance", null)}</p>
      <div className="options-grid">
        {OPTIONS_RECONNAISSANCE.map((option) => {
          const actif = choix === option.type;
          return (
            <button
              key={option.type}
              type="button"
              className={`btn${actif ? " toggle-active" : ""}${erronee && actif ? " is-erronee" : ""}`}
              onClick={() => setChoix(option.type)}
            >
              {option.label}
            </button>
          );
        })}
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
          <p>{texteAideNiveau1("reconnaissance", null)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
