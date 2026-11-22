import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionEquationDroite";
import { diagnostiquerExtraction } from "../moteur/verificationEquationDroite";
import type { ReponseExtraction } from "../moteur/verificationEquationDroite";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, consigneExtraction, formatAideExtractionNiveau2Latex, formatEnonceLatex, segmentsAideExtractionNiveau1 } from "../ui/formatEquationDroite";
import { ILLISIBLE_ANALYTIQUE, cibleVecteurDirecteur, l, nombreOuNaN, nombresLisibles, surDroite, t } from "../ui/retoursAnalytique";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtraction) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 — extraction commune : point + vecteur directeur, 4 champs numériques. Vérifiée par
 * "point sur la droite + vecteur colinéaire au vecteur de référence" (`diagnostiquerExtraction`),
 * jamais par un couple exact imposé — plusieurs réponses différentes peuvent être correctes.
 */
export function EtapeExtractionEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [x0, setX0] = useState("");
  const [y0, setY0] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const complet = [x0, y0, a, b].every((v) => v.trim() !== "");

  /** Fraction « p/q », racine « √3 » acceptées (un vecteur directeur colinéaire peut avoir des
   * composantes fractionnaires ou irrationnelles) ; une saisie illisible n'est jamais transmise. */
  function construireReponse(): ReponseExtraction {
    return { x0: nombreOuNaN(x0), y0: nombreOuNaN(y0), a: nombreOuNaN(a), b: nombreOuNaN(b) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  /** Message ciblé (jamais la réponse) : vecteur normal pris pour directeur, composantes échangées,
   * point hors de la droite. */
  function cible(r: ReponseExtraction) {
    const vecteur = cibleVecteurDirecteur({ x: r.a, y: r.b }, exercice.vecteur);
    if (vecteur) return vecteur;
    if (!surDroite({ x: r.x0, y: r.y0 }, exercice.referenceImplicite)) return [t("Ton point n'est pas sur la droite : prends un point donné dans l'énoncé, comme "), l("A"), t(".")];
    return null;
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consigneExtraction(exercice)}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-x0">
            x₀ =
          </label>
          <input
            id="equation-droite-extraction-x0"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x0}
            onChange={(e) => setX0(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-y0">
            y₀ =
          </label>
          <input
            id="equation-droite-extraction-y0"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y0}
            onChange={(e) => setY0(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-a">
            <Katex expression="x_{\vec{u}}=" />
          </label>
          <input
            id="equation-droite-extraction-a"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={a}
            onChange={(e) => setA(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-droite-extraction-b">
            <Katex expression="y_{\vec{u}}=" />
          </label>
          <input
            id="equation-droite-extraction-b"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={b}
            onChange={(e) => setB(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideExtractionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_EXTRACTION}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={construireReponse}
          lisible={() => nombresLisibles(x0, y0, a, b)}
          onValider={onValider}
          texteIllisible={() => (nombresLisibles(x0, y0) ? ILLISIBLE_ANALYTIQUE.composante : ILLISIBLE_ANALYTIQUE.coordonnee)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
