import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
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
}

/** Écran "isolerSinInequation" (Phase 2, type "inequation") — DEUX présentations disjointes selon
 * `question.casSpecial` : cas spécial (|m|>1, boutons "Toujours vraie"/"Toujours fausse") ou cas
 * général (champ texte libre "sin(...)◇m"). */
export function EtapeIsolerSinInequation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("EtapeIsolerSinInequation : phase2 hors type 'inequation'");
  const question = exercice.phase2;
  const [texte, setTexte] = useState("");
  const [choixCasSpecial, setChoixCasSpecial] = useState<"toujoursVrai" | "toujoursFaux" | null>(null);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && texte.trim() !== "" && diagnostiquer(texte) !== "correct";

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase="isolerSinInequation" />
      <p className="prompt-text">{consignePhase(exercice, "isolerSinInequation")}</p>
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
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={choixCasSpecial === null}
            onClick={() => {
              if (choixCasSpecial === null) return;
              if (diagnostiquer) setDernierStatut(diagnostiquer(choixCasSpecial));
              onValider(choixCasSpecial);
            }}
          >
            Valider
          </button>
        </>
      ) : (
        <>
          <div className="field">
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="ex : sin(u)>=0.42"
            />
          </div>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={texte.trim() === ""}
            onClick={() => {
              if (texte.trim() === "") return;
              if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
              onValider(texte);
            }}
          >
            Valider
          </button>
        </>
      )}
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "isolerSinInequation")}</p>
          {niveauAide >= 2 && question.casSpecial === null && <Katex expression={texteAideNiveau2(exercice, "isolerSinInequation")} block />}
        </div>
      )}
    </div>
  );
}
