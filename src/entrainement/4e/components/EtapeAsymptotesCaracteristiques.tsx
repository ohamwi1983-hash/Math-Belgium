import { useState } from "react";
import type { ExerciceCaracteristiquesFonction, ReponseAsymptotesCaracteristiques } from "../core/caracteristiquesFonction.types";
import { diagnostiquerAsymptotesCaracteristiques } from "../moteur/verificationCaracteristiquesFonction";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseAsymptotesCaracteristiques) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "équations des asymptotes" (question f, finale, refonte point 8) : labels "AH ≡"
 * (horizontale) et "AV ≡" (verticale), chacun suivi d'un champ libre où l'élève écrit l'équation
 * complète ("y=3", "x=7"). Label et champ sur la MÊME ligne (`field-inline`, déjà utilisée par
 * "Transformations graphiques"/`f(x) =`) — contrairement à "Axe de symétrie AS ≡" (Analyse d'une
 * fonction), qui reste un `.field` empilé, jamais mis à jour à l'identique ici. Le graphe
 * (identique sur les 8 écrans de l'exercice) est centralisé dans `blocDonnees` (`EnTeteExercice`,
 * voir `AppCaracteristiquesFonction`) — plus rendu ici.
 */
export function EtapeAsymptotesCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [ahTexte, setAhTexte] = useState("");
  const [avTexte, setAvTexte] = useState("");
  const complet = ahTexte.trim() !== "" && avTexte.trim() !== "";
  const statut = complet ? diagnostiquerAsymptotesCaracteristiques(exercice, { ahTexte, avTexte }) : undefined;

  return (
    <div>
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
      {!validation && (
        <>
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
