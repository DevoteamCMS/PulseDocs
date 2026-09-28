---
title: User Management
layout: default
parent: Pulse Ecosystem
nav_order: 5
---

# User Management
{: .no_toc }

User Management is where you decide who in your company can use Pulse and what each person is allowed to do. Every user has one **company role** that sets what they can see and change, and can hold **feature roles** on top of it for specific jobs. This page explains the roles and how to add, change and remove users.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Roles

### Company roles

Every user has exactly one company role. The four roles build on each other, from least access to most:

| Role | What it allows |
| --- | --- |
| **Company User** | Access is limited to what an Asset Group delegation grants. Without delegation, sees nothing beyond Cloud Essentials; with it, can view or manage the pages covered by the company's managed or premium services. |
| **Analyst** | Read-only across the company. Views Cloud Essentials and every page covered by the company's managed or premium services, but changes nothing. |
| **Manager** | Full operational access. Everything Analyst can view, plus managing users, cloud integrations, and the pages covered by the company's managed or premium services. Cannot assign the Owner role. |
| **Owner** | Full access to the company. Everything Manager can do, plus company settings and assigning any role. Sole access to billing and plans - no other role can view or change them. Only an Owner can make another user an Owner. |

Which pages a role opens depends on the services your company has. A role gives access to those pages but does not add services. See [Cloud Inventory](cloud-inventory.md) for what Cloud Essentials includes.

### Feature roles

A feature role grants access to one feature only. It is added **alongside** a company role and never replaces one.

| Role | What it allows |
| --- | --- |
| **Ownership Manager** | Scoped to Asset Ownership only. Creates Asset Groups, delegates users to them, and allocates assets. Carries no access outside that feature. |

See [Asset Ownership](asset-ownership.md) for what an Ownership Manager does, and how delegation limits what a Company User sees.

---

## Who Can Manage Users

Managers and Owners can add, edit and delete users. Other roles see the user list read-only: there is no **Add User** button, and users cannot be opened.

Some limits apply even to those who can manage users:

| Limit | Applies to |
| --- | --- |
| Only an Owner can assign the Owner role | Managers - the Owner option is greyed out |
| An existing Owner's roles cannot be changed, and the Owner cannot be deleted | Managers |
| You cannot change your own company role | Everyone - you can still change your own feature roles |
| You cannot delete yourself | Everyone |

---

## The User List

The **User Management** page lists every user in your company, with these columns:

| Column | Shows |
| --- | --- |
| **User Name** | The user's first and last name |
| **Email** | The address the user signs in with |
| **Company Role** | The user's company role |
| **Feature Role** | Any feature roles the user holds |
| **Last Login** | When the user last signed in |

Switch between the list and the card view with the view buttons in the toolbar, and export the full list to CSV.

---

## Add a User

1. On the **User Management** page, click **Add User**.
2. In the **Add User** panel:
   - **Email** - the address the new user will sign in with.
   - **Send an invitation email to the new user** - selected by default. Clear it if you do not want Pulse to email the user.
   - **Company Roles** - choose one.
   - **Feature Roles** - select any that apply.
3. Click **Add User**.

A confirmation appears once the user is created. The email address cannot be changed afterwards.

---

## Change a User's Roles

1. On the **User Management** page, click the user's name, or their card in the card view.
2. In the **Edit User** panel, change the **Company Roles** or **Feature Roles** selection.
3. Click **Submit**.

If you choose **Owner**, Pulse asks you to confirm first: *Owner grants full access to the company and the ability to make other users Owners.* Click **Assign Owner** to continue.

---

## Delete a User

1. Open the user as described above.
2. Click the delete button at the bottom of the **Edit User** panel.
3. Confirm the deletion.

---

## Questions and Answers

### The Add User button is not there
{: .no_toc }

Only Managers and Owners can add users. Ask one of them to add the user, or to change your role.

### I cannot select the Owner role
{: .no_toc }

Only an Owner can assign it. Ask an existing Owner.

### I cannot change a user's roles or delete them
{: .no_toc }

If you are a Manager and the user is an Owner, only another Owner can change or delete them.

### I cannot change my own company role
{: .no_toc }

Nobody can change their own company role. Ask another Manager or Owner. You can still change your own feature roles.

### How do I give someone access to only their team's assets?
{: .no_toc }

Give them the **Company User** role, then delegate them to their team's Asset Group. See [Asset Ownership](asset-ownership.md#delegating-users).

---

## Next Steps

- Connect your clouds on the **Cloud Management** page: [Cloud Onboarding](onboarding/README.md)
- Limit what users see to their own assets: [Asset Ownership](asset-ownership.md)
- Learn more about the platform: [Pulse Ecosystem](README.md)
