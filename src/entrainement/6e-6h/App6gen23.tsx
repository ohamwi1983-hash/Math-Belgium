import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculPrimitives } from "./generateurs6e/calculPrimitives";
import type { IdVarianteCalculPrimitives } from "./generateurs6e/calculPrimitives";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionCalculPrimitives, soumettreReponseEcran } from "./moteur6e/sessionCalculPrimitives";
import type { EtatSessionCalculPrimitives, PhaseCalculPrimitives, ResultatExerciceCalculPrimitives } from "./moteur6e/typesCalculPrimitives";
import { diagnostiquerEcran } from "./moteur6e/verificationCalculPrimitives";
import { EtapeChampsCalculPrimitives } from "./components6e/EtapeChampsCalculPrimitives";
import { ResultatPanelCalculPrimitives } from "./components6e/ResultatPanelCalculPrimitives";
import { ResumeSessionCalculPrimitives } from "./components6e/ResumeSessionCalculPrimitives";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatCalculPrimitives";

/**
 * `6gen23` — Calcul de primitives (chapitre 4, "Intégrales et primitives"). Contrairement aux
 * générateurs précédents du chantier, ce fichier ne contient PAS de bloc JSX par famille/écran : un
 * seul rendu `<EtapeChampsCalculPrimitives>`, entièrement piloté par les fonctions de dispatch de
 * `ui6e/formatCalculPrimitives.ts` (`champsEcran`, `consigneEcran`, etc.) et `verificationCalculPrimitives.ts`
 * (`diagnostiquerEcran`) — voir l'en-tête de ces deux fichiers pour la justification (déviation
 * délibérée du patron `6gen18`, ~24 écrans à travers 7 familles rendraient un JSX par écran
 * ingérable). Aucune calculatrice scientifique : tous les champs de ce générateur attendent une
 * EXPRESSION symbolique (jamais une valeur décimale calculée à la main), contrairement à 6gen16/18.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionCalculPrimitives {
  return demarrerSessionCalculPrimitives(REGLAGES_DEMO, genererExerciceCalculPrimitives);
}

type AideParPhase = Partial<Record<PhaseCalculPrimitives, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceCalculPrimitives;
  aideParPhase: AideParPhase;
}


export function App6gen23() {
  const [etat, setEtat] = useState<EtatSessionCalculPrimitives>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionCalculPrimitives) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron `6gen18`/`6gen21` répliqué à
    // l'identique (voir `moteur6e/sessionCalculPrimitives.ts`, fonction `soumettreReponseEcran`).
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
    setEtat(demarrerSessionCalculPrimitives(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteCalculPrimitives)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché
  // (fragile). Jamais consommé par le code applicatif lui-même, uniquement par un script de test
  // externe — voir `docs/historique-6e.md` pour la vérification Playwright de 6gen23.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen23?: unknown }).__debug6gen23 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul de primitives</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsCalculPrimitives
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

        {dernierBilan && <ResultatPanelCalculPrimitives resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionCalculPrimitives resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
