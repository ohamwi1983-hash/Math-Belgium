import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import type { ExerciceLectureCercle } from "./core/lectureCercle.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureCercle } from "./generateurs/lectureCercle";
import { correctionDetailleeLectureCercle } from "./generateurs/lectureCercle/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { NOMBRE_ECRANS, TENTATIVES_CHAMPS, activerAide, demarrer, ecranSuivant, soumettre, type EtatLectureCercle } from "./moteur/sessionLectureCercle";
import { ETATS_SANS_TENTATIVE, diagnostiquerAngle, diagnostiquerCoordonnees, diagnostiquerTangente, SAISIE_NON_DEFINIE, type EtatLecture } from "./moteur/verificationLectureCercle";
import {
  CONSIGNE_GENERALE,
  MESSAGE_APPROCHEE,
  MESSAGE_APPROCHEE_ANGLE,
  MESSAGE_ILLISIBLE_ANGLE,
  MESSAGE_RADIANS_ANGLE,
  MESSAGE_ILLISIBLE_VALEUR,
  MESSAGE_RECOPIE,
  TITRES_ECRANS,
  aideSaisie,
  aidesEcran,
  consignesEcrans,
  enonceFragments,
  figureSvg,
  messageAngle,
  messageCoordonnees,
  messageTangente,
  rappelCoordonnees,
  reponsesEcrans,
} from "./ui/formatLectureCercle";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { Katex } from "./components/Katex";
import { EtapeLectureCercle, type ChampLecture, type SoumissionLecture } from "./components/EtapeLectureCercle";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen122 — « Lire sur le cercle trigonométrique » (4e, chapitre 5, section `remarquables`,
 * processus 1 CONNAÎTRE). Le point M(θ) est placé sur le cercle, dans un quadrillage dont les lignes
 * passent par les valeurs remarquables (figure de l'écran = figure du papier, `ui/formatLectureCercle.ts`).
 * Trois écrans de champs (3 tentatives chacun ; une saisie illisible, approchée ou recopiée ne compte
 * jamais) :
 * 1. cos θ et sin θ lus ;
 * 2. θ dans [0° ; 360°[ (ou [0 ; 2π[) — deux candidats de même cosinus, tranchés par le quadrant ;
 * 3. tan θ lue sur la tangente x = 1, ou le verdict « tan θ n'est pas définie » (bouton).
 * Aides à deux niveaux (l'aide 2 de l'écran 3 trace la droite (OM)), messages ciblés, corrigé
 * détaillé de l'étape quand la réponse est révélée. Aucun point affiché. `?code=` : première instance
 * tirée avec les MÊMES fonctions que l'adaptateur papier.
 */

function exerciceInitial(): ExerciceLectureCercle {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceLectureCercle();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLectureCercle, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  derniere: boolean;
}

const CHAMPS: ChampLecture[][] = [
  [
    { id: "lecture-cercle-cos", prefixe: "\\cos\\theta=", nom: "cosinus de thêta" },
    { id: "lecture-cercle-sin", prefixe: "\\sin\\theta=", nom: "sinus de thêta" },
  ],
  [{ id: "lecture-cercle-angle", prefixe: "\\theta=", nom: "angle thêta" }],
  [{ id: "lecture-cercle-tan", prefixe: "\\tan\\theta=", nom: "tangente de thêta" }],
];

function messageSansTentative(etat: EtatLecture, ecran: number): string | null {
  if (etat === "radians") return MESSAGE_RADIANS_ANGLE;
  if (etat === "parse_error") return ecran === 1 ? MESSAGE_ILLISIBLE_ANGLE : MESSAGE_ILLISIBLE_VALEUR;
  if (etat === "approchee") return ecran === 1 ? MESSAGE_APPROCHEE_ANGLE : MESSAGE_APPROCHEE;
  if (etat === "recopie") return MESSAGE_RECOPIE;
  return null;
}

function saisieLisible(s: string): string {
  return s.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
}

export function AppLectureCercle() {
  const [etat, setEtat] = useState<EtatLectureCercle>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);
  const [champsErrones, setChampsErrones] = useState<boolean[] | null>(null);
  const [messageFaux, setMessageFaux] = useState<FragmentConsigne[] | null>(null);
  const [sansTentative, setSansTentative] = useState<string | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const aides = aidesEcran(e, ecran);

  function reinitialiserRetour() {
    setChampsErrones(null);
    setMessageFaux(null);
    setSansTentative(null);
  }

  function recommencer(exercice: ExerciceLectureCercle) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    reinitialiserRetour();
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setSansTentative(null);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = (
      <p style={{ margin: 0 }}>
        <RenduFragments fragments={reponsesEcrans(e)[ecran]!} />
      </p>
    );
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, derniere: ecran >= NOMBRE_ECRANS - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceLectureCercle());
      return;
    }
    setEtat(ecranSuivant(etat));
    reinitialiserRetour();
    setEnAttente(null);
  }

  function valider(s: SoumissionLecture) {
    if (ecran === 0) {
      if (s.type !== "champs") return;
      const d = diagnostiquerCoordonnees(e, s.saisies[0]!, s.saisies[1]!);
      if (ETATS_SANS_TENTATIVE.includes(d.etat)) {
        setSansTentative(messageSansTentative(d.etat, ecran));
        return;
      }
      const correct = d.etat === "correct";
      setChampsErrones(correct ? null : d.champs.map((ok) => !ok));
      setMessageFaux(correct ? null : messageCoordonnees(e, d.piege, d.champPiege));
      conclure(
        correct,
        <span>
          <Katex expression="\cos\theta=" /> {saisieLisible(s.saisies[0]!)} ; <Katex expression="\sin\theta=" /> {saisieLisible(s.saisies[1]!)}
        </span>,
      );
      return;
    }
    if (ecran === 1) {
      if (s.type !== "champs") return;
      const d = diagnostiquerAngle(e, s.saisies[0]!);
      if (ETATS_SANS_TENTATIVE.includes(d.etat)) {
        setSansTentative(messageSansTentative(d.etat, ecran));
        return;
      }
      const correct = d.etat === "correct";
      setChampsErrones(correct ? null : [true]);
      setMessageFaux(correct ? null : messageAngle(e, d.piege));
      conclure(
        correct,
        <span>
          <Katex expression="\theta=" /> {saisieLisible(s.saisies[0]!)}
          {!/°/.test(s.saisies[0]!) ? "°" : ""}
        </span>,
      );
      return;
    }
    const texte = s.type === "verdict" ? SAISIE_NON_DEFINIE : s.saisies[0]!;
    const d = diagnostiquerTangente(e, texte);
    if (ETATS_SANS_TENTATIVE.includes(d.etat)) {
      setSansTentative(messageSansTentative(d.etat, ecran));
      return;
    }
    const correct = d.etat === "correct";
    setChampsErrones(correct || s.type === "verdict" ? null : [true]);
    setMessageFaux(correct ? null : messageTangente(e, d.piege));
    conclure(
      correct,
      s.type === "verdict" ? (
        <span>
          <Katex expression="\tan\theta" /> n'est pas définie
        </span>
      ) : (
        <span>
          <Katex expression="\tan\theta=" /> {saisieLisible(texte)}
        </span>
      ),
    );
  }

  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debuggen122?: unknown }).__debuggen122 = { exercice: e, ecran };
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeLectureCercle(e), lettreEtape(ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const tangente = ecran === 2;
  const figure = figureSvg(e, { tangente, droiteOM: tangente && (etat.niveauAide >= 2 || !!enAttente) });
  const figureAdaptee = figure.replace(/<svg ([^>]*?)width="(\d+)" height="(\d+)"/, '<svg $1style="width:100%;height:auto;display:block"');

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lire sur le cercle trigonométrique</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique &amp; triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <>
                <p style={{ margin: "6px 0" }}>
                  <RenduFragments fragments={enonceFragments(e)} />
                </p>
                <div className="figure-lecture-cercle" style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                  <div style={{ width: "100%", maxWidth: tangente ? 340 : 300 }} dangerouslySetInnerHTML={{ __html: figureAdaptee }} />
                </div>
                {ecran > 0 && (
                  <p style={{ margin: "6px 0" }}>
                    <RenduFragments fragments={rappelCoordonnees(e)} />
                  </p>
                )}
              </>
            }
          />
          <Fragment key={`${generation}-${ecran}`}>
            <EtapeLectureCercle
              consigne={<RenduFragments fragments={consignesEcrans(e)[ecran]!} />}
              champs={CHAMPS[ecran]!.map((c) => (ecran === 1 ? { ...c, suffixe: "^\\circ" } : c))}
              aideSaisie={aideSaisie(ecran, e)}
              aides={aides}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAide(etat, aides.length))}
              tentativesUtilisees={etat.tentativesUtilisees}
              tentativesMax={TENTATIVES_CHAMPS}
              champsErrones={champsErrones}
              messageFaux={messageFaux}
              messageSansTentative={sansTentative}
              boutonVerdict={
                ecran === 2 ? (
                  <>
                    <Katex expression="\tan\theta" /> n'est pas définie
                  </>
                ) : undefined
              }
              onValider={valider}
              validation={validation}
            />
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
