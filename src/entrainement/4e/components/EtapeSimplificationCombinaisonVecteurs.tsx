import { useState } from "react";
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import { diagnostiquerSimplification } from "../moteur/verificationCombinaisonVecteurs";
import { NIVEAU_AIDE_MAX_SIMPLIFICATION } from "../moteur/sessionCombinaisonVecteurs";
import { formatConvertiLatex, formatDistribueLatex, formatResultatLatex, formatTermesDonneesLatex, formatTermesExpressionLatex, idsConcernesRegroupementLatex, placeholderReduction, vecteursPresentsLatex } from "../ui/formatCombinaisonVecteurs";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceCombinaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/**
 * Écran 1 — un champ de saisie libre UNIQUE (`promptcorrectionsgenerateur21notationinterface.md`,
 * correction 4 — remplace l'interface "add-as-needed" d'une réécriture précédente) : l'élève écrit
 * directement l'expression réduite complète en une seule fois (ex. `-3u+3v+12AB`), jamais un champ
 * numérique par vecteur. Toujours la première étape, jamais de récapitulatif ici.
 *
 * Consigne dynamique (correction 3) : liste uniquement les vecteurs RÉELLEMENT présents dans
 * l'expression brute de l'énoncé (`vecteursPresentsLatex`), jamais `baseCanonique` tout entier — un
 * vecteur candidat peut ne jamais apparaître dans cet exercice précis.
 *
 * 3 niveaux d'aide progressive, texte uniquement (aucun croquis — un vecteur libre n'a pas de
 * position, un rendu graphique suggérerait à tort qu'il en a une) : distribution des coefficients
 * externes, puis identification des vecteurs concernés par un regroupement/une conversion, puis la
 * conversion `\vec{BA}\to-\vec{AB}` elle-même — jamais le coefficient final avant le niveau 3, et
 * même alors pas encore regroupé (l'addition reste à faire).
 *
 * `promptmodificationsgenerateur22.md` : bloc de données (vecteurs libres + points) ET énoncé
 * passés en "bloc fitter" (`formatTermesDonneesLatex`/`formatTermesExpressionLatex`, un fragment
 * KaTeX par vecteur/point/groupe) — jamais un unique bloc `\quad`-joined qui ne retourne jamais à la
 * ligne sur mobile étroit.
 */
export function EtapeSimplificationCombinaisonVecteurs({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerSimplification(exercice, texte) : undefined;
  const vecteursConsigne = vecteursPresentsLatex(exercice);
  const idsAides = niveauAide >= 2 ? idsConcernesRegroupementLatex(exercice) : [];

  return (
    <div>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <p className="prompt-text">
        Calcule et réduis l'expression suivante en fonction des vecteurs{" "}
        {vecteursConsigne.map((latex, i) => (
          <span key={latex}>
            {i > 0 && ", "}
            <Katex expression={latex} />
          </span>
        ))}
        .
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesExpressionLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="combinaison-simplification">
          <Katex expression={`${formatResultatLatex(exercice)} =`} />
        </label>
        <input
          id="combinaison-simplification"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={placeholderReduction(exercice)}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={formatDistribueLatex(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              On regroupe les vecteurs :{" "}
              {idsAides.map((latex, i) => (
                <span key={latex}>
                  {i > 0 && " et "}
                  <Katex expression={latex} />
                </span>
              ))}
            </p>
          )}
          {niveauAide >= 3 && (
            <p>
              <Katex expression={formatConvertiLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_SIMPLIFICATION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
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
