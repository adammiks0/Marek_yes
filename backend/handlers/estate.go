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

// SyncImagesDebug - endpoint do debugowania obrazków
func SyncImagesDebug(c *gin.Context) {
	var estates []models.Estate

	if err := config.DB.Find(&estates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch estates"})
		return
	}

	type DebugInfo struct {
		EstateID     int               `json:"estate_id"`
		DBImages     []string          `json:"db_images"`
		ExistsOnDisk map[string]bool   `json:"exists_on_disk"`
		FullPaths    map[string]string `json:"full_paths"` // DODANE
		Errors       map[string]string `json:"errors"`     // DODANE
	}

	var debug []DebugInfo

	// DODANE: Sprawdź working directory
	wd, _ := os.Getwd()
	fmt.Printf("Working directory: %s\n", wd)

	for _, estate := range estates {
		var imagePaths []string
		json.Unmarshal(estate.Images, &imagePaths)

		exists := make(map[string]bool)
		fullPaths := make(map[string]string)
		errors := make(map[string]string)

		for _, path := range imagePaths {
			// Próbuj różne warianty ścieżki
			cleanPath := strings.TrimPrefix(path, "/")
			testPaths := []string{
				"." + path,                    // ./uploads/file.jpg
				cleanPath,                     // uploads/file.jpg
				"./" + cleanPath,              // ./uploads/file.jpg
				filepath.Join(".", cleanPath), // ./uploads/file.jpg (poprawnie)
			}

			found := false
			for _, testPath := range testPaths {
				if _, err := os.Stat(testPath); err == nil {
					exists[path] = true
					fullPaths[path] = testPath
					found = true
					fmt.Printf("✓ Found file at: %s\n", testPath)
					break
				}
			}

			if !found {
				exists[path] = false
				fullPaths[path] = filepath.Join(".", cleanPath)

				// Zapisz błąd
				_, err := os.Stat(filepath.Join(".", cleanPath))
				if err != nil {
					errors[path] = err.Error()
					fmt.Printf("✗ File not found: %s (error: %v)\n", filepath.Join(".", cleanPath), err)
				}
			}
		}

		debug = append(debug, DebugInfo{
			EstateID:     int(estate.Id),
			DBImages:     imagePaths,
			ExistsOnDisk: exists,
			FullPaths:    fullPaths,
			Errors:       errors,
		})
	}

	// DODANE: Lista plików w katalogu uploads
	uploadFiles := []string{}
	files, err := os.ReadDir("./uploads")
	if err != nil {
		fmt.Printf("Error reading uploads dir: %v\n", err)
	} else {
		for _, file := range files {
			uploadFiles = append(uploadFiles, file.Name())
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"debug":            debug,
		"working_dir":      wd,
		"uploads_exists":   err == nil,
		"files_in_uploads": uploadFiles, // Lista rzeczywistych plików
	})
}

// Funkcja pomocnicza
func getFullPath(relativePath string) string {
	// relativePath to np. "/uploads/file.jpg"
	cleanPath := strings.TrimPrefix(relativePath, "/")
	return filepath.Join(".", cleanPath)
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

	// Znajdź podobne nieruchomości (±30% ceny i ±30% powierzchni)
	priceMin := float64(estate.Price) * 0.7
	priceMax := float64(estate.Price) * 1.3
	surfaceMin := float64(estate.Surface) * 0.7
	surfaceMax := float64(estate.Surface) * 1.3

	var recommendations []models.Estate
	config.DB.Where("id != ?", estate.Id).
		Where("price BETWEEN ? AND ?", priceMin, priceMax).
		Where("surface BETWEEN ? AND ?", surfaceMin, surfaceMax).
		Where("status = ?", false).                                                                  // tylko dostępne
		Order(fmt.Sprintf("ABS(price - %d) + ABS(surface - %d) ASC", estate.Price, estate.Surface)). // sortuj po podobieństwie
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
}

// ============= FUNKCJE POMOCNICZE DLA ZDJĘĆ =============

