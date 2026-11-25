import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseTableauDispersion } from "../moteur/verificationDispersion";
import { diagnostiquerTableauDispersion, saisieIllisible } from "../moteur/verificationDispersion";
import { MESSAGE_SAISIE_ILLISIBLE } from "../ui/formatDispersion";
import { NIVEAU_AIDE_MAX_TABLEAU } from "../moteur/sessionDispersion";
import { INDEX_LIGNE_EXEMPLE, LABEL_EFFECTIF_NI, LABEL_PRODUIT, LABEL_VALEUR_XI, PLACEHOLDER_PRODUIT, PLACEHOLDER_SOMME_N, PLACEHOLDER_SOMME_PRODUIT, consigneTableau, texteAideTableauNiveau1, texteAideTableauNiveau2 } from "../ui/formatDispersion";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { nombreFrTypo } from "../ui/nombreFr";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  exercice: ExerciceDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauDispersion) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Décision de l'utilisateur « une saisie illisible ne consomme jamais de tentative » : `true`
   * (passé par `AppDispersion`, gen34) → une saisie illisible n'est pas envoyée, un message le dit.
   * Absent (exercice de synthèse gen35) → comportement historique inchangé. */
  saisieIllisibleNonComptee?: boolean;
}

/**
 * Écran 1 — "Tableau et sommes intermédiaires" : un champ produit (x_i-x̄)²·n_i PAR LIGNE, plus une
 * ligne finale "Σ" intégrant les deux totaux Σn_i/Σ(x_i-x̄)²·n_i — soumis ensemble en une seule
 * tentative (tout ou rien), même mécanique exacte que l'écran "Sommes" de "Moyenne pondérée"
 * (`EtapeSommesMoyennePonderee.tsx`).
 */
export function EtapeTableauDispersion({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation, saisieIllisibleNonComptee = false }: Props) {
  const [produits, setProduits] = useState<string[]>(() => new Array(exercice.lignes.length).fill("") as string[]);
  const [sommeN, setSommeNBrut] = useState("");
  const [sommeProduits, setSommeProduitsBrut] = useState("");
  const [illisible, setIllisible] = useState(false);

  function modifierProduit(index: number, valeur: string) {
    setIllisible(false);
    setProduits(produits.map((p, i) => (i === index ? valeur : p)));
  }
  function setSommeN(valeur: string) {
    setIllisible(false);
    setSommeNBrut(valeur);
  }
  function setSommeProduits(valeur: string) {
    setIllisible(false);
    setSommeProduitsBrut(valeur);
  }
  function valider() {
    if (saisieIllisibleNonComptee && [...produits, sommeN, sommeProduits].some(saisieIllisible)) {
      setIllisible(true);
      return;
    }
    onValider({ produits, sommeN, sommeProduits });
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
                  <td className={estExemple ? "is-surlignee" : undefined}>{nombreFrTypo(ligne.valeur)}</td>
                  <td className={estExemple ? "is-surlignee" : undefined}>{ligne.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_PRODUIT}
                      value={produits[index]}
                      onChange={(e) => modifierProduit(index, normaliserSigneMoins(e.target.value))}
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
                  onChange={(e) => setSommeN(normaliserSigneMoins(e.target.value))}
                  aria-label="Somme des effectifs"
                />
              </td>
              <td>
                <input
                  className={`text-input${evaluation && evaluation.sommeProduits !== "correct" ? " is-erronee" : ""}`}
                  placeholder={PLACEHOLDER_SOMME_PRODUIT}
                  value={sommeProduits}
                  onChange={(e) => setSommeProduits(normaliserSigneMoins(e.target.value))}
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
              <p><TexteInsistance texte={aide2.texte} /></p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_TABLEAU} onActiverAide={onActiverAide} />

        <button
          type="button"
          className="btn btn-primary"
          disabled={!complet}
          onClick={valider}
        >
          Valider
        </button>
        {illisible && (
          <p className="alert-error" role="alert">
            {MESSAGE_SAISIE_ILLISIBLE}
          </p>
        )}
        {!illisible && tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, saisieIllisibleNonComptee ? undefined : statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
