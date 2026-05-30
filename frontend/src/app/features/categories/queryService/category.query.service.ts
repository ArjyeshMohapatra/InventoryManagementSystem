import { Injectable, inject } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { CategoryRepository } from '../../../core/api/repositories/category.repository';
import { Category } from '../models/category.model';
  
@Injectable({
  providedIn: 'root' // Singleton service, available globally. Perfect for centralized query management.
})
export class CategoryQueryService {

  // Modern Angular DI. Cleaner than constructor injection.
  private repo = inject(CategoryRepository);
  private queryClient = inject(QueryClient);

  // ==========================================================================
  // QUERIES (Fetching Data)
  // ==========================================================================

  /**
   * Fetches the full list of categories.
   * Components call this and get a reactive Signal back containing { data, isLoading, isError, etc. }
   */
  getCategoriesQuery() {
    return injectQuery(() => ({
      // The unique identifier for this specific cache. 
      queryKey: ['categories'], 
      
      // TanStack Query expects Promises, but Angular's HttpClient returns Observables.
      // firstValueFrom() flawlessly bridges this gap by grabbing the first emission and resolving it.
      queryFn: () => firstValueFrom(this.repo.getCategories()),
      
      // Data remains "fresh" for 5 minutes. If another component requests this data 
      // within 5 minutes, it instantly gets the cached version without a network request.
      staleTime: 1000 * 60 * 5 
    }));
  }

  /**
   * Fetches a single category by ID.
   * @param id A function that returns a string. Passing a function/Signal instead of a raw value 
   * ensures that if the ID changes (e.g., URL parameter updates), the query automatically refetches!
   */
  getCategoryQuery(id: () => string) {
    return injectQuery(() => ({
      // The cache key includes the dynamic ID. E.g., ['categories', '123']
      queryKey: ['categories', id()],
      queryFn: () => firstValueFrom(this.repo.getCategoryById(id()))
    }));
  }

  // ==========================================================================
  // MUTATIONS (Creating, Updating, Deleting Data)
  // ==========================================================================

  /**
   * Creates a new category.
   */
  addCategoryMutation() {
    return injectMutation(() => ({
      mutationFn: (category: Category) => firstValueFrom(this.repo.addCategory(category)),
      
      // If the network request succeeds, we tell the queryClient that the 
      // ['categories'] cache is now garbage. Any component currently displaying the 
      // categories list will automatically trigger a background refetch to get the new item.
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    }));
  }

  /**
   * Updates an existing category.
   */
  updateCategoryMutation() {
    return injectMutation(() => ({
      mutationFn: (category: Category) => firstValueFrom(this.repo.updateCategory(category)),
      onSuccess: () => {
        // Nuke the main list cache to reflect the updated data
        this.queryClient.invalidateQueries({ queryKey: ['categories'] });
        
        // If you want to be extra thorough, you could also invalidate 
        // the specific item's cache here: 
        // this.queryClient.invalidateQueries({ queryKey: ['categories', category.id] });
      }
    }));
  }

  /**
   * Deletes a category.
   */
  deleteCategoryMutation() {
    return injectMutation(() => ({
      mutationFn: (id: string) => firstValueFrom(this.repo.deleteCategory(id)),
      onSuccess: () => {
        // Force the UI to refresh the list without the deleted item
        this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    }));
  }

  deleteCategoryWithProductsMutation() {
    return injectMutation(() => ({
      mutationFn: (categoryId: string) => firstValueFrom(this.repo.deleteCategoryWithProducts(categoryId)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['categories'] });
        this.queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }));
  }

}