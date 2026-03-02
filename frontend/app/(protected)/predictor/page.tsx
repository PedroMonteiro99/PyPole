"use client";

import { PositionBadge } from "@/components/PositionBadge";
import { TeamBadge } from "@/components/TeamBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Award, Brain, Target, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";

export default function PredictorPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [round, setRound] = useState<number>(1);
  const [predictions, setPredictions] = useState<any[]>([]);

  // Get race schedule
  const { data: scheduleData } = useQuery({
    queryKey: ["schedule", year],
    queryFn: async () => {
      const response = await api.get(`/jolpica/schedule?season=${year}`);
      return response.data;
    },
  });

  // Get prediction template
  const {
    data: templateData,
    isLoading: templateLoading,
    refetch: refetchTemplate,
  } = useQuery({
    queryKey: ["predictor-template", year, round],
    queryFn: async () => {
      const response = await api.get(`/predictor/template/${year}/${round}`);
      return response.data;
    },
    enabled: false,
  });

  // Get AI prediction
  const {
    data: aiPrediction,
    isLoading: aiLoading,
    refetch: refetchAI,
  } = useQuery({
    queryKey: ["ai-prediction", year, round],
    queryFn: async () => {
      const response = await api.get(
        `/predictor/ai-prediction/${year}/${round}`,
      );
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
    setPredictions([]);
  };

  const handleLoadAI = () => {
    refetchAI();
  };

  const handleUseAIPrediction = () => {
    if (aiPrediction?.predictions) {
      const newPredictions = aiPrediction.predictions.map((p: any) => ({
        driver_id: p.driver_id,
        predicted_position: p.predicted_position,
      }));
      setPredictions(newPredictions);
    }
  };

  const handlePositionChange = (driverId: string, position: number) => {
    setPredictions((prev) => {
      const existing = prev.find((p) => p.driver_id === driverId);
      if (existing) {
        return prev.map((p) =>
          p.driver_id === driverId ? { ...p, predicted_position: position } : p,
        );
      } else {
        return [...prev, { driver_id: driverId, predicted_position: position }];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/predictor/score/${year}/${round}`, predictions);
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
              <CardDescription>
                Choose a race to make your predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="predict-year">Year</Label>
                  <Select
                    value={String(year)}
                    onValueChange={(v) => setYear(Number(v))}
                  >
                    <SelectTrigger id="predict-year">
                      <SelectValue placeholder="Select year..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear, currentYear - 1].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="predict-race">Race</Label>
                  <Select
                    value={String(round)}
                    onValueChange={(v) => setRound(Number(v))}
                  >
                    <SelectTrigger id="predict-race">
                      <SelectValue placeholder="Select race..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleData?.races.map((r: any) => (
                        <SelectItem key={r.round} value={String(r.round)}>
                          Round {r.round}: {r.raceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleLoadTemplate}
                disabled={templateLoading}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Load Race Template
              </Button>
            </CardContent>
          </Card>

          {/* Prediction Form */}
          {templateData && (
            <Card>
              <CardHeader>
                <CardTitle>{templateData.race.raceName}</CardTitle>
                <CardDescription>
                  {templateData.race.Circuit.circuitName} •
                  {templateData.race.Circuit.Location.locality},{" "}
                  {templateData.race.Circuit.Location.country}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag or select positions for each driver:
                  </p>
                  {templateData.drivers.map((driver: any) => (
                    <div
                      key={driver.driver_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <PositionBadge
                          position={driver.qualifying_position || 0}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold">{driver.name}</p>
                          <TeamBadge teamName={driver.team || ""} size="xs" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {driver.qualifying_position && (
                          <span className="text-sm text-muted-foreground">
                            Q: P{driver.qualifying_position}
                          </span>
                        )}
                        <Select
                          value={String(
                            predictions.find(
                              (p) => p.driver_id === driver.driver_id,
                            )?.predicted_position || "",
                          )}
                          onValueChange={(v) =>
                            handlePositionChange(driver.driver_id, Number(v))
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(
                              (pos) => (
                                <SelectItem key={pos} value={String(pos)}>
                                  P{pos}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
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
                  <Label htmlFor="ai-year">Year</Label>
                  <Select
                    value={String(year)}
                    onValueChange={(v) => setYear(Number(v))}
                  >
                    <SelectTrigger id="ai-year">
                      <SelectValue placeholder="Select year..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear, currentYear - 1].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-race">Race</Label>
                  <Select
                    value={String(round)}
                    onValueChange={(v) => setRound(Number(v))}
                  >
                    <SelectTrigger id="ai-race">
                      <SelectValue placeholder="Select race..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleData?.races.map((r: any) => (
                        <SelectItem key={r.round} value={String(r.round)}>
                          Round {r.round}: {r.raceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleLoadAI}
                disabled={aiLoading}
                className="w-full"
              >
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
                  Confidence:{" "}
                  <span className="font-bold capitalize">
                    {aiPrediction.confidence}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {aiPrediction.predictions.map((pred: any) => (
                    <div
                      key={pred.driver_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <PositionBadge
                          position={pred.predicted_position}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold">{pred.name}</p>
                          <TeamBadge teamName={pred.team || ""} size="xs" />
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        {pred.qualifying_position && (
                          <p className="text-muted-foreground">
                            Quali: P{pred.qualifying_position}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          Championship: P{pred.championship_position}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUseAIPrediction}
                  variant="outline"
                  className="w-full"
                >
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
                      {Object.entries(rulesData.prediction_scoring).map(
                        ([key, value]: any) => (
                          <div
                            key={key}
                            className="flex justify-between p-2 rounded border"
                          >
                            <span className="capitalize">
                              {key.replaceAll("_", " ")}
                            </span>
                            <span className="font-bold">{value} points</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Bonus Points */}
                  <div>
                    <h3 className="font-bold mb-3">Bonus Points</h3>
                    <div className="space-y-2">
                      {Object.entries(rulesData.bonus_points).map(
                        ([key, value]: any) => (
                          <div
                            key={key}
                            className="flex justify-between p-2 rounded border"
                          >
                            <span className="capitalize">
                              {key.replaceAll("_", " ")}
                            </span>
                            <span className="font-bold">+{value} points</span>
                          </div>
                        ),
                      )}
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
