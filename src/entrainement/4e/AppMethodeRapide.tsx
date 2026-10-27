import { useState } from "react";
import type { ReactNode } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideChamp1,
  activerAideDevelopper,
  activerAideIsolement,
  activerAideSimplification,
  activerAideZeros,
  demarrerSession,
  diagnostiquerChampPrincipal,
  diagnostiquerIsolement,
  diagnostiquerSimplification,
  soumettreChoixCategorie,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseDevelopper,
  soumettreReponseIsolement,
  soumettreReponseSimplification,
} from "./moteur";
import type { EtatSession, ReponseZeros } from "./moteur";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSecondDegre, type VarianteSecondDegreId } from "./generateurs/secondDegre";
import { EtapeSimplificationCoefficients } from "./components/EtapeSimplificationCoefficients";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeZeros } from "./components/EtapeZeros";
import { Katex } from "./components/Katex";
import { calculerRecapitulatif } from "./ui/recapitulatif";
import { libelleCategorie } from "./ui/categorieLabels";
import { formatEnonceAffichage, formatEnonceLatex, formatEquationIsoleeNonDeveloppee, formatTermesZerosAttendusLatex } from "./ui/formatEquation";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSession {
  return demarrerSession(REGLAGES_DEMO, genererExerciceSecondDegre);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (type `Phase` dans `moteur/types.ts`, et les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: EtatSession["phase"][] = ["simplification", "isolement", "developper", "reconnaissance", "champ1", "champ2"];

/** Même principe que `calculerRecapitulatif` (`ui/recapitulatif.ts`) et que `terminerEtape`
 * ci-dessous pour lire `scoreXxxExercice`/`xxxRevele` — jamais une valeur recalculée séparément.
 * `champ2` (dernière phase) n'a pas de champ `scoreXxxExercice` propre : elle clôt toujours
 * immédiatement l'exercice (voir commentaire sur `calculerRecapitulatif`), donc tant qu'elle n'est
 * pas la phase courante elle est forcément "a-venir". */
function calculerSegmentsProgression(etat: EtatSession): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "simplification"
        ? etat.scoreSimplificationExercice
        : phase === "isolement"
          ? etat.scoreIsolementExercice
          : phase === "developper"
            ? etat.scoreDevelopperExercice
            : phase === "reconnaissance"
              ? etat.scoreReconnaissanceExercice
              : phase === "champ1"
                ? etat.scoreChampPrincipalExercice
                : null;
    if (score === null) return "a-venir";
    const revele =
      phase === "simplification"
        ? etat.simplificationRevele
        : phase === "isolement"
          ? etat.isolementRevele
          : phase === "developper"
            ? etat.developperRevele
            : phase === "reconnaissance"
              ? etat.categorieRevelee
              : etat.champPrincipalRevele;
    if (revele) return "revele";
    // "reconnaissance" n'a aucun mécanisme d'aide (toujours "correcte", jamais "aide").
    const aideUtilisee =
      phase === "simplification"
        ? etat.aideSimplificationUtilisee
        : phase === "isolement"
          ? etat.aideIsolementUtilisee
          : phase === "developper"
            ? etat.aideDevelopperUtilisee
            : phase === "champ1"
              ? etat.aideChamp1Utilisee
              : false;
    return aideUtilisee ? "aide" : "correcte";
  });
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice, affichée identique sur tous les
 * écrans de travail, redondante avec les consignes spécifiques à chaque étape mais utile pour ne
 * jamais perdre de vue l'objectif final (prompt du 27/09).
 */
const CONSIGNE_GENERALE = "Résous l'équation suivante en utilisant la méthode la plus rapide.";

/**
 * true ssi la forme de surface isolée garde un produit x(x+b) non développé
 * (formeAffichage "produit_egale_constante") pour une catégorie qui a besoin de a,b,c explicites
 * (cas_general : Δ ; produit_remarquable : carré parfait c=(b/2)²) — dans ce seul cas, l'isolement
 * lui-même ne fait que regrouper ("Regroupe tous les termes du même côté."), et une étape
 * "developper" séparée suit (gen1 "regroupe avant de développer"). Pour isolee_constante/isolee_carre
 * (rien à développer), l'isolement demande directement cette forme générale, en un seul écran.
 */
function demandeFormeGeneraleDirecte(exercice: Exercice): boolean {
  const c = exercice.categorie;
  if (c !== "cas_general" && c !== "produit_remarquable") return false;
  return exercice.formeAffichage !== "produit_egale_constante";
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSession;
  revele: boolean;
}

