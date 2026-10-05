import { useState } from "react";
import type { ExerciceContexteEconomiqueB } from "../core5e/contexteEconomique.types";
import type { ReponseTableauSigneBenefice } from "../moteur5e/verificationContexteEconomique";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";

interface Props {
  exercice: ExerciceContexteEconomiqueB;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauSigneBenefice) => void;
}

/** Écran "tableauSigneBenefice" — tableau de signes SIMPLE (une seule racine à traiter, x_opt déjà
 * confirmé à l'écran précédent) : 2 zones seulement, jamais le tableau étendu de 5gen29 (racines
 * multiples/CE) — voir la tâche, "composant simple à concevoir". */
export function EtapeTableauSigneBenefice({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [zoneAvant, setZoneAvant] = useState<1 | -1 | null>(null);
  const [zoneApres, setZoneApres] = useState<1 | -1 | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = zoneAvant !== null && zoneApres !== null;

  function valider() {
    if (!complet) return;
    onValider({ zoneAvant: zoneAvant as 1 | -1, zoneApres: zoneApres as 1 | -1 });
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran="tableauSigneBenefice" />
      <p className="prompt-text">{consigneEcran(exercice, "tableauSigneBenefice")}</p>

      <p className="field-label field-label-minuscule">
        <Katex expression={`\\text{Signe de } B'(x) \\text{ pour } 0<x<${exercice.xOpt}`} />
      </p>
      <div className="options-grid-compact">
        {([1, -1] as const).map((v) => (
          <button key={v} type="button" className={`btn${zoneAvant === v ? " toggle-active" : ""}`} onClick={() => setZoneAvant(v)}>
            {v === 1 ? "+" : "−"}
          </button>
        ))}
      </div>

      <p className="field-label field-label-minuscule">
        <Katex expression={`\\text{Signe de } B'(x) \\text{ pour } x>${exercice.xOpt}`} />
      </p>
      <div className="options-grid-compact">
        {([1, -1] as const).map((v) => (
          <button key={v} type="button" className={`btn${zoneApres === v ? " toggle-active" : ""}`} onClick={() => setZoneApres(v)}>
            {v === 1 ? "+" : "−"}
          </button>
        ))}
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("tableauSigneBenefice")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, "tableauSigneBenefice")}</p>}
        </div>
      )}
    </div>
  );
}
