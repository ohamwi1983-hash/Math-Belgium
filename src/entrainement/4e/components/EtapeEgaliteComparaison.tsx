import { useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import { aideEgaliteComparaison, vecteursAffichesComparaison } from "../ui/formatComparaisonVecteurs";
import { diagnostiquerEgalite } from "../moteur/verificationComparaisonVecteurs";
import { formatMessageErreur } from "../ui/messageErreur";
import { NIVEAU_AIDE_MAX_COMPARAISON } from "../moteur/typesComparaisonVecteurs";
import { BoutonAide } from "./BoutonAide";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceComparaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Dernière étape : écris l'égalité reliant `cibleEgalite` à `labelReference` (ex. `c = 2h`). */
export function EtapeEgaliteComparaison({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerEgalite(exercice, texte) : undefined;
  const erronee = statut !== undefined && statut !== "correct";
  const { points, vecteurs, viewBox } = vecteursAffichesComparaison(exercice, [exercice.cibleEgalite]);

  return (
    <div>
      <VecteurGraph points={points} vecteurs={vecteurs} masquerAxes pasGrille={1} viewBoxFixe={viewBox} />
      <p className="prompt-text">
        Écris l'égalité reliant <Katex expression={`\\vec{${exercice.cibleEgalite}}`} /> à{" "}
        <Katex expression={`\\vec{${exercice.labelReference}}`} />.
      </p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="comparaison-egalite">
          Ton égalité
        </label>
        <input
          id="comparaison-egalite"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : u = 3v"
          readOnly={Boolean(validation)}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>
      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aideEgaliteComparaison(exercice, niveauAide).map((ligne, i) => (
            <p key={i}>
              <SegmentsInline segments={ligne} />
            </p>
          ))}
        </div>
      )}

      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_COMPARAISON.egalite} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && statut !== "parse_error" && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
