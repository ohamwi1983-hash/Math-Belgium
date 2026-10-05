import { useState } from "react";
import type { ExerciceSynthese } from "./core/exerciceSynthese.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionExerciceSynthese,
  soumettreReponseBoxplot,
  soumettreReponseBtIntervalle,
  soumettreReponseBtPourcent,
  soumettreReponseCentres,
  soumettreReponseLecture,
  soumettreReponseMediane,
  soumettreReponseMinMaxMode,
  soumettreReponsePolygone,
  soumettreReponseQ1,
  soumettreReponseQ3,
  soumettreReponseQuotient,
  soumettreReponseSommes,
  soumettreReponseSynthese,
  soumettreReponseTableau,
  soumettreReponseVarianceEcartType,
} from "./moteur/sessionExerciceSynthese";
import type { EtatSessionExerciceSynthese, PhaseExerciceSynthese, ResultatExerciceSynthese } from "./moteur/typesExerciceSynthese";
import {
  versBoiteMoustaches,
  versDispersion,
  versMedianeClasses,
  versMedianeDiscrete,
  versMoyennePondereeClasses,
  versMoyennePonderee,
} from "./moteur/verificationExerciceSynthese";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSynthese } from "./generateurs/exerciceSynthese";
import type { VarianteExerciceSynthese } from "./core/exerciceSynthese.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyennePonderee } from "./components/EtapeCentresMoyennePonderee";
import { EtapeSommesMoyennePonderee } from "./components/EtapeSommesMoyennePonderee";
import { EtapeQuotientMoyennePonderee } from "./components/EtapeQuotientMoyennePonderee";
import { EtapeMedianeDiscrete } from "./components/EtapeMedianeDiscrete";
import { EtapeQ1Mediane } from "./components/EtapeQ1Mediane";
import { EtapeQ3Mediane } from "./components/EtapeQ3Mediane";
import { EtapeMinMaxModeMediane } from "./components/EtapeMinMaxModeMediane";
import { EtapePolygoneMediane } from "./components/EtapePolygoneMediane";
import { EtapeLectureMediane } from "./components/EtapeLectureMediane";
import { EtapeSyntheseMediane } from "./components/EtapeSyntheseMediane";
import { EtapeConstruction } from "./components/EtapeConstruction";
import { EtapeTableauDispersion } from "./components/EtapeTableauDispersion";
import { EtapeVarianceEcartTypeDispersion } from "./components/EtapeVarianceEcartTypeDispersion";
import { EtapeBtIntervalle } from "./components/EtapeBtIntervalle";
import { EtapeBtPourcent } from "./components/EtapeBtPourcent";
import { ResultatPanelExerciceSynthese } from "./components/ResultatPanelExerciceSynthese";
import { ResumeSessionExerciceSynthese } from "./components/ResumeSessionExerciceSynthese";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

/** Pas de crantage du glissement des 5 marqueurs de la boîte à moustaches, variante "classes" —
 * médiane/Q1/Q3 y sont arrondis à 1 décimale (`arrondi1`, `generateurs/exerciceSynthese/index.ts`),
 * contrairement à la variante "discrete" (toujours des entiers exacts, pas par défaut). */
const PAS_BOXPLOT_CLASSES = 0.1;

function nouvelleSession(): EtatSessionExerciceSynthese {
  return demarrerSessionExerciceSynthese(REGLAGES_DEMO, genererExerciceSynthese);
}

interface Bilan {
  resultat: ResultatExerciceSynthese;
  exercice: ExerciceSynthese;
}

/** Écrans nécessitant un calcul décimal non fourni par l'énoncé — moyenne pondérée (quotient),
 * variance/écart-type (racine carrée), et bornes de l'intervalle de Bienaymé-Tchebychev (arithmétique
 * décimale sur x̄/σ déjà confirmés) ; les autres écrans (centres, sommes, tableau, médiane/quartiles,
 * lecture graphique, boîte à moustaches, btPourcent — k fixé à 2, résultat toujours 75) restent exacts
 * ou fournis par l'énoncé. */
const PHASES_CALCULATRICE = new Set<PhaseExerciceSynthese>(["quotient", "varianceEcartType", "btIntervalle"]);

const LIBELLE_PHASE: Record<PhaseExerciceSynthese, string> = {
  centres: "Centres de classe",
  sommes: "Sommes intermédiaires",
  quotient: "Moyenne pondérée",
  mediane: "Médiane",
  q1: "Premier quartile (Q1)",
  q3: "Troisième quartile (Q3)",
  minMaxMode: "Min, max et mode(s)",
  polygone: "Polygone des effectifs cumulés",
  lectureMediane: "Lecture — médiane",
  lectureQ1: "Lecture — Q1",
  lectureQ3: "Lecture — Q3",
  synthese: "Synthèse (classe modale)",
  boxplot: "Boîte à moustaches",
  tableau: "Tableau et sommes (variance)",
  varianceEcartType: "Variance et écart-type",
  btIntervalle: "Bienaymé-Tchebychev — intervalle",
  btPourcent: "Bienaymé-Tchebychev — % minimal",
};

