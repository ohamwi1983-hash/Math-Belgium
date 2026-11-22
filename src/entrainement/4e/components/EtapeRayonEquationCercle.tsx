import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_RAYON } from "../moteur/sessionEquationCercle";
import { diagnostiquerRayon } from "../moteur/verificationEquationCercle";
import { CONSIGNE_GENERALE_EQUATION_CERCLE, consigneRayon, formatAideRayonNiveau2Latex, placeholderRayon, texteAideRayonNiveau1, texteAideRayonNiveau2 } from "../ui/formatEquationCercle";
import { EquationCercleGraph } from "./EquationCercleGraph";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, lireNombreAnalytique, t } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

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
 * Écran 2 — le centre étant déjà confirmé (donc plus un secret, rappelé dans le récapitulatif
 * accumulé en haut de carte — `RecapitulatifPanel`/`AppEquationCercle`), le graphe le garde
 * marqué en permanence ; l'aide de niveau 2 ajoute EN PLUS le segment pointillé centre→point marqué
 * (`afficherRayon`), avec — pour `rayon_indirect` seulement — la formule de Pythagore substituée
 * mais jamais résolue.
 */
export function EtapeRayonEquationCercle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [rayon, setRayon] = useState("");

  const complet = rayon.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRayon(exercice, rayon) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const latexAide2 = formatAideRayonNiveau2Latex(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_CERCLE}
        blocDonnees={<EquationCercleGraph exercice={exercice} afficherCentre afficherRayon={niveauAide >= 2} />}
      />
      <p className="prompt-text">{consigneRayon(exercice)}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-rayon">
          r =
        </label>
        <input
          id="equation-cercle-rayon"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={placeholderRayon(exercice)}
          value={rayon}
          onChange={(e) => setRayon(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideRayonNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <>
              <p>{texteAideRayonNiveau2(exercice)}</p>
              {latexAide2 && (
                <p>
                  <Katex expression={latexAide2} />
                </p>
              )}
            </>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_RAYON}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => rayon}
          lisible={(r) => diagnostiquerRayon(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.rayon}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => (Math.abs((lireNombreAnalytique(r) ?? NaN) - exercice.rayonCarre) < 1e-9 && exercice.rayonCarre !== exercice.rayon ? [t("Tu as donné "), l("r^2"), t(" : le rayon est sa racine carrée.")] : null)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
