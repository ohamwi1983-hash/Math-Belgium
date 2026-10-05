import { useState } from "react";
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ReponseConclureLimite } from "../moteur5e/sessionLimites";
import { consigneGenerale, consignePhase, formatBlocDonneesLatex } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";
import { EtatActuelLimite } from "./EtatActuelLimite";

const OPTIONS_CONCLURE: { id: string; label: string }[] = [
  { id: "-1", label: "−∞" },
  { id: "1", label: "+∞" },
  { id: "nexistepas", label: "∄" },
];

function idVersChoix(id: string): ReponseConclureLimite {
  return id === "nexistepas" ? "nexistepas" : (Number(id) as 1 | -1);
}

interface Props {
  exercice: ExerciceLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (choix: ReponseConclureLimite) => void;
}

/** Écran "conclureLimite" (Branche B, famille "limiteInfiniePoint" uniquement) — VRAI combobox natif
 * à 3 options (−∞/+∞/∄, jamais des boutons), à partir des 2 limites unilatérales déjà trouvées à
 * l'écran précédent. AUCUNE aide sur cet écran (spécifié explicitement — jamais de `BoutonAide` ici,
 * contrairement à tous les autres écrans de la plateforme qui en ont systématiquement un). */
export function EtapeConclureLimiteInfiniePoint({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choixId, setChoixId] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = choixId !== "";

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      <EtatActuelLimite exercice={exercice} phase="conclureLimite" />
      <p className="prompt-text">{consignePhase(exercice, "conclureLimite")}</p>
      <select className="ce-select" aria-label="Conclusion de la limite" value={choixId} onChange={(e) => setChoixId(e.target.value)}>
        <option value="" disabled>
          Choisis…
        </option>
        {OPTIONS_CONCLURE.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(idVersChoix(choixId))}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
