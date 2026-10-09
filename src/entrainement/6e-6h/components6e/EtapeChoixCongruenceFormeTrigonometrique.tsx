import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ConditionD } from "../core6e/formeTrigonometrique.types";
import { OPTIONS_CONDITION_D } from "../moteur6e/verificationFormeTrigonometrique";
import type { AideAvecLatex } from "../ui6e/formatFormeTrigonometrique";
import { LIBELLE_CONDITION } from "../ui6e/formatFormeTrigonometrique";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (condition: ConditionD) => void;
}

/**
 * Écran GÉNÉRIQUE "choix parmi 4 conditions" — famille D, écran 2 UNIQUEMENT (poser l'équation de
 * congruence correspondant à la condition demandée). Choix véritable présenté à l'élève ⟹ boutons
 * `.btn.toggle-active`, JAMAIS `.btn-primary` (réservé à "Valider", convention CLAUDE.md) — mirroir
 * `EtapeChoixOuiNonExpoProblemes.tsx`, généralisé à 4 options. `OPTIONS_CONDITION_D` (`moteur6e/
 * verificationFormeTrigonometrique.ts`) fixe l'ordre des boutons — synchronisé avec
 * `diagnostiquerDEcran2`, qui compare directement l'identifiant choisi à `exercice.condition`.
 */
export function EtapeChoixCongruenceFormeTrigonometrique({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<ConditionD | null>(null);
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
        {OPTIONS_CONDITION_D.map((option) => (
          <button key={option} type="button" className={`btn ${choix === option ? "toggle-active" : ""} ${montrerErreurs && choix === option ? "is-erronee" : ""}`} onClick={() => setChoix(option)}>
            {LIBELLE_CONDITION[option]} (nθ≡{option === "reelPositif" ? "0" : option === "reelNegatif" ? "π" : option === "imaginairePurPositif" ? "π/2" : "3π/2"})
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
