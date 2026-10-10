import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationExponentielle } from "./generateurs6e/equationsExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEquationExponentielle,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2Liste,
  soumettreReponseAEcran2Valeur,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran,
} from "./moteur6e/sessionEquationsExponentielles";
import type {
  EtatSessionEquationExponentielle,
  PhaseEquationExponentielle,
  ResultatExerciceEquationExponentielle,
} from "./moteur6e/typesEquationsExponentielles";
import { EtapeChampEquExpo } from "./components6e/EtapeChampEquExpo";
import { EtapeListeEquExpo } from "./components6e/EtapeListeEquExpo";
import { EtapeReconnaitreImpossibleEquExpo } from "./components6e/EtapeReconnaitreImpossibleEquExpo";
import { EtapeValeurOuVideEquExpo } from "./components6e/EtapeValeurOuVideEquExpo";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { ResultatPanelEquationExponentielle } from "./components6e/ResultatPanelEquationExponentielle";
import { ResumeSessionEquationExponentielle } from "./components6e/ResumeSessionEquationExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, consigneEcran, etatActuel, formatEnonceLatex } from "./ui6e/formatEquationsExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationExponentielle {
  return demarrerSessionEquationExponentielle(REGLAGES_DEMO, genererExerciceEquationExponentielle);
}

type AideParPhase = Partial<Record<PhaseEquationExponentielle, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceEquationExponentielle;
  aideParPhase: AideParPhase;
}

export function App6gen9() {
  const [etat, setEtat] = useState<EtatSessionEquationExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionEquationExponentielle) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionEquationsExponentielles.ts` et `docs/historique-6e.md`).
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const etatActuelValeur = etatActuel(exercice, phase);

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen58.tsx`/`App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen9?: unknown }).__debug6gen9 = { exercice, phase };
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une équation exponentielle</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {phase === "aEcran1" && (
                <EtapeChampEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  placeholder={exercice.famille === "A" && exercice.sousType === "A2" ? "ex : 2^(3*x-1)-2^5=0" : "ex : 3, -2, 1/2..."}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte))}
                />
              )}
              {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType !== "A3" && (
                <EtapeChampEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  placeholder="ex : 4/3, -1.5..."
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseAEcran2Valeur(etat, texte))}
                />
              )}
              {phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "A3" && (
                <EtapeListeEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  placeholder="ex : -1"
                  labelAjout="+ Ajouter une solution"
                  labelAucune="∅ — Aucune solution"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseAEcran2Liste(etat, textes))}
                />
              )}

              {phase === "bEcran1" && (
                <EtapeChampEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  placeholder="ex : (3*x+1)/2"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte))}
                />
              )}
              {phase === "bEcran2" && (
                <EtapeValeurOuVideEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  placeholder="ex : 1, -2/3..."
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseBEcran2(etat, reponse))}
                />
              )}

              {phase === "cEcran1" && (
                <EtapeChampEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  placeholder="ex : 2*t^2-3*t-5=0"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte))}
                />
              )}
              {phase === "cEcran2" && (
                <EtapeListeEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  placeholder="ex : -3, 5..."
                  labelAjout="+ Ajouter une valeur de t"
                  labelAucune="Aucune valeur de t"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseCEcran2(etat, textes))}
                />
              )}
              {phase === "cEcran3" && (
                <EtapeListeEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  placeholder="ex : 1, 2.5..."
                  labelAjout="+ Ajouter une solution"
                  labelAucune="∅ — Aucune solution"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes))}
                />
              )}
              {phase === "cEcran3" && <CalculatriceScientifique />}

              {phase === "dEcran" && (
                <EtapeReconnaitreImpossibleEquExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelValeur}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(existeUneSolution) => terminerEtape(soumettreReponseDEcran(etat, existeUneSolution))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelEquationExponentielle
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEquationExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
