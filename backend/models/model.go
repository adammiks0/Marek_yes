package models

import (
	"gorm.io/datatypes"
)

type Estate struct {
	Id int32 `json:"id" gorm:"primaryKey"`
	// type so Estate we have as array:
	// budowlano-usługowa, dom, dzialka, dzialka rolnicza, działka budowlana, działka budowlano-rolna, przemysłowa
	Typ datatypes.JSON `json:"type" gorm:"type:json"`
	// true means sprzedane, false means na sprzedaż
	Status bool `json:"status"`
	// Lokalizacja moze to byc: Koniaków, Istebna, Jaworzynka, Laliki, Sól, Zwardoń
	Localization string         `json:"localization"`
	Surface      int32          `json:"surface"`
	Price        int32          `json:"price"`
	Opis         string         `json:"opis"`
	Images       datatypes.JSON `json:"images" gorm:"type:json"`
	Rooms        *int32         `json:"rooms"`
	Year         *int32         `json:"year"`
	Baths        *int32         `json:"baths"`
}

type User struct {
	Id        int32    `json:"id" gorm:"primaryKey"`
	Name      string   `json:"name"`
	Lastname  string   `json:"lastname"`
	Email     string   `json:"email" gorm:"unique"`
	Password  string   `json:"password"`
	Favourite []Estate `json:"favourite" gorm:"many2many:user_favourites;"`
}
