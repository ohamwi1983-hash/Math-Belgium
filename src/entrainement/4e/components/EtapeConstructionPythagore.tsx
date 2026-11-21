import { useState } from "react";
import type { ExercicePythagore } from "../core/normeDistance.types";
import { evaluerConstructionPythagore } from "../moteur/verificationNormeDistance";
import type { ReponseConstructionPythagore } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_PYTHAGORE, PLACEHOLDER_COMPOSANTE, formatTermesDonneesPythagoreLatex } from "../ui/formatNormeDistance";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesConstructionTriangleCotes, messageConstructionTriangleCotes } from "../ui/retoursVecteurs3";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExercicePythagore;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionPythagore) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "construction" — variante 6, écran 1 : identique à l'écran 1 d'"isocèle"
 * (`promptgen26refontecomplete.md`, Partie E) — consigne générale + bloc de données redondant + 6
 * champs numériques (composantes de AB⃗, AC⃗, BC⃗), soumis en une seule tentative, aide à 2 niveaux
 * limitée à $\vec{AB}$, graphe supprimé.
 */
export function EtapeConstructionPythagore({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  // Règles communes (audit 4e ch. 6, lot B) : lecture tolérante, saisie illisible jamais transmise.
  const lus = [abX, abY, acX, acY, bcX, bcY].map(lireNombreSaisi);
  function construireReponse(): ReponseConstructionPythagore {
    const n = (i: number) => lus[i] ?? Number.NaN;
    return { abX: n(0), abY: n(1), acX: n(2), acY: n(3), bcX: n(4), bcY: n(5) };
  }
  const saisie = useTentativeLisible<ReponseConstructionPythagore>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionPythagore(exercice, jugee) : null;

  function champ(id: string, label: string, valeur: string, onChange: (v: string) => void, erronee: boolean) {
    return (
      <div className="field" key={id}>
        <label className="field-label field-label-minuscule" htmlFor={id}>
          <Katex expression={label} />
        </label>
        <input disabled={!!validation}
          id={id}
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_COMPOSANTE}
          value={valeur}
          onChange={(e) => onChange(normaliserSigneMoins(e.target.value))}
        />
      </div>
    );
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_PYTHAGORE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesPythagoreLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        Calcule les composantes des vecteurs <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />,{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> et <Katex expression={`\\vec{${exercice.labelB}${exercice.labelC}}`} />.
      </p>

      <div className="field-row">
        {champ("norme-distance-pythagore-abx", `x_{${exercice.labelA}${exercice.labelB}} =`, abX, setAbX, evaluation !== null && evaluation.abX !== "correct")}
        {champ("norme-distance-pythagore-aby", `y_{${exercice.labelA}${exercice.labelB}} =`, abY, setAbY, evaluation !== null && evaluation.abY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-pythagore-acx", `x_{${exercice.labelA}${exercice.labelC}} =`, acX, setAcX, evaluation !== null && evaluation.acX !== "correct")}
        {champ("norme-distance-pythagore-acy", `y_{${exercice.labelA}${exercice.labelC}} =`, acY, setAcY, evaluation !== null && evaluation.acY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-pythagore-bcx", `x_{${exercice.labelB}${exercice.labelC}} =`, bcX, setBcX, evaluation !== null && evaluation.bcX !== "correct")}
        {champ("norme-distance-pythagore-bcy", `y_{${exercice.labelB}${exercice.labelC}} =`, bcY, setBcY, evaluation !== null && evaluation.bcY !== "correct")}
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesConstructionTriangleCotes(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={construireReponse}
          lisible={() => lus.every((v) => v !== null)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageConstructionTriangleCotes(exercice, r)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