/**
 * "Exercice de synthèse" (chapitre 5, remplace "Étendue et écart interquartile" à la même
 * position, gen35 — `promptgen35synthese.md`) — UN SEUL dataset (contexte + table x_i/n_i ou
 * classes/effectifs), généré une fois pour toutes, suivi de bout en bout à travers 11 (variante
 * "discrete") ou 13 (variante "classes") écrans REPRIS des générateurs sources (gen32/33/34/36),
 * plus 2 écrans "gen37 adaptés" propres à cet exercice. Seule la phase "btPourcent" est jamais
 * terminale (dernière phase des 2 séquences, `SEQUENCES` — `typesExerciceSynthese.ts`) : les 16
 * autres transitions restent internes à l'exercice en cours, jamais de bilan intermédiaire.
 */
export function AppExerciceSynthese() {
  const [etat, setEtat] = useState<EtatSessionExerciceSynthese>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceSynthese, nouvelEtat: EtatSessionExerciceSynthese) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionExerciceSynthese(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteExerciceSynthese)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Synthèse — Statistique descriptive complète</h1>
        <p className="app-subtitle">Chapitre 5 — Statistiques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {enCoursDeSession && PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelExerciceSynthese
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionExerciceSynthese resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "centres" && exercice.variante === "classes" ? (
            <EtapeCentresMoyennePonderee
              exercice={versMoyennePondereeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseCentres(etat, reponse))}
            />
          ) : etat.phase === "sommes" ? (
            <EtapeSommesMoyennePonderee
              exercice={versMoyennePonderee(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseSommes(etat, reponse))}
            />
          ) : etat.phase === "quotient" ? (
            <EtapeQuotientMoyennePonderee
              exercice={versMoyennePonderee(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseQuotient(etat, reponse))}
            />
          ) : etat.phase === "mediane" && exercice.variante === "discrete" ? (
            <EtapeMedianeDiscrete
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseMediane(etat, reponse))}
            />
          ) : etat.phase === "q1" && exercice.variante === "discrete" ? (
            <EtapeQ1Mediane
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseQ1(etat, reponse))}
            />
          ) : etat.phase === "q3" && exercice.variante === "discrete" ? (
            <EtapeQ3Mediane
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseQ3(etat, reponse))}
            />
          ) : etat.phase === "minMaxMode" && exercice.variante === "discrete" ? (
            <EtapeMinMaxModeMediane
              exercice={versMedianeDiscrete(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseMinMaxMode(etat, reponse))}
            />
          ) : etat.phase === "polygone" && exercice.variante === "classes" ? (
            <EtapePolygoneMediane
              exercice={versMedianeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(points) => setEtat(soumettreReponsePolygone(etat, points))}
            />
          ) : etat.phase === "lectureMediane" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="mediane"
              exercice={versMedianeClasses(exercice)}
              parametre="mediane"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLecture(etat, "mediane", texte))}
            />
          ) : etat.phase === "lectureQ1" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q1"
              exercice={versMedianeClasses(exercice)}
              parametre="q1"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLecture(etat, "q1", texte))}
            />
          ) : etat.phase === "lectureQ3" && exercice.variante === "classes" ? (
            <EtapeLectureMediane
              key="q3"
              exercice={versMedianeClasses(exercice)}
              parametre="q3"
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseLecture(etat, "q3", texte))}
            />
          ) : etat.phase === "synthese" && exercice.variante === "classes" ? (
            <EtapeSyntheseMediane
              exercice={versMedianeClasses(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseSynthese(etat, reponse))}
            />
          ) : etat.phase === "boxplot" ? (
            <EtapeConstruction
              exercice={versBoiteMoustaches(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseBoxplot(etat, reponse))}
              pas={exercice.variante === "classes" ? PAS_BOXPLOT_CLASSES : undefined}
            />
          ) : etat.phase === "tableau" ? (
            <EtapeTableauDispersion
              exercice={versDispersion(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseTableau(etat, reponse))}
            />
          ) : etat.phase === "varianceEcartType" ? (
            <EtapeVarianceEcartTypeDispersion
              exercice={versDispersion(exercice)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseVarianceEcartType(etat, reponse))}
            />
          ) : etat.phase === "btIntervalle" ? (
            <EtapeBtIntervalle
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseBtIntervalle(etat, reponse))}
            />
          ) : etat.phase === "btPourcent" ? (
            <EtapeBtPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseBtPourcent(etat, texte));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
