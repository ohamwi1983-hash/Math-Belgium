import { useState } from "react";
import type { Categorie, Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { StatutVerification } from "../moteur/statutVerification";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace l'expression affichée par défaut (ax²+bx+c=0) — ex: "D(x) = ..." pour "Simplifier". */
  expressionAffichee?: string;
  /** Version "bloc fitter" de `expressionAffichee` (`promptblocfittertousgenerateurs.md`) — un
   * fragment KaTeX par élément atomique (ex. un facteur parenthésé pour "Tableau de signes à
   * plusieurs facteurs") plutôt qu'une seule chaîne, pour un retour à la ligne propre sur mobile
   * étroit. Prioritaire sur `expressionAffichee` quand fourni ; absent par défaut, comportement
   * historique inchangé pour tous les autres appelants. */
  expressionAfficheeTermes?: string[];
  /** Remplace le libellé par défaut ("Factorise l'équation") — ex: "Factorise ce dénominateur"/"Factorise ce numérateur" pour "Simplifier". */
  labelFactorisation?: string;
  /**
   * Force le libellé de factorisation même pour cas_general, en bypassant le "Δ =" habituel —
   * utilisé par la nouvelle étape "Factorisation" qui suit Δ et les racines pour cette catégorie
   * (prompt-corrections-moteur-partage.md, point 3). Absent/false par défaut : comportement
   * historique inchangé pour tous les autres appelants (champ1 de cas_general reste "Δ =").
   */
  etapeFactorisationForcee?: boolean;
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  /** Remplace le libellé par défaut ("État actuel") du bloc ci-dessus — voir EtatActuelPanel. */
  etatActuelLabel?: string;
  /**
   * Bloc "Énoncé" fixe (générateur 6, restructuration en 3 blocs) — absent par défaut :
   * comportement historique inchangé. Fourni : 3 blocs empilés (enonceFixe → EtatActuelPanel →
   * expressionAffichee, ce dernier omis s'il duplique enonceFixe) — voir EtapeIsolement.tsx.
   */
  enonceFixe?: string;
  /**
   * Statut à 3 valeurs (convention CLAUDE.md) — fournit le diagnostic correspondant au champ
   * verifié pour CE contexte d'appel précis (`diagnostiquerChampPrincipal` ou
   * `diagnostiquerFactorisationCasGeneral` selon l'étape, voire un diagnostic propre à un autre
   * exercice qui réutilise ce composant). Absent par défaut : message générique inchangé, comme
   * avant l'introduction de ce statut.
   */
  diagnostiquer?: (valeur: string) => StatutVerification;
  /**
   * Aide à sens unique (1 seul niveau, ×0,5 sur le score) — absente par défaut : aucun bouton
   * rendu (comportement historique inchangé pour les appelants qui ne fournissent pas
   * `onActiverAide`, ex. le générateur "Analyse d'une fonction du second degré" qui réutilise ce
   * composant hors du périmètre de conceptionaidescomposantspartageshistorique.md).
   */
  aideActivee?: boolean;
  onActiverAide?: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Rappel de méthode pour l'aide (1 seul niveau, ×0,5 sur le score) — calculé depuis
 * `exercice.categorie`, jamais fourni par l'appelant : le même rappel s'applique partout où
 * `EtapeChamp1` est réutilisé (conceptionaidescomposantspartageshistorique.md, point 4).
 */
function texteAideChamp1(categorie: Categorie): string {
  switch (categorie) {
    case "mise_en_evidence":
      return "Sors le facteur commun de chaque terme.";
    case "mise_en_evidence_generalisee":
      return "Sors le facteur commun de chaque terme (il peut s'agir d'une expression comme (x+p)).";
    case "binome_conjugue":
      return "Écris l'expression sous la forme (a−b)(a+b).";
    case "produit_remarquable":
      return "Identifie a et b tels que l'expression soit (a±b)².";
    case "cas_general":
      return "Calcule le discriminant Δ = b² − 4ac.";
    case "irreductible":
      return "Factorise l'expression.";
  }
}

export function EtapeChamp1({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  expressionAfficheeTermes,
  labelFactorisation,
  etapeFactorisationForcee = false,
  etatActuel,
  etatActuelLabel,
  enonceFixe,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [reponse, setReponse] = useState("");

  /**
   * Variante irrationnelle (mise_en_evidence/binome_conjugue/produit_remarquable) : depuis
   * prompt-generateurs123groupe.md, point 6, ce champ n'a plus de gabarit ni de label dédiés —
   * un vrai champ libre, exactement comme la variante rationnelle, où l'élève écrit la
   * factorisation complète radicaux compris (ex. "x(x+6*sqrt(5))=0"), vérifiée via
   * diagnostiquerChampPrincipal (verification.ts).
   */
  const estGabaritIrrationnel = exercice.irrationnel !== undefined && exercice.categorie !== "cas_general";
  const estLabelDelta = exercice.categorie === "cas_general" && !etapeFactorisationForcee;
  const label = estLabelDelta ? "Δ =" : (labelFactorisation ?? "Factorise l'équation");
  const placeholder = estGabaritIrrationnel ? "ex : x(x+6*sqrt(5))=0" : undefined;
  const statut = tentativesUtilisees > 0 ? diagnostiquer?.(reponse) : undefined;
  const expressionParDefaut =
    expressionAffichee ??
    formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {enonceFixe !== undefined ? (
        <>
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : expressionAfficheeTermes !== undefined ? (
        <>
          <div className="equation-box equation-box-termes">
            {expressionAfficheeTermes.map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      ) : (
        <>
          <div className="equation-box">
            <Katex expression={expressionParDefaut} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} label={etatActuelLabel} />
        </>
      )}
      {!estLabelDelta && <ApercuExpressionLatex texte={reponse} label={`${label} =`} />}
      <div className={estLabelDelta ? "field field-inline" : "field"}>
        <label className="field-label" htmlFor="champ-principal">
          {label}
        </label>
        <input
          id="champ-principal"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {onActiverAide && (
        <div>
          {aideActivee && <p className="prompt-text">{texteAideChamp1(exercice.categorie)}</p>}
          <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
        </div>
      )}
      <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
