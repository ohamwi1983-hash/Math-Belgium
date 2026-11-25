import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeDeuxDroitesPlan } from "./generateurs/deuxDroitesPlan/corrigeDetaille";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDeuxDroitesPlan, ExercicePlanDetermine } from "./core/deuxDroitesPlan.types";
import type { Point3D } from "./core/geometrieEspace.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDeuxDroitesPlan } from "./generateurs/deuxDroitesPlan";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDeuxDroitesPlan } from "./moteur/sessionDeuxDroitesPlan";
import { consigneGenerale, ecrans, nombreEcrans, positionPoint, verifierNomPlan, type EcranDeuxDroitesPlan } from "./ui/formatDeuxDroitesPlan";
import { segmentCouvrant } from "./ui/figureDeuxDroitesPlan";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChoixTransformation } from "./components/EtapesTransformationDonnees";
import { EtapeNomPlan } from "./components/EtapeNomPlan";
import { Solide3DSketch, type PointExtraSolide3D } from "./components/Solide3DSketch";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen100 — « Positions de deux droites et plan déterminé » (4e, chapitre 8 « Géométrie dans
 * l'espace », section « deux-droites », processus 2 APPLIQUER). Sur un solide en perspective
 * cavalière (sans coordonnées) :
 * - famille « positions » (3 écrans, choix fermés, UNE tentative chacun) : a) plan commun aux deux
 *   droites (ou aucun) ; b) sécantes / parallèles / gauches ; c) justification — point commun,
 *   droite parallèle aux deux, ou point de percée d'un plan qui contient l'autre droite ;
 * - famille « plan » (2 écrans) : a) les données déterminent-elles un plan, et un seul (UNE
 *   tentative) ? b) si oui, nommer ce plan (saisie libre, 3 tentatives, tout triplet valable
 *   accepté) ; sinon, la raison (choix fermé, UNE tentative).
 * Aucun point affiché ; après un échec, la bonne réponse est montrée. `?code=` (QR code d'une
 * feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDeuxDroitesPlan {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDeuxDroitesPlan();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDeuxDroitesPlan, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

/** Figure de l'écran : le solide, les points définis (I, J, K) et les données — jamais de plan
 * coloré ni de point commun (ce serait la réponse). */
function Figure({ e }: { e: ExerciceDeuxDroitesPlan }) {
  const pos = (n: string): Point3D => positionPoint(e, n)!;
  let droite: [Point3D, Point3D] | undefined;
  let seconde: [Point3D, Point3D][] | undefined;
  const marques: PointExtraSolide3D[] = [];
  /** Couleur des points DONNÉS (famille « plan ») : un point défini (I, J, K) prend lui-même cette
   * couleur ; un sommet reçoit une pastille colorée sous son point noir. */
  const couleurDonnee = new Map<string, string>();
  if (e.variante === "positions") {
    droite = [pos(e.d1[0]), pos(e.d1[1])];
    seconde = [[pos(e.d2[0]), pos(e.d2[1])]];
  } else {
    const p = e.points;
    if (e.type === "troisPoints") p.forEach((n) => couleurDonnee.set(n, "var(--solide3d-droite)"));
    if (e.type === "droitePoint") {
      droite = segmentCouvrant(pos(p[0]!), pos(p[1]!), pos(p[2]!));
      couleurDonnee.set(p[2]!, "var(--solide3d-droite-2)");
    }
    if (e.type === "deuxDroites") {
      droite = [pos(p[0]!), pos(p[1]!)];
      seconde = [[pos(p[2]!), pos(p[3]!)]];
    }
  }
  for (const [nom, couleur] of couleurDonnee) if (e.solide.sommets[nom]) marques.push({ position: pos(nom), label: "", couleur });
  const nommes: PointExtraSolide3D[] = e.pointsNommes.map((p) => ({ position: p.position, label: p.nom, couleur: couleurDonnee.get(p.nom) ?? "var(--solide3d-trait)", labelExterieur: true }));
  return <Solide3DSketch solide={e.solide} droitePoints={droite} droitesSupplementaires={seconde} pointsExtra={[...marques, ...nommes]} />;
}

export function AppPositionsDeuxDroites() {
  const [etat, setEtat] = useState<EtatDeuxDroitesPlan>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les choix et le champ repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [retour, setRetour] = useState<{ compte: boolean; message: string } | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const def: EcranDeuxDroitesPlan = ecrans(e)[ecran]!;
  const total = nombreEcrans(e);

  function recommencer(exercice: ExerciceDeuxDroitesPlan) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setRetour(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = <RenduFragments fragments={def.reponse} />;
    setHistorique((h) => [...h, ecranClos(def.titre, votreReponse, resultat.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: def.type === "choix" ? "Ce n'était pas le bon choix." : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDeuxDroitesPlan());
      return;
    }
    setEtat(ecranSuivant(etat));
    setRetour(null);
    setEnAttente(null);
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDeuxDroitesPlan(e), lettreEtape(ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: def.aides, consigne: def.consigne };

  function ecranCourant(): ReactNode {
    if (def.type === "choix") {
      return (
        <EtapeChoixTransformation
          {...communs}
          options={def.options}
          bonne={def.bonne}
          onValider={(i) => conclure(i === def.bonne, <RenduFragments fragments={def.options[i]!} />)}
        />
      );
    }
    return (
      <EtapeNomPlan
        {...communs}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(e, ecran)}
        retour={retour}
        onValider={(saisie) => {
          const verdict = verifierNomPlan(e as ExercicePlanDetermine, saisie);
          if (verdict.etat === "parse_error") {
            setRetour({ compte: false, message: verdict.message });
            return;
          }
          setRetour(verdict.etat === "faux" ? { compte: true, message: verdict.message } : null);
          conclure(verdict.etat === "correct", <span>{saisie.trim().toUpperCase()}</span>);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Positions de deux droites et plan déterminé</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={<Figure e={e} />} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
