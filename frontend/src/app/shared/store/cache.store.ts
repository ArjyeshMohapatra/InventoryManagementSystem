import { signal } from "@angular/core";

export abstract class CacheStore{
    loading = signal(false);
    error = signal<string | null>(null);
    lastLoaded = signal(0);
    ttl = 1000 * 60 * 2;

    protected isCacheValid(hasData: boolean) {
        const cacheAge = Date.now() - this.lastLoaded();
        const cacheValid = cacheAge < this.ttl;
        return (hasData && cacheValid);
    }
}