import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. Câblé sur les 2 branches
   * (cas spécial catégoriel ET cas général en texte libre) — `diagnostiquerIsolerSinInequation`
   * gère les deux formes de réponse indifféremment. */
  diagnostiquer?: (texte: string) => StatutVerification;
  validation?: ValidationEtapeProps | null;
}

/** Écran "isolerSinInequation" (Phase 2, type "inequation") — DEUX présentations disjointes selon
 * `question.casSpecial` : cas spécial (|m|>1, boutons "Toujours vraie"/"Toujours fausse") ou cas
 * général (champ texte libre "sin(...)◇m"). */
export function EtapeIsolerSinInequation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation }: Props) {
  if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("EtapeIsolerSinInequation : phase2 hors type 'inequation'");
  const question = exercice.phase2;
  const [texte, setTexte] = useState("");
  const [choixCasSpecial, setChoixCasSpecial] = useState<"toujoursVrai" | "toujoursFaux" | null>(null);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  /** Saisie illisible (parse_error) : signalée sans consommer de tentative (audit 5e ch. 2, point 48). */
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && texte.trim() !== "" && diagnostiquer(texte) !== "correct";

  return (
    <div>
      <p className="prompt-text">{consignePhase(exercice, "isolerSinInequation")}</p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "isolerSinInequation")}</p>
          {niveauAide >= 2 && question.casSpecial === null && <Katex expression={texteAideNiveau2(exercice, "isolerSinInequation")} block />}
        </div>
      )}
      {question.casSpecial !== null ? (
        <>
          <div className="options-grid">
            <button
              type="button"
              className={choixCasSpecial === "toujoursVrai" ? "btn toggle-active" : "btn"}
              onClick={() => setChoixCasSpecial("toujoursVrai")}
            >
              Toujours vraie
            </button>
            <button
              type="button"
              className={choixCasSpecial === "toujoursFaux" ? "btn toggle-active" : "btn"}
              onClick={() => setChoixCasSpecial("toujoursFaux")}
            >
              Toujours fausse
            </button>
          </div>
          {!validation && (
            <>
              <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
              <button
                type="button"
                className="btn btn-primary"
                disabled={choixCasSpecial === null}
                onClick={() => {
                  if (choixCasSpecial === null) return;
                  const statut = diagnostiquer ? diagnostiquer(choixCasSpecial) : null;
                  if (statut === "parse_error") {
                    setEcritureIllisible(true);
                    return;
                  }
                  setEcritureIllisible(false);
                  if (statut !== null) setDernierStatut(statut);
                  onValider(choixCasSpecial);
                }}
              >
                Valider
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="field">
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="ex : sin(u) ≥ 0,42"
            />
          </div>
          {!validation && (
            <>
              <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
              <button
                type="button"
                className="btn btn-primary"
                disabled={texte.trim() === ""}
                onClick={() => {
                  if (texte.trim() === "") return;
                  const statut = diagnostiquer ? diagnostiquer(texte) : null;
                  if (statut === "parse_error") {
                    setEcritureIllisible(true);
                    return;
                  }
                  setEcritureIllisible(false);
                  if (statut !== null) setDernierStatut(statut);
                  onValider(texte);
                }}
              >
                Valider
              </button>
            </>
          )}
        </>
      )}
      {!validation && ecritureIllisible && (
        <p className="alert-error" role="alert">
          Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
        </p>
      )}
      {!validation && montrerErreurs && !ecritureIllisible && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
