import { useState } from "react";
import type { ExerciceMoyennePondereeClasses } from "../core/moyennePonderee.types";
import type { ReponseCentres } from "../moteur/verificationMoyennePonderee";
import { evaluerCentres } from "../moteur/verificationMoyennePonderee";
import { NIVEAU_AIDE_MAX_CENTRES } from "../moteur/sessionMoyennePonderee";
import {
  INDEX_LIGNE_EXEMPLE,
  LABEL_EFFECTIF_NI,
  LABEL_VALEUR_XI,
  PLACEHOLDER_CENTRE,
  consigneCentres,
  formatClasseTexte,
  libelleBoutonAide,
  texteAideCentresNiveau1,
  texteAideCentresNiveau2,
} from "../ui/formatMoyennePonderee";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMoyennePonderee } from "./EnonceMoyennePonderee";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceMoyennePondereeClasses;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCentres) => void;
}

/**
 * Écran "centres" (variante "classes" uniquement, toujours la première étape de cette variante) :
 * les classes sont déjà affichées avec leurs bornes et leur effectif imposés — un nombre fixe de
 * lignes, jamais une interface "add-as-needed" (mêmes conventions que "Regroupement en classes et
 * histogramme"). Colonne "Centre $x_i$" en KaTeX, toujours en forme COMPLÈTE — première apparition
 * de ce symbole dans la séquence de cette variante (voir `formatMoyennePonderee.ts`). Dès
 * l'activation de l'Aide 2, la ligne de la classe utilisée comme exemple est mise en surbrillance
 * (`promptgen32modifications.md`, point 2). **Aide 1 en TEXTE SIMPLE, jamais en LaTeX**
 * (`promptgen32corrections2.md`, point 2 — le rendu en fraction débordait du cadre sur mobile) ;
 * l'Aide 2 (exemple numérique substitué) n'est pas concernée, reste en LaTeX.
 */
export function EtapeCentresMoyennePonderee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.classes.length).fill("") as string[]);

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerCentres(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;
  const ligneExempleSurlignee = niveauAide >= 2;

  const aide1 = texteAideCentresNiveau1();
  const aide2 = texteAideCentresNiveau2(exercice);

  return (
    <div>
      <EnonceMoyennePonderee exercice={exercice} />
      <p className="prompt-text">{consigneCentres(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table mp-table">
          <thead>
            <tr>
              <th>Classe</th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Centre <Katex expression={LABEL_VALEUR_XI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.classes.map((classe, index) => {
              const erronee = evaluation !== null && evaluation[index] !== "correct";
              const estExemple = ligneExempleSurlignee && index === INDEX_LIGNE_EXEMPLE;
              return (
                <tr key={index} className={estExemple ? "is-surlignee" : undefined}>
                  <td>{formatClasseTexte(exercice, index)}</td>
                  <td>{classe.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_CENTRE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Centre de la classe ${formatClasseTexte(exercice, index)}`}
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
          <p>{aide1.texte}</p>
          <p>{aide1.formule}</p>
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CENTRES} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CENTRES)}
      </button>

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
