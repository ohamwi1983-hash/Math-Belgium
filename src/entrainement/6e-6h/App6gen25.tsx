import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesDefinies } from "./generateurs6e/integralesDefinies";
import type { IdVarianteIntegralesDefinies } from "./generateurs6e/integralesDefinies";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionIntegralesDefinies, soumettreReponseEcran } from "./moteur6e/sessionIntegralesDefinies";
import type { EtatSessionIntegralesDefinies, PhaseIntegralesDefinies, ResultatExerciceIntegralesDefinies } from "./moteur6e/typesIntegralesDefinies";
import { diagnostiquerEcran } from "./moteur6e/verificationIntegralesDefinies";
import { EtapeChampsCalculPrimitives } from "./components6e/EtapeChampsCalculPrimitives";
import { EtapeResoudreMIntegralesDefinies } from "./components6e/EtapeResoudreMIntegralesDefinies";
import { ResultatPanelIntegralesDefinies } from "./components6e/ResultatPanelIntegralesDefinies";
import { ResumeSessionIntegralesDefinies } from "./components6e/ResumeSessionIntegralesDefinies";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatIntegralesDefinies";

/**
 * `6gen25` — Intégrales définies, paramètre et valeur moyenne (chapitre 4, "Intégrales et
 * primitives"). Construit AU-DESSUS de `6gen23` ("Calcul de primitives") : les écrans EMPRUNTÉS
 * (calcul de la primitive, familles A/B/C/G) sont rendus par le MÊME composant générique
 * `EtapeChampsCalculPrimitives` que 6gen23 (rien de spécifique à 6gen23 dans ce composant — il ne
 * consomme que `ChampDef[]`/`AideAvecLatex`, tous deux réexportés tels quels par
 * `ui6e/formatIntegralesDefinies.ts`) ; seul l'écran "resoudreM" (add-as-needed) utilise un
 * composant dédié. Aucune calculatrice scientifique — mêmes raisons que 6gen23.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionIntegralesDefinies {
  return demarrerSessionIntegralesDefinies(REGLAGES_DEMO, genererExerciceIntegralesDefinies);
}

type AideParPhase = Partial<Record<PhaseIntegralesDefinies, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceIntegralesDefinies;
  aideParPhase: AideParPhase;
}


export function App6gen25() {
  const [etat, setEtat] = useState<EtatSessionIntegralesDefinies>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionIntegralesDefinies) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`) — piège "revele
    // stale" documenté CLAUDE.md, patron 6gen23 répliqué à l'identique.
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
    setEtat(demarrerSessionIntegralesDefinies(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteIntegralesDefinies)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) — même patron que 6gen23, voir
  // son en-tête `App6gen23.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen25?: unknown }).__debug6gen25 = { exercice, phase };
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
        <h1 className="app-title">Intégrales définies, paramètre et valeur moyenne</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && phase === "resoudreM" && (
          <EtapeResoudreMIntegralesDefinies
            key={phase}
            {...aideCommun}
            consigneGenerale={consigneGenerale(exercice)}
            blocDonnees={blocDonnees(exercice)}
            etatActuel={etatActuel(exercice, phase)}
            consigneEcran={consigneEcran(exercice, phase)}
            placeholder={champsEcran(exercice, phase)[0]?.placeholder ?? ""}
            labelAjout="+ Ajouter une valeur de m"
            aideNiveau1={formatAideNiveau1(exercice, phase)}
            aideNiveau2={formatAideNiveau2(exercice, phase)}
            onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
          />
        )}
        {enCoursDeSession && phase !== "resoudreM" && (
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

        {dernierBilan && <ResultatPanelIntegralesDefinies resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionIntegralesDefinies resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
