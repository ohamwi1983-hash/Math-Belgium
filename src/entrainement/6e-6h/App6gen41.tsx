import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTrianglesComplexes } from "./generateurs6e/trianglesComplexes";
import type { IdVarianteTrianglesComplexes } from "./generateurs6e/trianglesComplexes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTrianglesComplexes, soumettreReponseEcran } from "./moteur6e/sessionTrianglesComplexes";
import type { EtatSessionTrianglesComplexes, PhaseTrianglesComplexes, ResultatExerciceTrianglesComplexes } from "./moteur6e/typesTrianglesComplexes";
import { diagnostiquerEcran } from "./moteur6e/verificationTrianglesComplexes";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeTrianglesComplexes } from "./components6e/EtapeTrianglesComplexes";
import { ResultatPanelTrianglesComplexes } from "./components6e/ResultatPanelTrianglesComplexes";
import { ResumeSessionTrianglesComplexes } from "./components6e/ResumeSessionTrianglesComplexes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, choixEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatTrianglesComplexes";

/**
 * `6gen41` — Propriétés géométriques de triangles via les nombres complexes (chapitre 7, "Nombres
 * complexes", générateur bâti sur l'infrastructure partagée établie par `6gen34`
 * (`moteur6e/expressionComplexe.ts`+`verificationComplexes.ts`) et `6gen37`
 * (`generateurs6e/formeTrigonometrique/familleA.ts`, `calculerModule`/`calculerArgument`/
 * `combinerModuleAngle`/`angles.ts`). Même patron que `App6gen37.tsx` : un dispatcher générique
 * piloté par `ui6e/formatTrianglesComplexes.ts`/`moteur6e/verificationTrianglesComplexes.ts`, PAS de
 * JSX par famille/écran — UN SEUL composant écran (`EtapeTrianglesComplexes`, champs+choix combinés)
 * suffit pour les 4 familles (contrairement à 6gen37, qui avait un écran de choix séparé).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTrianglesComplexes {
  return demarrerSessionTrianglesComplexes(REGLAGES_DEMO, genererExerciceTrianglesComplexes);
}

type AideParPhase = Partial<Record<PhaseTrianglesComplexes, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceTrianglesComplexes;
  aideParPhase: AideParPhase;
}


export function App6gen41() {
  const [etat, setEtat] = useState<EtatSessionTrianglesComplexes>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionTrianglesComplexes) {
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
    setEtat(demarrerSessionTrianglesComplexes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTrianglesComplexes)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Calculatrice flottante — SEUL écran du générateur avec un vrai calcul décimal/irrationnel
  // (famille B écran 4, angles via loi des cosinus : arccos d'un ratio décimal, réponse ATTENDUE en
  // DEGRÉS, tolérance 0.1° — `moteur6e/verificationTrianglesComplexes.ts`) — mirroir `App6gen9.tsx`
  // (`phase === "cEcran3" && <CalculatriceScientifique />`). Mode initial "DEG" (convention
  // transversale "DEG par défaut si applicable au contexte"), jamais le "RAD" par défaut du reste du
  // chantier 6e (contexte historique exponentielles/logarithmes, sans angle en degrés).
  const calculatriceVisible = exercice.famille === "B" && phase === "bEcran4";

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen41?: unknown }).__debug6gen41 = { exercice, phase };
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
        <h1 className="app-title">Propriétés géométriques de triangles via les nombres complexes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeTrianglesComplexes
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            choix={choixEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {enCoursDeSession && calculatriceVisible && <CalculatriceScientifique modeInitial="DEG" />}

        {dernierBilan && <ResultatPanelTrianglesComplexes resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionTrianglesComplexes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
