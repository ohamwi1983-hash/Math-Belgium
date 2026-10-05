import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationExponentielle } from "./generateurs6e/inequationsExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInequationExponentielle,
  soumettreReponseAReconnaitre,
  soumettreReponseAResoudre,
  soumettreReponseBReconnaitre,
  soumettreReponseCfReconnaitre,
  soumettreReponseCkConclure,
  soumettreReponseCkRegrouper,
  soumettreReponseDConstantResoudre,
  soumettreReponseDConstantSigne,
  soumettreReponseDVariableSigne1,
  soumettreReponseDVariableSigne2,
  soumettreReponseDVariableTableau,
  soumettreReponseERegrouper,
  soumettreReponseEResoudre,
} from "./moteur6e/sessionInequationsExponentielles";
import type {
  EtatSessionInequationExponentielle,
  PhaseInequationExponentielle,
  ResultatExerciceInequationExponentielle,
} from "./moteur6e/typesInequationsExponentielles";
import { EtapeChampSimpleIneqExpo } from "./components6e/EtapeChampSimpleIneqExpo";
import { EtapeChoixDeuxIneqExpo } from "./components6e/EtapeChoixDeuxIneqExpo";
import { EtapeIntervalleIneqExpo } from "./components6e/EtapeIntervalleIneqExpo";
import { EtapeSigneUnZeroIneqExpo } from "./components6e/EtapeSigneUnZeroIneqExpo";
import { ResultatPanelInequationExponentielle } from "./components6e/ResultatPanelInequationExponentielle";
import { ResumeSessionInequationExponentielle } from "./components6e/ResumeSessionInequationExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, consigneEcran, etatActuel, formatEnonceLatex } from "./ui6e/formatInequationsExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInequationExponentielle {
  return demarrerSessionInequationExponentielle(REGLAGES_DEMO, genererExerciceInequationExponentielle);
}

type AideParPhase = Partial<Record<PhaseInequationExponentielle, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceInequationExponentielle;
  aideParPhase: AideParPhase;
}

export function App6gen10() {
  const [etat, setEtat] = useState<EtatSessionInequationExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionInequationExponentielle) {
    // `niveauAide` capturé AVANT la transition de phase suivante (qui le remet à zéro) — voir
    // CLAUDE.md, pattern `terminerEtape`/`aideParPhase`. `revele` lu sur `nouvelEtat.derniereRevelee`
    // (jamais `etat.etapeCourante.revelee`, qui reste TOUJOURS `false` à cet instant — la révélation
    // n'est observable QUE dans l'état retourné par `soumettreReponseXxx`, voir sa doc dans
    // `moteur6e/typesInequationsExponentielles.ts`).
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setAideParPhase({});
    setEtat(
      demarrerSessionInequationExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const etatAct = etatActuel(exercice, phase);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  // Hook de debug dev-only (même patron que `App6gen23.tsx` et les autres générateurs 6e) — expose
  // l'exercice/la phase pour une vérification Playwright réelle sans re-parser le LaTeX affiché.
  // Jamais consommé par le code applicatif, seulement par un script de test externe.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen10?: unknown }).__debug6gen10 = { exercice, phase };
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une inéquation exponentielle</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {phase === "aReconnaitre" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  placeholder="ex : 3, -2, 1/2..."
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseAReconnaitre(etat, texte))}
                />
              )}
              {phase === "aResoudre" && (
                <EtapeIntervalleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseAResoudre(etat, reponse))}
                />
              )}

              {phase === "bReconnaitre" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  optionGauche={{ id: "existe", label: "Il existe une solution" }}
                  optionDroite={{ id: "vide", label: "∅ — Aucune solution" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseBReconnaitre(etat, id === "vide"))}
                />
              )}

              {phase === "cfReconnaitre" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  optionGauche={{ id: "reel", label: "Vraie pour tout x réel (ℝ)" }}
                  optionDroite={{ id: "pasToujours", label: "Ce n'est pas toujours vrai" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseCfReconnaitre(etat, id === "reel"))}
                />
              )}

              {phase === "ckRegrouper" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  placeholder="ex : (2/9)^(x^2+5)<=1"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseCkRegrouper(etat, texte))}
                />
              )}
              {phase === "ckConclure" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  optionGauche={{ id: "reel", label: "Vraie pour tout x réel (ℝ)" }}
                  optionDroite={{ id: "pasToujours", label: "Ce n'est pas toujours vrai" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseCkConclure(etat, id === "reel"))}
                />
              )}

              {phase === "dConstantSigne" && (
                <EtapeChoixDeuxIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  optionGauche={{ id: "positif", label: "Toujours positif" }}
                  optionDroite={{ id: "negatif", label: "Toujours négatif" }}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(id) => terminerEtape(soumettreReponseDConstantSigne(etat, id as "positif" | "negatif"))}
                />
              )}
              {phase === "dConstantResoudre" && (
                <EtapeIntervalleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDConstantResoudre(etat, reponse))}
                />
              )}

              {phase === "dVariableSigne1" && (
                <EtapeSigneUnZeroIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDVariableSigne1(etat, reponse))}
                />
              )}
              {phase === "dVariableSigne2" && (
                <EtapeSigneUnZeroIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDVariableSigne2(etat, reponse))}
                />
              )}
              {phase === "dVariableTableau" && (
                <EtapeIntervalleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDVariableTableau(etat, reponse))}
                />
              )}

              {phase === "eRegrouper" && (
                <EtapeChampSimpleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  placeholder="ex : (2/5)^x<1"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(texte) => terminerEtape(soumettreReponseERegrouper(etat, texte))}
                />
              )}
              {phase === "eResoudre" && (
                <EtapeIntervalleIneqExpo
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatAct}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseEResoudre(etat, reponse))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelInequationExponentielle
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionInequationExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
