import { useState } from "react";
import { correctionDetailleeLimite, lettrePhaseLimite } from "./generateurs5e/limites/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimite } from "./generateurs5e/limites";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLimite,
  niveauAideMaxLimite,
  soumettreReponseConclureLimite,
  soumettreReponseEvaluerLimiteFinaleNumerique,
  soumettreReponseEvaluerLimiteFinaleSigne,
  soumettreReponseFactoriser,
  soumettreReponseFactoriserDenominateur,
  soumettreReponseLimitesGaucheDroite,
  soumettreReponseReconnaissance,
  soumettreReponseSimplifierEvaluer,
  soumettreReponseSimplifierLimiteRef,
  soumettreReponseTermeDominant,
  saisieLimiteRefusee,
  tentativesMaxLimite,
} from "./moteur5e/sessionLimites";
import type { ReponseConclureLimite, ReponseLimitesGaucheDroite } from "./moteur5e/sessionLimites";
import type { EtatSessionLimite, PhaseLimite } from "./moteur5e/typesLimites";
import { ordreComplet } from "./moteur5e/typesLimites";
import type { ExerciceLimite } from "./core5e/limites.types";
import { Katex } from "./components/Katex";
import {
  LIBELLE_FAMILLE_LIMITE,
  LIBELLE_PHASE_LIMITE,
  OPTIONS_RECONNAISSANCE_INDETERMINEE,
  aidesLimite,
  cibleChoixLimite,
  cibleLimite,
  consigneGenerale,
  consignePhase,
  formatBlocDonneesEgalLatex,
  formatBlocDonneesLatex,
  formatLabelLimiteDroiteLatex,
  formatLabelLimiteGaucheLatex,
  formatReponseAttenduePhaseLatex,
  labelPhase,
  limNecessiteModeDisplay,
} from "./ui5e/formatLimites";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { RenduFragments } from "../4e/components/RenduFragments";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { EcranChoixLimites, EcranSaisieLimites } from "./components5e/EcranSaisieLimites";
import { PiedEcranFonctions } from "./components5e/PiedEcranFonctions";
import { MESSAGES_ILLISIBLE_LIMITES } from "./ui5e/retoursLimites";
import { expressionsIllisibles, nombreIllisible } from "./moteur5e/saisieLimites";
import { estFormeFactorisee } from "./moteur5e/formeSaisieLimites";
import { normaliserSigneMoins } from "../../lib/normaliserSaisie";
import { calculerRecapitulatifLimite } from "./ui5e/recapitulatifLimite";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLimite {
  return demarrerSessionLimite(REGLAGES_DEMO, genererExerciceLimite);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs5e/limites/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionLimite {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLimite(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceLimite, (id) => construireAvecFamilleId(id)));
}

/** Réponse réellement attendue de la phase qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelLimite.tsx` (supprimé, remplacé par la validation inline) : "reconnaissance"
 * affiche le libellé de la VRAIE famille générée (jamais la réponse de l'élève), puis le LaTeX de
 * `formatReponseAttenduePhaseLatex` quand il y en a (non vide pour "reconnaissance" seulement dans
 * le cas "limiteReelle", où cet écran porte aussi la valeur numérique). */
