import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_REGROUPEMENT } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerRegroupement, estEquivalenteEquationDepart } from "../moteur/verificationEquationParaboleDeveloppee";
import { CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE, TEXTE_AIDE_REGROUPEMENT_NIVEAU1, formatEquationDeveloppeeLatex, placeholderRegroupement, segmentsConsigneRegroupement, texteAideRegroupementNiveau2 } from "../ui/formatEquationParaboleDeveloppee";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  exercice: ExerciceEquationParaboleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 (première étape, sans état actuel — rien à rappeler avant elle) — l'énoncé (équation
 * développée) reste affiché, fixe, sur les 3 écrans. Champ de texte libre, vérifié par équivalence
 * algébrique à 2 variables (`diagnostiquerRegroupement`).
 */
export function EtapeRegroupementEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRegroupement(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneRegroupement(exercice)} />
      </p>

      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-regroupement">
          Équation :
        </label>
        <input
          id="equation-parabole-developpee-regroupement"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={placeholderRegroupement(exercice)}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_REGROUPEMENT_NIVEAU1}</p>
          {niveauAide >= 2 && <p><TexteInsistance texte={texteAideRegroupementNiveau2(exercice)} /></p>}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_REGROUPEMENT}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => texte}
          lisible={(r) => diagnostiquerRegroupement(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.regroupementParabole}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => (diagnostiquerRegroupement(exercice, r) === "not_equivalent" && estEquivalenteEquationDepart(exercice, r) ? [t("Ton équation est juste, mais elle n'a pas encore la forme demandée : poursuis la transformation.")] : null)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
