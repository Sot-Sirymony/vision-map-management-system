package com.visionmapping.controller;

import com.visionmapping.dto.request.ProgressLogRequest;
import com.visionmapping.dto.response.ProgressLogResponse;
import com.visionmapping.service.ProgressLogService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress-logs")
@RequiredArgsConstructor
public class ProgressLogController {

    private final ProgressLogService service;

    @GetMapping
    public List<ProgressLogResponse> list() {
        return service.listProgressLogs();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressLogResponse create(@Valid @RequestBody ProgressLogRequest request) {
        return service.createProgressLog(request);
    }

    @GetMapping("/{id}")
    public ProgressLogResponse get(@PathVariable Long id) {
        return service.getProgressLog(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.archiveProgressLog(id);
    }
}
