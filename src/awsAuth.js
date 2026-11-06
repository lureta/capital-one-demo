
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const region = "us-east-1";

export function getAwsCredentials(idToken) {
  return fromCognitoIdentityPool({
    clientConfig: { region },
    identityPoolId: "us-east-1:3bbf758e-390c-4db2-b733-595bdc383c92",
    logins: {
      "cognito-idp.us-east-1.amazonaws.com/us-east-1_71o99WmqJ":
        idToken,
    },
  });
}
