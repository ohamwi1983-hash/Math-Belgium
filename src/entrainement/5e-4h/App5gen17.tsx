import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceSuiteClassique } from "./generateurs5e/suitesClassiques";
import type {
  ExerciceCarresEmboites,
  ExerciceEchiquier,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
  ScenarioSuiteClassique,
} from "./core5e/suitesClassiques.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  niveauAideMaxSuiteClassique,
  activerAideSuivante,
  demarrerSessionSuiteClassique,
  soumettreReponseAiresB,
  soumettreReponseAiresZigzag,
  soumettreReponseAiresZigzagAC,
  soumettreReponseCalculV5,
  soumettreReponseDistance11,
  soumettreReponseDixTermes,
  soumettreReponseFormuleRecurrence,
  soumettreReponseHauteursZigzag,
  soumettreReponseLimitePuissanceA,
  soumettreReponseLongueurZigzag,
  soumettreReponsePoidsComparaison,
  soumettreReponsePoserEquationCombinees,
  soumettreReponsePoserSysteme,
  soumettreReponseProprieteInverse,
  soumettreReponseResoudrePhi,
  soumettreReponseResoudreRCombinees,
  soumettreReponseResoudreSysteme,
  soumettreReponseSommeInfinieA,
  soumettreReponseSommeInfinieB,
  soumettreReponseSommePartielleA,
  soumettreReponseSommeTotale11,
  soumettreReponseSommeTotaleEchiquier,
  soumettreReponseSuiteFinalePapyrus,
  soumettreReponseSuitesFinalesCombinees,
  soumettreReponseTroisMethodes,
  soumettreReponseU64,
} from "./moteur5e/sessionSuiteClassique";
import type { EtatSessionSuiteClassique, PhaseSuiteClassique, ResultatExerciceSuiteClassique } from "./moteur5e/typesSuiteClassique";
import {
  diagnostiquerAiresB,
  diagnostiquerAiresZigzag,
  diagnostiquerAiresZigzagAC,
  diagnostiquerCalculV5,
  diagnostiquerChampListe,
  diagnostiquerChampSuitesFinalesCombinees,
  diagnostiquerDistance11,
  diagnostiquerDixTermes,
  diagnostiquerHauteursZigzag,
  diagnostiquerPoidsComparaison,
  diagnostiquerResoudrePhi,
  diagnostiquerResoudreRCombinees,
  diagnostiquerResoudreSysteme,
  diagnostiquerSommeInfinieA,
  diagnostiquerSommeInfinieB,
  diagnostiquerSommePartielleA,
  diagnostiquerSommeTotale11,
  diagnostiquerSommeTotaleEchiquier,
  diagnostiquerSuiteFinalePapyrus,
  diagnostiquerSuitesFinalesCombinees,
  diagnostiquerTroisMethodes,
  diagnostiquerU64,
} from "./moteur5e/verificationSuiteClassique";
import type { StatutVerification } from "./moteur/statutVerification";
import { EtapeChampSimpleClassique } from "./components5e/EtapeChampSimpleClassique";
import { EtapeListeChampsClassique } from "./components5e/EtapeListeChampsClassique";
import { EtapeQCMClassique } from "./components5e/EtapeQCMClassique";
import { EtapeSuitesFinalesCombinees } from "./components5e/EtapeSuitesFinalesCombinees";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { ResultatPanelSuiteClassique } from "./components5e/ResultatPanelSuiteClassique";
import { ResumeSessionSuiteClassique } from "./components5e/ResumeSessionSuiteClassique";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

const PHASES_CHAMP_SIMPLE = new Set<PhaseSuiteClassique>([
  "u64",
  "sommeTotaleEchiquier",
  "resoudreRCombinees",
  "distance11",
  "sommeTotale11",
  "calculV5",
  "resoudrePhi",
  "sommePartielleA",
  "sommeInfinieA",
  "sommeInfinieB",
]);

const PHASES_LISTE = new Set<PhaseSuiteClassique>([
  "poidsComparaison",
  "resoudreSysteme",
  "suiteFinalePapyrus",
  "troisMethodes",
  "dixTermes",
  "hauteursZigzag",
  "airesZigzag",
  "airesZigzagAC",
  "airesB",
]);

const PHASES_QCM = new Set<PhaseSuiteClassique>([
  "poserSysteme",
  "poserEquationCombinees",
  "formuleRecurrence",
  "proprieteInverse",
  "longueurZigzag",
  "limitePuissanceA",
]);

/** Sous-ensembles de `PHASES_CHAMP_SIMPLE`/`PHASES_LISTE` qui justifient la calculatrice (calcul
 * décimal non trivial visé par la consigne du scénario) — jamais les phases dont l'instance est
 * construite pour rester entière (`resoudreRCombinees`, `dixTermes`, `airesB`) ni un calcul trivial
 * à une seule division (`calculV5`, `sommeInfinieB`), qui partagent pourtant le même composant
 * d'écran. Voir CLAUDE.md, section "Calculatrice scientifique", pour le détail par scénario. */
