import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIdentificationConiques } from "./generateurs6e/identificationConiques";
import type { IdVarianteIdentificationConiques } from "./generateurs6e/identificationConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIdentificationConiques, soumettreReponseEcran } from "./moteur6e/sessionIdentificationConiques";
import type { EtatSessionIdentificationConiques, PhaseIdentificationConiques, ResultatExerciceIdentificationConiques } from "./moteur6e/typesIdentificationConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationIdentificationConiques";
import { EtapeChampsIdentificationConiques } from "./components6e/EtapeChampsIdentificationConiques";
import { ResultatPanelIdentificationConiques } from "./components6e/ResultatPanelIdentificationConiques";
import { ResumeSessionIdentificationConiques } from "./components6e/ResumeSessionIdentificationConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIdentificationConiques";

/**
 * `6gen58` — Identification d'une conique et de ses éléments caractéristiques. GÉNÉRATEUR
 * D'OUVERTURE du chapitre "Les coniques" (voir `docs/historique-6e.md`). Même patron que
 * `App6gen43.tsx`/`App6gen50.tsx` : un dispatcher générique piloté par
 * `ui6e/formatIdentificationConiques.ts`/`moteur6e/verificationIdentificationConiques.ts`, PAS de
 * JSX par famille/écran — un SEUL composant écran (`EtapeChampsIdentificationConiques`) gère à la
 * fois les champs texte libre (y compris les réponses algébriques gardées structurellement) et les
 * écrans de choix, piloté entièrement par `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen53.tsx`/`App6gen49.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au
 * patron narratif "1 seul problème long" du chantier 4e, jamais adopté par le chantier 6e
 * (dispatcher générique par écrans courts, `consigneEcran` change à chaque phase — le rôle de
 * rappel persistant est déjà rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIdentificationConiques {
  return demarrerSessionIdentificationConiques(REGLAGES_DEMO, genererExerciceIdentificationConiques);
}

type AideParPhase = Partial<Record<PhaseIdentificationConiques, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceIdentificationConiques;
  aideParPhase: AideParPhase;
}


export function App6gen58() {
  const [etat, setEtat] = useState<EtatSessionIdentificationConiques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionIdentificationConiques) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen26/6gen43 répliqué à
    // l'identique.
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
    setEtat(demarrerSessionIdentificationConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIdentificationConiques)));
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
    // `champs` inclus (en plus de `exercice`/`phase`) — permet à un script Playwright de
    // reconstruire les boutons de choix par leur VALEUR technique (`option.valeur`), jamais par le
    // texte du bouton (fragile, dépend du libellé français affiché).
    (window as unknown as { __debug6gen58?: unknown }).__debug6gen58 = { exercice, phase, champs: enCoursDeSession ? champsEcran(exercice, phase) : null };
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
        <h1 className="app-title">Identification d'une conique et de ses éléments caractéristiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsIdentificationConiques
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

        {dernierBilan && <ResultatPanelIdentificationConiques resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionIdentificationConiques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
