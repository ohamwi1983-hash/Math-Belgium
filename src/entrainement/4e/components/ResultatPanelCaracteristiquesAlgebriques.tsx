import type { Morceau } from "../core/inequation.types";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import type { ResultatExerciceCaracteristiquesAlgebriques } from "../moteur/typesCaracteristiquesAlgebriques";
import {
  brancheEstValide,
  ceAttendues,
  domaineAttendu,
  necessiteDebarrasser,
  necessiteRegroupe,
  necessiteSeparation,
  necessiteValidite,
  racineRespecteCondition,
  racinesAValiderRacineCarree,
  zerosAttendus,
} from "../moteur/verificationCaracteristiquesAlgebriques";
import {
  formatCEAttenduesLatex,
  formatConditionLatex,
  formatEquationDebarrasseeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationsSepareesLatex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatTermesZerosAttendusLatex,
} from "../ui/formatCaracteristiquesAlgebriques";
import { formatFractionIrreductible } from "../ui/formatFraction";
import { formatDomaineLatex } from "../ui/apercuDomaine";
import type { EtatMorceauFraction } from "../ui/morceauFraction";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceCaracteristiquesAlgebriques;
  exercice: ExerciceCaracteristiquesAlgebriques;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Convertit un `Morceau` (bornes numériques déjà calculées) vers `EtatMorceauFraction` — la
 * représentation attendue par `formatDomaineLatex` — chaque borne finie passée au même moteur de
 * fraction exacte que le reste de ce panneau (`formatFractionIrreductible`), jamais un décimal
 * bruité. Réutilise `formatDomaineLatex` (`ui/apercuDomaine.ts`, déjà construit pour l'aperçu en
 * temps réel de l'écran "domaine") plutôt qu'une seconde logique de rendu de domaine séparée pour
 * ce panneau (`prompt-corrections-caracteristiquesalgebriques.md`, point 3). */
function morceauVersEtatFraction(m: Morceau): EtatMorceauFraction {
  return {
    crochetGauche: m.crochetGauche,
    borneGaucheMode: m.borneGauche === "-inf" ? "-inf" : "nombre",
    borneGaucheValeur: typeof m.borneGauche === "number" ? formatFractionIrreductible(m.borneGauche) : "",
    crochetDroit: m.crochetDroit,
    borneDroiteMode: m.borneDroite === "+inf" ? "+inf" : "nombre",
    borneDroiteValeur: typeof m.borneDroite === "number" ? formatFractionIrreductible(m.borneDroite) : "",
  };
}

function formatDomaineAttenduLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  const domaine = domaineAttendu(exercice);
  const points = domaine.points.map((p) => formatFractionIrreductible(p));
  const intervalles = domaine.intervalles.map(morceauVersEtatFraction);
  // domaine.forme n'est jamais null ici (toujours une des 4 formes) : jamais null en pratique.
  return formatDomaineLatex(domaine.forme, points, intervalles) ?? "";
}

/** Zéros à afficher lors de la révélation (`scoreZeros === 0`) — `racine_carree` (niveau 2) fait
 * exception (`prompt-corrections-niveau2-vague3.md`, point 2) : `scoreZeros` y grade désormais les
 * racines CANDIDATES (non filtrées, l'écran "zéros" précédant "validation" pour cette famille),
 * donc la révélation doit montrer ces mêmes candidats — jamais les zéros finaux filtrés
 * (`zerosAttendus`), qui restent la bonne réponse pour les 5 autres familles/niveaux, chez qui
 * "zéros" reste la phase terminale inchangée. */
function zerosAAfficherPourRevelation(exercice: ExerciceCaracteristiquesAlgebriques): number[] {
  if (exercice.niveau === "niveau2" && exercice.famille === "racine_carree") {
    return racinesAValiderRacineCarree(exercice);
  }
  return zerosAttendus(exercice);
}

/** Réponse Oui/Non attendue à l'étape "validation d'une solution", à l'index donné — même logique
 * que `soumettreReponseValidationSolution` (`sessionCaracteristiquesAlgebriques.ts`), dupliquée ici
 * plutôt qu'importée (petite fonction pure, même principe de duplication assumée qu'ailleurs dans
 * le projet, ex. `coteFactorise`). Niveau 2 `racine_carree`/`valeur_absolue` uniquement — jamais
 * appelée en dehors de ce cas (`resultat.scoresValidationSolution` reste vide sinon). */
