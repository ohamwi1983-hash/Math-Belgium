import { useState } from "react";
import type { ExerciceIsocele } from "../core/normeDistance.types";
import type { ReponseClassificationIsocele } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_ISOCELE, OPTIONS_NATURE_TRIANGLE, SOMMETS_ISOCELE, composerClassificationIsocele, formatTermesDonneesIsoceleLatex, type NatureTriangle } from "../ui/formatNormeDistance";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux } from "./RetourSaisie";
import { aidesConclusionIsocele } from "../ui/retoursVecteurs3";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceIsocele;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseClassificationIsocele) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "conclusion" — variante 4, écran 3 (dernier) : consigne générale + bloc de données
 * redondant (les 3 vecteurs/longueurs confirmés aux écrans 1/2, listés dans le récapitulatif
 * "Ce qu'on sait déjà") + choix en 2 temps
 * (`promptgen26refontecomplete.md`, Partie D) : nature du triangle (Isocèle/Scalène), puis si
 * "Isocèle", le sommet (A/B/C) — l'option "Équilatéral" a été retirée entièrement (piège
 * volontairement abandonné). Aide à 1 niveau : définition des 2 natures.
 */
export function EtapeConclusionIsocele({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [nature, setNature] = useState<NatureTriangle | null>(null);
  const [sommet, setSommet] = useState<"A" | "B" | "C" | null>(null);

  function choisirNature(n: NatureTriangle) {
    setNature(n);
    setSommet(null);
  }

  const reponse = nature === null ? null : composerClassificationIsocele(nature, sommet);
  const complet = reponse !== null;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ISOCELE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">Ce triangle est :</p>

      <div className="options-grid-compact">
        {OPTIONS_NATURE_TRIANGLE.map((option) => (
          <button disabled={!!validation} key={option.valeur} type="button" className={nature === option.valeur ? "btn toggle-active" : "btn"} onClick={() => choisirNature(option.valeur)}>
            {option.libelle}
          </button>
        ))}
      </div>

      {nature === "isocele" && (
        <>
          <p className="prompt-text contenu-conditionnel">en</p>
          <div className="options-grid-compact">
            {SOMMETS_ISOCELE.map((s) => (
              <button disabled={!!validation} key={s} type="button" className={sommet === s ? "btn toggle-active" : "btn"} onClick={() => setSommet(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {!validation && (
        <>
          {/* Choix fermé : une tentative (moteur) ; aides à deux niveaux (audit 4e ch. 6, lot B). */}
          <AidesNiveaux aides={aidesConclusionIsocele(exercice)} onPremiereAide={onActiverAide} />

          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => reponse !== null && onValider(reponse)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
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
