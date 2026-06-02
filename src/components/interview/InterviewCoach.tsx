"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface Props {
  applicationId: string
  jobDescription: string
  cvText: string
}

export function InterviewCoach({ applicationId, jobDescription, cvText }: Props) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [expandedBehavioral, setExpandedBehavioral] = useState<number | null>(null)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription, cvText }),
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
    } catch {}
    setLoading(false)
  }

  if (!jobDescription || !cvText) {
    return (
      <div className="text-center py-8">
        <Sparkles className="mx-auto h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          Add a job description to generate interview prep.
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-8">
        <Sparkles className="mx-auto h-8 w-8 text-violet-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">
          Generate technical questions, behavioral questions, and company preparation.
        </p>
        <Button onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
          {loading ? "Generating..." : "Generate Interview Prep"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="technical">
        <TabsList>
          <TabsTrigger value="technical">Technical Questions</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral (STAR)</TabsTrigger>
          <TabsTrigger value="company">Company Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-3">
          {result.technical_questions?.map((q: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4">
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)}
                  className="flex items-start justify-between w-full text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-50 text-xs text-violet-600 font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{q.question}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-7">
                      {q.expected_areas?.map((area: string, j: number) => (
                        <Badge key={j} variant="outline" className="text-[10px]">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  {expandedQuestion === i ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {expandedQuestion === i && q.sample_answer && (
                  <div className="mt-3 ml-7 p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium mb-1">Sample Answer:</p>
                    <p className="text-sm text-gray-700">{q.sample_answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-3">
          {result.behavioral_questions?.map((q: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4">
                <button
                  onClick={() => setExpandedBehavioral(expandedBehavioral === i ? null : i)}
                  className="flex items-start justify-between w-full text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-xs text-amber-600 font-medium">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{q.question}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-7">STAR: {q.type}</span>
                  </div>
                  {expandedBehavioral === i ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {expandedBehavioral === i && (
                  <div className="mt-3 ml-7 space-y-2">
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">Situation:</span>
                      <p className="text-sm text-gray-700">{q.situation}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">Task:</span>
                      <p className="text-sm text-gray-700">{q.task}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">Action:</span>
                      <p className="text-sm text-gray-700">{q.action}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">Result:</span>
                      <p className="text-sm text-gray-700">{q.result}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="company">
          {result.company_preparation && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Interview Format</h4>
                  <p className="text-sm text-gray-700">{result.company_preparation.common_interview_format}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Key Areas to Review</h4>
                  <ul className="space-y-1">
                    {result.company_preparation.key_areas_to_review?.map((area: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Questions to Ask</h4>
                  <ul className="space-y-1">
                    {result.company_preparation.questions_to_ask?.map((q: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
