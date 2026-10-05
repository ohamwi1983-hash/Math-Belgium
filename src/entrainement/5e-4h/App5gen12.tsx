import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceGeometrieCercle } from "./generateurs5e/geometrieCercle";
import type { ScenarioGeometrieCercle } from "./core5e/geometrieCercle.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionGeometrieCercle,
  niveauAideMaxGeometrieCercle,
  soumettreReponse,
} from "./moteur5e/sessionGeometrieCercle";
import type { EtatSessionGeometrieCercle, PhaseGeometrieCercle, ResultatExerciceGeometrieCercle } from "./moteur5e/typesGeometrieCercle";
import { diagnostiquerChamp } from "./moteur5e/verificationGeometrieCercle";
import { EtapeChampGeometrieCercle } from "./components5e/EtapeChampGeometrieCercle";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelGeometrieCercle } from "./components5e/ResultatPanelGeometrieCercle";
import { ResumeSessionGeometrieCercle } from "./components5e/ResumeSessionGeometrieCercle";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

/**
 * Écrans dont la cible est un angle/une aire non remarquable (acos/atan/sin sans table de valeurs
 * exactes) — voir CLAUDE.md, section "Calculatrice scientifique", pour le détail par scénario.
 *
 * Les 4 phases de `secteurBalaye` ("conversionRad"/"aireGrandSecteur"/"airePetitSecteur"/
 * "aireBalayee") sont une EXCEPTION SCÉNARIO-SPÉCIFIQUE DÉLIBÉRÉE à cette règle générale (C.2) : la
 * calculatrice y est disponible sur LES 4 écrans de la variante, y compris ceux dont le calcul ne
 * requiert à proprement parler qu'une multiplication simple une fois θ(rad) connu — décision
 * documentée, pas un oubli, voir docs/historique-5e-transversal.md pour la règle générale dont ceci
 * déroge. Les phases de `segmentCirculaire`/`lentille` ci-dessous restent, elles, sous la règle
 * générale (uniquement les écrans à calcul trigonométrique non remarquable).
 */
const PHASES_CALCULATRICE = new Set<PhaseGeometrieCercle>([
  "conversionRad",
  "aireGrandSecteur",
  "airePetitSecteur",
  "aireBalayee",
  "angleTheta",
  "aireTriangle",
  "angle1",
  "triangle1",
  "angle2",
  "triangle2",
]);

function nouvelleSession(): EtatSessionGeometrieCercle {
  return demarrerSessionGeometrieCercle(REGLAGES_DEMO, genererExerciceGeometrieCercle);
}

interface Bilan {
  resultat: ResultatExerciceGeometrieCercle;
  aideParPhase: Partial<Record<PhaseGeometrieCercle, { niveauAide: number; revele: boolean }>>;
}

export function App5gen12() {
  const [etat, setEtat] = useState<EtatSessionGeometrieCercle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseGeometrieCercle, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionGeometrieCercle) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesGeometrieCercle.ts` (même correctif que 5gen10, commit `122064a`).
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Problèmes de géométrie du cercle</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_SCENARIOS}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionGeometrieCercle(REGLAGES_DEMO, () => construireAvecScenarioId(id as ScenarioGeometrieCercle)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              <EtapeChampGeometrieCercle
                key={etat.phase}
                exercice={exercice}
                phase={etat.phase}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={etat.niveauAide}
                niveauAideMax={niveauAideMaxGeometrieCercle(etat.phase)}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponse(etat, texte))}
                diagnostiquer={(texte) => diagnostiquerChamp(exercice, etat.phase, texte)}
              />
              {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelGeometrieCercle
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionGeometrieCercle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
