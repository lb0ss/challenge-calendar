export class User {
    constructor(
        public email: string, 
        public id: string, 
        private _token: string, 
        private _tokenExpirationDate: Date) {
    }
    get token() {
        // check if a token exists
        if (!this._token) {
            return null;
        }
        // if a token exists,
        // check if token has expired or a expiration date exists
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }

        // if a token exists and it
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