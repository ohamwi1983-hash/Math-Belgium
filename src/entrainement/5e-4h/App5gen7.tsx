import { useState } from "react";
import type { PhasePolygonesArcsSecteurs } from "./moteur5e/typesPolygonesArcsSecteurs";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecPresence, genererExercicePolygonesArcsSecteurs } from "./generateurs5e/polygonesArcsSecteurs";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_PRESENCE = [
  { id: "00", label: "Aucun écran optionnel" },
  { id: "10", label: "Arc multi-pas seul" },
  { id: "01", label: "Secteur multi-pas seul" },
  { id: "11", label: "Arc ET secteur multi-pas" },
];
import {
  activerAideSuivante,
  demarrerSessionPolygonesArcsSecteurs,
  niveauAideMax,
  soumettreReponseCercleEntier,
  soumettreReponseEcranUnChamp,
} from "./moteur5e/sessionPolygonesArcsSecteurs";
import type { EtatSessionPolygonesArcsSecteurs, ResultatExercicePolygonesArcsSecteurs } from "./moteur5e/typesPolygonesArcsSecteurs";
import { cibleEcranUnChamp, diagnostiquerCercleEntier } from "./moteur5e/verificationPolygonesArcsSecteurs";
import { diagnostiquerValeurArcSecteur } from "./moteur5e/verificationArcsSecteurs";
import { EtapeCercleEntier } from "./components5e/EtapeCercleEntier";
import { EtapeEcranUnChampPolygone } from "./components5e/EtapeEcranUnChampPolygone";
import { ResultatPanelPolygone } from "./components5e/ResultatPanelPolygone";
import { ResumeSessionPolygone } from "./components5e/ResumeSessionPolygone";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionPolygonesArcsSecteurs {
  return demarrerSessionPolygonesArcsSecteurs(REGLAGES_DEMO, genererExercicePolygonesArcsSecteurs);
}

interface Bilan {
  resultat: ResultatExercicePolygonesArcsSecteurs;
  aideParPhase: Partial<Record<PhasePolygonesArcsSecteurs, number>>;
}

export function App5gen7() {
  const [etat, setEtat] = useState<EtatSessionPolygonesArcsSecteurs>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhasePolygonesArcsSecteurs, number>>>({});

  function terminerEtape(nouvelEtat: EtatSessionPolygonesArcsSecteurs) {
    const miseAJour = { ...aideParPhase, [etat.phase]: etat.niveauAide };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMaxEcran = enCoursDeSession ? niveauAideMax(etat.phase) : 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Polygones, arcs et secteurs</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_PRESENCE}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionPolygonesArcsSecteurs(REGLAGES_DEMO, () => construireAvecPresence(id[0] === "1", id[1] === "1")));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "cercleEntier" ? (
                <EtapeCercleEntier
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEcran}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(r) => terminerEtape(soumettreReponseCercleEntier(etat, r))}
                  diagnostiquer={(r) => diagnostiquerCercleEntier(exercice, r)}
                />
              ) : (
                <EtapeEcranUnChampPolygone
                  key={etat.phase}
                  exercice={exercice}
                  phase={etat.phase as Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxEcran}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEcranUnChamp(etat, texte))}
                  diagnostiquer={(texte) =>
                    diagnostiquerValeurArcSecteur(
                      texte,
                      cibleEcranUnChamp(exercice, etat.phase as Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">),
                    )
                  }
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelPolygone
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionPolygone resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
