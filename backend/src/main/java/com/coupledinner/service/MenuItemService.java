package com.coupledinner.service;

import com.coupledinner.dto.request.IngredientRequest;
import com.coupledinner.dto.request.MenuItemRequest;
import com.coupledinner.dto.response.*;
import com.coupledinner.entity.Ingredient;
import com.coupledinner.entity.MenuItem;
import com.coupledinner.entity.User;
import com.coupledinner.event.SseEvent;
import com.coupledinner.exception.BadRequestException;
import com.coupledinner.exception.ResourceNotFoundException;
import com.coupledinner.repository.IngredientRepository;
import com.coupledinner.repository.MenuItemRepository;
import com.coupledinner.repository.RefrigeratorItemRepository;
import com.coupledinner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final RefrigeratorItemRepository fridgeRepository;
    private final SseEmitterManager sseEmitterManager;
    private final FridgeService fridgeService;

    public List<MenuItemResponse> getAll(String ingredientFilter) {
        List<MenuItem> items;
        if (ingredientFilter != null && !ingredientFilter.isBlank()) {
            items = menuItemRepository.findByIngredientName(ingredientFilter);
        } else {
            items = menuItemRepository.findAllWithDetails();
        }
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MenuItemResponse getById(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        return toResponse(item);
    }

    @Transactional
    public MenuItemResponse create(MenuItemRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MenuItem item = MenuItem.builder()
            .name(request.getName())
            .description(request.getDescription())
            .createdBy(user)
            .build();

        if (request.getIngredients() != null) {
            for (String name : request.getIngredients()) {
                Ingredient ingredient = findOrCreateIngredient(name);
                item.getIngredients().add(ingredient);
            }
        }
        menuItemRepository.save(item);

        MenuItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder().type("MENU_ITEM_CREATED").payload(response).build());
        return response;
    }

    @Transactional
    public MenuItemResponse update(UUID id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        menuItemRepository.save(item);

        MenuItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder().type("MENU_ITEM_UPDATED").payload(response).build());
        return response;
    }

    @Transactional
    public void delete(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        menuItemRepository.delete(item);
        sseEmitterManager.broadcast(SseEvent.builder().type("MENU_ITEM_DELETED").payload(id).build());
    }

    @Transactional
    public MenuItemResponse addIngredient(UUID menuItemId, IngredientRequest request) {
        MenuItem item = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        Ingredient ingredient = findOrCreateIngredient(request.getName());
        item.getIngredients().add(ingredient);
        menuItemRepository.save(item);

        MenuItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder().type("MENU_ITEM_UPDATED").payload(response).build());
        return response;
    }

    @Transactional
    public MenuItemResponse removeIngredient(UUID menuItemId, UUID ingredientId) {
        MenuItem item = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
        item.getIngredients().remove(ingredient);
        menuItemRepository.save(item);

        MenuItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder().type("MENU_ITEM_UPDATED").payload(response).build());
        return response;
    }

    public MissingIngredientsResponse checkMissingIngredients(UUID menuItemId) {
        MenuItem item = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        List<String> requiredIngredients = item.getIngredients().stream()
            .map(Ingredient::getName)
            .collect(Collectors.toList());
        return fridgeService.checkMissingIngredients(requiredIngredients);
    }

    private Ingredient findOrCreateIngredient(String name) {
        return ingredientRepository.findByNameIgnoreCase(name.trim())
            .orElseGet(() -> {
                Ingredient newIng = Ingredient.builder().name(name.trim().toLowerCase()).build();
                return ingredientRepository.save(newIng);
            });
    }

    public MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .createdBy(item.getCreatedBy() != null ? UserResponse.builder()
                .id(item.getCreatedBy().getId())
                .name(item.getCreatedBy().getName())
                .email(item.getCreatedBy().getEmail())
                .createdAt(item.getCreatedBy().getCreatedAt())
                .build() : null)
            .createdAt(item.getCreatedAt())
            .ingredients(item.getIngredients().stream()
                .map(i -> IngredientResponse.builder().id(i.getId()).name(i.getName()).build())
                .collect(Collectors.toList()))
            .build();
    }
}
