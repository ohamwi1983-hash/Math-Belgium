import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, construireQuellePrimitive } from "./generateurs6e/quellePrimitive";
import type { IdVarianteQuellePrimitive } from "./generateurs6e/quellePrimitive";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionQuellePrimitive, soumettreReponseEcran } from "./moteur6e/sessionQuellePrimitive";
import type { EtatSessionQuellePrimitive, PhaseQuellePrimitive, ResultatExerciceQuellePrimitive } from "./moteur6e/typesQuellePrimitive";
import { diagnostiquerEcranQuellePrimitive } from "./moteur6e/verificationQuellePrimitive";
import { EtapeChampsCalculPrimitives } from "./components6e/EtapeChampsCalculPrimitives";
import { ResultatPanelQuellePrimitive } from "./components6e/ResultatPanelQuellePrimitive";
import { ResumeSessionQuellePrimitive } from "./components6e/ResumeSessionQuellePrimitive";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonneesQuellePrimitive, champsQuellePrimitive, consigneEcranQuellePrimitive, consigneGeneraleQuellePrimitive, etatActuelQuellePrimitive, aideNiveau1QuellePrimitive, aideNiveau2QuellePrimitive } from "./ui6e/formatQuellePrimitive";

/**
 * `6gen24` — Quelle primitive ? (condition initiale) (chapitre 4, "Intégrales et primitives",
 * PROLONGE `6gen23`). Réutilise `EtapeChampsCalculPrimitives` (6gen23) TEL QUEL — composant DÉJÀ
 * générique (voir son en-tête : "GÉNÉRALISATION délibérée", paramétré uniquement par `ChampDef[]`/
 * `AideAvecLatex`, aucun couplage à un type d'exercice précis) : la même mécanique "consigne
 * générale → bloc données → bloc état actuel → bloc de travail" convient aussi bien aux écrans
 * empruntés qu'à notre écran final (2 champs, C puis F(x)) — écrire un second composant identique
 * n'aurait fait que dupliquer du code déjà testé. `SelecteurVarianteDev`/`LigneRecap`/`BoutonAide`
 * (via `EtapeChampsCalculPrimitives`) sont de la même façon des briques `components6e/` déjà
 * génériques, réutilisées sans modification (composants ↔ composants, réutilisation libre —
 * CLAUDE.md).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionQuellePrimitive {
  return demarrerSessionQuellePrimitive(REGLAGES_DEMO, construireQuellePrimitive);
}

type AideParPhase = Partial<Record<PhaseQuellePrimitive, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceQuellePrimitive;
  aideParPhase: AideParPhase;
}


export function App6gen24() {
  const [etat, setEtat] = useState<EtatSessionQuellePrimitive>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionQuellePrimitive) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md, patron 6gen23 répliqué à l'identique (voir
    // `moteur6e/sessionQuellePrimitive.ts`, fonction `soumettreReponseEcran`).
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
    setEtat(demarrerSessionQuellePrimitive(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteQuellePrimitive)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1, même garde que
  // `SelecteurVarianteDev`) : expose l'exercice tiré tel quel sur `window` — permet à la
  // vérification Playwright (build de production) de reconstruire la réponse EXACTE attendue à
  // chaque écran depuis les vrais paramètres tirés, plutôt que de re-parser le LaTeX affiché
  // (fragile). Jamais consommé par le code applicatif lui-même.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen24?: unknown }).__debug6gen24 = { exercice, phase };
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
        <h1 className="app-title">Quelle primitive ? (condition initiale)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <EtapeChampsCalculPrimitives
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGeneraleQuellePrimitive()}
            blocDonnees={blocDonneesQuellePrimitive(exercice)}
            etatActuel={etatActuelQuellePrimitive(exercice, phase)}
            consigneEcran={consigneEcranQuellePrimitive(exercice, phase)}
            champs={champsQuellePrimitive(exercice, phase)}
            aideNiveau1={aideNiveau1QuellePrimitive(exercice, phase)}
            aideNiveau2={aideNiveau2QuellePrimitive(exercice, phase)}
            diagnostiquer={(valeurs) => diagnostiquerEcranQuellePrimitive(exercice, phase, valeurs)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}

        {dernierBilan && <ResultatPanelQuellePrimitive resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionQuellePrimitive resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
