'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { 
  Typography, 
  TextField,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Popper,
  Pagination,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { GridContainer } from '../../components/styled/Grid';
import { ContentBox } from '../../components/styled/ContentBox';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { debounce } from 'lodash';

// Interface definitions
interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: string;
  instructions: string;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
  dietType: string[];
  mealType: string;
  phase: string;
  proteinMealType: string;
  ingredients?: string[];
}

interface NutritionalRange {
  calories: [number, number];
  proteins: [number, number];
  carbs: [number, number];
  fats: [number, number];
}

// Nutritional range presets
const nutritionalPresets = {
  default: {
    calories: [0, 1000],
    proteins: [0, 50],
    carbs: [0, 100],
    fats: [0, 50]
  },
  lowCalorie: {
    calories: [0, 300],
    proteins: [0, 50],
    carbs: [0, 100],
    fats: [0, 50]
  },
  highProtein: {
    calories: [0, 1000],
    proteins: [20, 50],
    carbs: [0, 100],
    fats: [0, 50]
  },
  lowCarb: {
    calories: [0, 1000],
    proteins: [0, 50],
    carbs: [0, 30],
    fats: [0, 50]
  }
} as const;

// API function
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    console.log('Fetching recipes from API...');
    const response = await fetch('/api/recipes');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to fetch recipes:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched recipes:', { count: data.length });
    
    // Ensure data has expected format
    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format');
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    throw error;
  }
}

// Dynamically import Autocomplete with no SSR
const AutocompleteSearch = dynamic(
  () => import('@mui/material/Autocomplete'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Dynamically import DietFilter component
const DietFilter = dynamic(
  () => Promise.resolve(({ value, onChange }: { 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <FormControl 
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          color: '#FFFFFF',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.5)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#FFFFFF',
        },
        '& .MuiSelect-icon': {
          color: '#FF5F1F',
        },
      }}
    >
      <InputLabel id="diet-preference-label">Choose Diet Preference</InputLabel>
      <Select
        labelId="diet-preference-label"
        value={value}
        label="Choose Diet Preference"
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'rgba(45, 45, 45, 0.95)',
              color: '#FFFFFF',
              '& .MuiMenuItem-root': {
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 95, 31, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 95, 31, 0.2)',
                },
              },
            },
          },
        }}
      >
        <MenuItem value="all">All Recipes</MenuItem>
        <MenuItem value="Vegetarian">Vegetarian</MenuItem>
        <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
        <MenuItem value="Eggetarian">Eggetarian</MenuItem>
      </Select>
    </FormControl>
  )),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Create a MenuCategoryFilter component
const MenuCategoryFilter = dynamic(
  () => Promise.resolve(({ value, onChange }: { 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <FormControl 
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          color: '#FFFFFF',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.5)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#FFFFFF',
        },
        '& .MuiSelect-icon': {
          color: '#FF5F1F',
        },
      }}
    >
      <InputLabel id="menu-category-label">Choose Menu Category</InputLabel>
      <Select
        labelId="menu-category-label"
        value={value}
        label="Choose Menu Category"
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'rgba(45, 45, 45, 0.95)',
              color: '#FFFFFF',
              '& .MuiMenuItem-root': {
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 95, 31, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 95, 31, 0.2)',
                },
              },
            },
          },
        }}
      >
        <MenuItem value="all">All Categories</MenuItem>
        <MenuItem value="Beverages">Beverages</MenuItem>
        <MenuItem value="Breakfast">Breakfast</MenuItem>
        <MenuItem value="Dessert">Dessert</MenuItem>
        <MenuItem value="Dinner">Dinner</MenuItem>
        <MenuItem value="Dips/Chutney">Dips/Chutney</MenuItem>
        <MenuItem value="Flour">Flour</MenuItem>
        <MenuItem value="Lunch">Lunch</MenuItem>
      </Select>
    </FormControl>
  )),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Create a PhaseFilter component
