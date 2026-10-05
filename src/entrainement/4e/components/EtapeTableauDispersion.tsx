import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseTableauDispersion } from "../moteur/verificationDispersion";
import { diagnostiquerTableauDispersion } from "../moteur/verificationDispersion";
import { NIVEAU_AIDE_MAX_TABLEAU } from "../moteur/sessionDispersion";
import {
  INDEX_LIGNE_EXEMPLE,
  LABEL_EFFECTIF_NI,
  LABEL_PRODUIT,
  LABEL_VALEUR_XI,
  PLACEHOLDER_PRODUIT,
  PLACEHOLDER_SOMME_N,
  PLACEHOLDER_SOMME_PRODUIT,
  consigneTableau,
  libelleBoutonAide,
  texteAideTableauNiveau1,
  texteAideTableauNiveau2,
} from "../ui/formatDispersion";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceDispersion } from "./EnonceDispersion";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauDispersion) => void;
}

/**
 * Écran 1 — "Tableau et sommes intermédiaires" : un champ produit (x_i-x̄)²·n_i PAR LIGNE, plus une
 * ligne finale "Σ" intégrant les deux totaux Σn_i/Σ(x_i-x̄)²·n_i — soumis ensemble en une seule
 * tentative (tout ou rien), même mécanique exacte que l'écran "Sommes" de "Moyenne pondérée"
 * (`EtapeSommesMoyennePonderee.tsx`).
 */
export function EtapeTableauDispersion({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [produits, setProduits] = useState<string[]>(() => new Array(exercice.lignes.length).fill("") as string[]);
  const [sommeN, setSommeN] = useState("");
  const [sommeProduits, setSommeProduits] = useState("");

  function modifierProduit(index: number, valeur: string) {
    setProduits(produits.map((p, i) => (i === index ? valeur : p)));
  }

  const complet = produits.every((p) => p.trim() !== "") && sommeN.trim() !== "" && sommeProduits.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerTableauDispersion(exercice, { produits, sommeN, sommeProduits }) : null;
  const statut =
    evaluation &&
    (evaluation.produits.some((s) => s === "parse_error") || evaluation.sommeN === "parse_error" || evaluation.sommeProduits === "parse_error")
      ? "parse_error"
      : undefined;
  const ligneExempleSurlignee = niveauAide >= 2;
  const aide2 = texteAideTableauNiveau2(exercice);

  return (
    <div>
      <EnonceDispersion exercice={exercice} />
      <p className="prompt-text">{consigneTableau()}</p>

      <div className="tf-table-scroll">
        <table className="tf-table mp-table">
          <thead>
            <tr>
              <th>
                <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                <Katex expression={LABEL_PRODUIT} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => {
              const estExemple = ligneExempleSurlignee && index === INDEX_LIGNE_EXEMPLE;
              const erronee = evaluation !== null && evaluation.produits[index] !== "correct";
              return (
                <tr key={index}>
                  <td className={estExemple ? "is-surlignee" : undefined}>{ligne.valeur}</td>
                  <td className={estExemple ? "is-surlignee" : undefined}>{ligne.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_PRODUIT}
                      value={produits[index]}
                      onChange={(e) => modifierProduit(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Produit de la ligne ${index + 1}`}
                    />
                  </td>
                </tr>
              );
            })}
            <tr className="mp-ligne-totaux">
              <td>Σ</td>
              <td>
                <input
                  className={`text-input${evaluation && evaluation.sommeN !== "correct" ? " is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_SOMME_N}
                  value={sommeN}
                  onChange={(e) => setSommeN(filtrerSaisieNumerique(e.target.value))}
                  onKeyDown={gererKeyDownNumerique}
                  aria-label="Somme des effectifs"
                />
              </td>
              <td>
                <input
                  className={`text-input${evaluation && evaluation.sommeProduits !== "correct" ? " is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_SOMME_PRODUIT}
                  value={sommeProduits}
                  onChange={(e) => setSommeProduits(filtrerSaisieNumerique(e.target.value))}
                  onKeyDown={gererKeyDownNumerique}
                  aria-label="Somme des produits"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideTableauNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_TABLEAU} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_TABLEAU)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ produits, sommeN, sommeProduits })}
      >
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
