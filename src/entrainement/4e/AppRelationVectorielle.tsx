import { useState } from "react";
import type { ExerciceRelationVectorielle } from "./core/relationVectorielle.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionRelationVectorielle, soumettreReponseCoordonnees, soumettreReponseTraduction } from "./moteur/sessionRelationVectorielle";
import type { EtatSessionRelationVectorielle, PhaseRelationVectorielle, ResultatExerciceRelationVectorielle } from "./moteur/typesRelationVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationVectorielle } from "./generateurs/relationVectorielle";
import type { VarianteRelationVectorielle } from "./core/relationVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeTranslationVectorielle } from "./components/EtapeTranslationVectorielle";
import { EtapeTraductionRelationVectorielle } from "./components/EtapeTraductionRelationVectorielle";
import { EtapeCoordonneesRelationVectorielle } from "./components/EtapeCoordonneesRelationVectorielle";
import { ResultatPanelRelationVectorielle } from "./components/ResultatPanelRelationVectorielle";
import { ResumeSessionRelationVectorielle } from "./components/ResumeSessionRelationVectorielle";
import { calculerRecapitulatifRelationVectorielle } from "./ui/recapitulatifRelationVectorielle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationVectorielle {
  return demarrerSessionRelationVectorielle(REGLAGES_DEMO, genererExerciceRelationVectorielle);
}

interface Bilan {
  resultat: ResultatExerciceRelationVectorielle;
  exercice: ExerciceRelationVectorielle;
}

const LIBELLE_PHASE: Record<PhaseRelationVectorielle, string> = {
  traduction: "Traduction en coordonnées",
  coordonnees: "Coordonnées",
};

/**
 * "Point à partir d'une relation vectorielle" — version GUIDÉE (position 20, remplace "Problèmes
 * contextualisés"). Distincte du générateur homonyme en position 21 (`AppPointVectoriel.tsx`) — voir
 * `core/relationVectorielle.types.ts` pour la justification de cette coexistence assumée. Le
 * sous-titre ("version guidée") est la seule différence visible sur l'écran d'accueil entre les deux
 * générateurs, dont le libellé de bouton diffère aussi ("(guidée)", `src/App.tsx`).
 */
export function AppRelationVectorielle() {
  const [etat, setEtat] = useState<EtatSessionRelationVectorielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceRelationVectorielle, nouvelEtat: EtatSessionRelationVectorielle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifRelationVectorielle(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionRelationVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteRelationVectorielle)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Point à partir d'une relation vectorielle</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel (version guidée)</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelRelationVectorielle
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionRelationVectorielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.exerciceCourant.variante === "translation" ? (
          <EtapeTranslationVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(x, y) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseCoordonnees(etat, x, y));
            }}
          />
        ) : etat.phase === "traduction" ? (
          <EtapeTraductionRelationVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(texte) => setEtat(soumettreReponseTraduction(etat, texte))}
          />
        ) : (
          <EtapeCoordonneesRelationVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={recapitulatif}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(x, y) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseCoordonnees(etat, x, y));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
