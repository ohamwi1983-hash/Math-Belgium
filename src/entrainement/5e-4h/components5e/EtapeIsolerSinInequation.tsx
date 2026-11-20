import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhaseFragments, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { FragmentsConsigneSinusoide } from "./FragmentsConsigneSinusoide";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesModelisation,   messageCibleModelisation } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
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
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && texte.trim() !== "" && diagnostiquer(texte) !== "correct";

  return (
    <div>
      <p className="prompt-text"><FragmentsConsigneSinusoide fragments={consignePhaseFragments(exercice, "isolerSinInequation")} /></p>
      <AidesTrig niveauAide={niveauAide} aides={aidesModelisation(exercice, "isolerSinInequation", texteAideNiveau2(exercice, "isolerSinInequation"))} />
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
                  // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
                  saisie.tenter(choixCasSpecial, estLisible(diagnostiquer?.(choixCasSpecial)), onValider);
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
                  // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
                  saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
                }}
              >
                Valider
              </button>
            </>
          )}
        </>
      )}
      {!validation && <RetourSaisieTrig
        illisible={saisie.illisible}
        champ={question.casSpecial !== null ? "nombre" : "inequation"}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={montrerErreurs && saisie.soumise ? messageCibleModelisation(exercice, "isolerSinInequation", saisie.soumise) : null}
      />}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
