import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { ResultatExerciceCaracteristiquesFonction } from "../moteur/typesCaracteristiquesFonction";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
} from "../moteur/verificationCaracteristiquesFonction";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceCaracteristiquesFonction;
  exercice: ExerciceCaracteristiquesFonction;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Arrondi d'affichage (3 décimales) pour une révélation — jamais utilisé pour la vérification elle-même. */
function formatNombre(valeur: number): string {
  return `${Number(valeur.toFixed(3))}`;
}

function formatMorceau(m: Morceau): string {
  return `${m.crochetGauche}${m.borneGauche} ; ${m.borneDroite}${m.crochetDroit}`;
}

function formatDomaineAttendu(exercice: ExerciceCaracteristiquesFonction): string {
  return domaineCaracteristiques(exercice).map(formatMorceau).join(" ∪ ");
}

function formatZerosAttendus(exercice: ExerciceCaracteristiquesFonction): string {
  if (exercice.zeros.length === 0) return "aucun";
  return [...exercice.zeros].sort((a, b) => a - b).join(" ; ");
}

function formatMorceaux(morceaux: Morceau[]): string {
  return morceaux.map(formatMorceau).join(" ∪ ");
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, appliqué ici — jusque-là
 * resté au format `score-list`/`X/100`, hors du périmètre explicite de ce prompt) — même patron
 * que `ResultatPanelFormeCanoniqueTransformations.tsx` (chapitre 1) : aucun bouton "Aide" dans ce
 * générateur (jamais d'orange, seulement vert/rouge). */
export function ResultatPanelCaracteristiquesFonction({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const uneEtapeRevelee =
    resultat.domaineRevele ||
    resultat.zerosRevele ||
    resultat.croissanceRevele ||
    resultat.decroissanceRevele ||
    resultat.constanceRevele ||
    resultat.ordonneeRevele ||
    resultat.valeurRevele ||
    resultat.asymptotesRevele;

  const statutDomaine = statutRecap(resultat.domaineRevele, null);
  const statutZeros = statutRecap(resultat.zerosRevele, null);
  const statutCroissance = statutRecap(resultat.croissanceRevele, null);
  const statutDecroissance = statutRecap(resultat.decroissanceRevele, null);
  const statutConstance = statutRecap(resultat.constanceRevele, null);
  const statutOrdonnee = statutRecap(resultat.ordonneeRevele, null);
  const statutValeur = statutRecap(resultat.valeurRevele, null);
  const statutAsymptotes = statutRecap(resultat.asymptotesRevele, null);
  const totalPoints =
    resultat.scoreDomaine +
    resultat.scoreZeros +
    resultat.scoreCroissance +
    resultat.scoreDecroissance +
    resultat.scoreConstance +
    resultat.scoreOrdonnee +
    resultat.scoreValeur +
    resultat.scoreAsymptotes;

  return (
    <div>
      <h2 className="result-title">Caractéristiques d'une fonction</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Domaine de définition" statut={statutDomaine}>
        {libelleStatutRecap(statutDomaine)}
      </LigneRecap>
      <LigneRecap label="Zéros" statut={statutZeros}>
        {libelleStatutRecap(statutZeros)}
      </LigneRecap>
      <LigneRecap label="Intervalles de croissance" statut={statutCroissance}>
        {libelleStatutRecap(statutCroissance)}
      </LigneRecap>
      <LigneRecap label="Intervalles de décroissance" statut={statutDecroissance}>
        {libelleStatutRecap(statutDecroissance)}
      </LigneRecap>
      <LigneRecap label="Constance" statut={statutConstance}>
        {libelleStatutRecap(statutConstance)}
      </LigneRecap>
      <LigneRecap label="Ordonnée à l'origine" statut={statutOrdonnee}>
        {libelleStatutRecap(statutOrdonnee)}
      </LigneRecap>
      <LigneRecap label={`f(${exercice.v})`} statut={statutValeur}>
        {libelleStatutRecap(statutValeur)}
      </LigneRecap>
      <LigneRecap label="Asymptotes" statut={statutAsymptotes}>
        {libelleStatutRecap(statutAsymptotes)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={800} />
      {afficherReponseApresEchec && resultat.scoreDomaine === 0 && (
        <p className="answer-reveal">Domaine attendu : {formatDomaineAttendu(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreZeros === 0 && (
        <p className="answer-reveal">Zéros attendus : {formatZerosAttendus(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreCroissance === 0 && (
        <p className="answer-reveal">Croissance attendue : {formatMorceaux(croissanceAttendueCaracteristiques(exercice))}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreDecroissance === 0 && (
        <p className="answer-reveal">Décroissance attendue : {formatMorceaux(decroissanceAttendueCaracteristiques(exercice))}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreConstance === 0 && (
        <p className="answer-reveal">Constance attendue : {formatMorceaux(constanceAttendueCaracteristiques(exercice))}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreOrdonnee === 0 && (
        <p className="answer-reveal">
          f(0) attendu :{" "}
          {existeOrdonneeCaracteristiques(exercice) ? formatNombre(evaluerCourbeCaracteristiques(exercice, 0)) : "n'existe pas"}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreValeur === 0 && (
        <p className="answer-reveal">
          f({exercice.v}) attendu :{" "}
          {existeValeurEnVCaracteristiques(exercice)
            ? formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))
            : "n'existe pas"}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreAsymptotes === 0 && (
        <p className="answer-reveal">
          Asymptotes attendues : x = {exercice.AV} ; y = {exercice.L}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
