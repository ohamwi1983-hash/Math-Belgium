import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsCyclometriques } from "./generateurs6e/equationsCyclometriques";
import type { IdVarianteDev } from "./generateurs6e/equationsCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEquationsCyclometriques,
  soumettreReponseAcceptRejet,
  soumettreReponseCE,
  soumettreReponseCondition,
  soumettreReponseEquation,
  soumettreReponseSolutions,
} from "./moteur6e/sessionEquationsCyclometriques";
import type {
  AideInfoEcran,
  EtatSessionEquationsCyclometriques,
  PhaseEquationsCyclometriques,
  ResultatExerciceEquationsCyclometriques,
} from "./moteur6e/typesEquationsCyclometriques";
import type { EtatActuelLigne } from "./components6e/EtapeChampEquationCyclo";
import { EtapeAccepterRejeterEquationsCyclometriques } from "./components6e/EtapeAccepterRejeterEquationsCyclometriques";
import { EtapeCEEquationsCyclometriques } from "./components6e/EtapeCEEquationsCyclometriques";
import { EtapeChampEquationCyclo } from "./components6e/EtapeChampEquationCyclo";
import { EtapeConditionEquationsCyclometriques } from "./components6e/EtapeConditionEquationsCyclometriques";
import { EtapeListeSolutionsCyclo } from "./components6e/EtapeListeSolutionsCyclo";
import { ResultatPanelEquationsCyclometriques } from "./components6e/ResultatPanelEquationsCyclometriques";
import { ResumeSessionEquationsCyclometriques } from "./components6e/ResumeSessionEquationsCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import {
  MAX_DEN,
  formatEquationNonCycloLatex,
  formatEquationOriginaleLatex,
  texteAideEquationNiveau1,
  texteAideEquationNiveau2,
  texteAideSolutionsNiveau1,
  texteAideSolutionsNiveau2,
} from "./ui6e/formatEquationsCyclometriques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationsCyclometriques {
  return demarrerSessionEquationsCyclometriques(REGLAGES_DEMO, genererExerciceEquationsCyclometriques);
}

/** Bloc "état actuel" de l'écran "equation" — CE seule pour les variantes 1/2/3 (immédiatement
 * précédente) ; CE (écran 1) + condition de compatibilité des codomaines (écran précédent) pour la
 * variante 4, dont la séquence est décalée d'un cran par l'écran "condition" intercalaire (voir
 * `phaseApres`). */
function etatActuelAvantEquation(exercice: EtatSessionEquationsCyclometriques["exerciceCourant"]): EtatActuelLigne[] {
  if (exercice.variante !== "arcfonctionsDifferentes") {
    return [{ label: "CE établie à l'étape précédente", latex: formatEnsembleReelLatex(exercice.ce, MAX_DEN) }];
  }
  return [
    { label: "CE établie à l'étape 1", latex: formatEnsembleReelLatex(exercice.ce, MAX_DEN) },
    { label: "Condition de compatibilité des codomaines (étape précédente)", latex: formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN) },
  ];
}

/** Bloc "état actuel" de l'écran "solutions" — CE (écran 1) + [condition (écran 2), variante 4
 * uniquement] + équation non cyclométrique (écran précédent, dans tous les cas). */
function etatActuelAvantSolutions(exercice: EtatSessionEquationsCyclometriques["exerciceCourant"]): EtatActuelLigne[] {
  const lignes: EtatActuelLigne[] = [{ label: "CE établie à l'étape 1", latex: formatEnsembleReelLatex(exercice.ce, MAX_DEN) }];
  if (exercice.variante === "arcfonctionsDifferentes") {
    lignes.push({
      label: "Condition de compatibilité des codomaines (étape 2)",
      latex: formatEnsembleReelLatex(exercice.conditionParasite, MAX_DEN),
    });
  }
  lignes.push({ label: "Équation non cyclométrique (étape précédente)", latex: formatEquationNonCycloLatex(exercice) });
  return lignes;
}

type AideParPhase = Partial<Record<PhaseEquationsCyclometriques, AideInfoEcran>>;

interface Bilan {
  resultat: ResultatExerciceEquationsCyclometriques;
  aideParPhase: AideParPhase;
}

export function App6gen3() {
  const [etat, setEtat] = useState<EtatSessionEquationsCyclometriques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  /** `nouvelEtat.derniereCloture` porte l'aide/révélation de l'écran qui vient PRÉCISÉMENT de se
   * fermer, capturée côté moteur (jamais reconstruite depuis un `etat` React déjà obsolète — voir
   * `typesEquationsCyclometriques.ts`). */
  function terminerEtape(nouvelEtat: EtatSessionEquationsCyclometriques) {
    const cloture = nouvelEtat.derniereCloture;
    const miseAJour = cloture ? { ...aideParPhase, [cloture.phase]: cloture.info } : aideParPhase;
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
    setEtat(demarrerSessionEquationsCyclometriques(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteDev)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen43.tsx` et la plupart des générateurs 6e récents.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen3?: unknown }).__debug6gen3 = { exercice, phase: etat.phase };
  }

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Équations avec fonctions cyclométriques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "ce" && (
                <EtapeCEEquationsCyclometriques
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
                />
              )}

              {etat.phase === "condition" && exercice.variante === "arcfonctionsDifferentes" && (
                <EtapeConditionEquationsCyclometriques
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseCondition(etat, reponse))}
                />
              )}

              {etat.phase === "equation" && (
                <EtapeChampEquationCyclo
                  key={etat.phase}
                  consigneEcran="Écris l'équation obtenue après avoir éliminé toutes les arcfonctions."
                  equationLatex={formatEquationOriginaleLatex(exercice)}
                  etatActuel={etatActuelAvantEquation(exercice)}
                  aideNiveau1={{ texte: texteAideEquationNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideEquationNiveau2(exercice)}
                  placeholder="ex : 2x-1=1/2"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEquation(etat, texte))}
                />
              )}

              {etat.phase === "solutions" && (
                <EtapeListeSolutionsCyclo
                  key={etat.phase}
                  consigneEcran="Cette équation a-t-elle des solutions ? Si oui, liste-les TOUTES (sans encore tenir compte de la CE)."
                  equationLatex={formatEquationOriginaleLatex(exercice)}
                  etatActuel={etatActuelAvantSolutions(exercice)}
                  aideNiveau1={{ texte: texteAideSolutionsNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideSolutionsNiveau2(exercice)}
                  placeholder="ex : 2, -2..."
                  labelAjout="+ Ajouter une solution"
                  labelAucune="Pas de solution"
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseSolutions(etat, textes))}
                />
              )}

              {etat.phase === "acceptRejet" && (
                <EtapeAccepterRejeterEquationsCyclometriques
                  key={etat.phase}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(decisions) => terminerEtape(soumettreReponseAcceptRejet(etat, decisions))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelEquationsCyclometriques
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEquationsCyclometriques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
