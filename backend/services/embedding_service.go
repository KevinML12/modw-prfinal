// backend/services/embedding_service.go
package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os" // Para leer la URL de Ollama del entorno
)

// OllamaEmbeddingResponse define la estructura de la respuesta de Ollama
type OllamaEmbeddingResponse struct {
	Embedding []float32 `json:"embedding"`
}

// GetEmbedding llama al servicio Ollama para obtener el vector de un texto.
func GetEmbedding(text string) ([]float32, error) {
	// Leemos la URL de Ollama desde las variables de entorno
	ollamaURL := os.Getenv("OLLAMA_URL")
	if ollamaURL == "" {
		ollamaURL = "http://ollama:11434" // Valor por defecto
	}
	apiEndpoint := fmt.Sprintf("%s/api/embeddings", ollamaURL)

	// Preparamos el cuerpo de la petición para Ollama
	requestBody, err := json.Marshal(map[string]string{
		"model":  "all-minilm", // El modelo que descargamos
		"prompt": text,
	})
	if err != nil {
		return nil, fmt.Errorf("error al crear el cuerpo de la petición: %w", err)
	}

	// Hacemos la petición POST
	resp, err := http.Post(apiEndpoint, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("error al conectar con Ollama (%s): %w", apiEndpoint, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error de Ollama (%d): %s", resp.StatusCode, string(bodyBytes))
	}

	// Decodificamos la respuesta
	var ollamaResp OllamaEmbeddingResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return nil, fmt.Errorf("error al decodificar la respuesta de Ollama: %w", err)
	}

	if len(ollamaResp.Embedding) == 0 {
		return nil, errors.New("Ollama devolvió un embedding vacío")
	}

	// ¡Éxito! Devolvemos el vector
	return ollamaResp.Embedding, nil
}
