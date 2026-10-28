import { useEffect, useRef, useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ModeAngle } from "./calculatriceScientifique";
import { evaluerExpressionCalculatrice, formatExpressionAffichage, formatNombreCalculatrice } from "./calculatriceScientifique";
import type { FonctionGraphiqueEtat } from "./graphiqueCalculatrice";
import { PALETTE_FONCTIONS, compilerFonctionGraphique } from "./graphiqueCalculatrice";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";

/** Onglet actif du panneau — "scientifique" par défaut pour ne rien changer au comportement des 10
 * écrans qui montent déjà `<CalculatriceScientifique/>` (voir CLAUDE.md, "Calculatrice graphique
 * (6e)") : l'onglet "graphique" est une extension PURE, jamais le mode d'ouverture par défaut. */
type ModePanneau = "scientifique" | "graphique";

interface Touche {
  libelle: string;
  token: string;
  classe?: string;
}

const LIGNES_TOUCHES: Touche[][] = [
  [
    { libelle: "sin", token: "sin(" },
    { libelle: "cos", token: "cos(" },
    { libelle: "tan", token: "tan(" },
    { libelle: "π", token: "pi" },
    { libelle: ",", token: "," },
  ],
  [
    { libelle: "asin", token: "asin(" },
    { libelle: "acos", token: "acos(" },
    { libelle: "atan", token: "atan(" },
    { libelle: "(", token: "(" },
    { libelle: ")", token: ")" },
  ],
  [
    { libelle: "ln", token: "ln(" },
    { libelle: "log", token: "log10(" },
    { libelle: "xʸ", token: "^" },
    { libelle: "√", token: "sqrt(" },
    { libelle: "ⁿ√", token: "nthRoot(" },
  ],
  [
    { libelle: "7", token: "7" },
    { libelle: "8", token: "8" },
    { libelle: "9", token: "9" },
    { libelle: "÷", token: "/", classe: "calculatrice-touche-operateur" },
    { libelle: "C", token: "", classe: "calculatrice-touche-danger" },
  ],
  [
    { libelle: "4", token: "4" },
    { libelle: "5", token: "5" },
    { libelle: "6", token: "6" },
    { libelle: "×", token: "*", classe: "calculatrice-touche-operateur" },
    { libelle: "⌫", token: "", classe: "calculatrice-touche-danger" },
  ],
  [
    { libelle: "1", token: "1" },
    { libelle: "2", token: "2" },
    { libelle: "3", token: "3" },
    { libelle: "−", token: "-", classe: "calculatrice-touche-operateur" },
    { libelle: "%", token: "/100" },
  ],
  [
    { libelle: "0", token: "0" },
    { libelle: ".", token: "." },
    { libelle: "+", token: "+", classe: "calculatrice-touche-operateur" },
    { libelle: "=", token: "", classe: "calculatrice-touche-primaire calculatrice-touche-large" },
  ],
  // Ligne propre au 6e-6h (jamais répliquée sur les copies 4e/5e-4h : ni nombres complexes, ni
  // analyse combinatoire au programme de ces 2 chantiers). "i" insère l'unité imaginaire —
  // `evaluerExpressionCalculatrice` détecte un résultat `Complex` et le formate via
  // `formatComplexeCalculatrice` (voir ce fichier). "n!" insère le token postfixe "!" (même
  // mécanisme d'insertion générique que "," ou "("), "nCr"/"nPr" insèrent `combinations(`/
  // `permutations(` en préfixe — même convention que "√"/"ⁿ√" : l'élève complète les arguments à la
  // main après la parenthèse ouvrante.
  [
    { libelle: "i", token: "i" },
    { libelle: "n!", token: "!" },
    { libelle: "nCr", token: "combinations(" },
    { libelle: "nPr", token: "permutations(" },
  ],
];

interface Props {
  /** Mode angle à l'ouverture — `"RAD"` par défaut (contexte historique du chantier 6e :
   * exponentielles/logarithmes, jamais d'angle en degrés). Un écran dont la réponse ATTENDUE est en
   * degrés (ex. `6gen41` famille B écran 4, loi des cosinus) passe explicitement `"DEG"` — convention
   * transversale "DEG par défaut si applicable au contexte du chapitre" (checklist chapitre 7).
   * Lu UNE SEULE FOIS, à la création de CE composant (voir doc-comment plus bas) — pas à chaque
   * ouverture de la modale, qui ne réinitialise plus l'état. */
  modeInitial?: ModeAngle;
}

