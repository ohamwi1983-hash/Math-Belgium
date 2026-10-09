import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAireExcentriciteConique } from "./generateurs6e/aireExcentriciteConique";
import type { IdVarianteAireExcentriciteConique } from "./generateurs6e/aireExcentriciteConique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionAireExcentriciteConique, soumettreReponseEcran } from "./moteur6e/sessionAireExcentriciteConique";
import type { EtatSessionAireExcentriciteConique, PhaseAireExcentriciteConique, ResultatExerciceAireExcentriciteConique } from "./moteur6e/typesAireExcentriciteConique";
import { diagnostiquerEcran } from "./moteur6e/verificationAireExcentriciteConique";
import { EtapeChampsAireExcentriciteConique } from "./components6e/EtapeChampsAireExcentriciteConique";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { ResultatPanelAireExcentriciteConique } from "./components6e/ResultatPanelAireExcentriciteConique";
import { ResumeSessionAireExcentriciteConique } from "./components6e/ResumeSessionAireExcentriciteConique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatAireExcentriciteConique";

/**
 * `6gen60` — Aire via rayons focaux et excentricité depuis une condition géométrique. Chapitre "Les
 * coniques" (fondation `6gen58`, voir `docs/historique-6e.md`). Même patron que `App6gen59.tsx` : un
 * dispatcher générique piloté par
 * `ui6e/formatAireExcentriciteConique.ts`/`moteur6e/verificationAireExcentriciteConique.ts`, PAS de
 * JSX par famille/écran — un SEUL composant écran (`EtapeChampsAireExcentriciteConique`), piloté
 * entièrement par `champs: ChampDef[]` (ici, uniquement des champs texte libre — aucun écran de
 * choix pour ce générateur).
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen58.tsx`/`App6gen59.tsx`) : le rôle de rappel persistant est déjà rempli par `blocDonnees`,
 * réaffiché identique sur chaque écran.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionAireExcentriciteConique {
  return demarrerSessionAireExcentriciteConique(REGLAGES_DEMO, genererExerciceAireExcentriciteConique);
}

type AideParPhase = Partial<Record<PhaseAireExcentriciteConique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceAireExcentriciteConique;
  aideParPhase: AideParPhase;
}


export function App6gen60() {
  const [etat, setEtat] = useState<EtatSessionAireExcentriciteConique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionAireExcentriciteConique) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
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
    setEtat(demarrerSessionAireExcentriciteConique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAireExcentriciteConique)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen59.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen60?: unknown }).__debug6gen60 = { exercice, phase, champs: enCoursDeSession ? champsEcran(exercice, phase) : null };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, enCoursDeSession ? niveauAideMaxEcran(exercice, phase) : 0),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  // Wiring calculatrice scientifique — seuls 2 écrans du chapitre demandent un calcul décimal/
  // irrationnel réel (racine carrée non triviale, jamais réductible à une fraction exacte) : l'aire
  // du triangle FPF' (famille A, écran 3 — sin(angle) déduit de cos(angle) par Pythagore, puis
  // produit) et l'excentricité e (famille B, écran 2 — 1/√k pour `distanceDirectrices`, √2/2 pour
  // les 2 autres sous-types). Tous les autres écrans du générateur restent des fractions/entiers
  // exacts (|PF|,|PF'|, cos(angle), l'équation posée) — pas de calculatrice là, même principe que
  // `App6gen12.tsx` ("toute case où le calcul à la main implique... une exponentielle non triviale
  // l'obtient ; les écrans purement symboliques... ne l'obtiennent pas").
  const calculatriceVisible = (exercice.famille === "A" && phase === "aEcran3") || (exercice.famille === "B" && phase === "bEcran2");

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Aire via rayons focaux et excentricité</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsAireExcentriciteConique
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
        {enCoursDeSession && calculatriceVisible && <CalculatriceScientifique />}

        {dernierBilan && <ResultatPanelAireExcentriciteConique resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionAireExcentriciteConique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
