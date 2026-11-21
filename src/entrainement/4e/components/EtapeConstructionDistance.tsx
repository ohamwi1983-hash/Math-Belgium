import { useState } from "react";
import type { ExerciceDistance } from "../core/normeDistance.types";
import { evaluerConstructionDistance } from "../moteur/verificationNormeDistance";
import type { ReponseConstructionDistance } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_DISTANCE, formatTermesDonneesDistanceLatex } from "../ui/formatNormeDistance";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesConstructionDistance, messageConstructionDistance } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { DeuxChampsVecteurs } from "./DeuxChampsVecteurs";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceDistance;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionDistance) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante « distance », écran 1 : les composantes de AB. Règles communes (audit 4e ch. 6, lot B) :
 * illisible sans tentative, message ciblé (A − B), aides à deux niveaux. */
export function EtapeConstructionDistance({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const saisie = useTentativeLisible<ReponseConstructionDistance>();
  const lx = lireNombreSaisi(texteX);
  const ly = lireNombreSaisi(texteY);
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionDistance(exercice, jugee) : null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_DISTANCE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesDistanceLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />.
      </p>
      <DeuxChampsVecteurs
        id="norme-distance-construction"
        labelX={`x_{${exercice.labelA}${exercice.labelB}} =`}
        labelY={`y_{${exercice.labelA}${exercice.labelB}} =`}
        texteX={texteX}
        texteY={texteY}
        onX={setTexteX}
        onY={setTexteY}
        erreurX={evaluation !== null && evaluation.x !== "correct"}
        erreurY={evaluation !== null && evaluation.y !== "correct"}
        desactive={!!validation}
      />
      {!validation && (
        <PiedVecteurs
          aides={aidesConstructionDistance(exercice)}
          onPremiereAide={onActiverAide}
          complet={texteX.trim() !== "" && texteY.trim() !== ""}
          saisie={saisie}
          reponse={() => ({ x: lx ?? Number.NaN, y: ly ?? Number.NaN })}
          lisible={() => lx !== null && ly !== null}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageConstructionDistance(exercice, r)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