export function AppMethodeRapide() {
  const [etat, setEtat] = useState<EtatSession>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSession`, jamais dans le moteur (voir AppAnalyseFonction.tsx). Remis à
   * vide à chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Même mécanisme que AppAnalyseFonction.tsx::ajouterHistorique — réutilise `calculerRecapitulatif`
   * pour la réponse ATTENDUE, la dernière entrée du tableau correspondant toujours à l'étape qui
   * vient de se clore. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSession) {
    const recap = calculerRecapitulatif(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le commentaire détaillé
   * de AppAnalyseFonction.tsx::terminerEtape, même garde reproduit ici à l'identique). */
  function terminerEtape(nouvelEtat: EtatSession, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "simplification"
          ? nouvelEtat.simplificationRevele
          : etat.phase === "isolement"
            ? nouvelEtat.isolementRevele
            : etat.phase === "developper"
              ? nouvelEtat.developperRevele
              : etat.phase === "reconnaissance"
                ? nouvelEtat.categorieRevelee
                : etat.phase === "champ1"
                  ? nouvelEtat.champPrincipalRevele
                  : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.zerosRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const recapitulatif = calculerRecapitulatif(etat);
  // Bloc "énoncé" fixe : toujours l'exercice tel que généré, jamais la forme réduite par la
  // simplification (etat.exerciceCourant) — voir EtatSession.exerciceOriginal.
  const enonceFixe = formatEnonceAffichage(
    etat.exerciceOriginal.enonce,
    etat.exerciceOriginal.formeAffichage,
    etat.exerciceOriginal.parametresAffichage,
    etat.exerciceOriginal.irrationnel,
  );

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setEtat(demarrerSession(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSecondDegreId)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** Couvre les 6 phases — reprend exactement la logique/formatage déjà calculée pour le
   * récapitulatif live par `ui/recapitulatif.ts::calculerRecapitulatif` ("Équation simplifiée"/
   * "Équation isolée"/"Équation développée"/"Méthode"). Les 4 premières phases renvoyaient `null`
   * ici auparavant (bug trouvé par le même audit que gen6/`AppInequationRationnelle.tsx` : le
   * reveal immédiat affichait "✗ Incorrect" sans jamais montrer la réponse attendue, sur TOUS les
   * exercices puisque ces 4 phases ne dépendent d'aucune niveau/variante). */
  const reponseAttendue =
    phase === "simplification" ? (
      <>
        Équation simplifiée attendue :{" "}
        <Katex expression={formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel)} />
      </>
    ) : phase === "isolement" ? (
      <>
        Équation isolée attendue : <Katex expression={formatEquationIsoleeNonDeveloppee(exercice)} />
      </>
    ) : phase === "developper" ? (
      <>
        Équation développée attendue : <Katex expression={formatEnonceLatex(exercice.enonce)} />
      </>
    ) : phase === "reconnaissance" ? (
      <>Méthode attendue : {libelleCategorie(exercice.categorie)}</>
    ) : phase === "champ1" ? (
      <Katex expression={exercice.categorie === "cas_general" ? `\\Delta = ${exercice.solution.delta}` : `${exercice.solution.formeFactorisee} = 0`} />
    ) : phase === "champ2" ? (
      <span className="equation-box-termes">
        {formatTermesZerosAttendusLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </span>
    ) : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Second degré — choisir la méthode la plus rapide</h1>
        <p className="app-subtitle">Équations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={enonceFixe} block />
              </div>
            }
          />
          {phase === "simplification" ? (
            <EtapeSimplificationCoefficients
              key={phase}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              diagnostiquer={(v) => diagnostiquerSimplification(exercice, v)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplification(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplification(etat, reponse), reponse)}
              validation={validation}
            />
          ) : phase === "isolement" ? (
            <EtapeIsolement
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              question={demandeFormeGeneraleDirecte(exercice) ? undefined : "Regroupe tous les termes du même côté."}
              label={demandeFormeGeneraleDirecte(exercice) ? undefined : null}
              diagnostiquer={(v) => diagnostiquerIsolement(exercice, v)}
              aideActivee={etat.aideIsolementUtilisee}
              onActiverAide={() => setEtat(activerAideIsolement(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIsolement(etat, reponse), reponse)}
              validation={validation}
            />
          ) : phase === "developper" ? (
            <EtapeIsolement
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerIsolement(exercice, v)}
              aideActivee={etat.aideDevelopperUtilisee}
              onActiverAide={() => setEtat(activerAideDevelopper(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDevelopper(etat, reponse), reponse)}
              validation={validation}
            />
          ) : phase === "reconnaissance" ? (
            <EtapeReconnaissance
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onChoisir={(choix: Categorie) => terminerEtape(soumettreChoixCategorie(etat, choix), libelleCategorie(choix))}
              validation={validation}
            />
          ) : phase === "champ1" ? (
            <EtapeChamp1
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              diagnostiquer={(v) => diagnostiquerChampPrincipal(exercice, v)}
              aideActivee={etat.aideChamp1Utilisee}
              onActiverAide={() => setEtat(activerAideChamp1(etat))}
              onValider={(reponse) =>
                terminerEtape(soumettreReponseChamp1(etat, reponse), exercice.categorie === "cas_general" ? `Δ = ${reponse}` : `${reponse} = 0`)
              }
              validation={validation}
            />
          ) : (
            <EtapeZeros
              key={phase}
              exercice={exercice}
              enonceFixe={enonceFixe}
              masquerBlocDonnees
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideZerosUtilisee}
              onActiverAide={() => setEtat(activerAideZeros(etat))}
              onValider={(reponse: ReponseZeros) => terminerEtape(soumettreReponseChamp2(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
