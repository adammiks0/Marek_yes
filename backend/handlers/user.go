package handlers

import (
	config "backend/init"
	"backend/jwt"
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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
