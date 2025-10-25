// backend/scripts/seed_products.go
package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Product struct {
	ID          uint   `gorm:"primaryKey"`
	SKU         string `gorm:"unique"`
	Name        string
	Description string
	Price       float64
	Stock       int
	ImageURL    string
	Images      string `gorm:"type:jsonb;default:'[]'"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func getSupabaseImageURL(filename string) string {
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = "https://zsyhuqvoypolkktgngwk.supabase.co"
	}
	return fmt.Sprintf("%s/storage/v1/object/public/product-images/%s.jpg", supabaseURL, filename)
}

func buildImagesJSON(imageFiles []string) string {
	// Convertir array de strings a JSON array
	quoted := make([]string, len(imageFiles))
	for i, file := range imageFiles {
		quoted[i] = fmt.Sprintf(`"%s.jpg"`, file)
	}
	return fmt.Sprintf("[%s]", strings.Join(quoted, ","))
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL no configurada")
	}

	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Error conectando a BD:", err)
	}

	log.Println("Conexion establecida con Supabase")

	// Limpiar tabla
	db.Exec("TRUNCATE TABLE products RESTART IDENTITY CASCADE")
	log.Println("Tabla products limpiada")

	// Productos agrupados correctamente
	// Cada entrada representa UN producto único con su galería de imágenes
	products := []struct {
		Name   string
		Desc   string
		Price  float64
		Images []string // Array de nombres de archivo (sin extensión)
	}{
		{"Tobillera de ojo turco", "Tobillera con perlas que incluye 8 colores diferentes de ojo turco.", 40.00, []string{"1"}},
		{"Pulsera Lily blanca", "Pulsera con perlas blancas y perlas acrilicas de colores e iniciales personalizadas.", 15.00, []string{"2", "2.1"}},
		{"Pulsera Lily negra", "Pulsera con perlas negras y perlas acrilicas de colores.", 15.00, []string{"3"}},
		{"Collar de perlas", "Collar con perlas medianas y pequenas.", 35.00, []string{"4", "4.1"}},
		{"Pulsera de puca", "Pulseras de puca con perlas blancas y corazon de color combinado en varios colores.", 15.00, []string{"5", "5.1", "5.2"}},
		{"Pulsera de ojo turco", "Pulsera con perlas que incluye 8 colores diferentes de ojo turco.", 30.00, []string{"6"}},
		{"Duo de pulseras volcanicas", "Duo de pulseras con perla volcanica y dije con iman en varios colores.", 60.00, []string{"7", "7.1", "7.2", "7.3", "7.4", "7.5"}},
		{"Duo de pulseras fosforescentes", "Duo de Pulseras fosforescentes con dije de montana y mar en varios colores.", 35.00, []string{"8", "8.1", "8.2"}},
		{"Pulseras tejidas de ojo turco", "Pulsera tejida con 3 dijes de ojo turco.", 20.00, []string{"9"}},
		{"Conjunto 4 pulseras", "Conjunto de 4 Pulseras con dijes variados en diferentes colores.", 50.00, []string{"10", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7"}},
		{"Lapices infinitos", "Lapices infinitos con munequitos en diferentes estilos.", 15.00, []string{"11", "11.1", "11.2"}},
		{"Pulsera pandora sirena", "Pulsera estilo pandora con dije de sirena en varios colores.", 25.00, []string{"12", "12.1", "12.2", "12.3"}},
		{"Duo collar astronauta", "Duo de collar de acero inoxidable con dije de astronauta e iman.", 50.00, []string{"13"}},
		{"Anillo estilo cartier", "Anillo estilo cartier de acero inoxidable en color dorado talla 7.", 75.00, []string{"14"}},
		{"Hulitos estuche gatito", "Hulitos de colores con estuche de gatito.", 15.00, []string{"15"}},
		{"Mini libreta", "Mini libreta con hojas de lineas.", 10.00, []string{"16", "16.1"}},
		{"Duo pulseras spiderman", "Duo de pulseras con dije de spiderman con perlas negras, rojas y azules.", 70.00, []string{"17"}},
		{"Estuche colitas y hulitos", "Estuche de acrilico con colitas y hulitos de colores.", 20.00, []string{"18"}},
		{"Duo pulseras spiderman tejidas", "Duo de pulseras tejidas con dije de spiderman.", 35.00, []string{"19"}},
		{"Bolso Harry Potter", "Bolso pequeno con estampado de Harry Potter.", 25.00, []string{"20"}},
		{"Stickers Harry Potter", "Stickers de Harry Potter y personajes de la pelicula.", 25.00, []string{"21"}},
		{"Sujetador gafete Harry Potter", "Sujetador para gafete con cinta para colgar.", 35.00, []string{"22"}},
		{"Tenedores botaneros Harry Potter", "Tenedores botaneros con cabeza de Harry Potter.", 35.00, []string{"23"}},
		{"Separadores hojas Harry Potter", "Separadores de hojas de los personajes.", 45.00, []string{"24"}},
		{"Notas adhesivas buho Harry Potter", "Notas adhesivas en forma de buho.", 25.00, []string{"25"}},
		{"Notas adhesivas Harry Potter", "Notas adhesivas translucidas.", 30.00, []string{"26", "26.1"}},
		{"Duo pajillas Harry Potter", "Duo de pajillas de plastico de HP y Hermione.", 20.00, []string{"27"}},
		{"Cartuchera Lila Harry Potter", "Cartuchera color Lila con estampado.", 25.00, []string{"28"}},
		{"Cartuchera roja Harry Potter", "Cartuchera translucida con impresiones.", 25.00, []string{"29"}},
		{"Cartuchera metalica Harry Potter", "Cartuchera metalica color rojo.", 25.00, []string{"30"}},
		{"Bolsa regalo Harry Potter", "Bolsa de regalo roja con impresiones 2D.", 40.00, []string{"31"}},
		{"Caja Harry Potter", "Caja de carton grueso con estampado.", 25.00, []string{"32", "32.1"}},
		{"Bolsa escudo Harry Potter", "Bolsa roja y negra con el escudo.", 25.00, []string{"33", "33.1"}},
		{"5 hojas stickers Harry Potter", "5 hojas de stickers de HP y personajes.", 45.00, []string{"34"}},
		{"6 hojas stickers Spiderman", "6 hojas de stickers de Spiderman.", 50.00, []string{"35"}},
		{"Libreta espiral Hello Kitty", "Libreta de espiral con hojas de lineas.", 30.00, []string{"36", "36.1"}},
		{"6 hojas stickers Hello Kitty", "6 hojas de stickers de Hello Kitty.", 50.00, []string{"37"}},
		{"Libreta elastico Hello Kitty", "Libreta con hojas de lineas y elastico.", 30.00, []string{"38", "38.1"}},
		{"Duo llaveros Hello Kitty", "Duo de llaveros rosa y fucsia.", 30.00, []string{"39"}},
		{"Separadores Hello Kitty", "Separadores en tonos rosa con iman.", 35.00, []string{"40"}},
		{"Destapador Mickey navideno", "Destapador navideno de Mickey Mouse.", 35.00, []string{"41"}},
		{"Clips decorativos Hello Kitty", "4 Clips decorativos en acrilico.", 35.00, []string{"42"}},
		{"Vestido rosa", "Vestido unitalla con escote recto corrugado.", 85.00, []string{"43"}},
		{"Vestido lila", "Vestido unitalla con escote recto corrugado.", 85.00, []string{"44"}},
		{"Vestido rojo", "Vestido unitalla con escote en V ajustable.", 85.00, []string{"45"}},
		{"Vestido fucsia", "Vestido unitalla con escote en V ajustable.", 85.00, []string{"46"}},
		{"Vestido flores", "Vestido unitalla estampado flores en varios colores.", 85.00, []string{"47", "47.1"}},
		{"Blusa camisa negra", "Blusa unitalla estilo camisa corta.", 50.00, []string{"48"}},
		{"Blusa manga larga", "Blusa unitalla manga larga en varios estilos.", 50.00, []string{"49", "49.1", "49.2", "49.3", "49.4"}},
		{"Blusa escote hombros perlas", "Blusa talla S con escote en hombros y perlas.", 50.00, []string{"50"}},
		{"Blusa animal print collar", "Blusa talla S de animal print con collar.", 60.00, []string{"51"}},
		{"Camisa bordado rosas", "Camisa unitalla blanca con bordado de rosas rojas.", 50.00, []string{"52"}},
		{"Blusa estampado collar perlas", "Blusa unitalla con estampado y collar bordado.", 70.00, []string{"53"}},
		{"Blusa con estampado", "Blusa unitalla con estampado en varios colores.", 60.00, []string{"54", "54.1", "54.2"}},
		{"Sudadera de marca", "Sudadera unitalla de marcas reconocidas.", 85.00, []string{"55", "55.1", "55.2", "55.3", "55.4"}},
		{"Blusa manga larga corta", "Blusa talla S corta de manga larga.", 100.00, []string{"56", "56.1"}},
		{"Blusa con perlas", "Blusa talla S con detalles de perlas en varios colores.", 60.00, []string{"57", "57.1", "57.2"}},
		{"Blusa lisa con collar", "Blusa talla S lisa con collar en varios colores.", 60.00, []string{"58", "58.1", "58.2"}},
		{"Mochila Kuromi negra", "Mochila negra con bordado de Kuromi tamano carta.", 110.00, []string{"59", "59.1", "59.2"}},
		{"Mochila Hello Kitty rosa", "Mochila rosa con bordado de Hello Kitty tamano carta.", 110.00, []string{"60", "60.1", "60.2"}},
		{"Mochila Cinnamoroll celeste", "Mochila celeste con bordado de Cinnamoroll tamano carta.", 110.00, []string{"61", "61.1", "61.2"}},
		{"Sombras ojos verano", "Sombras para ojos en tonos de verano.", 35.00, []string{"62", "62.1"}},
		{"Duo pulseras yin yang", "Duo de pulseras bordadas con dijes de yin y yang.", 30.00, []string{"63"}},
		{"Aretes corazon acero inoxidable", "Aretes de corazon de acero inoxidable en varios estilos.", 50.00, []string{"64", "64.1", "64.2", "64.3", "64.4", "64.5", "64.6"}},
		{"Aretes estrella acero", "Aretes de estrella de acero inoxidable.", 65.00, []string{"64.7"}},
		{"Aretes forma C", "Aretes en forma de C de acero inoxidable.", 25.00, []string{"65", "65.1", "65.2"}},
		{"Ear Cuff", "Ear Cuff transparente con tonalidad naranja.", 25.00, []string{"65.3"}},
		{"Mascarillas", "Mascarillas de las chicas super poderosas.", 10.00, []string{"66"}},
		{"Ganchos Hawaianos grandes", "Ganchos grandes coloridos estilo Hawaiano.", 10.00, []string{"67"}},
		{"Ganchos Hawaianos pequenos", "Ganchos pequenos coloridos estilo Hawaiano.", 7.00, []string{"68"}},
		{"Ganchos monos", "Ganchos grandes con monos de tela.", 15.00, []string{"69"}},
		{"Ganchos mariposas pequenos", "Ganchos pequenos de mariposas translucidos.", 5.00, []string{"70"}},
		{"Trio ganchos metal rosa", "Trio de ganchos de metal color rosa.", 30.00, []string{"71"}},
		{"Ganchos grandes", "Ganchos grandes en color rosa y negro.", 20.00, []string{"72"}},
		{"Duo ganchos metal rosa", "Duo de ganchos de metal color rosa.", 15.00, []string{"73"}},
		{"Ganchos confeti grandes", "Ganchos transparentes con confeti.", 10.00, []string{"74"}},
		{"Duo ganchos plastico", "Duo de ganchos de plastico de colores.", 15.00, []string{"75"}},
		{"Trio ganchos plastico", "Trio de ganchos de plastico de colores.", 15.00, []string{"76"}},
		{"Gancho mariposas grandes", "Gancho de mariposas grandes translucidos.", 15.00, []string{"77"}},
		{"Hulitos estuche gatito", "Hulitos de colores con estuche de gatito.", 10.00, []string{"78"}},
		{"Labial fresa", "Labial en forma de fresa con sabor y aroma.", 15.00, []string{"79"}},
		{"Pulsera tejida futbol", "Pulsera tejida con perlas de equipo de futbol.", 40.00, []string{"80"}},
		{"Pulsera acero ojo turco", "Pulsera de acero inoxidable con ojo turco.", 35.00, []string{"81"}},
		{"Pulsera acero bancleff", "Pulsera de acero inoxidable replica bancleff.", 80.00, []string{"82"}},
		{"Hulitos estuche flor", "Hulitos de colores con estuche de flor.", 15.00, []string{"83"}},
	}

	log.Printf("Iniciando seed de %d productos unicos...\n", len(products))

	insertedCount := 0
	failedCount := 0

	for i, p := range products {
		sku := fmt.Sprintf("PROD-%03d", i+1)

		// Imagen principal (primera del array)
		mainImageURL := getSupabaseImageURL(p.Images[0])

		// JSON de galería completa
		imagesJSON := buildImagesJSON(p.Images)

		product := Product{
			SKU:         sku,
			Name:        p.Name,
			Description: p.Desc,
			Price:       p.Price,
			Stock:       10,
			ImageURL:    mainImageURL,
			Images:      imagesJSON,
		}

		if err := db.Create(&product).Error; err != nil {
			log.Printf("[ERROR] Producto %d (%s): %v", i+1, p.Name, err)
			failedCount++
		} else {
			insertedCount++
			if insertedCount%10 == 0 {
				fmt.Printf("[PROGRESO] %d/%d productos insertados\n", insertedCount, len(products))
			}
		}
	}

	log.Println("========================================")
	log.Printf("SEED COMPLETADO")
	log.Printf("Productos unicos insertados: %d", insertedCount)
	log.Printf("Productos con error: %d", failedCount)
	log.Printf("Total procesados: %d/%d", insertedCount+failedCount, len(products))
	log.Println("========================================")

	var totalInDB int64
	db.Model(&Product{}).Count(&totalInDB)
	log.Printf("Total en base de datos: %d productos unicos", totalInDB)

	if totalInDB == int64(len(products)) {
		log.Printf("VERIFICACION OK: %d productos insertados correctamente", len(products))
	} else {
		log.Printf("ADVERTENCIA: Se esperaban %d productos pero hay %d", len(products), totalInDB)
	}
}
