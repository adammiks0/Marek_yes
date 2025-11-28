package handlers

import (
	config "backend/init"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// CreateEstate - dodaj nową nieruchomość z zdjęciami (admin)
func CreateEstate(c *gin.Context) {
	// fmt.Println("\n=== DEBUG CreateEstate START ===")

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
	// lepiej do organizacji tak zrobic
	rooms, _ := strconv.Atoi(c.PostForm("rooms"))
	baths, _ := strconv.Atoi(c.PostForm("baths"))
	year, _ := strconv.Atoi(c.PostForm("year"))
	r := int32(rooms)
	b := int32(baths)
	y := int32(year)

	estate.Rooms = &r
	estate.Baths = &b
	estate.Year = &y
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
	// fmt.Println("=== DEBUG CreateEstate END ===\n")

	c.JSON(http.StatusCreated, gin.H{
		"message": "Estate created successfully",
		"estate":  estate,
	})
}

// UpdateEstate - zaktualizuj nieruchomość z opcją dodania nowych zdjęć (admin)
func UpdateEstate(c *gin.Context) {
	// fmt.Println("\n=== DEBUG UpdateEstate START ===")

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

	// Rooms
	if rooms := c.PostForm("rooms"); rooms != "" {
		if r, err := strconv.Atoi(rooms); err == nil {
			v := int32(r)
			estate.Rooms = Int32Ptr(v)
			fmt.Printf("Updating rooms: %d\n", r)
		}
	}

	// Baths
	if baths := c.PostForm("baths"); baths != "" {
		if b, err := strconv.Atoi(baths); err == nil {
			v := int32(b)
			estate.Baths = Int32Ptr(v)
			fmt.Printf("Updating baths: %d\n", b)
		}
	}

	// Year
	if year := c.PostForm("year"); year != "" {
		if y, err := strconv.Atoi(year); err == nil {
			v := int32(y)
			estate.Year = Int32Ptr(v)
			fmt.Printf("Updating year: %d\n", y)
		}
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
	// fmt.Println("=== DEBUG UpdateEstate END ===\n")

	c.JSON(http.StatusOK, gin.H{
		"message": "Estate updated successfully",
		"estate":  estate,
	})
}

// DeleteEstate - usuń nieruchomość wraz ze zdjęciami (admin)
func DeleteEstate(c *gin.Context) {
	// fmt.Println("\n=== DEBUG DeleteEstate START ===")

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
	// fmt.Println("=== DEBUG DeleteEstate END ===\n")

	c.JSON(http.StatusOK, gin.H{"message": "Estate deleted successfully"})
}
func Int32Ptr(i int32) *int32 { return &i }
