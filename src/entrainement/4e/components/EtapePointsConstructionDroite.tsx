import { useState } from "react";
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import { NIVEAU_AIDE_MAX_POINTS } from "../moteur/sessionConstructionDroite";
import { diagnostiquerPoints } from "../moteur/verificationConstructionDroite";
import type { ReponsePoints } from "../moteur/verificationConstructionDroite";
import { PLACEHOLDER_COORDONNEE, aidePointsNiveau1, aidePointsNiveau2, consigneGeneraleTrace, consignePoints, formatEnonceLatex } from "../ui/formatConstructionDroite";
import { ILLISIBLE_ANALYTIQUE, l, nombreOuNaN, nombresLisibles, surDroite, t } from "../ui/retoursAnalytique";
import { RenduFragments } from "./RenduFragments";
import { PiedAnalytique } from "./PiedAnalytique";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceConstructionDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePoints) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 — 2 points ENTIERS et distincts de la droite, 4 champs numériques. Vérifiée par
 * APPARTENANCE à la droite (`diagnostiquerPoints`), jamais par égalité à une paire pré-déterminée —
 * n'importe quel couple de points entiers valides est accepté.
 */
export function EtapePointsConstructionDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [x1, setX1] = useState("");
  const [y1, setY1] = useState("");
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");

  const complet = [x1, y1, x2, y2].every((v) => v.trim() !== "");

  function construireReponse(): ReponsePoints {
    return { x1: nombreOuNaN(x1), y1: nombreOuNaN(y1), x2: nombreOuNaN(x2), y2: nombreOuNaN(y2) };
  }

  /** Message ciblé (jamais la réponse) : point sur la droite mais non entier, point hors de la
   * droite, deux points confondus. */
  function cible(r: ReponsePoints) {
    const ref = exercice.referenceImplicite;
    const pts = [
      { x: r.x1, y: r.y1 },
      { x: r.x2, y: r.y2 },
    ];
    for (const [i, p] of pts.entries()) {
      const nom = i === 0 ? "premier" : "second";
      if (surDroite(p, ref) && (!Number.isInteger(p.x) || !Number.isInteger(p.y))) return [t(`Ton ${nom} point est bien sur la droite, mais ses coordonnées ne sont pas entières : choisis une autre valeur de départ.`)];
      if (!surDroite(p, ref)) return [t(`Ton ${nom} point n'est pas sur la droite : remplace ses coordonnées dans l'équation pour contrôler.`)];
    }
    if (r.x1 === r.x2 && r.y1 === r.y2) return [t("Tes deux points sont confondus : il en faut deux "), l("\\text{différents}"), t(" pour tracer la droite.")];
    return null;
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerPoints(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const champs: { id: string; label: string; valeur: string; setter: (v: string) => void }[][] = [
    [
      { id: "x1", label: "x₁ =", valeur: x1, setter: setX1 },
      { id: "y1", label: "y₁ =", valeur: y1, setter: setY1 },
    ],
    [
      { id: "x2", label: "x₂ =", valeur: x2, setter: setX2 },
      { id: "y2", label: "y₂ =", valeur: y2, setter: setY2 },
    ],
  ];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleTrace(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consignePoints(exercice)}</p>

      <div className="field-row-groupe">
        {champs.map((paire) => (
          <div key={paire[0]!.id} className="field-row">
            {paire.map((champ) => (
              <div key={champ.id} className="field field-inline">
                <label className="field-label field-label-minuscule" htmlFor={`construction-droite-points-${champ.id}`}>
                  {champ.label}
                </label>
                <input
                  id={`construction-droite-points-${champ.id}`}
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_COORDONNEE}
                  value={champ.valeur}
                  onChange={(e) => champ.setter(normaliserSigneMoins(e.target.value))}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aidePointsNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <RenduFragments fragments={aidePointsNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_POINTS}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={construireReponse}
          lisible={() => nombresLisibles(x1, y1, x2, y2)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
