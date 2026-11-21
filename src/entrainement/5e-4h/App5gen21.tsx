import { useState } from "react";
import type { ReactNode } from "react";
import { correctionDetailleeAsymptoteOblique, lettrePhaseAsymptoteOblique } from "./generateurs5e/asymptoteOblique/corrigeDetaille";
import { correctionDetailleePosition, lettrePhasePosition } from "./generateurs5e/asymptoteOblique/corrigePosition";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireGen21AvecFamilleId, genererExerciceAsymptoteOblique, genererExerciceGen21Libre } from "./generateurs5e/asymptoteOblique";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionAsymptoteOblique,
  formeDeveloppeeRefusee,
  niveauAideMaxAsymptoteOblique,
  saisieDivisionRefusee,
  soumettreReponseCalculerCoefficientA,
  soumettreReponseCalculerCoefficientB,
  soumettreReponseConclureEquationAsymptote,
  soumettreReponseDiviserEuclidienne,
  soumettreReponseEcrireFormeDeveloppee,
} from "./moteur5e/sessionAsymptoteOblique";
import type { EtatSessionAsymptoteOblique, PhaseAsymptoteOblique } from "./moteur5e/typesAsymptoteOblique";
import { ordreComplet } from "./moteur5e/typesAsymptoteOblique";
import {
  activerAidePosition,
  demarrerSessionPositionAsymptote,
  NIVEAU_AIDE_MAX_POSITION,
  ORDRE_POSITION,
  cotesAttendus,
  pointIllisible,
  pointRecoupementAttendu,
  soumettreCotes,
  soumettreNumerateurEcart,
  soumettrePointRecoupement,
  soumettreVerdictPosition,
  tentativesMaxPosition,
  type Cote,
  type EtatSessionPositionAsymptote,
  type PhasePositionAsymptote,
} from "./moteur5e/sessionPositionAsymptote";
import type { ExerciceAsymptoteOblique, ExerciceGen21, ExercicePositionAsymptote, VerdictPosition } from "./core5e/asymptoteOblique.types";
import { estPosition } from "./core5e/asymptoteOblique.types";
import { Katex } from "./components/Katex";
import { RenduFragments } from "../4e/components/RenduFragments";
import {
  LIBELLE_PHASE_ASYMPTOTE_OBLIQUE,
  aidesAsymptoteOblique,
  cibleAsymptoteOblique,
  consigneGenerale,
  consignePhase,
  formatFormulePhaseLatex,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelPhase,
} from "./ui5e/formatAsymptoteOblique";
import {
  LIBELLE_COTE,
  LIBELLE_PHASE_POSITION,
  OPTIONS_VERDICT,
  aidesPosition,
  cibleCotes,
  cibleNumerateur,
  ciblePoint,
  cibleVerdict,
  consignePhaseFragments,
  enonceFragments,
  labelNumerateur,
  optionVerdictFragments,
  reponseAttenduePosition,
  rLatex,
} from "./ui5e/formatPositionAsymptote";
import { MESSAGES_ILLISIBLE_LIMITES, fragmentsRiches } from "./ui5e/retoursLimites";
import { expressionIllisible, nombreExactRefuse, nombreIllisible } from "./moteur5e/saisieLimites";
import { retirerMembreGauche } from "./moteur5e/formeSaisieLimites";
import { calculerRecapitulatifAsymptoteOblique } from "./ui5e/recapitulatifAsymptoteOblique";
import type { EntreeRecapitulatif } from "./ui5e/recapitulatif";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { EcranChoixLimites, EcranSaisieLimites } from "./components5e/EcranSaisieLimites";
import { PiedEcranFonctions } from "./components5e/PiedEcranFonctions";
import { normaliserSigneMoins } from "../../lib/normaliserSaisie";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * 5gen21 — asymptote oblique (division euclidienne ou limites) et, depuis les lots B–D du 5e ch. 4,
 * famille « position de la courbe par rapport à son asymptote ». Une seule appli, deux moteurs : la
 * session courante porte sa famille (`Session`). Règles communes : saisie jamais bloquée, saisie
 * illisible ou approchée refusée sans tentative (moteur), choix fermés à une tentative, aides à deux
 * niveaux en KaTeX, messages ciblés.
 */

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

type Session = { famille: "classique"; etat: EtatSessionAsymptoteOblique } | { famille: "position"; etat: EtatSessionPositionAsymptote };

