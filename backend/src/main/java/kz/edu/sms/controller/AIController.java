package kz.edu.sms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/ai") @RequiredArgsConstructor
@Tag(name = "AI")
public class AIController {

    @Value("${openai.api.key:}")
    private String openaiKey;

    private final RestTemplate restTemplate;

    @Data
    public static class AIRequest {
        private String prompt;
        private String type; // explain, quiz, flashcards, summary
    }

    @PostMapping("/ask") @Operation(summary = "Ask AI assistant")
    public ResponseEntity<Map<String, Object>> ask(@RequestBody AIRequest req) {
        if (openaiKey == null || openaiKey.isBlank()) {
            // Demo mode — return stub response
            String demo = generateDemoResponse(req.getType(), req.getPrompt());
            return ResponseEntity.ok(Map.of("response", demo, "tokensUsed", 0));
        }

        String systemPrompt = buildSystemPrompt(req.getType());
        Map<String, Object> body = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", req.getPrompt())
            ),
            "max_tokens", 1500,
            "temperature", 0.7
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                "https://api.openai.com/v1/chat/completions",
                new org.springframework.http.HttpEntity<>(body,
                    new org.springframework.http.HttpHeaders() {{
                        set("Authorization", "Bearer " + openaiKey);
                        set("Content-Type", "application/json");
                    }}),
                Map.class
            );

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            @SuppressWarnings("unchecked")
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");

            return ResponseEntity.ok(Map.of(
                "response", message.get("content"),
                "tokensUsed", usage != null ? usage.get("total_tokens") : 0
            ));
        } catch (Exception e) {
            String demo = generateDemoResponse(req.getType(), req.getPrompt());
            return ResponseEntity.ok(Map.of("response", demo, "tokensUsed", 0));
        }
    }

    private String buildSystemPrompt(String type) {
        return switch (type != null ? type : "explain") {
            case "quiz" -> "Ты преподаватель. Создай тест из 5 вопросов с вариантами ответов (A, B, C, D) и правильным ответом в конце. Отвечай на языке вопроса.";
            case "flashcards" -> "Создай 8-10 флеш-карточек в формате: **Вопрос:** ... **Ответ:** ... Отвечай на языке запроса.";
            case "summary" -> "Кратко перескажи главные идеи текста в 5-7 ключевых пунктах с маркерами. Будь точным и лаконичным.";
            default -> "Ты умный AI-репетитор. Объясни концепцию простым языком, приведи примеры, аналогии. Структурируй ответ с заголовками. Отвечай на языке вопроса.";
        };
    }

    private String generateDemoResponse(String type, String prompt) {
        return switch (type != null ? type : "explain") {
            case "quiz" -> """
                    ## Тест по теме: """ + prompt.substring(0, Math.min(50, prompt.length())) + """

                    **Вопрос 1:** Что является основным понятием данной темы?
                    A) Первый вариант
                    B) Второй вариант
                    C) Третий вариант ✓
                    D) Четвёртый вариант

                    **Вопрос 2:** Какой из следующих примеров наиболее точно иллюстрирует концепцию?
                    A) Пример А ✓
                    B) Пример Б
                    C) Пример В
                    D) Пример Г

                    ⚠️ *Для полноценной работы AI добавьте OpenAI API ключ в настройки backend (openai.api.key)*
                    """;
            case "flashcards" -> """
                    ## Флеш-карточки

                    **Карточка 1:**
                    **Вопрос:** Что такое основная концепция?
                    **Ответ:** Основная концепция — это фундаментальное понятие, которое...

                    **Карточка 2:**
                    **Вопрос:** Как применяется на практике?
                    **Ответ:** На практике применяется через...

                    **Карточка 3:**
                    **Вопрос:** Каковы ключевые характеристики?
                    **Ответ:** Ключевые характеристики включают...

                    ⚠️ *Для полноценной работы AI добавьте OpenAI API ключ в настройки backend*
                    """;
            case "summary" -> """
                    ## Краткое содержание

                    - **Главная идея:** Основная мысль текста заключается в...
                    - **Ключевые факты:** Важнейшие факты, которые следует знать...
                    - **Примеры:** Автор приводит следующие примеры...
                    - **Выводы:** В заключение можно сделать вывод...

                    ⚠️ *Для полноценной работы AI добавьте OpenAI API ключ в настройки backend*
                    """;
            default -> """
                    ## Объяснение

                    Это демо-режим AI ассистента. Вы спросили: *""" + prompt.substring(0, Math.min(100, prompt.length())) + """
                    *

                    **Как получить полноценный AI:**

                    1. Получите API ключ на **platform.openai.com**
                    2. Добавьте в `application.properties`:
                       `openai.api.key=sk-...`
                    3. Перезапустите backend сервер

                    После этого AI будет отвечать на любые вопросы, создавать тесты, карточки и саммари на казахском, русском и английском языках.
                    """;
        };
    }
}
