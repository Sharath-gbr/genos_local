# Genos App Data Types Documentation

## Airtable Schema

### Recipes Table

| Column Name    | Data Type       | Description                                    | Example Value                |
|---------------|-----------------|------------------------------------------------|----------------------------|
| Recipe Name   | Single line text| Name of the recipe                            | "Chicken Francoise"        |
| Dish Image    | Attachment     | Image of the dish (returns array or object)    | `[{url: "https://..."}, ...]` |
| Ingredients   | Long text      | List of ingredients with each on new line      | "- 2 chicken breasts\n- salt" |
| Instructions  | Long text      | Numbered steps for recipe preparation          | "1. Preheat oven\n2. Season" |
| Calories      | Number         | Total calories per serving                     | 450                        |
| Carbs         | Number         | Carbohydrates in grams                         | 30                         |
| Proteins      | Number         | Protein content in grams                       | 25                         |
| Fats          | Number         | Fat content in grams                           | 15                         |
| Diet Type     | Multiple select| Dietary categories (can have multiple)         | ["Vegetarian", "Eggetarian"] |
| Meal Type     | Single select  | Type of meal (e.g., Breakfast, Lunch)         | "Breakfast"                |
| Phase         | Single select  | Recipe's phase in the program                  | "Preparatory Phase"        |

## API Response Types

### Recipe Interface
```typescript
interface Recipe {
  id: string;              // Airtable record ID
  name: string;            // Recipe Name field
  image: string;           // Processed URL from Dish Image attachment
  ingredients: string;     // Raw ingredients text
  instructions: string;    // Raw instructions text
  calories: number;        // Calories field
  carbs: number;          // Carbs field
  proteins: number;        // Proteins field
  fats: number;           // Fats field
  dietType: string[];     // Diet Type multiple select values
  mealType: string;       // Meal Type single select value
  phase: string;          // Phase single select value
}
```

### API Endpoints

#### GET /api/recipes
- **Authentication**: Requires valid session
- **Response**: Array of Recipe objects
- **Error Responses**:
  - 401: Unauthorized (no valid session)
  - 500: Server error

## Data Processing Notes

1. **Filter Handling**:
   - Diet Type is a multiple select field returning string[]
   - Meal Type is a single select field returning string
   - Phase is a single select field returning string
   - Filters must be applied together (AND logic)
   - Search suggestions must respect current filter state

2. **Phase Values**:
   - "Preparatory Phase"
   - "Detox Phase"
   - "Low-carb Reintroductions Phase"
   - "High-carb Reintroductions Phase"
   - Case-sensitive matching in Airtable
   - Case-insensitive comparison in frontend

3. **Filter Combinations**:
   - All filters (Diet, Meal, Phase) work together with AND logic
   - Empty or 'all' filter values are ignored
   - Search applies within filtered results
   - UI updates to show active filter combinations

2. **Search Implementation Best Practices**:
   - Use filteredRecipes for search suggestions, not raw recipes
   - Search should always work within current filter context
   - Handle both single and multiple value fields appropriately
   - Maintain case-insensitive comparisons throughout

3. **Component State Management**:
   - Avoid duplicate component definitions
   - Use dynamic imports carefully, especially with MUI components
   - Maintain consistent naming to prevent conflicts
   - Clear separation between client-side and SSR components

## Known Issues and Solutions

1. **Filter Integration**:
   ```typescript
   // Correct way to handle multiple filters
   const filteredRecipes = recipes.filter(recipe => {
     const matchesDiet = dietFilter === 'all' || (
       Array.isArray(recipe.dietType) && 
       recipe.dietType.some(type => type?.toLowerCase() === dietFilter.toLowerCase())
     );
     const matchesCategory = menuCategory === 'all' || (
       recipe.mealType?.toLowerCase() === menuCategory.toLowerCase()
     );
     return matchesDiet && matchesCategory;
   });
   ```

2. **Search Integration**:
   ```typescript
   // Correct way to implement search with filters
   <AutocompleteSearch
     options={Array.from(new Set(filteredRecipes.map(r => r.name)))}
     // ... other props
   />
   ```

## Common Pitfalls to Avoid

1. **Component Definition**:
   - ❌ Don't import and dynamically import the same component
   - ✅ Use consistent naming for dynamic imports
   - ✅ Handle SSR appropriately with dynamic imports

2. **Filter Logic**:
   - ❌ Don't apply filters independently
   - ✅ Combine filters with AND logic
   - ✅ Respect filter state in search suggestions

3. **Search Implementation**:
   - ❌ Don't use unfiltered data for search suggestions
   - ✅ Always use filteredRecipes for search options
   - ✅ Maintain filter context in search results

## Development Guidelines

1. **Before Implementation**:
   - Verify data types from Airtable
   - Check if fields are single or multiple select
   - Plan filter combinations and logic
   - Consider search integration with filters

2. **During Implementation**:
   - Add debug logging for complex operations
   - Test filter combinations thoroughly
   - Verify search behavior with filters
   - Check component naming conflicts

3. **After Implementation**:
   - Test edge cases (empty states, multiple filters)
   - Verify search suggestions match filter state
   - Ensure consistent case handling
   - Document any special handling required

## Testing Checklist

1. **Filter Functionality**:
   - [ ] Single filter works correctly
   - [ ] Multiple filters work together
   - [ ] Case-insensitive matching works
   - [ ] Empty states handled properly

