import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ExerciceSimplification } from "../core/simplification.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { FractionHeader } from "./FractionHeader";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux, MESSAGE_BORNE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";

type Choix = "pasDe" | "auMoins";

/** Réponse toujours rejetée par verifierCEDirecte (Number.isFinite renvoie false) — jamais la
 * bonne réponse pour cet écran (un P1 a toujours exactement une racine), mais garde le contrat
 * onValider(reponse: string) inchangé (exercices 3 et 4). */
const REPONSE_PAS_DE_CE = "aucune";

interface Props {
  /** Requis sauf si expressionAffichee est fourni (voir plus bas) — sert uniquement au FractionHeader par défaut. */
  exercice?: ExerciceSimplification;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace le FractionHeader par défaut — ex: "A/(x-p) = x-q" pour "L'inconnue au dénominateur". */
  expressionAffichee?: string;
  /** Remplace la question par défaut. */
  question?: string;
  /** Remplace le libellé par défaut ("Condition d'existence (CE)"). */
  label?: string;
  /**
   * Bloc "Énoncé" fixe (générateur 6, restructuration en 3 blocs) — absent par défaut :
   * comportement inchangé. Fourni : `expressionAffichee`/`FractionHeader` par défaut passe en
   * second bloc, omis automatiquement s'il duplique `enonceFixe` (voir EtapeIsolement.tsx).
   */
  enonceFixe?: string;
  /**
   * Masque le bloc "énoncé" local (enonceFixe / expressionAffichee / FractionHeader) —
   * absent/false par défaut : comportement historique inchangé. `true` : l'appelant affiche déjà
   * cette donnée de façon centralisée (`EnTeteExercice`, blocDonnees) et ce bloc serait redondant
   * ici.
   */
  masquerBlocDonnees?: boolean;
  /**
   * Remplace le libellé par défaut du bouton "aucune valeur" ("Pas de CE") — ex: "Pas de racine"
   * pour l'écran "Racine du numérateur" de l'exercice "Inéquations rationnelles"
   * (promptcorrectionsgenerateurs76complement.md, point 2.1 : "CE" ne désigne jamais une racine du
   * numérateur, seulement une valeur interdite du dénominateur). Absent par défaut : comportement
   * inchangé pour tous les autres appelants (écrans de CE genuine).
   */
  libellePasDe?: string;
  /** Remplace le libellé par défaut du bouton "au moins une valeur" ("Au moins une CE") — même principe que libellePasDe. */
  libelleAuMoins?: string;
  /** Aides à 2 niveaux (KaTeX). */
  aides?: FragmentConsigne[][];
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Une seule condition d'existence — réutilisé par "Simplifier" (type P2/P1) et "L'inconnue au
 * dénominateur". Reprend le pattern "Pas de.../Au moins un(e)..." déjà utilisé ailleurs dans le
 * projet pour les zéros (prompt-generateurs123groupe.md, générateur 3, point 1), pour une
 * interface cohérente avec les autres écrans de construction de CE/zéros — même si "Pas de CE"
 * n'est jamais la bonne réponse ici (un P1 a toujours exactement une racine). Le contrat
 * onValider(reponse: string) reste inchangé : une seule valeur numérique est toujours transmise,
 * aucune adaptation nécessaire côté moteur (exercices 3 et 4).
 */
export function EtapeCEDirecte({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  question,
  label,
  enonceFixe,
  masquerBlocDonnees = false,
  libellePasDe = "Pas de CE",
  libelleAuMoins = "Au moins une CE",
  aides,
  onValider,
  validation,
}: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [reponse, setReponse] = useState("");
  const saisie = useTentativeLisible<string>();

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setReponse("");
  }

  const valeurSoumise = choix === "pasDe" ? REPONSE_PAS_DE_CE : choix === "auMoins" ? reponse : null;
  const nombreSaisi = Number(reponse.trim().replace(",", "."));
  const peutValider = choix === "pasDe" || (choix === "auMoins" && reponse.trim() !== "" && Number.isFinite(nombreSaisi));

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {enonceFixe !== undefined ? (
        <>
          {!masquerBlocDonnees && (
            <div className="equation-box">
              <Katex expression={enonceFixe} block />
            </div>
          )}
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : expressionAffichee !== undefined ? (
        !masquerBlocDonnees && (
          <div className="equation-box">
            <Katex expression={expressionAffichee} block />
          </div>
        )
      ) : (
        !masquerBlocDonnees && <FractionHeader exercice={exercice as ExerciceSimplification} />
      )}
      <p className="prompt-text">{question ?? "Quelle est la condition d'existence ?"}</p>
      <div className="options-grid">
        <button type="button" className={choix === "pasDe" ? "btn toggle-active" : "btn"} onClick={() => choisir("pasDe")}>
          {libellePasDe}
        </button>
        <button type="button" className={choix === "auMoins" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoins")}>
          {libelleAuMoins}
        </button>
      </div>

      {choix === "auMoins" && (
        <div className="field contenu-conditionnel">
          <label className="field-label" htmlFor="ce-directe">
            {label ?? "Condition d'existence (CE)"}
          </label>
          <input id="ce-directe" className="text-input" value={reponse} onChange={(e) => setReponse(normaliserSigneMoins(e.target.value))} />
        </div>
      )}

      {!validation && (
        <>
        {aides && <AidesNiveaux aides={aides} />}
        <button
          type="button"
          className="btn btn-primary"
          disabled={choix === null || (choix === "auMoins" && reponse.trim() === "")}
          onClick={() => valeurSoumise !== null && saisie.tenter(valeurSoumise, peutValider, onValider)}
        >
          Valider
        </button>
        <MessageRetour texteIllisible={MESSAGE_BORNE_ILLISIBLE} illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
