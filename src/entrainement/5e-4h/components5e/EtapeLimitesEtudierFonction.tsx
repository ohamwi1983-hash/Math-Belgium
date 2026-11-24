import { useState } from "react";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { SlotLimiteEtudierFonction, ValeurReponseSlotLimite } from "../moteur5e/verificationEtudierFonction";
import { diagnostiquerSlotLimite, listeSlotsLimites, refusSaisieEtudierFonction } from "../moteur5e/verificationEtudierFonction";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatLabelSlotLimite, formatTermesDonneesLatex, questionFinaleEtudierFonction } from "../ui5e/formatEtudierFonction";
import { aidesEtudierFonction, cibleEtudierFonction } from "../ui5e/retoursEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: "limites";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: ValeurReponseSlotLimite[]) => void;
  validation?: ValidationEtapeProps | null;
}

function slotEstDeTypeSigne(slot: SlotLimiteEtudierFonction): boolean {
  return slot.kind === "va" || slot.kind === "infiniSigne";
}

/** Écran "limites" — un slot par AV-côté + un/deux slot(s) pour les infinis (voir
 * `listeSlotsLimites`), notation COMBINÉE. Slots « signe » : choix fermé +∞ / −∞ — l'écran n'a alors
 * qu'UNE tentative et, une fois clos, chaque choix est jugé (✗ rouge sur le choix faux, ✓ vert sur la
 * bonne option, `4e/ui/choixFige.ts`). Slots texte (asymptote horizontale / oblique) : champ libre ;
 * une écriture illisible est refusée SANS tentative (moteur : `refusSaisieEtudierFonction`). Pied
 * commun du 5e (`PiedEcranFonctions`) : aides à deux niveaux, message ciblé. */
export function EtapeLimitesEtudierFonction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const slots = listeSlotsLimites(exercice);
  const [valeurs, setValeurs] = useState<ValeurReponseSlotLimite[]>(() => slots.map(() => null));
  const [soumises, setSoumises] = useState<ValeurReponseSlotLimite[] | null>(null);
  const [illisible, setIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && soumises !== null;
  const complet = valeurs.every((v) => v !== null && v !== "");
  const refus = refusSaisieEtudierFonction(exercice, "limites", valeurs);

  function modifier(index: number, v: ValeurReponseSlotLimite) {
    if (validation) return;
    setIllisible(false);
    setValeurs((arr) => arr.map((x, i) => (i === index ? v : x)));
  }

  function valider() {
    if (!complet) return;
    if (refus !== null) {
      setIllisible(true);
      return;
    }
    setSoumises(valeurs);
    onValider(valeurs);
  }

  function estErronee(index: number): boolean {
    return montrerErreurs && !validation && valeurs[index] !== null && valeurs[index] !== "" && !diagnostiquerSlotLimite(slots[index], valeurs[index]);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDIER_FONCTION}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <p className="prompt-text">{consigneEcranEtudierFonction("limites")}</p>
      {slots.map((slot, i) => {
        const labelSlot = formatLabelSlotLimite(slot);
        if (slotEstDeTypeSigne(slot)) {
          const cible = (slot as { cible: 1 | -1 }).cible;
          const etat = { selection: valeurs[i] as 1 | -1 | null, choisie: validation ? (valeurs[i] as 1 | -1 | null) : null, bonne: cible };
          return (
            <div key={i} className="field field-inline">
              <label className="field-label field-label-minuscule">
                <Katex expression={labelSlot} block={labelSlot.includes("\\lim_{")} />
              </label>
              <div className="options-grid" role="group">
                {([1, -1] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={classeOptionChoixFerme<1 | -1>(s, etat)}
                    aria-pressed={valeurs[i] === s}
                    aria-label={[s === 1 ? "plus l'infini" : "moins l'infini", ariaOptionChoixFerme<1 | -1>(s, etat)].filter(Boolean).join(", ")}
                    disabled={!!validation}
                    onClick={() => modifier(i, s)}
                  >
                    {s === 1 ? "+∞" : "−∞"}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={labelSlot} block={labelSlot.includes("\\lim_{")} />
            </label>
            <input
              type="text"
              className={`text-input${estErronee(i) || (illisible && refus !== null) ? " is-erronee" : ""}`}
              value={typeof valeurs[i] === "string" ? (valeurs[i] as string) : ""}
              onChange={(e) => modifier(i, normaliserSigneMoins(e.target.value))}
              placeholder={slot.kind === "infiniHorizontale" ? "ex : 7,5" : "ex : 5x + 12"}
              disabled={!!validation}
              autoComplete="off"
            />
          </div>
        );
      })}
      <PiedEcranFonctions
        aides={aidesEtudierFonction(exercice, "limites")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible && refus !== null}
        texteIllisible={refus ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={montrerErreurs && soumises ? cibleEtudierFonction(exercice, "limites", soumises.map((v) => (typeof v === "string" ? v : ""))) : null}
        validation={validation}
      />
    </div>
  );
}
