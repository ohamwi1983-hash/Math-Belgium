import { useState } from "react";
import type { ExerciceOrthogonaliteParametre } from "../core/orthogonalite.types";
import { diagnostiquerResolutionParametre } from "../moteur/verificationOrthogonalite";
import { PLACEHOLDER_SOLUTION_X, consigneGlobaleOrthogonalite, formatEnonceLatex, formatEquationReduiteParametreLatex } from "../ui/formatOrthogonalite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceOrthogonaliteParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (valeur: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "résolution" — variante 2, écran 2 (dernière phase). Depuis
 * `promptcorrectionsgenerateur25lot3.md`, point 1 : cette variante garantit toujours exactement une
 * solution (voir `core/orthogonalite.types.ts` — `solutionX` jamais `null`), donc l'aide générique
 * de résolution (méthode d'isolement de x) est retirée — **aucun bouton "Aide"**
 * (`NIVEAU_AIDE_MAX.resolutionParametre = 0` — même convention que "resolution"/"resolutionAvecX" du
 * générateur 24 : un écran à `max=0` n'affiche jamais de bouton, jamais un bouton perpétuellement
 * désactivé).
 *
 * `promptgen25modificationscompletes.md` : bloc de données redondant (composantes de $\vec u$/
 * $\vec v$, `formatEnonceLatex`) ajouté au-dessus — le bloc violet existant (équation réduite
 * validée à l'écran précédent) devient conceptuellement le bloc "état actuel", aucun changement
 * structurel de son propre rendu.
 */
export function EtapeResolutionParametreOrthogonalite({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const valeur = Number(texte.replace(",", "."));
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerResolutionParametre(exercice, valeur) : undefined;
  const consigneGlobale = consigneGlobaleOrthogonalite(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobale}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <div className="equation-box">
        <Katex expression={formatEquationReduiteParametreLatex(exercice)} />
      </div>
      <p className="prompt-text">Résous cette équation.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="orthogonalite-resolution-x">
          x =
        </label>
        <input disabled={!!validation}
          id="orthogonalite-resolution-x"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SOLUTION_X}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
