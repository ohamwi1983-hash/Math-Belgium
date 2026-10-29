import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { ReponsePossibiliteCoefficients } from "../moteur/typesEquationDroite";
import { diagnostiquerPossibiliteCoefficients, estBonneDroiteMauvaiseForme } from "../moteur/verificationEquationDroite";
import { NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS } from "../moteur/sessionEquationDroite";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatAideNiveau2PossibiliteCoefficientsLatex, formatEnonceLatex, latexGabaritPossibiliteCoefficients, segmentsConsignePossibiliteCoefficients } from "../ui/formatEquationDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePossibiliteCoefficients) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Placeholder du champ texte — adapté au choix ET à la forme testée (`exercice.formeCible`,
 * explicite_y/explicite_x uniquement pour cet écran). Exemples HORS de l'espace des tirages (pente
 * 0,4 avec ordonnée 1,7, jamais atteinte — dénominateur 5 pour m, 10 pour p ; triplet 7/−9
 * irréalisable avec des composantes ≤ 5) : jamais la réponse (audit chapitre 7, point 10). */
function placeholderEquation(exercice: ExerciceEquationDroite, choix: "possible" | "impossible"): string {
  if (choix === "impossible") return "ex : 7x-9y+1=0";
  return exercice.formeCible === "explicite_y" ? "ex : y=0,4x+1,7" : "ex : x=0,4y+1,7";
}

/** Libellé KaTeX de la forme testée, pour le message « bonne droite, mauvaise forme ». */
function latexFormeTestee(exercice: ExerciceEquationDroite): string {
  return exercice.formeCible === "explicite_y" ? "y = mx + p" : "x = ny + q";
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
export function EtapePossibiliteCoefficientsEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
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
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS} onActiverAide={onActiverAide} disabledSupplementaire={choix === null} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => choix !== null && onValider({ choix, texte })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {choix !== null && estBonneDroiteMauvaiseForme(exercice, { choix, texte }) ? (
              <>
                Ton équation décrit bien cette droite, mais elle n'est pas écrite sous la forme <Katex expression={latexFormeTestee(exercice)} /> — tentative{" "}
                {tentativesUtilisees}/{tentativesMax}, réessaie.
              </>
            ) : (
              formatMessageErreur(tentativesUtilisees, tentativesMax, statut)
            )}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
