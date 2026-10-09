import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatNombresComplexes";
import { BoutonAide } from "./BoutonAide";

/** Vrai si le placeholder NE représente PAS un simple nombre isolé (entier/décimal, signe
 * optionnel) — distingue un champ toujours réel par construction (ex. "Reste (mod 4) =", un entier
 * 0-3, jamais une expression) d'un champ complexe/composé. "Résultat ="/"Numérateur ="/
 * "Dénominateur =" sont TOUJOURS considérés composés même quand le placeholder d'exemple est un
 * réel pur (ex. "Dénominateur =" après multiplication par le conjugué, toujours réel, placeholder
 * "ex : 13" ; familles E/F de "Résultat =", "ex : 2"/"ex : -1") — ces 3 champs restent conceptuellement
 * des NOMBRES COMPLEXES à écrire sous forme a+bi (une expression), même quand le résultat réel de
 * l'exercice s'avère purement réel — CLAUDE.md, règle de câblage `ApercuExpressionLatex`. */
function champEstCompose(champ: ChampDef): boolean {
  if (champ.label === "Résultat =" || champ.label === "Numérateur =" || champ.label === "Dénominateur =") return true;
  const valeur = (champ.placeholder ?? "").replace(/^ex\s*:\s*/i, "").trim();
  return valeur !== "" && !/^-?\d+([.,]\d+)?$/.test(valeur);
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  champs: ChampDef[];
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
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 2) pour `6gen34` — mirroir `EtapeChampsLongueurArc.tsx`
 * (6gen28) : tous les écrans de ce générateur sont de la saisie libre (jamais de QCM), donc la
 * version SIMPLE (texte uniquement) suffit. `champs: ChampDef[]` (voir `ui6e/
 * formatNombresComplexes.ts`) pilote entièrement le rendu. Structure d'écran imposée par CLAUDE.md
 * (consigne générale → bloc données → état actuel → bloc de travail) conservée à l'identique.
 * `App6gen34.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeChampsNombresComplexes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
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
      {champs.map((champ, i) => champEstCompose(champ) && <ApercuExpressionLatex key={i} texte={valeurs[i]} label={champ.label} />)}
      {/* `field-row-wrap` (flex-wrap, déjà établi ailleurs sur la plateforme — voir sa définition
       * dans `App.css`) dès 2 champs INDÉPENDANTS côte à côte : sans lui, 2 `.field-inline` (label +
       * `.text-input`) se compressent au point de rendre le champ illisible sur un viewport étroit
       * (375px) et même sur desktop avec des labels un peu longs — bug trouvé par inspection
       * visuelle réelle sur ce générateur (familles C/E, 2 champs), même classe déjà documentée pour
       * 6gen30/32/33 (CLAUDE.md, "Débordement horizontal"). Avec `flex-wrap: wrap`, chaque champ
       * passe naturellement à la ligne suivante dès qu'il manque de place, à n'importe quel
       * viewport. */}
      <div className={`field-row ${champs.length > 1 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) => (
          <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
            <label className="field-label field-label-minuscule">{champ.label}</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        ))}
      </div>
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
