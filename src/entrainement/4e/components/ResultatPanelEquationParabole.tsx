import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { ResultatExerciceEquationParabole } from "../moteur/typesEquationParabole";
import { LIBELLE_VARIANTE, formatEquationAttendueLatex, formatFoyerLatex, formatSommetLatex } from "../ui/formatEquationParabole";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEquationParabole;
  exercice: ExerciceEquationParabole;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, aideUtilisee }: { label: string; revele: boolean; aideUtilisee: boolean }) {
  const statut = statutRecap(revele, aideUtilisee ? 1 : 0);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Panneau de bilan — récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`,
 * convention CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par
 * écran. Les 2 scores sont toujours des `number` (jamais `null`), ce générateur n'ayant
 * structurellement aucune étape sautable (même simplicité que "Équation d'un cercle... à partir
 * d'un graphe"). `niveauAide`/`revele` capturés au moment de la clôture de chaque écran côté
 * moteur (jamais dérivés du score seul) : une tentative ratée sans aide reste donc verte.
 */
export function ResultatPanelEquationParabole({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreSommetFoyer + resultat.scoreEquation;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">Équation d'une parabole</h2>
      <p className="result-subtitle">{LIBELLE_VARIANTE[resultat.variante]} — résultat de l'exercice</p>
      <LigneEcran label="Sommet et foyer" revele={resultat.sommetFoyerRevele} aideUtilisee={resultat.sommetFoyerAideUtilisee} />
      <LigneEcran label="Équation" revele={resultat.equationRevele} aideUtilisee={resultat.equationAideUtilisee} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreSommetFoyer === 0 && (
        <div className="answer-reveal">
          Sommet attendu : <Katex expression={formatSommetLatex(exercice.sommet)} /> — Foyer attendu :{" "}
          <Katex expression={formatFoyerLatex(exercice.foyer)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEquation === 0 && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationAttendueLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
