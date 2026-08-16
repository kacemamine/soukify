# SOUKIFY

SOUKIFY est un Proof of Concept (PoC) de marketplace digitale dédiée à l'artisanat marocain.

Le projet vise à faciliter la création de fiches produits, la gestion des demandes personnalisées et la mise en relation avec les artisans grâce à l'intelligence artificielle.

---

## Fonctionnalités principales

### 1. AI-Powered Listing

Le module AI-Powered Listing permet de générer automatiquement une fiche produit à partir d'une image.

L'utilisateur peut importer une photo d'un produit artisanal. Gemini analyse ensuite l'image et génère :

- le titre du produit ;
- une description en français ;
- une description en arabe ;
- la catégorie ;
- la matière ;
- le style ;
- les couleurs dominantes ;
- les tags de recherche.

Les champs restent modifiables avant validation.

Le produit peut ensuite être enregistré dans MongoDB.

---

### 2. Bespoke Commissions

Le module Bespoke permet à un client de créer une demande de produit personnalisé.

La demande peut contenir notamment :

- une description ;
- les dimensions ;
- la matière ;
- les couleurs ;
- une inspiration ;
- le budget ;
- l'échéance ;
- la catégorie ;
- la région.

Les demandes sont enregistrées dans MongoDB.

---

### 3. Matching artisans

Après la création d'une demande Bespoke, SOUKIFY recherche les artisans correspondant aux besoins du client.

Le prototype utilise un système de scoring basé sur :

- Catégorie : 50 points
- Savoir-faire : 20 points
- Région : 20 points
- Disponibilité : 10 points

Score maximal :

```text
100 points