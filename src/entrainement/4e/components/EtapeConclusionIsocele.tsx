import { useState } from "react";
import type { ExerciceIsocele } from "../core/normeDistance.types";
import type { ReponseClassificationIsocele } from "../moteur/verificationNormeDistance";
import { NIVEAU_AIDE_MAX } from "../moteur/typesNormeDistance";
import {
  CONSIGNE_GENERALE_ISOCELE,
  OPTIONS_NATURE_TRIANGLE,
  SOMMETS_ISOCELE,
  TEXTE_AIDE_ISOCELE_SCALENE,
  composerClassificationIsocele,
  formatEtatActuelLongueursIsoceleLatex,
  formatTermesDonneesIsoceleLatex,
  libelleBoutonAide,
  type NatureTriangle,
} from "../ui/formatNormeDistance";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceIsocele;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseClassificationIsocele) => void;
}

/**
 * Écran "conclusion" — variante 4, écran 3 (dernier) : consigne générale + bloc de données
 * redondant + bloc "état actuel" (les 3 longueurs confirmées à l'écran 2) + choix en 2 temps
 * (`promptgen26refontecomplete.md`, Partie D) : nature du triangle (Isocèle/Scalène), puis si
 * "Isocèle", le sommet (A/B/C) — l'option "Équilatéral" a été retirée entièrement (piège
 * volontairement abandonné). Aide à 1 niveau : définition des 2 natures.
 */
export function EtapeConclusionIsocele({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [nature, setNature] = useState<NatureTriangle | null>(null);
  const [sommet, setSommet] = useState<"A" | "B" | "C" | null>(null);
  const max = NIVEAU_AIDE_MAX.conclusionIsocele;

  function choisirNature(n: NatureTriangle) {
    setNature(n);
    setSommet(null);
  }

  const reponse = nature === null ? null : composerClassificationIsocele(nature, sommet);
  const complet = reponse !== null;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ISOCELE}</p>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </div>
      <EtatActuelPanel latex={formatEtatActuelLongueursIsoceleLatex(exercice)} />
      <p className="prompt-text">Ce triangle est :</p>

      <div className="options-grid-compact">
        {OPTIONS_NATURE_TRIANGLE.map((option) => (
          <button key={option.valeur} type="button" className={nature === option.valeur ? "btn toggle-active" : "btn"} onClick={() => choisirNature(option.valeur)}>
            {option.libelle}
          </button>
        ))}
      </div>

      {nature === "isocele" && (
        <>
          <p className="prompt-text contenu-conditionnel">en</p>
          <div className="options-grid-compact">
            {SOMMETS_ISOCELE.map((s) => (
              <button key={s} type="button" className={sommet === s ? "btn toggle-active" : "btn"} onClick={() => setSommet(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_ISOCELE_SCALENE}</p>
        </div>
      )}
      {max > 0 && (
        <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
          {libelleBoutonAide(niveauAide, max)}
        </button>
      )}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => reponse !== null && onValider(reponse)}>
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
