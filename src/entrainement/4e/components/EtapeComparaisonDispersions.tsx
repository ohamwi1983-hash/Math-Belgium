import { useState } from "react";
import type { ExerciceBoiteMoustachesComparaison } from "../core/boiteMoustaches.types";
import { verifierComparaisonDispersions } from "../moteur/verificationBoiteMoustaches";
import { niveauAideMaxPourPhase } from "../moteur/sessionBoiteMoustaches";
import { libelleBoutonAide, segmentsAideComparaisonDispersion, segmentsConsigneComparaisonDispersions } from "../ui/formatBoiteMoustaches";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoiteMoustachesGraph } from "./BoiteMoustachesGraph";
import { EnonceBoiteMoustaches } from "./EnonceBoiteMoustaches";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceBoiteMoustachesComparaison;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (choix: "A" | "B") => void;
}

/** Écran "comparaisonDispersions" (second et dernier écran de la variante comparaison) — même
 * graphe à 2 séries que "comparaisonMedianes", question INDÉPENDANTE (dispersion, pas médiane).
 * Toujours terminal. */
export function EtapeComparaisonDispersions({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<"A" | "B" | null>(null);
  const maxAide = niveauAideMaxPourPhase("comparaisonDispersions");

  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierComparaisonDispersions(exercice, choix);

  return (
    <div>
      <EnonceBoiteMoustaches exercice={exercice} />
      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneComparaisonDispersions()} />
      </p>

      <BoiteMoustachesGraph
        bornePlage={exercice.bornePlage}
        lignes={[
          { valeurs: exercice.serieA, label: "A" },
          { valeurs: exercice.serieB, label: "B" },
        ]}
      />

      <div className="options-grid-compact">
        <button
          type="button"
          className={`btn${choix === "A" ? " toggle-active" : ""}${erronee && choix === "A" ? " is-erronee" : ""}`}
          onClick={() => setChoix("A")}
        >
          Série A
        </button>
        <button
          type="button"
          className={`btn${choix === "B" ? " toggle-active" : ""}${erronee && choix === "B" ? " is-erronee" : ""}`}
          onClick={() => setChoix("B")}
        >
          Série B
        </button>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsAideComparaisonDispersion()} />
          </p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= maxAide} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, maxAide)}
      </button>

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
