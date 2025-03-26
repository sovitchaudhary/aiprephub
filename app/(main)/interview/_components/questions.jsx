"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react"; // Importing icons
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);

  const { loading: generatingQuiz, fn: generateQuizFn, data: quizData } = useFetch(generateQuiz);
  const { loading: savingResult, fn: saveQuizResultFn, data: resultData, setData: setResultData } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(""));
    }
  }, [quizData]);

  const handleAnswer = (e) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer.trim().toLowerCase() === quizData[index].correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("Captured Image:", imageSrc);
      toast.success("Image captured!");
    }
  };

  // Speech Recognition Logic
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setRecording(true);
      toast.info("Recording started...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = transcript;
      setAnswers(newAnswers);
      toast.success("Voice recognized!");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setRecording(false);
      toast.info("Recording stopped.");
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Are you ready to test your knowledge with your own answer?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
          This Questions includes 10 industry-specific questions to test your skills.
          You can answer by typing or using voice input.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start 
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>

        {/* Text Input for Answer */}
        <Label htmlFor="answer">Your Answer:</Label>
        <Input
          id="answer"
          type="text"
          value={answers[currentQuestion] || ""}
          onChange={handleAnswer}
          placeholder="Type or use voice input..."
          className="w-full p-2 border rounded-lg"
        />

        {/* Audio-to-Text & Webcam Buttons with Icons */}
        <div className="mt-2 flex gap-4">
          <Button onClick={recording ? stopRecording : startRecording} variant="outline">
            {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button onClick={() => setWebcamEnabled((prev) => !prev)} variant="outline">
            {webcamEnabled ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          </Button>
        </div>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        {/* Webcam Section */}
        {webcamEnabled && (
          <div className="mt-4">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-64 rounded-lg" />
            <Button onClick={captureImage} className="mt-2">
              Capture Image
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => setShowExplanation(true)} variant="outline" disabled={!answers[currentQuestion]}>
          Show Explanation
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentQuestion] || savingResult} className="ml-auto">
          {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish"}
        </Button>
      </CardFooter>
    </Card>
  );
}
