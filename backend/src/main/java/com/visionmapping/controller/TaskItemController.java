package com.visionmapping.controller;

import com.visionmapping.dto.request.StatusUpdateRequest;
import com.visionmapping.dto.request.TaskItemRequest;
import com.visionmapping.dto.response.TaskItemResponse;
import com.visionmapping.service.VisionMappingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskItemController {

    private final VisionMappingService service;

    @GetMapping
    public List<TaskItemResponse> list() {
        return service.listTasks();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskItemResponse create(@Valid @RequestBody TaskItemRequest request) {
        return service.createTask(request);
    }

    @GetMapping("/{id}")
    public TaskItemResponse get(@PathVariable Long id) {
        return service.getTask(id);
    }

    @PutMapping("/{id}")
    public TaskItemResponse update(@PathVariable Long id, @Valid @RequestBody TaskItemRequest request) {
        return service.updateTask(id, request);
    }

    @PatchMapping("/{id}/status")
    public TaskItemResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateTaskStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.updateTaskStatus(id, "PAUSED");
    }
}
