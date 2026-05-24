/**
 * usePayment hook
 * Loads Razorpay SDK, creates order, opens checkout, verifies payment.
 */

import { useState } from "react";
import { paymentApi } from "../services/api.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function usePayment() {
  const { currentUser, refreshUserDoc } = useAuth();
  const [paying, setPaying] = useState(false);

  async function initiatePayment() {
    if (!currentUser) {
      toast.error("Please sign in first to upgrade to premium.");
      return;
    }

    setPaying(true);
    const toastId = toast.loading("Setting up payment...");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your connection.");

      const { data } = await paymentApi.createOrder();

      if (data.alreadyPremium) {
        toast.success("You already have lifetime premium!", { id: toastId });
        await refreshUserDoc();
        return;
      }

      const { orderId, amount, currency, keyId } = data.data;

      await new Promise((resolve, reject) => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "TubeDrop",
          description: "Lifetime Premium Access",
          order_id: orderId,
          prefill: {
            email: currentUser.email || "",
            name: currentUser.displayName || "",
          },
          theme: { color: "#ff2d2d" },
          handler: async (response) => {
            toast.loading("Verifying payment...", { id: toastId });
            try {
              await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              await refreshUserDoc();
              toast.success("🎉 Premium activated! Enjoy HD downloads.", { id: toastId });
              resolve();
            } catch (err) {
              toast.error(err.message || "Payment verification failed.", { id: toastId });
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast.dismiss(toastId);
              reject(new Error("Payment cancelled."));
            },
          },
        };

        // eslint-disable-next-line no-undef
        new Razorpay(options).open();
      });
    } catch (err) {
      if (err.message !== "Payment cancelled.") {
        toast.error(err.message || "Payment failed.", { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } finally {
      setPaying(false);
    }
  }

  return { initiatePayment, paying };
}
