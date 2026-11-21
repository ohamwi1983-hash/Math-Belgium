import { useState } from "react";
import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { evaluerConstructionAvecX } from "../moteur/verificationColinearite";
import type { ReponseConstructionAvecX } from "../moteur/verificationColinearite";
import { PLACEHOLDER_COMPOSANTE_SYMBOLIQUE, consigneGlobaleColinearite, formatTermesEnoncePointsParametreLatex } from "../ui/formatColinearite";
import { Katex } from "./Katex";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesConstructionColinearite, constructionAvecXLisible, messageConstructionAvecX } from "../ui/retoursVecteurs2";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionAvecX) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Un seul champ de saisie LIBRE par composante — accepte une expression algébrique de x (ex.
 * `"2x-1"`) ou un nombre pur (ex. `"5"`), vérifiée symboliquement (`diagnostiquerComposanteLineaire`)
 * — `promptcorrectionsgenerateur24complet.md`, point 1 : remplace les 2 champs séparés
 * (coefficient/constante) par une seule expression, jamais de bloquage numérique ici (le champ doit
 * accepter la lettre "x"). Marquage rouge en direct (`erronee`) après un échec —
 * `promptcorrectionsgenerateur24lot2.md`, point 5. */
function ChampSymbolique({
  id,
  label,
  valeur,
  onChange,
  erronee,
  gele,
}: {
  id: string;
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  erronee: boolean;
  /** Champ figé pendant `ValidationEcran` (écran clos). */
  gele: boolean;
}) {
  return (
    <div className="field field-inline">
      <label className="field-label field-label-minuscule" htmlFor={id}>
        <Katex expression={label} />
      </label>
      <input disabled={gele}
        id={id}
        className={`text-input${erronee ? " is-erronee" : ""}`}
        placeholder={PLACEHOLDER_COMPOSANTE_SYMBOLIQUE}
        value={valeur}
        onChange={(e) => onChange(normaliserSigneMoins(e.target.value))}
      />
    </div>
  );
}

/**
 * Écran "constructionAvecX" — V4-écran1 (variante "pointsParametre") : composantes de AB/AC, un
 * champ de saisie LIBRE par composante (`promptcorrectionsgenerateur24complet.md`, point 1) —
 * accepte aussi bien une expression algébrique de x qu'un nombre pur, vérification symbolique.
 *
 * Consigne globale (point 4, persistante avec le bloc des points sur les écrans "réduction"/
 * "résolution" qui suivent) + aide simplifiée à 1 niveau, formule seule (point 2), texte SEUL — pas
 * de graphique (les positions ne sont pas toutes numériques tant que x n'est pas résolu, un
 * graphique donnerait une fausse précision).
 *
 * `promptcorrectionsgenerateur24lot2.md` : point 2, l'aide ne montre plus que la formule de AB⃗ ;
 * point 4, le statut `parse_error` (déjà calculé par `evaluerConstructionAvecX`, jamais recalculé
 * différemment) était calculé mais jamais lu par cet écran — corrigé, câblé au marquage rouge par
 * champ et au message d'erreur ; point 5, marquage rouge du seul champ fautif après un échec.
 *
 * `promptgen24modificationscompletes.md` : bloc de données (points A/B/C) passé en "bloc fitter"
 * (`formatTermesEnoncePointsParametreLatex`, un fragment KaTeX par point).
 */
export function EtapeConstructionAvecXColinearite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [abX, setAbX] = useState("");
  const [abY, setAbY] = useState("");
  const [acX, setAcX] = useState("");
  const [acY, setAcY] = useState("");

  const complet = [abX, abY, acX, acY].every((v) => v.trim() !== "");

  function construireReponse(): ReponseConstructionAvecX {
    return { abX, abY, acX, acY };
  }

  // Règles communes (audit 4e ch. 6, lot B) : saisie illisible jamais transmise au moteur.
  const saisie = useTentativeLisible<ReponseConstructionAvecX>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee !== null ? evaluerConstructionAvecX(exercice, jugee) : null;

  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesEnoncePointsParametreLatex(exercice).map((t, i) => (
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
          <ChampSymbolique gele={!!validation}
            id="colinearite-avecx-abx"
            label={`x_{${exercice.labelA}${exercice.labelB}} =`}
            valeur={abX}
            onChange={setAbX}
            erronee={evaluation !== null && evaluation.abX !== "correct"}
          />
          <ChampSymbolique gele={!!validation}
            id="colinearite-avecx-aby"
            label={`y_{${exercice.labelA}${exercice.labelB}} =`}
            valeur={abY}
            onChange={setAbY}
            erronee={evaluation !== null && evaluation.abY !== "correct"}
          />
        </div>
        <div className="field-row">
          <ChampSymbolique gele={!!validation}
            id="colinearite-avecx-acx"
            label={`x_{${exercice.labelA}${exercice.labelC}} =`}
            valeur={acX}
            onChange={setAcX}
            erronee={evaluation !== null && evaluation.acX !== "correct"}
          />
          <ChampSymbolique gele={!!validation}
            id="colinearite-avecx-acy"
            label={`y_{${exercice.labelA}${exercice.labelC}} =`}
            valeur={acY}
            onChange={setAcY}
            erronee={evaluation !== null && evaluation.acY !== "correct"}
          />
        </div>
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesConstructionColinearite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={construireReponse}
          lisible={() => constructionAvecXLisible(construireReponse())}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.composanteX}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageConstructionAvecX(exercice, r)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
