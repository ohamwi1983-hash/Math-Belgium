import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import { consigneGenerale, consignePhase, formatBlocDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Champ {
  /** Étiquette au-dessus du groupe de 2 boutons — vide pour un champ unique (bilatéral). */
  label: string;
}

interface Props {
  exercice: ExerciceLimite;
  estPremierEcran: boolean;
  phase: "evaluerLimiteFinale";
  champs: Champ[];
  /** ["+","−"] pour un signe fini, ["+∞","−∞"] pour une conclusion infinie. */
  options: [string, string];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: (1 | -1)[]) => void;
  /** Correction PAR CHAMP, calculée côté PRÉSENTATION uniquement — jamais les valeurs attendues
   * elles-mêmes, juste leur statut vs la saisie (même esprit que `diagnostiquer` ailleurs sur la
   * plateforme, qui ne fuit jamais la réponse dans les props). */
  diagnostiquer?: (choix: (1 | -1)[]) => boolean[];
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran à choix de signe — 1 groupe de 2 boutons (`.options-grid-compact`), réutilisé par
 * "evaluerLimiteFinale" quand la limite est infinie (famille "limiteInfini"). */
export function EtapeChoixSigne({ exercice, estPremierEcran, phase, champs, options, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [choix, setChoix] = useState<(1 | -1 | null)[]>(champs.map(() => null));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = choix.every((c) => c !== null);
  const apresEchec = tentativesUtilisees > 0;
  const correction = apresEchec && diagnostiquer && complet ? diagnostiquer(choix as (1 | -1)[]) : null;
  const aide2 = texteAideNiveau2(exercice, phase);

  function modifier(i: number, valeur: 1 | -1) {
    setChoix((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(choix as (1 | -1)[]);
  }

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={consigneGenerale()}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            <Katex expression={formatBlocDonneesLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {champs.map((champ, i) => (
        <div key={i}>
          {champ.label && <p className="field-label field-label-minuscule">{champ.label}</p>}
          <div className="options-grid-compact">
            {(["pos", "neg"] as const).map((cle, j) => {
              const valeur = (j === 0 ? 1 : -1) as 1 | -1;
              const actif = choix[i] === valeur;
              const erronee = correction !== null && correction[i] === false && actif;
              return (
                <button key={cle} type="button" className={`btn${actif ? " toggle-active" : ""}${erronee ? " is-erronee" : ""}`} onClick={() => modifier(i, valeur)}>
                  {options[j]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
