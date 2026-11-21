import { useState } from "react";
import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import {
  consignePointVectoriel,
  formatLabelXLatex,
  formatLabelYLatex,
  formatTermesDonneesConnuesLatex,
  valeursGraphePointVectoriel,
} from "../ui/formatPointVectoriel";
import { diagnostiquerX, diagnostiquerY } from "../moteur/verificationPointVectoriel";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS, aidesPointVectoriel, messagePointVectoriel } from "../ui/retoursVecteurs";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExercicePointVectoriel;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: { x: number; y: number }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Unique écran de l'exercice : bloc énoncé fixe (points/vecteurs connus, en texte et sur le
 * graphe — jamais le point cherché, voir `valeursGraphePointVectoriel`), consigne, puis les 2
 * champs numériques (x,y) soumis ensemble en un seul essai.
 *
 * Règles communes (audit 4e ch. 6, lot B) : une saisie illisible n'est jamais transmise au moteur
 * (aucune tentative), message ciblé sur l'erreur trahie par la réponse fausse, aides à deux
 * niveaux (`ui/retoursVecteurs.ts`).
 */
export function EtapePointVectoriel({ exercice, tentativesUtilisees, tentativesMax, onValider, validation }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const saisie = useTentativeLisible<{ x: number; y: number }>();

  const lx = lireNombreSaisi(texteX);
  const ly = lireNombreSaisi(texteY);
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const { points, vecteurs } = valeursGraphePointVectoriel(exercice);
  const consigne = consignePointVectoriel(exercice);

  // Champ fautif marqué seulement sur la dernière réponse réellement jugée.
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const xErronee = jugee !== null && diagnostiquerX(exercice, jugee.x) !== "correct";
  const yErronee = jugee !== null && diagnostiquerY(exercice, jugee.y) !== "correct";

  return (
    <div>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesConnuesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <VecteurGraph points={points} vecteurs={vecteurs} />
      <p className="prompt-text">
        {consigne.avant}
        {consigne.latex && <Katex expression={consigne.latex} />}
        {consigne.apres}
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="point-vectoriel-x">
            <Katex expression={formatLabelXLatex(exercice)} />
          </label>
          <input
            id="point-vectoriel-x"
            className={`text-input${xErronee ? " is-erronee" : ""}`}
            value={texteX}
            disabled={!!validation}
            onChange={(e) => setTexteX(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="point-vectoriel-y">
            <Katex expression={formatLabelYLatex(exercice)} />
          </label>
          <input
            id="point-vectoriel-y"
            className={`text-input${yErronee ? " is-erronee" : ""}`}
            value={texteY}
            disabled={!!validation}
            onChange={(e) => setTexteY(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesPointVectoriel(exercice)} />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!complet}
            onClick={() => saisie.tenter({ x: lx ?? Number.NaN, y: ly ?? Number.NaN }, lx !== null && ly !== null, onValider)}
          >
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.coordonnee}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messagePointVectoriel(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
