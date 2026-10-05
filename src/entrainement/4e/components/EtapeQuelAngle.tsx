import { useState } from "react";
import { Katex } from "./Katex";
import type { ExerciceQuelAngle, ReponseQuelAngle } from "../core/quelAngle.types";
import { diagnostiquerReponseQuelAngle } from "../moteur/verificationQuelAngle";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { DOMAINE_LATEX, formatEnonceLatex } from "../ui/formatQuelAngle";
import { AideQuelAngle } from "./AideQuelAngle";

type Choix = "aucune" | "auMoinsUne";

interface Props {
  exercice: ExerciceQuelAngle;
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQuelAngle) => void;
}

/**
 * Écran unique de "Quel angle ?" (spec, "Points à clarifier" — structure mono-écran confirmée) :
 * bloc énoncé fixe, puis l'interface "add-as-needed" (pattern déjà en place, voir
 * `EtapeZerosCaracteristiques.tsx`), puis l'aide UNIQUE (`promptcorrectionsgenerateur18aideunique.md`
 * — remplace les 3 aides progressives d'origine), positionnée sous le champ de réponse et
 * au-dessus du bouton "Valider" — même emplacement que le bouton "Aide" des autres générateurs de
 * la plateforme (ex. `EtapeValeursExactesVR.tsx`, générateur 15).
 *
 * Le bouton "Valider" ne se désactive QUE sur une réponse structurellement incomplète (choix non
 * fait, ou un champ vide) — contrairement à `EtapeZerosCaracteristiques.tsx`, une valeur non
 * numérique (ex. un simple "-") reste soumissible : c'est précisément ce cas que le statut à 3
 * valeurs (`parse_error`) doit détecter, jamais bloqué en amont par le bouton lui-même.
 */
export function EtapeQuelAngle({ exercice, tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider }: Props) {
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
    setValeurs(valeurs.map((v, i) => (i === index ? filtrerSaisieNumerique(valeur) : v)));
  }

  function construireReponse(): ReponseQuelAngle | null {
    if (choix === "aucune") return { aucune: true, valeurs: [] };
    if (choix === "auMoinsUne") {
      if (valeurs.some((v) => v.trim() === "")) return null;
      return { aucune: false, valeurs: valeurs.map((v) => Number(v.trim().replace(",", "."))) };
    }
    return null;
  }

  const reponse = construireReponse();
  const statut = reponse !== null ? diagnostiquerReponseQuelAngle(exercice, reponse) : undefined;

  return (
    <div>
      <p className="prompt-text">Trouve toutes les valeurs de α satisfaisant cette équation.</p>
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} block />
        <Katex expression={`\\alpha \\in ${DOMAINE_LATEX}`} block />
      </div>

      <p className="prompt-text">Combien de solutions et lesquelles ?</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucune")}>
          Pas de solution
        </button>
        <button type="button" className={choix === "auMoinsUne" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoinsUne")}>
          Au moins une solution
        </button>
      </div>

      {choix === "auMoinsUne" && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className={`text-input${tentativesUtilisees > 0 && statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
                value={valeur}
                onChange={(e) => modifierChamp(index, e.target.value)}
                onKeyDown={gererKeyDownNumerique}
                placeholder={`solution ${index + 1} (degrés)`}
                aria-label={`Solution ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer la solution ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
            + Ajouter une solution
          </button>
        </div>
      )}

      <AideQuelAngle exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

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
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
