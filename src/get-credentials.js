const getProfileConfig = require('./profile-config');
const getRoleCredentials = require('./get-role-credentials');
const getStaticCredentials = require('./get-static-credentials');
const makeCredentialsObj = require('./make-credentials-obj');

/** @type {(params: { profile: string, duration?: number, getMfaToken: (mfaSerial: string) => Promise<{ token: string }>}) => Promise<AWS.Credentials>} */
const getCredentials = async ({ profile, duration, getMfaToken }) => {
    const profileConfig = getProfileConfig(profile);
    const values = profileConfig.role_arn
        ? await getRoleCredentials({ profile, duration, getMfaToken })
        : await getStaticCredentials(profile);
    return makeCredentialsObj(values);
};

module.exports = getCredentials;
