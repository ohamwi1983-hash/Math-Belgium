import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { ResultatExerciceDistanceDroite } from "../moteur/typesDistanceDroite";
import { formatEquationImpliciteLatex, formatPointLatex } from "../ui/formatEquationDroite";
import { LIBELLE_VARIANTE, formatAideDistancePQNiveau2Latex, formatAideIntersectionQNiveau2Latex, formatDistanceAttendueLatex, formatEnonceLatex } from "../ui/formatDistanceDroite";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceDistanceDroite;
  exercice: ExerciceDistanceDroite;
  point: { x: number; y: number };
  droiteCible: { a: number; b: number; c: number };
  bAttendue: { a: number; b: number; c: number };
  qAttendu: { x: number; y: number };
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran
 * (audit checklist chapitre 6, point 10). Ligne "Choix du point" conditionnelle sur
 * `scoreChoixPoint !== null` — jamais affichée pour la variante "point", où cet écran n'a jamais
 * eu lieu. Révélation de chaque écran échoué avec la vraie réponse attendue, dérivée des valeurs
 * (dynamiques pour la variante "paralleles", statiques pour "point") résolues en session, jamais
 * recalculées différemment ici.
 */
export function ResultatPanelDistanceDroite({ resultat, exercice, point, droiteCible, bAttendue, qAttendu, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreChoixPoint, resultat.scoreEquationB, resultat.scoreIntersectionQ, resultat.scoreDistancePQ].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">{LIBELLE_VARIANTE[resultat.variante]}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreChoixPoint !== null && (
        <LigneEcran label="Choix du point" revele={resultat.choixPointRevele} niveauAide={resultat.niveauAideChoixPoint} />
      )}
      <LigneEcran label="Équation de b" revele={resultat.equationBRevele} niveauAide={resultat.niveauAideEquationB} />
      <LigneEcran label="Coordonnées de Q" revele={resultat.intersectionQRevele} niveauAide={resultat.niveauAideIntersectionQ} />
      <LigneEcran label="Distance PQ" revele={resultat.distancePQRevele} niveauAide={resultat.niveauAideDistancePQ} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreChoixPoint === 0 && (
        <div className="answer-reveal">
          Une réponse possible : <Katex expression={formatEnonceLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEquationB === 0 && (
        <div className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationImpliciteLatex(bAttendue.a, bAttendue.b, bAttendue.c)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreIntersectionQ === 0 && (
        <div className="answer-reveal">
          Q attendu : <Katex expression={`Q${formatPointLatex(qAttendu)}`} />
          <br />
          Méthode : <Katex expression={formatAideIntersectionQNiveau2Latex(bAttendue, droiteCible)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreDistancePQ === 0 && (
        <div className="answer-reveal">
          Distance attendue : <Katex expression={formatDistanceAttendueLatex(exercice.distance)} />
          <br />
          Méthode : <Katex expression={formatAideDistancePQNiveau2Latex(point, qAttendu)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