function sessionPour(e: ExerciceGen21): Session {
  return estPosition(e)
    ? { famille: "position", etat: demarrerSessionPositionAsymptote(REGLAGES_DEMO, () => e) }
    : { famille: "classique", etat: demarrerSessionAsymptoteOblique(REGLAGES_DEMO, () => e) };
}

function nouvelleSession(): Session {
  return sessionPour(genererExerciceGen21Libre());
}

/** `?code=` : même tirage que l'adaptateur (tirage libre d'avant les lots B–D, ou variante). */
function sessionInitiale(): Session {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return sessionPour(genererAvecCode<ExerciceGen21>(code, CATALOGUE_FAMILLES, () => genererExerciceAsymptoteOblique(), (id) => construireGen21AvecFamilleId(id)));
}

/** Récapitulatif de la famille « position » : valeurs COURTES, une formule par morceau (le panneau
 * passe à la ligne entre deux morceaux — une phrase entière dans un seul \text{} sortait du cadre
 * à 390 px). */
function recapPosition(e: ExercicePositionAsymptote, p: PhasePositionAsymptote): string[] {
  const pt = pointRecoupementAttendu(e);
  const cote = (c: Cote) => (c === "dessus" ? "\\text{au-dessus}" : "\\text{en dessous}");
  switch (p) {
    case "numerateurEcart":
      return [`R(x)=${rLatex(e)}`];
    case "verdictPosition":
      return e.verdict === "recoupe" ? ["\\text{recoupe } d"] : [e.verdict === "dessus" ? "\\text{au-dessus de } d" : "\\text{en dessous de } d"];
    case "pointRecoupement":
      return [pt ? `(${pt.x}\\,;\\,${pt.y})` : "\\text{aucun point commun}"];
    case "cotesApproche": {
      const c = cotesAttendus(e);
      return [`-\\infty :\\ ${cote(c.moinsInfini)}`, `+\\infty :\\ ${cote(c.plusInfini)}`];
    }
  }
}

function phaseDe(s: Session): string {
  return s.etat.phase;
}

