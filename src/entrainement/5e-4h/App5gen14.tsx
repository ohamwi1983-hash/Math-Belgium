import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteArithmetique } from "./generateurs5e/suitesArithmetiques";
import type { FamilleSuiteArithmetiqueId } from "./generateurs5e/suitesArithmetiques";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  niveauAideMaxSuiteArithmetique,
  activerAideSuivante,
  ciblesCalculerTermesAlgebrique,
  demarrerSessionSuiteArithmetique,
  soumettreReponseCalculerSn,
  soumettreReponseCalculerTermesAlgebrique,
  soumettreReponseCoherenceJugement,
  soumettreReponseFormuleGenerale,
  soumettreReponsePoserEquationAlgebrique,
  soumettreReponsePoserEquationRangN,
  soumettreReponseResoudreRangN,
  soumettreReponseResoudreXAlgebrique,
  soumettreReponseSommeSn,
  soumettreReponseTermeEloigne,
  soumettreReponseTermesProches,
  soumettreReponseTrouverR,
  soumettreReponseTrouverU1,
} from "./moteur5e/sessionSuiteArithmetique";
import type { ReponseEquation } from "./moteur5e/sessionSuiteArithmetique";
import type { EtatSessionSuiteArithmetique, PhaseSuiteArithmetique, ResultatExerciceSuiteArithmetique } from "./moteur5e/typesSuiteArithmetique";
import {
  diagnostiquerEquationComplete,
  diagnostiquerEquationCompleteEnN,
  diagnostiquerFormuleGenerale,
  diagnostiquerNombre,
  diagnostiquerRangEntierPositif,
  diagnostiquerTermes,
} from "./moteur5e/verificationSuiteArithmetique";
import type { StatutVerification } from "./moteur/statutVerification";
import type { ExerciceSuiteArithmetique } from "./core5e/suitesArithmetiques.types";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { EtapeChampSimpleSuiteArithmetique } from "./components5e/EtapeChampSimpleSuiteArithmetique";
import { EtapeCoherenceJugement } from "./components5e/EtapeCoherenceJugement";
import { EtapePoserEquation } from "./components5e/EtapePoserEquation";
import { EtapeTermesMultiples } from "./components5e/EtapeTermesMultiples";
import { ResultatPanelSuiteArithmetique } from "./components5e/ResultatPanelSuiteArithmetique";
import { ResumeSessionSuiteArithmetique } from "./components5e/ResumeSessionSuiteArithmetique";

type PhaseChampSimple =
  | "trouverR"
  | "trouverU1"
  | "formuleGenerale"
  | "termeEloigne"
  | "sommeSn"
  | "calculerSn"
  | "resoudreXAlgebrique"
  | "resoudreRangN";
type PhaseTermesMultiples = "termesProches" | "calculerTermesAlgebrique";
type PhasePoserEquation = "poserEquationAlgebrique" | "poserEquationRangN";

/**
 * Statuts à 3 valeurs (A.1, `promptcorrectionsregroupees.md`) — wiring PRÉSENTATION uniquement,
 * jamais consommé par le score/les tentatives (qui restent pilotés par `soumettreReponseXxx`, Couche
 * B). Réutilise DIRECTEMENT (jamais recréées) les fonctions déjà exportées par
 * `verificationSuiteArithmetique.ts` — les cibles numériques sont extraites ici avec EXACTEMENT la
 * même logique que `moteur5e/sessionSuiteArithmetique.ts` (narrowing par `exercice.famille`, jamais
 * atteint hors de ce cas en pratique puisque le moteur ne propose ces phases que pour les bonnes
 * familles).
 */
function diagnostiquerChampSimple(exercice: ExerciceSuiteArithmetique, phase: PhaseChampSimple, texte: string): StatutVerification {
  switch (phase) {
    case "trouverR":
      return exercice.famille !== "principal" && exercice.famille !== "coherence" ? "parse_error" : diagnostiquerNombre(texte, exercice.base.r);
    case "trouverU1":
      return exercice.famille !== "principal" && exercice.famille !== "coherence" ? "parse_error" : diagnostiquerNombre(texte, exercice.base.u1);
    case "formuleGenerale":
      return exercice.famille !== "principal" && exercice.famille !== "coherence"
        ? "parse_error"
        : diagnostiquerFormuleGenerale(exercice.base.u1, exercice.base.r, texte);
    case "termeEloigne": {
      if ((exercice.famille !== "principal" && exercice.famille !== "coherence") || exercice.indiceTermeEloigne === undefined) return "parse_error";
      const n = exercice.indiceTermeEloigne;
      return diagnostiquerNombre(texte, exercice.base.u1 + (n - 1) * exercice.base.r);
    }
    case "sommeSn": {
      if ((exercice.famille !== "principal" && exercice.famille !== "coherence") || exercice.indiceSn === undefined) return "parse_error";
      const n = exercice.indiceSn;
      return diagnostiquerNombre(texte, (n / 2) * (2 * exercice.base.u1 + (n - 1) * exercice.base.r));
    }
    case "calculerSn":
      return exercice.famille !== "algebriqueSommeSn" || exercice.sousCas !== "D" ? "parse_error" : diagnostiquerNombre(texte, exercice.k);
    case "resoudreXAlgebrique":
      return exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn"
        ? "parse_error"
        : diagnostiquerNombre(texte, exercice.xReel);
    case "resoudreRangN":
      return exercice.famille !== "algebriqueRangN" ? "parse_error" : diagnostiquerRangEntierPositif(texte, exercice.n);
  }
}

