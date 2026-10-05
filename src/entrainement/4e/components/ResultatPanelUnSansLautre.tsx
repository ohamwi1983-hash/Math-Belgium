import type { ExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { ResultatExerciceUnSansLautre } from "../moteur/typesUnSansLautre";
import { Katex } from "./Katex";
import { formatCarreCibleLatex, formatValeurCibleSimplifieeLatex, formatValeurTangenteSimplifieeLatex } from "../ui/formatUnSansLautre";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceUnSansLautre;
  exercice: ExerciceUnSansLautre;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Mention(s) de pénalité appliquée sur cette étape — les deux mécaniques (aide/simplification)
 * sont indépendantes et peuvent se cumuler sur un même écran (promptcreationgenerateur16unsanslautre.md). */
function formatMentionsPenalites(aideUtilisee: boolean, simplificationAppliquee: boolean): string | null {
  const mentions: string[] = [];
  if (aideUtilisee) mentions.push("aide utilisée (-20)");
  if (simplificationAppliquee) mentions.push("forme non simplifiée (-20)");
  return mentions.length === 0 ? null : mentions.join(", ");
}

function LigneEcran({
  label,
  revele,
  aideUtilisee,
  simplificationAppliquee,
}: {
  label: string;
  revele: boolean;
  aideUtilisee: boolean;
  simplificationAppliquee: boolean;
}) {
  const mentions = formatMentionsPenalites(aideUtilisee, simplificationAppliquee);
  const statut = statutRecap(revele, aideUtilisee || simplificationAppliquee ? 1 : 0);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
      {mentions !== null && <em> ({mentions})</em>}
    </LigneRecap>
  );
}

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran. Les
 * deux pénalités additives de ce générateur (aide, forme non simplifiée) sont indépendantes et
 * cumulables sur un même écran : `statutRecap` passe en orange dès que l'une des deux s'est
 * appliquée, avec le détail affiché en clair à côté du libellé — jamais un simple "correct" muet
 * qui masquerait une pénalité pourtant appliquée. La réponse attendue reste affichée pour toute
 * étape échouée OU pénalisée (conformément à la spec), pas seulement les étapes à score 0.
 */
export function ResultatPanelUnSansLautre({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const mentionsCarre = formatMentionsPenalites(resultat.aideCarreUtilisee, resultat.simplificationCarreAppliquee);
  const mentionsValeurSignee = formatMentionsPenalites(resultat.aideValeurSigneeUtilisee, resultat.simplificationValeurSigneeAppliquee);
  const mentionsTangente = formatMentionsPenalites(resultat.aideTangenteUtilisee, resultat.simplificationTangenteAppliquee);

  const revelerCarre = afficherReponseApresEchec && (resultat.scoreCarre === 0 || mentionsCarre !== null);
  const revelerValeurSignee = afficherReponseApresEchec && (resultat.scoreValeurSignee === 0 || mentionsValeurSignee !== null);
  const revelerTangente = afficherReponseApresEchec && (resultat.scoreTangente === 0 || mentionsTangente !== null);

  const totalPoints = resultat.scoreCarre + resultat.scoreValeurSignee + resultat.scoreTangente;

  return (
    <div>
      <h2 className="result-title">Retrouver sin ou cos à partir de l'autre</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran
        label="Carré"
        revele={resultat.carreRevele}
        aideUtilisee={resultat.aideCarreUtilisee}
        simplificationAppliquee={resultat.simplificationCarreAppliquee}
      />
      <LigneEcran
        label="Valeur signée"
        revele={resultat.valeurSigneeRevele}
        aideUtilisee={resultat.aideValeurSigneeUtilisee}
        simplificationAppliquee={resultat.simplificationValeurSigneeAppliquee}
      />
      <LigneEcran
        label="Tangente"
        revele={resultat.tangenteRevele}
        aideUtilisee={resultat.aideTangenteUtilisee}
        simplificationAppliquee={resultat.simplificationTangenteAppliquee}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={300} />
      {revelerCarre && (
        <div className="answer-reveal">
          Réponse attendue (carré) : <Katex expression={formatCarreCibleLatex(exercice)} />
        </div>
      )}
      {revelerValeurSignee && (
        <div className="answer-reveal">
          Réponse attendue (valeur signée) : <Katex expression={formatValeurCibleSimplifieeLatex(exercice)} />
        </div>
      )}
      {revelerTangente && (
        <div className="answer-reveal">
          Réponse attendue (tangente) : <Katex expression={formatValeurTangenteSimplifieeLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
