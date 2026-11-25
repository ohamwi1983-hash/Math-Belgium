import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * Cadre commun de la page d'un générateur, côté « actions » (refonte du 22/11/2026, maquettes A, B,
 * D et ordinateur) — monté UNE fois par `EntrainementPage`, pour les ~310 générateurs sans en
 * réécrire aucun. Il ne déplace AUCUN nœud du DOM (React en reste seul propriétaire) et ne change
 * aucun comportement : il REPÈRE, dans l'écran courant, les boutons et messages déjà rendus par le
 * générateur et les marque d'un attribut `data-barre` ; `theme.css` fait le reste.
 *
 * - `data-barre="principal"` : le bouton principal de l'écran (« Valider », ou « Écran suivant » /
 *   « Nouvel exercice » de `ValidationEcran`) ; `data-barre="aide"` : le `BoutonAide` qui le précède ;
 *   `data-barre="retour"` : le message (« Incorrect — tentative 1/3… », saisie illisible) rendu juste
 *   après lui. Sur téléphone et tablette (< 1024 px), ces trois éléments forment la barre fixe du bas
 *   (au-dessus du clavier grâce à `visualViewport`) ; sur ordinateur, ils restent sous l'étape.
 * - Clavier ouvert (champ de saisie actif, écran tactile) : `data-saisie` sur la racine, l'énoncé
 *   (`.entete-exercice`) est épinglé en bandeau compact sous la barre du haut.
 * - Bandeau compact (clavier ouvert, ou énoncé replié) : une seule ligne d'aperçu ; `apercuEnonce`
 *   mesure ce qui ne tient pas (formule entière ou mot) et pose `data-apercu-coupe` +
 *   `--apercu-coupe` : « … » recouvre la suite, jamais une formule coupée au milieu.
 * - Aide (maquette B) : quand l'élève touche « Aide », un tiroir s'ouvre par le bas avec une COPIE
 *   en lecture seule des aides de l'écran (« Aide n / N ») ; l'original reste à sa place dans la page,
 *   « Aide suivante » appelle le même bouton. Contenu et déblocage inchangés.
 * - Ordinateur (≥ 1024 px) : l'énoncé est tenu visible à gauche (position fixe calculée sur la carte),
 *   les étapes défilent à droite.
 *
 * Choix du bouton principal : le seul `.btn-primary` visible de la carte ; s'il y en a plusieurs, le
 * bouton de `ValidationEcran` (`.validation-suivant`), sinon le dernier « Valider »/« Vérifier » ;
 * sinon rien (l'écran garde sa mise en page dans le flux, rien n'est deviné).
 */

const EXCLUS = ".selecteur-variante-bloc, .calculatrice-overlay, .calculatrice-panneau, .fiche-reponse-overlay, .video-overlay, .gen-tiroir, dialog";
const SAISIE = 'input:not([type]), input[type="text"], input[type="search"], input[type="email"], textarea, [contenteditable="true"]';
const BLOCS_AIDE = ".triangle-quelconque-aide, .aide-5e";
const LARGEUR_ORDINATEUR = 1024;

function visible(el: Element): boolean {
  return el.getClientRects().length > 0;
}

