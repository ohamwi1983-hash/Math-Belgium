import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDeriveesCyclometriques } from "./generateurs6e/deriveesCyclometriques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDeriveesCyclometriques,
  soumettreReponseADeriveeFinale,
  soumettreReponseADeriveeU,
  soumettreReponseBDeriveeArc,
  soumettreReponseBDeriveeFinale,
  soumettreReponseBDeriveeU,
  soumettreReponseCDenominateur,
  soumettreReponseCDeriveeFinale,
  soumettreReponseCNumerateur,
  soumettreReponseDBrut,
  soumettreReponseDDenominateur,
  soumettreReponseDNumerateur,
  soumettreReponseDSimplifiee,
  soumettreReponseEDeriveeFinale,
  soumettreReponseEDeriveeInterne,
  soumettreReponseFBrute,
  soumettreReponseFSimplifiee,
  soumettreReponseGDeriveeFinale,
  soumettreReponseGDeriveeInterne,
} from "./moteur6e/sessionDeriveesCyclometriques";
import type {
  AideInfoEcran,
  EtatSessionDeriveesCyclometriques,
  PhaseDeriveesCyclometriques,
  ResultatExerciceDeriveesCyclometriques,
} from "./moteur6e/typesDeriveesCyclometriques";
import { EtapeChampDeriveeCyclo } from "./components6e/EtapeChampDeriveeCyclo";
import { ResultatPanelDeriveesCyclometriques } from "./components6e/ResultatPanelDeriveesCyclometriques";
import { ResumeSessionDeriveesCyclometriques } from "./components6e/ResumeSessionDeriveesCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  formatFonctionALatex,
  formatFonctionBLatex,
  formatFonctionCLatex,
  formatFonctionDLatex,
  formatFonctionELatex,
  formatFonctionFLatex,
  formatFonctionGLatex,
  texteAideADeriveeFinaleNiveau1,
  texteAideADeriveeFinaleNiveau2,
  texteAideADeriveeUNiveau1,
  texteAideADeriveeUNiveau2,
  texteAideBDeriveeArcNiveau1,
  texteAideBDeriveeArcNiveau2,
  texteAideBDeriveeFinaleNiveau1,
  texteAideBDeriveeFinaleNiveau2,
  texteAideBDeriveeUNiveau1,
  texteAideBDeriveeUNiveau2,
  texteAideCDenominateurNiveau1,
  texteAideCDenominateurNiveau2,
  texteAideCDeriveeFinaleNiveau1,
  texteAideCDeriveeFinaleNiveau2,
  texteAideCNumerateurNiveau1,
  texteAideCNumerateurNiveau2,
  texteAideDBrutNiveau1,
  texteAideDBrutNiveau2,
  texteAideDDenominateurNiveau1,
  texteAideDDenominateurNiveau2,
  texteAideDNumerateurNiveau1,
  texteAideDNumerateurNiveau2,
  texteAideDSimplifieeNiveau1,
  texteAideDSimplifieeNiveau2,
  texteAideEDeriveeFinaleNiveau1,
  texteAideEDeriveeFinaleNiveau2,
  texteAideEDeriveeInterneNiveau1,
  texteAideEDeriveeInterneNiveau2,
  texteAideFBruteNiveau1,
  texteAideFBruteNiveau2,
  texteAideFSimplifieeNiveau1,
  texteAideFSimplifieeNiveau2,
  texteAideGDeriveeFinaleNiveau1,
  texteAideGDeriveeFinaleNiveau2,
  texteAideGDeriveeInterneNiveau1,
  texteAideGDeriveeInterneNiveau2,
} from "./ui6e/formatDeriveesCyclometriques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

/** Convertit une aide `{texte, latex}` (dont le `latex` est en pratique toujours non-null pour les
 * fonctions utilisées ici) en 1 ligne du bloc "état actuel" — jamais la saisie brute de l'élève,
 * toujours la vérité terrain déjà confirmée à l'écran précédent (voir CLAUDE.md, "Bloc 'état
 * actuel'"). Réutilise TELLES QUELLES les fonctions d'aide niveau 2 déjà exactes (substituées, non
 * simplifiées) des écrans précédents plutôt que de dupliquer leur calcul. */
function ligneEtatActuel(label: string, aide: { latex: string | null }): { label: string; latex: string }[] {
  return aide.latex ? [{ label, latex: aide.latex }] : [];
}

function nouvelleSession(): EtatSessionDeriveesCyclometriques {
  return demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, genererExerciceDeriveesCyclometriques);
}

type AideParPhase = Partial<Record<PhaseDeriveesCyclometriques, AideInfoEcran>>;

