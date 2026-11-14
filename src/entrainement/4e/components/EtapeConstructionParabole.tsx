import { useState } from "react";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { coordonneesPoint, outilsEcran, pointsConstruits, pointsPiquables, referenceEquerre, type AcquisConstruction, type EcranConstructionParabole, type OutilConstruction, type TraceConstruction } from "../moteur/modeleConstructionParabole";
import { pointH, sommet, type NomPoint } from "../moteur/geometrieConstructionParabole";
import { NIVEAU_AIDE_MAX_CONSTRUCTION } from "../moteur/sessionConstructionParabole";
import { formatMessageErreur } from "../ui/messageErreur";
import { PlanConstructionParabole, type EtatCompas } from "./PlanConstructionParabole";
import { SurcoucheResultat, aimantsEquerre, tracesContexte } from "./SurcouchesConstructionParabole";
import { RenduFragments } from "./RenduFragments";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran, type ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceConstructionParabole;
  ecran: EcranConstructionParabole;
  /** Acquis courant (déjà mis à jour quand l'écran est clos). */
  acquis: AcquisConstruction;
  consigne: FragmentConsigne[];
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message du dernier essai raté (diagnostic du geste fautif). */
  messageErreur: FragmentConsigne[] | null;
  onValider: (traces: TraceConstruction[]) => void;
  validation: ValidationEtapeProps | null;
  /** Écran clos : tracés à montrer (ceux de l'élève s'il a réussi, la construction attendue sinon). */
  tracesClos: TraceConstruction[] | null;
  bilan: FragmentConsigne[];
}

/** Ouverture de départ : un peu trop petite pour le report comme pour les médiatrices (l'élève doit
 * l'ajuster), mais assez grande pour que la pointe et la mine ne se chevauchent pas au doigt. */
const OUVERTURE_DEPART = 1;

function compasInitial(exercice: ExerciceConstructionParabole, ecran: EcranConstructionParabole, acquis: AcquisConstruction): EtatCompas {
  if (ecran.type === "cercleF" && acquis.ouvertureEnCours !== null) {
    return { pointe: "K", mine: { x: acquis.ouvertureEnCours, y: 0 } };
  }
  const pointe: NomPoint = "F";
  const p = coordonneesPoint(exercice, pointe);
  return { pointe, mine: { x: p.x + OUVERTURE_DEPART, y: p.y } };
}

function equerreInitiale(exercice: ExerciceConstructionParabole, ecran: EcranConstructionParabole, acquis: AcquisConstruction): number {
  if (referenceEquerre(ecran) === "axe") {
    const r = acquis.ouvertureEnCours ?? 0;
    return Math.abs(5.2 - r) < 1 ? -0.8 : 5.2;
  }
  const cible = ecran.type === "axe" ? 0 : pointH(exercice, ecran.type === "pointRapide" ? ecran.indice : 0).x;
  return cible + 2.5 <= 4.6 ? cible + 2.5 : cible - 2.5;
}

const LIBELLES_OUTILS: Record<OutilConstruction, string> = { compas: "Compas", equerre: "Équerre" };

