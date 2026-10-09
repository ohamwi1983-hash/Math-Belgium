import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./generateurs6e/loiNormale";
import type { IdVarianteLoiNormale } from "./generateurs6e/loiNormale";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiNormale, soumettreReponseEcran } from "./moteur6e/sessionLoiNormale";
import type { EtatSessionLoiNormale, PhaseLoiNormale, ResultatExerciceLoiNormale } from "./moteur6e/typesLoiNormale";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiNormale";
import { EtapeChampsLoiNormale } from "./components6e/EtapeChampsLoiNormale";
import { ResultatPanelLoiNormale } from "./components6e/ResultatPanelLoiNormale";
import { ResumeSessionLoiNormale } from "./components6e/ResumeSessionLoiNormale";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, calculerReferenceLoiNormale, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiNormale";

/**
 * `6gen51` — Loi normale (premier générateur du nouveau chapitre "Variables aléatoires et lois de
 * probabilités"). Même patron que `App6gen37.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiNormale.ts`/`moteur6e/verificationLoiNormale.ts`, PAS de JSX par famille/écran —
 * un SEUL composant écran (`EtapeChampsLoiNormale`, mélange texte/choix) suffit pour toutes les
 * familles (voir en-tête de ce composant pour la justification, différente de 6gen37 qui avait
 * besoin d'un second composant dédié).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiNormale {
  return demarrerSessionLoiNormale(REGLAGES_DEMO, genererExerciceLoiNormale, calculerReferenceLoiNormale);
}

type AideParPhase = Partial<Record<PhaseLoiNormale, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceLoiNormale;
  aideParPhase: AideParPhase;
}


export function App6gen51() {
  const [etat, setEtat] = useState<EtatSessionLoiNormale>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});
  // Voir le commentaire sur `key` plus bas (rendu de `EtapeChampsLoiNormale`) : incrémenté à
  // chaque appel de `forcerVariante` UNIQUEMENT (le panneau dev repart toujours d'`indexExercice=0`
  // — `etat.indexExercice` seul ne suffit donc pas à distinguer 2 variantes forcées consécutives
  // partageant le même nom de phase initiale, ex. `A_superieur` puis `A_intervalle`, toutes deux
  // "aEcran1").
  const [nonceForcage, setNonceForcage] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionLoiNormale) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23/6gen28/6gen34/6gen37 répliqué
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
    setNonceForcage((n) => n + 1);
    setEtat(demarrerSessionLoiNormale(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiNormale), calculerReferenceLoiNormale));
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
    (window as unknown as { __debug6gen51?: unknown }).__debug6gen51 = { exercice, phase, reference: calculerReferenceLoiNormale(exercice, phase) };
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
        <h1 className="app-title">Loi normale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsLoiNormale
            // `${indexExercice}-${nonceForcage}-${phase}`, PAS seulement `phase` (à la différence
            // de `App6gen37.tsx`/`App6gen26.tsx`) — 6gen51 est le premier générateur où le NOMBRE
            // DE CHAMPS d'un même nom de phase varie aussi selon le SOUS-TYPE au sein de la MÊME
            // famille (ex. famille A "aEcran1" : 2 champs pour inferieur/superieur, 4 pour
            // intervalle) : 2 exercices CONSÉCUTIFS de la famille A avec des sous-types différents
            // partagent le même nom de phase ("aEcran1") sans que React ne remonte le composant
            // (clé inchangée) — l'état interne `valeurs` (`useState`, initialisé une seule fois à
            // la taille de `champs` du PREMIER montage) resterait alors à l'ANCIENNE taille,
            // cassant silencieusement la saisie des champs additionnels (bug trouvé et corrigé en
            // vérification Playwright, voir `docs/historique-6e.md`). `indexExercice` change à
            // CHAQUE nouvel exercice de la progression NATURELLE (jamais lors d'une simple
            // tentative ratée sur le même écran, qui doit continuer à préserver la saisie déjà
            // tapée) — mais repart TOUJOURS de 0 pour une variante forcée depuis le panneau dev,
            // d'où `nonceForcage` en complément (voir sa déclaration ci-dessus).
            key={`${etat.indexExercice}-${nonceForcage}-${phase}`}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            champs={champsEcran(exercice, phase)}
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs, calculerReferenceLoiNormale(exercice, phase))}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelLoiNormale resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLoiNormale resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
