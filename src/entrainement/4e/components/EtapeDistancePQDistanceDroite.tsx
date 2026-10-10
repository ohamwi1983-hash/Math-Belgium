import { useState } from "react";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_DISTANCE_PQ } from "../moteur/sessionDistanceDroite";
import { diagnostiquerDistance } from "../moteur/verificationDistanceDroite";
import { COULEUR_B, COULEUR_D, COULEUR_P, COULEUR_Q, CONSIGNE_DISTANCE_PQ, FORMULE_GENERALE_DISTANCE_PQ_LATEX, LABEL_DISTANCE_PQ, PLACEHOLDER_DISTANCE_PQ, calculerEtatActuelDistanceDroite, formatAideDistancePQNiveau2Latex } from "../ui/formatDistanceDroite";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceDistanceDroite;
  point: Point;
  droiteCible: DroiteImplicite;
  bAttendue: DroiteImplicite;
  qAttendu: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: string) => void;
}

/**
 * Écran 3 (dernier) — distance PQ, une fois Q confirmé à l'écran précédent. Champ texte libre
 * (entier/fraction/`sqrt(...)`/décimal, `promptgen47modifications.md`, point 15) — jamais le
 * filtrage numérique-strict, qui bloquerait `/`. Notation P/Q cohérente (point 16), jamais la
 * formule générique A/B héritée de "Norme d'un vecteur et distance entre 2 points". Tous les
 * éléments (droite(s), P, b, Q) sont désormais CONFIRMÉS : toujours affichés sur le graphe, sans
 * conditionner à un niveau d'aide.
 */
export function EtapeDistancePQDistanceDroite({ exercice, point, droiteCible, bAttendue, qAttendu, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerDistance(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const lignes: LigneAffichee[] =
    exercice.variante === "paralleles"
      ? [
          { droite: exercice.d1, label: "d₁", couleur: COULEUR_D },
          { droite: exercice.d2, label: "d₂", couleur: COULEUR_D },
        ]
      : [{ droite: droiteCible, label: "d", couleur: COULEUR_D }];
  lignes.push({ droite: bAttendue, label: "b", couleur: COULEUR_B });

  const etatActuel = calculerEtatActuelDistanceDroite({ variante: exercice.variante, point, droiteCible, bAttendue, qAttendu });

  return (
    <div>
      <ConsigneGeneraleDistanceDroite exercice={exercice} />
      <DonneesDistanceDroite exercice={exercice} />
      <DistanceDroiteGraph
        lignes={lignes}
        points={[
          { point, label: "P", couleur: COULEUR_P },
          { point: qAttendu, label: "Q", couleur: COULEUR_Q },
        ]}
      />
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{CONSIGNE_DISTANCE_PQ}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="distance-droite-distance-pq">
          {LABEL_DISTANCE_PQ}
        </label>
        <input
          id="distance-droite-distance-pq"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_DISTANCE_PQ}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            Rappel : <Katex expression={FORMULE_GENERALE_DISTANCE_PQ_LATEX} />
          </p>
          {niveauAide >= 2 && (
            <p>
              Formule substituée : <Katex expression={formatAideDistancePQNiveau2Latex(point, qAttendu)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_DISTANCE_PQ} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
