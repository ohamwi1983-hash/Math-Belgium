import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatRacinesRevelees } from "../ui/formatRelationsRacines";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { BoutonAide } from "./BoutonAide";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceRelationsRacines;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  diagnostiquer: (valeur: string) => StatutVerification;
  /** Aides à 2 niveaux (KaTeX) fournies par l'appli — remplacent l'aide historique à 1 niveau. */
  aides?: FragmentConsigne[][];
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (jamais la réponse). */
  messageCible?: (valeur: string) => FragmentConsigne[] | null;
  onValider: (reponse: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "équation depuis les racines" (finale) : repart des MÊMES racines qu'à l'écran précédent
 * — convention a=1 du cours, x²-Sx+P=0, en réutilisant S/P déjà trouvés à l'écran 1. Piège :
 * signe oublié devant S (erreur de signe classique, déjà rencontrée dans le quiz du chapitre 2).
 */
export function EtapeEquationDepuisRacines({
  aides,
  messageCible,
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  diagnostiquer,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const saisie = useTentativeLisible<string>();
  const statut = tentativesUtilisees > 0 ? diagnostiquer(reponse) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        On repart des mêmes racines, <Katex expression={formatRacinesRevelees(exercice.racines)} /> — écris
        l'équation du second degré la plus simple (a = 1) qui admet ces deux racines, sous la forme x² − Sx + P = 0.
      </p>
      <ApercuExpressionLatex texte={reponse} label="Équation =" />
      <div className="field">
        <label className="field-label" htmlFor="relrac-equation">
          Équation
        </label>
        <input
          id="relrac-equation"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          value={reponse}
          onChange={(e) => setReponse(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
          {aides ? (
            <AidesNiveaux aides={aides} onPremiereAide={onActiverAide} />
          ) : (
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>
                  Remplace S et P par les valeurs déjà trouvées à l'écran précédent dans <Katex expression="x^2-Sx+P=0" /> —
                  attention au signe devant S.
                </p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          )}
          <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => saisie.tenter(reponse, diagnostiquer(reponse) !== "parse_error", onValider)}>
            Valider
          </button>
          <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={saisie.soumise !== null ? messageCible?.(saisie.soumise) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
