import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionEquationCercle";
import { diagnostiquerEquationExercice, estEquationCercleDeveloppee } from "../moteur/verificationEquationCercle";
import { CONSIGNE_EQUATION, CONSIGNE_GENERALE_EQUATION_CERCLE, LATEX_GABARIT_EQUATION, MESSAGE_FORME_DEVELOPPEE, PLACEHOLDER_EQUATION, TEXTE_AIDE_EQUATION_NIVEAU1 } from "../ui/formatEquationCercle";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationCercleGraph } from "./EquationCercleGraph";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
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
  const formeDeveloppee = erronee && estEquationCercleDeveloppee(exercice, texte);

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
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_EQUATION_NIVEAU1}</p>
          <p>
            <Katex expression={LATEX_GABARIT_EQUATION} />
          </p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EQUATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formeDeveloppee ? `${MESSAGE_FORME_DEVELOPPEE} — tentative ${tentativesUtilisees}/${tentativesMax}.` : formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