/**
 * Calculatrice scientifique flottante, montée avec au plus un prop optionnel sur n'importe quel
 * écran qui en a besoin (un seul `<CalculatriceScientifique />`, bouton + modale intégrés) —
 * réplique fidèlement `components5e/CalculatriceScientifique.tsx`, jamais importée entre chantiers
 * (voir CLAUDE.md, isolation entre chantiers) — voir `docs/historique-6e.md` pour l'inventaire des
 * écrans concernés et la justification du critère d'activation.
 *
 * L'état (expression, curseur, mode DEG/RAD, mémoire) vit ICI, dans le composant TOUJOURS monté
 * tant que l'écran est actif — PAS dans `CalculatriceModale`, qui se démonte/remonte à chaque
 * fermeture/ouverture (`{ouverte && <CalculatriceModale/>}`). Fermer la calculatrice (bouton `×` ou
 * clic hors du panneau) puis la rouvrir conserve donc le travail en cours (expression, mémoire M+/
 * M−, mode DEG/RAD), comme une vraie calculatrice physique qu'on éteint/rallume — bug signalé :
 * avant ce correctif, l'état vivait dans `CalculatriceModale` et repartait de zéro à CHAQUE
 * réouverture (y compris le mode, systématiquement forcé à revenir à `modeInitial`). Ne se
 * réinitialise que lorsque CE composant est lui-même démonté par son appelant (borne naturelle :
 * fin d'exercice).
 */
export function CalculatriceScientifique({ modeInitial = "RAD" }: Props = {}) {
  const [ouverte, setOuverte] = useState(false);
  const [expression, setExpression] = useState("");
  const [curseur, setCurseur] = useState(0);
  const [mode, setMode] = useState<ModeAngle>(modeInitial);
  const [memoire, setMemoire] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modePanneau, setModePanneau] = useState<ModePanneau>("scientifique");
  // Une ligne vide au premier affichage de l'onglet "graphique" plutôt qu'une liste vide — même
  // principe qu'une calculatrice graphique physique, qui propose toujours "Y1=" prêt à remplir.
  const [fonctions, setFonctions] = useState<FonctionGraphiqueEtat[]>(() => [
    { id: 1, expression: "", couleur: PALETTE_FONCTIONS[0], visible: true },
  ]);

  return (
    <>
      <button type="button" className="calculatrice-bouton-flottant" aria-label="Calculatrice" onClick={() => setOuverte(true)}>
        <span className="calculatrice-bouton-libelle">Calculatrice</span>
      </button>
      {ouverte && (
        <CalculatriceModale
          expression={expression}
          setExpression={setExpression}
          curseur={curseur}
          setCurseur={setCurseur}
          mode={mode}
          setMode={setMode}
          memoire={memoire}
          setMemoire={setMemoire}
          erreur={erreur}
          setErreur={setErreur}
          modePanneau={modePanneau}
          setModePanneau={setModePanneau}
          fonctions={fonctions}
          setFonctions={setFonctions}
          onFermer={() => setOuverte(false)}
        />
      )}
    </>
  );
}

interface PropsModale {
  expression: string;
  setExpression: (v: string) => void;
  curseur: number;
  setCurseur: (v: number) => void;
  mode: ModeAngle;
  setMode: (v: ModeAngle | ((m: ModeAngle) => ModeAngle)) => void;
  memoire: number;
  setMemoire: (v: number | ((m: number) => number)) => void;
  erreur: string | null;
  setErreur: (v: string | null) => void;
  modePanneau: ModePanneau;
  setModePanneau: (v: ModePanneau) => void;
  fonctions: FonctionGraphiqueEtat[];
  setFonctions: (v: FonctionGraphiqueEtat[] | ((f: FonctionGraphiqueEtat[]) => FonctionGraphiqueEtat[])) => void;
  onFermer: () => void;
}

