package handlers

import (
	config "backend/init"
	"backend/jwt"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/datatypes"
)

// Register - rejestracja nowego użytkownika
func Register(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	// Hash hasła
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	// Zapisz użytkownika
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":       user.Id,
			"name":     user.Name,
			"lastname": user.Lastname,
			"email":    user.Email,
		},
	})
}

// Login - logowanie użytkownika
func Login(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", loginData.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Sprawdź hasło
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Wygeneruj token JWT
	token, err := jwt.CreateToken(user.Id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.Id,
			"name":     user.Name,
			"lastname": user.Lastname,
			"email":    user.Email,
		},
	})
}

// GetFavourites - pobierz ulubione nieruchomości użytkownika
func GetFavourites(c *gin.Context) {
	userID := c.GetInt("userID") // z middleware

	var user models.User
	if err := config.DB.Preload("Favourite").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"favourites": user.Favourite})
}

func GetUser(c *gin.Context) {
	userID := c.GetInt("userID") // pobrane z middleware

	var user models.User
	// Pobierz użytkownika i jego ulubione nieruchomości
	if err := config.DB.Preload("Favourite").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Zwróć dane użytkownika
	c.JSON(http.StatusOK, gin.H{
		"id":         user.Id,
		"name":       user.Name,
		"lastname":   user.Lastname,
		"email":      user.Email,
		"favourites": user.Favourite,
	})
}

// AddToFavourites - dodaj nieruchomość do ulubionych
func AddToFavourites(c *gin.Context) {
	userID := c.GetInt("userID")
	estateID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid estate ID"})
		return
	}

	var user models.User
	var estate models.Estate

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := config.DB.First(&estate, estateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Estate not found"})
		return
	}

	// Dodaj do ulubionych
	if err := config.DB.Model(&user).Association("Favourite").Append(&estate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to favourites"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Added to favourites"})
}

// RemoveFromFavourites - usuń z ulubionych
func RemoveFromFavourites(c *gin.Context) {
	userID := c.GetInt("userID")
	estateID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid estate ID"})
		return
	}

	var user models.User
	var estate models.Estate

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := config.DB.First(&estate, estateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Estate not found"})
		return
	}

	if err := config.DB.Model(&user).Association("Favourite").Delete(&estate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from favourites"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from favourites"})
}

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

	// Filtr powierzchni (min-max)
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

	// Filtr lokalizacji
	if localization := c.Query("localization"); localization != "" {
		query = query.Where("localization = ?", localization)
	}

	// Filtr typu - POPRAWIONE: używamy LIKE zamiast @>
	if typ := c.Query("type"); typ != "" {
		// Szukamy czy typ jest w tablicy JSON
		query = query.Where("typ::text LIKE ?", "%\""+typ+"\"%")
	}

	// Filtr statusu (sprzedane/na sprzedaż)
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
/*func GetRecommendations(c *gin.Context) {
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

	// Znajdź podobne nieruchomości (±30% ceny i ±30% powierzchni)
	priceMin := float64(estate.Price) * 0.7
	priceMax := float64(estate.Price) * 1.3
	surfaceMin := float64(estate.Surface) * 0.7
	surfaceMax := float64(estate.Surface) * 1.3

	var recommendations []models.Estate
	config.DB.Where("id != ?", estate.Id).
		Where("price BETWEEN ? AND ?", priceMin, priceMax).
		Where("surface BETWEEN ? AND ?", surfaceMin, surfaceMax).
		Where("status = ?", false).                                                   // tylko dostępne
		Order("ABS(price - ?) + ABS(surface - ?) ASC", estate.Price, estate.Surface). // sortuj po podobieństwie
		Limit(5).
		Find(&recommendations)

	c.JSON(http.StatusOK, gin.H{
		"recommendations": recommendations,
		"based_on": gin.H{
			"estate_id": estate.Id,
			"price":     estate.Price,
			"surface":   estate.Surface,
		},
	})
}*/

// ============= FUNKCJE POMOCNICZE DLA ZDJĘĆ =============