function suit(a: Element, b: Element): boolean {
  return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/** Premier élément « message » qui suit immédiatement le bouton (frère suivant, ou frère suivant
 * d'un parent dont le bouton est le dernier enfant — deux niveaux au plus, sans sortir de la carte). */
function messageApres(bouton: Element, carte: Element): HTMLElement | null {
  let noeud: Element | null = bouton;
  for (let niveau = 0; niveau < 3 && noeud && noeud !== carte; niveau++) {
    let frere: Element | null = noeud.nextElementSibling;
    while (frere && !visible(frere) && !frere.matches(".alert-error, .alert-success")) frere = frere.nextElementSibling;
    if (frere) {
      if (frere.matches(".alert-error, .alert-success") && visible(frere)) return frere as HTMLElement;
      return null;
    }
    noeud = noeud.parentElement;
  }
  return null;
}

function choisirPrincipal(carte: Element): HTMLElement | null {
  const candidats = [...carte.querySelectorAll<HTMLElement>("button.btn-primary")].filter((b) => visible(b) && !b.closest(EXCLUS));
  if (candidats.length === 1) return candidats[0];
  if (candidats.length === 0) return null;
  const suivants = candidats.filter((b) => b.classList.contains("validation-suivant"));
  if (suivants.length > 0) return suivants[suivants.length - 1];
  const valider = candidats.filter((b) => /^\s*(valider|vérifier)/i.test(b.textContent ?? ""));
  return valider.length > 0 ? valider[valider.length - 1] : null;
}

const MEDIA_APERCU = "svg, img, canvas, table, figure, video, iframe";
/** Enfants de l'énoncé qui ne font pas partie du bloc de données (bandeau compact). */
const HORS_DONNEES = ".entete-exercice-label, .entete-exercice-bascule, .prompt-text, .entete-exercice-apercu, .entete-figure-replie";

/** Le bloc de données a-t-il du texte hors figures, tableaux et images ? Sinon (figure seule : 6gen106,
 * 6gen162…) l'aperçu replié serait vide : la consigne prend sa place (`data-apercu-consigne`). */
function donneesSansTexte(enonce: HTMLElement): boolean {
  const donnees = [...enonce.children].filter((c) => !c.matches(`${HORS_DONNEES}, :empty`));
  if (donnees.length === 0) return false;
  const texte = (n: Node): boolean => {
    if (n.nodeType === Node.TEXT_NODE) return /\S/.test(n.textContent ?? "");
    if (!(n instanceof Element)) return false;
    if (n.matches(`${MEDIA_APERCU}, [hidden], .sr-only`)) return false;
    return [...n.childNodes].some(texte);
  };
  return !donnees.some(texte);
}
/** Place réservée aux « … » au bout de la ligne d'aperçu (px). */
const LARGEUR_POINTS = 20;

/**
 * Bord gauche (px, depuis le bord de remplissage de l'énoncé) du premier morceau de la ligne
 * d'aperçu qui ne tient pas — formule KaTeX entière, ou mot — ; `null` si tout tient et que rien
 * n'est masqué. Les figures, tableaux et images ne sont pas aperçus (CSS) : s'il y en a, la coupe
 * se fait au moins au bout du texte, pour que « … » signale le contenu absent.
 */
function pointDeCoupe(enonce: HTMLElement): number | null {
  const r = enonce.getBoundingClientRect();
  const cs = getComputedStyle(enonce);
  const gauche = r.left + parseFloat(cs.borderLeftWidth);
  const limite = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
  const morceaux: { g: number; d: number }[] = [];
  let media = false;
  const enfants = [...enonce.children];
  const resume = enfants.find((c) => c.matches(".entete-exercice-apercu") && visible(c));
  let donnees = enfants.filter((c) => !c.matches(`${HORS_DONNEES}, :empty`));
  if (resume) {
    // Résumé explicite du générateur : seul aperçu ; l'énoncé complet est masqué, d'où « … ».
    donnees = [resume];
    media = true;
  } else if (donnees.length === 0 || enonce.hasAttribute("data-apercu-consigne")) {
    // Pas de bloc de données, ou bloc sans texte (une figure seule) : l'aperçu montre la consigne
    // (même règle que `cadre.css`), puis les médias éventuels du bloc ferment la ligne par « … ».
    donnees = [...enfants.filter((c) => c.matches(".prompt-text")), ...donnees];
  }
  const parcourir = (noeud: Node) => {
    if (noeud.nodeType === Node.TEXT_NODE) {
      const texte = noeud.textContent ?? "";
      const plage = document.createRange();
      for (const m of texte.matchAll(/\S+/g)) {
        const debut = m.index ?? 0;
        plage.setStart(noeud, debut);
        plage.setEnd(noeud, debut + m[0].length);
        const b = plage.getBoundingClientRect();
        if (b.width > 0 || b.height > 0) morceaux.push({ g: b.left, d: b.right });
      }
      return;
    }
    if (!(noeud instanceof Element)) return;
    if (noeud.matches(MEDIA_APERCU)) {
      if (!noeud.closest("[hidden]")) media = true;
      return;
    }
    if (noeud.classList.contains("katex")) {
      const b = noeud.getBoundingClientRect();
      if (b.width > 0) morceaux.push({ g: b.left, d: b.right });
      return;
    }
    if (noeud.getClientRects().length === 0 && !noeud.querySelector(MEDIA_APERCU)) return;
    noeud.childNodes.forEach(parcourir);
  };
  donnees.forEach(parcourir);
  const droite = morceaux.reduce((m, x) => Math.max(m, x.d), -Infinity);
  if (!media && droite <= limite + 0.5) return null;
  const premier = morceaux.find((x) => x.d > limite - LARGEUR_POINTS);
  const coupe = premier ? premier.g : morceaux.length > 0 ? droite + 4 : limite - LARGEUR_POINTS;
  return Math.max(0, Math.round(coupe - gauche));
}

/**
 * Bandeau compact de l'énoncé (< 1 024 px : replié `.est-replie`, ou épinglé clavier ouvert
 * `data-saisie`) : une seule ligne d'aperçu, terminée par « … » quand tout ne tient pas — voir
 * `cadre.css`, « Bandeau compact ». N'écrit que si la valeur change (l'observateur suit `style`).
 */
function apercuEnonce(racine: HTMLElement) {
  const compact = window.innerWidth < LARGEUR_ORDINATEUR;
  const saisie = racine.dataset.saisie !== undefined;
  racine.querySelectorAll<HTMLElement>(".entete-exercice").forEach((enonce) => {
    const actif = compact && (saisie || enonce.classList.contains("est-replie")) && visible(enonce);
    const consigne = actif && donneesSansTexte(enonce);
    if (consigne !== enonce.hasAttribute("data-apercu-consigne")) {
      if (consigne) enonce.setAttribute("data-apercu-consigne", "");
      else enonce.removeAttribute("data-apercu-consigne");
    }
    const coupe = actif ? pointDeCoupe(enonce) : null;
    if (coupe === null) {
      if (enonce.hasAttribute("data-apercu-coupe")) enonce.removeAttribute("data-apercu-coupe");
      if (enonce.style.getPropertyValue("--apercu-coupe")) enonce.style.removeProperty("--apercu-coupe");
      return;
    }
    const valeur = `${coupe}px`;
    if (enonce.style.getPropertyValue("--apercu-coupe") !== valeur) enonce.style.setProperty("--apercu-coupe", valeur);
    if (!enonce.hasAttribute("data-apercu-coupe")) enonce.setAttribute("data-apercu-coupe", "");
  });
}

interface EtatTiroir {
  niveau: number;
  max: number;
  /** Incrémenté à chaque ouverture/mise à jour pour recopier le contenu. */
  version: number;
}

export function CadreActions({ racineRef }: { racineRef: RefObject<HTMLDivElement | null> }) {
  const [barre, setBarre] = useState(false);
  const [tiroir, setTiroir] = useState<EtatTiroir | null>(null);
  const tiroirRef = useRef<EtatTiroir | null>(null);
  tiroirRef.current = tiroir;
  const contenuRef = useRef<HTMLDivElement>(null);
  const aideRef = useRef<HTMLElement | null>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const racine = racineRef.current;
    if (!racine) return;
    const marques = new Map<string, HTMLElement>();
    let validationPresente = false;
    let retourPrecedent: HTMLElement | null = null;
    let rafPlanifie = 0;
    let enonceFixe: HTMLElement | null = null;

    const marquer = (role: string, el: HTMLElement | null) => {
      const ancien = marques.get(role);
      if (ancien === el) return;
      if (ancien && ancien.getAttribute("data-barre") === role) ancien.removeAttribute("data-barre");
      if (el) {
        el.setAttribute("data-barre", role);
        marques.set(role, el);
      } else marques.delete(role);
    };

    const geometrieColonnes = () => {
      const carte = racine.querySelector<HTMLElement>("main.card") ?? racine.querySelector<HTMLElement>("main");
      const enonce = carte ? [...carte.querySelectorAll<HTMLElement>(".entete-exercice")].find(visible) ?? null : null;
      const actif = !!enonce && window.innerWidth >= LARGEUR_ORDINATEUR;
      if (enonceFixe && enonceFixe !== enonce) enonceFixe.removeAttribute("data-enonce-fixe");
      enonceFixe = actif ? enonce : null;
      if (!actif || !carte || !enonce) {
        delete racine.dataset.deuxColonnes;
        enonce?.removeAttribute("data-enonce-fixe");
        return;
      }
      enonce.setAttribute("data-enonce-fixe", "");
      racine.dataset.deuxColonnes = "";
      const r = carte.getBoundingClientRect();
      const barreHaut = racine.querySelector<HTMLElement>(".gen-barre")?.getBoundingClientRect().bottom ?? 0;
      const largeur = Math.round(Math.min(560, Math.max(320, r.width * 0.44)));
      racine.style.setProperty("--col-x", `${Math.round(r.left)}px`);
      racine.style.setProperty("--col-w", `${largeur}px`);
      racine.style.setProperty("--col-top", `${Math.round(Math.max(barreHaut + 16, r.top))}px`);
    };

    const analyser = () => {
      rafPlanifie = 0;
      const carte = racine.querySelector<HTMLElement>("main.card") ?? racine.querySelector<HTMLElement>("main");
      const principal = carte ? choisirPrincipal(carte) : null;
      const aides = carte && principal ? [...carte.querySelectorAll<HTMLElement>("button[data-bouton-aide]")].filter((b) => visible(b) && !b.closest(EXCLUS) && suit(b, principal)) : [];
      const aide = aides.length > 0 ? aides[aides.length - 1] : null;
      const retour = carte && principal && !principal.classList.contains("validation-suivant") ? messageApres(principal, carte) : null;
      marquer("principal", principal);
      marquer("aide", aide);
      marquer("retour", retour);
      aideRef.current = aide;
      if (principal) racine.dataset.barreActive = "";
      else delete racine.dataset.barreActive;
      if (aide) {
        racine.dataset.barreAide = "";
        racine.style.setProperty("--barre-aide-w", `${Math.ceil(aide.getBoundingClientRect().width)}px`);
      } else delete racine.dataset.barreAide;
      racine.style.setProperty("--barre-retour-h", retour ? `${Math.ceil(retour.getBoundingClientRect().height) + 8}px` : "0px");
      setBarre(!!principal);

      // Le message vient d'apparaître au-dessus de la barre : le champ actif ne doit pas passer dessous.
      if (retour && retour !== retourPrecedent && window.innerWidth < LARGEUR_ORDINATEUR) {
        const actif = document.activeElement as HTMLElement | null;
        if (actif && carte?.contains(actif) && actif.matches(SAISIE)) {
          const depasse = actif.getBoundingClientRect().bottom + 8 - retour.getBoundingClientRect().top;
          if (depasse > 0) window.scrollBy(0, depasse);
        }
      }
      retourPrecedent = retour;

      // Nouvel écran (le bloc de validation vient de disparaître) : haut de l'écran remis en vue sur
      // téléphone si on l'avait dépassé — la question suivante commence sous l'énoncé replié.
      const validation = !!carte?.querySelector(".validation-ecran");
      if (validationPresente && !validation && carte && window.innerWidth < LARGEUR_ORDINATEUR && carte.getBoundingClientRect().top < 0) {
        window.scrollTo({ top: 0 });
      }
      // Verdict qui vient d'apparaître : ramené dans la vue (au-dessus de la barre fixe).
      if (!validationPresente && validation) {
        carte?.querySelector(".validation-verdict")?.scrollIntoView({ block: "nearest" });
      }
      validationPresente = validation;

      // Tiroir d'aide : fermé si l'écran a changé (plus de bouton d'aide), recopié sinon.
      const t = tiroirRef.current;
      if (t) {
        if (!aide) setTiroir(null);
        else {
          const niveau = Number(aide.dataset.aideNiveau ?? 0);
          if (niveau !== t.niveau) setTiroir({ niveau, max: Number(aide.dataset.aideMax ?? 0), version: t.version + 1 });
        }
      }
      geometrieColonnes();
      apercuEnonce(racine);
    };

    const planifier = () => {
      if (!rafPlanifie) rafPlanifie = requestAnimationFrame(analyser);
    };

    const observateur = new MutationObserver(planifier);
    observateur.observe(racine, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "disabled", "hidden", "style", "aria-expanded", "open"] });

    // Clavier virtuel : décalage du bas de l'écran visible (iOS ne réduit pas la fenêtre de mise en page).
    const vv = window.visualViewport;
    const surViewport = () => {
      if (!vv) return;
      const clavier = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      racine.style.setProperty("--clavier", `${clavier}px`);
      racine.style.setProperty("--vv-haut", `${Math.max(0, Math.round(vv.offsetTop))}px`);
    };
    vv?.addEventListener("resize", surViewport);
    vv?.addEventListener("scroll", surViewport);
    surViewport();

    const tactile = window.matchMedia("(pointer: coarse)");
    const surFocus = (e: FocusEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible?.matches?.(SAISIE) && !cible.closest(EXCLUS) && cible.closest("main") && tactile.matches) {
        racine.dataset.saisie = "";
        planifier();
      }
    };
    const surPerteFocus = () => {
      // Laisse le focus arriver à sa nouvelle cible (ex. un second champ) avant de décider.
      setTimeout(() => {
        const actif = document.activeElement as HTMLElement | null;
        if (!(actif?.matches?.(SAISIE) && racine.contains(actif) && actif.closest("main"))) {
          delete racine.dataset.saisie;
          planifier();
        }
      }, 0);
    };
    racine.addEventListener("focusin", surFocus);
    racine.addEventListener("focusout", surPerteFocus);

    // Tiroir d'aide (téléphone et tablette) : ouvert APRÈS le rendu de l'aide par le générateur.
    const surClic = (e: MouseEvent) => {
      const bouton = (e.target as HTMLElement | null)?.closest?.("button[data-bouton-aide]");
      if (!bouton || bouton.getAttribute("data-barre") !== "aide" || window.innerWidth >= LARGEUR_ORDINATEUR) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const b = aideRef.current;
          if (!b) return;
          setTiroir((t) => ({ niveau: Number(b.dataset.aideNiveau ?? 0), max: Number(b.dataset.aideMax ?? 0), version: (t?.version ?? 0) + 1 }));
        }),
      );
    };
    racine.addEventListener("click", surClic);

    const surRedimension = () => planifier();
    window.addEventListener("resize", surRedimension);
    const surDefilement = () => {
      if (racine.dataset.deuxColonnes !== undefined) planifier();
    };
    window.addEventListener("scroll", surDefilement, { passive: true });
    document.fonts?.ready.then(planifier).catch(() => {});
    planifier();

    return () => {
      observateur.disconnect();
      vv?.removeEventListener("resize", surViewport);
      vv?.removeEventListener("scroll", surViewport);
      racine.removeEventListener("focusin", surFocus);
      racine.removeEventListener("focusout", surPerteFocus);
      racine.removeEventListener("click", surClic);
      window.removeEventListener("resize", surRedimension);
      window.removeEventListener("scroll", surDefilement);
      if (rafPlanifie) cancelAnimationFrame(rafPlanifie);
      marques.forEach((el, role) => {
        if (el.getAttribute("data-barre") === role) el.removeAttribute("data-barre");
      });
    };
  }, [racineRef]);

  // Copie en lecture seule des aides de l'écran courant (l'original reste dans la page).
  useLayoutEffect(() => {
    const cible = contenuRef.current;
    const racine = racineRef.current;
    if (!tiroir || !cible || !racine) return;
    const carte = racine.querySelector("main.card") ?? racine.querySelector("main") ?? racine;
    const blocs = [...carte.querySelectorAll<HTMLElement>(BLOCS_AIDE)].filter((b) => visible(b) && !b.closest(".gen-tiroir"));
    const copies = blocs.map((b) => {
      const copie = b.cloneNode(true) as HTMLElement;
      copie.removeAttribute("id");
      copie.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      copie.querySelectorAll("[role=alert], [aria-live]").forEach((n) => {
        n.removeAttribute("role");
        n.removeAttribute("aria-live");
      });
      copie.querySelectorAll("button, input, select, textarea, a").forEach((n) => n.setAttribute("tabindex", "-1"));
      return copie;
    });
    cible.replaceChildren(...copies);
    cible.scrollTop = cible.scrollHeight;
  }, [tiroir, racineRef]);

  useEffect(() => {
    if (!tiroir) return;
    fermerRef.current?.focus({ preventScroll: true });
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTiroir(null);
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [tiroir !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const fermer = () => {
    setTiroir(null);
    aideRef.current?.focus({ preventScroll: true });
  };
  const aideEncore = tiroir && aideRef.current && !(aideRef.current as HTMLButtonElement).disabled && tiroir.niveau < tiroir.max;

  return (
    <>
      {barre && <div className="gen-barre-fond no-export" aria-hidden="true" />}
      {tiroir && (
        <div className="gen-tiroir no-export" role="dialog" aria-modal="false" aria-labelledby="gen-tiroir-titre">
          <span className="gen-tiroir-poignee" aria-hidden="true" />
          <p className="gen-tiroir-titre" id="gen-tiroir-titre">
            Aide {tiroir.niveau}
            {tiroir.max > 0 ? <> / {tiroir.max}</> : null}
          </p>
          <div className="gen-tiroir-contenu" ref={contenuRef} />
          <div className="gen-tiroir-actions">
            {aideEncore && (
              <button type="button" className="btn gen-tiroir-suivante" onClick={() => aideRef.current?.click()}>
                Aide suivante
              </button>
            )}
            <button type="button" className="btn gen-tiroir-fermer" ref={fermerRef} onClick={fermer}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
