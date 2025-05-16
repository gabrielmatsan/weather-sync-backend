export class FavoritePlacesNotFoundError extends Error {
    constructor() {
        super("Favorite places not found");
    }
}
