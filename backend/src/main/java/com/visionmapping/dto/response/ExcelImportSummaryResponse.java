package com.visionmapping.dto.response;

import java.util.List;
import java.util.Map;

public record ExcelImportSummaryResponse(
        int createdRecords,
        int skippedRecords,
        Map<String, Integer> rowsBySheet,
        List<String> validationErrors
) {
}