function diagnostiquerTermesMultiples(exercice: ExerciceSuiteArithmetique, phase: PhaseTermesMultiples, textes: string[]): StatutVerification {
  if (phase === "calculerTermesAlgebrique") {
    if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return "parse_error";
    return diagnostiquerTermes(textes, ciblesCalculerTermesAlgebrique(exercice));
  }
  if ((exercice.famille !== "principal" && exercice.famille !== "coherence") || !exercice.indicesTermesProches) return "parse_error";
  const { u1, r } = exercice.base;
  const cibles = exercice.indicesTermesProches.map((n) => u1 + (n - 1) * r);
  return diagnostiquerTermes(textes, cibles);
}

/** Coefficients (pente, constante) de l'équation CIBLE — même calcul qu'`sessionSuiteArithmetique.ts`
 * (petite duplication assumée, présentation pure, jamais un import moteur→générateur). */
function diagnostiquerPoserEquation(exercice: ExerciceSuiteArithmetique, phase: PhasePoserEquation, reponse: ReponseEquation): StatutVerification {
  if (phase === "poserEquationRangN") {
    if (exercice.famille !== "algebriqueRangN") return "parse_error";
    const pente = exercice.r;
    const constante = exercice.u1 - exercice.r - exercice.k;
    return diagnostiquerEquationCompleteEnN(reponse.texte, pente, constante);
  }
  if (exercice.famille !== "algebriqueTermeGeneral" && exercice.famille !== "algebriqueSommeSn") return "parse_error";
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { up, un, p, n, r } = exercice;
    const pente = un.a - up.a;
    const constante = un.b - up.b - (n - p) * r;
    return diagnostiquerEquationComplete(reponse.texte, pente, constante);
  }
  switch (exercice.sousCas) {
    case "A": {
      const { u1, r, n, k } = exercice;
      return diagnostiquerEquationComplete(reponse.texte, n * u1.a, n * u1.b + (n / 2) * (n - 1) * r - k);
    }
    case "B": {
      const { u1, r, n, k } = exercice;
      return diagnostiquerEquationComplete(reponse.texte, (n / 2) * (n - 1) * r.a, n * u1 + (n / 2) * (n - 1) * r.b - k);
    }
    case "C": {
      const { u1, r, n, k } = exercice;
      const pente = (n / 2) * (2 * u1.a + (n - 1) * r.a);
      const constante = (n / 2) * (2 * u1.b + (n - 1) * r.b) - k;
      return diagnostiquerEquationComplete(reponse.texte, pente, constante);
    }
    case "D": {
      const { sn, k } = exercice;
      return diagnostiquerEquationComplete(reponse.texte, sn.a, sn.b - k);
    }
  }
}

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

const PHASES_CHAMP_SIMPLE = new Set<PhaseSuiteArithmetique>([
  "trouverR",
  "trouverU1",
  "formuleGenerale",
  "termeEloigne",
  "sommeSn",
  "calculerSn",
  "resoudreXAlgebrique",
  "resoudreRangN",
]);
const PHASES_TERMES_MULTIPLES = new Set<PhaseSuiteArithmetique>(["termesProches", "calculerTermesAlgebrique"]);
const PHASES_POSER_EQUATION = new Set<PhaseSuiteArithmetique>(["poserEquationAlgebrique", "poserEquationRangN"]);
/** Calculatrice — écrans "communs" (combos 1 à 4, `prompt5gen14corrections.md`) ET tous les écrans
 * numériques des 3 familles "algebrique*" (`prompt5gen14remplacementvariante.md`/
 * `prompt5gen14refontefamillesbonus.md` — "Calculatrice scientifique disponible sur tous les écrans
 * de cette variante"), "calculerSn" (sous-cas D) compris. */
