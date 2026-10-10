import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";
import type { ReponseConclusionPointVide } from "../moteur5e/sessionEtudeComplete";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConclusionPointVide) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran spécial C "Conclusion" (point vide) — 2 affirmations Oui/Non indépendantes (`.options-grid-
 * compact` + `.btn.toggle-active`, même patron que `EtapeConfirmationCoherence.tsx`) : le point est-il
 * une AV ? appartient-il au domaine de f ? Réponse TOUJOURS "Non" aux deux pour un vrai point vide —
 * l'écran existe pour casser la croyance qu'une limite finie signifierait un point du domaine. */
export function EtapeConclusionPointVideEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [estAV, setEstAV] = useState<boolean | null>(null);
  const [appartientDomaine, setAppartientDomaine] = useState<boolean | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = estAV !== null && appartientDomaine !== null;
  const point = exercice.exclusions.find((e) => e.type === "pointVide");

  function valider() {
    if (estAV === null || appartientDomaine === null) return;
    onValider({ estAV, appartientDomaine });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      <BlocDonneesEtudeComplete exercice={exercice} />
      <EtatActuelEtudeComplete exercice={exercice} phase="pointVideConclusion" />
      <p className="prompt-text">{consignePhase(exercice, "pointVideConclusion")}</p>

      <p className="prompt-text">{`Y a-t-il une asymptote verticale en x=${point?.position} ?`}</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn${estAV === true ? " toggle-active" : ""}${montrerErreurs && estAV === true ? " is-erronee" : ""}`} onClick={() => setEstAV(true)}>
          Oui
        </button>
        <button type="button" className={estAV === false ? "btn toggle-active" : "btn"} onClick={() => setEstAV(false)}>
          Non
        </button>
      </div>

      <p className="prompt-text">{`x=${point?.position} appartient-il au domaine de définition de f ?`}</p>
      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${appartientDomaine === true ? " toggle-active" : ""}${montrerErreurs && appartientDomaine === true ? " is-erronee" : ""}`}
          onClick={() => setAppartientDomaine(true)}
        >
          Oui
        </button>
        <button type="button" className={appartientDomaine === false ? "btn toggle-active" : "btn"} onClick={() => setAppartientDomaine(false)}>
          Non
        </button>
      </div>

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
          <p>{texteAideNiveau1(exercice, "pointVideConclusion")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "pointVideConclusion")} block />}
        </div>
      )}
    </div>
  );
}
