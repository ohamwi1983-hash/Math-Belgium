import { useState } from "react";
import type { ExerciceComparaisonSeries } from "./core/comparaisonSeries.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionComparaisonSeries,
  soumettreReponseCentrage,
  soumettreReponseDispersion,
  soumettreReponseInterpretation,
  soumettreReponseSeuil,
} from "./moteur/sessionComparaisonSeries";
import type { EtatSessionComparaisonSeries, ResultatExerciceComparaisonSeries } from "./moteur/typesComparaisonSeries";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonSeries } from "./generateurs/comparaisonSeries";
import type { VarianteComparaisonSeries } from "./core/comparaisonSeries.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeCentrageComparaison } from "./components/EtapeCentrageComparaison";
import { EtapeDispersionComparaison } from "./components/EtapeDispersionComparaison";
import { EtapeInterpretationComparaison } from "./components/EtapeInterpretationComparaison";
import { EtapeSeuilComparaison } from "./components/EtapeSeuilComparaison";
import { ResultatPanelComparaisonSeries } from "./components/ResultatPanelComparaisonSeries";
import { ResumeSessionComparaisonSeries } from "./components/ResumeSessionComparaisonSeries";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionComparaisonSeries {
  return demarrerSessionComparaisonSeries(REGLAGES_DEMO, genererExerciceComparaisonSeries);
}

interface Bilan {
  resultat: ResultatExerciceComparaisonSeries;
  exercice: ExerciceComparaisonSeries;
}

/** Pas de `Phase` (comme "Quel angle ?"/"Transformations graphiques") : un seul écran par
 * exercice, dont la FORME dépend de `exercice.question.type` (4 possibles) — voir
 * `sessionComparaisonSeries.ts`. */
export function AppComparaisonSeries() {
  const [etat, setEtat] = useState<EtatSessionComparaisonSeries>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceComparaisonSeries, nouvelEtat: EtatSessionComparaisonSeries) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const exercice = etat.exerciceCourant;
  const question = exercice.question;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionComparaisonSeries(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteComparaisonSeries)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Comparaison de deux séries statistiques</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelComparaisonSeries
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionComparaisonSeries resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : question.type === "centrage" ? (
            <EtapeCentrageComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(exercice, soumettreReponseCentrage(etat, choix))}
            />
          ) : question.type === "dispersion" ? (
            <EtapeDispersionComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(exercice, soumettreReponseDispersion(etat, reponse))}
            />
          ) : question.type === "seuil" ? (
            <EtapeSeuilComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(exercice, soumettreReponseSeuil(etat, texte))}
            />
          ) : (
            <EtapeInterpretationComparaison
              exercice={exercice}
              question={question}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => terminerEtape(exercice, soumettreReponseInterpretation(etat, choix))}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
