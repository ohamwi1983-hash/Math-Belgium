import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, ChoixDef } from "../ui6e/formatTrianglesComplexes";
import { BoutonAide } from "./BoutonAide";

/** Vrai si le placeholder NE représente PAS un simple nombre isolé (entier/décimal, signe
 * optionnel) — distingue une longueur/angle toujours réel-entier (ex. "AB =", "OA =", placeholder
 * "5" ; "Angle en O (°) =") d'un champ composé (ex. "AO ="/"AB ="/"AF =" de la famille C, écran 2,
 * placeholder "sqrt(3)" — MÊME label "AB =" que la famille A, mais composé ici ; "Angle θ =",
 * "Multiplicateur ="). CLAUDE.md, règle de câblage `ApercuExpressionLatex`. */
function champEstCompose(placeholder?: string): boolean {
  const valeur = (placeholder ?? "").replace(/^ex\s*:\s*/i, "").trim();
  return valeur !== "" && !/^-?\d+([.,]\d+)?$/.test(valeur);
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  champs: ChampDef[];
  choix: ChoixDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

/**
 * Écran GÉNÉRIQUE pour `6gen41` — combine 0-3 champs texte libre ET 0-4 boutons de choix
 * (`.btn.toggle-active`, jamais `.btn-primary` — CLAUDE.md) sur un même écran, avec un SEUL bouton
 * "Valider" pour l'ensemble (les 2 groupes sont vérifiés ENSEMBLE, un seul statut combiné). La
 * quasi-totalité des écrans de ce générateur n'utilisent que l'un OU l'autre (mirroir
 * `EtapeChampsFormeTrigonometrique.tsx`/`EtapeChoixCongruenceFormeTrigonometrique.tsx`, 6gen37) —
 * SEULE la famille C écran 2 combine les deux (3 distances + 1 choix de conclusion), d'où ce
 * composant unique plutôt que 2 composants séparés. Structure d'écran imposée par CLAUDE.md
 * (consigne générale → bloc données → état actuel → bloc de travail) conservée à l'identique.
 * `App6gen41.tsx` doit le rendre avec `key={phase}`.
 *
 * `valeurs` transmises à `diagnostiquer`/`onValider` = `[...champsTexte, choixSélectionné?]` — le
 * choix (s'il existe) occupe TOUJOURS le DERNIER slot du tableau, convention partagée avec
 * `moteur6e/verificationTrianglesComplexes.ts` (`diagnostiquerCEcran2`, `valeurs[3]`).
 */
export function EtapeTrianglesComplexes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, choix, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeursTexte, setValeursTexte] = useState<string[]>(() => champs.map(() => ""));
  const [choixSelectionne, setChoixSelectionne] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valeursCompletes(): string[] {
    return choix.length > 0 ? [...valeursTexte, choixSelectionne ?? ""] : valeursTexte;
  }

  const dernierStatut = montrerErreurs ? diagnostiquer(valeursCompletes()) : null;
  const texteRempli = valeursTexte.every((v) => v.trim() !== "");
  const choixFait = choix.length === 0 || choixSelectionne !== null;
  const toutRempli = texteRempli && choixFait;

  function valider() {
    if (!toutRempli) return;
    onValider(valeursCompletes());
  }

  function changerTexte(index: number, valeur: string) {
    setValeursTexte((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      {champs.map((champ, i) => champEstCompose(champ.placeholder) && <ApercuExpressionLatex key={i} texte={valeursTexte[i]} label={champ.label} />)}
      {champs.length > 0 && (
        <div className={`field-row ${champs.length > 1 ? "field-row-wrap" : ""}`}>
          {champs.map((champ, i) => (
            <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeursTexte[i]} placeholder={champ.placeholder} onChange={(e) => changerTexte(i, e.target.value)} />
            </div>
          ))}
        </div>
      )}
      {choix.length > 0 && (
        <div className={champs.length > 0 ? "options-grid-compact contenu-conditionnel" : "options-grid-compact"}>
          {choix.map((option) => (
            <button key={option.id} type="button" className={`btn ${choixSelectionne === option.id ? "toggle-active" : ""} ${montrerErreurs && choixSelectionne === option.id ? "is-erronee" : ""}`} onClick={() => setChoixSelectionne(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