function reponseAttendue(s: Session, phase: string): ReactNode {
  if (s.famille === "position") return <RenduFragments fragments={reponseAttenduePosition(s.etat.exerciceCourant, phase as PhasePositionAsymptote)} />;
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(s.etat.exerciceCourant, phase as PhaseAsymptoteOblique).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

function libellePhase(s: Session, phase: string): string {
  return s.famille === "position" ? LIBELLE_PHASE_POSITION[phase as PhasePositionAsymptote] : LIBELLE_PHASE_ASYMPTOTE_OBLIQUE[phase as PhaseAsymptoteOblique];
}

function recapitulatif(s: Session): EntreeRecapitulatif[] {
  if (s.famille === "classique") return calculerRecapitulatifAsymptoteOblique(s.etat);
  return ORDRE_POSITION.filter((p) => s.etat.scoresPartiels[p] !== undefined).map((p) => ({
    libelle: LIBELLE_PHASE_POSITION[p],
    estLatex: true,
    valeur: "",
    valeurs: recapPosition(s.etat.exerciceCourant, p),
    revele: s.etat.revelesPartiels[p] ?? false,
  }));
}

function segments(s: Session, aideParPhase: Record<string, boolean>): EtatPuceProgression[] {
  const ordre: string[] = s.famille === "position" ? ORDRE_POSITION : ordreComplet(s.etat.exerciceCourant);
  const scores = s.etat.scoresPartiels as Record<string, number | undefined>;
  const reveles = s.etat.revelesPartiels as Record<string, boolean | undefined>;
  return ordre.map((phase) => {
    if (phase === s.etat.phase && !s.etat.terminee) return "courante";
    if (scores[phase] === undefined) return "a-venir";
    if (reveles[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}

interface TransitionEnAttente {
  suivante: Session;
  revele: boolean;
  /** Message ciblé sous la réponse révélée d'un choix fermé. */
  messageRevele?: FragmentConsigne[] | null;
}

export function App5gen21() {
  const [session, setSession] = useState<Session>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Record<string, boolean>>({});
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  function reinitialiser(s: Session) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setNumeroGeneration((g) => g + 1);
    setSession(s);
  }

  /** `suivante` : état rendu par le moteur ; `votreReponse` : la saisie, pour la fiche de la puce. */
  function terminerEtape(suivante: Session, votreReponse: ReactNode, messageRevele?: FragmentConsigne[] | null) {
    const phase = phaseDe(session);
    const transition = phaseDe(suivante) !== phase || suivante.etat.terminee !== session.etat.terminee || suivante.etat.indexExercice !== session.etat.indexExercice;
    if (!transition) {
      setSession(suivante);
      return;
    }
    const revele = suivante.etat.derniereEtapeRevelee;
    setHistorique((h) => [...h, { titre: libellePhase(session, phase), votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttendue(session, phase) : undefined }]);
    if (session.etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [phase]: true }));
    setEnAttente({ suivante, revele, messageRevele: revele ? messageRevele : null });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.suivante.etat.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setSession(enAttente.suivante);
    setEnAttente(null);
  }

  const phase = phaseDe(session);
  const cleEcran = `${numeroGeneration}-${session.etat.indexExercice}-${phase}`;
  const corrige =
    session.famille === "position"
      ? lignesDeLEtape(correctionDetailleePosition(session.etat.exerciceCourant), lettrePhasePosition(phase as PhasePositionAsymptote))
      : lignesDeLEtape(correctionDetailleeAsymptoteOblique(session.etat.exerciceCourant), lettrePhaseAsymptoteOblique(session.etat.exerciceCourant, phase as PhaseAsymptoteOblique));

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        ...(enAttente.messageRevele
          ? {
              messageRevele: (
                <span>
                  Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé). <RenduFragments fragments={enAttente.messageRevele} />
                </span>
              ),
            }
          : {}),
        reponseAttendue: reponseAttendue(session, phase),
        corrigeDetaille: <CorrigeDetailleEcran etapes={corrige} />,
        labelSuivant: enAttente.suivante.etat.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Asymptote oblique</h1>
        <p className="app-subtitle">Chapitre 4 — Limites et asymptotes</p>
        <ProgressionPuces segments={segments(enAttente ? enAttente.suivante : session, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={(id) => reinitialiser(sessionPour(construireGen21AvecFamilleId(id)))} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif(session)} />
          {session.famille === "classique" ? (
            <EcranClassique key={cleEcran} etat={session.etat} terminer={(e, r) => terminerEtape({ famille: "classique", etat: e }, r)} aide={() => setSession({ famille: "classique", etat: activerAideSuivante(session.etat) })} validation={validation} />
          ) : (
            <EcranPosition key={cleEcran} etat={session.etat} terminer={(e, r, m) => terminerEtape({ famille: "position", etat: e }, r, m)} aide={() => setSession({ famille: "position", etat: activerAidePosition(session.etat) })} validation={validation} />
          )}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />}
    </div>
  );
}

// ============================================================================
// Asymptote oblique (division euclidienne, limites).
// ============================================================================

interface PropsClassique {
  etat: EtatSessionAsymptoteOblique;
  terminer: (etat: EtatSessionAsymptoteOblique, votreReponse: ReactNode) => void;
  aide: () => void;
  validation: ValidationEtapeProps | null;
}

function EnTeteClassique({ exercice }: { exercice: ExerciceAsymptoteOblique }) {
  return (
    <EnTeteExercice
      consigneGenerale={consigneGenerale()}
      blocDonnees={
        <div className="equation-box equation-box-donnees">
          <Katex expression={`f(x)=${formatTermesDonneesLatex(exercice)[0]}`} />
        </div>
      }
    />
  );
}

