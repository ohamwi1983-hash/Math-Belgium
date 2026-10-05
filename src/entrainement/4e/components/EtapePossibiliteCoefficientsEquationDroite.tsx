import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { ReponsePossibiliteCoefficients } from "../moteur/typesEquationDroite";
import { diagnostiquerPossibiliteCoefficients } from "../moteur/verificationEquationDroite";
import { NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS } from "../moteur/sessionEquationDroite";
import type { StatutVerification } from "../moteur/statutVerification";
import {
  formatAideNiveau2PossibiliteCoefficientsLatex,
  formatEnonceLatex,
  formatEtatActuelPointVecteurLatex,
  latexGabaritPossibiliteCoefficients,
  libelleBoutonAide,
  segmentsConsignePossibiliteCoefficients,
} from "../ui/formatEquationDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePossibiliteCoefficients) => void;
}

/** Placeholder du champ texte — adapté au choix ET à la forme testée (`exercice.formeCible`,
 * explicite_y/explicite_x uniquement pour cet écran). */
function placeholderEquation(exercice: ExerciceEquationDroite, choix: "possible" | "impossible"): string {
  if (choix === "impossible") return "ex : 2x-3y+5=0";
  return exercice.formeCible === "explicite_y" ? "ex : y=2x+3" : "ex : x=2y+3";
}

/**
 * Écran fusionné "possibilité + équation" (formes explicite_y/explicite_x uniquement,
 * `promptgen42modificationsv2.md`, partie A) — remplace l'ancien couple d'écrans "possibilite"
 * (choix catégoriel seul) + "coefficients" (champs numériques séparés m/p ou n/q) : une seule
 * question ("Cette droite peut-elle s'écrire sous forme $x=ny+q$/$y=mx+p$ ?"), puis un champ TEXTE
 * LIBRE unique dont le contenu attendu dépend du choix — la forme testée si "possible", la forme
 * implicite de secours (toujours atteignable) si "impossible". Vérifié par
 * `diagnostiquerPossibiliteCoefficients`, qui accepte n'importe quelle représentation valide de la
 * droite (`diagnostiquerEquationDroiteLibre`) quel que soit le choix, jamais un format imposé.
 */
export function EtapePossibiliteCoefficientsEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<"possible" | "impossible" | null>(null);
  const [texte, setTexte] = useState("");

  function choisir(nouveauChoix: "possible" | "impossible") {
    setChoix(nouveauChoix);
    setTexte("");
  }

  const complet = choix !== null && texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut: StatutVerification | undefined = apresEchec && choix !== null ? diagnostiquerPossibiliteCoefficients(exercice, { choix, texte }) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <ConsigneGeneraleEquationDroite exercice={exercice} />
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <EtatActuelPanel latex={formatEtatActuelPointVecteurLatex(exercice)} />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsignePossibiliteCoefficients(exercice)} />
      </p>

      <div className="options-grid-compact">
        <button type="button" className={choix === "possible" ? "btn toggle-active" : "btn"} onClick={() => choisir("possible")}>
          Possible
        </button>
        <button type="button" className={choix === "impossible" ? "btn toggle-active" : "btn"} onClick={() => choisir("impossible")}>
          Impossible
        </button>
      </div>

      {choix !== null && (
        <div className="field contenu-conditionnel">
          <label className="field-label" htmlFor="equation-droite-possibilite-coefficients-texte">
            Équation
          </label>
          <input
            id="equation-droite-possibilite-coefficients-texte"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={placeholderEquation(exercice, choix)}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
          />
        </div>
      )}

      {niveauAide > 0 && choix !== null && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={latexGabaritPossibiliteCoefficients(exercice, choix)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideNiveau2PossibiliteCoefficientsLatex(exercice, choix)} />
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        className="btn btn-aide"
        disabled={choix === null || niveauAide >= NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS}
        onClick={onActiverAide}
      >
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => choix !== null && onValider({ choix, texte })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
