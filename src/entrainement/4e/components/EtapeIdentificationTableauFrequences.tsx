import { useState } from "react";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { LigneIdentificationSaisie, ReponseIdentification } from "../moteur/verificationTableauFrequences";
import { evaluerIdentification } from "../moteur/verificationTableauFrequences";
import { NIVEAU_AIDE_MAX_IDENTIFICATION } from "../moteur/sessionTableauFrequences";
import {
  LABEL_EFFECTIF_NI,
  LABEL_VALEUR_XI,
  PLACEHOLDER_EFFECTIF,
  PLACEHOLDER_VALEUR,
  consigneIdentification,
  libelleBoutonAide,
  ligneExemple,
  texteAideIdentificationNiveau1,
  texteAideIdentificationNiveau2,
} from "../ui/formatTableauFrequences";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceTableauFrequences } from "./EnonceTableauFrequences";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceTableauFrequences;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIdentification) => void;
}

/**
 * Écran 1 — "Identifier les valeurs distinctes et leurs effectifs" : interface "add-as-needed",
 * une ligne (valeur, effectif) par valeur distincte identifiée — jamais un nombre fixe de champs,
 * le nombre de valeurs distinctes n'étant jamais donné à l'avance. Ordre croissant exigé sur les
 * valeurs (fait partie du raisonnement testé, voir `verifierIdentification` — comparaison
 * POSITIONNELLE, jamais un multi-ensemble). Tableau (`promptameliorationsgenerateur30.md`, point 2)
 * plutôt qu'une paire de champs séparés — même structure que les écrans suivants.
 *
 * **Surlignage interactif** (point 1) : chaque occurrence de la liste brute est un bouton
 * cliquable — un premier clic l'encadre en violet ("cochée"), un second clic sur la MÊME
 * occurrence retire l'encadrement. Suivi par INDEX (jamais par valeur, une valeur répétée devant
 * rester cochable indépendamment à chaque occurrence), état local jamais transmis à la
 * vérification (purement un outil visuel pour l'élève).
 *
 * Aide 1 : surligne dans la liste brute (en VERT, distinct du violet interactif de l'élève — point
 * 1) les occurrences d'une seule valeur exemple, modélisant la méthode de comptage. Aide 2 :
 * révèle le nombre total de valeurs distinctes attendues, jamais lesquelles — permet de vérifier
 * qu'aucune n'a été oubliée sans donner la réponse.
 */
export function EtapeIdentificationTableauFrequences({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState<LigneIdentificationSaisie[]>([{ valeur: "", effectif: "" }]);
  const [indicesCoches, setIndicesCoches] = useState<Set<number>>(new Set());

  function basculerCoche(index: number) {
    setIndicesCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(index)) suivant.delete(index);
      else suivant.add(index);
      return suivant;
    });
  }

  function ajouterLigne() {
    setLignes([...lignes, { valeur: "", effectif: "" }]);
  }

  function retirerLigne(index: number) {
    if (lignes.length <= 1) return;
    setLignes(lignes.filter((_, i) => i !== index));
  }

  function modifierValeur(index: number, valeur: string) {
    setLignes(lignes.map((l, i) => (i === index ? { ...l, valeur } : l)));
  }

  function modifierEffectif(index: number, effectif: string) {
    setLignes(lignes.map((l, i) => (i === index ? { ...l, effectif } : l)));
  }

  const complet = lignes.every((l) => l.valeur.trim() !== "" && l.effectif.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerIdentification(exercice, lignes) : null;
  const statut =
    evaluation && evaluation.some((s) => s.valeur === "parse_error" || s.effectif === "parse_error") ? "parse_error" : undefined;

  const surlignerValeur = niveauAide >= 1 ? ligneExemple(exercice).valeur : null;

  return (
    <div>
      <EnonceTableauFrequences exercice={exercice} />
      <div className="tf-liste-brute">
        {exercice.donneesBrutes.map((v, i) => (
          <button
            type="button"
            key={i}
            className={`tf-liste-brute-item${v === surlignerValeur ? " is-surlignee" : ""}${indicesCoches.has(i) ? " is-cochee" : ""}`}
            onClick={() => basculerCoche(i)}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="prompt-text">{consigneIdentification(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                Valeur <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, index) => {
              const ligneEvaluation = evaluation?.[index];
              const valeurErronee = ligneEvaluation !== undefined && ligneEvaluation.valeur !== "correct";
              const effectifErronee = ligneEvaluation !== undefined && ligneEvaluation.effectif !== "correct";
              return (
                <tr key={index}>
                  <td>
                    <input
                      className={`text-input${valeurErronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_VALEUR}
                      value={ligne.valeur}
                      onChange={(e) => modifierValeur(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Valeur de la ligne ${index + 1}`}
                    />
                  </td>
                  <td>
                    <input
                      className={`text-input${effectifErronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_EFFECTIF}
                      value={ligne.effectif}
                      onChange={(e) => modifierEffectif(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Effectif de la ligne ${index + 1}`}
                    />
                  </td>
                  <td>
                    {lignes.length > 1 && (
                      <button
                        type="button"
                        className="btn liste-morceaux-retirer"
                        aria-label={`Retirer la ligne ${index + 1}`}
                        onClick={() => retirerLigne(index)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterLigne}>
        + Ajouter une ligne
      </button>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideIdentificationNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAideIdentificationNiveau2(exercice)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_IDENTIFICATION} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_IDENTIFICATION)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(lignes)}>
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