function EcranClassique({ etat, terminer, aide, validation }: PropsClassique) {
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const commun = {
    enTete: <EnTeteClassique exercice={exercice} />,
    consigne: fragmentsRiches(consignePhase(exercice, phase)),
    aides: aidesAsymptoteOblique(exercice, phase),
    niveauAide: etat.niveauAide,
    niveauAideMax: niveauAideMaxAsymptoteOblique(),
    onActiverAide: aide,
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    cible: (v: string[]) => cibleAsymptoteOblique(exercice, phase, v),
    validation,
  };
  switch (phase) {
    case "diviserEuclidienne":
      return (
        <EcranSaisieLimites
          {...commun}
          champs={[
            { label: "Q(x)=", placeholder: "ex : 7x − 11", apercu: true, libelleApercu: "Q(x) =" },
            { label: "R(x)=", placeholder: "ex : 9" },
          ]}
          illisible={([q, r]) => saisieDivisionRefusee(exercice, { quotient: q, reste: r })}
          texteIllisible={([q, r]) =>
            expressionIllisible(retirerMembreGauche(q)) ? MESSAGES_ILLISIBLE_LIMITES.expression : nombreIllisible(r) ? MESSAGES_ILLISIBLE_LIMITES.nombre : MESSAGES_ILLISIBLE_LIMITES.approchee
          }
          onValider={([q, r]) => terminer(soumettreReponseDiviserEuclidienne(etat, { quotient: q, reste: r }), `Q(x) = ${q} ; R(x) = ${r}`)}
        />
      );
    case "ecrireFormeDeveloppee":
      return (
        <EcranSaisieLimites
          {...commun}
          champs={[{ label: labelPhase(phase), placeholder: "ex : 7x − 11 + 9/(x − 8)", apercu: true, libelleApercu: "f(x) =" }]}
          illisible={([s]) => expressionIllisible(retirerMembreGauche(s))}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.expression}
          controleSansTentative={([s]) =>
            formeDeveloppeeRefusee(exercice, s) ? "Ce n'est pas encore la forme demandée : écris le quotient, puis le reste divisé par le dénominateur. Cette saisie ne compte pas comme une tentative." : null
          }
          onValider={([s]) => terminer(soumettreReponseEcrireFormeDeveloppee(etat, s), s)}
        />
      );
    case "calculerCoefficientA":
    case "calculerCoefficientB": {
      const attendu = phase === "calculerCoefficientA" ? exercice.a : exercice.b;
      return (
        <EcranSaisieLimites
          {...commun}
          formule={formatFormulePhaseLatex(phase)}
          champs={[{ label: labelPhase(phase), placeholder: phase === "calculerCoefficientA" ? "ex : 7" : "ex : −11" }]}
          illisible={([s]) => nombreExactRefuse(s, attendu)}
          texteIllisible={([s]) => (nombreIllisible(s) ? MESSAGES_ILLISIBLE_LIMITES.limite : MESSAGES_ILLISIBLE_LIMITES.approchee)}
          onValider={([s]) =>
            terminer(phase === "calculerCoefficientA" ? soumettreReponseCalculerCoefficientA(etat, s) : soumettreReponseCalculerCoefficientB(etat, s), `${phase === "calculerCoefficientA" ? "a" : "b"} = ${s}`)
          }
        />
      );
    }
    case "conclureEquationAsymptote":
      return (
        <EcranSaisieLimites
          {...commun}
          champs={[{ label: labelPhase(phase), placeholder: "ex : 7x − 11", apercu: true, libelleApercu: "y =" }]}
          illisible={([s]) => expressionIllisible(retirerMembreGauche(s))}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.droite}
          onValider={([s]) => terminer(soumettreReponseConclureEquationAsymptote(etat, s), s)}
        />
      );
  }
}

// ============================================================================
// Position de la courbe par rapport à son asymptote.
// ============================================================================

interface PropsPosition {
  etat: EtatSessionPositionAsymptote;
  terminer: (etat: EtatSessionPositionAsymptote, votreReponse: ReactNode, messageRevele?: FragmentConsigne[] | null) => void;
  aide: () => void;
  validation: ValidationEtapeProps | null;
}

function EnTetePosition({ exercice }: { exercice: ExercicePositionAsymptote }) {
  return (
    <EnTeteExercice
      consigneGenerale="Étudie la position de la courbe de f par rapport à son asymptote d."
      blocDonnees={
        <p className="prompt-text">
          <RenduFragments fragments={enonceFragments(exercice)} />
        </p>
      }
    />
  );
}

