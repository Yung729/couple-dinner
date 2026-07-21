package com.coupledinner.controller;

import com.coupledinner.dto.request.IngredientRequest;
import com.coupledinner.dto.request.MenuItemRequest;
import com.coupledinner.dto.response.MenuItemResponse;
import com.coupledinner.dto.response.MissingIngredientsResponse;
import com.coupledinner.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAll(
            @RequestParam(required = false) String ingredient) {
        return ResponseEntity.ok(menuItemService.getAll(ingredient));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(menuItemService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> create(
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.create(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ingredients")
    public ResponseEntity<MenuItemResponse> addIngredient(
            @PathVariable UUID id,
            @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(menuItemService.addIngredient(id, request));
    }

    @DeleteMapping("/{id}/ingredients/{ingredientId}")
    public ResponseEntity<MenuItemResponse> removeIngredient(
            @PathVariable UUID id,
            @PathVariable UUID ingredientId) {
        return ResponseEntity.ok(menuItemService.removeIngredient(id, ingredientId));
    }

    @GetMapping("/{id}/missing-ingredients")
    public ResponseEntity<MissingIngredientsResponse> checkMissingIngredients(@PathVariable UUID id) {
        return ResponseEntity.ok(menuItemService.checkMissingIngredients(id));
    }
}
