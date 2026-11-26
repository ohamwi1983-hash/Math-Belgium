import { useState } from "react";
import type { VarianteQuizFonctionsReciproquesCyclometriques } from "./core6e/quizFonctionsReciproquesCyclometriques.types";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  demarrerSessionQuizFonctionsReciproquesCyclometriques,
  soumettreReponseQuizFonctionsReciproquesCyclometriques,
} from "./moteur6e/sessionQuizFonctionsReciproquesCyclometriques";
import type {
  EtatSessionQuizFonctionsReciproquesCyclometriques,
  ResultatExerciceQuizFonctionsReciproquesCyclometriques,
} from "./moteur6e/typesQuizFonctionsReciproquesCyclometriques";
import {
  CATALOGUE_VARIANTES,
  construireAvecVarianteId,
  creerGenerateurSansRepetition,
  etendueNombreQuestions,
  nombreQuestions,
} from "./generateurs6e/quizFonctionsReciproquesCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EtapeQuestionQuizFonctionsReciproquesCyclometriques } from "./components6e/EtapeQuestionQuizFonctionsReciproquesCyclometriques";
import { ResultatPanelQuizFonctionsReciproquesCyclometriques } from "./components6e/ResultatPanelQuizFonctionsReciproquesCyclometriques";
import { ResumeSessionQuizFonctionsReciproquesCyclometriques } from "./components6e/ResumeSessionQuizFonctionsReciproquesCyclometriques";
import { useNoterEssai } from "../../lib/suiviContexte";

/** `nombreExercices` = taille RÉELLE de la banque du thème choisi (`nombreQuestions`, jamais une
 * constante : convention `.claude/rules/quiz-generators.md`) : couplé à
 * `creerGenerateurSansRepetition`, une session parcourt toutes les questions du thème sans jamais en
 * répéter une. */
function reglages(theme: VarianteQuizFonctionsReciproquesCyclometriques): ReglagesSession6e {
  return { nombreExercices: nombreQuestions(theme), tentativesMax: 1 };
}

function nouvelleSession(theme: VarianteQuizFonctionsReciproquesCyclometriques): EtatSessionQuizFonctionsReciproquesCyclometriques {
  return demarrerSessionQuizFonctionsReciproquesCyclometriques(reglages(theme), creerGenerateurSansRepetition(theme));
}

const ETENDUE = etendueNombreQuestions();
const TEXTE_NOMBRE = ETENDUE.min === ETENDUE.max ? `${ETENDUE.min}` : `${ETENDUE.min} à ${ETENDUE.max}`;

/** Contrairement à la plupart des générateurs, le thème (variante) n'est pas tiré au hasard : c'est
 * l'ÉLÈVE qui le choisit sur un écran d'accueil dédié — même principe que 6gen65 et les 4 quiz
 * vrai/faux du chantier 4e (gen59-62). Le panneau dev (`SelecteurVarianteDev`) reste réservé au
 * développement, jamais visible sur l'écran normal donné aux élèves. */
export function App6gen64() {
  const noterEssai = useNoterEssai();
  const [themeChoisi, setThemeChoisi] = useState<VarianteQuizFonctionsReciproquesCyclometriques | null>(null);
  const [etat, setEtat] = useState<EtatSessionQuizFonctionsReciproquesCyclometriques | null>(null);
  const [dernierResultat, setDernierResultat] = useState<ResultatExerciceQuizFonctionsReciproquesCyclometriques | null>(null);

  function choisirTheme(theme: VarianteQuizFonctionsReciproquesCyclometriques) {
    setThemeChoisi(theme);
    setEtat(nouvelleSession(theme));
    setDernierResultat(null);
  }

  function onValider(reponse: boolean) {
    if (!etat) return;
    const nouvelEtat = soumettreReponseQuizFonctionsReciproquesCyclometriques(etat, reponse);
    const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    // « Mon suivi » (`lib/suiviEssais.ts`) : chaque affirmation répondue = un essai d'un écran, gardé sur l'appareil.
    if (resultat && nouvelEtat.resultats.length > etat.resultats.length) noterEssai([resultat.revele ? "revele" : "correcte"], resultat.variante);
    setDernierResultat(resultat);
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    const theme = varianteId as VarianteQuizFonctionsReciproquesCyclometriques;
    setThemeChoisi(theme);
    setDernierResultat(null);
    setEtat(demarrerSessionQuizFonctionsReciproquesCyclometriques(reglages(theme), () => construireAvecVarianteId(theme)));
  }

  const enCoursDeSession = etat !== null && !etat.terminee && !dernierResultat;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fonctions réciproques et cyclométriques — vrai ou faux</h1>
        <p className="app-subtitle">Chapitre 1 — {themeChoisi ? CATALOGUE_VARIANTES.find((v) => v.id === themeChoisi)?.label : "Fonctions réciproques et cyclométriques"}</p>
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
                {CATALOGUE_VARIANTES.length} thèmes, {TEXTE_NOMBRE} affirmations vrai/faux chacun — révision complète du chapitre « Fonctions réciproques &amp; cyclométriques ».
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
            <ResultatPanelQuizFonctionsReciproquesCyclometriques
              resultat={dernierResultat}
              labelBouton={etat.terminee ? "Voir le résumé" : "Question suivante"}
              onContinuer={() => setDernierResultat(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionQuizFonctionsReciproquesCyclometriques
              resultats={etat.resultats}
              onRecommencer={() => themeChoisi && setEtat(nouvelleSession(themeChoisi))}
              onChangerTheme={() => {
                setThemeChoisi(null);
                setEtat(null);
              }}
            />
          ) : (
            <EtapeQuestionQuizFonctionsReciproquesCyclometriques question={etat.exerciceCourant.question} onValider={onValider} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
