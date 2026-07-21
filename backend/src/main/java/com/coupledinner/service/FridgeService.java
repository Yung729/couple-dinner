package com.coupledinner.service;

import com.coupledinner.dto.request.FridgeItemRequest;
import com.coupledinner.dto.response.FridgeItemResponse;
import com.coupledinner.dto.response.MissingIngredientsResponse;
import com.coupledinner.dto.response.UserResponse;
import com.coupledinner.entity.RefrigeratorItem;
import com.coupledinner.entity.User;
import com.coupledinner.event.SseEvent;
import com.coupledinner.exception.ResourceNotFoundException;
import com.coupledinner.repository.RefrigeratorItemRepository;
import com.coupledinner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FridgeService {

    private final RefrigeratorItemRepository fridgeRepository;
    private final UserRepository userRepository;
    private final SseEmitterManager sseEmitterManager;

    private static final String[][] FUNNY_MESSAGES = {
        {
            "Oops! %s decided to go on vacation 🏖️ Time to restock!",
            "%s 好像去度假了 🏖️ 快去买回来！"
        },
        {
            "Your fridge is giving you the silent treatment about %s 🙈",
            "冰箱对 %s 保持沉默 🙈 快去补货！"
        },
        {
            "%s left the group chat 💨 Time to go shopping!",
            "%s 已退群 💨 是时候去超市了！"
        },
        {
            "The %s fairy forgot to visit your fridge 🧚 Better go get some!",
            "%s 仙子忘记拜访你的冰箱了 🧚 快去买！"
        },
        {
            "Plot twist: %s is MIA from your fridge 🔍 Detective work needed!",
            "剧情反转：%s 在你的冰箱里失踪了 🔍 该去超市破案了！"
        }
    };

    public List<FridgeItemResponse> getAll() {
        return fridgeRepository.findAllWithDetails().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public FridgeItemResponse addItem(FridgeItemRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RefrigeratorItem item = RefrigeratorItem.builder()
            .ingredientName(request.getIngredientName())
            .quantity(request.getQuantity())
            .unit(request.getUnit())
            .addedBy(user)
            .build();
        fridgeRepository.save(item);

        FridgeItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder()
            .type("FRIDGE_ITEM_ADDED")
            .payload(response)
            .build());
        return response;
    }

    @Transactional
    public FridgeItemResponse updateItem(UUID id, FridgeItemRequest request, UUID userId) {
        RefrigeratorItem item = fridgeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fridge item not found"));

        item.setIngredientName(request.getIngredientName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        fridgeRepository.save(item);

        FridgeItemResponse response = toResponse(item);
        sseEmitterManager.broadcast(SseEvent.builder()
            .type("FRIDGE_ITEM_UPDATED")
            .payload(response)
            .build());
        return response;
    }

    @Transactional
    public void deleteItem(UUID id) {
        RefrigeratorItem item = fridgeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fridge item not found"));
        fridgeRepository.delete(item);
        sseEmitterManager.broadcast(SseEvent.builder()
            .type("FRIDGE_ITEM_DELETED")
            .payload(id)
            .build());
    }

    public MissingIngredientsResponse checkMissingIngredients(List<String> requiredIngredients) {
        Set<String> fridgeItems = fridgeRepository.findAllWithDetails().stream()
            .map(item -> item.getIngredientName().toLowerCase())
            .collect(Collectors.toSet());

        List<String> missing = requiredIngredients.stream()
            .filter(ing -> !fridgeItems.contains(ing.toLowerCase()))
            .collect(Collectors.toList());

        String messageEn = "";
        String messageZh = "";

        if (!missing.isEmpty()) {
            String[] template = FUNNY_MESSAGES[new Random().nextInt(FUNNY_MESSAGES.length)];
            String missingStr = String.join(", ", missing);
            messageEn = String.format(template[0], missingStr);
            messageZh = String.format(template[1], missingStr);
        }

        return MissingIngredientsResponse.builder()
            .missing(missing)
            .messageEn(messageEn)
            .messageZh(messageZh)
            .canProceed(true)
            .build();
    }

    private FridgeItemResponse toResponse(RefrigeratorItem item) {
        return FridgeItemResponse.builder()
            .id(item.getId())
            .ingredientName(item.getIngredientName())
            .quantity(item.getQuantity())
            .unit(item.getUnit())
            .addedBy(item.getAddedBy() != null ? UserResponse.builder()
                .id(item.getAddedBy().getId())
                .name(item.getAddedBy().getName())
                .email(item.getAddedBy().getEmail())
                .createdAt(item.getAddedBy().getCreatedAt())
                .build() : null)
            .updatedAt(item.getUpdatedAt())
            .build();
    }
}
