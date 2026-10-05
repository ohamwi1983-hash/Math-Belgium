import { useState } from "react";
import type { ExerciceCaracteristiquesFonction, ReponseExistence } from "../core/caracteristiquesFonction.types";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { verifierOrdonneeCaracteristiques } from "../moteur/verificationCaracteristiquesFonction";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";

type Choix = "nExistePas" | "existe";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseExistence) => void;
}

/**
 * Étape "ordonnée à l'origine" (question d, refonte point 6) : le domaine pouvant désormais
 * exclure un intervalle contenant x=0, l'ordonnée à l'origine peut ne pas exister — choix binaire
 * "pas d'ordonnée à l'origine"/"il y en a une", champ numérique seulement dans le second cas.
 */
export function EtapeOrdonneeCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeur, setValeur] = useState("");

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeur("");
  }

  const nombre = Number(valeur.trim().replace(",", "."));
  const reponse: ReponseExistence | null =
    choix === "nExistePas"
      ? { existe: false, valeur: null }
      : choix === "existe" && valeur.trim() !== "" && Number.isFinite(nombre)
        ? { existe: true, valeur: nombre }
        : null;
  const champErrone =
    tentativesUtilisees > 0 && choix === "existe" && (reponse === null || !verifierOrdonneeCaracteristiques(exercice, reponse));

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} />
      <p className="prompt-text">Quelle est l'ordonnée à l'origine de cette fonction ? (arrondi au centième accepté si besoin)</p>
      <div className="options-grid">
        <button type="button" className={choix === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisir("nExistePas")}>
          Pas d'ordonnée à l'origine
        </button>
        <button type="button" className={choix === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisir("existe")}>
          Il y en a une
        </button>
      </div>
      {choix === "existe" && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule" htmlFor="caract-ordonnee">
            f(0) =
          </label>
          <input
            id="caract-ordonnee"
            className={`text-input${champErrone ? " is-erronee" : ""}`}
            value={valeur}
            onChange={(e) => setValeur(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
