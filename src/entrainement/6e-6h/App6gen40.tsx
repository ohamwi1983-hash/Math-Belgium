import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTransformationsPlan } from "./generateurs6e/transformationsPlan";
import type { IdVarianteTransformationsPlan } from "./generateurs6e/transformationsPlan";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTransformationsPlan, soumettreReponseEcran } from "./moteur6e/sessionTransformationsPlan";
import type { EtatSessionTransformationsPlan, PhaseTransformationsPlan, ResultatExerciceTransformationsPlan } from "./moteur6e/typesTransformationsPlan";
import { diagnostiquerEcran } from "./moteur6e/verificationTransformationsPlan";
import { EtapeChampsTransformationsPlan } from "./components6e/EtapeChampsTransformationsPlan";
import { EtapeChoixFormuleTransformationsPlan } from "./components6e/EtapeChoixFormuleTransformationsPlan";
import { EtapeImagesTransformationsPlan } from "./components6e/EtapeImagesTransformationsPlan";
import { EtapeTypeParametresTransformationsPlan } from "./components6e/EtapeTypeParametresTransformationsPlan";
import { ResultatPanelTransformationsPlan } from "./components6e/ResultatPanelTransformationsPlan";
import { ResumeSessionTransformationsPlan } from "./components6e/ResumeSessionTransformationsPlan";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, optionsFormuleA, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatTransformationsPlan";

/**
 * `6gen40` — Transformations du plan via les nombres complexes (chapitre 7, "Nombres complexes",
 * suite du chapitre après `6gen34`/`6gen35`/`6gen37`/`6gen38`). Même patron que `App6gen37.tsx` : un
 * dispatcher générique piloté par `ui6e/formatTransformationsPlan.ts`/
 * `moteur6e/verificationTransformationsPlan.ts`, PAS de JSX par famille/écran — SAUF 3 écrans :
 * `aEcran1` (famille A, QCM "poser la formule"), `bEcran2` (famille B, "type + paramètres"),
 * `cEcran3` (famille C, add-as-needed "images des autres points"), chacun rendu par son composant
 * dédié plutôt que le composant générique à champs texte.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTransformationsPlan {
  return demarrerSessionTransformationsPlan(REGLAGES_DEMO, genererExerciceTransformationsPlan);
}

type AideParPhase = Partial<Record<PhaseTransformationsPlan, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceTransformationsPlan;
  aideParPhase: AideParPhase;
}


export function App6gen40() {
  const [etat, setEtat] = useState<EtatSessionTransformationsPlan>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionTransformationsPlan) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen34/6gen37 répliqué à l'identique.
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
    setEtat(demarrerSessionTransformationsPlan(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTransformationsPlan)));
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
    (window as unknown as { __debug6gen40?: unknown }).__debug6gen40 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  const estEcranChoixFormule = exercice.famille === "A" && phase === "aEcran1";
  const estEcranTypeParametres = exercice.famille === "B" && phase === "bEcran2";
  const estEcranImages = exercice.famille === "C" && phase === "cEcran3";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Transformations du plan via les nombres complexes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && estEcranChoixFormule && exercice.famille === "A" && (
          <EtapeChoixFormuleTransformationsPlan
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            options={optionsFormuleA(exercice.parametres.sousType)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]))}
          />
        )}

        {enCoursDeSession && estEcranTypeParametres && (
          <EtapeTypeParametresTransformationsPlan
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && estEcranImages && exercice.famille === "C" && (
          <EtapeImagesTransformationsPlan
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            nombreMaxPoints={exercice.autresPoints.length}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {enCoursDeSession && !estEcranChoixFormule && !estEcranTypeParametres && !estEcranImages && (
          <EtapeChampsTransformationsPlan
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

        {dernierBilan && <ResultatPanelTransformationsPlan resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionTransformationsPlan resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
