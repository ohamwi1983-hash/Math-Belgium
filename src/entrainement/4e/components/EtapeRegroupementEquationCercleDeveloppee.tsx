import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_REGROUPEMENT } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerRegroupement } from "../moteur/verificationEquationCercleDeveloppee";
import { CONSIGNE_GENERALE_CENTRE_RAYON, PLACEHOLDER_EQUATION, consigneRegroupement, formatAideRegroupementNiveau2Latex, texteAideRegroupementNiveau1, formatEquationDeveloppeeLatex } from "../ui/formatEquationCercleDeveloppee";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, t } from "../ui/retoursAnalytique";
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
 * Écran 1 (première étape, toujours sans état actuel — rien à rappeler avant elle) — l'énoncé
 * (équation développée) reste affiché, fixe, sur les 3 écrans de cet exercice. Champ de texte
 * libre, vérifié par équivalence algébrique à 2 variables (`diagnostiquerRegroupement`).
 */
export function EtapeRegroupementEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRegroupement(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_CENTRE_RAYON}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{consigneRegroupement(exercice)}</p>

      <div className="field">
        <label className="field-label" htmlFor="equation-cercle-developpee-regroupement">
          Équation regroupée :
        </label>
        <input
          id="equation-cercle-developpee-regroupement"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideRegroupementNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideRegroupementNiveau2Latex(exercice)} />
            </p>
          )}
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
          texteIllisible={ILLISIBLE_ANALYTIQUE.regroupementCercle}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => (diagnostiquerEquationCercle(r, exercice.centre.x, exercice.centre.y, exercice.rayonCarre) === "correct" ? [t("Ton équation décrit bien ce cercle, mais elle n'est pas regroupée comme demandé : les termes en x entre parenthèses, puis ceux en y, la constante dans l\'autre membre.")] : null)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
