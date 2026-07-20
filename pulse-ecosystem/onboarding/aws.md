---
title: AWS
layout: default
parent: Onboarding
grand_parent: Pulse Ecosystem
nav_order: 3
---

# AWS Onboarding

## AWS Onbaording Overview

AWS cloud onboarding using single credentials for Organisation with many Accounts.

Clients would require creating one IAM user credentials in any account and create roles for all Accounts (including management). To discover Accounts Pulse must assume role on Management Account.

Supported Scenarios:
- IAM user created in Management Account on Customer Organisation side
- IAM user created in Child Account on Customer Organisation side
- IAM user created in Account on Service Provider Organisation side

Required parameters:
- Access Key ID
- Secret Access Key
- Role Name
- Customer Management Account ID

## Customer Prerequisites - Creating IAM User and Roles

Customer must follow bellow requirements and prepare for onboarding as follows:

1. Login to AWS Cloud portal

   Note! IAM user can be created in Customers Management or any other Account, even in another organisation.

2. Create new IAM user (for example named: 'pulse') under any Account, follow documentation: [Creating an IAM user in your AWS account](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

   For programmatic access, a third-party Access key needs to be created, the Access key ID and Secret access key will be required to onboard organisation with accounts.

3. IAM user need permission to assume roles, add customer inline configuration named as 'Assume_Pulse_Viewer_Role' with statement bellow:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "Statement1",
               "Effect": "Allow",
               "Action": [
                   "sts:AssumeRole"
               ],
               "Resource": "arn:aws:iam::*:role/Pulse_Viewer"
           }
       ]
   }
   ```

4. Roles must be created and used for all accounts including management account.

   - Name: Pulse_Viewer (or your naming standard, remember replace user permissions accordingly)
   - Role: `ReadOnlyAccess` (built in role, AWS managed - job function) and custom permission `"trustedadvisor:List*"`

   Or:

   Important! Take note that with new functionality we may require new permissions

   a. Create a Permissions Policy named 'Pulse_View_Resources_policy' in IAM on each Account. Alternatively, a combination of roles/policies can be used, so long as result has all of the permissions listed below.

   b. Add permissions either via services or edit JSON directly:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "VisualEditor0",
               "Effect": "Allow",
               "Action": [
                   "sts:GetCallerIdentity",
                   "organizations:DescribeOrganization",
                   "organizations:DescribeAccount",
                   "organizations:ListAccounts",
                   "account:ListRegions",
                   "backup:ListBackupJobs",
                   "backup:ListProtectedResources",
                   "cloudformation:GetResource",
                   "cloudformation:ListResources",
                   "config:DescribeDeliveryChannels",
                   "config:DescribeConfigurationRecorderStatus",
                   "config:ListDiscoveredResources",
                   "config:SelectResourceConfig",
                   "guardduty:GetFindings",
                   "guardduty:ListFindings",
                   "guardduty:ListDetectors",
                   "inspector:ListFindings",
                   "inspector:DescribeFindings",
                   "inspector2:ListFindings",
                   "ssm:DescribeMaintenanceWindows",
                   "ssm:ListCommandInvocations",
                   "tag:GetResources",
                   "trustedadvisor:List*"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

   **Trust Relationships**

   add example bellow, by changing `<UserAccountID>` to Account ID where you created IAM user and IAM user name:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "Statement1",
               "Effect": "Allow",
               "Principal": {
                   "AWS": [
                       "arn:aws:iam::<UserAccountID>:user/pulse"
                   ]
               },
               "Action": "sts:AssumeRole",
               "Condition": {}
           }
       ]
   }
   ```

5. For getting Cloud resources enable Config service and do this for all (or relevant where resources deployed) regions: Change Region, Open AWS Config Service, select '1-click setup', select 'Confirm'. Change Account. Enable Config for all regions. Repeat for all Accounts and all Regions.

## Customer Prerequisites - Creating Cost Export

Customer must follow bellow requirements and prepare cost export to proceed on onboarding to PULSE platform. To start collecting your Cloud Billing data, you must create cost export following this guide steps you need to do:

1. Login to Cloud portal
2. Open Billing and Cost Management, Select menu: Data Exports
3. Press Create and select options:
   - Standard data export
   - Enter Export name: 'DailyExports'
   - Select 'Include resource IDs'
   - Select 'Split cost allocation data'
   - Select 'Daily'
   - Leave Selection 'Column selection (125/125)' as is
   - Select 'gzip - text/csv'
   - Select 'Overwrite existing data export file'
   - Configure S3, general purpose bucket, name it for example `<prefix#-costexports-s3bucket-no#>`, select your usually used region.
   - Enter S3 path prefix: 'Pulse'
   - Create!
4. You need to wait for data to come in before proceeding, usually AWS sends information twice over 24 hours.
5. Open S3 Service
6. Select S3 Bucket you just created
7. Open twice objects (folders) prefix and export names, until you see data and metadata objects
8. Copy browser URL for later use.

If you are using custom permission sets for access then update to include additional permissions to access this bucket, add additional set named 'Pulse_Costs_Viewer' (change `<bucketname>`).

## PULSE Configuration - Onboarding SA

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add AWS credentials
   - Access Key ID
   - Secret Access Key
   - Role Name (optional, but preferred way)
   - Customer Management Account ID
4. Save [done]

## PULSE Configuration - Onboarding Cost Export

1. Login to [PULSE](https://pulse.devoteam.com/platform/login) platform
2. Open [Cloud Management](https://pulse.devoteam.com/platform/cloud-management) under Administration (left bottom corner)
3. Add Billing Export Configuration
   - Project Name [Account name where cost export data set is located]
   - Cost Export URL [Example: `https://us-east-1.console.aws.amazon.com/s3/buckets/costexportss3bucket?region=us-east-1&bucketType=general&prefix=Pulse/DailyExports/`]
4. Save [done]
