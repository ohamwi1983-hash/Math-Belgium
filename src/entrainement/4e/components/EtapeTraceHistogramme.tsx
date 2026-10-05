import { useState } from "react";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import type { ReponseTrace } from "../moteur/verificationHistogramme";
import { evaluerTrace } from "../moteur/verificationHistogramme";
import { NIVEAU_AIDE_MAX_TRACE } from "../moteur/sessionHistogramme";
import {
  CONSIGNE_TRACE,
  LABEL_CLASSE_XI,
  LABEL_EFFECTIF_NI,
  LABEL_FREQUENCE_FI,
  formatClasseTexte,
  libelleBoutonAide,
  texteAideTraceNiveau1,
} from "../ui/formatHistogramme";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceHistogramme } from "./EnonceHistogramme";
import { HistogrammeGraph } from "./HistogrammeGraph";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceHistogramme;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTrace) => void;
}

/**
 * Écran final — "Tracer l'histogramme" (les 2 variantes) : grille avec axe X déjà gradué selon les
 * bornes de classes (fixe, non interactif). Chaque barre démarre à hauteur 0 — l'élève doit glisser
 * verticalement pour lui donner sa hauteur, accrochée sur la grille entière (`HistogrammeGraph`).
 * Aucune notion de "champ vide" ici (contrairement aux écrans à saisie libre) : "Valider" reste
 * toujours actif, une hauteur encore à 0 étant simplement une réponse — comme n'importe quelle
 * autre — pas encore correcte (chaque effectif/fréquence réel est toujours strictement positif par
 * construction, jamais 0).
 *
 * **Bouton "?" — rappel du tableau** (`promptgen31corrections.md`, points 3-4) : fermé par défaut
 * (état local, aucun lien avec le moteur — même patron que le "?" de "Transformations
 * graphiques"), toggle un rappel en lecture seule du tableau classe/effectif (variante "effectif")
 * ou classe/fréquence (variante "frequence") — toujours dérivé de `exercice.classes` (la vérité
 * confirmée), jamais de la saisie de l'élève.
 *
 * **En-têtes indiciels KaTeX** (`promptinvestigationpoint3latexmobile.md`) : $x_i$/$n_i$/$f_i$ tous
 * en forme ABRÉGÉE — déjà introduits en toutes lettres sur un écran précédent de la séquence
 * ("Classement" pour $x_i$/$n_i$ ; "Fréquences" pour $f_i$, variante "frequence" uniquement) —
 * mesuré à 375px sans aucun débordement.
 */
export function EtapeTraceHistogramme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [hauteurs, setHauteurs] = useState<number[]>(() => new Array(exercice.classes.length).fill(0) as number[]);
  const [rappelOuvert, setRappelOuvert] = useState(false);

  function modifier(index: number, hauteur: number) {
    setHauteurs((precedent) => precedent.map((h, i) => (i === index ? hauteur : h)));
  }

  const apresEchec = tentativesUtilisees > 0;
  const correction = apresEchec ? evaluerTrace(exercice, hauteurs) : null;
  const erronees = correction ? correction.map((correct) => !correct) : exercice.classes.map(() => false);

  return (
    <div>
      <EnonceHistogramme exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_TRACE}</p>

      <div className="transformation-entete">
        <button
          type="button"
          className="btn btn-terminologie"
          onClick={() => setRappelOuvert((v) => !v)}
          aria-label="Rappel du tableau"
        >
          ?
        </button>
      </div>
      {rappelOuvert && (
        <div className="tf-table-scroll contenu-conditionnel">
          <table className="tf-table">
            <thead>
              <tr>
                <th>
                  <Katex expression={LABEL_CLASSE_XI} />
                </th>
                <th>
                  {exercice.variante === "frequence" ? (
                    <>
                      <Katex expression={LABEL_FREQUENCE_FI} /> (%)
                    </>
                  ) : (
                    <Katex expression={LABEL_EFFECTIF_NI} />
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {exercice.classes.map((classe, index) => (
                <tr key={index}>
                  <td>{formatClasseTexte(exercice, index)}</td>
                  <td>{exercice.variante === "frequence" ? `${classe.frequencePourcent} %` : classe.effectif}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <HistogrammeGraph exercice={exercice} hauteurs={hauteurs} erronees={erronees} onChangerHauteur={modifier} />

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideTraceNiveau1(exercice, correction)}</p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_TRACE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_TRACE)}
      </button>

      <button type="button" className="btn btn-primary" onClick={() => onValider(hauteurs)}>
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
