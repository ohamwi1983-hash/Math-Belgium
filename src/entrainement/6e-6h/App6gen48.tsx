import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import type { IdVarianteBinomialeSequenceOrdonnee } from "./generateurs6e/binomialeSequenceOrdonnee";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionBinomialeSequenceOrdonnee, soumettreReponseEcran } from "./moteur6e/sessionBinomialeSequenceOrdonnee";
import type { EtatSessionBinomialeSequenceOrdonnee, PhaseBinomialeSequenceOrdonnee, ResultatExerciceBinomialeSequenceOrdonnee } from "./moteur6e/typesBinomialeSequenceOrdonnee";
import { diagnostiquerEcran } from "./moteur6e/verificationBinomialeSequenceOrdonnee";
import { EtapeChampsBinomialeSequenceOrdonnee } from "./components6e/EtapeChampsBinomialeSequenceOrdonnee";
import { ResultatPanelBinomialeSequenceOrdonnee } from "./components6e/ResultatPanelBinomialeSequenceOrdonnee";
import { ResumeSessionBinomialeSequenceOrdonnee } from "./components6e/ResumeSessionBinomialeSequenceOrdonnee";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatBinomialeSequenceOrdonnee";

/**
 * `6gen48` — Probabilité binomiale et séquence exacte sans remise. Même patron que
 * `App6gen43.tsx`/`App6gen44.tsx` : un dispatcher générique piloté par
 * `ui6e/formatBinomialeSequenceOrdonnee.ts`/`moteur6e/verificationBinomialeSequenceOrdonnee.ts`,
 * PAS de JSX par famille/écran — un SEUL composant écran (`EtapeChampsBinomialeSequenceOrdonnee`)
 * gère À LA FOIS les champs texte libre ET l'écran de choix (famille A écran 1, "stratégie"),
 * piloté entièrement par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionBinomialeSequenceOrdonnee {
  return demarrerSessionBinomialeSequenceOrdonnee(REGLAGES_DEMO, genererExerciceBinomialeSequenceOrdonnee);
}

type AideParPhase = Partial<Record<PhaseBinomialeSequenceOrdonnee, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceBinomialeSequenceOrdonnee;
  aideParPhase: AideParPhase;
}


export function App6gen48() {
  const [etat, setEtat] = useState<EtatSessionBinomialeSequenceOrdonnee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionBinomialeSequenceOrdonnee) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen37/6gen43 répliqué
    // à l'identique.
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
    setEtat(demarrerSessionBinomialeSequenceOrdonnee(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteBinomialeSequenceOrdonnee)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen48?: unknown }).__debug6gen48 = { exercice, phase };
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
        <h1 className="app-title">Probabilité binomiale et séquence exacte</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsBinomialeSequenceOrdonnee
            // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
            // (`moteur6e/typesBinomialeSequenceOrdonnee.ts`/`sessionBinomialeSequenceOrdonnee.ts`) :
            // bug trouvé en vérification Playwright, 2 exercices consécutifs de famille B avec un
            // `k` différent peuvent partager la MÊME phase de départ ("bEcran1"), auquel cas `phase`
            // seul comme clé ne force pas de remontage et l'état interne `valeurs` (mauvaise
            // longueur) reste collé à l'ancien exercice.
            key={`${etat.generationId}-${phase}`}
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

        {dernierBilan && <ResultatPanelBinomialeSequenceOrdonnee resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionBinomialeSequenceOrdonnee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