function attenduValidationSolution(exercice: ExerciceCaracteristiquesAlgebriques, index: number): boolean {
  if (exercice.niveau !== "niveau2") return false;
  if (exercice.famille === "racine_carree") return racineRespecteCondition(exercice, racinesAValiderRacineCarree(exercice)[index]);
  if (exercice.famille === "valeur_absolue") return brancheEstValide(exercice, index as 0 | 1);
  return false;
}

/** Récapitulatif final uniformisé (point 10, audit transversal chapitre 2 — jusque-là resté au
 * format `score-list`/`X/100`) — même patron que `ResultatPanelCaracteristiquesFonction.tsx`
 * (gen12, structure la plus proche : lui aussi noté uniquement via `etapeTentatives`, sans bouton
 * "Aide") : aucun `niveauAide` dans ce générateur, donc `statutRecap(revele, null)` partout — jamais
 * d'orange, seulement vert/rouge, état légitime plutôt qu'une lacune du contrat. */
export function ResultatPanelCaracteristiquesAlgebriques({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const uneEtapeRevelee =
    resultat.ordonneeRevele ||
    resultat.ceRevele ||
    resultat.domaineRevele ||
    resultat.isolementRevele ||
    resultat.separationRevele ||
    resultat.debarrasserRevele ||
    resultat.validiteRevele ||
    resultat.regroupeRevele ||
    resultat.resolutionBranchesRevele ||
    resultat.zerosRevele;

  const statutOrdonnee = statutRecap(resultat.ordonneeRevele, null);
  const statutCE = statutRecap(resultat.ceRevele, null);
  const statutDomaine = statutRecap(resultat.domaineRevele, null);
  const statutIsolement = statutRecap(resultat.isolementRevele, null);
  const statutSeparation = statutRecap(resultat.separationRevele, null);
  const statutDebarrasser = statutRecap(resultat.debarrasserRevele, null);
  const statutValidite = statutRecap(resultat.validiteRevele, null);
  const statutRegroupe = statutRecap(resultat.regroupeRevele, null);
  const statutResolutionBranches = statutRecap(resultat.resolutionBranchesRevele, null);
  const statutZeros = statutRecap(resultat.zerosRevele, null);

  const scoresPourTotal = [
    resultat.scoreOrdonnee,
    resultat.scoreCE,
    resultat.scoreDomaine,
    resultat.scoreIsolement,
    resultat.scoreSeparation,
    resultat.scoreDebarrasser,
    resultat.scoreValidite,
    resultat.scoreRegroupe,
    ...resultat.scoresValidationSolution,
    resultat.scoreResolutionBranches,
    resultat.scoreZeros,
  ].filter((score): score is number => score !== null);
  const totalPoints = scoresPourTotal.reduce((somme, score) => somme + score, 0);
  const maxPoints = scoresPourTotal.length * 100;

  return (
    <div>
      <h2 className="result-title">Caractéristiques algébriques d'une fonction de référence</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneRecap label="Ordonnée à l'origine" statut={statutOrdonnee}>
        {libelleStatutRecap(statutOrdonnee)}
      </LigneRecap>
      <LigneRecap label="Conditions d'existence" statut={statutCE}>
        {libelleStatutRecap(statutCE)}
      </LigneRecap>
      <LigneRecap label="Domaine de définition" statut={statutDomaine}>
        {libelleStatutRecap(statutDomaine)}
      </LigneRecap>
      <LigneRecap label="Isolement" statut={statutIsolement}>
        {libelleStatutRecap(statutIsolement)}
      </LigneRecap>
      {resultat.scoreSeparation !== null && (
        <LigneRecap label="Séparation" statut={statutSeparation}>
          {libelleStatutRecap(statutSeparation)}
        </LigneRecap>
      )}
      {resultat.scoreDebarrasser !== null && (
        <LigneRecap label="Se débarrasser de..." statut={statutDebarrasser}>
          {libelleStatutRecap(statutDebarrasser)}
        </LigneRecap>
      )}
      {resultat.scoreValidite !== null && (
        <LigneRecap label="Validité de l'équation" statut={statutValidite}>
          {libelleStatutRecap(statutValidite)}
        </LigneRecap>
      )}
      {resultat.scoreRegroupe !== null && (
        <LigneRecap label="Regroupe" statut={statutRegroupe}>
          {libelleStatutRecap(statutRegroupe)}
        </LigneRecap>
      )}
      {resultat.scoreResolutionBranches !== null && (
        <LigneRecap label="Résolution des branches" statut={statutResolutionBranches}>
          {libelleStatutRecap(statutResolutionBranches)}
        </LigneRecap>
      )}
      {resultat.scoresValidationSolution.map((score, index) => {
        // Pas de flag `revele` par solution dans le contrat (seulement un score agrégé) — mais
        // `soumettreEtapeTentatives` garantit score===0 <=> révélation (voir `etapeTentatives.ts` :
        // le seul chemin vers un score de 0 est l'échec après épuisement des tentatives, qui
        // déclenche systématiquement `revelee: true`), donc dérivable sans ambiguïté ici.
        const statutValidation = statutRecap(score === 0, null);
        return (
          <LigneRecap
            key={index}
            label={`Validation${resultat.scoresValidationSolution.length > 1 ? ` (solution ${index + 1})` : ""}`}
            statut={statutValidation}
          >
            {libelleStatutRecap(statutValidation)}
          </LigneRecap>
        );
      })}
      <LigneRecap label="Zéros" statut={statutZeros}>
        {libelleStatutRecap(statutZeros)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec &&
        resultat.scoreOrdonnee === 0 &&
        (() => {
          const attendu = formatOrdonneeExacteLatex(exercice);
          return (
            <p className="answer-reveal">
              f(0) attendu : {attendu === null ? "n'existe pas" : <Katex expression={attendu} />}
            </p>
          );
        })()}
      {afficherReponseApresEchec &&
        resultat.scoreCE === 0 &&
        (() => {
          const attendu = formatCEAttenduesLatex(ceAttendues(exercice));
          return (
            <p className="answer-reveal">
              CE attendues : {attendu === null ? "aucune" : <Katex expression={attendu} />}
            </p>
          );
        })()}
      {afficherReponseApresEchec && resultat.scoreDomaine === 0 && (
        <p className="answer-reveal">
          Domaine attendu : <Katex expression={formatDomaineAttenduLatex(exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreIsolement === 0 && (
        <div className="answer-reveal">
          Équation isolée attendue : <Katex expression={formatEquationIsoleeLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec &&
        exercice.niveau === "niveau1" &&
        necessiteSeparation(exercice) &&
        resultat.scoreSeparation === 0 && (
          <div className="answer-reveal">
            <p>Deux équations attendues :</p>
            <Katex expression={formatEquationsSepareesLatex(exercice)} block />
          </div>
        )}
      {afficherReponseApresEchec &&
        exercice.niveau === "niveau1" &&
        necessiteDebarrasser(exercice) &&
        resultat.scoreDebarrasser === 0 && (
          <div className="answer-reveal">
            Équation attendue : <Katex expression={formatEquationDebarrasseeLatex(exercice)} />
          </div>
        )}
      {afficherReponseApresEchec && necessiteValidite(exercice) && resultat.scoreValidite === 0 && (
        <p className="answer-reveal">
          Condition attendue : <Katex expression={formatConditionLatex(exercice.conditionValidite)} />
        </p>
      )}
      {afficherReponseApresEchec && exercice.niveau === "niveau2" && necessiteRegroupe(exercice) && resultat.scoreRegroupe === 0 && (
        <p className="answer-reveal">
          Équation attendue : <Katex expression={formatEquationDeveloppeeLatex(exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && exercice.niveau === "niveau2" && exercice.famille === "valeur_absolue" && resultat.scoreResolutionBranches === 0 && (
        <p className="answer-reveal">
          Racines attendues :{" "}
          <span className="equation-box-termes">
            <Katex expression={formatFractionLatex(exercice.racineBranche1)} />
            <Katex expression={`\\text{ et } ${formatFractionLatex(exercice.racineBranche2)}`} />
          </span>
        </p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoresValidationSolution.map(
          (score, index) =>
            score === 0 && (
              <p className="answer-reveal" key={index}>
                Validation attendue{resultat.scoresValidationSolution.length > 1 ? ` (solution ${index + 1})` : ""} :{" "}
                {attenduValidationSolution(exercice, index) ? "Oui" : "Non"}
              </p>
            ),
        )}
      {afficherReponseApresEchec &&
        resultat.scoreZeros === 0 &&
        (() => {
          const termes = formatTermesZerosAttendusLatex(zerosAAfficherPourRevelation(exercice));
          return (
            <p className="answer-reveal">
              Zéros attendus :{" "}
              {termes === null ? (
                "aucun"
              ) : (
                <span className="equation-box-termes">
                  {termes.map((terme, i) => (
                    <Katex key={i} expression={terme} />
                  ))}
                </span>
              )}
            </p>
          );
        })()}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