const PHASES_CALCULATRICE_CHAMP_SIMPLE = new Set<PhaseSuiteClassique>([
  "u64",
  "sommeTotaleEchiquier",
  "distance11",
  "sommeTotale11",
  "resoudrePhi",
  "sommePartielleA",
  "sommeInfinieA",
]);
const PHASES_CALCULATRICE_LISTE = new Set<PhaseSuiteClassique>([
  "poidsComparaison",
  "resoudreSysteme",
  "suiteFinalePapyrus",
  "troisMethodes",
  "hauteursZigzag",
  "airesZigzag",
  "airesZigzagAC",
]);

function nouvelleSession(): EtatSessionSuiteClassique {
  return demarrerSessionSuiteClassique(REGLAGES_DEMO, genererExerciceSuiteClassique);
}

interface Bilan {
  resultat: ResultatExerciceSuiteClassique;
  aideParPhase: Partial<Record<PhaseSuiteClassique, { niveauAide: number; revele: boolean }>>;
}

function soumettreChampSimple(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  switch (etat.phase) {
    case "u64":
      return soumettreReponseU64(etat, texte);
    case "sommeTotaleEchiquier":
      return soumettreReponseSommeTotaleEchiquier(etat, texte);
    case "resoudreRCombinees":
      return soumettreReponseResoudreRCombinees(etat, texte);
    case "distance11":
      return soumettreReponseDistance11(etat, texte);
    case "sommeTotale11":
      return soumettreReponseSommeTotale11(etat, texte);
    case "calculV5":
      return soumettreReponseCalculV5(etat, texte);
    case "resoudrePhi":
      return soumettreReponseResoudrePhi(etat, texte);
    case "sommePartielleA":
      return soumettreReponseSommePartielleA(etat, texte);
    case "sommeInfinieA":
      return soumettreReponseSommeInfinieA(etat, texte);
    case "sommeInfinieB":
      return soumettreReponseSommeInfinieB(etat, texte);
    default:
      throw new Error(`soumettreChampSimple : phase inattendue '${etat.phase}'`);
  }
}

function soumettreListe(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  switch (etat.phase) {
    case "poidsComparaison":
      return soumettreReponsePoidsComparaison(etat, textes);
    case "resoudreSysteme":
      return soumettreReponseResoudreSysteme(etat, textes);
    case "suiteFinalePapyrus":
      return soumettreReponseSuiteFinalePapyrus(etat, textes);
    case "troisMethodes":
      return soumettreReponseTroisMethodes(etat, textes);
    case "dixTermes":
      return soumettreReponseDixTermes(etat, textes);
    case "hauteursZigzag":
      return soumettreReponseHauteursZigzag(etat, textes);
    case "airesZigzag":
      return soumettreReponseAiresZigzag(etat, textes);
    case "airesZigzagAC":
      return soumettreReponseAiresZigzagAC(etat, textes);
    case "airesB":
      return soumettreReponseAiresB(etat, textes);
    default:
      throw new Error(`soumettreListe : phase inattendue '${etat.phase}'`);
  }
}

function soumettreQCM(etat: EtatSessionSuiteClassique, choixId: string): EtatSessionSuiteClassique {
  switch (etat.phase) {
    case "poserSysteme":
      return soumettreReponsePoserSysteme(etat, choixId as never);
    case "poserEquationCombinees":
      return soumettreReponsePoserEquationCombinees(etat, choixId as never);
    case "formuleRecurrence":
      return soumettreReponseFormuleRecurrence(etat, choixId as never);
    case "proprieteInverse":
      return soumettreReponseProprieteInverse(etat, choixId as never);
    case "longueurZigzag":
      return soumettreReponseLongueurZigzag(etat, choixId as never);
    case "limitePuissanceA":
      return soumettreReponseLimitePuissanceA(etat, choixId as never);
    default:
      throw new Error(`soumettreQCM : phase inattendue '${etat.phase}'`);
  }
}

/**
 * Statut à 3 valeurs — calculé côté présentation UNIQUEMENT (motif A.1, déjà prouvé sur 5gen2),
 * jamais consommé pour le score/les tentatives, qui restent pilotés par `soumettreChampSimple`
 * ci-dessus. Chaque `diagnostiquerXxx` importé attend le type d'exercice précis de son scénario —
 * casté ici depuis l'union `ExerciceSuiteClassique` (même principe que `commeEchiquier`/... privés
 * à `moteur5e/sessionSuiteClassique.ts`, non exportés donc non réutilisables directement ici) :
 * cast sûr par construction, `phase` détermine univoquement le scénario réel de l'exercice.
 */