// saveUploadedFiles - zapisuje przesłane pliki i zwraca tablicę ścieżek
func saveUploadedFiles(c *gin.Context) ([]string, error) {
	form, err := c.MultipartForm()
	if err != nil {
		fmt.Println("Error parsing multipart form:", err)
		return nil, err
	}

	files := form.File["images"]
	fmt.Printf("DEBUG: Received %d files\n", len(files))

	if len(files) == 0 {
		return []string{}, nil
	}

	// DODANE: Wypisz working directory
	wd, _ := os.Getwd()
	fmt.Printf("Working directory: %s\n", wd)

	uploadDir := "./uploads"
	absPath, _ := filepath.Abs(uploadDir) // DODANE: Absolutna ścieżka
	fmt.Printf("Upload directory (relative): %s\n", uploadDir)
	fmt.Printf("Upload directory (absolute): %s\n", absPath)

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Println("Error creating upload directory:", err)
		return nil, err
	}

	// DODANE: Sprawdź czy katalog istnieje
	if info, err := os.Stat(uploadDir); err == nil {
		fmt.Printf("Upload dir exists: %v, IsDir: %v, Permissions: %v\n",
			true, info.IsDir(), info.Mode().Perm())
	} else {
		fmt.Printf("Upload dir check failed: %v\n", err)
	}

	var imagePaths []string

	for i, file := range files {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			continue
		}

		if file.Size > 10*1024*1024 {
			continue
		}

		timestamp := time.Now().Unix()
		safeName := strings.ReplaceAll(file.Filename, " ", "_")
		filename := fmt.Sprintf("%d_%d_%s", timestamp, i, safeName)
		fullPath := filepath.Join(uploadDir, filename)

		fmt.Printf("Attempting to save to: %s\n", fullPath)

		if err := c.SaveUploadedFile(file, fullPath); err != nil {
			fmt.Printf("Error saving file %s: %v\n", file.Filename, err)
			continue
		}

		// DODANE: Sprawdź czy plik został zapisany
		if info, err := os.Stat(fullPath); err == nil {
			fmt.Printf("✓ File saved successfully: %s (size: %d bytes)\n", fullPath, info.Size())
		} else {
			fmt.Printf("✗ File NOT found after save: %s (error: %v)\n", fullPath, err)
		}

		imagePath := "/uploads/" + filename
		imagePaths = append(imagePaths, imagePath)
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
		// Ścieżka zaczyna się od "/uploads/" więc dodajemy "."
		fullPath := getFullPath(path)
		if err := os.Remove(fullPath); err != nil {
			fmt.Println("Failed to remove file:", fullPath, err)
		}
	}
}

// ============= ADMIN HANDLERS =============

// CreateEstate - dodaj nową nieruchomość z zdjęciami (admin)
func CreateEstate(c *gin.Context) {
	fmt.Println("\n=== DEBUG CreateEstate START ===")

	var estate models.Estate

	// Pobierz dane z form-data
	typ := c.PostFormArray("type")
	fmt.Printf("Received types: %v (count: %d)\n", typ, len(typ))

	status := c.PostForm("status") == "true"
	localization := c.PostForm("localization")
	surface, _ := strconv.Atoi(c.PostForm("surface"))
	price, _ := strconv.Atoi(c.PostForm("price"))
	opis := c.PostForm("opis")

	// Walidacja podstawowych danych
	if len(typ) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Type is required"})
		return
	}
	if localization == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Localization is required"})
		return
	}
	if surface <= 0 || price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid surface or price"})
		return
	}

	// Konwertuj typ na JSON
	typJSON, _ := json.Marshal(typ)
	estate.Typ = datatypes.JSON(typJSON)

	estate.Status = status
	estate.Localization = localization
	estate.Surface = int32(surface)
	estate.Price = int32(price)
	estate.Opis = opis

	fmt.Println("Starting file upload...")

	// Zapisz zdjęcia - POPRAWIONE
	imagePaths, err := saveUploadedFiles(c)
	if err != nil {
		fmt.Printf("Error uploading images: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload images", "details": err.Error()})
		return
	}

	if len(imagePaths) == 0 {
		fmt.Println("WARNING: No images were uploaded")
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one image is required"})
		return
	}

	fmt.Printf("Uploaded %d images successfully\n", len(imagePaths))

	// Konwertuj ścieżki zdjęć na JSON
	imagesJSON, _ := json.Marshal(imagePaths)
	estate.Images = datatypes.JSON(imagesJSON)

	fmt.Println("Saving to database...")

	// Zapisz do bazy danych
	if err := config.DB.Create(&estate).Error; err != nil {
		// Usuń zdjęcia jeśli nie udało się zapisać do DB
		deleteImageFiles(estate.Images)
		fmt.Printf("Database error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create estate", "details": err.Error()})
		return
	}

	fmt.Printf("Estate created successfully with ID: %d\n", estate.Id)
	fmt.Println("=== DEBUG CreateEstate END ===\n")

	c.JSON(http.StatusCreated, gin.H{
		"message": "Estate created successfully",
		"estate":  estate,
	})
}

