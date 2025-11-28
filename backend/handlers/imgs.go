package handlers

import (
	config "backend/init"
	"backend/models"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

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
