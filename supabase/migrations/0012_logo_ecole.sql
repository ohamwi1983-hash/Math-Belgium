-- =================================================================================================
-- Math-Belgium — logo FACULTATIF de chaque école (professeur connecté)
-- =================================================================================================
--
-- À coller APRÈS 0011_ordre_chapitres.sql (il suppose 0001 déjà exécuté : table `ecoles` ; il ne
-- touche à aucune autre table), dans l'éditeur SQL du projet Supabase (SQL Editor → New query →
-- coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée
-- (colonne `add column if not exists`, contrainte ajoutée seulement si elle est absente, droits
-- redonnés à l'identique). Aucune clé secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /profil → « En-tête des copies » →
-- « Ajouter le logo de l'école » (Supabase peut mettre quelques secondes à voir la nouvelle colonne).
-- Tant que ce fichier n'est pas exécuté, le site marche comme avant (documents sans logo) et l'écran
-- affiche « Applique la migration 0012… ».
--
-- Décision du professeur (27/11/2026) : chaque école peut avoir un logo, FACULTATIF, imprimé à gauche
-- dans la cartouche de tous ses documents (copie, aménagée, corrigé, grille, feuille, examen,
-- remédiation, Word). Le logo est réduit DANS LE NAVIGATEUR avant l'envoi (600 px de large au plus,
-- ≈ 150 Ko au plus, PNG si l'image a de la transparence, sinon JPEG).
--
-- Contenu (AUCUNE donnée d'élève : l'image du logo d'une école) :
--   ecoles  + logo text : NULL = pas de logo ; sinon l'image en « data URL »
--             (« data:image/png;base64,… », « data:image/jpeg;base64,… » ou « data:image/webp;base64,… »),
--             210 000 caractères au plus (≈ 150 Ko d'image) ; contrainte `ecoles_logo_valide` : rien
--             d'autre qu'une image PNG / JPEG / WEBP encodée en base64 ne peut y être écrit.
--   RLS     inchangé : la politique `ecoles_proprietaire` de 0001 couvre déjà toutes les colonnes de
--           la table (ses écoles seulement, compte actif, pour TOUTES les opérations) ; `anon` n'a
--           aucun droit ; l'administrateur ne voit pas les écoles des professeurs, ni donc leur logo.
--
-- Pourquoi une colonne plutôt que Supabase Storage : un logo pèse au plus ≈ 150 Ko et il n'y en a
-- qu'un par école ; la colonne hérite du RLS existant sans rien ouvrir de plus (pas de seau ni de
-- politiques de stockage à écrire et à garder justes), part avec l'école (suppression de l'école, du
-- compte : cascade de 0001) et se lit avec une requête ordinaire. Le site ne la lit PAS avec la liste
-- des écoles chargée sur chaque page : seulement dans les Réglages et au moment d'imprimer.
--
-- Pourquoi `ecoles` est sûre à relancer : ses droits sont donnés à la TABLE entière (0001 :
-- `grant select, insert, update, delete on public.ecoles to authenticated`) — la nouvelle colonne y est
-- couverte sans droit de colonne, et relancer 0001 plus tard ne retire rien.
-- =================================================================================================

alter table public.ecoles add column if not exists logo text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'ecoles_logo_valide' and conrelid = 'public.ecoles'::regclass
  ) then
    alter table public.ecoles add constraint ecoles_logo_valide
      check (
        logo is null
        or (
          char_length(logo) <= 210000
          and logo ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$'
        )
      );
  end if;
end;
$$;

comment on column public.ecoles.logo is
  'Logo facultatif de l''école (cartouche des documents) : image PNG / JPEG / WEBP en data URL base64, ≈ 150 Ko au plus ; NULL = pas de logo.';

-- Droits et RLS : ceux de 0001 (aucun changement ; rappelés pour qu'une base où ils auraient été
-- modifiés à la main retrouve l'état attendu).
revoke all on public.ecoles from anon;
grant select, insert, update, delete on public.ecoles to authenticated;
alter table public.ecoles enable row level security;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