interface Bilan {
  resultat: ResultatExerciceDeriveesCyclometriques;
  aideParPhase: AideParPhase;
}

export function App6gen4() {
  const [etat, setEtat] = useState<EtatSessionDeriveesCyclometriques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  /** `nouvelEtat.derniereCloture` porte l'aide/révélation de l'écran qui vient PRÉCISÉMENT de se
   * fermer, capturée côté moteur (jamais reconstruite depuis un `etat` React déjà obsolète — voir
   * `typesDeriveesCyclometriques.ts`). */
  function terminerEtape(nouvelEtat: EtatSessionDeriveesCyclometriques) {
    const cloture = nouvelEtat.derniereCloture;
    const miseAJour = cloture ? { ...aideParPhase, [cloture.phase]: cloture.info } : aideParPhase;
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
    setEtat(demarrerSessionDeriveesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const placeholderGenerique = "ex : -2/sqrt(1-4*x^2)...";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Dérivées de fonctions cyclométriques</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {etat.phase === "aDeriveeU" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive u(x) seul."
                  fonctionLatex={formatFonctionALatex(exercice)}
                  aideNiveau1={{ texte: texteAideADeriveeUNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideADeriveeUNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeU(etat, texte))}
                />
              )}
              {etat.phase === "aDeriveeFinale" && exercice.famille === "A" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x) — utilise le u(x) et le u'(x) corrects, simplifie si possible."
                  fonctionLatex={formatFonctionALatex(exercice)}
                  etatActuel={ligneEtatActuel("u(x) et u'(x), établis à l'étape précédente", texteAideADeriveeUNiveau2(exercice))}
                  aideNiveau1={texteAideADeriveeFinaleNiveau1(exercice)}
                  aideNiveau2={texteAideADeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseADeriveeFinale(etat, texte))}
                />
              )}

              {etat.phase === "bDeriveeU" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive u(x)."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  aideNiveau1={{ texte: texteAideBDeriveeUNiveau1(), latex: null }}
                  aideNiveau2={texteAideBDeriveeUNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeU(etat, texte))}
                />
              )}
              {etat.phase === "bDeriveeArc" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive arcfonction(v(x)) séparément."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  etatActuel={ligneEtatActuel("u'(x), établi à l'étape précédente", texteAideBDeriveeUNiveau2(exercice))}
                  aideNiveau1={{ texte: texteAideBDeriveeArcNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideBDeriveeArcNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeArc(etat, texte))}
                />
              )}
              {etat.phase === "bDeriveeFinale" && exercice.famille === "B" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x) via la règle du produit."
                  fonctionLatex={formatFonctionBLatex(exercice)}
                  etatActuel={[
                    ...ligneEtatActuel("u'(x), étape 1", texteAideBDeriveeUNiveau2(exercice)),
                    ...ligneEtatActuel("[arcfonction(v(x))]', étape précédente", texteAideBDeriveeArcNiveau2(exercice)),
                  ]}
                  aideNiveau1={{ texte: texteAideBDeriveeFinaleNiveau1(), latex: null }}
                  aideNiveau2={texteAideBDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseBDeriveeFinale(etat, texte))}
                />
              )}

              {etat.phase === "cNumerateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive le numérateur."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  aideNiveau1={{ texte: texteAideCNumerateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideCNumerateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCNumerateur(etat, texte))}
                />
              )}
              {etat.phase === "cDenominateur" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive le dénominateur."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  etatActuel={ligneEtatActuel("N'(x), établi à l'étape précédente", texteAideCNumerateurNiveau2(exercice))}
                  aideNiveau1={{ texte: texteAideCDenominateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideCDenominateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDenominateur(etat, texte))}
                />
              )}
              {etat.phase === "cDeriveeFinale" && exercice.famille === "C" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x) via la formule du quotient."
                  fonctionLatex={formatFonctionCLatex(exercice)}
                  etatActuel={[
                    ...ligneEtatActuel("N'(x), étape 1", texteAideCNumerateurNiveau2(exercice)),
                    ...ligneEtatActuel("D'(x), étape précédente", texteAideCDenominateurNiveau2(exercice)),
                  ]}
                  aideNiveau1={{ texte: texteAideCDeriveeFinaleNiveau1(), latex: null }}
                  aideNiveau2={texteAideCDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCDeriveeFinale(etat, texte))}
                />
              )}

              {etat.phase === "dNumerateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive le numérateur."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  aideNiveau1={{ texte: texteAideDNumerateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideDNumerateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDNumerateur(etat, texte))}
                />
              )}
              {etat.phase === "dDenominateur" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive le dénominateur."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  etatActuel={ligneEtatActuel("N'(x), établi à l'étape précédente", texteAideDNumerateurNiveau2(exercice))}
                  aideNiveau1={{ texte: texteAideDDenominateurNiveau1(), latex: null }}
                  aideNiveau2={texteAideDDenominateurNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDDenominateur(etat, texte))}
                />
              )}
              {etat.phase === "dBrut" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x) via la formule du quotient — résultat BRUT, ne simplifie pas encore."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  etatActuel={[
                    ...ligneEtatActuel("N'(x), étape 1", texteAideDNumerateurNiveau2(exercice)),
                    ...ligneEtatActuel("D'(x), étape précédente", texteAideDDenominateurNiveau2(exercice)),
                  ]}
                  aideNiveau1={{ texte: texteAideDBrutNiveau1(), latex: null }}
                  aideNiveau2={texteAideDBrutNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDBrut(etat, texte))}
                />
              )}
              {etat.phase === "dSimplifiee" && exercice.famille === "D" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Simplifie le résultat précédent grâce à l'identité arcsin(u)+arccos(u)=π/2."
                  fonctionLatex={formatFonctionDLatex(exercice)}
                  etatActuel={[
                    ...ligneEtatActuel("N'(x), étape 1", texteAideDNumerateurNiveau2(exercice)),
                    ...ligneEtatActuel("D'(x), étape 2", texteAideDDenominateurNiveau2(exercice)),
                    ...ligneEtatActuel("f'(x) BRUT, établi à l'étape précédente", texteAideDBrutNiveau2(exercice)),
                  ]}
                  aideNiveau1={texteAideDSimplifieeNiveau1()}
                  aideNiveau2={texteAideDSimplifieeNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseDSimplifiee(etat, texte))}
                />
              )}

              {etat.phase === "eDeriveeInterne" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive l'arcfonction interne complète."
                  fonctionLatex={formatFonctionELatex(exercice)}
                  aideNiveau1={{ texte: texteAideEDeriveeInterneNiveau1(), latex: null }}
                  aideNiveau2={texteAideEDeriveeInterneNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeInterne(etat, texte))}
                />
              )}
              {etat.phase === "eDeriveeFinale" && exercice.famille === "E" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x) via la chaîne extérieure."
                  fonctionLatex={formatFonctionELatex(exercice)}
                  etatActuel={ligneEtatActuel("w'(x), établi à l'étape précédente", texteAideEDeriveeInterneNiveau2(exercice))}
                  aideNiveau1={{ texte: texteAideEDeriveeFinaleNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideEDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseEDeriveeFinale(etat, texte))}
                />
              )}

              {etat.phase === "fBrute" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Dérive f(x) via la chaîne standard — résultat brut accepté."
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  aideNiveau1={{ texte: texteAideFBruteNiveau1(), latex: null }}
                  aideNiveau2={texteAideFBruteNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFBrute(etat, texte))}
                />
              )}
              {etat.phase === "fSimplifiee" && exercice.famille === "F" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Donne la forme finale simplifiée via l'identité trigonométrique adéquate."
                  fonctionLatex={formatFonctionFLatex(exercice)}
                  etatActuel={ligneEtatActuel("f'(x) BRUT, établi à l'étape précédente", texteAideFBruteNiveau2(exercice))}
                  aideNiveau1={texteAideFSimplifieeNiveau1()}
                  aideNiveau2={{ texte: texteAideFSimplifieeNiveau2(exercice), latex: null }}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseFSimplifiee(etat, texte))}
                />
              )}

              {etat.phase === "gDeriveeInterne" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran={exercice.sousCas === "h" ? "Dérive v(x)." : "Dérive la fraction interne u(x)."}
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  aideNiveau1={{ texte: texteAideGDeriveeInterneNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideGDeriveeInterneNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeInterne(etat, texte))}
                />
              )}
              {etat.phase === "gDeriveeFinale" && exercice.famille === "G" && (
                <EtapeChampDeriveeCyclo
                  key={etat.phase}
                  consigneEcran="Assemble f'(x)."
                  fonctionLatex={formatFonctionGLatex(exercice)}
                  etatActuel={ligneEtatActuel(
                    exercice.sousCas === "h" ? "v'(x), établi à l'étape précédente" : "u'(x), établi à l'étape précédente",
                    texteAideGDeriveeInterneNiveau2(exercice),
                  )}
                  aideNiveau1={{ texte: texteAideGDeriveeFinaleNiveau1(exercice), latex: null }}
                  aideNiveau2={texteAideGDeriveeFinaleNiveau2(exercice)}
                  placeholder={placeholderGenerique}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGDeriveeFinale(etat, texte))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelDeriveesCyclometriques
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionDeriveesCyclometriques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
