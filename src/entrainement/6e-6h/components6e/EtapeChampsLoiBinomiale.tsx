import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatLoiBinomiale";
import { BoutonAide } from "./BoutonAide";

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
 * Écran GÉNÉRIQUE à N champs (texte libre ET/OU choix) pour `6gen50` — RÉUTILISE le patron DÉJÀ
 * CORRIGÉ de `EtapeChampsBinomialeSequenceOrdonnee.tsx` (6gen48, lui-même fixé après la revue de
 * `6gen44`) : chaque champ est TOUJOURS rendu dans un `.field` empilé (label AU-DESSUS du champ,
 * JAMAIS `.field-inline`) — nécessaire ici en particulier pour la checklist à 4 conditions de la
 * famille A écran 2 (4 champs `choix` SIMULTANÉS, chacun avec une phrase-label complète) et pour le
 * champ "interprétation de E(X)" de la famille B (options elles-mêmes des phrases longues) :
 * `.field-inline` déborde sur mobile dès qu'un label descriptif long est placé À CÔTÉ du champ
 * (`white-space: nowrap` interne) — voir CLAUDE.md, retour de revue `6gen44`. `.field` seul (label
 * empilé) ne peut jamais déborder horizontalement quelle que soit la longueur du label — voir
 * `App.css`. `champs: ChampDef[]` (`ui6e/formatLoiBinomiale.ts`) pilote entièrement le rendu — AUCUN
 * JSX par famille/écran dans ce composant. Structure d'écran imposée par CLAUDE.md (consigne
 * générale → bloc données → état actuel → bloc de travail) conservée à l'identique. À rendre avec
 * `key={`${generationId}-${phase}`}` par `App6gen50.tsx` parent (jamais `phase` seul — voir
 * `generationId`, `moteur6e/typesLoiBinomiale.ts`).
 */
/** Candidat à l'aperçu LaTeX en direct (`ApercuExpressionLatex`) : le placeholder montre un calcul
 * (fraction, opérateur, formule) — jamais une simple valeur numérique isolée (la grande majorité des
 * champs de ce générateur attendent une probabilité déjà réduite à un nombre). */
function champComporteCalcul(placeholder: string | undefined): boolean {
  if (!placeholder) return false;
  const corps = placeholder.replace(/^ex\s*:\s*/i, "").trim();
  if (corps === "" || /^[a-zA-Z]$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*\([^)]*\))?$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*,\s*-?\d+([.,]\d+)?)+$/.test(corps)) return false;
  return true;
}

export function EtapeChampsLoiBinomiale({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      {champs.map((champ, i) => (champComporteCalcul(champ.placeholder) ? <ApercuExpressionLatex key={i} texte={valeurs[i]} label={champ.label} /> : null))}
      {champs.map((champ, i) =>
        champ.type === "choix" ? (
          <div className="field" key={i}>
            <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
            <div className="options-grid">
              {(champ.options ?? []).map((option) => (
                <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="field" key={i}>
            <label className={`field-label ${champ.minuscule ? "field-label-minuscule" : ""}`}>{champ.label}</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        ),
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
        <div className="aide-5e contenu-conditionnel">
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
