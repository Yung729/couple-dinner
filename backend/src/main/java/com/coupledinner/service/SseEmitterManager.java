package com.coupledinner.service;

import com.coupledinner.event.SseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class SseEmitterManager {

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public SseEmitter createEmitter(UUID userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE connection completed for user: {}", userId);
            emitters.remove(userId);
        });
        emitter.onTimeout(() -> {
            log.debug("SSE connection timed out for user: {}", userId);
            emitters.remove(userId);
            emitter.complete();
        });
        emitter.onError((ex) -> {
            log.debug("SSE error for user {}: {}", userId, ex.getMessage());
            emitters.remove(userId);
        });

        return emitter;
    }

    public void broadcast(SseEvent event) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            log.error("Failed to serialize SSE event", e);
            return;
        }

        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().data(payload));
            } catch (IOException e) {
                log.debug("Failed to send SSE to user {}, removing emitter", userId);
                emitters.remove(userId);
                emitter.completeWithError(e);
            }
        });
    }

    public void sendToUser(UUID userId, SseEvent event) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                String payload = objectMapper.writeValueAsString(event);
                emitter.send(SseEmitter.event().data(payload));
            } catch (IOException e) {
                log.debug("Failed to send SSE to user {}", userId);
                emitters.remove(userId);
            }
        }
    }

    // Heartbeat every 25 seconds to keep connections alive through proxies
    @Scheduled(fixedDelay = 25000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        emitters.forEach((userId, emitter) -> {
            try {
                emitter.send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException e) {
                emitters.remove(userId);
                emitter.completeWithError(e);
            }
        });
    }
}
