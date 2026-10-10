import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./generateurs6e/proprietesLogarithme";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesLogarithme, soumettreReponseEcran1, soumettreReponseEcran2 } from "./moteur6e/sessionProprietesLogarithme";
import type { EtatSessionProprietesLogarithme, PhaseProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "./moteur6e/typesProprietesLogarithme";
import { diagnostiquerEcran1, diagnostiquerEcran2 } from "./moteur6e/verificationProprietesLogarithme";
import { EtapeProprieteLogarithme } from "./components6e/EtapeProprieteLogarithme";
import { ResultatPanelProprietesLogarithme } from "./components6e/ResultatPanelProprietesLogarithme";
import { ResumeSessionProprietesLogarithme } from "./components6e/ResumeSessionProprietesLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, etatActuel, expressionDemandeeLatex } from "./ui6e/formatProprietesLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesLogarithme {
  return demarrerSessionProprietesLogarithme(REGLAGES_DEMO, genererExerciceProprietesLogarithme);
}

type AideParPhase = Partial<Record<PhaseProprietesLogarithme, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceProprietesLogarithme;
  aideParPhase: AideParPhase;
}

export function App6gen13() {
  const [etat, setEtat] = useState<EtatSessionProprietesLogarithme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionProprietesLogarithme) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionProprietesLogarithme.ts` et `docs/historique-6e.md`).
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
    setEtat(demarrerSessionProprietesLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;

  const propsCommun = {
    consigneGenerale: CONSIGNE_GENERALE,
    expressionLatex: expressionDemandeeLatex(exercice),
    blocDonnees: blocDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: aideNiveau1(exercice, phase),
    aideNiveau2: aideNiveau2(exercice, phase),
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Propriétés du logarithme</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {phase === "ecran1" && (
              <EtapeProprieteLogarithme
                key={phase}
                {...propsCommun}
                placeholder="ex : m+n"
                diagnostiquer={(texte) => diagnostiquerEcran1(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseEcran1(etat, texte))}
              />
            )}
            {phase === "ecran2" && (
              <EtapeProprieteLogarithme
                key={phase}
                {...propsCommun}
                placeholder="ex : 3,874"
                diagnostiquer={(texte) => diagnostiquerEcran2(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseEcran2(etat, texte))}
              />
            )}
          </>
        )}
        {dernierBilan && (
          <ResultatPanelProprietesLogarithme resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
        )}
        {etat.terminee && !dernierBilan && <ResumeSessionProprietesLogarithme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
