import { useState } from "react";
import type { ExerciceCaracteristiquesFonction, ReponseAsymptotesCaracteristiques } from "../core/caracteristiquesFonction.types";
import { diagnostiquerAsymptotesCaracteristiques } from "../moteur/verificationCaracteristiquesFonction";
import { formatMessageErreur } from "../ui/messageErreur";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseAsymptotesCaracteristiques) => void;
}

/**
 * Étape "équations des asymptotes" (question f, finale, refonte point 8) : labels "AH ≡"
 * (horizontale) et "AV ≡" (verticale), chacun suivi d'un champ libre où l'élève écrit l'équation
 * complète ("y=3", "x=7"). Label et champ sur la MÊME ligne (`field-inline`, déjà utilisée par
 * "Transformations graphiques"/`f(x) =`) — contrairement à "Axe de symétrie AS ≡" (Analyse d'une
 * fonction), qui reste un `.field` empilé, jamais mis à jour à l'identique ici.
 */
export function EtapeAsymptotesCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [ahTexte, setAhTexte] = useState("");
  const [avTexte, setAvTexte] = useState("");
  const complet = ahTexte.trim() !== "" && avTexte.trim() !== "";
  const statut = complet ? diagnostiquerAsymptotesCaracteristiques(exercice, { ahTexte, avTexte }) : undefined;

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} />
      <p className="prompt-text">Donne les équations des deux asymptotes (arrondi au centième accepté si besoin).</p>
      <div className="field field-inline">
        <label className="field-label" htmlFor="caract-ah">
          <Katex expression="AH \equiv" />
        </label>
        <input
          id="caract-ah"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="y = ..."
          value={ahTexte}
          onChange={(e) => setAhTexte(e.target.value)}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="caract-av">
          <Katex expression="AV \equiv" />
        </label>
        <input
          id="caract-av"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="x = ..."
          value={avTexte}
          onChange={(e) => setAvTexte(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ ahTexte, avTexte })}
      >
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
