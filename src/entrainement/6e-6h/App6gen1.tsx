import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInjectiviteFonctions } from "./generateurs6e/injectiviteFonctions";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInjectiviteFonctions,
  soumettreReponseBijection,
  soumettreReponseDomaine,
  soumettreReponseImage,
  soumettreReponseInjective,
  soumettreReponseReciproque,
} from "./moteur6e/sessionInjectiviteFonctions";
import type {
  EtatSessionInjectiviteFonctions,
  PhaseInjectiviteFonctions,
  ResultatExerciceInjectiviteFonctions,
} from "./moteur6e/typesInjectiviteFonctions";
import { EtapeBijectionInjectiviteFonctions } from "./components6e/EtapeBijectionInjectiviteFonctions";
import { EtapeDomaineInjectiviteFonctions } from "./components6e/EtapeDomaineInjectiviteFonctions";
import { EtapeImageInjectiviteFonctions } from "./components6e/EtapeImageInjectiviteFonctions";
import { EtapeInjectiveInjectiviteFonctions } from "./components6e/EtapeInjectiveInjectiviteFonctions";
import { EtapeReciproqueInjectiviteFonctions } from "./components6e/EtapeReciproqueInjectiviteFonctions";
import { ResultatPanelInjectiviteFonctions } from "./components6e/ResultatPanelInjectiviteFonctions";
import { ResumeSessionInjectiviteFonctions } from "./components6e/ResumeSessionInjectiviteFonctions";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInjectiviteFonctions {
  return demarrerSessionInjectiviteFonctions(REGLAGES_DEMO, genererExerciceInjectiviteFonctions);
}

interface Bilan {
  resultat: ResultatExerciceInjectiviteFonctions;
  /** Niveau d'aide RÉELLEMENT utilisé par écran — capturé côté présentation (`etat.niveauAide`
   * juste avant la soumission qui clôture chaque écran), puisque la Couche B ne le persiste pas par
   * phase (seuls les scores/`reveleXxx` le sont, voir `typesInjectiviteFonctions.ts`). Consommé par
   * `statutRecap` dans `ResultatPanelInjectiviteFonctions` (même convention que 5gen1/5gen3). */
  niveauAideParPhase: Partial<Record<PhaseInjectiviteFonctions, number>>;
}

export function App6gen1() {
  const [etat, setEtat] = useState<EtatSessionInjectiviteFonctions>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [niveauAideParPhase, setNiveauAideParPhase] = useState<Partial<Record<PhaseInjectiviteFonctions, number>>>({});

  function terminerEtape(nouvelEtat: EtatSessionInjectiviteFonctions) {
    const miseAJour = { ...niveauAideParPhase, [etat.phase]: etat.niveauAide };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], niveauAideParPhase: miseAJour });
      setNiveauAideParPhase({});
    } else {
      setNiveauAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setNiveauAideParPhase({});
    setEtat(demarrerSessionInjectiviteFonctions(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMax = NIVEAU_AIDE_MAX[etat.phase];
  const intervalleConfirme = exercice.injective
    ? exercice.domaine
    : etat.coteChoisi === "gauche"
      ? exercice.intervalleGauche
      : exercice.intervalleDroite;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fonctions injectives / surjectives / bijectives</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "domaine" && (
                <EtapeDomaineInjectiviteFonctions
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
                />
              )}
              {etat.phase === "injective" && (
                <EtapeInjectiveInjectiviteFonctions
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseInjective(etat, reponse))}
                />
              )}
              {etat.phase === "reciproque" && (
                <EtapeReciproqueInjectiviteFonctions
                  key={etat.phase}
                  exercice={exercice}
                  coteChoisi={etat.coteChoisi}
                  intervalleConfirme={intervalleConfirme}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseReciproque(etat, reponse))}
                />
              )}
              {etat.phase === "image" && (
                <EtapeImageInjectiviteFonctions
                  key={etat.phase}
                  exercice={exercice}
                  intervalleConfirme={intervalleConfirme}
                  coteChoisi={etat.coteChoisi}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseImage(etat, reponse))}
                />
              )}
              {etat.phase === "bijection" && (
                <EtapeBijectionInjectiviteFonctions
                  key={etat.phase}
                  exercice={exercice}
                  intervalleConfirme={intervalleConfirme}
                  coteChoisi={etat.coteChoisi}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMax}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseBijection(etat, reponse))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelInjectiviteFonctions
              resultat={dernierBilan.resultat}
              niveauAideParPhase={dernierBilan.niveauAideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionInjectiviteFonctions resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
