import { useState } from "react";
import type { ExerciceDistanceParalleles } from "../core/distanceDroite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_CHOIX_POINT } from "../moteur/sessionDistanceDroite";
import { diagnostiquerChoixPoint } from "../moteur/verificationDistanceDroite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { COULEUR_D, PLACEHOLDER_COORDONNEE, TEXTE_AIDE_CHOIX_POINT_NIVEAU1, consigneChoixPoint } from "../ui/formatDistanceDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleDistanceDroite } from "./ConsigneGeneraleDistanceDroite";
import { DistanceDroiteGraph } from "./DistanceDroiteGraph";
import { DonneesDistanceDroite } from "./DonneesDistanceDroite";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceDistanceParalleles;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: Point) => void;
}

/**
 * Écran 0 (variante "paralleles" uniquement) — choisir un point à coordonnées entières sur la
 * droite DÉSIGNÉE explicitement par l'énoncé (`exercice.droiteSource`). Vérification par
 * APPARTENANCE (`diagnostiquerChoixPoint`) — n'importe quel point valide accepté, même mécanisme
 * que "Construction graphique — tracer une droite depuis son équation" (écran "points"). Rien
 * n'est encore confirmé à ce stade (pas de bloc "état actuel").
 */
export function EtapeChoixPointDistanceDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const complet = [x, y].every((v) => v.trim() !== "");

  function construireReponse(): Point {
    return { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerChoixPoint(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <ConsigneGeneraleDistanceDroite exercice={exercice} />
      <DonneesDistanceDroite exercice={exercice} />
      <DistanceDroiteGraph
        lignes={[
          { droite: exercice.d1, label: "d₁", couleur: COULEUR_D },
          { droite: exercice.d2, label: "d₂", couleur: COULEUR_D },
        ]}
      />
      <p className="prompt-text">{consigneChoixPoint(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-choix-point-x">
            x =
          </label>
          <input
            id="distance-droite-choix-point-x"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="distance-droite-choix-point-y">
            y =
          </label>
          <input
            id="distance-droite-choix-point-y"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CHOIX_POINT_NIVEAU1}</p>
        </div>
      )}
      {NIVEAU_AIDE_MAX_CHOIX_POINT > 0 && (
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CHOIX_POINT} onActiverAide={onActiverAide} />
      )}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
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