// UpdateEstate - zaktualizuj nieruchomość z opcją dodania nowych zdjęć (admin)
func UpdateEstate(c *gin.Context) {
	fmt.Println("\n=== DEBUG UpdateEstate START ===")

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

	fmt.Printf("Updating estate ID: %d\n", id)

	// Aktualizuj podstawowe dane
	if typ := c.PostFormArray("type"); len(typ) > 0 {
		fmt.Printf("Updating types: %v\n", typ)
		typJSON, _ := json.Marshal(typ)
		estate.Typ = datatypes.JSON(typJSON)
	}

	if status := c.PostForm("status"); status != "" {
		estate.Status = status == "true"
		fmt.Printf("Updating status: %v\n", estate.Status)
	}

	if localization := c.PostForm("localization"); localization != "" {
		estate.Localization = localization
		fmt.Printf("Updating localization: %s\n", localization)
	}

	if surface := c.PostForm("surface"); surface != "" {
		if s, err := strconv.Atoi(surface); err == nil {
			estate.Surface = int32(s)
			fmt.Printf("Updating surface: %d\n", s)
		}
	}

	if price := c.PostForm("price"); price != "" {
		if p, err := strconv.Atoi(price); err == nil {
			estate.Price = int32(p)
			fmt.Printf("Updating price: %d\n", p)
		}
	}

	if opis := c.PostForm("opis"); opis != "" {
		estate.Opis = opis
		fmt.Printf("Updating description (length: %d)\n", len(opis))
	}

	// Sprawdź czy są nowe zdjęcia
	fmt.Println("Checking for new images...")
	newImages, err := saveUploadedFiles(c)

	if err == nil && len(newImages) > 0 {
		fmt.Printf("Found %d new images, replacing old ones\n", len(newImages))

		// Usuń stare zdjęcia z dysku
		deleteImageFiles(estate.Images)

		// Zapisz nowe ścieżki jako JSON
		imagesJSON, _ := json.Marshal(newImages)
		estate.Images = datatypes.JSON(imagesJSON)
	} else {
		fmt.Println("No new images, keeping existing ones")
	}

	// Zapisz zmiany
	if err := config.DB.Save(&estate).Error; err != nil {
		fmt.Printf("Database error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update estate", "details": err.Error()})
		return
	}

	fmt.Printf("Estate updated successfully\n")
	fmt.Println("=== DEBUG UpdateEstate END ===\n")

	c.JSON(http.StatusOK, gin.H{
		"message": "Estate updated successfully",
		"estate":  estate,
	})
}

// DeleteEstate - usuń nieruchomość wraz ze zdjęciami (admin)
func DeleteEstate(c *gin.Context) {
	fmt.Println("\n=== DEBUG DeleteEstate START ===")

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

	fmt.Printf("Deleting estate ID: %d\n", id)

	// DODANE: Usuń wszystkie powiązania z ulubionymi użytkowników
	if err := config.DB.Exec("DELETE FROM user_favourites WHERE estate_id = ?", id).Error; err != nil {
		fmt.Printf("Failed to remove favourites associations: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favourites associations"})
		return
	}

	// Usuń zdjęcia z dysku
	deleteImageFiles(estate.Images)

	// Usuń z bazy danych
	if err := config.DB.Delete(&estate).Error; err != nil {
		fmt.Printf("Database error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete estate", "details": err.Error()})
		return
	}

	fmt.Printf("Estate deleted successfully\n")
	fmt.Println("=== DEBUG DeleteEstate END ===\n")

	c.JSON(http.StatusOK, gin.H{"message": "Estate deleted successfully"})
}
