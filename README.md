# Radar — Partage de position

Deux pages :
- **`partage.html`** — la personne se connecte avec son propre compte, active ou désactive elle-même le partage de sa position via un interrupteur visible, à tout moment.
- **`dashboard.html`** — le compte propriétaire de la plateforme y voit la liste et la carte des personnes qui partagent *actuellement*.

Backend : **Firebase** (Authentication + Firestore). Hébergement statique : **GitHub Pages**.

## Le principe qui protège tout le monde

- Chaque personne suivie a **son propre compte** et **son propre document** dans Firestore.
- Elle seule peut écrire dans son document (activer/désactiver le partage, mettre à jour sa position). Le propriétaire ne peut jamais le forcer.
- Le propriétaire ne peut lire un document que si `sharing == true` **au moment de la lecture**. Dès que la personne repasse l'interrupteur sur désactivé, ferme la page ou se déconnecte, sa position disparaît du tableau de bord — appliqué par les **règles de sécurité Firestore**, donc même en modifiant le tableau de bord on ne peut pas contourner ça.
- Il n'y a aucune commande à distance (pas de verrouillage, pas d'effacement) — uniquement de la position, et seulement quand elle est activement partagée.

## 1. Configurer Firebase

1. Dans la [console Firebase](https://console.firebase.google.com), ouvre ton projet.
2. **Authentication** → *Sign-in method* → active **E-mail/Mot de passe**.
3. **Firestore Database** → crée la base si besoin (mode production).
4. **Paramètres du projet** → *Vos applications* → copie l'objet `firebaseConfig`.
5. Colle-le dans **`partage.html`** ET **`dashboard.html`**, à la place des `"REMPLACE_MOI"`.

## 2. Créer le compte propriétaire et récupérer son UID

1. Ouvre `dashboard.html` en local (ou une fois déployé) et... il n'y a pas de bouton "créer un compte" ici volontairement, pour que le propriétaire ne se crée pas par erreur depuis la page publique. Crée plutôt ce compte une fois, directement dans la console Firebase : **Authentication** → *Users* → *Add user* → renseigne l'e-mail et le mot de passe du propriétaire.
2. Une fois créé, clique sur cet utilisateur dans la liste : son **UID** s'affiche (une longue chaîne de caractères).
3. Ouvre `firestore.rules` et remplace `OWNER_UID_ICI` par cet UID exact (garde les guillemets).

## 3. Déployer les règles Firestore

**Option A — console**
Firestore Database → onglet *Règles* → colle le contenu de `firestore.rules` (avec l'UID déjà remplacé) → *Publier*.

**Option B — CLI**
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# remplace le firestore.rules généré par celui fourni ici
firebase deploy --only firestore:rules
```

## 4. Déployer sur GitHub Pages

```bash
git init
git add partage.html dashboard.html README.md
git commit -m "Plateforme de partage de position (Firebase)"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/NOM-DU-DEPOT.git
git push -u origin main
```
Puis **Settings → Pages → Source: Deploy from a branch → main → /(root)**.

Ensuite, dans Firebase → **Authentication → Settings → Authorized domains**, ajoute le domaine `TON-PSEUDO.github.io`.

## 5. Utilisation

1. Chaque personne ouvre `partage.html`, crée son propre compte, et active l'interrupteur quand elle veut être visible.
2. Le propriétaire ouvre `dashboard.html`, se connecte avec le compte dont l'UID a été inscrit dans les règles, et voit la liste de celles et ceux qui partagent en ce moment, avec leur position sur la carte.
3. Dès qu'une personne désactive le partage, elle sort de la liste, immédiatement.

## Modèle de données Firestore

`sharers/{uid}` : `uid`, `name`, `sharing` (bool, contrôlé uniquement par la personne elle-même), `lat`, `lng`, `battery`, `lastSeen`.
