import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { CompositionDirigee, SensComposition } from "./core5e/composerFonctions.types";
import { CATALOGUE_COMBOS, CATALOGUE_SENS, construireAvecCombos, genererExerciceComposerFonctions } from "./generateurs5e/composerFonctions";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS,
  activerAideSuivante,
  demarrerSessionComposerFonctions,
  soumettreReponseC1,
  soumettreReponseC2,
  soumettreReponseConditions,
  soumettreReponseDomaine,
  soumettreReponseFormule,
} from "./moteur5e/sessionComposerFonctions";
import type { EtatSessionComposerFonctions, PhaseComposerFonctions, ResultatExerciceComposerFonctions } from "./moteur5e/typesComposerFonctions";
import { diagnostiquerFormuleDirectionSimplifiee } from "./moteur5e/verificationComposerFonctions";
import { DonneesComposerFonctions } from "./components5e/DonneesComposerFonctions";
import { EtapeFormuleComposerFonctions } from "./components5e/EtapeFormuleComposerFonctions";
import { EtapeConditionsComposerFonctions } from "./components5e/EtapeConditionsComposerFonctions";
import { EtapeDomaineComposerFonctions } from "./components5e/EtapeDomaineComposerFonctions";
import { ResultatPanelComposerFonctions } from "./components5e/ResultatPanelComposerFonctions";
import { ResumeSessionComposerFonctions } from "./components5e/ResumeSessionComposerFonctions";
import {
  PLACEHOLDER_FORMULE,
  consigneC1,
  consigneC2,
  consigneConditions,
  consigneDomaine,
  consigneFormule,
  estPhaseFRondG,
  formatTermesEtatActuelComposerFonctions,
  latexAideC1Niveau2,
  latexAideC2Niveau2,
  latexAideConditionsNiveau2,
  latexAideDomaineNiveau2,
  latexAideFormuleNiveau2,
  texteAideC1Niveau1,
  texteAideC2Niveau1,
  texteAideConditionsNiveau1,
  texteAideDomaineNiveau1,
  texteAideFormuleNiveau1,
} from "./ui5e/formatComposerFonctions";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComposerFonctions {
  return demarrerSessionComposerFonctions(REGLAGES_DEMO, genererExerciceComposerFonctions);
}

interface Bilan {
  resultat: ResultatExerciceComposerFonctions;
  aideParPhase: Partial<Record<PhaseComposerFonctions, number>>;
}

/** D.1 — panneau dev "forcer une variante" : les 10 combinaisons de familles × 3 sous-variantes de
 * sens = 30 entrées (2 axes de tirage indépendants combinés en un seul catalogue plat, même
 * principe que gen57, 4e, pour un générateur à 2 axes). */
const OPTIONS_COMPOSITION = CATALOGUE_COMBOS.flatMap((combo) =>
  CATALOGUE_SENS.map((sens) => ({ id: `${combo.id}::${sens.id}`, label: `${combo.label} — ${sens.label}` })),
);

function directionCourante(etat: EtatSessionComposerFonctions): CompositionDirigee {
  const exercice = etat.exerciceCourant;
  const dir = estPhaseFRondG(etat.phase) ? exercice.fRondG : exercice.gRondF;
  if (dir === null) throw new Error("directionCourante : aucune composition disponible pour la phase courante");
  return dir;
}

export function App5gen3() {
  const [etat, setEtat] = useState<EtatSessionComposerFonctions>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseComposerFonctions, number>>>({});

  function terminerEtape(nouvelEtat: EtatSessionComposerFonctions) {
    const miseAJour = { ...aideParPhase, [etat.phase]: etat.niveauAide };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const donnees = <DonneesComposerFonctions exercice={exercice} />;
  const termesEtatActuel = formatTermesEtatActuelComposerFonctions(exercice, etat.ordre, etat.indexPhase);
  const dir = enCoursDeSession ? directionCourante(etat) : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composer f et g</h1>
      </header>
      <SelecteurVarianteDev
        options={OPTIONS_COMPOSITION}
        onGenerer={(id) => {
          const [comboId, sensId] = id.split("::") as [string, SensComposition];
          setDernierBilan(null);
          setEtat(demarrerSessionComposerFonctions(REGLAGES_DEMO, () => construireAvecCombos(comboId, sensId)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && dir && (
            <>
              {etat.phase.startsWith("formule") && (
                <EtapeFormuleComposerFonctions
                  key={etat.phase}
                  consigne={consigneFormule(dir)}
                  donnees={donnees}
                  placeholder={PLACEHOLDER_FORMULE}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  texteAideNiveau1={texteAideFormuleNiveau1(dir)}
                  latexAideNiveau2={etat.niveauAide >= 2 ? latexAideFormuleNiveau2(dir) : null}
                  termesEtatActuel={termesEtatActuel}
                  onValider={(texte) => terminerEtape(soumettreReponseFormule(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerFormuleDirectionSimplifiee(dir, texte)}
                />
              )}
              {etat.phase.startsWith("conditions") && (
                <EtapeConditionsComposerFonctions
                  key={etat.phase}
                  dir={dir}
                  consigne={consigneConditions(dir)}
                  donnees={donnees}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  texteAideNiveau1={texteAideConditionsNiveau1(dir)}
                  latexAideNiveau2={etat.niveauAide >= 2 ? latexAideConditionsNiveau2(dir) : null}
                  termesEtatActuel={termesEtatActuel}
                  onValider={(reponse) => terminerEtape(soumettreReponseConditions(etat, reponse))}
                />
              )}
              {etat.phase.startsWith("c1") && (
                <EtapeDomaineComposerFonctions
                  key={etat.phase}
                  consigne={consigneC1(dir)}
                  donnees={donnees}
                  prefixApercu="x\in"
                  attendu={dir.interieure.domaine}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  texteAideNiveau1={texteAideC1Niveau1(dir)}
                  latexAideNiveau2={etat.niveauAide >= 2 ? latexAideC1Niveau2(dir) : null}
                  termesEtatActuel={termesEtatActuel}
                  onValider={(reponse) => terminerEtape(soumettreReponseC1(etat, reponse))}
                />
              )}
              {etat.phase.startsWith("c2") && (
                <EtapeDomaineComposerFonctions
                  key={etat.phase}
                  consigne={consigneC2(dir)}
                  donnees={donnees}
                  prefixApercu="x\in"
                  attendu={dir.domaineApresCarre ?? undefined}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  texteAideNiveau1={texteAideC2Niveau1(dir)}
                  latexAideNiveau2={etat.niveauAide >= 2 ? latexAideC2Niveau2(dir) : null}
                  termesEtatActuel={termesEtatActuel}
                  onValider={(reponse) => terminerEtape(soumettreReponseC2(etat, reponse))}
                />
              )}
              {etat.phase.startsWith("domaine") && (
                <EtapeDomaineComposerFonctions
                  key={etat.phase}
                  consigne={consigneDomaine(dir)}
                  donnees={donnees}
                  prefixApercu={`\\text{dom}(${estPhaseFRondG(etat.phase) ? "f\\circ g" : "g\\circ f"}) =`}
                  attendu={dir.domaine}
                  tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                  tentativesMax={etat.reglages.tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  texteAideNiveau1={texteAideDomaineNiveau1(dir)}
                  latexAideNiveau2={etat.niveauAide >= 2 ? latexAideDomaineNiveau2(dir) : null}
                  termesEtatActuel={termesEtatActuel}
                  onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelComposerFonctions
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionComposerFonctions resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
