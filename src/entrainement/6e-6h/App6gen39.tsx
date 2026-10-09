import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRacinesNiemes } from "./generateurs6e/racinesNiemes";
import type { IdVarianteRacinesNiemes } from "./generateurs6e/racinesNiemes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionRacinesNiemes, soumettreReponseEcran } from "./moteur6e/sessionRacinesNiemes";
import type { EtatSessionRacinesNiemes, PhaseRacinesNiemes, ResultatExerciceRacinesNiemes } from "./moteur6e/typesRacinesNiemes";
import { diagnostiquerEcran } from "./moteur6e/verificationRacinesNiemes";
import { EtapeChampsRacinesNiemes } from "./components6e/EtapeChampsRacinesNiemes";
import { EtapeChoixRelationRacinesNiemes } from "./components6e/EtapeChoixRelationRacinesNiemes";
import { EtapeListeRacinesNiemes } from "./components6e/EtapeListeRacinesNiemes";
import { ResultatPanelRacinesNiemes } from "./components6e/ResultatPanelRacinesNiemes";
import { ResumeSessionRacinesNiemes } from "./components6e/ResumeSessionRacinesNiemes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatRacinesNiemes";

/**
 * `6gen39` — Racines n-ièmes d'un nombre complexe (chapitre 7, "Nombres complexes", après `6gen34`/
 * `6gen35`/`6gen37`/`6gen38`). Même patron dispatcher générique que `App6gen37.tsx`, avec 3 types
 * d'écran plutôt que 2 : écran de CHOIX (famille C écran 1, `EtapeChoixRelationRacinesNiemes`), écran
 * LISTE add-as-needed (famille A écran 3, famille C écrans 2/3 — nombre de racines variable selon
 * `n`, `EtapeListeRacinesNiemes`) et écran à champs GÉNÉRIQUE (tous les autres,
 * `EtapeChampsRacinesNiemes`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionRacinesNiemes {
  return demarrerSessionRacinesNiemes(REGLAGES_DEMO, genererExerciceRacinesNiemes);
}

type AideParPhase = Partial<Record<PhaseRacinesNiemes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceRacinesNiemes;
  aideParPhase: AideParPhase;
}


export function App6gen39() {
  const [etat, setEtat] = useState<EtatSessionRacinesNiemes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionRacinesNiemes) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen37/6gen34 répliqué à l'identique.
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
    setEtat(demarrerSessionRacinesNiemes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteRacinesNiemes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen39?: unknown }).__debug6gen39 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const estEcranChoix = exercice.famille === "C" && phase === "cEcran1";
  const estEcranListe = (exercice.famille === "A" && phase === "aEcran3") || (exercice.famille === "C" && (phase === "cEcran2" || phase === "cEcran3"));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Racines n-ièmes d'un nombre complexe</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && estEcranChoix && (
          <EtapeChoixRelationRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {enCoursDeSession && estEcranListe && (
          <EtapeListeRacinesNiemes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            nAttendu={exercice.n}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && !estEcranChoix && !estEcranListe && (
          <EtapeChampsRacinesNiemes
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

        {dernierBilan && <ResultatPanelRacinesNiemes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionRacinesNiemes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
