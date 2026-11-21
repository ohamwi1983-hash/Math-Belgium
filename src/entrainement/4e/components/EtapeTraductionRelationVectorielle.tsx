import { useState } from "react";
import type { ExerciceRelationGeneraleRV } from "../core/relationVectorielle.types";
import { diagnostiquerTraduction } from "../moteur/verificationRelationVectorielle";
import { consigneRelationVectorielle, formatTermesDonneesConnuesLatex, placeholderTraduction } from "../ui/formatRelationVectorielle";
import { ILLISIBLE_VECTEURS, aidesTraductionRV, messageTraductionRV } from "../ui/retoursVecteurs";
import { AideRelationVectorielle } from "./AideRelationVectorielle";
import { MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceRelationGeneraleRV;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 de la variante `relationGenerale` (forme `pointAPoint` OU `milieu`) — traduire la relation
 * vectorielle en égalité entre différences de points (`F-B=k(E-B)`), champ libre jamais bloqué.
 * Vérification symbolique (`verificationRelationVectorielle.ts`). Une écriture que le parseur ne
 * lit pas (`parse_error`) n'est jamais transmise au moteur (audit 4e ch. 6, lot B).
 */
export function EtapeTraductionRelationVectorielle({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const complet = texte.trim() !== "";
  const consigne = consigneRelationVectorielle(exercice);
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;

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
          Traduis la relation en égalité entre différences de points
        </label>
        <input
          id="relation-vectorielle-traduction"
          className={`text-input${jugee !== null ? " is-erronee" : ""}`}
          placeholder={placeholderTraduction()}
          value={texte}
          disabled={!!validation}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
          <AideRelationVectorielle exercice={exercice} aides={aidesTraductionRV(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(texte, diagnostiquerTraduction(exercice, texte) !== "parse_error", onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.traduction}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageTraductionRV(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
