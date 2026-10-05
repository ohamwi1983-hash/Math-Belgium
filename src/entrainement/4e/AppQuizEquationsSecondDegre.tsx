import { useState } from "react";
import type { VarianteQuizEquationsSecondDegre } from "./core/quizEquationsSecondDegre.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionQuizEquationsSecondDegre, soumettreReponseQuizEquationsSecondDegre } from "./moteur/sessionQuizEquationsSecondDegre";
import type { EtatSessionQuizEquationsSecondDegre, ResultatExerciceQuizEquationsSecondDegre } from "./moteur/typesQuizEquationsSecondDegre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, creerGenerateurSansRepetition } from "./generateurs/quizEquationsSecondDegre";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeQuestionQuizEquationsSecondDegre } from "./components/EtapeQuestionQuizEquationsSecondDegre";
import { ResultatPanelQuizEquationsSecondDegre } from "./components/ResultatPanelQuizEquationsSecondDegre";
import { ResumeSessionQuizEquationsSecondDegre } from "./components/ResumeSessionQuizEquationsSecondDegre";

/** `nombreExercices: 35` correspond exactement à la taille de la banque par thème (voir
 * `generateurs/quizEquationsSecondDegre/banque.ts`) : couplé à `creerGenerateurSansRepetition`,
 * une session parcourt donc les 35 questions du thème choisi sans jamais en répéter une. */
const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 35,
  tentativesMax: 1,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(theme: VarianteQuizEquationsSecondDegre): EtatSessionQuizEquationsSecondDegre {
  return demarrerSessionQuizEquationsSecondDegre(REGLAGES_DEMO, creerGenerateurSansRepetition(theme));
}

/** Contrairement aux autres générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que "Statistique descriptive
 * à une variable" (gen59) et "La fonction du second degré" (gen60). Le panneau dev
 * (`SelecteurVarianteDev`) reste réservé au développement, jamais visible sur l'écran normal donné
 * aux élèves. */
export function AppQuizEquationsSecondDegre() {
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizEquationsSecondDegre | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizEquationsSecondDegre | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizEquationsSecondDegre | null>(null);

  function choisirTheme(theme: VarianteQuizEquationsSecondDegre) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizEquationsSecondDegre(etat, reponse);
    setDernierResultat(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizEquationsSecondDegre;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizEquationsSecondDegre(REGLAGES_DEMO, () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équations et inéquations du second degré — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 2{themeChoisi ? ` — ${CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label}` : ""}</p>
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
              <p className="result-subtitle">7 thèmes, 35 affirmations vrai/faux chacun — révision complète du chapitre, discriminant compris.</p>
              <div className="accueil-choix">
                {CATALOGUE_VARIANTES.map((variante, index) => (
                  <button key={variante.id} type="button" className="btn btn-primary" onClick={() => choisirTheme(variante.id)}>
                    {index + 1}. {variante.label}
                  </button>
                ))}
              </div>
            </div>
          ) : dernierResultat ? (
            <ResultatPanelQuizEquationsSecondDegre
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizEquationsSecondDegre
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizEquationsSecondDegre question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
