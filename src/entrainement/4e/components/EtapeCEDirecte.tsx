import { useState } from "react";
import type { ExerciceSimplification } from "../core/simplification.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { FractionHeader } from "./FractionHeader";
import { Katex } from "./Katex";

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
   * Remplace le libellé par défaut du bouton "aucune valeur" ("Pas de CE") — ex: "Pas de racine"
   * pour l'écran "Racine du numérateur" de l'exercice "Inéquations rationnelles"
   * (promptcorrectionsgenerateurs76complement.md, point 2.1 : "CE" ne désigne jamais une racine du
   * numérateur, seulement une valeur interdite du dénominateur). Absent par défaut : comportement
   * inchangé pour tous les autres appelants (écrans de CE genuine).
   */
  libellePasDe?: string;
  /** Remplace le libellé par défaut du bouton "au moins une valeur" ("Au moins une CE") — même principe que libellePasDe. */
  libelleAuMoins?: string;
  onValider: (reponse: string) => void;
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
  libellePasDe = "Pas de CE",
  libelleAuMoins = "Au moins une CE",
  onValider,
}: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [reponse, setReponse] = useState("");

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
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : expressionAffichee !== undefined ? (
        <div className="equation-box">
          <Katex expression={expressionAffichee} block />
        </div>
      ) : (
        <FractionHeader exercice={exercice as ExerciceSimplification} />
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
          <input id="ce-directe" className="text-input" value={reponse} onChange={(e) => setReponse(e.target.value)} />
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!peutValider}
        onClick={() => valeurSoumise !== null && onValider(valeurSoumise)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
