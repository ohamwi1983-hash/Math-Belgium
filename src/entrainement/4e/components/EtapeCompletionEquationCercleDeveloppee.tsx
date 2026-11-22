import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_COMPLETION } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerCompletionCarre } from "../moteur/verificationEquationCercleDeveloppee";
import { CONSIGNE_COMPLETION, consigneGeneraleCentreRayon, PLACEHOLDER_COMPLETION, segmentsAideCompletionNiveau1, formatAideCompletionNiveau2Latex, formatEquationDeveloppeeLatex } from "../ui/formatEquationCercleDeveloppee";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, cibleEquationCercle, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { diagnostiquerEquationCercle } from "../moteur/verificationEquationCercle";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationCercleDeveloppee;
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
 * Écran 2 — énoncé toujours affiché, le regroupement CONFIRMÉ à l'écran 1 (jamais resaisi)
 * apparaît désormais dans le récapitulatif accumulé en haut de carte
 * (`RecapitulatifPanel`/`AppEquationCercleDeveloppee`), plus ici en isolation. Champ de texte
 * libre, vérifié par équivalence algébrique à 2 variables
 * (`diagnostiquerCompletionCarre` — cible IDENTIQUE à l'écran 1, voir l'en-tête de
 * `verificationEquationCercleDeveloppee.ts`).
 */
export function EtapeCompletionEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCompletionCarre(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleCentreRayon(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_COMPLETION}</p>

      <div className="field">
        <label className="field-label" htmlFor="equation-cercle-developpee-completion">
          Équation complétée :
        </label>
        <input
          id="equation-cercle-developpee-completion"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_COMPLETION}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCompletionNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCompletionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_COMPLETION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => texte}
          lisible={(r) => diagnostiquerCompletionCarre(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationCercle}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => {
            const juste = (x0: number, y0: number, r2: number) => diagnostiquerEquationCercle(r, x0, y0, r2) === "correct";
            if (juste(exercice.centre.x, exercice.centre.y, exercice.rayonCarre)) return [t("Ton équation décrit bien ce cercle, mais elle n'est pas écrite sous la forme demandée : deux carrés complétés au premier membre, un nombre au second.")];
            return cibleEquationCercle(juste, exercice.centre.x, exercice.centre.y, exercice.rayonCarre);
          }}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
