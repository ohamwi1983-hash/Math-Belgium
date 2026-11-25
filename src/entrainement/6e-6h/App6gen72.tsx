import { useState } from "react";
import type { VarianteQuizLieuxGeometriques } from "./core6e/quizLieuxGeometriques.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { demarrerSessionQuizLieuxGeometriques, soumettreReponseQuizLieuxGeometriques } from "./moteur6e/sessionQuizLieuxGeometriques";
import type { EtatSessionQuizLieuxGeometriques, ResultatExerciceQuizLieuxGeometriques } from "./moteur6e/typesQuizLieuxGeometriques";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizLieuxGeometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizLieuxGeometriques } from "./components6e/EtapeQuestionQuizLieuxGeometriques";
import { ResultatPanelQuizLieuxGeometriques } from "./components6e/ResultatPanelQuizLieuxGeometriques";
import { ResumeSessionQuizLieuxGeometriques } from "./components6e/ResumeSessionQuizLieuxGeometriques";
import { useNoterEssai } from "../../lib/suiviContexte";

/** Une session = toutes les questions du thème choisi (`nombreQuestions`, taille réelle de la banque,
 * jamais une constante en dur), couplé à `creerGenerateurSansRepetition` : aucune question n'est
 * répétée. */
function reglagesPourTheme(theme: VarianteQuizLieuxGeometriques): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

const ETENDUE_QUESTIONS = etendueNombreQuestions();

function nouvelleSession(theme: VarianteQuizLieuxGeometriques): EtatSessionQuizLieuxGeometriques {
  return demarrerSessionQuizLieuxGeometriques(reglagesPourTheme(theme), creerGenerateurSansRepetition(theme));
}

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen64/65/66/67/68/69/70/71.
 * Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur
 * l'écran normal donné aux élèves. */
export function App6gen72() {
  const noterEssai = useNoterEssai();
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizLieuxGeometriques | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizLieuxGeometriques | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizLieuxGeometriques | null>(null);

  function choisirTheme(theme: VarianteQuizLieuxGeometriques) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizLieuxGeometriques(etat, reponse);
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    // « Mon suivi » (`lib/suiviEssais.ts`) : chaque affirmation répondue = un essai d'un écran, gardé sur l'appareil.
    if (resultat && nouvelEtat.resultats.length > etat.resultats.length) noterEssai([resultat.revele ? "revele" : "correcte"], resultat.variante);
    setDernierResultat(resultat);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizLieuxGeometriques;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizLieuxGeometriques(reglagesPourTheme(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Lieux géométriques — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 9 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Lieux géométriques"}</p>
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
              chacun — révision complète du chapitre 9.
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
          <ResultatPanelQuizLieuxGeometriques
            resultat={dernierResultat}
            labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
            onContinuer={() => setDernierResultat(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionQuizLieuxGeometriques
            resultats={etat.resultats}
            onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
            onChangerTheme={() => {
              setThemeChoisi(null);
              setEtat(null);
            }}
          />
        ) : (
          <EtapeQuestionQuizLieuxGeometriques question={etat.exerciceCourant.question} onValider={onValider} />
        )}
      </main>
    </div>
  );
}
