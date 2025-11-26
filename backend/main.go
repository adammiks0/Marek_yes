package main

import (
	"backend/handlers"
	config "backend/init"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func init() {
	config.GetEnv()
	config.ConnectDB()
	config.CreateDB()
}

func main() {
	// Create a Gin router with default middleware (logger and recovery)
	r := gin.Default()

	// CORS middleware (optional - if connecting with frontend)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.Static("/uploads", "./uploads")
	// ============= PUBLIC ROUTES =============
	// Account
	r.POST("/api/register", handlers.Register) // register
	r.POST("/api/login", handlers.Login)       // login

	// Server - estates (public access)
	r.GET("/api/estates", handlers.GetAllEstates)                          // looking at all estates
	r.GET("/api/estates/:id", handlers.GetEstateByID)                      // single estate details
	r.GET("/api/estates/search", handlers.SearchEstates)                   // searching estate (price min-max, localization, type, surface max-min)
	r.GET("/api/estates/:id/recommendations", handlers.GetRecommendations) // recommendations - matching estate algorithm

	// ============= PROTECTED ROUTES (require JWT token) =============
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Favourites
		protected.GET("/favourites", handlers.GetFavourites)               // checking fav
		protected.POST("/favourites/:id", handlers.AddToFavourites)        // adding estate to fav
		protected.DELETE("/favourites/:id", handlers.RemoveFromFavourites) // removing from fav
		protected.GET("/user", handlers.GetUser)                           // checking fav
	}

	// ============= ADMIN PANEL (require JWT token + admin rights) =============
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.POST("/estates", handlers.CreateEstate)       // adding estate
		admin.PUT("/estates/:id", handlers.UpdateEstate)    // changing estate
		admin.DELETE("/estates/:id", handlers.DeleteEstate) // deleting estate
	}
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Estate API is running"})
	})

	// Server will listen on 0.0.0.0:8080
	r.Run()
}
