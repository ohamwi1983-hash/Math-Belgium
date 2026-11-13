import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceChoisirModele, FamilleModele } from "../generateurs/choisirModele/types";
import { diagnostiquerExpression, egalNombre, libelleFonction, lireNombre, transformationsAttendues, verifierUtilisation, INFOS_CONTEXTE } from "../generateurs/choisirModele/modele";
import { FAMILLES, NOM_FAMILLE, REFERENCE_LATEX } from "../generateurs/choisirModele/textes";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

/**
 * Écrans de gen69 (« Choisir le bon modèle », `AppChoisirModele.tsx`). Chaque écran garde ses
 * saisies localement (remonté à chaque nouvel exercice par la `key` de l'appli) et remonte à
 * l'appli un verdict : `onResultat(correct, votreReponse)`. Une saisie illisible (nombre ou
 * expression) ne consomme aucune tentative.
 */

/** Texte et LaTeX mêlés ; une formule qui suit un texte terminé par « : » passe en bloc. */
export function RenduFragments({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((fr, i) => {
        if (fr.type === "texte") return <span key={i}>{fr.valeur}</span>;
        const precedent = fragments[i - 1];
        const bloc = precedent?.type === "texte" && precedent.valeur.trimEnd().endsWith(":");
        return <Katex key={i} expression={fr.valeur} block={bloc} />;
      })}
    </>
  );
}

interface PropsCommunes {
  exercice: ExerciceChoisirModele;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  aides: FragmentConsigne[][];
  onActiverAide: () => void;
  onResultat: (correct: boolean, votreReponse: ReactNode) => void;
  validation?: ValidationEtapeProps | null;
}

function BlocAides({ niveauAide, aides }: { niveauAide: number; aides: FragmentConsigne[][] }) {
  if (niveauAide === 0) return null;
  return (
    <div className="triangle-quelconque-aide">
      {/* <div> et non <p> : une formule en bloc (KaTeX) ne peut pas vivre dans un paragraphe. */}
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} style={{ margin: "0.35em 0" }}>
          <RenduFragments fragments={aide} />
        </div>
      ))}
    </div>
  );
}

function MessageTentative({ tentativesUtilisees, tentativesMax }: { tentativesUtilisees: number; tentativesMax: number }) {
  if (tentativesUtilisees === 0) return null;
  return (
    <p className="alert-error" role="alert">
      Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
    </p>
  );
}

function Pied({
  props,
  peutValider,
  onValider,
  erreurSaisie,
  message,
}: {
  props: PropsCommunes;
  peutValider: boolean;
  onValider: () => void;
  erreurSaisie?: string | null;
  message?: string | null;
}) {
  const { validation, niveauAide, aides, onActiverAide, tentativesUtilisees, tentativesMax } = props;
  return (
    <>
      <BlocAides niveauAide={niveauAide} aides={aides} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!peutValider} onClick={onValider}>
            Valider
          </button>
          {erreurSaisie ? (
            <p className="alert-error" role="alert">
              {erreurSaisie}
            </p>
          ) : message ? (
            <p className="alert-error" role="alert">
              {message}
            </p>
          ) : (
            <MessageTentative tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} />
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </>
  );
}

const MESSAGE_NOMBRE = "Écris un nombre : entier, décimal avec une virgule, ou fraction. Aucune tentative n'est comptée.";

// ---------------------------------------------------------------------------------------------
// Écran 1 — famille (choix fermé, une seule tentative)
// ---------------------------------------------------------------------------------------------

