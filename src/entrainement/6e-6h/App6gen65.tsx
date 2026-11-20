import { useState } from "react";
import type { VarianteQuizFonctionsExponentielles } from "./core6e/quizFonctionsExponentielles.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  demarrerSessionQuizFonctionsExponentielles,
  soumettreReponseQuizFonctionsExponentielles,
} from "./moteur6e/sessionQuizFonctionsExponentielles";
import type {
  EtatSessionQuizFonctionsExponentielles,
  ResultatExerciceQuizFonctionsExponentielles,
} from "./moteur6e/typesQuizFonctionsExponentielles";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizFonctionsExponentielles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizFonctionsExponentielles } from "./components6e/EtapeQuestionQuizFonctionsExponentielles";
import { ResultatPanelQuizFonctionsExponentielles } from "./components6e/ResultatPanelQuizFonctionsExponentielles";
import { ResumeSessionQuizFonctionsExponentielles } from "./components6e/ResumeSessionQuizFonctionsExponentielles";

/** `nombreExercices` = taille RÉELLE de la banque du thème choisi (`nombreQuestions`, jamais une
 * constante : convention `.claude/rules/quiz-generators.md`) : couplé à
 * `creerGenerateurSansRepetition`, une session parcourt toutes les questions du thème sans jamais en
 * répéter une. */
function reglages(theme: VarianteQuizFonctionsExponentielles): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

function nouvelleSession(theme: VarianteQuizFonctionsExponentielles): EtatSessionQuizFonctionsExponentielles {
  return demarrerSessionQuizFonctionsExponentielles(reglages(theme), creerGenerateurSansRepetition(theme));
}

const ETENDUE = etendueNombreQuestions();
const TEXTE_NOMBRE = ETENDUE.min === ETENDUE.max ? `${ETENDUE.min}` : `${ETENDUE.min} à ${ETENDUE.max}`;

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64 et les 4 quiz
 * vrai/faux du chantier 4e (gen59-62). Le panneau dev (`SelecteurVarianteDev`) reste réservé au
 * développement, jamais visible sur l'écran normal donné aux élèves. */
export function App6gen65() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizFonctionsExponentielles | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizFonctionsExponentielles | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizFonctionsExponentielles | null>(null);

  function choisirTheme(theme: VarianteQuizFonctionsExponentielles) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizFonctionsExponentielles(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizFonctionsExponentielles;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizFonctionsExponentielles(reglages(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fonctions exponentielles — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 2 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Fonctions exponentielles"}</p>
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
                {CATALOGUE_VARIANTES.length} thèmes, {TEXTE_NOMBRE} affirmations vrai/faux chacun — révision complète du chapitre 2.
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
            <ResultatPanelQuizFonctionsExponentielles
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizFonctionsExponentielles
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizFonctionsExponentielles question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
