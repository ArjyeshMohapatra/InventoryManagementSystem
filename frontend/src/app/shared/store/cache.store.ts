import { signal } from "@angular/core";

export abstract class CacheStore{
    loading = signal(false);
    error = signal<string | null>(null);
    lastLoaded = signal(0);
    fetching = signal(false);
    refreshing = signal(false);

    ttl = 1000 * 60 * 2;
    retryCount = 3;
    retryDelay = 1000;

    protected isCacheValid(hasData: boolean) {
        const cacheAge = Date.now() - this.lastLoaded();
        const cacheValid = cacheAge < this.ttl;
        return (hasData && cacheValid);
    }
}