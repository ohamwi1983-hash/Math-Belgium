import { useState } from "react";
import type { ExerciceRelationGeneraleRV } from "../core/relationVectorielle.types";
import { diagnostiquerTraduction } from "../moteur/verificationRelationVectorielle";
import { consigneRelationVectorielle, formatTermesDonneesConnuesLatex, placeholderTraduction } from "../ui/formatRelationVectorielle";
import { formatMessageErreur } from "../ui/messageErreur";
import { AideRelationVectorielle } from "./AideRelationVectorielle";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceRelationGeneraleRV;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran 1 de la variante `relationGenerale` (forme `pointAPoint` OU `milieu`, même écran pour les
 * deux — voir `core/relationVectorielle.types.ts`) — traduire la relation vectorielle donnée en
 * équation de coordonnées (`F-B=k(E-B)`), champ libre, jamais de bloquage numérique (lettres,
 * signes et parenthèses tous légitimes ici, contrairement aux champs strictement numériques du
 * reste de l'exercice). Vérification symbolique, statut à 3 valeurs — voir
 * `verificationRelationVectorielle.ts` pour le détail du parseur.
 */
export function EtapeTraductionRelationVectorielle({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerTraduction(exercice, texte) : undefined;
  const consigne = consigneRelationVectorielle(exercice);

  return (
    <div>
      <p className="prompt-text">
        {consigne.avant}
        {consigne.latex && <Katex expression={consigne.latex} />}
        {consigne.apres}
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesConnuesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="relation-vectorielle-traduction">
          Traduis la relation en équation de coordonnées
        </label>
        <input
          id="relation-vectorielle-traduction"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={placeholderTraduction(exercice)}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      <AideRelationVectorielle exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

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
