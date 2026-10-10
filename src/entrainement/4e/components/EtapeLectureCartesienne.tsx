import { useState } from "react";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import { NIVEAU_AIDE_MAX } from "../moteur/sessionLectureGraphiqueDroite";
import { diagnostiquerCartesienne } from "../moteur/verificationLectureGraphiqueDroite";
import { consigneGeneraleLecture, consigneLecture, texteAideNiveau1 } from "../ui/formatLectureGraphiqueDroite";
import { pointsAideExemple } from "../ui/lectureGraphiqueDroiteGraph";
import { formatMessageErreur } from "../ui/messageErreur";
import { LectureGraphiqueDroiteGraph } from "./LectureGraphiqueDroiteGraph";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceLectureGraphiqueDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Variante "cartesienne" — champ de texte LIBRE (jamais de blocage clavier numérique, les lettres
 * x/y sont requises) : n'importe quelle forme valide (implicite, explicite en x ou en y) est
 * acceptée, vérifiée par `diagnostiquerCartesienne` (normalisation implicite + proportionnalité,
 * jamais une comparaison de chaîne).
 */
export function EtapeLectureCartesienne({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCartesienne(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{consigneGeneraleLecture(exercice)}</p>
      <LectureGraphiqueDroiteGraph exercice={exercice} pointsSurlignes={niveauAide >= 2 ? pointsAideExemple(exercice) : []} />
      <p className="prompt-text">{consigneLecture(exercice)}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="lecture-droite-cartesienne">
          Équation :
        </label>
        <input
          id="lecture-droite-cartesienne"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : y=2x-1"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>Deux points de la droite sont désormais surlignés en orange sur le graphe.</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={() => onValider(texte)}>
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
