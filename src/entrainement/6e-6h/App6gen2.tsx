import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionsCyclometriques } from "./generateurs6e/fonctionsCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionFonctionsCyclometriques,
  soumettreReponseFonctionsCyclometriques,
} from "./moteur6e/sessionFonctionsCyclometriques";
import type { EtatSessionFonctionsCyclometriques, ResultatExerciceFonctionsCyclometriques } from "./moteur6e/typesFonctionsCyclometriques";
import { EtapeFonctionsCyclometriques } from "./components6e/EtapeFonctionsCyclometriques";
import { ResultatPanelFonctionsCyclometriques } from "./components6e/ResultatPanelFonctionsCyclometriques";
import { ResumeSessionFonctionsCyclometriques } from "./components6e/ResumeSessionFonctionsCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFonctionsCyclometriques {
  return demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, genererExerciceFonctionsCyclometriques);
}

interface Bilan {
  resultat: ResultatExerciceFonctionsCyclometriques;
  /** Niveau d'aide RÉELLEMENT utilisé sur l'unique écran — capturé côté présentation au moment
   * exact où l'écran se ferme (avant que la Couche B ne remette `niveauAide` à 0 pour l'exercice
   * suivant), même patron que les autres `App6genX.tsx`. */
  niveauAide: number;
}

/**
 * `6gen2` (REFONTE TOTALE) — écran UNIQUE quelle que soit la variante tirée (voir
 * `moteur6e/typesFonctionsCyclometriques.ts`) : pas de branchement par phase ici, contrairement à
 * la quasi-totalité des autres `App6genX.tsx` de ce chantier.
 */
export function App6gen2() {
  const [etat, setEtat] = useState<EtatSessionFonctionsCyclometriques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFonctionsCyclometriques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], niveauAide: etat.niveauAide });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(
      demarrerSessionFonctionsCyclometriques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Valeurs cyclométriques — existence et calcul</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EtapeFonctionsCyclometriques
              key={etat.indexExercice}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFonctionsCyclometriques(etat, reponse))}
            />
          )}
          {dernierBilan && (
            <ResultatPanelFonctionsCyclometriques
              resultat={dernierBilan.resultat}
              niveauAide={dernierBilan.niveauAide}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionFonctionsCyclometriques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
