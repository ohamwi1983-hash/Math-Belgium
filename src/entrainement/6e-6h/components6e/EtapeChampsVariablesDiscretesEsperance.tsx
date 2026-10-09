import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatVariablesDiscretesEsperance";
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
 * Écran GÉNÉRIQUE à N champs (texte libre ET/OU choix) pour `6gen49` — mirroir
 * `EtapeChampsDenombrementFondamental.tsx` (6gen43) : `champ.type==="choix"` rend des boutons
 * `.btn.toggle-active` (jamais `.btn-primary`, réservé à "Valider"), tous les autres écrans
 * passent par des champs texte libre (y compris les tables famille B/C, un `ChampDef` texte par
 * cellule). `champs: ChampDef[]` (`ui6e/formatVariablesDiscretesEsperance.ts`) pilote entièrement
 * le rendu — AUCUN JSX par famille/écran dans ce composant.
 *
 * **Champ `"choix"` — TOUJOURS `.field` empilé, JAMAIS `.field-inline`** (leçon dure de la review
 * `6gen44`, rappelée par la mission de `6gen49`) : `.field-inline .field-label` force
 * `white-space:nowrap`, un libellé long déborde un viewport mobile avant même que le groupe de
 * boutons ne soit mesuré — s'applique QUEL QUE SOIT le nombre de champs `"choix"` sur l'écran (ici
 * un seul, famille A écran 3 "contraires ?"), pas seulement à partir de 2. Les champs `"texte"`
 * gardent `.field-inline` dès que `champs.length>1` (tables à plusieurs colonnes, lisibilité).
 *
 * **Champ `"texte"` en table (familles B/C) — libellés COURTS + `flexWrap:"wrap"` en filet de
 * sécurité** : bug RÉELLEMENT rencontré en vérification Playwright (375px, famille C "imposer",
 * libellés composés du type "Carte numérotée — gain net (en fonction de m) =") — `.field-inline`
 * n'a, par défaut, aucun `flex-wrap` (contrairement à `.field-row-wrap`), donc un libellé composé
 * (`${issue.label} — ... =`) pouvait dépasser 375px et faire déborder la PAGE entière (pas
 * seulement `.equation-box`, qui a son propre filet `overflow-x:auto`). Fix à 2 niveaux : (1)
 * libellés raccourcis côté `ui6e/formatVariablesDiscretesEsperance.ts` ("— net(m) =" plutôt que "—
 * gain net (en fonction de m) =") ; (2) `flexWrap:"wrap"` en style inline sur `.field-inline` QUAND
 * `champs.length>1` (mirroir du fix n°4 de `6gen51` pour les champs `"choix"`), scopé à CE composant
 * uniquement — filet de sécurité si un futur libellé redevient trop long.
 */
/** Candidat à l'aperçu LaTeX en direct (`ApercuExpressionLatex`) : le placeholder montre un calcul
 * (fraction, formule en fonction de m) — jamais une simple valeur numérique isolée. */
function champComporteCalcul(placeholder: string | undefined): boolean {
  if (!placeholder) return false;
  const corps = placeholder.replace(/^ex\s*:\s*/i, "").trim();
  if (corps === "" || /^[a-zA-Z]$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*\([^)]*\))?$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*,\s*-?\d+([.,]\d+)?)+$/.test(corps)) return false;
  return true;
}

export function EtapeChampsVariablesDiscretesEsperance({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      <div className={`field-row ${champs.length > 1 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) =>
          champ.type === "choix" ? (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <div className="options-grid">
                {(champ.options ?? []).map((option) => (
                  <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={champs.length > 1 ? "field field-inline" : "field"} style={champs.length > 1 ? { flexWrap: "wrap" } : undefined} key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          ),
        )}
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
