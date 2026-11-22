import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionEquationCercle";
import { diagnostiquerEquationCercle, diagnostiquerEquationExercice, estEquationCercleDeveloppee } from "../moteur/verificationEquationCercle";
import { CONSIGNE_EQUATION, CONSIGNE_GENERALE_EQUATION_CERCLE, LATEX_GABARIT_EQUATION, formatAideEquationNiveau2Latex, MESSAGE_FORME_DEVELOPPEE, PLACEHOLDER_EQUATION, TEXTE_AIDE_EQUATION_NIVEAU1 } from "../ui/formatEquationCercle";
import { EquationCercleGraph } from "./EquationCercleGraph";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, cibleEquationCercle, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationCercle;
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
 * Écran 3 (dernier, toujours terminal) — champ texte libre, réutilise directement
 * `diagnostiquerEquationExercice` (`moteur/verificationEquationCercle.ts`, moteur d'égalité
 * algébrique à 2 variables déjà partagé). Un seul niveau d'aide : le gabarit général, jamais
 * substitué avec les vraies valeurs (elles sont déjà rappelées dans le récapitulatif accumulé en
 * haut de carte — `RecapitulatifPanel`/`AppEquationCercle`).
 */
export function EtapeEquationEquationCercle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerEquationExercice(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_CERCLE}
        blocDonnees={<EquationCercleGraph exercice={exercice} afficherCentre afficherRayon />}
      />
      <p className="prompt-text">{CONSIGNE_EQUATION}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-equation">
          Équation :
        </label>
        <input
          id="equation-cercle-equation"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_EQUATION_NIVEAU1}</p>
          <p>
            <Katex expression={LATEX_GABARIT_EQUATION} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideEquationNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_EQUATION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => texte}
          lisible={(r) => diagnostiquerEquationExercice(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationCercle}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) =>
            estEquationCercleDeveloppee(exercice, r)
              ? [t(`${MESSAGE_FORME_DEVELOPPEE}.`)]
              : cibleEquationCercle((x0, y0, r2) => diagnostiquerEquationCercle(r, x0, y0, r2) === "correct", exercice.centre.x, exercice.centre.y, exercice.rayonCarre)
          }
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
