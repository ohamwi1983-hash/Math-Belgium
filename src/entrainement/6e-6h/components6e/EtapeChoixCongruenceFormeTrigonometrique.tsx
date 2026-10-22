import { useState } from "react";
import { Katex } from "../components/Katex";
import type { ConditionD } from "../core6e/formeTrigonometrique.types";
import { OPTIONS_CONDITION_D } from "../moteur6e/verificationFormeTrigonometrique";
import type { AideAvecLatex, FragmentConsigne } from "../ui6e/formatFormeTrigonometrique";
import { LIBELLE_CONDITION } from "../ui6e/formatFormeTrigonometrique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { RenduFragments } from "../components/RenduFragments";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (condition: ConditionD) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE "choix parmi 4 conditions" — famille D, écran 2 UNIQUEMENT (poser l'équation de
 * congruence correspondant à la condition demandée). Choix véritable présenté à l'élève ⟹ boutons
 * `.btn.toggle-active`, JAMAIS `.btn-primary` (réservé à "Valider", convention CLAUDE.md) — mirroir
 * `EtapeChoixOuiNonExpoProblemes.tsx`, généralisé à 4 options. `OPTIONS_CONDITION_D` (`moteur6e/
 * verificationFormeTrigonometrique.ts`) fixe l'ordre des boutons — synchronisé avec
 * `diagnostiquerDEcran2`, qui compare directement l'identifiant choisi à `exercice.condition`.
 */
export function EtapeChoixCongruenceFormeTrigonometrique({ consigneGenerale, blocDonnees, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [choix, setChoix] = useState<ConditionD | null>(null);
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
        {OPTIONS_CONDITION_D.map((option) => (
          <button key={option} type="button" className={`btn ${choix === option ? "toggle-active" : ""} ${montrerErreurs && choix === option ? "is-erronee" : ""}`} onClick={() => setChoix(option)}>
            {LIBELLE_CONDITION[option]} (nθ≡{option === "reelPositif" ? "0" : option === "reelNegatif" ? "π" : option === "imaginairePurPositif" ? "π/2" : "3π/2"})
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
