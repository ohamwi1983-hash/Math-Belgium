import { useState } from "react";
import type { ExerciceTranslationRV } from "../core/relationVectorielle.types";
import { diagnostiquerX, diagnostiquerY } from "../moteur/verificationRelationVectorielle";
import { consigneRelationVectorielle, formatLabelXLatex, formatLabelYLatex, formatTermesDonneesConnuesLatex } from "../ui/formatRelationVectorielle";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS, aidesCoordonneesRV, messageCoordonneesRV } from "../ui/retoursVecteurs";
import { AideRelationVectorielle } from "./AideRelationVectorielle";
import { DeuxChampsVecteurs } from "./DeuxChampsVecteurs";
import { MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceTranslationRV;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (x: number, y: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de la variante `translation` — seule phase, `"coordonnees"`, jamais de traduction
 * symbolique. 2 champs SÉPARÉS : le seul champ fautif est marqué après un échec. Règles communes
 * (audit 4e ch. 6, lot B) : saisie illisible sans tentative, message ciblé, aides à deux niveaux.
 */
export function EtapeTranslationVectorielle({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const saisie = useTentativeLisible<{ x: number; y: number }>();
  const lx = lireNombreSaisi(texteX);
  const ly = lireNombreSaisi(texteY);
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
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

      <DeuxChampsVecteurs
        id="relation-vectorielle-translation"
        labelX={formatLabelXLatex(exercice)}
        labelY={formatLabelYLatex(exercice)}
        texteX={texteX}
        texteY={texteY}
        onX={setTexteX}
        onY={setTexteY}
        erreurX={jugee !== null && diagnostiquerX(exercice, jugee.x) !== "correct"}
        erreurY={jugee !== null && diagnostiquerY(exercice, jugee.y) !== "correct"}
        desactive={!!validation}
      />

      {!validation && (
        <>
          <AideRelationVectorielle exercice={exercice} aides={aidesCoordonneesRV(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter({ x: lx ?? Number.NaN, y: ly ?? Number.NaN }, lx !== null && ly !== null, (r) => onValider(r.x, r.y))}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.coordonnee}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageCoordonneesRV(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
