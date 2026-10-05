import type { ResultatExerciceAnalyseFonction } from "../moteur/typesAnalyseFonction";
import type { ExerciceAnalyseFonction } from "../core/analyseFonction.types";
import { libelleCategorie } from "../ui/categorieLabels";
import { formatFonctionColoreeLatex } from "../ui/formatAnalyseFonction";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceAnalyseFonction;
  exercice: ExerciceAnalyseFonction;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number | null }) {
  const statut = statutRecap(revele, niveauAide);
  return <LigneRecap label={label} statut={statut}>{libelleStatutRecap(statut)}</LigneRecap>;
}

/**
 * Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — liste `LigneRecap` à plat,
 * 3 statuts, PLUS un résumé chiffré (`TotalPointsRecap`) qui réutilise TEL QUEL le mécanisme de
 * points déjà calculé par le moteur (`sessionAnalyseFonction.ts`) — jamais recalculé ici.
 *
 * ÉCART SIGNALÉ (point 3 du prompt) : ce générateur pénalise l'aide par un facteur ×0,5 fixe
 * (`aideXxxUtilisee`, un seul palier), PAS par le barème `-20 pts/niveau` décrit dans le prompt
 * (qui suppose un compteur `niveauAide` à paliers multiples, absent ici) — le mécanisme existant
 * est conservé intact, seul le statut coloré (vert/orange/rouge) traite `aideXxxUtilisee` comme
 * l'équivalent d'un `niveauAide` de 0 ou 1 pour `statutRecap`.
 */
export function ResultatPanelAnalyseFonction({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [
    resultat.scoreCoefficients,
    resultat.scoreAllure,
    resultat.scoreAxeSommet,
    resultat.scoreDomaineImage,
    resultat.scoreRacinesReconnaissance,
    resultat.scoreRacinesChamp1,
    resultat.scoreRacinesChamp2,
    resultat.scoreTableauSignes,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">{libelleCategorie(resultat.categorie)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreCoefficients !== null && (
        <LigneEcran label="Coefficients" revele={resultat.coefficientsRevele} niveauAide={resultat.aideCoefficientsUtilisee ? 1 : 0} />
      )}
      {resultat.scoreAllure !== null && <LigneEcran label="Allure" revele={resultat.allureRevele} niveauAide={null} />}
      {resultat.scoreAxeSommet !== null && (
        <LigneEcran label="Axe et sommet" revele={resultat.axeSommetRevele} niveauAide={resultat.aideAxeSommetUtilisee ? 1 : 0} />
      )}
      {resultat.scoreDomaineImage !== null && (
        <LigneEcran label="Domaine et image" revele={resultat.domaineImageRevele} niveauAide={resultat.aideDomaineImageUtilisee ? 1 : 0} />
      )}
      {resultat.scoreRacinesReconnaissance !== null && (
        <LigneEcran label="Méthode (racines)" revele={resultat.racinesReconnaissanceRevele} niveauAide={null} />
      )}
      {resultat.scoreRacinesChamp1 !== null && <LigneEcran label="Factorisation" revele={resultat.racinesChamp1Revele} niveauAide={null} />}
      {resultat.scoreRacinesChamp2 !== null && <LigneEcran label="Racines" revele={resultat.racinesChamp2Revele} niveauAide={null} />}
      {resultat.scoreTableauSignes !== null && (
        <LigneEcran label="Signe et variation" revele={resultat.tableauSignesRevele} niveauAide={resultat.aideTableauSignesUtilisee ? 1 : 0} />
      )}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreCoefficients === 0 && (
        <div className="answer-reveal">
          Coefficients attendus : <Katex expression={formatFonctionColoreeLatex(exercice.exercice.enonce)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