export function EtapeFamilleModele(props: PropsCommunes & { question: string }) {
  const { exercice, validation, onResultat } = props;
  const [choix, setChoix] = useState<FamilleModele | null>(null);
  return (
    <div>
      <p className="prompt-text">{props.question}</p>
      <div className="options-grid">
        {FAMILLES.map((famille) => (
          <button
            key={famille}
            type="button"
            disabled={!!validation}
            className={`btn${choix === famille ? " toggle-active" : ""}${validation && choix === famille && famille !== exercice.famille ? " is-erronee" : ""}`}
            onClick={() => setChoix(famille)}
          >
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span>{NOM_FAMILLE[famille]}</span>
              <Katex expression={REFERENCE_LATEX[famille]} />
            </span>
          </button>
        ))}
      </div>
      <Pied
        props={props}
        peutValider={choix !== null}
        onValider={() =>
          choix !== null &&
          onResultat(
            choix === exercice.famille,
            <>
              {NOM_FAMILLE[choix]} <Katex expression={REFERENCE_LATEX[choix]} />
            </>,
          )
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 2 — transformations (TH, TV, facteur vertical, symétrie)
// ---------------------------------------------------------------------------------------------

export function EtapeTransformationsModele(props: PropsCommunes & { question: string }) {
  const { exercice, validation, onResultat, tentativesUtilisees } = props;
  const [th, setTh] = useState("");
  const [tv, setTv] = useState("");
  const [facteur, setFacteur] = useState("");
  const [symetrie, setSymetrie] = useState<boolean | null>(null);
  const [erreurs, setErreurs] = useState<{ th: boolean; tv: boolean; facteur: boolean; symetrie: boolean } | null>(null);
  const [erreurSaisie, setErreurSaisie] = useState<string | null>(null);
  const attendu = transformationsAttendues(exercice);
  const complet = th.trim() !== "" && tv.trim() !== "" && facteur.trim() !== "" && symetrie !== null;

  function valider() {
    if (symetrie === null) return;
    if ([th, tv, facteur].some((s) => lireNombre(s) === null)) {
      setErreurSaisie(MESSAGE_NOMBRE);
      return;
    }
    setErreurSaisie(null);
    const e = { th: !egalNombre(th, attendu.th), tv: !egalNombre(tv, attendu.tv), facteur: !egalNombre(facteur, attendu.facteur), symetrie: symetrie !== attendu.symetrie };
    setErreurs(e);
    onResultat(
      !e.th && !e.tv && !e.facteur && !e.symetrie,
      <>
        TH = {th} ; TV = {tv} ; facteur = {facteur} ; symétrie : {symetrie ? "oui" : "non"}
      </>,
    );
  }

  const montrer = erreurs !== null && tentativesUtilisees > 0;
  const classe = (faux: boolean | undefined) => `text-input${montrer && faux ? " is-erronee" : ""}`;
  const champ = (id: string, libelle: string, valeur: string, set: (v: string) => void, faux: boolean | undefined) => (
    <div className="field field-inline">
      <label className="field-label" htmlFor={id}>
        {libelle}
      </label>
      <input
        id={id}
        className={classe(faux)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="un nombre"
        value={valeur}
        disabled={!!validation}
        onChange={(ev) => set(ev.target.value)}
      />
    </div>
  );

  return (
    <div>
      <p className="prompt-text">{props.question}</p>
      {champ("modele-th", "TH =", th, setTh, erreurs?.th)}
      {champ("modele-tv", "TV =", tv, setTv, erreurs?.tv)}
      {champ("modele-facteur", "Facteur vertical =", facteur, setFacteur, erreurs?.facteur)}
      <div className="field">
        <p className="field-label">Symétrie d'axe horizontal (la courbe est retournée) :</p>
        <div className="options-grid">
          {[true, false].map((valeur) => (
            <button
              key={String(valeur)}
              type="button"
              disabled={!!validation}
              className={`btn${symetrie === valeur ? " toggle-active" : ""}${montrer && erreurs?.symetrie && symetrie === valeur ? " is-erronee" : ""}`}
              onClick={() => setSymetrie(valeur)}
            >
              {valeur ? "Oui" : "Non"}
            </button>
          ))}
        </div>
      </div>
      <Pied props={props} peutValider={complet} onValider={valider} erreurSaisie={erreurSaisie} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — expression du modèle (vérifiée par équivalence)
// ---------------------------------------------------------------------------------------------

export function EtapeExpressionModele(props: PropsCommunes & { question: FragmentConsigne[] }) {
  const { exercice, validation, onResultat } = props;
  const [saisie, setSaisie] = useState("");
  const [erreurSaisie, setErreurSaisie] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [faux, setFaux] = useState(false);
  const libelle = libelleFonction(exercice.contexte);
  const variable = INFOS_CONTEXTE[exercice.contexte].variable;

  function valider() {
    const diagnostic = diagnostiquerExpression(exercice, saisie);
    if (diagnostic.statut === "parse_error") {
      setErreurSaisie("Expression non reconnue — vérifie la syntaxe (parenthèses, « * » entre un nombre et une parenthèse…). Aucune tentative n'est comptée.");
      setFaux(true);
      return;
    }
    setErreurSaisie(null);
    const correct = diagnostic.statut === "correct";
    setFaux(!correct);
    setMessage(diagnostic.mauvaiseVariable ? `La variable de la situation est ${variable} : écris le modèle avec ${variable}, pas avec x. Tentative ${props.tentativesUtilisees + 1}/${props.tentativesMax}.` : null);
    let rendu: ReactNode;
    try {
      rendu = <Katex expression={`${libelle} ${expressionLibreVersLatex(saisie)}`} />;
    } catch {
      rendu = `${libelle} ${saisie}`;
    }
    onResultat(correct, rendu);
  }

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={props.question} />
      </p>
      <ApercuExpressionLatex texte={saisie} label={libelle} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="modele-expression">
          <Katex expression={libelle} />
        </label>
        <input
          id="modele-expression"
          className={`text-input${faux && !validation ? " is-erronee" : ""}`}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={`en fonction de ${variable}`}
          value={saisie}
          disabled={!!validation}
          onChange={(ev) => setSaisie(ev.target.value)}
        />
      </div>
      <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
        Saisie : racine carrée avec racine(…), racine cubique avec racine3(…), valeur absolue avec abs(…), exposant avec ^, quotient avec /.
      </p>
      <Pied props={props} peutValider={saisie.trim() !== ""} onValider={valider} erreurSaisie={erreurSaisie} message={props.tentativesUtilisees > 0 ? message : null} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 4 — utiliser le modèle
// ---------------------------------------------------------------------------------------------

export function EtapeUtilisationModele(props: PropsCommunes & { question: FragmentConsigne[]; libelles: string[]; unite: string }) {
  const { exercice, validation, onResultat, libelles, unite } = props;
  const [saisies, setSaisies] = useState<string[]>(libelles.map(() => ""));
  const [faux, setFaux] = useState<boolean[]>(libelles.map(() => false));
  const [erreurSaisie, setErreurSaisie] = useState<string | null>(null);

  function valider() {
    if (saisies.some((s) => lireNombre(s) === null)) {
      setErreurSaisie(MESSAGE_NOMBRE);
      return;
    }
    setErreurSaisie(null);
    const verdicts = verifierUtilisation(exercice, saisies);
    setFaux(verdicts.map((v) => !v));
    onResultat(
      verdicts.every(Boolean),
      <>{saisies.map((s, i) => `${libelles[i]} ${s} ${unite}`).join(" ; ")}</>,
    );
  }

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={props.question} />
      </p>
      {libelles.map((libelle, i) => (
        <div key={i} className={libelles.length > 1 ? "field" : "field field-inline"}>
          <label className="field-label field-label-minuscule" htmlFor={`modele-utilisation-${i}`}>
            {libelle}
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <input
              id={`modele-utilisation-${i}`}
              className={`text-input${faux[i] && props.tentativesUtilisees > 0 && !validation ? " is-erronee" : ""}`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="un nombre"
              value={saisies[i]}
              disabled={!!validation}
              onChange={(ev) => setSaisies((s) => s.map((v, j) => (j === i ? ev.target.value : v)))}
            />
            <span>{unite}</span>
          </div>
        </div>
      ))}
      <Pied props={props} peutValider={saisies.every((s) => s.trim() !== "")} onValider={valider} erreurSaisie={erreurSaisie} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran 5 — sens d'un paramètre (choix fermé, une seule tentative)
// ---------------------------------------------------------------------------------------------

export function EtapeSensModele(props: PropsCommunes & { question: FragmentConsigne[] }) {
  const { exercice, validation, onResultat } = props;
  const [choix, setChoix] = useState<string | null>(null);
  const option = exercice.options5.find((o) => o.id === choix);
  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={props.question} />
      </p>
      <div className="options-grid" style={{ gridTemplateColumns: "1fr" }}>
        {exercice.options5.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={!!validation}
            className={`btn${choix === o.id ? " toggle-active" : ""}${validation && choix === o.id && !o.correcte ? " is-erronee" : ""}`}
            style={{ textAlign: "left", justifyContent: "flex-start" }}
            onClick={() => setChoix(o.id)}
          >
            <span>
              <RenduFragments fragments={o.fragments} />
            </span>
          </button>
        ))}
      </div>
      <Pied props={props} peutValider={option !== undefined} onValider={() => option && onResultat(option.correcte, <RenduFragments fragments={option.fragments} />)} />
    </div>
  );
}
