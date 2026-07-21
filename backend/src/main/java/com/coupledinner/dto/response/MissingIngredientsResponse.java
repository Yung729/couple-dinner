package com.coupledinner.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class MissingIngredientsResponse {
    private List<String> missing;
    private String messageEn;
    private String messageZh;
    private boolean canProceed;
}