function diagnostiquerChampSimple(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique, texte: string): StatutVerification {
  switch (phase) {
    case "u64":
      return diagnostiquerU64(texte, exercice as ExerciceEchiquier);
    case "sommeTotaleEchiquier":
      return diagnostiquerSommeTotaleEchiquier(texte, exercice as ExerciceEchiquier);
    case "resoudreRCombinees":
      return diagnostiquerResoudreRCombinees(texte, exercice as ExerciceSuitesCombinees);
    case "distance11":
      return diagnostiquerDistance11(texte, exercice as ExerciceVitesse);
    case "sommeTotale11":
      return diagnostiquerSommeTotale11(texte, exercice as ExerciceVitesse);
    case "calculV5":
      return diagnostiquerCalculV5(texte, exercice as ExerciceFibonacci);
    case "resoudrePhi":
      return diagnostiquerResoudrePhi(texte, exercice as ExerciceFibonacci);
    case "sommePartielleA":
      return diagnostiquerSommePartielleA(texte, exercice as ExerciceCarresEmboites);
    case "sommeInfinieA":
      return diagnostiquerSommeInfinieA(texte, exercice as ExerciceCarresEmboites);
    case "sommeInfinieB":
      return diagnostiquerSommeInfinieB(texte, exercice as ExerciceCarresEmboites);
    default:
      throw new Error(`diagnostiquerChampSimple : phase inattendue '${phase}'`);
  }
}

/** Même principe que `diagnostiquerChampSimple` ci-dessus, pour les 9 phases "liste de champs". */
function diagnostiquerListe(exercice: ExerciceSuiteClassique, phase: PhaseSuiteClassique, textes: string[]): StatutVerification {
  switch (phase) {
    case "poidsComparaison":
      return diagnostiquerPoidsComparaison(textes, exercice as ExerciceEchiquier);
    case "resoudreSysteme":
      return diagnostiquerResoudreSysteme(textes, exercice as ExercicePapyrusRhind);
    case "suiteFinalePapyrus":
      return diagnostiquerSuiteFinalePapyrus(textes, exercice as ExercicePapyrusRhind);
    case "troisMethodes":
      return diagnostiquerTroisMethodes(textes, exercice as ExerciceVitesse);
    case "dixTermes":
      return diagnostiquerDixTermes(textes, exercice as ExerciceFibonacci);
    case "hauteursZigzag":
      return diagnostiquerHauteursZigzag(textes, exercice as ExerciceTrianglesZigzag);
    case "airesZigzag":
      return diagnostiquerAiresZigzag(textes, exercice as ExerciceTrianglesZigzag);
    case "airesZigzagAC":
      return diagnostiquerAiresZigzagAC(textes, exercice as ExerciceTrianglesZigzag);
    case "airesB":
      return diagnostiquerAiresB(textes, exercice as ExerciceCarresEmboites);
    default:
      throw new Error(`diagnostiquerListe : phase inattendue '${phase}'`);
  }
}

export function App5gen17() {
  const [etat, setEtat] = useState<EtatSessionSuiteClassique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseSuiteClassique, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionSuiteClassique) {
    // `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesSuiteClassique.ts`.
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
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Problèmes classiques sur les suites</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_SCENARIOS}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionSuiteClassique(REGLAGES_DEMO, () => construireAvecScenarioId(id as ScenarioSuiteClassique)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {PHASES_CHAMP_SIMPLE.has(phase) && (
                <EtapeChampSimpleClassique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteClassique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreChampSimple(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerChampSimple(exercice, phase, texte)}
                />
              )}
              {PHASES_CALCULATRICE_CHAMP_SIMPLE.has(phase) && <CalculatriceScientifique />}

              {PHASES_LISTE.has(phase) && (
                <EtapeListeChampsClassique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteClassique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreListe(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerListe(exercice, phase, textes)}
                  diagnostiquerChamp={(index, texte) => diagnostiquerChampListe(texte, index, exercice, phase)}
                />
              )}
              {PHASES_CALCULATRICE_LISTE.has(phase) && <CalculatriceScientifique />}

              {PHASES_QCM.has(phase) && (
                <EtapeQCMClassique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteClassique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(choixId) => terminerEtape(soumettreQCM(etat, choixId))}
                />
              )}

              {phase === "suitesFinalesCombinees" && exercice.scenario === "suitesCombinees" && (
                <EtapeSuitesFinalesCombinees
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteClassique(phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseSuitesFinalesCombinees(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerSuitesFinalesCombinees(reponse, exercice)}
                  diagnostiquerChamp={(groupe, index, texte) => diagnostiquerChampSuitesFinalesCombinees(groupe, index, texte, exercice)}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelSuiteClassique
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionSuiteClassique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