function CalculatriceModale({
  expression,
  setExpression,
  curseur,
  setCurseur,
  mode,
  setMode,
  memoire,
  setMemoire,
  erreur,
  setErreur,
  modePanneau,
  setModePanneau,
  fonctions,
  setFonctions,
  onFermer,
}: PropsModale) {
  const refExpression = useRef<HTMLInputElement>(null);

  // Garde le curseur NATIF de l'<input> synchronisé avec `curseur` après chaque insertion/
  // suppression programmatique (les boutons du pavé, jamais le clavier) — une simple mise à jour de
  // `value` ne repositionne pas le curseur du navigateur tout seul.
  useEffect(() => {
    refExpression.current?.setSelectionRange(curseur, curseur);
  }, [expression, curseur]);

  /** Synchronise `curseur` avec la position RÉELLE du curseur natif de l'`<input>` après un clic/une
   * navigation clavier (flèches, Origine/Fin) de l'ÉLÈVE — `readOnly` empêche toute frappe de
   * caractère mais laisse le déplacement du curseur totalement natif, gratuit, donc CE bug-ci
   * ("plus aucun moyen de corriger une faute de frappe ailleurs qu'à la toute fin") est réglé sans
   * code de positionnement fait main. */
  function synchroniserCurseurDepuisInput(e: { currentTarget: HTMLInputElement }) {
    setCurseur(e.currentTarget.selectionStart ?? expression.length);
  }

  /** Insère `token` À LA POSITION DU CURSEUR (jamais systématiquement en fin de chaîne) — c'est ce
   * qui permet à `insererRacineNieme` de placer le radicande ENTRE `nthRoot(` et `,indice)` plutôt
   * qu'à la fin, et plus généralement à l'élève de corriger une faute de frappe au milieu d'une
   * expression sans devoir tout effacer depuis la fin. */
  function inserer(token: string) {
    setErreur(null);
    const nouvelle = expression.slice(0, curseur) + token + expression.slice(curseur);
    setExpression(nouvelle);
    setCurseur(curseur + token.length);
  }

  function effacerTout() {
    setExpression("");
    setCurseur(0);
    setErreur(null);
  }

  function effacerDernierCaractere() {
    if (curseur === 0) return;
    const nouvelle = expression.slice(0, curseur - 1) + expression.slice(curseur);
    setExpression(nouvelle);
    setCurseur(curseur - 1);
    setErreur(null);
  }

  function calculer() {
    const resultat = evaluerExpressionCalculatrice(expression, mode);
    if (resultat.erreur) {
      setErreur(resultat.erreur);
      return;
    }
    // Résultat complexe (expression utilisant "i") — déjà formaté en chaîne finale par
    // `evaluerExpressionCalculatrice`, jamais repassé par `formatNombreCalculatrice` (pensé pour un
    // réel seul).
    if (resultat.valeurComplexe !== null) {
      setExpression(resultat.valeurComplexe);
      setCurseur(resultat.valeurComplexe.length);
      setErreur(null);
      return;
    }
    if (resultat.valeur !== null) {
      const texte = formatNombreCalculatrice(resultat.valeur);
      setExpression(texte);
      setCurseur(texte.length);
      setErreur(null);
    }
  }

  /** M+/M- portent sur la valeur ACTUELLEMENT AFFICHÉE (expression évaluée à la volée), jamais
   * seulement sur le dernier résultat validé par "=" — comportement standard d'une calculatrice
   * scientifique physique. */
  function ajouterMemoire(signe: 1 | -1) {
    const resultat = evaluerExpressionCalculatrice(expression, mode);
    if (resultat.valeur === null) return;
    setMemoire((m) => m + signe * (resultat.valeur as number));
  }

  function rappelerMemoire() {
    inserer(formatNombreCalculatrice(memoire));
  }

  /**
   * Bug signalé ("bouton racine n-ième impossible à utiliser") — reproduit : un élève tape
   * naturellement l'INDICE avant d'appuyer sur ⁿ√ (convention physique/notation √[n]{x}, l'indice
   * s'écrit avant le radical — c'est ainsi que les calculatrices Casio/TI l'enseignent), ex. "3" puis
   * "ⁿ√" pour la racine cubique. Avec l'ancien bouton (simple `inserer("nthRoot(")`), ceci produisait
   * "3nthRoot(" = 3 CONCATÉNÉ à un nouvel appel de fonction, interprété par mathjs comme une
   * MULTIPLICATION IMPLICITE (3×nthRoot(8)=3×√8≈8,49 au lieu de la racine cubique de 8=2) — un
   * résultat FAUX rendu SANS AUCUNE erreur affichée, le pire des deux échecs.
   *
   * Correctif : si l'expression se termine (au curseur) par un nombre, on l'extrait comme INDICE et
   * on construit directement `nthRoot(,indice)` avec le curseur positionné entre `(` et `,` — les
   * chiffres tapés ensuite (le radicande) s'insèrent donc au bon endroit. Sans indice détecté
   * (expression vide, ou curseur juste après une parenthèse/un opérateur), repli sur l'usage
   * préfixe classique `nthRoot(` (radicande d'abord, indice tapé à la main après la virgule) —
   * fonctionne déjà (`nthRoot(8,3)` typé intégralement évalue correctement), jamais un cas cassé.
   */
  function insererRacineNieme() {
    setErreur(null);
    const avantCurseur = expression.slice(0, curseur);
    const apresCurseur = expression.slice(curseur);
    const indiceMatch = avantCurseur.match(/(\d+(?:\.\d+)?)$/);
    if (!indiceMatch) return inserer("nthRoot(");
    const indice = indiceMatch[1];
    const base = avantCurseur.slice(0, avantCurseur.length - indice.length);
    setExpression(`${base}nthRoot(,${indice})${apresCurseur}`);
    setCurseur(base.length + "nthRoot(".length);
  }

  function onTouche(touche: Touche) {
    if (touche.libelle === "C") return effacerTout();
    if (touche.libelle === "⌫") return effacerDernierCaractere();
    if (touche.libelle === "=") return calculer();
    if (touche.libelle === "ⁿ√") return insererRacineNieme();
    return inserer(touche.token);
  }

  return (
    <div className="calculatrice-overlay" onClick={onFermer}>
      <div
        className={`calculatrice-panneau ${modePanneau === "graphique" ? "calculatrice-panneau-graphique" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calculatrice-entete-groupe">
          <div className="calculatrice-entete-rangee">
            <div className="calculatrice-mode-tabs">
              <button
                type="button"
                className={`calculatrice-mode-tab ${modePanneau === "scientifique" ? "calculatrice-mode-tab-actif" : ""}`}
                onClick={() => setModePanneau("scientifique")}
              >
                123
              </button>
              <button
                type="button"
                className={`calculatrice-mode-tab ${modePanneau === "graphique" ? "calculatrice-mode-tab-actif" : ""}`}
                onClick={() => setModePanneau("graphique")}
              >
                f(x)
              </button>
            </div>
            <button type="button" className="calculatrice-fermer" onClick={onFermer} aria-label="Fermer la calculatrice">
              ×
            </button>
          </div>
          {modePanneau === "scientifique" && (
            <div className="calculatrice-entete-rangee">
              <div className="calculatrice-memoire-boutons">
                <button type="button" className="calculatrice-touche" onClick={() => setMemoire(0)}>
                  MC
                </button>
                <button type="button" className="calculatrice-touche" onClick={rappelerMemoire}>
                  MR
                </button>
                <button type="button" className="calculatrice-touche" onClick={() => ajouterMemoire(1)}>
                  M+
                </button>
                <button type="button" className="calculatrice-touche" onClick={() => ajouterMemoire(-1)}>
                  M−
                </button>
              </div>
              <button
                type="button"
                className={`calculatrice-toggle-mode ${mode === "DEG" ? "calculatrice-toggle-mode-actif" : ""}`}
                onClick={() => setMode((m) => (m === "DEG" ? "RAD" : "DEG"))}
              >
                {mode}
              </button>
            </div>
          )}
        </div>

        {modePanneau === "scientifique" ? (
          <>
            <div className="calculatrice-affichage">
              <input
                ref={refExpression}
                type="text"
                inputMode="none"
                readOnly
                className="calculatrice-expression"
                value={formatExpressionAffichage(expression)}
                placeholder="0"
                aria-label="Expression en cours"
                onClick={synchroniserCurseurDepuisInput}
                onKeyUp={synchroniserCurseurDepuisInput}
                onSelect={synchroniserCurseurDepuisInput}
              />
              {erreur && <div className="calculatrice-erreur">{erreur}</div>}
            </div>

            <div className="calculatrice-pave">
              {LIGNES_TOUCHES.map((ligne, indexLigne) => (
                <div className="calculatrice-ligne" key={indexLigne}>
                  {ligne.map((touche) => (
                    <button
                      type="button"
                      key={touche.libelle}
                      className={`calculatrice-touche ${touche.classe ?? ""}`}
                      onClick={() => onTouche(touche)}
                    >
                      {touche.libelle}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <PanneauGraphique fonctions={fonctions} setFonctions={setFonctions} />
        )}
      </div>
    </div>
  );
}

let prochainIdFonction = 2; // id=1 déjà pris par la ligne initiale (état créé dans CalculatriceScientifique)

const LABELS_FONCTIONS = ["y₁", "y₂", "y₃", "y₄", "y₅"];

interface PropsPanneauGraphique {
  fonctions: FonctionGraphiqueEtat[];
  setFonctions: (v: FonctionGraphiqueEtat[] | ((f: FonctionGraphiqueEtat[]) => FonctionGraphiqueEtat[])) => void;
}

/**
 * Onglet "f(x)" (6e-6h uniquement, voir `graphiqueCalculatrice.ts`) — jusqu'à
 * `PALETTE_FONCTIONS.length` fonctions libres tracées simultanément. Réutilise tel quel
 * l'infrastructure Mafs déjà partagée par tous les graphes d'exercices du chantier
 * (`GrilleAdaptative`/`DomaineTraceX`/`Plot.OfX`, voir `GrapheOptionEtudeFonction.tsx` pour le même
 * assemblage sur UNE seule courbe) — seule la source de la courbe change ici (une expression libre
 * tapée par l'élève, compilée par `compilerFonctionGraphique`, plutôt qu'un exercice généré).
 */
function PanneauGraphique({ fonctions, setFonctions }: PropsPanneauGraphique) {
  const [refGraphe, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(420, Math.max(240, largeurMesuree || 320));
  const hauteur = largeur / RATIO_GRAPHE;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  function modifierFonction(id: number, champs: Partial<FonctionGraphiqueEtat>) {
    setFonctions((fs) => fs.map((f) => (f.id === id ? { ...f, ...champs } : f)));
  }

  function ajouterFonction() {
    setFonctions((fs) => {
      if (fs.length >= PALETTE_FONCTIONS.length) return fs;
      const fonction: FonctionGraphiqueEtat = { id: prochainIdFonction++, expression: "", couleur: PALETTE_FONCTIONS[fs.length], visible: true };
      return [...fs, fonction];
    });
  }

  function supprimerFonction(id: number) {
    setFonctions((fs) => fs.filter((f) => f.id !== id));
  }

  const compilees = fonctions.map((fonction) => ({ fonction, resultat: compilerFonctionGraphique(fonction.expression) }));

  return (
    <>
      <div className="calculatrice-fonctions-liste">
        {compilees.map(({ fonction, resultat }, index) => (
          <div className="calculatrice-fonction-ligne" key={fonction.id}>
            <span className="calculatrice-fonction-pastille" style={{ background: fonction.couleur }} />
            <span className="calculatrice-fonction-label">{LABELS_FONCTIONS[index] ?? "y"} =</span>
            <input
              type="text"
              className={`calculatrice-fonction-champ ${resultat.erreur ? "calculatrice-fonction-champ-erreur" : ""}`}
              value={fonction.expression}
              placeholder="ex. sin(x)"
              aria-label={`Expression de ${LABELS_FONCTIONS[index] ?? "y"}`}
              onChange={(e) => modifierFonction(fonction.id, { expression: e.target.value })}
            />
            <button
              type="button"
              className="calculatrice-fonction-oeil"
              aria-label={fonction.visible ? "Masquer la courbe" : "Afficher la courbe"}
              onClick={() => modifierFonction(fonction.id, { visible: !fonction.visible })}
            >
              {fonction.visible ? "◉" : "○"}
            </button>
            <button type="button" className="calculatrice-fonction-supprimer" aria-label="Supprimer la fonction" onClick={() => supprimerFonction(fonction.id)}>
              ✕
            </button>
          </div>
        ))}
        {fonctions.length < PALETTE_FONCTIONS.length && (
          <button type="button" className="calculatrice-fonction-ajouter" onClick={ajouterFonction}>
            + Ajouter une fonction
          </button>
        )}
      </div>

      <div className="mafs-graph calculatrice-graphe" ref={refGraphe}>
        <Mafs width={largeur} height={hauteur} viewBox={{ x: [-9, 9], y: [-6, 6], padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }} preserveAspectRatio={false}>
          <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
          <DomaineTraceX largeur={largeur}>
            {(domaine) =>
              compilees.map(({ fonction, resultat }) =>
                resultat.evaluer && fonction.visible ? (
                  <Plot.OfX key={fonction.id} y={resultat.evaluer} domain={domaine} color={fonction.couleur} weight={EPAISSEUR_TRAIT_ACCENTUE} />
                ) : null,
              )
            }
          </DomaineTraceX>
        </Mafs>
        {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      </div>
    </>
  );
}
