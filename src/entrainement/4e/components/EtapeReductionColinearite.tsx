import { useState } from "react";
import type { ExerciceColinearParametre, ExerciceColinearParametreCarre, ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { diagnostiquerReductionAvecX } from "../moteur/verificationColinearite";
import { CONSIGNE_REDUCTION_AVEC_X, PLACEHOLDER_EQUATION_REDUITE, consigneGlobaleColinearite, formatEnonceLatex, formatTermesEnoncePointsParametreLatex } from "../ui/formatColinearite";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesReductionColinearite, messageReductionColinearite, reductionColineariteLisible } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceColinearParametre | ExerciceColinearParametreCarre | ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « relation réduite » de gen24 (« paramètre », « paramètre au carré », « alignement avec
 * x ») : un seul champ libre, l'équation réduite complète (toute équation proportionnelle acceptée,
 * `diagnostiquerFormeCanonique`). Règles communes (audit 4e ch. 6, lot B) : équation illisible sans
 * tentative, message ciblé (orthogonalité confondue, somme au lieu de différence), aides à deux
 * niveaux (critère, puis critère substitué).
 */
export function EtapeReductionColinearite({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const complet = texte.trim() !== "";
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const erronee = jugee !== null && diagnostiquerReductionAvecX(exercice, jugee) !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGlobaleColinearite(exercice)}
        blocDonnees={
          exercice.variante === "pointsParametre" ? (
            <div className="equation-box equation-box-termes">
              {formatTermesEnoncePointsParametreLatex(exercice).map((t, i) => (
                <Katex key={i} expression={t} />
              ))}
            </div>
          ) : (
            <div className="equation-box">
              <Katex expression={formatEnonceLatex(exercice)} />
            </div>
          )
        }
      />
      <p className="prompt-text">{CONSIGNE_REDUCTION_AVEC_X}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-reduction-equation">
          Équation =
        </label>
        <input
          disabled={!!validation}
          id="colinearite-reduction-equation"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION_REDUITE}
          value={texte}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesReductionColinearite(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={() => texte}
          lisible={() => reductionColineariteLisible(exercice, texte)}
          onValider={onValider}
          texteIllisible={ILLISIBLE_VECTEURS.equationX}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(t) => messageReductionColinearite(exercice, t)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
