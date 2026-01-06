"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { getTeamColor } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy, Brain, Target, Award } from "lucide-react";
import { useState } from "react";

export default function PredictorPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [round, setRound] = useState<number>(1);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showScore, setShowScore] = useState(false);

  // Get race schedule
  const { data: scheduleData } = useQuery({
    queryKey: ["schedule", year],
    queryFn: async () => {
      const response = await api.get(`/jolpica/schedule?season=${year}`);
      return response.data;
    },
  });

  // Get prediction template
  const { data: templateData, isLoading: templateLoading, refetch: refetchTemplate } = useQuery({
    queryKey: ["predictor-template", year, round],
    queryFn: async () => {
      const response = await api.get(`/predictor/template/${year}/${round}`);
      return response.data;
    },
    enabled: false,
  });

  // Get AI prediction
  const { data: aiPrediction, isLoading: aiLoading, refetch: refetchAI } = useQuery({
    queryKey: ["ai-prediction", year, round],
    queryFn: async () => {
      const response = await api.get(`/predictor/ai-prediction/${year}/${round}`);
      return response.data;
    },
    enabled: false,
  });

  // Get scoring rules
  const { data: rulesData } = useQuery({
    queryKey: ["scoring-rules"],
    queryFn: async () => {
      const response = await api.get("/predictor/scoring-rules");
      return response.data;
    },
  });

  const handleLoadTemplate = () => {
    refetchTemplate();
    setShowScore(false);
    setPredictions([]);
  };

  const handleLoadAI = () => {
    refetchAI();
  };

  const handleUseAIPrediction = () => {
    if (aiPrediction && aiPrediction.predictions) {
      const newPredictions = aiPrediction.predictions.map((p: any) => ({
        driver_id: p.driver_id,
        predicted_position: p.predicted_position,
      }));
      setPredictions(newPredictions);
    }
  };

  const handlePositionChange = (driverId: string, position: number) => {
    setPredictions(prev => {
      const existing = prev.find(p => p.driver_id === driverId);
      if (existing) {
        return prev.map(p => 
          p.driver_id === driverId 
            ? { ...p, predicted_position: position }
            : p
        );
      } else {
        return [...prev, { driver_id: driverId, predicted_position: position }];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/predictor/score/${year}/${round}`, predictions);
      setShowScore(true);
      // You could store the score data here
    } catch (error) {
      console.error("Failed to submit predictions:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <TrendingUp className="h-10 w-10" />
          Race Predictor
        </h1>
        <p className="text-muted-foreground mt-2">
          Predict race results and compete with AI
        </p>
      </div>

      <Tabs defaultValue="predict" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predict">Make Prediction</TabsTrigger>
          <TabsTrigger value="ai">AI Prediction</TabsTrigger>
          <TabsTrigger value="rules">Scoring Rules</TabsTrigger>
        </TabsList>

        {/* Predict Tab */}
        <TabsContent value="predict" className="mt-6 space-y-6">
          {/* Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Race</CardTitle>
              <CardDescription>Choose a race to make your predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-background"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {[currentYear, currentYear - 1].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Race</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-background"
                    value={round}
                    onChange={(e) => setRound(Number(e.target.value))}
                  >
                    {scheduleData?.races.map((r: any) => (
                      <option key={r.round} value={r.round}>
                        Round {r.round}: {r.raceName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleLoadTemplate} disabled={templateLoading} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Load Race Template
              </Button>
            </CardContent>
          </Card>

          {/* Prediction Form */}
          {templateData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{templateData.race.raceName}</CardTitle>
                  <CardDescription>
                    {templateData.race.Circuit.circuitName} • 
                    {templateData.race.Circuit.Location.locality}, {templateData.race.Circuit.Location.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag or select positions for each driver:
                    </p>
                    {templateData.drivers.map((driver: any) => (
                      <div key={driver.driver_id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {driver.code}
                          </div>
                          <div>
                            <p className="font-semibold">{driver.name}</p>
                            <p className="text-sm">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(driver.team || "")}`}>
                                {driver.team || "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {driver.qualifying_position && (
                            <span className="text-sm text-muted-foreground">
                              Q: P{driver.qualifying_position}
                            </span>
                          )}
                          <select
                            className="p-2 border rounded bg-background w-20"
                            value={predictions.find(p => p.driver_id === driver.driver_id)?.predicted_position || ""}
                            onChange={(e) => handlePositionChange(driver.driver_id, Number(e.target.value))}
                          >
                            <option value="">-</option>
                            {[...Array(20)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>P{i + 1}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {predictions.length >= 10 && (
                    <Button onClick={handleSubmit} className="w-full mt-6">
                      <Trophy className="h-4 w-4 mr-2" />
                      Submit Predictions
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* AI Prediction Tab */}
        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Prediction
              </CardTitle>
              <CardDescription>
                See what our AI predicts for the race
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-background"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {[currentYear, currentYear - 1].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Race</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-background"
                    value={round}
                    onChange={(e) => setRound(Number(e.target.value))}
                  >
                    {scheduleData?.races.map((r: any) => (
                      <option key={r.round} value={r.round}>
                        Round {r.round}: {r.raceName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleLoadAI} disabled={aiLoading} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Prediction
              </Button>
            </CardContent>
          </Card>

          {aiPrediction && (
            <Card>
              <CardHeader>
                <CardTitle>AI Prediction Results</CardTitle>
                <CardDescription>
                  Confidence: <span className="font-bold capitalize">{aiPrediction.confidence}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {aiPrediction.predictions.map((pred: any) => (
                    <div key={pred.driver_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                          pred.predicted_position === 1 ? 'bg-yellow-500 text-white' :
                          pred.predicted_position === 2 ? 'bg-gray-400 text-white' :
                          pred.predicted_position === 3 ? 'bg-orange-600 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {pred.predicted_position}
                        </div>
                        <div>
                          <p className="font-semibold">{pred.name}</p>
                          <p className="text-sm">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getTeamColor(pred.team || "")}`}>
                              {pred.team || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        {pred.qualifying_position && (
                          <p className="text-muted-foreground">Quali: P{pred.qualifying_position}</p>
                        )}
                        <p className="text-muted-foreground">Championship: P{pred.championship_position}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleUseAIPrediction} variant="outline" className="w-full">
                  Use This as My Prediction
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-6">
          {rulesData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Scoring Rules
                </CardTitle>
                <CardDescription>{rulesData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Prediction Scoring */}
                  <div>
                    <h3 className="font-bold mb-3">Position Accuracy Points</h3>
                    <div className="space-y-2">
                      {Object.entries(rulesData.prediction_scoring).map(([key, value]: any) => (
                        <div key={key} className="flex justify-between p-2 rounded border">
                          <span className="capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-bold">{value} points</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonus Points */}
                  <div>
                    <h3 className="font-bold mb-3">Bonus Points</h3>
                    <div className="space-y-2">
                      {Object.entries(rulesData.bonus_points).map(([key, value]: any) => (
                        <div key={key} className="flex justify-between p-2 rounded border">
                          <span className="capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-bold">+{value} points</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

