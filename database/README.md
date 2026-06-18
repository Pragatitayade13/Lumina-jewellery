# Lumina Jewels Database Configuration

This folder contains the Firebase rules and indexes configuration for firestore and cloud storage.

## Deployment Instructions

To deploy security rules and indexes, make sure you have the Firebase CLI installed, and then run:

```bash
cd database
firebase login
firebase use default
firebase deploy --only firestore,storage
```
