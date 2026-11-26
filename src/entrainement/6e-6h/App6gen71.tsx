import { useState } from "react";
import type { VarianteQuizVariablesAleatoires } from "./core6e/quizVariablesAleatoires.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizVariablesAleatoires, soumettreReponseQuizVariablesAleatoires } from "./moteur6e/sessionQuizVariablesAleatoires";
import type { EtatSessionQuizVariablesAleatoires, ResultatExerciceQuizVariablesAleatoires } from "./moteur6e/typesQuizVariablesAleatoires";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizVariablesAleatoires";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizVariablesAleatoires } from "./components6e/EtapeQuestionQuizVariablesAleatoires";
import { ResultatPanelQuizVariablesAleatoires } from "./components6e/ResultatPanelQuizVariablesAleatoires";
import { ResumeSessionQuizVariablesAleatoires } from "./components6e/ResumeSessionQuizVariablesAleatoires";
import { useNoterEssai } from "../../lib/suiviContexte";

/** Une session = toutes les questions du thème choisi (`nombreQuestions`, taille réelle de la banque,
 * jamais une constante en dur), couplé à `creerGenerateurSansRepetition` : aucune question n'est
 * répétée. */
function reglagesPourTheme(theme: VarianteQuizVariablesAleatoires): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizVariablesAleatoires): EtatSessionQuizVariablesAleatoires {
  return demarrerSessionQuizVariablesAleatoires(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64/65/66/67/68/69/70.
 * Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur
 * l'écran normal donné aux élèves. */
export function App6gen71() {
  const noterEssai = useNoterEssai();
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizVariablesAleatoires | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizVariablesAleatoires | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizVariablesAleatoires | null>(null);

  function choisirTheme(theme: VarianteQuizVariablesAleatoires) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizVariablesAleatoires(etat, reponse);
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    // « Mon suivi » (`lib/suiviEssais.ts`) : chaque affirmation répondue = un essai d'un écran, gardé sur l'appareil.
    if (resultat && nouvelEtat.resultats.length > etat.resultats.length) noterEssai([resultat.revele ? "revele" : "correcte"], resultat.variante);
    setDernierResultat(resultat);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizVariablesAleatoires;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizVariablesAleatoires(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Variables aléatoires et lois de probabilités — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 8 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Variables aléatoires et lois de probabilités"}</p>
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
        {!etat ? (
          <div>
            <h2 className="result-title">Choisis un thème</h2>
            <p className="result-subtitle">
              {CATALOGUE_VARIANTES.length} thèmes,{" "}
              {ETENDUE_QUESTIONS.min === ETENDUE_QUESTIONS.max ? ETENDUE_QUESTIONS.min : `${ETENDUE_QUESTIONS.min} à ${ETENDUE_QUESTIONS.max}`} affirmations vrai/faux
              chacun — révision complète du chapitre « Variables aléatoires et lois de probabilités ».
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
          <ResultatPanelQuizVariablesAleatoires
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizVariablesAleatoires
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizVariablesAleatoires question={etat.exerciceCourant.question} onValider={onValider} />
        )}
      </main>
    </div>
  );
}
