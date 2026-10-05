import { useEffect, useState } from "react";
import type { ExerciceContexteEconomiqueA } from "../core5e/contexteEconomique.types";
import type { ReponseExtremum } from "../moteur5e/verificationContexteEconomique";
import { consigneEcran, consigneGenerale, formatTermesDonneesLatex, PRECISION_EXTREMUM, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelContexteEconomique } from "./EtatActuelContexteEconomique";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceContexteEconomiqueA;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtremum) => void;
  /** Correction PAR CHAMP de position (correcte si elle correspond à N'IMPORTE LAQUELLE des
   * positions attendues, ordre indifférent) — jamais fourni pour le choix "existe/aucun" ni pour
   * la nature (max/min), qui restent corrigés globalement pour ne jamais fuir la répartition
   * attendue avant validation. */
  diagnostiquerPosition: (texte: string) => StatutVerification;
}

/** Écran "extremum" (famille A) — sous-cas tiré INDÉPENDAMMENT du degré : en degré 2, TOUJOURS
 * exactement 1 extremum (C'_T linéaire) — aucun bouton "pas d'extremum" n'est même proposé,
 * conformément à la tâche ("pas de 'pas d'extremum' possible pour ce sous-cas"). En degré 3, un
 * choix EXPLICITE "existe"/"n'existe pas" est demandé EN PREMIER (jamais un champ juste laissé
 * vide) ; si "existe", EXACTEMENT 2 champs position+nature apparaissent — un cubique authentique
 * (a≠0) a TOUJOURS 0 ou 2 points critiques réels, jamais 1 (hors racine double, exclue à la
 * génération) : ce nombre est un fait MATHÉMATIQUE, jamais dérivé de `exercice.extrema.length`
 * (qui fuirait la bonne réponse si l'élève se trompe de choix). */
export function EtapeExtremumCoutTotal({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquerPosition }: Props) {
  const proposeChoixExistence = exercice.coutTotal.degre === 3;
  const [existeChoisi, setExisteChoisi] = useState<boolean | null>(proposeChoixExistence ? null : true);
  useEffect(() => {
    setExisteChoisi(proposeChoixExistence ? null : true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposeChoixExistence]);
  const nbChamps = existeChoisi ? (proposeChoixExistence ? 2 : 1) : 0;
  const [positions, setPositions] = useState<string[]>(() => new Array(nbChamps).fill(""));
  const [natures, setNatures] = useState<("max" | "min" | null)[]>(() => new Array(nbChamps).fill(null));
  useEffect(() => {
    setPositions(new Array(nbChamps).fill(""));
    setNatures(new Array(nbChamps).fill(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nbChamps]);

  const montrerErreurs = tentativesUtilisees > 0;

  function choisirExistence(valeur: boolean) {
    setExisteChoisi(valeur);
  }

  function modifierPosition(i: number, valeur: string) {
    setPositions((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function modifierNature(i: number, valeur: "max" | "min") {
    setNatures((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }

  const complet = existeChoisi === false || (existeChoisi === true && positions.every((p) => p.trim() !== "") && natures.every((n) => n !== null));
  const apresEchec = tentativesUtilisees > 0;
  const statutsPosition = apresEchec && existeChoisi === true ? positions.map((p) => diagnostiquerPosition(p)) : null;

  function valider() {
    if (!complet) return;
    const reponse: ReponseExtremum =
      existeChoisi === false ? { type: "aucun" } : { type: "existe", extrema: positions.map((position, i) => ({ position, nature: natures[i] as "max" | "min" })) };
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelContexteEconomique exercice={exercice} ecran="extremum" />
      <p className="prompt-text">{consigneEcran(exercice, "extremum")}</p>

      {proposeChoixExistence && (
        <div className="options-grid-compact">
          <button type="button" className={`btn${existeChoisi === true ? " toggle-active" : ""}`} onClick={() => choisirExistence(true)}>
            Un extremum existe
          </button>
          <button type="button" className={`btn${existeChoisi === false ? " toggle-active" : ""}`} onClick={() => choisirExistence(false)}>
            Pas d'extremum
          </button>
        </div>
      )}

      {existeChoisi === true && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">{PRECISION_EXTREMUM}</p>
          {positions.map((position, i) => (
            <div key={i}>
              <div className="field field-inline">
                <label className="field-label field-label-minuscule">
                  <Katex expression={`q_${i + 1}=`} />
                </label>
                <input
                  type="text"
                  className={`text-input${statutsPosition && statutsPosition[i] !== "correct" ? " is-erronee" : ""}`}
                  value={position}
                  onChange={(e) => modifierPosition(i, e.target.value)}
                  placeholder="ex : 2.5"
                />
              </div>
              <div className="options-grid-compact">
                <button type="button" className={`btn${natures[i] === "max" ? " toggle-active" : ""}`} onClick={() => modifierNature(i, "max")}>
                  Maximum
                </button>
                <button type="button" className={`btn${natures[i] === "min" ? " toggle-active" : ""}`} onClick={() => modifierNature(i, "min")}>
                  Minimum
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1("extremum")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(exercice, "extremum")}</p>}
        </div>
      )}
    </div>
  );
}
