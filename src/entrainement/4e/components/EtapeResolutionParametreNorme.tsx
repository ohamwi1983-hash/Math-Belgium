import { useState } from "react";
import type { ExerciceParametreNorme } from "../core/normeDistance.types";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import { PLACEHOLDER_SOLUTION_X, TEXTE_AIDE_METHODE_RESOLUTION_QUADRATIQUE, formatDiscriminantLatex, formatEquationReduiteParametreNormeLatex, formatTermesEnonceParametreLatex, segmentsConsigneParametre } from "../ui/formatNormeDistance";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

type Choix = "aucune" | "auMoins";

interface Props {
  exercice: ExerciceParametreNorme;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeurs: number[]) => void;
}

/**
 * Écran "résolution" — variante 5, écran 2 (dernier) : consigne générale + bloc de données
 * redondant (vecteur v et sa norme cible) + le bloc violet existant, devenu conceptuellement le
 * bloc "état actuel" (aucun changement structurel, juste une clarification de rôle —
 * `promptgen26refontecomplete.md`, Partie C). Interface "add-as-needed" (0, 1 ou 2 champs selon le
 * nombre de solutions réelles, jamais un nombre fixe) — même patron que `EtapeZerosAlgebrique.tsx`,
 * plafonné à 2 champs (jamais plus, cette équation ne peut structurellement pas avoir plus de 2
 * solutions réelles). Aide à 2 niveaux : rappel de la méthode (discriminant), puis la valeur du
 * discriminant déjà calculée (racines non extraites).
 */
export function EtapeResolutionParametreNorme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const max = NIVEAU_AIDE_MAX.resolutionParametreNorme;

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    if (valeurs.length >= 2) return;
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): number[] | null {
    if (choix === "aucune") return [];
    if (choix === "auMoins") {
      if (valeurs.some((v) => v.trim() === "")) return null;
      return valeurs.map((v) => Number(v.replace(",", ".")));
    }
    return null;
  }

  const reponse = construireReponse();
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneParametre(exercice)} />
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceParametreLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <div className="equation-box">
        <Katex expression={formatEquationReduiteParametreNormeLatex(exercice)} />
      </div>
      <p className="prompt-text">Résous cette équation.</p>

      <div className="options-grid">
        <button type="button" className={choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucune")}>
          Aucune solution
        </button>
        <button type="button" className={choix === "auMoins" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoins")}>
          Au moins une solution
        </button>
      </div>

      {choix === "auMoins" && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_SOLUTION_X}
                value={valeur}
                onChange={(e) => modifierChamp(index, filtrerSaisieNumerique(e.target.value))}
                onKeyDown={gererKeyDownNumerique}
                aria-label={`Solution ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la solution ${index + 1}`} onClick={() => retirerChamp(index)}>
                  ×
                </button>
              )}
            </div>
          ))}
          {valeurs.length < 2 && (
            <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
              + Ajouter une solution
            </button>
          )}
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_METHODE_RESOLUTION_QUADRATIQUE}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatDiscriminantLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      {max > 0 && (
        <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />
      )}

      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse !== null && onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
