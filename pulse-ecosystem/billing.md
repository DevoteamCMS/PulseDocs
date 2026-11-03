---
title: Plans & Billing
layout: default
parent: Pulse Ecosystem
nav_order: 8
---

# Plans & Billing
{: .no_toc }

Pulse has two self-service plans: **Pulse Essential**, which is free, and **Pulse Premium**, a monthly subscription. You choose and change plans on the **Subscription Plans** page, and manage payment on the **Billing** page. Both are in the **Administration** menu.

Only users with the **Owner** role can upgrade, cancel, pay invoices, manage cards or edit billing details. Other roles can open both pages, but those actions are locked for them. See [User Management](user-management.md) for the roles.

1. TOC
{:toc}

## Plans

### Pulse Essential

Free, and where every customer starts. It covers the Cloud Essentials pages: Recommendations, Costs (monthly), Budget & Alerts, Assets and Ownership, Tags, Locations, Security Alerts and Compliance State. Budgets are visible but send no email alerts. See [Cloud Essentials](cloud-inventory.md) for each page.

### Pulse Premium

Everything in Pulse Essential, plus:

- **[Cloud Economics](cloud-economics/README.md)** - Cost Analysis (monthly and daily), Cost Savings recommendations and Budget & Alerts management.
- **[Cloud Compliance](cloud-compliance/README.md)** - Compliance Analysis, Policy Manager, Exemptions and Remediation Planner.

### Free Trial

Every new customer starts with a **3-month trial of Pulse Premium**. Existing customers start one when it is enabled for their company.

While the trial runs, the header shows the date it ends and an **Upgrade to Premium** button. Reminders appear 30 days and 14 days before the end, and on the last day. When the trial ends, the Cloud Economics and Cloud Compliance pages are no longer available and the company continues on Pulse Essential. You can upgrade at any point during the trial.

## Upgrade to Premium

You need at least one onboarded cloud before you can upgrade. Until then the **Upgrade** button is locked. See [Cloud Onboarding](onboarding/README.md).

1. Open **Administration → Subscription Plans**. **Upgrade to Premium** in the header and **Adjust Plan** on the Billing page lead there too.
2. On the **Pulse Premium** card, select **Upgrade**.

   If your account has less than 30 days of cost history, a dialog explains that some Premium insights fill in as history builds up. Select **Continue** to upgrade anyway.
3. Under **Company Details**, enter the company name, company ID, address, city, postal code, country, billing contact email and **Tax ID** (a VAT number, EIN, GSTIN, GST/HST number, ABN or other business tax ID). The payment step unlocks once these are saved.
4. Under **Payment Information**, choose a saved card or add a new one. Card payments are processed by Stripe. The card you pay with becomes your default card.
5. Check the order summary (monthly fee, VAT and subtotal) and select **Pay Now and Subscribe**.
6. Pulse shows **Activating Premium…** while the subscription is set up, which usually takes a few seconds, then **Welcome to Premium!**

   If activation takes longer, the page confirms the payment was received. Premium appears on the Subscription Plans page once it is ready.

From then on the subscription is charged to your default card automatically every month. Each billing period runs from the day you paid.

## Cancel Premium

1. Open **Administration → Subscription Plans**.
2. On the **Pulse Essential** card, select **Select**.
3. Confirm **Downgrade**.

Premium stays active until the end of the current billing period, then Pulse Essential starts. Until that date, the Subscription Plans and Billing pages show the date Premium ends. When the period ends, Pulse shows a notice that your plan has changed to Pulse Essential.

There are no refunds, including for the rest of a cancelled period.

### Undo a Cancellation

Until the period ends, select **Revoke Cancellation** on the Pulse Premium card or on the Billing page. Premium then renews as normal.

After the period has ended, upgrade again as described in [Upgrade to Premium](#upgrade-to-premium).

## Pay a Failed Payment

If a monthly payment fails, Pulse keeps trying to collect it for 7 days. **Premium features stay available during that time.** A red banner appears across the portal saying the payment is overdue and how many days are left to pay. If the payment still fails after 7 days, Premium features are disabled.

To pay it yourself:

1. Open **Administration → Billing**, or select **Go to Billing** in the banner.
2. In **Invoices**, find the invoice marked **Overdue** and select **Pay Now**.
3. Choose a saved card or add a new one, then confirm the payment.
4. Pulse confirms **Payment received**.

If the payment fails again, you are not charged and the invoice stays overdue. Check the card details and select **Retry**, or try another card.

## The Billing Page

- **Current Plan** - your plan and monthly price, the date it became active and the next billing date. **Adjust Plan** opens Subscription Plans.
- **Billing Details** - the company and tax details used on invoices. Select **Update** to change them.
- **Card Details** - your saved cards. Add a card, set the default card, or remove one. You cannot remove the card your subscription uses until you set another card as the default. You need to complete Billing Details before adding a card.
- **Invoices** - every invoice with its date, service, price, the card used and its payment status. Download any invoice, or pay an overdue one with **Pay Now**.

| Payment Status | Meaning |
|:---------------|:--------|
| **Draft** | Not yet issued. |
| **Open** | Issued and awaiting payment. |
| **Overdue** | Payment failed and is being retried. |
| **Paid** | Paid in full. |
| **Past Due** | Could not be collected. |
| **Cancelled** | Voided and no longer payable. |
