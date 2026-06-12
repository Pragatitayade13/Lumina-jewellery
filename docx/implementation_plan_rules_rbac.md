# Implementation Plan: Updated Rules & Enterprise RBAC Matrix

This plan designs the security configuration update for `firestore.rules` to incorporate missing enterprise roles: `company_admin`, `store_admin`, `finance`, `logistics`, and `delivery_partner`.

---

## 1. Security Gaps Identified
*   **Role Denial:** Users with roles `company admin`, `store admin`, `finance`, or `logistics` are currently falling to the default deny-all block when performing transactions, managing shipments, or auditing orders because helper checks (like `isStaffOrHigher`) only validate `admin`, `superadmin`, `manager`, and `staff`.
*   **No Read Access for Finance:** Standard staff members can read transactions, but dedicated `finance` users are not explicitly checked for transaction/payment read access.
*   **Logistics Verification:** Delivery tracking updates and shipment allocations do not grant read/write access to the `logistics` role.

---

## 2. Enterprise RBAC Matrix

| Role | Orders | Inventory | Finance | Logistics | Delivery | Customers | Reports |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | R/W | R/W | R/W | R/W | R/W | R/W | R/W |
| **Company Admin**| R/W | R/W | R/W | R/W | R/W | R/W | R/W |
| **Store Admin** | R/W | R/W | R/W | R/W | R/W | R/W | R |
| **Manager** | R/W | R/W | R | R/W | R | R/W | R |
| **Staff** | R/W | R/W | - | R | - | R/W | - |
| **Finance** | R | - | R/W | - | - | R | R |
| **Logistics** | R | - | - | R/W | R | R | - |
| **Delivery** | R | - | - | R/W (Own) | R/W (Own) | - | - |
| **Customer** | R/W (Own)| R | - | R (Own) | R (Own) | R/W (Own)| - |

---

## 3. Updated `firestore.rules` Helper Functions

We will define updated role helpers to resolve these gaps securely:
```javascript
    function isCompanyAdmin() {
      return isAuthenticated() && (getUserRole() == 'companyadmin' || getUserRole() == 'company admin' || getUserRole() == 'company_admin');
    }

    function isStoreAdmin() {
      return isAuthenticated() && (getUserRole() == 'storeadmin' || getUserRole() == 'store admin' || getUserRole() == 'store_admin');
    }

    function isFinance() {
      return isAuthenticated() && getUserRole() == 'finance';
    }

    function isLogistics() {
      return isAuthenticated() && getUserRole() == 'logistics';
    }

    function isDeliveryPartner() {
      return isAuthenticated() && (getUserRole() == 'delivery' || getUserRole() == 'delivery partner' || getUserRole() == 'delivery_partner');
    }

    // Comprehensive check for standard corporate access
    function isStaffOrHigher() {
      return isAuthenticated() && 
        (getUserRole() == 'admin' || 
         getUserRole() == 'superadmin' || 
         getUserRole() == 'staff' || 
         getUserRole() == 'manager' ||
         isStoreAdmin() ||
         isCompanyAdmin()
        );
    }
```

---

## 4. Testing Plan & Migration Strategy

### Automated Rule Testing
*   Write unit tests using `@firebase/rules-unit-testing` simulating requests for each role and verify that:
    *   A `finance` user can read/write to `/transactions/{docId}` but is blocked from `/products/{productId}`.
    *   A `logistics` user can update `/shipments/{docId}`.
    *   A `customer` cannot access `/transactions`.

### Migration Strategy
1.  Verify role names stored in existing user documents.
2.  Deploy updated `firestore.rules` using the Firebase CLI:
    ```bash
    firebase deploy --only firestore:rules
    ```
