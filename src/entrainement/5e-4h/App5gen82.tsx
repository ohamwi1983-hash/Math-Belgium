import { useState } from "react";
import type { VarianteQuizStatDeuxVariables5e } from "./core5e/quizStatDeuxVariables5e.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { demarrerSessionQuizStatDeuxVariables5e, soumettreReponseQuizStatDeuxVariables5e } from "./moteur5e/sessionQuizStatDeuxVariables5e";
import type { EtatSessionQuizStatDeuxVariables5e, ResultatExerciceQuizStatDeuxVariables5e } from "./moteur5e/typesQuizStatDeuxVariables5e";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition, etendueNombreQuestions, nombreQuestions } from "./generateurs5e/quizStatDeuxVariables5e/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { EtapeQuestionQuizStatDeuxVariables5e } from "./components5e/EtapeQuestionQuizStatDeuxVariables5e";
import { ResultatPanelQuizStatDeuxVariables5e } from "./components5e/ResultatPanelQuizStatDeuxVariables5e";
import { ResumeSessionQuizStatDeuxVariables5e } from "./components5e/ResumeSessionQuizStatDeuxVariables5e";
import { useNoterEssai } from "../../lib/suiviContexte";

/** `nombreExercices` = taille RÉELLE de la banque du thème (`.claude/rules/quiz-generators.md`,
 * piège du nombre fixe) : couplé à `creerGenerateurSansRepetition`, une session parcourt toutes les
 * affirmations du thème choisi sans jamais en répéter une, même si la banque change de taille. */
function reglagesPour(theme: VarianteQuizStatDeuxVariables5e): ReglagesSession5e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizStatDeuxVariables5e): EtatSessionQuizStatDeuxVariables5e {
  return demarrerSessionQuizStatDeuxVariables5e(reglagesPour(theme), creerGenerateurSansRepetition(theme));
}

/** 5gen82 — "Statistique à deux variables" (quiz vrai/faux), chapitre 6, réplique mécanique du patron
 * quiz vrai/faux déjà établi aux chapitres 1 à 5 (5gen39 à 5gen43). Contrairement aux autres générateurs, le thème (variante) n'est pas
 * tiré au hasard : c'est l'ÉLÈVE qui le choisit sur un écran d'accueil dédié. "Changer de thème"
 * (`ResumeSessionQuizStatDeuxVariables5e`) ramène à CET écran de choix, jamais à l'accueil global de la
 * plateforme (`onRetourAccueil`, réservé au bouton "← Accueil"). Le panneau dev
 * (`SelecteurVarianteDev`, 5e) reste réservé au développement, jamais visible sur l'écran normal
 * donné aux élèves. */
export function App5gen82() {
  const noterEssai = useNoterEssai();
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizStatDeuxVariables5e | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizStatDeuxVariables5e | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizStatDeuxVariables5e | null>(null);

  function choisirTheme(theme: VarianteQuizStatDeuxVariables5e) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizStatDeuxVariables5e(etat, reponse);
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    // « Mon suivi » (`lib/suiviEssais.ts`) : chaque affirmation répondue = un essai d'un écran, gardé sur l'appareil.
    if (resultat && nouvelEtat.resultats.length > etat.resultats.length) noterEssai([resultat.revele ? "revele" : "correcte"], resultat.variante);
    setDernierResultat(resultat);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizStatDeuxVariables5e;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizStatDeuxVariables5e(reglagesPour(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Statistique à deux variables — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 6{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
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
                vrai/faux chacun, un par point du cours — révision complète du chapitre.
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
            <ResultatPanelQuizStatDeuxVariables5e
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizStatDeuxVariables5e
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizStatDeuxVariables5e question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
