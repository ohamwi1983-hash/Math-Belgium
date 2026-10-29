import { useState } from "react";
import type { VarianteQuizCercleTriangles } from "./core/quizCercleTriangles.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizCercleTriangles, soumettreReponseQuizCercleTriangles } from "./moteur/sessionQuizCercleTriangles";
import type { EtatSessionQuizCercleTriangles, ResultatExerciceQuizCercleTriangles } from "./moteur/typesQuizCercleTriangles";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, etendueNombreQuestions, nombreQuestions } from "./generateurs/quizCercleTriangles";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizCercleTriangles } from "./components/EtapeQuestionQuizCercleTriangles";
import { ResultatPanelQuizCercleTriangles } from "./components/ResultatPanelQuizCercleTriangles";
import { ResumeSessionQuizCercleTriangles } from "./components/ResumeSessionQuizCercleTriangles";

/** `nombreExercices` = taille réelle de la banque du thème choisi (`nombreQuestions`,
 * `generateurs/quizCercleTriangles/index.ts`) — jamais une constante fixe : couplé à
 * `creerGenerateurSansRepetition`, une session parcourt donc toutes les questions du thème sans
 * jamais en répéter une (convention `.claude/rules/quiz-generators.md`). */
function reglagesPourTheme(theme: VarianteQuizCercleTriangles): ReglagesSession {
  return {
    nombreExercices: nombreQuestions(theme),
    tentativesMax: 1,
    affichageReponseApresEchec: true,
    affichageExplication: true,
  };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizCercleTriangles): EtatSessionQuizCercleTriangles {
  return demarrerSessionQuizCercleTriangles(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Panneau dev visible seulement en développement ou avec `?dev=1` (même garde que
 * `AppQuizGeometrieAnalytique.tsx`) — jamais sur l'écran normal donné aux élèves. */
function modeDevActif(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que "Statistique descriptive
 * à une variable" (gen59), "La fonction du second degré" (gen60), "Équations et inéquations du
 * second degré" (gen61) et "Caractéristiques d'une fonction & fonctions de référence" (gen62). Le
 * panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur l'écran
 * normal donné aux élèves. */
export function AppQuizCercleTriangles() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizCercleTriangles | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizCercleTriangles | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizCercleTriangles | null>(null);

  function choisirTheme(theme: VarianteQuizCercleTriangles) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizCercleTriangles(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizCercleTriangles;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizCercleTriangles(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell app-shell--haut">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Cercle trigonométrique &amp; triangles quelconques — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 5{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
        {modeDevActif() && <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />}
        {enCoursDeSession && etat && (
          <div className="progress">
            <div className="progress-label">
              <span>
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
            <ResultatPanelQuizCercleTriangles
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizCercleTriangles
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizCercleTriangles question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
