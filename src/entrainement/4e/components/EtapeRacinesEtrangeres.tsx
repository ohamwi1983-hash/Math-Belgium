import { useState } from "react";
import type { ExerciceEquationRationnelle } from "../core/equationRationnelle.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { racinesDistinctes } from "../moteur/verificationEquationRationnelle";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationRationnelle;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponses: boolean[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape finale : pour chaque racine **distincte** trouvée à l'étape précédente (`racinesDistinctes`
 * — prompt-5-deduplication-racines-etrangeres.md : une racine unique/double, saisie deux fois par
 * convention à l'étape "racines", n'affiche qu'une seule carte, pas une par position du tableau
 * brut), l'élève déclare si elle est valide ou si elle doit être rejetée (viole la CE) — voir
 * verifierRacinesEtrangeres. La bonne réponse dépend de la construction tirée (toujours "les deux
 * valides" pour un_denominateur, "x=p à rejeter" pour deux_denominateurs) mais l'écran ne
 * présuppose rien : les deux boutons sont proposés pour chaque racine distincte, générique sur
 * `exercice.ce`.
 */
export function EtapeRacinesEtrangeres({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const racines = racinesDistinctes(exercice.equationIsolee.solution.racines);
  const [reponses, setReponses] = useState<Array<boolean | null>>(() => racines.map(() => null));

  function definir(index: number, valeur: boolean) {
    setReponses((r) => r.map((v, i) => (i === index ? valeur : v)));
  }

  const toutesRepondues = reponses.every((r) => r !== null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        Condition{exercice.ce.length > 1 ? "s" : ""} d'existence : {exercice.ce.map((v) => `x ≠ ${v}`).join(" et ")}.
        Pour chaque solution trouvée, indique si elle est valide ou si elle doit être rejetée.
      </p>
      {racines.map((racine, index) => (
        <div className="field" key={`racine-${index}`}>
          <span className="field-label field-label-minuscule">x = {racine}</span>
          <div className="field-row">
            <button
              type="button"
              className={reponses[index] === true ? "btn toggle-active" : "btn"}
              onClick={() => definir(index, true)}
            >
              Valide
            </button>
            <button
              type="button"
              className={reponses[index] === false ? "btn toggle-active" : "btn"}
              onClick={() => definir(index, false)}
            >
              À rejeter
            </button>
          </div>
        </div>
      ))}
      {!validation && (
        <>
        <div>
          {aideActivee && (
            <div className="triangle-quelconque-aide">
              <p>
                Multiplier en croix revient à résoudre une équation plus large que celle de départ. Si une des
                expressions multipliées peut valoir 0 pour cette valeur de x, l'équation obtenue accepte alors des
                solutions que l'équation d'origine refusait : ce sont des racines étrangères, à rejeter.
              </p>
            </div>
          )}
          <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!toutesRepondues}
          onClick={() => toutesRepondues && onValider(reponses as boolean[])}
        >
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
