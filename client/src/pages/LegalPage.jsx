import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";

const PAGES = {
  privacy: {
    title: "Privacy Policy",
    content: `Your privacy is important to us. TubeDrop does not store, cache, or retain any downloaded media files on our servers. All downloads are streamed directly to your device and deleted from our temporary storage immediately after transfer.

We collect only the minimum data required to operate: your email and display name (via Google Sign-In) for authentication and premium access management. Payment processing is handled entirely by Razorpay — we never see or store your payment details.

Download history is logged for analytics and troubleshooting purposes only. You may request deletion of your data at any time by contacting us.`,
  },
  terms: {
    title: "Terms of Service",
    content: `By using TubeDrop, you agree to use this service only for downloading content that you have the legal right to access and download. You must comply with all applicable laws and the terms of service of the source platforms.

You shall not use TubeDrop to infringe upon copyrights, intellectual property rights, or any other legal rights of third parties. We reserve the right to restrict or terminate access for users who violate these terms.

Premium access is a one-time payment processed via Razorpay. No refunds are provided after premium activation. We reserve the right to modify or discontinue the service at any time with reasonable notice.`,
  },
  disclaimer: {
    title: "Legal Disclaimer",
    content: `TubeDrop is a tool designed for downloading media that users have the legal right to access. We do not host, upload, or distribute any copyrighted content.

Users are solely responsible for ensuring that their use of TubeDrop complies with:
• The YouTube Terms of Service
• Instagram's Terms of Use
• Facebook's Terms of Service
• Twitter/X's Terms of Service
• TikTok's Terms of Service
• All applicable copyright laws and regulations
• The terms of service of any platform accessed through this tool

We strongly encourage users to only download content that they own, have created themselves, or have explicit permission to download from the copyright holder. Downloading copyrighted material without permission may violate copyright laws in your jurisdiction.

TubeDrop does not condone piracy or copyright infringement. If you are a copyright holder and believe your content has been downloaded through this service in violation of your rights, please contact us.

This service is provided "as is" without any warranty. The operators of TubeDrop shall not be held liable for any misuse of this tool.`,
  },
};

export default function LegalPage() {
  const { page } = useParams();
  const info = PAGES[page];

  if (!info) {
    return (
      <div style={{ textAlign: "center", padding: "80px 6vw" }}>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#f0f0f0" }}>Page not found</h1>
        <Link to="/" style={{ color: "#ff2d2d" }}>Go home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 6vw 80px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 48, margin: 0, color: "#f0f0f0" }}>
            {info.title}
          </h1>
          <Link to="/" style={{ fontSize: 13, color: "#888", textDecoration: "none", padding: "8px 16px",
            borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
            ✕ Close
          </Link>
        </div>
        <div style={{ height: 3, width: 60, background: "#ff2d2d", borderRadius: 99, marginBottom: 32 }} />
        <div style={{ fontSize: 15, color: "#999", lineHeight: 1.9, whiteSpace: "pre-line" }}>
          {info.content}
        </div>
      </motion.div>
    </div>
  );
}
