import { useState } from "react";
import type { ExerciceOrthogonaliteTriangle } from "../core/orthogonalite.types";
import { evaluerConstructionTriangle } from "../moteur/verificationOrthogonalite";
import type { ReponseConstructionTriangle } from "../moteur/verificationOrthogonalite";
import { PLACEHOLDER_COMPOSANTE, consigneGlobaleOrthogonalite, formatTermesEnonceTriangleLatex } from "../ui/formatOrthogonalite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesConstructionTriangle, messageConstructionTriangle } from "../ui/retoursVecteurs3";
import { Katex } from "./Katex";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceOrthogonaliteTriangle;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionTriangle) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "construction" — variante 3, écran 1 : 6 champs numériques (composantes de AB, AC, BC),
 * soumis en une seule tentative — construits une seule fois, chaque test de sommet suivant les
 * réutilise avec changement de signe (voir `verificationOrthogonalite.ts`).
 *
 * `promptcorrectionsgenerateur25complet.md`, points 10-12 : consigne globale (persistante avec le
 * bloc des points sur les écrans "test du sommet" qui suivent) + aide simplifiée.
 * `promptgen25modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnonceTriangleLatex`, un fragment KaTeX par point) pour ne jamais couper/déborder
 * un point sur mobile.
 * `promptcorrectionsgenerateur25lot2.md` : point 1, le graphique montrant A/B/C placés est retiré
 * de l'aide — il révélait visuellement des informations sur la configuration du triangle ; point 2,
 * l'aide ne montre plus que la formule de AB⃗ (jamais AC⃗/BC⃗) ; point 5, marquage rouge en direct de
 * chaque champ fautif après un échec.
 */
export function EtapeConstructionTriangleOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");
  const [bcX, setBcX] = useState("");
  const [bcY, setBcY] = useState("");

  const complet = [abX, abY, acX, acY, bcX, bcY].every((v) => v.trim() !== "");

  // Règles communes (audit 4e ch. 6, lot B) : lecture tolérante, saisie illisible jamais transmise.
  const lus = [abX, abY, acX, acY, bcX, bcY].map(lireNombreSaisi);
  function construireReponse(): ReponseConstructionTriangle {
    const n = (i: number) => lus[i] ?? Number.NaN;
    return { abX: n(0), abY: n(1), acX: n(2), acY: n(3), bcX: n(4), bcY: n(5) };
  }
  const saisie = useTentativeLisible<ReponseConstructionTriangle>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionTriangle(exercice, jugee) : null;

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

  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesEnonceTriangleLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} />,{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} /> et <Katex expression={`\\vec{${exercice.labelB}${exercice.labelC}}`} />.
      </p>

      <div className="field-row-groupe">
        <div className="field-row">
          {champ("orthogonalite-construction-abx", `x_{${exercice.labelA}${exercice.labelB}} =`, abX, setAbX, evaluation !== null && evaluation.abX !== "correct")}
          {champ("orthogonalite-construction-aby", `y_{${exercice.labelA}${exercice.labelB}} =`, abY, setAbY, evaluation !== null && evaluation.abY !== "correct")}
        </div>
        <div className="field-row">
          {champ("orthogonalite-construction-acx", `x_{${exercice.labelA}${exercice.labelC}} =`, acX, setAcX, evaluation !== null && evaluation.acX !== "correct")}
          {champ("orthogonalite-construction-acy", `y_{${exercice.labelA}${exercice.labelC}} =`, acY, setAcY, evaluation !== null && evaluation.acY !== "correct")}
        </div>
        <div className="field-row">
          {champ("orthogonalite-construction-bcx", `x_{${exercice.labelB}${exercice.labelC}} =`, bcX, setBcX, evaluation !== null && evaluation.bcX !== "correct")}
          {champ("orthogonalite-construction-bcy", `y_{${exercice.labelB}${exercice.labelC}} =`, bcY, setBcY, evaluation !== null && evaluation.bcY !== "correct")}
        </div>
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesConstructionTriangle(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={construireReponse}
          lisible={() => lus.every((v) => v !== null)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageConstructionTriangle(exercice, r)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
