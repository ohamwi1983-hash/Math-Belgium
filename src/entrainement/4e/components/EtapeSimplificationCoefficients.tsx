import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import type { StatutVerification } from "../moteur/statutVerification";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  /** Aides à 2 niveaux (KaTeX) fournies par l'appli — remplacent l'aide historique à 1 niveau. */
  aides?: FragmentConsigne[][];
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (jamais la réponse). */
  messageCible?: (valeur: string) => FragmentConsigne[] | null;
  onValider: (reponse: string) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "simplification" du générateur "Second degré — méthode la plus rapide" (gen1, nouvelle,
 * précède désormais l'isolement/la reconnaissance quand pgcd(|a|,|b|,|c|) > 1, ex. 2x²-10x=0) —
 * toujours la toute première étape de l'exercice quand elle a lieu (voir phaseInitiale dans
 * moteur/session.ts), donc jamais de RecapitulatifPanel ni d'EtatActuelPanel ici : rien n'a encore
 * été confirmé (même principe que l'absence historique de ces blocs sur EtapeIsolement quand elle
 * ouvre l'exercice). Nom distinct d'`EtapeSimplification.tsx` (générateur "L'inconnue au
 * dénominateur", simplification d'une FRACTION à deux champs numérateur/dénominateur — contrat
 * totalement différent) pour ne pas créer de collision de nom entre deux générateurs indépendants.
 */
export function EtapeSimplificationCoefficients({
  tentativesUtilisees,
  tentativesMax,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  aides,
  messageCible,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const saisie = useTentativeLisible<string>();

  return (
    <div>
      <p className="prompt-text">Simplifie cette équation au maximum (coefficients entiers, sans facteur commun).</p>
      <ApercuExpressionLatex texte={reponse} label="Équation simplifiée :" />
      <div className="field">
        <label className="field-label" htmlFor="simplification-coefficients">
          Équation simplifiée
        </label>
        <input
          id="simplification-coefficients"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
          {aides ? (
            <AidesNiveaux aides={aides} onPremiereAide={onActiverAide} />
          ) : (
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>
                  Cherche le plus grand diviseur commun aux trois coefficients, puis divise toute l'équation par ce
                  nombre.
                </p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          )}
          <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => saisie.tenter(reponse, diagnostiquer(reponse) !== "parse_error", onValider)}>
            Valider
          </button>
          <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={saisie.soumise !== null ? messageCible?.(saisie.soumise) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
