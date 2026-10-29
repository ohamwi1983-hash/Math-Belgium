import { useState } from "react";
import type { VarianteQuizGeometrieAnalytique } from "./core/quizGeometrieAnalytique.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizGeometrieAnalytique, soumettreReponseQuizGeometrieAnalytique } from "./moteur/sessionQuizGeometrieAnalytique";
import type { EtatSessionQuizGeometrieAnalytique, ResultatExerciceQuizGeometrieAnalytique } from "./moteur/typesQuizGeometrieAnalytique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, etendueNombreQuestions, nombreQuestions } from "./generateurs/quizGeometrieAnalytique";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizGeometrieAnalytique } from "./components/EtapeQuestionQuizGeometrieAnalytique";
import { ResultatPanelQuizGeometrieAnalytique } from "./components/ResultatPanelQuizGeometrieAnalytique";
import { ResumeSessionQuizGeometrieAnalytique } from "./components/ResumeSessionQuizGeometrieAnalytique";

/** `nombreExercices` = taille réelle de la banque du thème choisi (`nombreQuestions`,
 * `generateurs/quizGeometrieAnalytique/index.ts`) — jamais une constante fixe : couplé à
 * `creerGenerateurSansRepetition`, une session parcourt donc toutes les questions du thème sans
 * jamais en répéter une (convention `.claude/rules/quiz-generators.md`). */
function reglagesPourTheme(theme: VarianteQuizGeometrieAnalytique): ReglagesSession {
  return {
    nombreExercices: nombreQuestions(theme),
    tentativesMax: 1,
    affichageReponseApresEchec: true,
    affichageExplication: true,
  };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizGeometrieAnalytique): EtatSessionQuizGeometrieAnalytique {
  return demarrerSessionQuizGeometrieAnalytique(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Panneau dev visible seulement en développement ou avec `?dev=1` (même garde que les hooks
 * DEV-ONLY de `6e-6h/App6gen*.tsx`) — jamais sur l'écran normal donné aux élèves. */
function modeDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que les 6 quiz précédents
 * (gen59-64). Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement
 * (`modeDevActif`), jamais visible sur l'écran normal donné aux élèves. */
export function AppQuizGeometrieAnalytique() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizGeometrieAnalytique | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizGeometrieAnalytique | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizGeometrieAnalytique | null>(null);

  function choisirTheme(theme: VarianteQuizGeometrieAnalytique) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizGeometrieAnalytique(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizGeometrieAnalytique;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizGeometrieAnalytique(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Géométrie analytique plane — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 7 — {CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label ?? "Géométrie analytique plane"}</p>
        {modeDevActif() && <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />}
        {enCoursDeSession && etat && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Question {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
        {!etat ? (
          <div>
            <h2 className="result-title">Choisis un thème</h2>
            <p className="result-subtitle">
              {CATALOGUE_VARIANTES.length} thèmes,{" "}
              {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max ? ETENDUE_QUESTIONS.min : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max}`} affirmations vrai/faux chacun — révision complète du chapitre.
            </p>
            <div className="accueil-choix">
              {CATALOGUE_VARIANTES.map((variante, index) => (
                <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                  {index + 1}. {variante.label}
                </button>
              ))}
            </div>
          </div>
        ) : dernierResultat ? (
          <ResultatPanelQuizGeometrieAnalytique
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizGeometrieAnalytique
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizGeometrieAnalytique question={etat.exerciceCourant.question} onValider={onValider} />
        )}
        </div>
      </main>
    </div>
  );
}