const PhaseFilter = dynamic(
  () => Promise.resolve(({ value, onChange }: { 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <FormControl 
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          color: '#FFFFFF',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 95, 31, 0.5)',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#FFFFFF',
        },
        '& .MuiSelect-icon': {
          color: '#FF5F1F',
        },
      }}
    >
      <InputLabel id="phase-label">Select Phase</InputLabel>
      <Select
        labelId="phase-label"
        value={value}
        label="Select Phase"
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'rgba(45, 45, 45, 0.95)',
              color: '#FFFFFF',
              '& .MuiMenuItem-root': {
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: 'rgba(255, 95, 31, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 95, 31, 0.2)',
                },
              },
            },
          },
        }}
      >
        <MenuItem value="all">All Phases</MenuItem>
        <MenuItem value="Preparatory Phase">Preparatory Phase</MenuItem>
        <MenuItem value="Detox Phase">Detox Phase</MenuItem>
        <MenuItem value="Low-carb Reintroductions Phase">Low-carb Reintroductions Phase</MenuItem>
        <MenuItem value="High-carb Reintroductions Phase">High-carb Reintroductions Phase</MenuItem>
      </Select>
    </FormControl>
  )),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Add ProteinMealFilter component
const ProteinMealFilter = dynamic(
  () => Promise.resolve(({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    return (
      <FormControl 
        sx={{ 
          minWidth: 200,
          '& .MuiOutlinedInput-root': {
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(255, 95, 31, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 95, 31, 0.5)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#FFFFFF',
          },
          '& .MuiSelect-icon': {
            color: '#FF5F1F',
          },
        }}
      >
        <InputLabel id="protein-meal-label">Choose Meal Type</InputLabel>
        <Select
          labelId="protein-meal-label"
          value={value}
          label="Choose Meal Type"
          onChange={(e) => onChange(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'rgba(45, 45, 45, 0.95)',
                color: '#FFFFFF',
                '& .MuiMenuItem-root': {
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 95, 31, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 95, 31, 0.2)',
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="all">All Meals</MenuItem>
          <MenuItem value="Protein Meal">Protein Meal</MenuItem>
          <MenuItem value="Non-Protein Meal">Non-Protein Meal</MenuItem>
        </Select>
      </FormControl>
    );
  }),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Create NutritionalFilter component
const NutritionalFilter = dynamic(
  () => Promise.resolve(({ 
    value, 
    onChange,
    open,
    onClose 
  }: { 
    value: NutritionalRange;
    onChange: (newValue: NutritionalRange) => void;
    open: boolean;
    onClose: () => void;
  }) => {
    const [localValue, setLocalValue] = useState<NutritionalRange>(value);

    const handleSliderChange = (
      nutrient: keyof NutritionalRange
    ) => (_: Event, newValue: number | number[]) => {
      setLocalValue(prev => ({
        ...prev,
        [nutrient]: newValue as [number, number]
      }));
    };

    const handlePresetClick = (preset: keyof typeof nutritionalPresets) => {
      setLocalValue(nutritionalPresets[preset]);
    };

    const handleApply = () => {
      onChange(localValue);
      onClose();
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            color: '#FFFFFF',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#FF5F1F' }}>
          Nutritional Filters
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 2, color: '#FFFFFF' }}>Presets</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(nutritionalPresets).map(([key, _]) => (
                <Button
                  key={key}
                  size="small"
                  variant="outlined"
                  onClick={() => handlePresetClick(key as keyof typeof nutritionalPresets)}
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 95, 31, 0.5)',
                    '&:hover': {
                      borderColor: '#FF5F1F',
                      backgroundColor: 'rgba(255, 95, 31, 0.1)'
                    }
                  }}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </Box>
          </Box>

          {Object.entries(localValue).map(([nutrient, range]) => (
            <Box key={nutrient} sx={{ mb: 3 }}>
              <Typography sx={{ color: '#FFFFFF', mb: 1 }}>
                {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}:{' '}
                {range[0]} - {range[1]}{nutrient === 'calories' ? '' : 'g'}
              </Typography>
              <Slider
                value={range}
                onChange={handleSliderChange(nutrient as keyof NutritionalRange)}
                min={0}
                max={nutrient === 'calories' ? 1000 : 100}
                sx={{
                  '& .MuiSlider-thumb': {
                    color: '#FF5F1F',
                  },
                  '& .MuiSlider-track': {
                    color: '#FF5F1F',
                  },
                  '& .MuiSlider-rail': {
                    color: 'rgba(255, 95, 31, 0.3)',
                  }
                }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            variant="contained"
            sx={{ 
              backgroundColor: '#FF5F1F',
              '&:hover': {
                backgroundColor: '#FF7F1F'
              }
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    );
  }),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} />
      </Box>
    )
  }
);

// Component definition
export default function PlatePlanner() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dietFilter, setDietFilter] = useState('all');
  const [menuCategory, setMenuCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [proteinMealFilter, setProteinMealFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const recipesPerPage = 10;
  const [nutritionalFilterOpen, setNutritionalFilterOpen] = useState(false);
  const [nutritionalRange, setNutritionalRange] = useState<NutritionalRange>(nutritionalPresets.default);
  const [isNutritionalFilterActive, setIsNutritionalFilterActive] = useState(false);

  // Create a debounced search function
  const debouncedSearch = debounce((query: string, recipes: Recipe[]) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const results = recipes.filter(recipe => {
      const recipeName = recipe.name.toLowerCase();
      // Check if all search terms are present in the recipe name
      return searchTerms.every(term => recipeName.includes(term));
    });

    setSearchResults(results);
  }, 300);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: recipes = [], isLoading, error } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    enabled: status === 'authenticated' && mounted,
    retry: 3, // Retry up to 3 times in case of network errors
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    onError: (err) => console.error('Error fetching recipes:', err)
  });

  // Add debug logging for filters
  useEffect(() => {
    if (recipes.length > 0) {
      console.log('Current Filters:', { 
        dietFilter, 
        menuCategory,
        phaseFilter,
        searchQuery 
      });
      console.log('Sample recipe data:', {
        name: recipes[0].name,
        dietType: recipes[0].dietType,
        mealType: recipes[0].mealType,
        phase: recipes[0].phase
      });
    }
  }, [recipes, dietFilter, menuCategory, phaseFilter, searchQuery]);

  // Update filtering logic to include nutritional ranges
  const filteredRecipes = recipes.filter(recipe => {
    // Existing filter checks
    const matchesDiet = dietFilter === 'all' || (
      Array.isArray(recipe.dietType) && recipe.dietType.length > 0 &&
      recipe.dietType.some(type => 
        type && type.toLowerCase() === dietFilter.toLowerCase()
      )
    );

    const matchesCategory = menuCategory === 'all' || (
      typeof recipe.mealType === 'string' && 
      recipe.mealType.toLowerCase() === menuCategory.toLowerCase()
    );

    const matchesPhase = phaseFilter === 'all' || recipe.phase === phaseFilter;

    const matchesProteinMeal = proteinMealFilter === 'all' || (
      typeof recipe.proteinMealType === 'string' && 
      recipe.proteinMealType === proteinMealFilter
    );

    const matchesSearch = !searchQuery.trim() || (
      typeof recipe.name === 'string' && 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Nutritional range checks
    const matchesCalories = recipe.calories >= nutritionalRange.calories[0] && 
                          recipe.calories <= nutritionalRange.calories[1];
    const matchesProteins = recipe.proteins >= nutritionalRange.proteins[0] && 
                          recipe.proteins <= nutritionalRange.proteins[1];
    const matchesCarbs = recipe.carbs >= nutritionalRange.carbs[0] && 
                        recipe.carbs <= nutritionalRange.carbs[1];
    const matchesFats = recipe.fats >= nutritionalRange.fats[0] && 
                      recipe.fats <= nutritionalRange.fats[1];

    return matchesDiet && matchesCategory && matchesPhase && 
           matchesProteinMeal && matchesSearch && matchesCalories && 
           matchesProteins && matchesCarbs && matchesFats;
  });

  // Log filtered results count
  useEffect(() => {
    console.log('Filtered recipes:', {
      total: recipes.length,
      filtered: filteredRecipes.length,
      activeFilters: {
        diet: dietFilter,
        category: menuCategory,
        phase: phaseFilter,
        proteinMeal: proteinMealFilter,
        search: searchQuery
      }
    });
  }, [filteredRecipes, recipes, dietFilter, menuCategory, phaseFilter, proteinMealFilter, searchQuery]);

  // Group recipes by name to handle duplicates
  const groupedRecipes = filteredRecipes.reduce((acc, recipe) => {
    const name = recipe.name.toLowerCase();
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  // Update search when filters change
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery, recipes);
    }
  }, [searchQuery, recipes, dietFilter, menuCategory]);

  // Log filtered results
  useEffect(() => {
    console.log('Filtered recipes count:', filteredRecipes.length);
    if (filteredRecipes.length > 0) {
      console.log('First filtered recipe:', {
        name: filteredRecipes[0].name,
        dietType: filteredRecipes[0].dietType,
        mealType: filteredRecipes[0].mealType
      });
    }
  }, [filteredRecipes]);

  // Check if nutritional filters are active
  useEffect(() => {
    const hasActiveFilters = Object.entries(nutritionalRange).some(([nutrient, [min, max]]) => {
      const defaultRange = nutritionalPresets.default[nutrient as keyof NutritionalRange];
      return min !== defaultRange[0] || max !== defaultRange[1];
    });
    setIsNutritionalFilterActive(hasActiveFilters);
  }, [nutritionalRange]);

  // Reset page when any filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, dietFilter, menuCategory, phaseFilter, proteinMealFilter, nutritionalRange]);

  // Update the search handling
  const handleSearchSelect = (selectedValue: string | null) => {
    if (selectedValue) {
      // Just update the search query, don't show modal
      setSearchQuery(selectedValue);
    } else {
      setSearchQuery('');
    }
  };

  // Update the search functionality
  const getSearchOptions = (recipes: Recipe[]) => {
    return recipes.map(recipe => ({
      label: recipe.name,
      value: recipe.id,
      // Add subtitle to show matching ingredients
      subtitle: recipe.ingredients?.join(', '),
      recipe: recipe,
    }));
  };

  // Update the search filtering logic
  const getFilteredRecipesBySearch = (recipes: Recipe[], searchTerm: string) => {
    if (!searchTerm) return recipes;
    
    const searchLower = searchTerm.toLowerCase();
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchLower) || 
      recipe.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(searchLower)
      )
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" sx={{ color: '#FF5F1F', mb: 3, fontWeight: 600 }}>
        Plate Planner
      </Typography>
      
      {/* Error Message */}
      {error && (
        <Box sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'rgba(255, 0, 0, 0.1)', 
          borderRadius: 1,
          border: '1px solid rgba(255, 0, 0, 0.3)'
        }}>
          <Typography color="error" gutterBottom>
            Error loading recipes
          </Typography>
          <Typography variant="body2">
            We encountered a problem while loading the recipes. Please try again later or contact support if the issue persists.
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress color="primary" />
          <Typography sx={{ ml: 2 }}>Loading recipes...</Typography>
        </Box>
      )}
      
      {!isLoading && !error && (
        <GridContainer>
          <ContentBox>
            {/* Search and Filter Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {/* Search Bar */}
              <Box>
                <AutocompleteSearch
                  freeSolo
                  options={getSearchOptions(filteredRecipes)}
                  value={searchQuery}
                  onChange={(_, newValue) => handleSearchSelect(newValue?.label)}
                  onInputChange={(_, newValue) => setSearchQuery(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Search by recipe name or ingredients..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon sx={{ color: '#FF5F1F', mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 95, 31, 0.2)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 95, 31, 0.5)',
                          },
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography>{option.label}</Typography>
                        {option.subtitle && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              fontSize: '0.75rem'
                            }}
                          >
                            Ingredients: {option.subtitle}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  PopperComponent={(props) => (
                    <Popper
                      {...props}
                      sx={{
                        '& .MuiPaper-root': {
                          backgroundColor: 'rgba(45, 45, 45, 0.95)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 95, 31, 0.2)',
                        },
                        '& .MuiAutocomplete-option': {
                          '&:hover': {
                            backgroundColor: 'rgba(255, 95, 31, 0.1)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 95, 31, 0.2)',
                          },
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* Filters Row */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 auto' }}>
                  <DietFilter value={dietFilter} onChange={setDietFilter} />
                </Box>
                <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 auto' }}>
                  <MenuCategoryFilter value={menuCategory} onChange={setMenuCategory} />
                </Box>
                <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 auto' }}>
                  <PhaseFilter value={phaseFilter} onChange={setPhaseFilter} />
                </Box>
                <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 auto' }}>
                  <ProteinMealFilter value={proteinMealFilter} onChange={setProteinMealFilter} />
                </Box>
                <Box sx={{ minWidth: 200, maxWidth: 250, flex: '1 1 auto' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setNutritionalFilterOpen(true)}
                    sx={{
                      width: '100%',
                      height: '56px',
                      borderColor: isNutritionalFilterActive ? '#FF5F1F' : 'rgba(255, 255, 255, 0.23)',
                      color: isNutritionalFilterActive ? '#FF5F1F' : 'inherit',
                      '&:hover': {
                        borderColor: isNutritionalFilterActive ? '#FF5F1F' : 'rgba(255, 255, 255, 0.23)',
                      },
                      position: 'relative'
                    }}
                  >
                    Nutrition
                    {isNutritionalFilterActive && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#FF5F1F',
                          position: 'absolute',
                          top: 8,
                          right: 8
                        }}
                      />
                    )}
                  </Button>
                </Box>
              </Box>

              {/* Active Nutritional Filters */}
              {isNutritionalFilterActive && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(nutritionalRange).map(([nutrient, [min, max]]) => {
                    const defaultRange = nutritionalPresets.default[nutrient as keyof NutritionalRange];
                    if (min === defaultRange[0] && max === defaultRange[1]) return null;
                    
                    return (
                      <Chip
                        key={nutrient}
                        label={`${nutrient}: ${min}-${max}`}
                        onDelete={() => {
                          const newRange = {
                            ...nutritionalRange,
                            [nutrient]: [...nutritionalPresets.default[nutrient as keyof NutritionalRange]]
                          };
                          setNutritionalRange(newRange);
                        }}
                        sx={{
                          backgroundColor: 'rgba(255, 95, 31, 0.1)',
                          color: '#FF5F1F',
                          '& .MuiChip-deleteIcon': {
                            color: '#FF5F1F'
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Nutritional Filter Dialog */}
              <NutritionalFilter
                value={nutritionalRange}
                onChange={setNutritionalRange}
                open={nutritionalFilterOpen}
                onClose={() => setNutritionalFilterOpen(false)}
              />

              {/* Show count of filtered recipes */}
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: '#FFFFFF' }}>
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
                  {searchQuery && ` for "${searchQuery}"`}
                  {dietFilter !== 'all' && ` in ${dietFilter}`}
                  {menuCategory !== 'all' && ` category: ${menuCategory}`}
                </Typography>
              </Box>
            </Box>

            {/* Recipe Grid Display */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 4,
              mb: 4,
              mx: 'auto',
              maxWidth: '90%'
            }}>
              {isLoading ? (
                // Show loading skeleton cards
                [...Array(recipesPerPage)].map((_, index) => (
                  <Paper
                    key={`skeleton-${index}`}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 95, 31, 0.2)',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: '200px',
                      margin: '0 auto',
                      height: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ 
                      height: '135px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      animation: 'pulse 1.5s infinite ease-in-out'
                    }} />
                    <Box sx={{ 
                      p: 1.5,
                      height: '65px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      animation: 'pulse 1.5s infinite ease-in-out',
                      mt: 'auto'
                    }} />
                  </Paper>
                ))
              ) : (
                // Get current page recipes
                filteredRecipes
                  .slice((page - 1) * recipesPerPage, page * recipesPerPage)
                  .map((recipe) => (
                    <Paper
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 95, 31, 0.2)',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, border-color 0.2s',
                        width: '100%',
                        maxWidth: '200px',
                        margin: '0 auto',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: 'rgba(255, 95, 31, 0.5)',
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative', height: '135px' }}>
                        <Image
                          src={recipe.image || '/placeholder-recipe.jpg'}
                          alt={recipe.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        {/* Show count badge if multiple recipes exist with same name */}
                        {groupedRecipes[recipe.name.toLowerCase()]?.length > 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255, 95, 31, 0.9)',
                              color: '#FFFFFF',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {groupedRecipes[recipe.name.toLowerCase()].length}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ p: 1.5 }}>
                        <Typography 
                          sx={{ 
                            color: '#FFFFFF',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 1
                          }}
                        >
                          {recipe.name}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 0.5,
                          justifyContent: 'center'
                        }}>
                          {recipe.dietType?.[0] && (
                            <Chip
                              label={recipe.dietType[0]}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 95, 31, 0.1)',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          )}
                          {recipe.phase && (
                            <Chip
                              label={recipe.phase.split(' ')[0]}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 95, 31, 0.1)',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))
              )}
            </Box>

            {/* Pagination Controls */}
            {!isLoading && filteredRecipes.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 4,
                mb: 2
              }}>
                <Pagination
                  count={Math.ceil(filteredRecipes.length / recipesPerPage)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#FFFFFF',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 95, 31, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 95, 31, 0.3)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 95, 31, 0.1)',
                      },
                    },
                  }}
                />
              </Box>
            )}

            {/* Recipe Details Modal */}
            {selectedRecipe && (
              <Paper 
                elevation={3}
                sx={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '1200px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 95, 31, 0.2)',
                  p: 4,
                  zIndex: 1000,
                }}
              >
                <Box sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  '&:hover': { color: '#FF5F1F' }
                }}
                  onClick={() => setSelectedRecipe(null)}
                >
                  ✕
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box 
                    sx={{ 
                      width: '300px',
                      height: '400px',
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <Image 
                      src={selectedRecipe.image || '/placeholder-recipe.jpg'}
                      alt={selectedRecipe.name}
                      fill
                      style={{ 
                        objectFit: 'cover',
                        borderRadius: '16px'
                      }}
                      priority
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 600,
                        mb: 3
                      }}
                    >
                      {selectedRecipe.name}
                    </Typography>

                    {/* Ingredients Section with Heading */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#FF5F1F',
                        fontWeight: 500,
                        mb: 2
                      }}
                    >
                      Ingredients
                    </Typography>
                    <Box component="ul" sx={{ 
                      listStyle: 'none', 
                      p: 0, 
                      m: 0,
                      mb: 4,
                      '& li': {
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5,
                        '&::before': {
                          content: '"•"',
                          color: '#FF5F1F',
                          fontWeight: 'bold',
                          fontSize: '1.2em',
                          width: '0.75em',
                          marginRight: '0.5em',
                          display: 'inline-block',
                          lineHeight: 1
                        }
                      }
                    }}>
                      {(selectedRecipe?.ingredients || '').split('\n')
                        .filter(ingredient => ingredient.trim() !== '')
                        .map((ingredient, index) => (
                          <li key={index}>
                            <Typography sx={{ 
                              color: '#FFFFFF',
                              fontWeight: 400,
                              fontSize: '0.95rem',
                              lineHeight: 1.4
                            }}>
                              {ingredient.trim().replace(/^[-–—]/, '').trim()}
                            </Typography>
                          </li>
                      ))}
                    </Box>

                    {/* Instructions Section with Heading */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#FF5F1F',
                        fontWeight: 500,
                        mb: 2
                      }}
                    >
                      Instructions
                    </Typography>
                    <Box component="ol" sx={{ 
                      listStyle: 'none', 
                      p: 0,
                      m: 0,
                      mb: 4,
                      '& li': {
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 1,
                        counterIncrement: 'step-counter',
                        '&::before': {
                          content: 'counter(step-counter) "."',
                          color: '#FF5F1F',
                          fontWeight: 500,
                          minWidth: '1.5em',
                          marginRight: '0.5em',
                          fontSize: '0.95rem'
                        }
                      }
                    }}>
                      {(selectedRecipe?.instructions || '').split('\n')
                        .filter(step => step.trim() !== '')
                        .map((step, index) => (
                          <li key={index}>
                            <Typography sx={{ 
                              color: '#FFFFFF',
                              fontWeight: 400,
                              fontSize: '0.95rem',
                              lineHeight: 1.6
                            }}>
                              {step.trim().replace(/^\d+\.\s*/, '').trim()}
                            </Typography>
                          </li>
                      ))}
                    </Box>

                    {/* Nutrition Section with Heading */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#FF5F1F',
                        fontWeight: 500,
                        mb: 2
                      }}
                    >
                      Nutrition Facts
                    </Typography>
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 2,
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                    }}>
                      <Box>
                        <Typography sx={{ color: '#FF5F1F', fontSize: '0.9rem', mb: 0.5 }}>
                          Calories
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                          {selectedRecipe.calories}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#FF5F1F', fontSize: '0.9rem', mb: 0.5 }}>
                          Carbohydrates
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                          {selectedRecipe.carbs}g
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#FF5F1F', fontSize: '0.9rem', mb: 0.5 }}>
                          Proteins
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                          {selectedRecipe.proteins}g
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#FF5F1F', fontSize: '0.9rem', mb: 0.5 }}>
                          Fats
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                          {selectedRecipe.fats}g
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </ContentBox>
        </GridContainer>
      )}
    </Box>
  );
} 