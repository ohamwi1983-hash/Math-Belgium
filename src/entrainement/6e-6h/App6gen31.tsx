import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTiragesArbres } from "./generateurs6e/tiragesArbres";
import type { IdVarianteTiragesArbres } from "./generateurs6e/tiragesArbres";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTiragesArbres, soumettreReponseEcran } from "./moteur6e/sessionTiragesArbres";
import type { EtatSessionTiragesArbres, PhaseTiragesArbres, ResultatExerciceTiragesArbres } from "./moteur6e/typesTiragesArbres";
import { diagnostiquerEcran } from "./moteur6e/verificationTiragesArbres";
import { EtapeChampsTiragesArbres } from "./components6e/EtapeChampsTiragesArbres";
import { ResultatPanelTiragesArbres } from "./components6e/ResultatPanelTiragesArbres";
import { ResumeSessionTiragesArbres } from "./components6e/ResumeSessionTiragesArbres";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel } from "./ui6e/formatTiragesArbres";

/**
 * `6gen31` — Tirages, arbres et dénombrement (chapitre 8, "Probabilités", DEUXIÈME générateur de ce
 * chapitre — construit sur l'infrastructure fondée par `6gen30`, voir
 * `moteur6e/verificationProbabilites.ts`). Même patron que `App6gen30.tsx` : aucun bloc JSX par
 * famille/écran, un seul dispatch piloté par `ui6e/formatTiragesArbres.ts` (`champsEcran`) et
 * `moteur6e/verificationTiragesArbres.ts` (`diagnostiquerEcran`). Contrairement à `6gen30`, AUCUN
 * écran à choix ici (les 3 familles ne posent que des champs texte libre — numériques ou, pour
 * `cEcran1`, une équation) : un seul composant écran (`EtapeChampsTiragesArbres`), jamais de
 * dispatch `estEcranChoix`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTiragesArbres {
  return demarrerSessionTiragesArbres(REGLAGES_DEMO, genererExerciceTiragesArbres);
}

type AideParPhase = Partial<Record<PhaseTiragesArbres, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceTiragesArbres;
  aideParPhase: AideParPhase;
}


export function App6gen31() {
  const [etat, setEtat] = useState<EtatSessionTiragesArbres>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionTiragesArbres) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron `6gen30` répliqué à l'identique (voir
    // `moteur6e/sessionTiragesArbres.ts`, fonction `soumettreReponseEcran`).
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
    setEtat(demarrerSessionTiragesArbres(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTiragesArbres)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen31?: unknown }).__debug6gen31 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    ...aideCommun,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Tirages, arbres et dénombrement</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsTiragesArbres key={phase} {...propsCommun} champs={champsEcran(exercice, phase)} diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)} onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))} />
        )}

        {dernierBilan && <ResultatPanelTiragesArbres resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionTiragesArbres resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
