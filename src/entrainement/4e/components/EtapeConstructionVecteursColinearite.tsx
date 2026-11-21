import { useState } from "react";
import type { ExerciceColinearPoints } from "../core/colinearite.types";
import { evaluerConstructionVecteurs } from "../moteur/verificationColinearite";
import type { ReponseConstructionVecteurs } from "../moteur/verificationColinearite";
import { PLACEHOLDER_COMPOSANTE, consigneGlobaleColinearite, formatTermesEnoncePointsLatex } from "../ui/formatColinearite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesConstructionColinearite, messageConstructionColinearite } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceColinearPoints;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionVecteurs) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "constructionVecteurs" — V3-écran1 (variante "points") : 4 champs numériques (composantes
 * de AB puis AC), soumis en une seule tentative — chevauchement volontaire avec la compétence du
 * générateur "Point à partir d'une relation vectorielle" (étape intermédiaire ici, pas la
 * compétence finale visée par cet écran).
 *
 * `promptcorrectionsgenerateur24complet.md`, points 11-13 : consigne globale (persistante avec le
 * bloc des points sur l'écran "test" qui suit) + aide simplifiée.
 * `promptcorrectionsgenerateur24lot2.md` : point 1, le graphique montrant A/B/C placés est retiré
 * de l'aide — il révélait visuellement l'alignement, donc la réponse finale, avant même le calcul ;
 * point 2, l'aide ne montre plus que la formule de AB⃗ (jamais AC⃗, l'élève doit déduire seul la
 * même logique) ; point 5, marquage rouge en direct de chaque champ fautif après un échec.
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsLatex`, un fragment KaTeX par point) — jamais un unique `\quad`-joined,
 * qui ne retourne jamais à la ligne sur mobile étroit.
 */
export function EtapeConstructionVecteursColinearite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");

  const complet = [abX, abY, acX, acY].every((v) => v.trim() !== "");

  // Règles communes (audit 4e ch. 6, lot B) : lecture tolérante (virgule, fraction), saisie
  // illisible jamais transmise ; seuls les champs de la dernière réponse jugée sont marqués.
  const lus = [abX, abY, acX, acY].map(lireNombreSaisi);
  function construireReponse(): ReponseConstructionVecteurs {
    return { abX: lus[0] ?? Number.NaN, abY: lus[1] ?? Number.NaN, acX: lus[2] ?? Number.NaN, acY: lus[3] ?? Number.NaN };
  }
  const saisie = useTentativeLisible<ReponseConstructionVecteurs>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionVecteurs(exercice, jugee) : null;
  const abXErronee = evaluation !== null && evaluation.abX !== "correct";
  const abYErronee = evaluation !== null && evaluation.abY !== "correct";
  const acXErronee = evaluation !== null && evaluation.acX !== "correct";
  const acYErronee = evaluation !== null && evaluation.acY !== "correct";

  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesEnoncePointsLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">
        Calcule les composantes de <Katex expression={`\\vec{${exercice.labelA}${exercice.labelB}}`} /> et de{" "}
        <Katex expression={`\\vec{${exercice.labelA}${exercice.labelC}}`} />.
      </p>

      <div className="field-row-groupe">
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-abx">
              <Katex expression={`x_{${exercice.labelA}${exercice.labelB}} =`} />
            </label>
            <input disabled={!!validation}
              id="colinearite-construction-abx"
              className={`text-input${abXErronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_COMPOSANTE}
              value={abX}
              onChange={(e) => setAbX(normaliserSigneMoins(e.target.value))}
            />
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-aby">
              <Katex expression={`y_{${exercice.labelA}${exercice.labelB}} =`} />
            </label>
            <input disabled={!!validation}
              id="colinearite-construction-aby"
              className={`text-input${abYErronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_COMPOSANTE}
              value={abY}
              onChange={(e) => setAbY(normaliserSigneMoins(e.target.value))}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-acx">
              <Katex expression={`x_{${exercice.labelA}${exercice.labelC}} =`} />
            </label>
            <input disabled={!!validation}
              id="colinearite-construction-acx"
              className={`text-input${acXErronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_COMPOSANTE}
              value={acX}
              onChange={(e) => setAcX(normaliserSigneMoins(e.target.value))}
            />
          </div>
          <div className="field field-inline">
            <label className="field-label field-label-minuscule" htmlFor="colinearite-construction-acy">
              <Katex expression={`y_{${exercice.labelA}${exercice.labelC}} =`} />
            </label>
            <input disabled={!!validation}
              id="colinearite-construction-acy"
              className={`text-input${acYErronee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_COMPOSANTE}
              value={acY}
              onChange={(e) => setAcY(normaliserSigneMoins(e.target.value))}
            />
          </div>
        </div>
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesConstructionColinearite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={construireReponse}
          lisible={() => lus.every((v) => v !== null)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.composante}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageConstructionColinearite(exercice, r)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
