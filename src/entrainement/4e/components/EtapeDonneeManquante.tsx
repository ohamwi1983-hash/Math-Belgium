import { useState } from "react";
import type { ExerciceTriangleQuelconque, UniteLongueur } from "../core/triangleQuelconque.types";
import { diagnostiquerDonneeManquante } from "../moteur/verificationTriangleQuelconque";
import { consigneDonneeManquante, estCote, labelChampDonneeManquante, NOMBRE_NIVEAUX_AIDE_DONNEE_MANQUANTE, OPTIONS_UNITE_LONGUEUR, optionsCroquisDonneeManquante, placeholderDonneeManquante, textesAideDonneeManquante, valeursTriangleSketchDonneeManquante } from "../ui/formatTriangleQuelconque";
import { calculerTriangleQuelconqueSketch } from "../ui/triangleQuelconqueSketch";
import { TriangleQuelconqueSketch } from "./TriangleQuelconqueSketch";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTriangleQuelconque;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number, unite: UniteLongueur | null) => void;
}

/** Écran 1 — retrouver la donnée manquante (côté ou angle, selon la configuration) via la loi
 * applicable. Toujours la première étape de l'exercice — aucun récapitulatif ici, rien à
 * récapituler avant elle (même convention que le reste du projet).
 *
 * **Menu déroulant d'unité** (`promptcorrectionsgenerateur19unitesnotation.md`, point 3) — affiché
 * uniquement quand la donnée manquante est un côté (`estCote`, jamais pour un angle en degrés, qui
 * n'a pas d'unité) ; aucune valeur présélectionnée (`""`, même convention "pas de biais par défaut"
 * que les crochets d'intervalle du reste du projet — l'élève doit choisir activement). */
export function EtapeDonneeManquante({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const [unite, setUnite] = useState<UniteLongueur | "">("");

  const donneeEstCote = estCote(exercice.donneeManquante);
  const uniteChoisie: UniteLongueur | null = unite === "" ? null : unite;
  const complet = texte.trim() !== "" && (!donneeEstCote || uniteChoisie !== null);
  const valeur = Number(texte.replace(",", "."));
  const statut = complet ? diagnostiquerDonneeManquante(exercice, valeur, uniteChoisie) : undefined;

  const croquis = calculerTriangleQuelconqueSketch(
    valeursTriangleSketchDonneeManquante(exercice),
    optionsCroquisDonneeManquante(exercice, niveauAide),
  );
  const textesAide = textesAideDonneeManquante(exercice, niveauAide);

  return (
    <div>
      <p className="prompt-text">{consigneDonneeManquante(exercice)}</p>
      <TriangleQuelconqueSketch croquis={croquis} />

      <div className="field">
        <label className="field-label" htmlFor="triangle-quelconque-donnee-manquante">
          {labelChampDonneeManquante(exercice)}
        </label>
        <div className="champ-avec-unite">
          <input
            id="triangle-quelconque-donnee-manquante"
            className={`text-input${tentativesUtilisees > 0 && statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
            placeholder={placeholderDonneeManquante(exercice)}
            value={texte}
            onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
          {donneeEstCote && (
            <select
              className="champ-avec-unite-select"
              aria-label="Unité"
              value={unite}
              onChange={(e) => setUnite(e.target.value as UniteLongueur | "")}
            >
              <option value="">Unité…</option>
              {OPTIONS_UNITE_LONGUEUR.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {textesAide.length > 0 && (
        <div className="triangle-quelconque-aide">
          {textesAide.map((texteAide) => (
            <p key={texteAide}>{texteAide}</p>
          ))}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NOMBRE_NIVEAUX_AIDE_DONNEE_MANQUANTE} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur, uniteChoisie)}>
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
