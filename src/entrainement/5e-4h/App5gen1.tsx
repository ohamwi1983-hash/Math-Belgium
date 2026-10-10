import { useState } from "react";
import type { ExerciceDomaineDefinition, FamilleDomaineDefinition } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./generateurs5e/domaineDefinition";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionDomaineDefinition,
  niveauAideMaxCE,
  niveauAideMaxDomf,
  soumettreReponseCE,
  soumettreReponseDomf,
  soumettreReponseResolution,
} from "./moteur5e/sessionDomaineDefinition";
import type { EtatSessionDomaineDefinition, ResultatExerciceDomaineDefinition } from "./moteur5e/typesDomaineDefinition";
import { EtapeCEDomaineDefinition } from "./components5e/EtapeCEDomaineDefinition";
import { EtapeResolutionDomaineDefinition } from "./components5e/EtapeResolutionDomaineDefinition";
import { EtapeDomfDomaineDefinition } from "./components5e/EtapeDomfDomaineDefinition";
import { ResultatPanelDomaineDefinition } from "./components5e/ResultatPanelDomaineDefinition";
import { ResumeSessionDomaineDefinition } from "./components5e/ResumeSessionDomaineDefinition";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDefinition {
  return demarrerSessionDomaineDefinition(REGLAGES_DEMO, genererExerciceDomaineDefinition);
}

interface Bilan {
  resultat: ResultatExerciceDomaineDefinition;
}

export function App5gen1() {
  const [etat, setEtat] = useState<EtatSessionDomaineDefinition>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  // Compteur de génération — le panneau dev "forcer une variante" peut remplacer `exerciceCourant`
  // sans jamais changer `phase` (toujours "ce" avant ET après, les 6 familles démarrant toutes sur
  // cet écran) : sans clé dédiée, React réutilise l'instance déjà montée d'`EtapeCEDomaineDefinition`
  // au lieu de la remonter, laissant son état interne (`lignes`, notamment `slotId`) figé sur
  // l'exercice PRÉCÉDENT — même classe de bug que gen53 (4e)/5gen6/5gen7 ("composant d'écran partagé
  // non remonté entre phases"), ici entre deux exercices plutôt qu'entre deux écrans. Le flux normal
  // (recap → "Exercice suivant") démonte déjà `EtapeCEDomaineDefinition` naturellement le temps du
  // récapitulatif, donc jamais atteint par un élève — uniquement via le panneau dev.
  const [generationExercice, setGenerationExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDefinition) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice: ExerciceDomaineDefinition = etat.exerciceCourant;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Domaine de définition</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setGenerationExercice((g) => g + 1);
          setEtat(demarrerSessionDomaineDefinition(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleDomaineDefinition)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "ce" && (
                <EtapeCEDomaineDefinition
                  key={generationExercice}
                  exercice={exercice}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAideCE}
                  niveauAideMax={niveauAideMaxCE(exercice)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  donnees={
                    <div className="equation-box">
                      <Katex expression={exercice.fLatex} block />
                    </div>
                  }
                  onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
                />
              )}
              {etat.phase === "resolution" && (
                <EtapeResolutionDomaineDefinition
                  key={generationExercice}
                  exercice={exercice}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  donnees={
                    <div className="equation-box">
                      <Katex expression={exercice.fLatex} block />
                    </div>
                  }
                  onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse))}
                />
              )}
              {etat.phase === "domf" && (
                <EtapeDomfDomaineDefinition
                  key={generationExercice}
                  exercice={exercice}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAideDomf}
                  niveauAideMax={niveauAideMaxDomf(exercice)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  donnees={
                    <div className="equation-box">
                      <Katex expression={exercice.fLatex} block />
                    </div>
                  }
                  onValider={(reponse) => terminerEtape(soumettreReponseDomf(etat, reponse))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelDomaineDefinition resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionDomaineDefinition resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
