import { useState } from "react";
import type { VarianteQuizCalculVectoriel } from "./core/quizCalculVectoriel.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizCalculVectoriel, soumettreReponseQuizCalculVectoriel } from "./moteur/sessionQuizCalculVectoriel";
import type { EtatSessionQuizCalculVectoriel, ResultatExerciceQuizCalculVectoriel } from "./moteur/typesQuizCalculVectoriel";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, etendueNombreQuestions, nombreQuestions } from "./generateurs/quizCalculVectoriel";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizCalculVectoriel } from "./components/EtapeQuestionQuizCalculVectoriel";
import { ResultatPanelQuizCalculVectoriel } from "./components/ResultatPanelQuizCalculVectoriel";
import { ResumeSessionQuizCalculVectoriel } from "./components/ResumeSessionQuizCalculVectoriel";

/** `nombreExercices` = taille réelle de la banque du thème choisi (`nombreQuestions`,
 * `generateurs/quizCalculVectoriel/index.ts`) — jamais une constante fixe : couplé à
 * `creerGenerateurSansRepetition`, une session parcourt donc toutes les questions du thème sans
 * jamais en répéter une (convention `.claude/rules/quiz-generators.md`). */
function reglagesPourTheme(theme: VarianteQuizCalculVectoriel): ReglagesSession {
  return {
    nombreExercices: nombreQuestions(theme),
    tentativesMax: 1,
    affichageReponseApresEchec: true,
    affichageExplication: true,
  };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizCalculVectoriel): EtatSessionQuizCalculVectoriel {
  return demarrerSessionQuizCalculVectoriel(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Panneau dev visible seulement en développement ou avec `?dev=1` (même garde que
 * `AppQuizGeometrieAnalytique.tsx`) — jamais sur l'écran normal donné aux élèves. */
function modeDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que les 5 quiz précédents
 * (gen59-63). Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais
 * visible sur l'écran normal donné aux élèves. */
export function AppQuizCalculVectoriel() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizCalculVectoriel | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizCalculVectoriel | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizCalculVectoriel | null>(null);

  function choisirTheme(theme: VarianteQuizCalculVectoriel) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizCalculVectoriel(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizCalculVectoriel;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizCalculVectoriel(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Calcul vectoriel — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 6{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
              {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max
                ? `${ETENDUE_QUESTIONS.max} affirmations`
                : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max} affirmations`}{" "}
              vrai/faux chacun — révision complète du chapitre.
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
          <ResultatPanelQuizCalculVectoriel
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizCalculVectoriel
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizCalculVectoriel question={etat.exerciceCourant.question} onValider={onValider} />
        )}
        </div>
      </main>
    </div>
  );
}
