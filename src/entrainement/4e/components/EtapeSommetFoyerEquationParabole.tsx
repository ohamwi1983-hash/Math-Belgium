import { useState } from "react";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import { NIVEAU_AIDE_MAX_SOMMET_FOYER } from "../moteur/sessionEquationParabole";
import { diagnostiquerSommetFoyer } from "../moteur/verificationEquationParabole";
import type { ReponseSommetFoyer } from "../moteur/verificationEquationParabole";
import { CONSIGNE_GENERALE_EQUATION_PARABOLE, CONSIGNE_SOMMET_FOYER, PLACEHOLDER_COORDONNEE, TEXTE_AIDE_SOMMET_FOYER_NIVEAU1, TEXTE_AIDE_SOMMET_FOYER_NIVEAU2 } from "../ui/formatEquationParabole";
import { EquationParaboleGraph } from "./EquationParaboleGraph";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceEquationParabole;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommetFoyer) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 (première étape, sans état actuel — rien à rappeler avant elle) — 4 champs numériques,
 * lecture directe sur le graphe, statut à 3 valeurs classique. */
export function EtapeSommetFoyerEquationParabole({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [sx, setSx] = useState("");
  const [sy, setSy] = useState("");
  const [fx, setFx] = useState("");
  const [fy, setFy] = useState("");

  const complet = [sx, sy, fx, fy].every((v) => v.trim() !== "");

  function construireReponse(): ReponseSommetFoyer {
    return { sx: nombreOuNaN(sx), sy: nombreOuNaN(sy), fx: nombreOuNaN(fx), fy: nombreOuNaN(fy) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerSommetFoyer(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_PARABOLE}
        blocDonnees={<EquationParaboleGraph exercice={exercice} afficherSommet={niveauAide >= 2} />}
      />
      <p className="prompt-text">{CONSIGNE_SOMMET_FOYER}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-sx">
            <Katex expression="x_S=" />
          </label>
          <input
            id="equation-parabole-sx"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sx}
            onChange={(e) => setSx(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-sy">
            <Katex expression="y_S=" />
          </label>
          <input
            id="equation-parabole-sy"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sy}
            onChange={(e) => setSy(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-fx">
            <Katex expression="x_F=" />
          </label>
          <input
            id="equation-parabole-fx"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fx}
            onChange={(e) => setFx(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-fy">
            <Katex expression="y_F=" />
          </label>
          <input
            id="equation-parabole-fy"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fy}
            onChange={(e) => setFy(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_SOMMET_FOYER_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOMMET_FOYER_NIVEAU2}</p>}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_SOMMET_FOYER}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={() => nombresLisibles(sx, sy, fx, fy)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => {
            const { sommet: S, foyer: F } = exercice;
            if (r.sx === F.x && r.sy === F.y && r.fx === S.x && r.fy === S.y) return [t("Tu as échangé "), l("S"), t(" et "), l("F"), t(" : le foyer est la croix, le sommet est sur la courbe.")];
            const K = { x: 2 * S.x - F.x, y: 2 * S.y - F.y };
            if (r.sx === K.x && r.sy === K.y) return [t("Ce point est sur la directrice, pas sur la parabole : le sommet est le milieu entre le foyer et la directrice.")];
            return null;
          }}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
