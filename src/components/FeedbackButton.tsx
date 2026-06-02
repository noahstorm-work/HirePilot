"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to submit feedback: ${message}`);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[400px] sm:max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>We'd love your feedback!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
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
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please be specific about what we can do better..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {success && (
                <div className="text-sm text-green-600 text-center">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}