function reponseAttendueLimite(exercice: ExerciceLimite, phase: PhaseLimite) {
  const reponseLatex = formatReponseAttenduePhaseLatex(exercice, phase);
  const libelleFamille = phase === "reconnaissance" ? LIBELLE_FAMILLE_LIMITE[exercice.famille] ?? exercice.famille : null;
  if (!libelleFamille && reponseLatex.length === 0) return undefined;
  return (
    <>
      {libelleFamille}
      {reponseLatex.length > 0 && (
        <span className="equation-box-termes">
          {reponseLatex.map((frag, i) => (
            <Katex key={i} expression={frag} block={limNecessiteModeDisplay(frag)} />
          ))}
        </span>
      )}
    </>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLimite;
  revele: boolean;
  /** Message ciblé sous la réponse révélée d'un choix fermé (une seule tentative). */
  messageRevele?: FragmentConsigne[] | null;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — séquence RÉELLE propre à la
 * famille du tirage (4 familles structurellement disjointes, longueur variable), jamais un
 * `ORDRE_PHASES` fixe reconstitué à la main (contrairement à `AppAnalyseFonction`, 4e, où la
 * séquence est commune à toutes les catégories) : même source que `calculerRecapitulatifLimite`.
 * "courante" pour `etat.phase`, "correcte"/"revele" pour les phases déjà closes
 * (`scoresPartiels[phase]`, 0 ⟺ révélée), "a-venir" au-delà. */
function calculerSegmentsProgression(etat: EtatSessionLimite, aideParPhase: Partial<Record<PhaseLimite, boolean>>): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    if (etat.scoresPartiels[phase] === undefined) return "a-venir";
    if (etat.reveleesPartielles[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}

export function App5gen20() {
  const [etat, setEtat] = useState<EtatSessionLimite>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — tenu ICI, à part de
   * `EtatSessionLimite`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e).
   * Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par phase close — capturé ici (présentation) au moment de la
   * transition, puisque `etat.niveauAide` (moteur) ne porte que le niveau de l'ÉCRAN EN COURS et
   * est remis à 0 à chaque transition (voir le commentaire de `EtatSessionComposerFonctions.niveauAide`,
   * même patron que `App5gen31.tsx::aideParPhase`/`App5gen3.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLimite, boolean>>>({});
  /** Compteur de générations : fait partie de la clé d'écran, pour que « Générer » et « Nouvel
   * exercice » remontent l'écran (champs vides) même quand le nouvel exercice commence par le même
   * écran (audit 5c4a point 7). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  /** Fiche de la puce : l'écran qui VIENT de se clore (`phaseClose`), jamais la dernière ligne du
   * récapitulatif (audit 5c4a point 6 : le dernier écran prenait le nom du précédent). */
  function ajouterHistorique(votreReponse: ReactNode, phaseClose: PhaseLimite, revele: boolean) {
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE_LIMITE[phaseClose],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? reponseAttendueLimite(etat.exerciceCourant, phaseClose) : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand la phase se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (bug déjà rencontré et
   * corrigé sur la référence 4e, voir `AppAnalyseFonction.tsx::terminerEtape`). */
  function terminerEtape(nouvelEtat: EtatSessionLimite, votreReponse?: ReactNode, messageRevele?: FragmentConsigne[] | null) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, etat.phase, nouvelEtat.derniereEtapeRevelee);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee, messageRevele: nouvelEtat.derniereEtapeRevelee ? messageRevele : null });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
      setNumeroGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setNumeroGeneration((g) => g + 1);
    setEtat(demarrerSessionLimite(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxLimite(etat);
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

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
        reponseAttendue: reponseAttendueLimite(exercice, phase),
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeLimite(exercice), lettrePhaseLimite(exercice, phase))} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites, reconnaissance et calcul</h1>
        <p className="app-subtitle">Chapitre 4 — Limites et asymptotes</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifLimite(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLimite;
  phase: PhaseLimite;
  etat: EtatSessionLimite;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLimite, votreReponse?: ReactNode, messageRevele?: FragmentConsigne[] | null) => void;
  setEtat: (etat: EtatSessionLimite) => void;
  validation: ValidationEtapeProps | null;
}

const OPTIONS_INFINI: { id: "1" | "-1"; fragments: FragmentConsigne[] }[] = [
  { id: "1", fragments: [{ type: "latex", valeur: "+\\infty" }] },
  { id: "-1", fragments: [{ type: "latex", valeur: "-\\infty" }] },
];

/** Dispatch par phase (lots B–D) : écrans génériques du chapitre (`EcranSaisieLimites`,
 * `EcranChoixLimites`) — saisie jamais bloquée, illisible / approchée / non factorisée refusée sans
 * tentative (moteur `saisieLimiteRefusee`), aides à deux niveaux, messages ciblés ; choix fermés à
 * une tentative avec message sous la réponse révélée. */
function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const commun = {
    enTete: (
      <EnTeteExercice
        consigneGenerale={consigneGenerale()}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            <Katex expression={formatBlocDonneesLatex(exercice)} block />
          </div>
        }
      />
    ),
    consigne: [{ type: "texte", valeur: consignePhase(exercice, phase) }] as FragmentConsigne[],
    aides: aidesLimite(exercice, phase),
    niveauAide: etat.niveauAide,
    niveauAideMax: niveauAideMaxLimite(),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    tentativesUtilisees,
    tentativesMax,
    validation,
  };
  const champNombre = {
    illisible: (v: string[]) => saisieLimiteRefusee(etat, v),
    texteIllisible: (v: string[]) => (nombreIllisible(v[0]) ? MESSAGES_ILLISIBLE_LIMITES.limite : MESSAGES_ILLISIBLE_LIMITES.approchee),
    cible: (v: string[]) => cibleLimite(exercice, phase, v),
  };
  const champExpression = {
    illisible: (v: string[]) => saisieLimiteRefusee(etat, v),
    cible: (v: string[]) => cibleLimite(exercice, phase, v),
  };

  switch (phase) {
    case "reconnaissance":
      return (
        <EcranReconnaissance
          key={cleEcran}
          exercice={exercice}
          etat={etat}
          commun={commun}
          onValider={(choix, valeurTexte) =>
            terminerEtape(
              soumettreReponseReconnaissance(etat, choix, valeurTexte),
              `${LIBELLE_FAMILLE_LIMITE[choix] ?? choix}${valeurTexte !== undefined ? ` ; lim = ${valeurTexte}` : ""}`,
              cibleChoixLimite(exercice, "reconnaissance", [choix]),
            )
          }
        />
      );

    case "factoriser":
      return (
        <EcranSaisieLimites
          key={cleEcran}
          {...commun}
          {...champExpression}
          champs={[
            { label: "N(x) =", placeholder: "ex : 2(x − 7)(x + 9)", apercu: true, libelleApercu: "N(x) =" },
            { label: "D(x) =", placeholder: "ex : (x − 8)(x + 9)", apercu: true, libelleApercu: "D(x) =" },
          ]}
          illisible={(v) => expressionsIllisibles(v)}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.facteurs}
          controleSansTentative={(v) => (v.some((x) => !estFormeFactorisee(x)) ? "Ce n'est pas encore une forme factorisée : écris un produit de facteurs du premier degré. Cette saisie ne compte pas comme une tentative." : null)}
          onValider={([n, d]) => terminerEtape(soumettreReponseFactoriser(etat, { numerateur: [n], denominateur: [d] }), `N(x) = ${n} ; D(x) = ${d}`)}
        />
      );

    case "simplifierEvaluer":
      return (
        <EcranSaisieLimites key={cleEcran} {...commun} {...champNombre} champs={[{ label: labelPhase(phase, exercice), placeholder: "ex : 13/7" }]} onValider={([t]) => terminerEtape(soumettreReponseSimplifierEvaluer(etat, t), `lim = ${t}`)} />
      );

    case "factoriserDenominateur":
      return (
        <EcranSaisieLimites
          key={cleEcran}
          {...commun}
          {...champExpression}
          champs={[{ label: "D(x) =", placeholder: "ex : 2(x − 1)(x + 3)", apercu: true, libelleApercu: "D(x) =" }]}
          illisible={(v) => expressionsIllisibles(v)}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.facteurs}
          controleSansTentative={(v) => (!estFormeFactorisee(v[0]) ? "Ce n'est pas encore une forme factorisée : écris un produit de facteurs du premier degré. Cette saisie ne compte pas comme une tentative." : null)}
          onValider={([d]) => terminerEtape(soumettreReponseFactoriserDenominateur(etat, [d]), `D(x) = ${d}`)}
        />
      );

    case "limitesGaucheDroite":
      return (
        <EcranChoixLimites<"1" | "-1">
          key={cleEcran}
          {...commun}
          questions={[
            { label: [{ type: "latex", valeur: formatLabelLimiteGaucheLatex(exercice) }], options: OPTIONS_INFINI },
            { label: [{ type: "latex", valeur: formatLabelLimiteDroiteLatex(exercice) }], options: OPTIONS_INFINI },
          ]}
          onValider={([g, d]) => {
            const reponse: ReponseLimitesGaucheDroite = { gauche: Number(g) as 1 | -1, droite: Number(d) as 1 | -1 };
            terminerEtape(soumettreReponseLimitesGaucheDroite(etat, reponse), `gauche : ${g === "1" ? "+∞" : "−∞"} ; droite : ${d === "1" ? "+∞" : "−∞"}`, cibleChoixLimite(exercice, phase, [g, d]));
          }}
        />
      );

    case "conclureLimite":
      return (
        <EcranChoixLimites<"1" | "-1" | "nexistepas">
          key={cleEcran}
          {...commun}
          questions={[{ options: [...OPTIONS_INFINI, { id: "nexistepas", fragments: [{ type: "texte", valeur: "la limite n'existe pas" }] }] }]}
          onValider={([c]) => {
            const choix: ReponseConclureLimite = c === "nexistepas" ? "nexistepas" : (Number(c) as 1 | -1);
            terminerEtape(soumettreReponseConclureLimite(etat, choix), c === "nexistepas" ? "n'existe pas" : c === "1" ? "+∞" : "−∞", cibleChoixLimite(exercice, phase, [c]));
          }}
        />
      );

    case "termeDominant":
      return (
        <EcranSaisieLimites
          key={cleEcran}
          {...commun}
          {...champExpression}
          champs={[
            { label: "\\text{Numérateur : }", placeholder: "ex : −3x^2", apercu: true, libelleApercu: "Numérateur :" },
            { label: "\\text{Dénominateur : }", placeholder: "ex : 5x^3", apercu: true, libelleApercu: "Dénominateur :" },
          ]}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.monome}
          onValider={([n, d]) => terminerEtape(soumettreReponseTermeDominant(etat, { numerateur: n, denominateur: d }), `Num. : ${n} ; Dén. : ${d}`)}
        />
      );

    case "simplifierLimiteRef": {
      if (exercice.famille !== "limiteInfini") return null;
      return (
        <EcranSaisieLimites
          key={cleEcran}
          {...commun}
          {...champExpression}
          champs={[{ label: labelPhase(phase, exercice), placeholder: exercice.degreResultat === 0 ? "ex : 7/8" : "ex : 7x^4", apercu: true }]}
          texteIllisible={() => MESSAGES_ILLISIBLE_LIMITES.expression}
          onValider={([t]) => terminerEtape(soumettreReponseSimplifierLimiteRef(etat, t), t)}
        />
      );
    }

    case "evaluerLimiteFinale": {
      if (exercice.famille !== "limiteInfini") return null;
      if (exercice.natureLimite === "infinie") {
        return (
          <EcranChoixLimites<"1" | "-1">
            key={cleEcran}
            {...commun}
            questions={[{ options: OPTIONS_INFINI }]}
            onValider={([c]) => terminerEtape(soumettreReponseEvaluerLimiteFinaleSigne(etat, Number(c) as 1 | -1), c === "1" ? "+∞" : "−∞", cibleChoixLimite(exercice, phase, [c]))}
          />
        );
      }
      return (
        <EcranSaisieLimites key={cleEcran} {...commun} {...champNombre} champs={[{ label: labelPhase(phase, exercice), placeholder: "ex : 2,5" }]} onValider={([t]) => terminerEtape(soumettreReponseEvaluerLimiteFinaleNumerique(etat, t), `lim = ${t}`)} />
      );
    }
  }
}

const ID_INDETERMINEE = "indeterminee";

/** Écran « reconnaissance » : nombre réel (avec sa valeur exacte, même geste), limite infinie ou
 * forme indéterminée (∞/∞ ou 0/0) — choix fermé à une tentative ; la valeur du nombre réel garde
 * trois tentatives et ne compte pas une saisie illisible ou approchée. */
function EcranReconnaissance({
  exercice,
  etat,
  commun,
  onValider,
}: {
  exercice: ExerciceLimite;
  etat: EtatSessionLimite;
  commun: { enTete: ReactNode; consigne: FragmentConsigne[]; aides: ReturnType<typeof aidesLimite>; niveauAide: number; niveauAideMax: number; onActiverAide: () => void; tentativesUtilisees: number; tentativesMax: number; validation: ValidationEtapeProps | null };
  onValider: (choix: string, valeurTexte?: string) => void;
}) {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [sousChoix, setSousChoix] = useState<string | null>(null);
  const [valeur, setValeur] = useState("");
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<string | null>(null);
  const choixFinal = principal === ID_INDETERMINEE ? sousChoix : principal;
  const vide = choixFinal === null || (principal === "limiteReelle" && valeur.trim() === "");
  const bouton = (libelle: string, actif: boolean, onClick: () => void) => (
    <button type="button" className={actif ? "btn toggle-active" : "btn"} aria-pressed={actif} disabled={!!commun.validation} onClick={onClick}>
      {libelle}
    </button>
  );
  function choisir(id: string) {
    setPrincipal(id);
    setSousChoix(null);
    setValeur("");
    setIllisible(false);
  }
  function valider() {
    if (vide || choixFinal === null) return;
    if (principal === "limiteReelle") {
      if (choixFinal === exercice.famille && saisieLimiteRefusee(etat, [valeur])) {
        setIllisible(true);
        return;
      }
      setIllisible(false);
      setSoumise(valeur);
      onValider(choixFinal, valeur);
      return;
    }
    onValider(choixFinal);
  }
  return (
    <div>
      {commun.enTete}
      <p className="prompt-text">
        <RenduFragments fragments={commun.consigne} />
      </p>
      <div className="options-liste-verticale">
        {bouton(LIBELLE_FAMILLE_LIMITE.limiteReelle, principal === "limiteReelle", () => choisir("limiteReelle"))}
        {principal === "limiteReelle" && (
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={formatBlocDonneesEgalLatex(exercice)} block />
            </label>
            <input
              type="text"
              className={`text-input${illisible ? " is-erronee" : ""}`}
              value={valeur}
              disabled={!!commun.validation}
              autoComplete="off"
              onChange={(e) => {
                setValeur(normaliserSigneMoins(e.target.value));
                setIllisible(false);
              }}
              placeholder="ex : 13/7"
            />
          </div>
        )}
        {bouton(LIBELLE_FAMILLE_LIMITE.limiteInfiniePoint, principal === "limiteInfiniePoint", () => choisir("limiteInfiniePoint"))}
        {bouton("Forme indéterminée", principal === ID_INDETERMINEE, () => choisir(ID_INDETERMINEE))}
        {principal === ID_INDETERMINEE && (
          <div className="options-grid-compact">
            {OPTIONS_RECONNAISSANCE_INDETERMINEE.map((o) => (
              <button key={o.id} type="button" className={sousChoix === o.id ? "btn toggle-active" : "btn"} aria-pressed={sousChoix === o.id} disabled={!!commun.validation} onClick={() => setSousChoix(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <PiedEcranFonctions
        aides={commun.aides}
        niveauAide={commun.niveauAide}
        niveauAideMax={commun.niveauAideMax}
        onActiverAide={commun.onActiverAide}
        onValider={valider}
        vide={vide}
        illisible={illisible}
        texteIllisible={nombreIllisible(valeur) ? MESSAGES_ILLISIBLE_LIMITES.nombre : MESSAGES_ILLISIBLE_LIMITES.approchee}
        tentativesUtilisees={commun.tentativesUtilisees}
        tentativesMax={commun.tentativesMax}
        cible={soumise !== null && commun.tentativesUtilisees > 0 ? cibleLimite(exercice, "reconnaissance", [soumise]) : null}
        validation={commun.validation}
      />
    </div>
  );
}
