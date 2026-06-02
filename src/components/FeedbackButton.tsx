"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !message.trim()) {
      alert("Please provide a rating and message");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        setRating(0);
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      alert(`Failed to submit feedback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4 text-amber-400" />
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Star className="h-4 w-4" />
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="w-[400px] sm:max-w-[90vw]">
          <ModalHeader>
            <ModalTitle>We'd love your feedback!</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">How would you rate your experience?</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className={`h-10 w-10 rounded ${r <= rating ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                  >
                    <Star className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">What could we improve?</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please be specific about what we can do better..."
                minRows={4}
                maxRows={6}
              />
            </div>

            {success && (
              <div className="text-sm text-green-600 text-center">
                Thank you for your feedback!
              </div>
            )}
          </div>
          <ModalFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSuccess(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || rating === 0 || !message.trim()}
              className="w-[100px]"
            >
              {loading ? "Submitting..." : "Send Feedback"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}