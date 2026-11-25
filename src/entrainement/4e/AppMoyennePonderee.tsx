import { useState, type ReactNode } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeMoyennePonderee } from "./generateurs/moyennePonderee/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionMoyennePonderee,
  soumettreReponseCentres,
  soumettreReponseQuotient,
  soumettreReponseSommes,
} from "./moteur/sessionMoyennePonderee";
import type { EtatSessionMoyennePonderee, PhaseMoyennePonderee } from "./moteur/typesMoyennePonderee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoyennePonderee } from "./generateurs/moyennePonderee";
import type { ExerciceMoyennePonderee, VarianteMoyennePonderee } from "./core/moyennePonderee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyennePonderee } from "./components/EtapeCentresMoyennePonderee";
import { EtapeSommesMoyennePonderee } from "./components/EtapeSommesMoyennePonderee";
import { EtapeQuotientMoyennePonderee } from "./components/EtapeQuotientMoyennePonderee";
import { SegmentsInline } from "./components/SegmentsInline";
import { LABEL_SOMME_N, LABEL_SOMME_XN, formatCentresAttendusTexte, formatClasseTexte, formatEnonceTexte, formatSommesAttenduesTexte } from "./ui/formatMoyennePonderee";
import { Katex } from "./components/Katex";
import type { ReponseSommes } from "./moteur/verificationMoyennePonderee";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { calculerRecapitulatifMoyennePonderee } from "./ui/recapitulatifMoyennePonderee";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, saisieTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { nombreFrTypo } from "./ui/nombreFr";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMoyennePonderee {
  return demarrerSessionMoyennePonderee(REGLAGES_DEMO, genererExerciceMoyennePonderee);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son PREMIER exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur
 * d'export (même catalogue de variantes) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionMoyennePonderee {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionMoyennePonderee(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceMoyennePonderee, (id) => construireAvecVarianteId(id as VarianteMoyennePonderee)));
}

/** Séquence FIXE mais choisie dès le départ selon la variante (même logique que `phaseInitiale`,
 * `moteur/sessionMoyennePonderee.ts`) : "classes" → centres → sommes → quotient (terminal) ; sinon
 * → sommes → quotient (terminal) directement. Pas de fichier recap exposant déjà une telle
 * séquence pour ce générateur, donc définie ici, depuis la même logique que le moteur. */
function sequencePourExercice(exercice: ExerciceMoyennePonderee): PhaseMoyennePonderee[] {
  return exercice.variante === "classes" ? ["centres", "sommes", "quotient"] : ["sommes", "quotient"];
}

/** Puces construites depuis l'historique des écrans clos (`segmentsDepuisHistorique`), cliquables
 * (fiche en lecture seule de chaque écran, dernier compris). */
const TITRES_PHASES: Record<PhaseMoyennePonderee, string> = { centres: "Centres des classes", sommes: "Sommes", quotient: "Moyenne pondérée" };

/** Saisie de l'écran « sommes » : un produit par ligne, puis les deux sommes. */
function sommesSaisiesAffichees(reponse: ReponseSommes): ReactNode {
  return (
    <>
      <span style={{ display: "block" }}>Produits : {reponse.produits.map((p) => saisieTexte(p)).join(" ; ")}</span>
      <span style={{ display: "block" }}>
        <Katex expression={LABEL_SOMME_XN} /> = {saisieTexte(reponse.sommeXN)} ; <Katex expression={LABEL_SOMME_N} /> = {saisieTexte(reponse.sommeN)}
      </span>
    </>
  );
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionMoyennePonderee;
  revele: boolean;
}

export function AppMoyennePonderee() {
  const [etat, setEtat] = useState<EtatSessionMoyennePonderee>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (dont « Générer ») : entre dans la `key` des écrans pour
   * remonter leur état local — sans lui, un exercice à moins de classes gardait les champs de
   * l'exercice précédent et « Valider » restait désactivé. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionMoyennePonderee, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "centres"
          ? nouvelEtat.centresRevele
          : etat.phase === "sommes"
            ? nouvelEtat.sommesRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.quotientRevele;
      const niveauAide = etat.phase === "centres" ? etat.niveauAideCentres : etat.phase === "sommes" ? etat.niveauAideSommes : etat.niveauAideQuotient;
      setHistorique((h) => [...h, ecranClos(TITRES_PHASES[etat.phase], votreReponse, revele, niveauAide > 0, reponseAttendue, corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setNumeroExercice((n) => n + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifMoyennePonderee(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    viderHistorique();
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionMoyennePonderee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMoyennePonderee)));
  }

  const reponseAttendue =
    phase === "centres" && exercice.variante === "classes" ? (
      <>Centres attendus : {formatCentresAttendusTexte(exercice)}</>
    ) : phase === "sommes" ? (
      <>
        Sommes attendues : <SegmentsInline segments={formatSommesAttenduesTexte(exercice)} />
      </>
    ) : (
      <>Moyenne pondérée attendue : {nombreFrTypo(exercice.moyenne)}</>
    );

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeMoyennePonderee(exercice), lettreEtape(sequencePourExercice(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Moyenne pondérée</h1>
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, sequencePourExercice(exercice).length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "quotient" && !enAttente && <CalculatriceScientifique />}
          {phase === "centres" && exercice.variante === "classes" ? (
            <EtapeCentresMoyennePonderee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCentres}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCentres(etat, reponse), exercice.variante === "classes" ? exercice.classes.map((_, i) => `${formatClasseTexte(exercice, i)} → ${saisieTexte(reponse[i] ?? "")}`).join(", ") : reponse.map(saisieTexte).join(" ; "))}
              validation={validation}
            />
          ) : phase === "sommes" ? (
            <EtapeSommesMoyennePonderee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommes}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommes(etat, reponse), sommesSaisiesAffichees(reponse))}
              validation={validation}
            />
          ) : phase === "quotient" ? (
            <EtapeQuotientMoyennePonderee
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQuotient}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQuotient(etat, reponse), saisieTexte(reponse))}
              validation={validation}
            />
          ) : null}{" "}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
