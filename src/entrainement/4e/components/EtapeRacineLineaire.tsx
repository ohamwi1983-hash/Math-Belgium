import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { AidesNiveaux, MESSAGE_BORNE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { lireNombreSaisi } from "../ui/lireNombre";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Le facteur linéaire isolé courant, ex. "3x + 3 = 0" (encadré "état actuel"). */
  etatActuel: string;
  /** Remplace le libellé « État actuel » (gen5 : « Facteur à étudier »). */
  etatActuelLabel?: string;
  /** Aides à 2 niveaux (KaTeX). */
  aides?: FragmentConsigne[][];
  onValider: (racine: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "Racine (facteur linéaire)" (promptgenerateur5signesProduit.md, point 10) : un facteur
 * linéaire donné tel quel n'a rien à factoriser, mais l'élève doit tout de même calculer sa racine
 * explicitement avant qu'elle n'apparaisse dans le tableau de signes — jusqu'ici sautée à tort.
 * Un seul champ (toujours exactement une racine pour un facteur du 1er degré, jamais le pattern
 * "Pas de/Au moins un(e)" réservé aux cas à cardinalité variable) — champ purement numérique, hors
 * périmètre "parse_error" (AUDIT-comparaison-reponses.md) : le bouton reste désactivé tant que la
 * saisie n'est pas un nombre fini, empêchant toute soumission invalide plutôt que d'afficher un
 * message dédié.
 */
export function EtapeRacineLineaire({
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  etatActuel,
  etatActuelLabel,
  aides,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const saisie = useTentativeLisible<number>();

  const lu = lireNombreSaisi(reponse);
  const nombreSaisi = lu ?? NaN;
  const valide = lu !== null;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <EtatActuelPanel latex={etatActuel} label={etatActuelLabel} />
      <p className="prompt-text">Quelle est la racine de ce facteur ?</p>
      <div className="field">
        <label className="field-label" htmlFor="racine-lineaire">
          Racine
        </label>
        <input
          id="racine-lineaire"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
        {aides && <AidesNiveaux aides={aides} />}
        <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => saisie.tenter(nombreSaisi, valide, onValider)}>
          Valider
        </button>
        <MessageRetour texteIllisible={MESSAGE_BORNE_ILLISIBLE} illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