export function EtapeConstructionParabole({
  exercice,
  ecran,
  acquis,
  consigne,
  aides,
  niveauAide,
  onActiverAide,
  tentativesUtilisees,
  tentativesMax,
  messageErreur,
  onValider,
  validation,
  tracesClos,
  bilan,
}: Props) {
  const outils = outilsEcran(ecran);
  const [outil, setOutil] = useState<OutilConstruction>(outils[0]!);
  const [compas, setCompas] = useState<EtatCompas>(() => compasInitial(exercice, ecran, acquis));
  const [positionEquerre, setPositionEquerre] = useState(() => equerreInitiale(exercice, ecran, acquis));
  const [traces, setTraces] = useState<TraceConstruction[]>([]);
  const [tentativesVues, setTentativesVues] = useState(tentativesUtilisees);

  // Essai raté : les tracés repartent vides (les instruments restent où l'élève les a laissés).
  if (tentativesVues !== tentativesUtilisees) {
    setTentativesVues(tentativesUtilisees);
    setTraces([]);
  }

  const clos = validation !== null;
  const reference = referenceEquerre(ecran);
  const contexte = tracesContexte(exercice, ecran, acquis);
  const pointeCoord = coordonneesPoint(exercice, compas.pointe);
  const ouverture = Math.hypot(compas.mine.x - pointeCoord.x, compas.mine.y - pointeCoord.y);
  const pointsRemarquables = [sommet(exercice), ...pointsConstruits(exercice, acquis).map((p) => p.point)];

  function piquer(nom: NomPoint) {
    const p = coordonneesPoint(exercice, nom);
    setCompas({ pointe: nom, mine: { x: p.x + (compas.mine.x - pointeCoord.x), y: p.y + (compas.mine.y - pointeCoord.y) } });
  }

  function tracer() {
    if (outil === "compas") setTraces((t) => [...t, { type: "cercle", centre: compas.pointe, rayon: ouverture }]);
    else setTraces((t) => [...t, { type: "droite", reference, position: positionEquerre }]);
  }

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>

      <PlanConstructionParabole
        exercice={exercice}
        acquis={acquis}
        tracesContexte={contexte}
        coupesK={ecran.type === "report" || ecran.type === "parallele" || ecran.type === "cercleF" || ecran.type === "coupleRapide"}
        traces={clos ? (tracesClos ?? traces) : traces}
        surcouche={clos ? <SurcoucheResultat exercice={exercice} ecran={ecran} acquis={acquis} /> : null}
        equerre={
          !clos && outil === "equerre"
            ? { reference, position: positionEquerre, onChange: setPositionEquerre, aimants: aimantsEquerre(exercice, reference, [...contexte, ...traces], pointsRemarquables) }
            : null
        }
        compas={!clos && outil === "compas" ? { etat: compas, onChange: setCompas } : null}
      />

      {!clos && (
        <div className="construction-barre">
          {outils.length > 1 && (
            <div className="construction-outils" role="group" aria-label="Instrument">
              {outils.map((o) => (
                <button key={o} type="button" className="construction-outil" aria-pressed={outil === o} onClick={() => setOutil(o)}>
                  {LIBELLES_OUTILS[o]}
                </button>
              ))}
            </div>
          )}
          {outil === "compas" && (
            <div className="construction-pointe" role="group" aria-label="Pointe du compas">
              <span>Pointe du compas en</span>
              {pointsPiquables(exercice, acquis).map((nom) => (
                <button key={nom} type="button" className="construction-outil" data-pointe={nom} aria-pressed={compas.pointe === nom} onClick={() => piquer(nom)}>
                  <Katex expression={nom.replace(/H(\d)/, "H_$1")} />
                </button>
              ))}
            </div>
          )}
          <div className="construction-actions">
            <button type="button" className="btn construction-action" onClick={tracer}>
              {outil === "compas" ? "Tracer le cercle" : "Tracer la droite"}
            </button>
            <button type="button" className="btn construction-action" disabled={traces.length === 0} onClick={() => setTraces((t) => t.slice(0, -1))}>
              Effacer le dernier tracé
            </button>
          </div>
          <p className="construction-mode-emploi">
            {outil === "compas"
              ? "Choisis où piquer la pointe, puis fais glisser la mine (bleue) pour régler l'ouverture."
              : "Fais glisser le coin de l'angle droit (orange) le long de la droite."}{" Pour plus de précision, zoome sur la figure (deux doigts ou molette)."}
          </p>
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aides.slice(0, niveauAide).map((aide, i) => (
            <p key={i}>
              <RenduFragments fragments={aide} />
            </p>
          ))}
        </div>
      )}

      {!clos && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONSTRUCTION} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={traces.length === 0} onClick={() => onValider(traces)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              <span>
                {messageErreur && (
                  <>
                    <RenduFragments fragments={messageErreur} />{" "}
                  </>
                )}
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
              </span>
            </p>
          )}
        </>
      )}
      {clos && (
        <>
          <p className="construction-bilan">
            <RenduFragments fragments={bilan} />
          </p>
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}
