package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const razorpayOrdersURL = "https://api.razorpay.com/v1/orders"
const admissionDepositPaise int64 = 100000

type server struct {
	keyID          string
	keySecret      string
	frontendOrigin string
	client         *http.Client
}

type createOrderRequest struct {
	Amount   int64             `json:"amount"`
	Currency string            `json:"currency"`
	Receipt  string            `json:"receipt,omitempty"`
	Notes    map[string]string `json:"notes,omitempty"`
}

type createOrderResponse struct {
	KeyID    string `json:"keyId"`
	OrderID  string `json:"orderId"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
}

type verifyPaymentRequest struct {
	OrderID   string `json:"razorpayOrderId"`
	PaymentID string `json:"razorpayPaymentId"`
	Signature string `json:"razorpaySignature"`
}

type verifyPaymentResponse struct {
	Verified bool   `json:"verified"`
	Message  string `json:"message"`
}

type razorpayOrder struct {
	ID       string `json:"id"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
}

func main() {
	s := &server{
		keyID:          os.Getenv("RAZORPAY_KEY_ID"),
		keySecret:      os.Getenv("RAZORPAY_KEY_SECRET"),
		frontendOrigin: envOr("FRONTEND_ORIGIN", "http://localhost:4200"),
		client:         &http.Client{Timeout: 15 * time.Second},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", s.handleHealth)
	mux.HandleFunc("/api/payments/orders", s.handleCreateOrder)
	mux.HandleFunc("/api/payments/verify", s.handleVerifyPayment)

	addr := ":" + envOr("PORT", "8080")
	log.Printf("DexLabs payment API listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, s.withCORS(mux)))
}

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *server) handleCreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if s.keyID == "" || s.keySecret == "" {
		writeError(w, http.StatusServiceUnavailable, "Razorpay credentials are not configured")
		return
	}

	var input createOrderRequest
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid order request")
		return
	}
	if input.Amount != admissionDepositPaise {
		writeError(w, http.StatusBadRequest, "the admission deposit is fixed at 100000 paise")
		return
	}
	if input.Currency == "" {
		input.Currency = "INR"
	}
	if input.Currency != "INR" {
		writeError(w, http.StatusBadRequest, "only INR payments are supported")
		return
	}
	if input.Receipt == "" {
		input.Receipt = fmt.Sprintf("dexlabs_%d", time.Now().UnixNano())
	}
	if len(input.Receipt) > 40 {
		writeError(w, http.StatusBadRequest, "receipt must be 40 characters or fewer")
		return
	}

	payload, err := json.Marshal(input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not encode order request")
		return
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, razorpayOrdersURL, bytes.NewReader(payload))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not create Razorpay request")
		return
	}
	request.SetBasicAuth(s.keyID, s.keySecret)
	request.Header.Set("Content-Type", "application/json")

	response, err := s.client.Do(request)
	if err != nil {
		log.Printf("Razorpay order request failed: %v", err)
		writeError(w, http.StatusBadGateway, "could not reach Razorpay")
		return
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1<<20))
	if err != nil {
		writeError(w, http.StatusBadGateway, "could not read Razorpay response")
		return
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		log.Printf("Razorpay order rejected (%d): %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
		writeError(w, http.StatusBadGateway, "Razorpay rejected the order")
		return
	}

	var order razorpayOrder
	if err := json.Unmarshal(responseBody, &order); err != nil || order.ID == "" {
		writeError(w, http.StatusBadGateway, "Razorpay returned an invalid order")
		return
	}
	writeJSON(w, http.StatusCreated, createOrderResponse{
		KeyID:    s.keyID,
		OrderID:  order.ID,
		Amount:   order.Amount,
		Currency: order.Currency,
	})
}

func (s *server) handleVerifyPayment(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if s.keySecret == "" {
		writeError(w, http.StatusServiceUnavailable, "Razorpay credentials are not configured")
		return
	}

	var input verifyPaymentRequest
	if err := decodeJSON(r, &input); err != nil || input.OrderID == "" || input.PaymentID == "" || input.Signature == "" {
		writeError(w, http.StatusBadRequest, "order, payment and signature are required")
		return
	}

	message := input.OrderID + "|" + input.PaymentID
	hasher := hmac.New(sha256.New, []byte(s.keySecret))
	_, _ = hasher.Write([]byte(message))
	expected := hex.EncodeToString(hasher.Sum(nil))
	if !hmac.Equal([]byte(strings.ToLower(input.Signature)), []byte(expected)) {
		writeJSON(w, http.StatusBadRequest, verifyPaymentResponse{Verified: false, Message: "payment signature is invalid"})
		return
	}

	writeJSON(w, http.StatusOK, verifyPaymentResponse{Verified: true, Message: "payment verified"})
}

func (s *server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && (origin == s.frontendOrigin || s.frontendOrigin == "*") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func decodeJSON(r *http.Request, target any) error {
	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return err
	}
	if decoder.Decode(&struct{}{}) != io.EOF {
		return errors.New("request contains more than one JSON value")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
