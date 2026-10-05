import { useState } from "react";
import type { ExerciceCaracteristiquesFonction, ReponseZerosCaracteristiques } from "../core/caracteristiquesFonction.types";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";

type Choix = "aucun" | "auMoinsUn";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseZerosCaracteristiques) => void;
}

/**
 * Étape "zéros" (question b, refonte point 2) : le nombre de zéros est désormais détecté
 * dynamiquement à la génération (0 à 5 selon l'exercice) — choix binaire "aucun zéro"/"au moins
 * un zéro", puis une liste extensible de champs libres (bouton "+") si "au moins un" — jamais
 * fixé à deux champs z1/z2 comme avant la refonte.
 */
export function EtapeZerosCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): ReponseZerosCaracteristiques | null {
    if (choix === "aucun") return { aucun: true, valeurs: [] };
    if (choix === "auMoinsUn") {
      const nombres = valeurs.map((v) => Number(v.trim().replace(",", ".")));
      if (valeurs.some((v) => v.trim() === "") || nombres.some((n) => !Number.isFinite(n))) return null;
      return { aucun: false, valeurs: nombres };
    }
    return null;
  }

  const reponse = construireReponse();

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} />
      <p className="prompt-text">Quels sont les zéros de cette fonction ?</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucun" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucun")}>
          Aucun zéro
        </button>
        <button
          type="button"
          className={choix === "auMoinsUn" ? "btn toggle-active" : "btn"}
          onClick={() => choisir("auMoinsUn")}
        >
          Au moins un zéro
        </button>
      </div>

      {choix === "auMoinsUn" && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className="text-input"
                value={valeur}
                onChange={(e) => modifierChamp(index, filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
                placeholder={`zéro ${index + 1}`}
                aria-label={`Zéro ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le zéro ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
            + Ajouter un zéro
          </button>
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
