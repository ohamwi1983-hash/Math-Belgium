import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import { LIBELLE_FAMILLE_LIMITE, OPTIONS_RECONNAISSANCE_INDETERMINEE, consigneGenerale, consignePhase, formatBlocDonneesEgalLatex, formatBlocDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choix: string, valeurTexte?: string) => void;
}

const ID_INDETERMINEE = "indeterminee";

/** Écran 0 "reconnaissance" — IDENTIQUE pour les 4 familles. 3 boutons principaux (Nombre réel ℝ /
 * L'infini ∞ / Forme indéterminée), empilés verticalement (`.options-liste-verticale`, exception
 * documentée à la convention "toujours 2 colonnes" — le champ de "Nombre réel ℝ" doit s'intercaler
 * ENTRE ce bouton et les 2 suivants, impossible dans une grille) ; "Forme indéterminée" révèle 2
 * sous-boutons (∞/∞, 0/0) — le SOUS-bouton porte le vrai `choix` soumis (jamais "indeterminee", pur
 * état local). "Nombre réel ℝ" fait apparaître un champ de réponse DIRECTEMENT sous LUI (avant "L'infini
 * ∞"), sur ce même écran — classification et valeur numérique en un seul geste, aucun écran
 * supplémentaire pour cette famille. */
export function EtapeReconnaissanceLimite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [sousChoix, setSousChoix] = useState<string | null>(null);
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, "reconnaissance");

  const choixFinal = principal === ID_INDETERMINEE ? sousChoix : principal;
  const complet = principal === "limiteReelle" ? choixFinal !== null && valeur.trim() !== "" : choixFinal !== null;

  function selectionnerPrincipal(id: string) {
    setPrincipal(id);
    setSousChoix(null);
    setValeur("");
  }

  function valider() {
    if (choixFinal === null) return;
    if (principal === "limiteReelle") {
      if (valeur.trim() === "") return;
      onValider(choixFinal, valeur);
      return;
    }
    onValider(choixFinal);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <p className="prompt-text">{consignePhase(exercice, "reconnaissance")}</p>
      <div className="options-liste-verticale">
        <button
          type="button"
          className={principal === "limiteReelle" ? "btn toggle-active" : "btn"}
          onClick={() => selectionnerPrincipal("limiteReelle")}
        >
          {LIBELLE_FAMILLE_LIMITE.limiteReelle}
        </button>

        {principal === "limiteReelle" && (
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={formatBlocDonneesEgalLatex(exercice)} block />
            </label>
            <input type="text" className="text-input" value={valeur} onChange={(e) => setValeur(e.target.value)} placeholder="ex : -1/3" />
          </div>
        )}

        <button
          type="button"
          className={principal === "limiteInfiniePoint" ? "btn toggle-active" : "btn"}
          onClick={() => selectionnerPrincipal("limiteInfiniePoint")}
        >
          {LIBELLE_FAMILLE_LIMITE.limiteInfiniePoint}
        </button>

        <button type="button" className={principal === ID_INDETERMINEE ? "btn toggle-active" : "btn"} onClick={() => selectionnerPrincipal(ID_INDETERMINEE)}>
          Forme indéterminée
        </button>

        {principal === ID_INDETERMINEE && (
          <div className="options-grid-compact">
            {OPTIONS_RECONNAISSANCE_INDETERMINEE.map((o) => (
              <button key={o.id} type="button" className={sousChoix === o.id ? "btn toggle-active" : "btn"} onClick={() => setSousChoix(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        )}
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
          <p>{texteAideNiveau1(exercice, "reconnaissance")}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
