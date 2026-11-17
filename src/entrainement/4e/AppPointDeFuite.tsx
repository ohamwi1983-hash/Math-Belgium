import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExercicePointFuite, Pt } from "./core/pointFuite.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePointFuite } from "./generateurs/pointFuite";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  AIDES_AFFIRMATIONS,
  CONSIGNE_AFFIRMATIONS,
  TENTATIVES_PLACEMENT,
  explicationsAffirmations,
  indexAffirmationVraie,
  messageDiagnostic,
  reponseAffirmations,
  reponseConstruction,
  texteAffirmation,
  titresEcrans,
  verifierPlacement,
} from "./ui/formatPointFuite";
import { sceneComplete, type LigneFigureFuite, type MarqueFigureFuite } from "./ui/figurePointFuite";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { BoutonAide } from "./components/BoutonAide";
import { espacesInsecables } from "./components/RenduFragments";
import { ConstructionPointFuite, type TraceFuite } from "./components/ConstructionPointFuite";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ValidationEcran, type ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen105 — « Perspective centrale : point de fuite » (4e, chapitre 8 « Géométrie dans l'espace »,
 * section `point-de-fuite`, s'appuie sur `fenetre-durer`, processus 2 APPLIQUER). Vraie construction
 * sur la vitre quadrillée :
 * 1. et 2. placer un point (point de fuite, sommet, coin, pied de poteau…) après avoir tracé les
 *    droites qui le portent (outils « Droite », « Horizontale », « Verticale ») — 3 tentatives, une
 *    figure sans point placé ne compte pas ; après un échec, la construction attendue est dessinée ;
 * 3. choisir l'affirmation vraie parmi trois (choix fermé, UNE tentative) : fuyantes qui convergent,
 *    droites parallèles à la vitre qui restent parallèles, longueurs non conservées.
 * Aucun point ni pénalité affichés. `?code=` (QR code d'une feuille) : première instance tirée avec
 * les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExercicePointFuite {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExercicePointFuite();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePointFuite, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  derniere: boolean;
  /** Point placé par l'élève, montré en rouge si la réponse a été révélée. */
  pointEleve: Pt | null;
}

const TOTAL_ECRANS = 3;

function BlocAides({ aides, niveau, onActiver }: { aides: string[]; niveau: number; onActiver: () => void }) {
  return (
    <div>
      {aides.slice(0, niveau).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>{espacesInsecables(aide)}</p>
        </div>
      ))}
      <BoutonAide niveauAide={niveau} niveauAideMax={aides.length} onActiverAide={onActiver} />
    </div>
  );
}

