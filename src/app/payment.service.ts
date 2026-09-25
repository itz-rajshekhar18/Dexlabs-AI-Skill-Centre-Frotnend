import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CreateOrderRequest = {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export type CreateOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
};

export type VerifyPaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type VerifyPaymentResponse = {
  verified: boolean;
  message: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: VerifyPaymentRequest) => void;
  modal: { ondismiss: () => void };
};

type RazorpayCheckout = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:8080' : '';

  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.apiBase}/api/payments/orders`, request);
  }

  verifyPayment(request: VerifyPaymentRequest): Observable<VerifyPaymentResponse> {
    return this.http.post<VerifyPaymentResponse>(`${this.apiBase}/api/payments/verify`, request);
  }

  loadCheckout(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.reject(new Error('Payments are only available in a browser.'));
    }
    if (window.Razorpay) {
      return Promise.resolve();
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Razorpay Checkout could not load.')), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset['razorpayCheckout'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay Checkout could not load.'));
      document.head.appendChild(script);
    });
  }

  openCheckout(options: RazorpayOptions): void {
    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error('Razorpay Checkout is not available.');
    }
    new window.Razorpay(options).open();
  }
}
