import { useState } from "react";
import type { ExerciceBoiteMoustaches } from "./core/boiteMoustaches.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionBoiteMoustaches,
  soumettreReponseComparaisonDispersions,
  soumettreReponseComparaisonMedianes,
  soumettreReponseConstruction,
  soumettreReponseLecture,
} from "./moteur/sessionBoiteMoustaches";
import type { EtatSessionBoiteMoustaches, PhaseBoiteMoustaches, ResultatExerciceBoiteMoustaches } from "./moteur/typesBoiteMoustaches";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBoiteMoustaches } from "./generateurs/boiteMoustaches";
import type { VarianteBoiteMoustaches } from "./core/boiteMoustaches.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeConstruction } from "./components/EtapeConstruction";
import { EtapeLecture } from "./components/EtapeLecture";
import { EtapeComparaisonMedianes } from "./components/EtapeComparaisonMedianes";
import { EtapeComparaisonDispersions } from "./components/EtapeComparaisonDispersions";
import { ResultatPanelBoiteMoustaches } from "./components/ResultatPanelBoiteMoustaches";
import { ResumeSessionBoiteMoustaches } from "./components/ResumeSessionBoiteMoustaches";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionBoiteMoustaches {
  return demarrerSessionBoiteMoustaches(REGLAGES_DEMO, genererExerciceBoiteMoustaches);
}

interface Bilan {
  resultat: ResultatExerciceBoiteMoustaches;
  exercice: ExerciceBoiteMoustaches;
}

const LIBELLE_PHASE: Record<PhaseBoiteMoustaches, string> = {
  construction: "Construction",
  lecture: "Lecture",
  comparaisonMedianes: "Comparaison — médianes",
  comparaisonDispersions: "Comparaison — dispersions",
};

export function AppBoiteMoustaches() {
  const [etat, setEtat] = useState<EtatSessionBoiteMoustaches>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceBoiteMoustaches, nouvelEtat: EtatSessionBoiteMoustaches) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionBoiteMoustaches(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteBoiteMoustaches)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Boîte à moustaches</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelBoiteMoustaches
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionBoiteMoustaches resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : exercice.variante === "construction" ? (
            <EtapeConstruction
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseConstruction(etat, reponse));
              }}
            />
          ) : exercice.variante === "lecture" ? (
            <EtapeLecture
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseLecture(etat, reponse));
              }}
            />
          ) : etat.phase === "comparaisonMedianes" ? (
            <EtapeComparaisonMedianes
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => setEtat(soumettreReponseComparaisonMedianes(etat, choix))}
            />
          ) : (
            <EtapeComparaisonDispersions
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(choix) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseComparaisonDispersions(etat, choix));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