const PHASES_CALCULATRICE_CHAMP_SIMPLE = new Set<PhaseSuiteArithmetique>([
  "trouverR",
  "trouverU1",
  "formuleGenerale",
  "termeEloigne",
  "sommeSn",
  "calculerSn",
  "resoudreXAlgebrique",
  "resoudreRangN",
]);
const PHASES_CALCULATRICE_TERMES_MULTIPLES = new Set<PhaseSuiteArithmetique>(["termesProches", "calculerTermesAlgebrique"]);
const PHASES_CALCULATRICE_POSER_EQUATION = new Set<PhaseSuiteArithmetique>(["poserEquationAlgebrique", "poserEquationRangN"]);

function nouvelleSession(): EtatSessionSuiteArithmetique {
  return demarrerSessionSuiteArithmetique(REGLAGES_DEMO, genererExerciceSuiteArithmetique);
}

interface Bilan {
  resultat: ResultatExerciceSuiteArithmetique;
  aideParPhase: Partial<Record<PhaseSuiteArithmetique, { niveauAide: number; revele: boolean }>>;
}

export function App5gen14() {
  const [etat, setEtat] = useState<EtatSessionSuiteArithmetique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseSuiteArithmetique, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionSuiteArithmetique) {
    // A.1 : `revele` doit être lu sur `nouvelEtat` (POST-soumission) — `etat.etapeCourante.revelee`
    // (PRÉ-soumission) est structurellement toujours `false` ici, voir `derniereEtapeRevelee` dans
    // `typesSuiteArithmetique.ts`.
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
        <h1 className="app-title">Suites arithmétiques, formule générale et termes</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionSuiteArithmetique(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleSuiteArithmetiqueId)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {PHASES_CHAMP_SIMPLE.has(phase) && (
                <EtapeChampSimpleSuiteArithmetique
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as PhaseChampSimple}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteArithmetique(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => {
                    switch (phase) {
                      case "trouverR":
                        return terminerEtape(soumettreReponseTrouverR(etat, texte));
                      case "trouverU1":
                        return terminerEtape(soumettreReponseTrouverU1(etat, texte));
                      case "formuleGenerale":
                        return terminerEtape(soumettreReponseFormuleGenerale(etat, texte));
                      case "termeEloigne":
                        return terminerEtape(soumettreReponseTermeEloigne(etat, texte));
                      case "sommeSn":
                        return terminerEtape(soumettreReponseSommeSn(etat, texte));
                      case "calculerSn":
                        return terminerEtape(soumettreReponseCalculerSn(etat, texte));
                      case "resoudreXAlgebrique":
                        return terminerEtape(soumettreReponseResoudreXAlgebrique(etat, texte));
                      case "resoudreRangN":
                        return terminerEtape(soumettreReponseResoudreRangN(etat, texte));
                      default:
                        return;
                    }
                  }}
                  diagnostiquer={(texte) => diagnostiquerChampSimple(exercice, phase as PhaseChampSimple, texte)}
                />
              )}
              {PHASES_CALCULATRICE_CHAMP_SIMPLE.has(phase) && <CalculatriceScientifique />}

              {PHASES_TERMES_MULTIPLES.has(phase) && (
                <EtapeTermesMultiples
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as PhaseTermesMultiples}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteArithmetique(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => {
                    if (phase === "termesProches") return terminerEtape(soumettreReponseTermesProches(etat, textes));
                    return terminerEtape(soumettreReponseCalculerTermesAlgebrique(etat, textes));
                  }}
                  diagnostiquer={(textes) => diagnostiquerTermesMultiples(exercice, phase as PhaseTermesMultiples, textes)}
                />
              )}
              {PHASES_CALCULATRICE_TERMES_MULTIPLES.has(phase) && <CalculatriceScientifique />}

              {phase === "coherenceJugement" && (
                <EtapeCoherenceJugement
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteArithmetique(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(choix) => terminerEtape(soumettreReponseCoherenceJugement(etat, choix))}
                />
              )}

              {PHASES_POSER_EQUATION.has(phase) && (
                <EtapePoserEquation
                  key={cleEcran}
                  exercice={exercice}
                  phase={phase as PhasePoserEquation}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteArithmetique(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => {
                    if (phase === "poserEquationRangN") return terminerEtape(soumettreReponsePoserEquationRangN(etat, reponse));
                    return terminerEtape(soumettreReponsePoserEquationAlgebrique(etat, reponse));
                  }}
                  diagnostiquer={(reponse) => diagnostiquerPoserEquation(exercice, phase as PhasePoserEquation, reponse)}
                />
              )}
              {PHASES_CALCULATRICE_POSER_EQUATION.has(phase) && <CalculatriceScientifique />}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelSuiteArithmetique
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionSuiteArithmetique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
