import { useState } from "react";
import type { ExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_JUSTIFICATION } from "../moteur/sessionPositionDroitePlan";
import { nomsPointsFigure, pointsFigureDansLePlan } from "../moteur/verificationPositionDroitePlan";
import { cibleSelectionIncluse, consigneJustification, indexCandidatJuste, libelleCandidatSecante, texteAideJustification, texteAideJustificationNiveau2 } from "../ui/formatPositionDroitePlan";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseJustificationPositionDroitePlan) => void;
  /** Présent une fois l'écran terminé (bonne réponse, choix faux jugé, ou tentatives épuisées) — gèle
   * la sélection, remplace "Valider" par le bloc `ValidationEcran`. */
  validation?: ValidationEtapeProps | null;
}

function memeSelection(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * Écran 2 — Justification structurée. L'interface s'adapte à `exercice.classification` (confirmée à
 * l'écran 1 et rappelée dans « Ce qu'on sait déjà ») :
 * - "incluse" → sélection de TOUS les points nommés de la figure qui sont dans le plan (cases
 *   carrées, trois tentatives : 2ⁿ sélections possibles, elle vaut un champ) ; message ciblé après une
 *   sélection fausse (point en trop / points manquants, sans dire lesquels) ; une fois l'écran clos,
 *   les points du plan en vert ✓ (même oubliés), ceux choisis à tort en rouge ✗ ;
 * - "parallele"/"secante" → choix fermé parmi des candidats, UNE tentative (audit 4e ch. 8, lot B,
 *   G1), jugé ✗ / ✓ et figé (`ui/choixFige.ts`), message propre au choix construit par l'appli.
 * Aides à deux niveaux : la propriété du cours, puis la méthode posée pour l'instance (jamais la
 * réponse). Jamais de texte libre.
 */
export function EtapeJustificationPositionDroitePlan({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [pointsChoisis, setPointsChoisis] = useState<string[]>([]);
  const [indexCandidat, setIndexCandidat] = useState<number | null>(null);
  const [soumis, setSoumis] = useState<string[] | null>(null);
  const gele = Boolean(validation);

  const tousLesPoints = nomsPointsFigure(exercice);
  const pointsDuPlan = pointsFigureDansLePlan(exercice);
  const bonIndex = indexCandidatJuste(exercice) ?? -1;
  const etatOptions = { selection: indexCandidat, choisie: gele ? indexCandidat : null, bonne: bonIndex };

  function basculerPoint(nom: string) {
    if (gele) return;
    setPointsChoisis((liste) => (liste.includes(nom) ? liste.filter((n) => n !== nom) : [...liste, nom]));
  }

  const complet = exercice.classification === "incluse" ? pointsChoisis.length >= 1 : indexCandidat !== null;

  function valider() {
    if (exercice.classification === "incluse") {
      if (pointsChoisis.length === 0) return;
      setSoumis(pointsChoisis);
      onValider({ type: "incluse", points: pointsChoisis });
    } else {
      if (indexCandidat === null) return;
      onValider({ type: exercice.classification, indexCandidat });
    }
  }

  /** Sélection soumise et refusée, inchangée depuis : ses cases restent marquées en rouge. */
  const selectionRefusee = !gele && tentativesUtilisees > 0 && soumis !== null && memeSelection(soumis, pointsChoisis);

  function classePoint(nom: string): string {
    const actif = pointsChoisis.includes(nom);
    if (gele) return pointsDuPlan.includes(nom) ? "btn is-juste" : actif ? "btn is-faux" : "btn";
    return `btn${actif ? " toggle-active" : ""}${selectionRefusee && actif ? " is-erronee" : ""}`;
  }

  function ariaPoint(nom: string): string | undefined {
    if (!gele) return undefined;
    const actif = pointsChoisis.includes(nom);
    if (pointsDuPlan.includes(nom)) return actif ? "choisi, juste" : "dans le plan, oublié";
    return actif ? "choisi à tort" : undefined;
  }

  return (
    <div>
      <p className="prompt-text">{consigneJustification(exercice)}</p>

      {exercice.classification === "incluse" && (
        <div className="options-grid-compact options-multiples" role="group">
          {tousLesPoints.map((nom) => {
            const aria = ariaPoint(nom);
            return (
              <button key={nom} type="button" role="checkbox" className={classePoint(nom)} onClick={() => basculerPoint(nom)} aria-checked={pointsChoisis.includes(nom)} disabled={gele}>
                {nom}
                {aria && <span className="sr-only"> — {aria}</span>}
              </button>
            );
          })}
        </div>
      )}

      {exercice.classification === "parallele" && (
        <div className="options-grid-compact" role="radiogroup">
          {exercice.candidatsParallele.map((candidat, index) => {
            const aria = ariaOptionChoixFerme(index, etatOptions);
            return (
              <button
                key={`${candidat.sommets[0]}-${candidat.sommets[1]}`}
                type="button"
                role="radio"
                aria-checked={indexCandidat === index}
                className={classeOptionChoixFerme(index, etatOptions)}
                onClick={() => !gele && setIndexCandidat(index)}
                disabled={gele}
              >
                {candidat.label}
                {aria && <span className="sr-only"> — {aria}</span>}
              </button>
            );
          })}
        </div>
      )}

      {exercice.classification === "secante" && (
        <div className="options-grid-compact" role="radiogroup">
          {exercice.candidatsSecante.map((candidat, index) => {
            const aria = ariaOptionChoixFerme(index, etatOptions);
            return (
              <button
                key={candidat.type === "arete" ? `${candidat.sommets[0]}-${candidat.sommets[1]}` : `${candidat.type}-${candidat.nom}`}
                type="button"
                role="radio"
                aria-checked={indexCandidat === index}
                className={classeOptionChoixFerme(index, etatOptions)}
                onClick={() => !gele && setIndexCandidat(index)}
                disabled={gele}
              >
                {libelleCandidatSecante(candidat)}
                {aria && <span className="sr-only"> — {aria}</span>}
              </button>
            );
          })}
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideJustification(exercice.classification)}</p>
          {niveauAide >= 2 && <p>{texteAideJustificationNiveau2(exercice)}</p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_JUSTIFICATION} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && soumis !== null && (
            <p className="alert-error" role="alert">
              <span>
                {cibleSelectionIncluse(exercice, soumis)} Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
              </span>
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
