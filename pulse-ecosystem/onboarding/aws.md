# AWS Onboarding

## AWS Onboarding Overview

AWS cloud onboarding utilizes single credentials for organizations with multiple accounts. Clients must create one IAM user and establish roles across all accounts, including the management account. "To discover Accounts Pulse must assume role on Management Account."

Supported scenarios include:
- IAM user created in Management Account
- IAM user created in Child Account
- IAM user created in Account on Service Provider Organisation side

Required parameters consist of Access Key ID, Secret Access Key, Role Name, and Customer Management Account ID.

## Customer Prerequisites - Creating IAM User and Roles

Follow these preparation steps:

1. Access the AWS Cloud portal
2. Create a new IAM user (e.g., named 'pulse') under any account
3. Generate programmatic access credentials with Access Key ID and Secret Access Key
4. Add inline policy named 'Assume_Pulse_Viewer_Role' to permit role assumption
5. Establish roles across all accounts with ReadOnlyAccess and trustedadvisor permissions
6. Enable AWS Config service across all regions for resource discovery

The custom permissions policy must include actions like "sts:GetCallerIdentity", "organizations:ListAccounts", "backup:ListBackupJobs", and numerous other service permissions for comprehensive resource visibility.

## Customer Prerequisites - Creating Cost Export

Configure billing data collection by:

- Accessing Billing and Cost Management
- Creating standard data export named 'DailyExports'
- Selecting daily export frequency with resource IDs and cost allocation data
- Configuring an S3 bucket with 'Pulse' path prefix
- Waiting for initial data population before proceeding

## PULSE Configuration

**For Service Account Onboarding:**
- Access Cloud Management in Administration
- Enter AWS credentials and Management Account ID

**For Cost Export Configuration:**
- Navigate to Cloud Management
- Input Project Name and Cost Export URL pointing to the S3 bucket
