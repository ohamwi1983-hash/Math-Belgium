import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculAires } from "./generateurs6e/calculAires";
import type { IdVarianteCalculAires } from "./generateurs6e/calculAires";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculAires, soumettreReponseEcran } from "./moteur6e/sessionCalculAires";
import type { EtatSessionCalculAires, PhaseCalculAires, ResultatExerciceCalculAires } from "./moteur6e/typesCalculAires";
import { diagnostiquerEcran } from "./moteur6e/verificationCalculAires";
import { EtapeChampsCalculAires } from "./components6e/EtapeChampsCalculAires";
import { EtapeRacinesCalculAires } from "./components6e/EtapeRacinesCalculAires";
import { ResultatPanelCalculAires } from "./components6e/ResultatPanelCalculAires";
import { ResumeSessionCalculAires } from "./components6e/ResumeSessionCalculAires";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCalculAires";

/**
 * `6gen26` — Calcul d'aires par intégrale (chapitre 4, "Intégrales et primitives"). Même patron que
 * `App6gen23.tsx` (6gen23) : un dispatcher générique piloté par `ui6e/formatCalculAires.ts`/
 * `moteur6e/verificationCalculAires.ts`, PAS de JSX par famille/écran — SAUF pour les 3 écrans
 * "racines" (bEcran1/cEcran1/dEcran1), rendus par un composant add-as-needed DÉDIÉ
 * (`EtapeRacinesCalculAires`) plutôt que le composant générique à champs fixes
 * (`EtapeChampsCalculAires`), un ensemble de racines étant de taille variable par nature (convention
 * CLAUDE.md "add-as-needed").
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionCalculAires {
  return demarrerSessionCalculAires(REGLAGES_DEMO, genererExerciceCalculAires);
}

type AideParPhase = Partial<Record<PhaseCalculAires, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceCalculAires;
  aideParPhase: AideParPhase;
}


const ECRANS_RACINES: PhaseCalculAires[] = ["bEcran1", "cEcran1", "dEcran1"];

const NOMBRE_INITIAL_RACINES: Partial<Record<PhaseCalculAires, number>> = { bEcran1: 2, cEcran1: 3, dEcran1: 2 };

export function App6gen26() {
  const [etat, setEtat] = useState<EtatSessionCalculAires>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionCalculAires) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23 répliqué à l'identique (voir
    // `moteur6e/sessionCalculAires.ts`, fonction `soumettreReponseEcran`).
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
    setAideParPhase({});
    setEtat(demarrerSessionCalculAires(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCalculAires)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen23.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen26?: unknown }).__debug6gen26 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul d'aires par intégrale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && ECRANS_RACINES.includes(phase) && (
          <EtapeRacinesCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            placeholder="ex : 2"
            labelAjout="+ Ajouter une racine"
            nombreInitial={NOMBRE_INITIAL_RACINES[phase] ?? 2}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && !ECRANS_RACINES.includes(phase) && (
          <EtapeChampsCalculAires
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelCalculAires resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionCalculAires resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