export function AppPointDeFuite() {
  const [exercice, setExercice] = useState<ExercicePointFuite>(exerciceInitial);
  const [ecran, setEcran] = useState(0);
  const [niveauAide, setNiveauAide] = useState(0);
  const [traces, setTraces] = useState<TraceFuite[]>([]);
  const [poignee, setPoignee] = useState<Pt | null>(null);
  const [tentatives, setTentatives] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [choix, setChoix] = useState<number | null>(null);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : tout repart vide après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);

  const e = exercice;
  const titres = titresEcrans(e);
  const etape = ecran < 2 ? e.etapes[ecran as 0 | 1] : null;
  if (import.meta.env.DEV) (window as unknown as { __debugGen105?: unknown }).__debugGen105 = { exercice: e, ecran };

  function recommencer(ex: ExercicePointFuite) {
    setExercice(ex);
    setEcran(0);
    setNiveauAide(0);
    setTraces([]);
    setPoignee(null);
    setTentatives(0);
    setMessage(null);
    setChoix(null);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function clore(revele: boolean, votreReponse: string, attendue: string, pointEleve: Pt | null) {
    setHistorique((h) => [...h, ecranClos(titres[ecran]!, <p style={{ margin: 0 }}>{espacesInsecables(votreReponse)}</p>, revele, niveauAide > 0, <p style={{ margin: 0 }}>{espacesInsecables(attendue)}</p>)]);
    setMessage(null);
    setEnAttente({ revele, derniere: ecran >= TOTAL_ECRANS - 1, pointEleve });
  }

  function validerPlacement() {
    if (!etape || !poignee) return;
    const v = verifierPlacement(e, etape, poignee);
    if (v.correct) {
      clore(false, `${etape.cible} placé au bon endroit.`, reponseConstruction(etape), null);
      return;
    }
    const n = tentatives + 1;
    setTentatives(n);
    if (n >= TENTATIVES_PLACEMENT) {
      clore(true, `${etape.cible} placé ailleurs : ${messageDiagnostic(etape, v.diagnostic!)}`, reponseConstruction(etape), poignee);
      return;
    }
    setMessage(messageDiagnostic(etape, v.diagnostic!));
  }

  function validerChoix() {
    if (choix === null) return;
    const juste = indexAffirmationVraie(e);
    clore(choix !== juste, `Affirmation ${choix + 1}`, reponseAffirmations(e), null);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExercicePointFuite());
      return;
    }
    setEcran((n) => n + 1);
    setNiveauAide(0);
    setTraces([]);
    setPoignee(null);
    setTentatives(0);
    setMessage(null);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <p style={{ margin: 0 }}>{espacesInsecables(etape ? reponseConstruction(etape) : reponseAffirmations(e))}</p>,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: etape ? "Tentatives épuisées — la construction attendue est dessinée sur la figure." : "Ce n'était pas l'affirmation vraie (une seule tentative sur un choix fermé).",
      }
    : null;

  // --- Figure ------------------------------------------------------------------------------------
  const clos = !!enAttente;
  const scene = sceneComplete(e, clos ? ecran + 1 : ecran);
  const sceneEtiquettes = sceneComplete(e, 2);
  let lignesCorrection: LigneFigureFuite[] = [];
  let marques: MarqueFigureFuite[] = [];
  if (etape && clos) {
    lignesCorrection = etape.supports.map((s) => ({ a: s.a, b: s.b, ton: "correction" as const }));
    if (enAttente.revele && enAttente.pointEleve) marques = [{ p: enAttente.pointEleve, nom: "", ton: "faux" }, { p: etape.position, nom: "", ton: "attendu" }];
  }
  const figure = (
    <ConstructionPointFuite
      key={`${generation}-${ecran}`}
      horizon={e.horizon}
      scene={scene}
      sceneEtiquettes={sceneEtiquettes}
      cible={etape && !clos ? etape.cible : null}
      poignee={poignee}
      onPoignee={(p) => {
        setPoignee(p);
        setMessage(null);
      }}
      traces={clos ? [] : traces}
      onTraces={setTraces}
      lignesCorrection={lignesCorrection}
      marques={marques}
    />
  );

  // --- Écran courant -----------------------------------------------------------------------------
  function ecranCourant(): ReactNode {
    const aides = etape ? etape.aides : AIDES_AFFIRMATIONS;
    const blocAides = <BlocAides aides={aides} niveau={niveauAide} onActiver={() => setNiveauAide((n) => Math.min(aides.length, n + 1))} />;
    if (etape) {
      return (
        <div>
          <p className="prompt-text">{espacesInsecables(etape.consigne)}</p>
          {!clos && (
            <>
              <p style={{ margin: "4px 0 10px", fontSize: "0.92em" }}>
                {poignee ? `Point ${etape.cible} placé : tu peux encore le déplacer avant de valider.` : `Trace les droites utiles, puis place le point ${etape.cible} avec l'outil « Placer ${etape.cible} ».`}
                {tentatives > 0 && ` Tentative ${tentatives + 1} sur ${TENTATIVES_PLACEMENT}.`}
              </p>
              {message && (
                <p className="alert-error" role="alert">
                  {espacesInsecables(message)}
                </p>
              )}
              {blocAides}
              <button type="button" className="btn btn-primary" disabled={!poignee} onClick={validerPlacement}>
                Valider
              </button>
            </>
          )}
          {clos && validation && (
            <>
              <div className="triangle-quelconque-aide">
                <p style={{ margin: 0 }}>{espacesInsecables(etape.justification)}</p>
              </div>
              <ValidationEcran {...validation} />
            </>
          )}
        </div>
      );
    }
    const juste = indexAffirmationVraie(e);
    return (
      <div>
        <p className="prompt-text">{espacesInsecables(CONSIGNE_AFFIRMATIONS)}</p>
        <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label="Affirmations">
          {e.affirmations.map((_, i) => {
            const choisi = choix === i;
            const faux = clos && choisi && i !== juste;
            const bon = clos && i === juste;
            return (
              <button
                key={i}
                type="button"
                disabled={clos}
                aria-pressed={choisi}
                className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
                style={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto", ...(bon && !choisi ? { outline: "2px solid var(--good)", outlineOffset: 1 } : {}) }}
                onClick={() => setChoix(i)}
              >
                <span>{espacesInsecables(texteAffirmation(e, i))}</span>
              </button>
            );
          })}
        </div>
        {!clos && (
          <>
            {blocAides}
            <button type="button" className="btn btn-primary" disabled={choix === null} onClick={validerChoix}>
              Valider
            </button>
          </>
        )}
        {clos && validation && (
          <>
            <div className="triangle-quelconque-aide">
              {explicationsAffirmations(e).map((l, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0" }}>
                  {espacesInsecables(l)}
                </p>
              ))}
            </div>
            <ValidationEcran {...validation} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Perspective centrale : point de fuite</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, TOTAL_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={espacesInsecables(e.contexte)} blocDonnees={figure} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
