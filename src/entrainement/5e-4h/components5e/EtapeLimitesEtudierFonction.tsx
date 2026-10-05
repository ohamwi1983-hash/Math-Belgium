import { useEffect, useState } from "react";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { SlotLimiteEtudierFonction, ValeurReponseSlotLimite } from "../moteur5e/verificationEtudierFonction";
import { diagnostiquerSlotLimite, listeSlotsLimites } from "../moteur5e/verificationEtudierFonction";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatLabelSlotLimite, formatTermesDonneesLatex, questionFinaleEtudierFonction, texteAideNiveau1EtudierFonction, texteAideNiveau2EtudierFonction } from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudierFonction } from "./EtatActuelEtudierFonction";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: "limites";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: ValeurReponseSlotLimite[]) => void;
}

function slotEstDeTypeSigne(slot: SlotLimiteEtudierFonction): boolean {
  return slot.kind === "va" || slot.kind === "infiniSigne";
}

/** Écran "limites" — un slot par AV-côté + un/deux slot(s) pour les infinis (voir
 * `listeSlotsLimites`), notation COMBINÉE (une seule tentative pour tout l'écran, même patron que
 * `TableauEtudeLocaleBuilder`). Slots "signe" (va/infiniSigne) : 2 boutons toggle +∞/-∞. Slots texte
 * (infiniHorizontale/infiniOblique) : champ libre, vérifié par `diagnostiquerNombre`/
 * `diagnostiquerQuotient` (5gen20/5gen21, réutilisés tels quels côté moteur). Calculatrice ABSENTE
 * (les 4 familles sont purement algébriques, comportement aux bornes déductible sans calcul décimal
 * à la main). */
export function EtapeLimitesEtudierFonction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const slots = listeSlotsLimites(exercice);
  const n = slots.length;
  const [valeurs, setValeurs] = useState<ValeurReponseSlotLimite[]>(() => Array(n).fill(null));
  useEffect(() => {
    setValeurs(Array(n).fill(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v !== null && v !== "");

  function modifierSigne(index: number, signe: 1 | -1) {
    setValeurs((arr) => arr.map((v, i) => (i === index ? signe : v)));
  }
  function modifierTexte(index: number, texte: string) {
    setValeurs((arr) => arr.map((v, i) => (i === index ? texte : v)));
  }

  function valider() {
    if (!complet) return;
    onValider(valeurs);
  }

  function estErronee(index: number): boolean {
    return montrerErreurs && valeurs[index] !== null && valeurs[index] !== "" && !diagnostiquerSlotLimite(slots[index], valeurs[index]);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDIER_FONCTION}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <EtatActuelEtudierFonction exercice={exercice} phase="limites" />
      <p className="prompt-text">{consigneEcranEtudierFonction("limites")}</p>
      {slots.map((slot, i) => {
        const labelSlot = formatLabelSlotLimite(slot);
        return (
          <div key={i} className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={labelSlot} block={labelSlot.includes("\\lim_{")} />
            </label>
            {slotEstDeTypeSigne(slot) ? (
              <div className="options-grid">
                <button type="button" className={`btn${valeurs[i] === 1 ? " toggle-active" : ""}${estErronee(i) ? " is-erronee" : ""}`} onClick={() => modifierSigne(i, 1)}>
                  +∞
                </button>
                <button type="button" className={`btn${valeurs[i] === -1 ? " toggle-active" : ""}${estErronee(i) ? " is-erronee" : ""}`} onClick={() => modifierSigne(i, -1)}>
                  -∞
                </button>
              </div>
            ) : (
              <input
                type="text"
                className={`text-input${estErronee(i) ? " is-erronee" : ""}`}
                value={typeof valeurs[i] === "string" ? (valeurs[i] as string) : ""}
                onChange={(e) => modifierTexte(i, e.target.value)}
                placeholder={slot.kind === "infiniHorizontale" ? "ex : 0" : "ex : 2*x+3"}
              />
            )}
          </div>
        );
      })}
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
          <p>{texteAideNiveau1EtudierFonction("limites")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudierFonction("limites")}</p>}
        </div>
      )}
    </div>
  );
}
