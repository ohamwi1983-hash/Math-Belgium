import { useState } from "react";
import type { ExerciceBoiteMoustachesComparaison } from "../core/boiteMoustaches.types";
import { verifierComparaisonMedianes } from "../moteur/verificationBoiteMoustaches";
import { niveauAideMaxPourPhase } from "../moteur/sessionBoiteMoustaches";
import { libelleBoutonAide, segmentsAideComparaisonMediane, segmentsConsigneComparaisonMedianes } from "../ui/formatBoiteMoustaches";
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

/** Écran "comparaisonMedianes" (premier des 2 écrans de la variante comparaison) — les 2 boîtes à
 * moustaches (séries A/B, statiques) partagent le même axe gradué pour une comparaison visuelle
 * directe ; champ catégoriel "A"/"B". Jamais terminal — transitionne vers
 * "comparaisonDispersions". */
export function EtapeComparaisonMedianes({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<"A" | "B" | null>(null);
  const maxAide = niveauAideMaxPourPhase("comparaisonMedianes");

  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifierComparaisonMedianes(exercice, choix);

  return (
    <div>
      <EnonceBoiteMoustaches exercice={exercice} />
      <p className="prompt-text">
        <SegmentsInline segments={segmentsConsigneComparaisonMedianes()} />
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
            <SegmentsInline segments={segmentsAideComparaisonMediane()} />
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
