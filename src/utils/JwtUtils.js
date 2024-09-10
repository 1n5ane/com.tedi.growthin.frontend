export default class JwtUtils {

    static extractClaims(token) {
        const startIndex = token.indexOf('.');
        const endIndex = token.substring(startIndex + 1).indexOf('.');
        return JSON.parse(atob(token.substring(startIndex + 1, startIndex + 1 + endIndex)));
    }
}