// saveUploadedFiles - zapisuje przesłane pliki i zwraca tablicę ścieżek
func saveUploadedFiles(c *gin.Context) ([]string, error) {
	form, err := c.MultipartForm()
	if err != nil {
		return nil, err
	}

	files := form.File["images"]
	if len(files) == 0 {
		return []string{}, nil
	}

	// Utwórz folder uploads jeśli nie istnieje
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, err
	}

	var imagePaths []string

	for _, file := range files {
		// Sprawdź rozszerzenie
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			continue
		}

		// Generuj unikalną nazwę
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
		filepath := filepath.Join(uploadDir, filename)

		// Zapisz plik
		if err := c.SaveUploadedFile(file, filepath); err != nil {
			continue
		}

		imagePaths = append(imagePaths, "/uploads/"+filename)
	}

	return imagePaths, nil
}

// deleteImageFiles - usuwa pliki zdjęć z dysku
func deleteImageFiles(imageData datatypes.JSON) {
	if len(imageData) == 0 {
		return
	}

	var imagePaths []string
	if err := json.Unmarshal(imageData, &imagePaths); err != nil {
		fmt.Println("Failed to unmarshal images:", err)
		return
	}

	for _, path := range imagePaths {
		filepath := "." + path
		if err := os.Remove(filepath); err != nil {
			fmt.Println("Failed to remove file:", filepath, err)
		}
	}
}

// ============= ADMIN HANDLERS =============

// CreateEstate - dodaj nową nieruchomość z zdjęciami (admin)
func CreateEstate(c *gin.Context) {
	var estate models.Estate

	// Pobierz dane JSON z form-data
	typ := c.PostFormArray("type")
	status := c.PostForm("status") == "true"
	localization := c.PostForm("localization")
	surface, _ := strconv.Atoi(c.PostForm("surface"))
	price, _ := strconv.Atoi(c.PostForm("price"))
	opis := c.PostForm("opis")

	// Konwertuj typ na JSON
	typJSON, _ := json.Marshal(typ)
	estate.Typ = datatypes.JSON(typJSON)

	estate.Status = status
	estate.Localization = localization
	estate.Surface = int32(surface)
	estate.Price = int32(price)
	estate.Opis = opis

	// Zapisz zdjęcia
	imagePaths, err := saveUploadedFiles(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload images"})
		return
	}

	// Konwertuj ścieżki zdjęć na JSON
	imagesJSON, _ := json.Marshal(imagePaths)
	estate.Images = datatypes.JSON(imagesJSON)

	if err := config.DB.Create(&estate).Error; err != nil {
		// Usuń zdjęcia jeśli nie udało się zapisać do DB
		deleteImageFiles(estate.Images)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create estate"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Estate created successfully",
		"estate":  estate,
	})
}

// UpdateEstate - zaktualizuj nieruchomość z opcją dodania nowych zdjęć (admin)
func UpdateEstate(c *gin.Context) {
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

	// Aktualizuj podstawowe dane
	if typ := c.PostFormArray("type"); len(typ) > 0 {
		typJSON, _ := json.Marshal(typ)
		estate.Typ = datatypes.JSON(typJSON)
	}
	if status := c.PostForm("status"); status != "" {
		estate.Status = status == "true"
	}
	if localization := c.PostForm("localization"); localization != "" {
		estate.Localization = localization
	}
	if surface := c.PostForm("surface"); surface != "" {
		if s, err := strconv.Atoi(surface); err == nil {
			estate.Surface = int32(s)
		}
	}
	if price := c.PostForm("price"); price != "" {
		if p, err := strconv.Atoi(price); err == nil {
			estate.Price = int32(p)
		}
	}
	if opis := c.PostForm("opis"); opis != "" {
		estate.Opis = opis
	}

	// Sprawdź czy są nowe zdjęcia
	newImages, err := saveUploadedFiles(c)
	if err == nil && len(newImages) > 0 {
		// Usuń stare zdjęcia z dysku
		deleteImageFiles(estate.Images)

		// Zapisz nowe ścieżki jako JSON
		imagesJSON, _ := json.Marshal(newImages)
		estate.Images = datatypes.JSON(imagesJSON)
	}

	if err := config.DB.Save(&estate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update estate"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Estate updated successfully",
		"estate":  estate,
	})
}

// DeleteEstate - usuń nieruchomość wraz ze zdjęciami (admin)
func DeleteEstate(c *gin.Context) {
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

	// Usuń zdjęcia z dysku
	deleteImageFiles(estate.Images)

	// Usuń z bazy danych
	if err := config.DB.Delete(&estate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete estate"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Estate deleted successfully"})
}
