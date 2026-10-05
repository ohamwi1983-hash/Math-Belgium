import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { formatPolynome } from "../ui/formatSimplification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  /** Un P2 (gen1/gen2/gen3/gen4/gen5/gen6) ou un P1 (gen3 "Simplifier", `{k,p}` — gen3 image 6/7
   * du prompt du 27/09 : mise en évidence de son facteur commun entier, comme pour un P2). */
  exercice: Exercice | PolynomeLineaire;
  /** Nom du polynôme affiché à l'élève, ex. "dénominateur"/"numérateur" — minuscule, sans article. */
  nom: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Récapitulatif des étapes déjà closes (RecapitulatifPanel) — absent par défaut : rien de rendu,
   * comportement historique inchangé pour gen1-4 (jamais de contexte multi-étapes plus large à
   * cet endroit). Fourni par gen5/gen6 (exercice à plusieurs facteurs/polynômes). */
  recapitulatif?: EntreeRecapitulatif[];
  /** Version "bloc fitter" (un fragment KaTeX par élément atomique, ex. un facteur parenthésé pour
   * "Tableau de signes à plusieurs facteurs") de l'expression affichée — prioritaire sur le simple
   * `formatPolynome(exercice)` quand fourni ; absent par défaut, comportement historique inchangé. */
  expressionAfficheeTermes?: string[];
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) — absent/null par défaut :
   * rien de rendu. */
  etatActuel?: string | null;
  /**
   * Préfixe LaTeX devant l'expression affichée par défaut (ex. "D(x)"/"N(x)" pour le numérateur/
   * dénominateur d'une fraction rationnelle, gen3) — absent par défaut : bloc rendu nu, comme avant
   * ce prop. Sans effet si `expressionAfficheeTermes` est fourni (déjà son propre rendu "bloc
   * fitter"). Bug utilisateur du 27/09 : ce bloc, contrairement à celui des écrans qui suivent
   * (denomReconnaissance/denomChamp1/..., via formatEquationDenominateur/Numerateur), affichait le
   * polynôme sans jamais nommer explicitement D(x)/N(x).
   */
  prefixeExpression?: string;
  /**
   * "reduction" (défaut, comportement historique inchangé — gen1/gen2/gen5/gen6 hors facteurCommun) :
   * le polynôme est un côté d'une équation/inéquation "...◇0", où diviser tout par le facteur commun
   * ne change ni les racines ni le signe — la consigne demande donc de RÉDUIRE (diviser).
   * "miseEnEvidence" (gen3, gen4 fractionGauche, gen6 facteurCommun) : le polynôme est le
   * numérateur/dénominateur d'une FRACTION dont la valeur doit rester exactement celle de
   * l'énoncé — diviser SEULEMENT ce polynôme changerait cette valeur (bug confirmé empiriquement,
   * capture d'écran utilisateur du 26/09 : (x+4)/(2x²-4x-48) affiché, à l'écran suivant, comme
   * (x+4)/(x²-2x-24) — une fraction différente). La consigne demande donc de mettre le facteur
   * commun EN ÉVIDENCE (visible, jamais divisé) — voir
   * moteur/verificationSimplification.ts::diagnostiquerMiseEnEvidenceFraction, qui exige une
   * réponse de la forme "k(...)" plutôt qu'un polynôme divisé par k.
   */
  variante?: "reduction" | "miseEnEvidence";
}

/**
 * Étape de réduction (ou de mise en évidence du facteur commun, voir `variante`) des coefficients
 * d'UN polynôme du 2nd degré (numérateur OU dénominateur d'une fraction rationnelle, un facteur
 * d'un produit, etc.) — même principe que EtapeSimplificationCoefficients (gen1) /
 * EtapeSimplificationInequation (gen2), mais jamais de "=0" ici : un numérateur/dénominateur/
 * facteur seul n'est pas une équation (voir formatPolynome, ui/formatSimplification.ts, "sans =0
 * contrairement à formatEnonceLatex"). Réutilise directement moteur/simplificationEquation.ts
 * (necessiteSimplification) et moteur/verificationSimplification.ts
 * (diagnostiquerReductionCoefficients/diagnostiquerMiseEnEvidenceFraction selon `variante`) — même
 * contrat Exercice que gen1 (Couche B ↔ Couche B, autorisé par CLAUDE.md). Composant générique
 * partagé par gen3/gen4/gen5/gen6 (chacun a plusieurs polynômes par exercice, contrairement à
 * gen1/gen2) : `nom` distingue "dénominateur"/"numérateur"/etc. dans le prompt et le libellé du
 * champ.
 */
export function EtapeReductionCoefficients({
  exercice,
  nom,
  tentativesUtilisees,
  tentativesMax,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  onValider,
  recapitulatif,
  expressionAfficheeTermes,
  etatActuel,
  variante = "reduction",
  prefixeExpression,
}: Props) {
  const [reponse, setReponse] = useState("");
  const nomCapitalise = nom.charAt(0).toUpperCase() + nom.slice(1);
  const libelleChamp = variante === "miseEnEvidence" ? `${nomCapitalise} mis en évidence` : `${nomCapitalise} réduit`;

  return (
    <div>
      {recapitulatif !== undefined && <RecapitulatifPanel entrees={recapitulatif} />}
      {expressionAfficheeTermes !== undefined ? (
        <div className="equation-box equation-box-termes">
          {expressionAfficheeTermes.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      ) : (
        <div className="equation-box">
          <Katex
            expression={prefixeExpression !== undefined ? `${prefixeExpression} = ${formatPolynome(exercice)}` : formatPolynome(exercice)}
            block
          />
        </div>
      )}
      {etatActuel !== undefined && <EtatActuelPanel latex={etatActuel} />}
      <p className="prompt-text">
        {variante === "miseEnEvidence"
          ? `Mets ce ${nom} en évidence : fais apparaître un facteur commun entier (le plus grand possible) devant une parenthèse à coefficients premiers entre eux.`
          : `Simplifie ce ${nom} au maximum (coefficients entiers, sans facteur commun).`}
      </p>
      <ApercuExpressionLatex texte={reponse} label={`${libelleChamp} =`} />
      <div className="field">
        <label className="field-label" htmlFor="reduction-coefficients">
          {libelleChamp}
        </label>
        <input
          id="reduction-coefficients"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </div>
      <div>
        {aideActivee && (
          <p className="prompt-text">
            {variante === "miseEnEvidence"
              ? "Cherche le plus grand diviseur commun aux trois coefficients, puis mets-le en évidence devant une parenthèse — ne divise jamais le polynôme par ce nombre, il doit rester visible en facteur."
              : "Cherche le plus grand diviseur commun aux trois coefficients, puis divise tout le polynôme par ce nombre."}
          </p>
        )}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
      </div>
      <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer(reponse))}
        </p>
      )}
    </div>
  );
}
