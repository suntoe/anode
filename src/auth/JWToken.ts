import AuthToken = require('./AuthToken');


export default class JWToken extends AuthToken {

    /**
     * 
     */
    internalCopy() {
        return new JWToken( this.userId, this.expireByMinutes, this.roles, this.data, true );
    }

}

