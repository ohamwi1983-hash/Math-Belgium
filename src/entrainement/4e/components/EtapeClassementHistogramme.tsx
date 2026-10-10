import { useState } from "react";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import type { ReponseClassement } from "../moteur/verificationHistogramme";
import { evaluerClassement } from "../moteur/verificationHistogramme";
import { NIVEAU_AIDE_MAX_CLASSEMENT } from "../moteur/sessionHistogramme";
import { LABEL_CLASSE_XI, LABEL_EFFECTIF_NI, PLACEHOLDER_EFFECTIF_CLASSE, consigneClassement, formatClasseTexte, texteAideClassementNiveau1, texteAideClassementNiveau2 } from "../ui/formatHistogramme";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceHistogramme } from "./EnonceHistogramme";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceHistogramme;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseClassement) => void;
}

/**
 * Écran 1 — "Classement" (commun aux 2 variantes) : les classes sont déjà affichées avec leurs
 * bornes imposées — **pas** d'interface "add-as-needed" ici (les classes ne sont jamais construites
 * par l'élève, spec), un nombre fixe de lignes égal au nombre de classes de l'exercice.
 *
 * **Surlignage interactif** (`promptgen31corrections.md`, point 1 — même patron que "Tableau de
 * fréquences") : chaque occurrence de la liste brute est un bouton cliquable, suivi par INDEX
 * (jamais par valeur, une valeur répétée devant rester cochable indépendamment à chaque
 * occurrence) — un clic bascule un encadrement violet, purement visuel, jamais transmis à la
 * vérification, sans aucun lien avec la ligne du tableau en cours de saisie.
 *
 * **En-têtes indiciels** (point 2) : "Classe $x_i$"/"Effectif $n_i$" en KaTeX, toujours en forme
 * COMPLÈTE — première apparition de ces deux en-têtes dans la séquence de ce générateur ; les
 * écrans "Fréquences"/"Trace" les répètent ensuite en forme abrégée
 * (`promptinvestigationpoint3latexmobile.md`).
 */
export function EtapeClassementHistogramme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.classes.length).fill("") as string[]);
  const [indicesCoches, setIndicesCoches] = useState<Set<number>>(new Set());

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function basculerCoche(index: number) {
    setIndicesCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(index)) suivant.delete(index);
      else suivant.add(index);
      return suivant;
    });
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerClassement(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <EnonceHistogramme exercice={exercice} />
      <div className="histogramme-liste-brute">
        {exercice.donneesBrutes.map((v, i) => (
          <button
            type="button"
            key={i}
            className={`histogramme-liste-brute-item${indicesCoches.has(i) ? " is-cochee" : ""}`}
            onClick={() => basculerCoche(i)}
          >
            {v}
          </button>
        ))}
      </div>
      <p className="prompt-text">{consigneClassement(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                Classe <Katex expression={LABEL_CLASSE_XI} />
              </th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.classes.map((_, index) => {
              const erronee = evaluation !== null && evaluation[index] !== "correct";
              return (
                <tr key={index}>
                  <td>{formatClasseTexte(exercice, index)}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_EFFECTIF_CLASSE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Effectif de la classe ${formatClasseTexte(exercice, index)}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideClassementNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAideClassementNiveau2(exercice, evaluation)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CLASSEMENT} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeurs)}>
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
