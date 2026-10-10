import { useState } from "react";
import type { ExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import type { ReponseSommes } from "../moteur/verificationMoyennePonderee";
import { diagnostiquerSommes } from "../moteur/verificationMoyennePonderee";
import { NIVEAU_AIDE_MAX_SOMMES } from "../moteur/sessionMoyennePonderee";
import { CONSIGNE_SOMMES, INDEX_LIGNE_EXEMPLE, LABEL_EFFECTIF_NI, LABEL_PRODUIT_XN, LABEL_VALEUR_XI, PLACEHOLDER_PRODUIT, PLACEHOLDER_SOMME_N, PLACEHOLDER_SOMME_XN, texteAideSommesNiveau1, texteAideSommesNiveau2 } from "../ui/formatMoyennePonderee";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMoyennePonderee } from "./EnonceMoyennePonderee";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceMoyennePonderee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommes) => void;
}

/** Valeur (variante "discrete") ou centre CONFIRMÉ (variante "classes") de chaque ligne, sous la
 * forme générique (x, n) — jamais resaisi, toujours la vraie donnée de l'exercice. */
function lignes(exercice: ExerciceMoyennePonderee): { x: number; n: number }[] {
  if (exercice.variante === "discrete") {
    return exercice.lignes.map((l) => ({ x: l.valeur, n: l.effectif }));
  }
  return exercice.classes.map((c) => ({ x: c.centre, n: c.effectif }));
}

/**
 * Écran "sommes" (commun aux 2 variantes) : un champ produit xᵢ·nᵢ PAR LIGNE, plus une ligne finale
 * "Σ" intégrant les deux totaux Σ(xᵢ·nᵢ)/Σnᵢ — soumis ensemble en une seule tentative (tout ou
 * rien), pour isoler une erreur localisée à une seule ligne d'une erreur sur les totaux
 * (`promptgen32modifications.md`, point 3 — remplace les 2 champs externes d'origine).
 *
 * Le tableau de référence (données déjà données/confirmées, jamais resaisi) rappelle x_i/n_i pour
 * chaque ligne — variante "discrete" : les valeurs de l'énoncé ; variante "classes" : les centres
 * CONFIRMÉS à l'écran "centres" (jamais recalculés indépendamment) — la colonne "Classe" est
 * retirée de cet écran, les centres $x_i$ suffisant déjà. **En-têtes toujours abrégés (symbole
 * seul, jamais "Valeur "/"Effectif ")** pour les 2 variantes, y compris "discrete"
 * (`promptgen32corrections2.md`, point 1 — déroge à la convention transversale "entier à la
 * première apparition" pour cette seule paire d'en-têtes sur cet écran).
 */
export function EtapeSommesMoyennePonderee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const donnees = lignes(exercice);
  const [produits, setProduits] = useState<string[]>(() => new Array(donnees.length).fill("") as string[]);
  const [sommeXN, setSommeXN] = useState("");
  const [sommeN, setSommeN] = useState("");

  function modifierProduit(index: number, valeur: string) {
    setProduits(produits.map((p, i) => (i === index ? valeur : p)));
  }

  const complet = produits.every((p) => p.trim() !== "") && sommeXN.trim() !== "" && sommeN.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerSommes(exercice, { produits, sommeXN, sommeN }) : null;
  const statut =
    evaluation &&
    (evaluation.produits.some((s) => s === "parse_error") || evaluation.sommeXN === "parse_error" || evaluation.sommeN === "parse_error")
      ? "parse_error"
      : undefined;
  const ligneExempleSurlignee = niveauAide >= 2;

  return (
    <div>
      <EnonceMoyennePonderee exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_SOMMES}</p>

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
                <Katex expression={LABEL_PRODUIT_XN} />
              </th>
            </tr>
          </thead>
          <tbody>
            {donnees.map(({ x, n }, index) => {
              const estExemple = ligneExempleSurlignee && index === INDEX_LIGNE_EXEMPLE;
              const erronee = evaluation !== null && evaluation.produits[index] !== "correct";
              return (
                <tr key={index}>
                  <td className={estExemple ? "is-surlignee" : undefined}>{x}</td>
                  <td className={estExemple ? "is-surlignee" : undefined}>{n}</td>
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
                  className={`text-input${evaluation && evaluation.sommeXN !== "correct" ? " is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_SOMME_XN}
                  value={sommeXN}
                  onChange={(e) => setSommeXN(filtrerSaisieNumerique(e.target.value))}
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
            <SegmentsInline segments={texteAideSommesNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={texteAideSommesNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_SOMMES} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ produits, sommeXN, sommeN })}>
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
