package handlers

import (
	config "backend/init"
	"backend/models"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetAllEstates - pobierz wszystkie nieruchomości
func GetAllEstates(c *gin.Context) {
	var estates []models.Estate

	if err := config.DB.Find(&estates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch estates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"estates": estates})
}

// GetEstateByID - pobierz nieruchomość po ID
func GetEstateByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var estate models.Estate
	if err := config.DB.First(&estate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Estate not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"estate": estate})
}

// SearchEstates - wyszukiwanie z filtrami

func SearchEstates(c *gin.Context) {
	query := config.DB.Model(&models.Estate{})

	// Filtr ceny (min-max)
	if priceMin := c.Query("price_min"); priceMin != "" {
		if min, err := strconv.Atoi(priceMin); err == nil {
			query = query.Where("price >= ?", min)
		}
	}
	if priceMax := c.Query("price_max"); priceMax != "" {
		if max, err := strconv.Atoi(priceMax); err == nil {
			query = query.Where("price <= ?", max)
		}
	}

	// Pokoje
	if roomsMin := c.Query("rooms_min"); roomsMin != "" {
		if min, err := strconv.Atoi(roomsMin); err == nil {
			query = query.Where("rooms >= ?", min)
		}
	}
	if roomsMax := c.Query("rooms_max"); roomsMax != "" {
		if max, err := strconv.Atoi(roomsMax); err == nil {
			query = query.Where("rooms <= ?", max)
		}
	}

	// Łazienki
	if bathsMin := c.Query("baths_min"); bathsMin != "" {
		if min, err := strconv.Atoi(bathsMin); err == nil {
			query = query.Where("baths >= ?", min)
		}
	}
	if bathsMax := c.Query("baths_max"); bathsMax != "" {
		if max, err := strconv.Atoi(bathsMax); err == nil {
			query = query.Where("baths <= ?", max)
		}
	}

	// Rok
	if year := c.Query("year"); year != "" {
		query = query.Where("year = ?", year)
	}

	// Filtr powierzchni
	if surfaceMin := c.Query("surface_min"); surfaceMin != "" {
		if min, err := strconv.Atoi(surfaceMin); err == nil {
			query = query.Where("surface >= ?", min)
		}
	}
	if surfaceMax := c.Query("surface_max"); surfaceMax != "" {
		if max, err := strconv.Atoi(surfaceMax); err == nil {
			query = query.Where("surface <= ?", max)
		}
	}

	// Lokalizacja
	if localization := c.Query("localization"); localization != "" {
		query = query.Where("localization = ?", localization)
	}

	// 🔥 WIELE TYPÓW — type=house&type=flat&type=studio
	types := c.QueryArray("type")
	if len(types) > 0 {
		var likeClauses []string
		var params []interface{}

		for _, t := range types {
			likeClauses = append(likeClauses, "typ::text LIKE ?")
			params = append(params, "%\""+t+"\"%")
		}

		query = query.Where(strings.Join(likeClauses, " OR "), params...)
	}

	// Status (sold / available)
	if status := c.Query("status"); status != "" {
		if status == "available" {
			query = query.Where("status = ?", false)
		} else if status == "sold" {
			query = query.Where("status = ?", true)
		}
	}

	var estates []models.Estate
	if err := query.Find(&estates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search estates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count":   len(estates),
		"estates": estates,
	})
}

// GetRecommendations - rekomendacje na podstawie powierzchni i ceny
func GetRecommendations(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var estate models.Estate
	if err := config.DB.First(&estate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Estate not found"})
		return
	}

	var recommendations []models.Estate

	// Próbujemy znaleźć rekomendacje z różnymi zakresami
	ranges := []struct {
		priceRange   float64
		surfaceRange float64
	}{
		{0.3, 0.3}, // ±30%
		{0.5, 0.5}, // ±50%
		{1.0, 1.0}, // ±100%
	}

	for _, r := range ranges {
		priceMin := float64(estate.Price) * (1 - r.priceRange)
		priceMax := float64(estate.Price) * (1 + r.priceRange)
		surfaceMin := float64(estate.Surface) * (1 - r.surfaceRange)
		surfaceMax := float64(estate.Surface) * (1 + r.surfaceRange)

		config.DB.Where("id != ?", estate.Id).
			Where("price BETWEEN ? AND ?", priceMin, priceMax).
			Where("surface BETWEEN ? AND ?", surfaceMin, surfaceMax).
			Where("status = ?", false). // tylko dostępne
			Order(fmt.Sprintf("ABS(price - %d) + ABS(surface - %d) ASC", estate.Price, estate.Surface)).
			Limit(3).
			Find(&recommendations)

		// Jeśli znaleziono rekomendacje, przerywamy
		if len(recommendations) > 0 {
			break
		}
	}

	// Jeśli nadal brak wyników, zwróć dowolne 3 dostępne nieruchomości
	if len(recommendations) == 0 {
		config.DB.Where("id != ?", estate.Id).
			Where("status = ?", false).
			Order("RANDOM()"). // lub "RAND()" dla MySQL
			Limit(3).
			Find(&recommendations)
	}

	c.JSON(http.StatusOK, gin.H{
		"recommendations": recommendations,
		"based_on": gin.H{
			"estate_id": estate.Id,
			"price":     estate.Price,
			"surface":   estate.Surface,
		},
	})
}
