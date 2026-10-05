import { useState } from "react";
import type { VarianteQuizStatistiqueDescriptive } from "./core/quizStatistiqueDescriptive.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizStatistiqueDescriptive, soumettreReponseQuizStatistiqueDescriptive } from "./moteur/sessionQuizStatistiqueDescriptive";
import type { EtatSessionQuizStatistiqueDescriptive, ResultatExerciceQuizStatistiqueDescriptive } from "./moteur/typesQuizStatistiqueDescriptive";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs/quizStatistiqueDescriptive";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizStatistiqueDescriptive } from "./components/EtapeQuestionQuizStatistiqueDescriptive";
import { ResultatPanelQuizStatistiqueDescriptive } from "./components/ResultatPanelQuizStatistiqueDescriptive";
import { ResumeSessionQuizStatistiqueDescriptive } from "./components/ResumeSessionQuizStatistiqueDescriptive";

/** `nombreExercices: 35` correspond exactement à la taille de la banque par thème (voir
 * `generateurs/quizStatistiqueDescriptive/banque.ts`) : couplé à `creerGenerateurSansRepetition`,
 * une session parcourt donc les 35 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 35,
  tentativesMax: 1,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(theme: VarianteQuizStatistiqueDescriptive): EtatSessionQuizStatistiqueDescriptive {
  return demarrerSessionQuizStatistiqueDescriptive(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — voir `core/quizStatistiqueDescriptive.types.ts`.
 * Le panneau dev (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur
 * l'écran normal donné aux élèves. */
export function AppQuizStatistiqueDescriptive() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizStatistiqueDescriptive | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizStatistiqueDescriptive | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizStatistiqueDescriptive | null>(null);

  function choisirTheme(theme: VarianteQuizStatistiqueDescriptive) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizStatistiqueDescriptive(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizStatistiqueDescriptive;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizStatistiqueDescriptive(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Statistique descriptive à une variable — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 5{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
              <p className="result-subtitle">10 thèmes, 20 affirmations vrai/faux chacun — révision complète du chapitre.</p>
              <div className="accueil-choix">
                {CATALOGUE_VARIANTES.map((variante, index) => (
                  <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                    {index + 1}. {variante.label}
                  </button>
                ))}
              </div>
            </div>
          ) : dernierResultat ? (
            <ResultatPanelQuizStatistiqueDescriptive
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizStatistiqueDescriptive
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizStatistiqueDescriptive question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
