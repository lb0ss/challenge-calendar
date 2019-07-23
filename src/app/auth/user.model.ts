export class User {
    constructor(
        public email: string, 
        public id: string, 
        private _token: string, 
        private _tokenExpirationDate: Date) {
    }
    get token() {
        // check if token is provided
        if (!this._token) {
            return null;
        }
        // if token is provided, 
        // check if token has expired or a expiration date exists
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }

        // if a token is provided OR an existing token 
        // hasn't expired, return the token
        return this._token;
    }

    // check if the user is authenticated
    get isAuth() {
        return !!this.token;  // '!!' converts this.token into a boolean
    }

    // calculates when the token will expire
    get timeToExpiry() {
        return this._tokenExpirationDate.getTime() - new Date().getTime();  // the remaining time in milliseconds
    }
    
}