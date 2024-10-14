import { OAuth2Client } from "google-auth-library";

class AuthService {
    constructor() {
        this.oauthClient = new OAuth2Client();
    }

    async verifyGoogleIdToken(idToken) {
        try {
            const response = await this.oauthClient.verifyIdToken({
                idToken,
                audience: [
                    '216357245101-rv0v2lpq0qobanal44t36ah3tfrmepdc.apps.googleusercontent.com',
                    '216357245101-3704ig9b328jphh1pv7pqjc2m6r4h5q2.apps.googleusercontent.com'
                ],
            });
            const payload = response.getPayload();

            if (payload) {
                const { email, name } = payload;
                return { email, name };
            } else {
                throw new Error('Token is invalid');
            }
        } catch (e) {
            throw new Error('Error verifying token: ' + e.message);
        }
    }
}

export default new AuthService();