2. **Search Integration**:
   - [ ] Search respects current filters
   - [ ] Suggestions match filtered data
   - [ ] Multiple word search works
   - [ ] Duplicate recipes handled correctly

3. **Component Behavior**:
   - [ ] No naming conflicts
   - [ ] SSR handled correctly
   - [ ] State updates are efficient
   - [ ] UI feedback is clear

## Frontend Components

### PlatePlanner Component
- Handles recipe filtering based on diet type
- Manages recipe selection and modal display
- Processes and displays nutritional information

### DietFilter Component
- Client-side only component (no SSR)
- Handles diet type selection
- Available options: "all", "Vegetarian", "Non-Vegetarian", "Eggetarian"

## Known Limitations

1. Image field requires multiple format handling
2. Diet Type filtering is case-sensitive
3. Text fields (ingredients/instructions) require cleanup of formatting

## Future Improvements

1. **Search Enhancements**:
   - Add fuzzy search for better typo tolerance
   - Implement search history
   - Add keyboard navigation
   - Support advanced filter combinations

2. **Filter Improvements**:
   - Add filter combinations presets
   - Implement filter history
   - Add clear all filters option
   - Show active filter indicators

## Search Functionality

### Overview
The recipe search system provides a comprehensive search experience with the following features:
- Real-time search suggestions
- Fuzzy matching for typo tolerance
- Integration with filters (Diet Type and Menu Category)
- Support for multiple recipes with the same name
- Search within filtered results

### Search Implementation Details

#### Search Components
1. **Autocomplete Input**
   - Uses MUI Autocomplete component
   - Provides real-time suggestions as you type
   - Shows recipe count for duplicate names
   - Maintains consistent theme styling

2. **Search Algorithm**
   - Debounced search (300ms) to prevent excessive API calls
   - Case-insensitive matching
   - Multi-word search support
   - Partial word matching

3. **Filter Integration**
   - Search works within currently applied filters
   - Results respect both Diet Type and Menu Category filters
   - Dynamic result count updates

#### Search Behavior

1. **Basic Search**
   - Matches recipe names containing the search term
   - Updates results in real-time as you type
   - Shows suggestions based on available recipes

2. **Multiple Word Search**
   - Splits search query into terms
   - Matches recipes containing all terms
   - Order of terms doesn't matter

3. **Duplicate Handling**
   - Groups recipes with identical names
   - Shows count of available variations
   - Preserves all matching recipes in results

4. **Filter Interaction**
   - Search within current filter context
   - Maintains filter state while searching
   - Updates results when filters change

### User Interface Elements

1. **Search Bar**
   ```typescript
   <Autocomplete
     freeSolo
     options={recipeNames}
     value={searchQuery}
     onChange={(_, newValue) => setSearchQuery(newValue)}
   />
   ```

2. **Results Display**
   - Shows total recipe count
   - Indicates current search term
   - Displays active filters

3. **Styling**
   - Consistent with app theme
   - Orange accent colors
   - Dark mode optimized

### Example Usage

1. **Basic Search**
   - Type recipe name to see matches
   - Select from suggestions or type custom search

2. **Filtered Search**
   - Select diet preference (e.g., "Vegetarian")
   - Choose menu category (e.g., "Breakfast")
   - Search within filtered results

3. **Handling Duplicates**
   - Multiple recipes with same name shown
   - Count indicator for duplicates
   - All variations preserved in results

### Performance Considerations

1. **Optimization**
   - Debounced search to reduce API calls
   - Efficient filtering algorithm
   - Memoized results where appropriate

2. **State Management**
   - Controlled input for predictable behavior
   - Efficient updates using React hooks
   - Proper cleanup on unmount

### Future Improvements

1. **Search Enhancement**
   - Add ingredient-based search
   - Implement advanced filtering options
   - Add search history
   - Improve fuzzy matching algorithm

2. **UI Improvements**
   - Add search analytics
   - Implement recent searches
   - Add category-based quick filters

3. **Performance**
   - Implement server-side search for large datasets
   - Add result caching
   - Optimize suggestion algorithm

## Version History

### v1.0.0
- Initial implementation of recipe display
- Basic diet type filtering
- Modal view for recipe details

### v1.1.0
- Fixed search integration with filters
- Updated component naming to prevent conflicts
- Improved filter combination logic
- Added comprehensive documentation 

## Loading States

### Best Practices
1. **Initial Load**:
   - Show loading spinner with descriptive text
   - Display skeleton cards for recipe grid
   - Maintain consistent layout during load
   - Use theme-consistent colors and animations

2. **Loading State Components**:
   ```typescript
   // Loading indicator with text
   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
     <CircularProgress size={20} sx={{ color: '#FF5F1F' }} />
     <Typography>Loading recipes...</Typography>
   </Box>

   // Skeleton card for recipe grid
   <Paper sx={{
     backgroundColor: 'rgba(0, 0, 0, 0.7)',
     // ... styling properties
   }}>
     <Box sx={{ animation: 'pulse 1.5s infinite' }} />
   </Paper>
   ```

3. **Loading State Transitions**:
   - Smooth transition from loading to loaded state
   - Consistent height/width during transition
   - No layout shifts when content loads
   - Maintain filter/search UI during loading 