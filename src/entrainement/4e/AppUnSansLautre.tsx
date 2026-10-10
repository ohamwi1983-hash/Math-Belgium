import { useState } from "react";
import type { ExerciceUnSansLautre } from "./core/unSansLautre.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionUnSansLautre,
  soumettreReponseCarre,
  soumettreReponseTangente,
  soumettreReponseValeurSignee,
} from "./moteur/sessionUnSansLautre";
import type { EtatSessionUnSansLautre, PhaseUnSansLautre, ResultatExerciceUnSansLautre } from "./moteur/typesUnSansLautre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceUnSansLautre } from "./generateurs/unSansLautre";
import type { FonctionConnue } from "./core/unSansLautre.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeCarreUnSansLautre } from "./components/EtapeCarreUnSansLautre";
import { EtapeValeurSigneeUnSansLautre } from "./components/EtapeValeurSigneeUnSansLautre";
import { EtapeTangenteUnSansLautre } from "./components/EtapeTangenteUnSansLautre";
import { ResultatPanelUnSansLautre } from "./components/ResultatPanelUnSansLautre";
import { ResumeSessionUnSansLautre } from "./components/ResumeSessionUnSansLautre";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionUnSansLautre {
  return demarrerSessionUnSansLautre(REGLAGES_DEMO, genererExerciceUnSansLautre);
}

interface Bilan {
  resultat: ResultatExerciceUnSansLautre;
  exercice: ExerciceUnSansLautre;
}

const LIBELLE_PHASE: Record<PhaseUnSansLautre, string> = {
  carre: "Carré",
  valeurSignee: "Valeur signée",
  tangente: "Tangente",
};

export function AppUnSansLautre() {
  const [etat, setEtat] = useState<EtatSessionUnSansLautre>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceUnSansLautre, nouvelEtat: EtatSessionUnSansLautre) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionUnSansLautre(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FonctionConnue)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Retrouver sin ou cos à partir de l'autre</h1>
        <p className="app-subtitle">Chapitre 3</p>
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
          {dernierBilan ? (
            <ResultatPanelUnSansLautre
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionUnSansLautre resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "carre" ? (
            <EtapeCarreUnSansLautre
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideCarreUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => setEtat(soumettreReponseCarre(etat, texte))}
            />
          ) : etat.phase === "valeurSignee" ? (
            <EtapeValeurSigneeUnSansLautre
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideValeurSigneeUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => setEtat(soumettreReponseValeurSignee(etat, texte))}
            />
          ) : (
            <EtapeTangenteUnSansLautre
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideTangenteUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseTangente(etat, texte));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
