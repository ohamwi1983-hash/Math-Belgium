import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionsCyclometriques } from "./generateurs6e/fonctionsCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionFonctionsCyclometriques,
  soumettreReponseFonctionsCyclometriques,
} from "./moteur6e/sessionFonctionsCyclometriques";
import type { EtatSessionFonctionsCyclometriques } from "./moteur6e/typesFonctionsCyclometriques";
import { Katex } from "./components/Katex";
import { EtapeFonctionsCyclometriques } from "./components6e/EtapeFonctionsCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFonctionsCyclometriques {
  return demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, genererExerciceFonctionsCyclometriques);
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives
 * épuisées) — l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le
 * bouton de `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/
 * invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFonctionsCyclometriques;
  revele: boolean;
}

/**
 * `6gen2` (REFONTE TOTALE) — écran UNIQUE quelle que soit la variante tirée (voir
 * `moteur6e/typesFonctionsCyclometriques.ts`) : pas de branchement par phase ici, contrairement à
 * la quasi-totalité des autres `App6genX.tsx` de ce chantier. L'écran unique se termine dès que
 * `resultats` grandit (= aucune machinerie de phase à surveiller).
 */
export function App6gen2() {
  const [etat, setEtat] = useState<EtatSessionFonctionsCyclometriques>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFonctionsCyclometriques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.resultats[nouvelEtat.resultats.length - 1].revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(
      demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: exercice.existe ? <Katex expression={exercice.valeurLatex as string} /> : "N'existe pas",
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Valeurs cyclométriques — existence et calcul</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          <EtapeFonctionsCyclometriques
            key={etat.indexExercice}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseFonctionsCyclometriques(etat, reponse))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
