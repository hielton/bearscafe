package com.bearscafe.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis")
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    @Column(length = 2000)
    private String aiSuggestion;

    @Column(length = 2000)
    private String confirmedResult;

    private Double confidenceScore;

    private boolean confirmed = false;

    @OneToOne
    @JoinColumn(name = "meal_id", unique = true)
    private Meal meal;

    @ManyToOne
    @JoinColumn(name = "confirmed_by")
    private User confirmedBy;

    private LocalDateTime createdAt;

    public AIAnalysis() {
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAiSuggestion() {
        return aiSuggestion;
    }

    public void setAiSuggestion(String aiSuggestion) {
        this.aiSuggestion = aiSuggestion;
    }

    public String getConfirmedResult() {
        return confirmedResult;
    }

    public void setConfirmedResult(String confirmedResult) {
        this.confirmedResult = confirmedResult;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public boolean isConfirmed() {
        return confirmed;
    }

    public void setConfirmed(boolean confirmed) {
        this.confirmed = confirmed;
    }

    public Meal getMeal() {
        return meal;
    }

    public void setMeal(Meal meal) {
        this.meal = meal;
    }

    public User getConfirmedBy() {
        return confirmedBy;
    }

    public void setConfirmedBy(User confirmedBy) {
        this.confirmedBy = confirmedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}