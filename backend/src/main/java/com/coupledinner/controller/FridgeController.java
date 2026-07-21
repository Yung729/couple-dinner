package com.coupledinner.controller;

import com.coupledinner.dto.request.FridgeItemRequest;
import com.coupledinner.dto.response.FridgeItemResponse;
import com.coupledinner.service.FridgeService;
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
@RequestMapping("/api/fridge")
@RequiredArgsConstructor
public class FridgeController {

    private final FridgeService fridgeService;

    @GetMapping
    public ResponseEntity<List<FridgeItemResponse>> getAll() {
        return ResponseEntity.ok(fridgeService.getAll());
    }

    @PostMapping
    public ResponseEntity<FridgeItemResponse> addItem(
            @Valid @RequestBody FridgeItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(fridgeService.addItem(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FridgeItemResponse> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody FridgeItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(fridgeService.updateItem(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID id) {
        fridgeService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
