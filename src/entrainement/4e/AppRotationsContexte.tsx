import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceRotationsContexte, OrigineRotation, RotationSens } from "./core/rotationsContexte.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceRotationsContexte } from "./generateurs/rotationsContexte";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatRotationsContexte } from "./moteur/sessionRotationsContexte";
import {
  diagnostiquerHauteur,
  diagnostiquerK,
  diagnostiquerPosition,
  diagnostiquerRetours,
  diagnostiquerThetaDirect,
  diagnostiquerThetasInverse,
  lireNombre,
  verifierRepere,
  type Diagnostic,
  type StatutChamp,
} from "./moteur/verificationRotationsContexte";
import { solutionsTheta, thetaDirect } from "./moteur/modeleRotationsContexte";
import {
  CONSIGNE_GENERALE,
  NOMBRE_ECRANS,
  aidesEcran,
  champsEcran,
  consignesEcrans,
  contexteTexte,
  libelleOrigine,
  libelleRotation,
  nombreFr,
  nomCourtChamp,
  questionTexte,
  reponseEcranLatex,
  titresEcrans,
} from "./ui/formatRotationsContexte";
import { figureRotationsContexteSvg } from "./ui/figureRotationsContexte";
import { calculerTrajetCercleTrig } from "./ui/cercleTrigTrajet";
import { calculerAideCandidats, calculerAideProjections, calculerAideQuadrants } from "./ui/quelAngleAide";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CercleTrigBase } from "./components/CercleTrigBase";
import { CercleTrigTrajetBase } from "./components/CercleTrigTrajetBase";
import { EtapeChampsRotation, EtapeRepereRotation, type AideRotation } from "./components/EtapesRotationsContexte";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen79 — « Le cercle dans le réel : rotations en contexte » (4e, chapitre 5, section « equations »,
 * processus 3 TRANSFÉRER). Grande roue, horloge, bras de robot, éolienne, valve de vélo : le
 * contexte ne part pas de 0° et ne tourne pas forcément dans le sens trigonométrique. Quatre écrans :
 * 1. position de départ et sens de rotation sur le cercle trigonométrique (choix fermés, une tentative) ;
 * Sens direct : 2. angle trigonométrique θ (réduit) ; 3. coordonnées (r cos θ ; r sin θ) ;
 *   4. hauteur au-dessus du sol (h + r sin θ).
 * Sens inverse : 2. mise en équation, sin θ = k ; 3. toutes les solutions dans [0° ; 360°[ (deux, ou
 *   une seule au sommet / en bas) ; 4. retour au contexte (durées, minutes ou angles de rotation).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceRotationsContexte {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceRotationsContexte();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceRotationsContexte, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

interface Retour {
  statuts: StatutChamp[] | null;
  message: string | null;
  nonCompte: boolean;
}

const RETOUR_VIDE: Retour = { statuts: null, message: null, nonCompte: false };

function Figure({ svg }: { svg: string }) {
  return <div style={{ margin: "8px 0" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Cercle trigonométrique de l'aide « signes » : le point de θ, son arc depuis 0°. */
function CerclePosition({ theta }: { theta: number }) {
  return (
    <CercleTrigTrajetBase trajet={calculerTrajetCercleTrig(theta, theta)} labelAngleBrutTexte={`${theta}°`} ariaLabel={`Cercle trigonométrique : le point repéré par ${theta}°`} />
  );
}

/** Cercle de l'aide « deux solutions » (même construction que l'aide de gen18) : quadrants,
 * points candidats et projection commune sur l'axe Y — sans aucune valeur d'angle. */
function CercleSolutions({ solutions }: { solutions: number[] }) {
  const { cheminsQuadrants, rayonsAxes } = calculerAideQuadrants(solutions);
  const candidats = calculerAideCandidats(solutions);
  const projections = calculerAideProjections("sin", solutions);
  return (
    <CercleTrigBase ariaLabel="Cercle trigonométrique : quadrants et points qui ont le sinus cherché">
      {cheminsQuadrants.map((chemin) => (
        <path key={chemin} d={chemin} className="quel-angle-quadrant-surligne" />
      ))}
      {rayonsAxes.map((r) => (
        <line key={`${r.x2}-${r.y2}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} className="quel-angle-axe-surligne" />
      ))}
      {candidats.map((c) => (
        <g key={`${c.point.x}-${c.point.y}`}>
          <path d={c.chemin} className="quel-angle-arc-candidat" />
          <polygon points={c.fleche} className="quel-angle-fleche-candidat" />
          <circle cx={c.point.x} cy={c.point.y} r={5} className="quel-angle-point-candidat" />
        </g>
      ))}
      {projections.map((p) => (
        <line key={`p-${p.point.x}-${p.point.y}`} x1={p.point.x} y1={p.point.y} x2={p.projection.x} y2={p.projection.y} className="quel-angle-projection-candidat" />
      ))}
      {projections[0] && <circle cx={projections[0].projection.x} cy={projections[0].projection.y} r={4} className="quel-angle-point-projection" />}
    </CercleTrigBase>
  );
}

function aidesAvecFigures(e: ExerciceRotationsContexte, ecran: number): AideRotation[] {
  const aides: AideRotation[] = aidesEcran(e, ecran).map((fragments) => ({ fragments }));
  if (e.sens === "direct" && ecran === 2 && aides[1]) aides[1].figure = <CerclePosition theta={thetaDirect(e)} />;
  if (e.sens === "inverse" && ecran === 2 && aides[1]) aides[1].figure = <CercleSolutions solutions={solutionsTheta(e)} />;
  return aides;
}

function texteRepere(origine: OrigineRotation, rotation: RotationSens): ReactNode {
  return (
    <span>
      Départ : {libelleOrigine(origine)} ; {libelleRotation(rotation).toLowerCase()}.
    </span>
  );
}

function diagnostiquer(e: ExerciceRotationsContexte, ecran: number, saisies: string[]): Diagnostic {
  if (e.sens === "direct") {
    if (ecran === 1) return diagnostiquerThetaDirect(e, saisies[0] ?? "");
    if (ecran === 2) return diagnostiquerPosition(e, saisies);
    return diagnostiquerHauteur(e, saisies[0] ?? "");
  }
  if (ecran === 1) return diagnostiquerK(e, saisies[0] ?? "");
  if (ecran === 2) return diagnostiquerThetasInverse(e, saisies);
  return diagnostiquerRetours(e, saisies);
}

export function AppRotationsContexte() {
  const [etat, setEtat] = useState<EtatRotationsContexte>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [retour, setRetour] = useState<Retour>(RETOUR_VIDE);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const titres = titresEcrans(e);

  function recommencer(exercice: ExerciceRotationsContexte) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setRetour(RETOUR_VIDE);
    setGeneration((g) => g + 1);
  }

  function reponseAttendue(): ReactNode {
    if (ecran === 0) return texteRepere(e.origine, e.rotation);
    return <Katex expression={reponseEcranLatex(e, ecran)} />;
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue();
    setHistorique((h) => [...h, ecranClos(titres[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas le bon repérage." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceRotationsContexte());
      return;
    }
    setEtat(ecranSuivant(etat));
    setRetour(RETOUR_VIDE);
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesAvecFigures(e, ecran) };
  const nbSolutions = solutionsTheta(e).length;

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeRepereRotation
          {...communs}
          consigne={consigne}
          attendu={{ origine: e.origine, rotation: e.rotation }}
          onValider={(origine, rotation) => conclure(verifierRepere(e, origine, rotation), texteRepere(origine, rotation))}
        />
      );
    }
    const inverseSolutions = e.sens === "inverse" && ecran === 2;
    return (
      <EtapeChampsRotation
        {...communs}
        identifiant={`rc-${ecran}`}
        consigne={consigne}
        champs={(n) => champsEcran(e, ecran, inverseSolutions ? n : nbSolutions)}
        choixNombre={inverseSolutions}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={retour.statuts}
        message={retour.message}
        nonCompte={retour.nonCompte}
        onValider={(saisies) => {
          const diagnostic = diagnostiquer(e, ecran, saisies);
          setRetour({ statuts: diagnostic.statuts, message: diagnostic.message, nonCompte: diagnostic.nonCompte });
          if (diagnostic.nonCompte) return;
          const champs = champsEcran(e, ecran, saisies.length);
          const votre = (
            <span>
              {saisies.map((s, i) => {
                const v = lireNombre(s);
                return (
                  <span key={i}>
                    {i > 0 ? " ; " : ""}
                    <RenduFragments fragments={nomCourtChamp(champs[i]?.libelle ?? [])} /> = {v === null ? s : nombreFr(v, 4)}
                    {champs[i]?.unite ? ` ${champs[i]!.unite}` : ""}
                  </span>
                );
              })}
            </span>
          );
          conclure(diagnostic.correct, votre);
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>{contexteTexte(e)}</p>
      <p style={{ margin: "6px 0", fontWeight: 600 }}>{questionTexte(e)}</p>
      <Figure svg={figureRotationsContexteSvg(e, "enonce")} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Le cercle dans le réel : rotations en contexte</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique &amp; triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
          {enAttente?.derniere && (
            <div className="triangle-quelconque-aide" style={{ marginTop: 12 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Bilan sur le schéma</p>
              <Figure svg={figureRotationsContexteSvg(e, "corrige")} />
            </div>
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
