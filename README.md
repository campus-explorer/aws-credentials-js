# aws-credentials-js

JavaScript helper code to manage AWS credentials

## Install

    yarn add @campus-explorer/aws-credentials

## Usage

    import { getProfileCredentials, useProfile } from '@campus-explorer/aws-credentials';

    # Get an AWS.Credentials object for the profile
    const credentials = await getProfileCredentials('my-profile');

    # Alternatively, set AWS to use the profile
    await useProfile('my-profile');

## Description

This package is similar to AWS.SharedIniFileCredentials, in that it loads credentials using the shared credentials file. However, it adds a few features:

-   integration with the AWS CLI cache
-   longer durations

## Session Durations

By default, we will cache profiles that end in '-admin' for 1 hour, and all other profiles for 8 hours.

## Functions

### getProfileCredentials()

Returns an AWS.Credentials object.

    getProfileCredentials(
        profile,
        { // optional options
            cacheDir, // optional, defaults to ~/.aws/cli/cache
            duration, // optional, defaults to duration rules noted above,
            getMfaToken, // optional, defaults to usinq inquirer
        },
    })

### useProfile()

Loads the profile's credential into the enviornment and the global credentials settings for the AWS SDK.

    useProfile({
        /* ... same options as getProfileCredentials() */
    })
