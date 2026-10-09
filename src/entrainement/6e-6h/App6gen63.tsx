import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import type { IdVarianteProprietesOptiquesConiques } from "./generateurs6e/proprietesOptiquesConiques";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesOptiquesConiques, soumettreReponseEcran } from "./moteur6e/sessionProprietesOptiquesConiques";
import type { EtatSessionProprietesOptiquesConiques, PhaseProprietesOptiquesConiques, ResultatExerciceProprietesOptiquesConiques } from "./moteur6e/typesProprietesOptiquesConiques";
import { diagnostiquerEcran } from "./moteur6e/verificationProprietesOptiquesConiques";
import { EtapeChampsProprietesOptiquesConiques } from "./components6e/EtapeChampsProprietesOptiquesConiques";
import { ResultatPanelProprietesOptiquesConiques } from "./components6e/ResultatPanelProprietesOptiquesConiques";
import { ResumeSessionProprietesOptiquesConiques } from "./components6e/ResumeSessionProprietesOptiquesConiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatProprietesOptiquesConiques";

/**
 * `6gen63` — Propriétés optiques des coniques. Chapitre "Les coniques", 6e FWB (6h) — générateur DE
 * CLÔTURE du chapitre (voir `docs/historique-6e.md`). Même patron que `App6gen62.tsx` : un
 * dispatcher générique piloté par `ui6e/formatProprietesOptiquesConiques.ts`/`moteur6e/
 * verificationProprietesOptiquesConiques.ts`, PAS de JSX par écran — un SEUL composant écran
 * (`EtapeChampsProprietesOptiquesConiques`) gère tous les champs texte/choix, piloté entièrement par
 * `champs: ChampDef[]`.
 *
 * **Pas de `QuestionFinale`** — même convention que `6gen58`/`6gen59`/`6gen61`/`6gen62` : le rôle de
 * rappel persistant est déjà rempli par `blocDonnees`, réaffiché identique sur chaque écran.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesOptiquesConiques {
  return demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, genererExerciceProprietesOptiquesConiques);
}

type AideParPhase = Partial<Record<PhaseProprietesOptiquesConiques, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceProprietesOptiquesConiques;
  aideParPhase: AideParPhase;
}


export function App6gen63() {
  const [etat, setEtat] = useState<EtatSessionProprietesOptiquesConiques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionProprietesOptiquesConiques) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setAideParPhase({});
    setEtat(demarrerSessionProprietesOptiquesConiques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteProprietesOptiquesConiques)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen62.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen63?: unknown }).__debug6gen63 = { exercice, phase, champs: enCoursDeSession ? champsEcran(exercice, phase) : null };
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
        <h1 className="app-title">Propriétés optiques des coniques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsProprietesOptiquesConiques
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

        {dernierBilan && <ResultatPanelProprietesOptiquesConiques resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionProprietesOptiquesConiques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