function EcranPosition({ etat, terminer, aide, validation }: PropsPosition) {
  const e = etat.exerciceCourant;
  const phase = etat.phase;
  const commun = {
    enTete: <EnTetePosition exercice={e} />,
    consigne: consignePhaseFragments(e, phase),
    aides: aidesPosition(e, phase),
    niveauAide: etat.niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX_POSITION,
    onActiverAide: aide,
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: tentativesMaxPosition(etat),
    validation,
  };
  switch (phase) {
    case "numerateurEcart":
      return (
        <EcranSaisieLimites
          {...commun}
          formule={labelNumerateur(e)}
          champs={[{ label: "R(x)=", placeholder: "ex : 3x − 2", apercu: true, libelleApercu: "R(x) =" }]}
          illisible={([s]) => expressionIllisible(s)}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.expression}
          cible={([s]) => cibleNumerateur(e, s)}
          onValider={([s]) => terminer(soumettreNumerateurEcart(etat, s), `R(x) = ${s}`)}
        />
      );
    case "verdictPosition":
      return (
        <EcranChoixLimites<VerdictPosition>
          {...commun}
          questions={[{ options: OPTIONS_VERDICT.map((v) => ({ id: v, fragments: optionVerdictFragments(e, v) })) }]}
          onValider={([c]) => terminer(soumettreVerdictPosition(etat, c), <RenduFragments fragments={optionVerdictFragments(e, c)} />, cibleVerdict(e, c))}
        />
      );
    case "pointRecoupement":
      return <EcranPoint etat={etat} commun={commun} terminer={terminer} />;
    case "cotesApproche":
      return (
        <EcranChoixLimites<Cote>
          {...commun}
          questions={[
            { label: [{ type: "texte", valeur: "En " }, { type: "latex", valeur: "-\\infty" }, { type: "texte", valeur: " :" }], options: (["dessus", "dessous"] as Cote[]).map((c) => ({ id: c, fragments: [{ type: "texte", valeur: LIBELLE_COTE[c] }] })) },
            { label: [{ type: "texte", valeur: "En " }, { type: "latex", valeur: "+\\infty" }, { type: "texte", valeur: " :" }], options: (["dessus", "dessous"] as Cote[]).map((c) => ({ id: c, fragments: [{ type: "texte", valeur: LIBELLE_COTE[c] }] })) },
          ]}
          onValider={([m, p]) => terminer(soumettreCotes(etat, { moinsInfini: m, plusInfini: p }), `en −∞ : ${LIBELLE_COTE[m]} ; en +∞ : ${LIBELLE_COTE[p]}`, cibleCotes(e, { moinsInfini: m, plusInfini: p }))}
        />
      );
  }
}

/** Écran « point de recoupement » : deux champs (x₀, y₀) OU le bouton « Aucun point commun ». */
function EcranPoint({
  etat,
  commun,
  terminer,
}: {
  etat: EtatSessionPositionAsymptote;
  commun: { enTete: ReactNode; consigne: FragmentConsigne[]; aides: ReturnType<typeof aidesPosition>; niveauAide: number; niveauAideMax: number; onActiverAide: () => void; tentativesUtilisees: number; tentativesMax: number; validation: ValidationEtapeProps | null };
  terminer: PropsPosition["terminer"];
}) {
  const e = etat.exerciceCourant;
  const [aucun, setAucun] = useState(false);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<{ aucun: boolean; x: string; y: string } | null>(null);
  const reponse = { aucun, x, y };
  const vide = !aucun && (x.trim() === "" || y.trim() === "");
  function valider() {
    if (vide) return;
    if (pointIllisible(e, reponse)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponse);
    terminer(soumettrePointRecoupement(etat, reponse), aucun ? "aucun point commun" : `(${x} ; ${y})`);
  }
  const champ = (label: string, valeur: string, setV: (v: string) => void) => (
    <div className="field field-inline">
      <label className="field-label field-label-minuscule">
        <Katex expression={label} />
      </label>
      <input
        type="text"
        className={`text-input${illisible && valeur.trim() !== "" && nombreIllisible(valeur) ? " is-erronee" : ""}`}
        value={valeur}
        disabled={aucun || !!commun.validation}
        autoComplete="off"
        placeholder="ex : −2"
        onChange={(ev) => {
          setV(normaliserSigneMoins(ev.target.value));
          setIllisible(false);
        }}
      />
    </div>
  );
  return (
    <div>
      {commun.enTete}
      <p className="prompt-text">
        <RenduFragments fragments={commun.consigne} />
      </p>
      {champ("x_0=", x, setX)}
      {champ("y_0=", y, setY)}
      <div className="options-grid">
        <button type="button" className={`btn${aucun ? " toggle-active" : ""}`} aria-pressed={aucun} disabled={!!commun.validation} onClick={() => setAucun((v) => !v)}>
          Aucun point commun
        </button>
      </div>
      <PiedEcranFonctions
        aides={commun.aides}
        niveauAide={commun.niveauAide}
        niveauAideMax={commun.niveauAideMax}
        onActiverAide={commun.onActiverAide}
        onValider={valider}
        vide={vide}
        illisible={illisible}
        texteIllisible={MESSAGES_ILLISIBLE_LIMITES.point}
        tentativesUtilisees={commun.tentativesUtilisees}
        tentativesMax={commun.tentativesMax}
        cible={soumise && commun.tentativesUtilisees > 0 ? ciblePoint(e, soumise) : null}
        validation={commun.validation}
      />
    </div>
  );
}
