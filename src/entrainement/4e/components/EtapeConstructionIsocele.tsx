import { useState } from "react";
import type { ExerciceTriangleCotes } from "../core/normeDistance.types";
import { evaluerConstructionIsocele } from "../moteur/verificationNormeDistance";
import type { ReponseConstructionIsocele } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_ISOCELE, PLACEHOLDER_COMPOSANTE, formatTermesDonneesIsoceleLatex } from "../ui/formatNormeDistance";
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
  exercice: ExerciceTriangleCotes;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionIsocele) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "construction" — variante 4, écran 1 : consigne générale + bloc de données redondant (sans
 * débordement mobile) + 6 champs numériques (composantes de AB⃗, AC⃗, BC⃗), soumis en une seule
 * tentative. Aide à 2 niveaux, limitée à $\vec{AB}$ (formule générale non substituée, puis
 * substituée) — `promptgen26refontecomplete.md`, Partie D : graphe supprimé (chevauchement de
 * labels non résolvable simplement, n'apporte pas d'information essentielle).
 */
export function EtapeConstructionIsocele({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  // Règles communes (audit 4e ch. 6, lot B) : lecture tolérante, saisie illisible jamais transmise.
  const lus = [abX, abY, acX, acY, bcX, bcY].map(lireNombreSaisi);
  function construireReponse(): ReponseConstructionIsocele {
    const n = (i: number) => lus[i] ?? Number.NaN;
    return { abX: n(0), abY: n(1), acX: n(2), acY: n(3), bcX: n(4), bcY: n(5) };
  }
  const saisie = useTentativeLisible<ReponseConstructionIsocele>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionIsocele(exercice, jugee) : null;

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
        consigneGenerale={CONSIGNE_GENERALE_ISOCELE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
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
        {champ("norme-distance-isocele-abx", `x_{${exercice.labelA}${exercice.labelB}} =`, abX, setAbX, evaluation !== null && evaluation.abX !== "correct")}
        {champ("norme-distance-isocele-aby", `y_{${exercice.labelA}${exercice.labelB}} =`, abY, setAbY, evaluation !== null && evaluation.abY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-isocele-acx", `x_{${exercice.labelA}${exercice.labelC}} =`, acX, setAcX, evaluation !== null && evaluation.acX !== "correct")}
        {champ("norme-distance-isocele-acy", `y_{${exercice.labelA}${exercice.labelC}} =`, acY, setAcY, evaluation !== null && evaluation.acY !== "correct")}
      </div>
      <div className="field-row">
        {champ("norme-distance-isocele-bcx", `x_{${exercice.labelB}${exercice.labelC}} =`, bcX, setBcX, evaluation !== null && evaluation.bcX !== "correct")}
        {champ("norme-distance-isocele-bcy", `y_{${exercice.labelB}${exercice.labelC}} =`, bcY, setBcY, evaluation !== null && evaluation.bcY !== "correct")}
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
