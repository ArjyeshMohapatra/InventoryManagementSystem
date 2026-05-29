import { Injectable, inject } from '@angular/core';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { CategoryRepository } from '../../../core/api/repositories/category.repository';
import { Category } from '../models/category.model';
  
@Injectable({
providedIn: 'root'
})
export class CategoryQueryService {

private repo = inject(CategoryRepository);
private queryClient = inject(QueryClient);

getCategoriesQuery() {
    return injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () =>firstValueFrom(this.repo.getCategories()),
    staleTime: 1000 * 60 * 5
    }));
}

getCategoryQuery(id: () => string) {
    return injectQuery(() => ({
    queryKey: ['categories', id()],
    queryFn: () => firstValueFrom(this.repo.getCategoryById(id()))
    }));
}

addCategoryMutation() {
    return injectMutation(() => ({
    mutationFn: (category: Category) => firstValueFrom(this.repo.addCategory(category)),
    onSuccess: () => {
        this.queryClient
        .invalidateQueries({queryKey:['categories']});
    }
    }));
}

updateCategoryMutation() {
    return injectMutation(() => ({
    mutationFn: (category: Category) => firstValueFrom(this.repo.updateCategory(category)),
    onSuccess: () => {
        this.queryClient
        .invalidateQueries({queryKey: ['categories']});
    }
    }));
}

deleteCategoryMutation() {
    return injectMutation(() => ({
    mutationFn: (id: string) => firstValueFrom(this.repo.deleteCategory(id)),
    onSuccess: () => {
        this.queryClient
        .invalidateQueries({queryKey: ['categories']});
    }
    }));
}

}